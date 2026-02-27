import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { createHash } from 'crypto';
import { AuditLog, AuditStatus } from './entities/audit-log.entity';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

export interface LogParams {
  userId?: string;
  userName?: string;
  userNip?: string;
  userRole?: string;
  unitKerja?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  oldValue?: any;
  newValue?: any;
  changedFields?: string[];
  reason?: string;
  status?: string;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
    @InjectQueue('audit-queue')
    private readonly auditQueue: Queue,
  ) {}

  // ============================================================
  // LOG — async via BullMQ (non-blocking, tidak ganggu request)
  // ============================================================
  log(params: LogParams): void {
    // Push ke queue — tidak blocking, tidak await
    this.auditQueue
      .add('write-log', params)
      .catch(err => {
        // Fallback: jika queue gagal (Redis down), tulis langsung
        this.logger.error('Audit queue unavailable, writing directly', err?.message);
        this.writeLog(params).catch(e =>
          this.logger.error('Audit direct write also failed', e?.message),
        );
      });
  }

  // Dipanggil internal (bisa juga di-test secara terpisah)
  async writeLog(params: LogParams): Promise<AuditLog> {
    const lastLog = await this.auditRepo.findOne({
      where: {},
      order: { timestamp: 'DESC' },
      select: ['hash'],
    });

    const prevHash = lastLog?.hash ?? 'GENESIS';

    const data = JSON.stringify({
      userId:     params.userId,
      action:     params.action,
      entityType: params.entityType,
      entityId:   params.entityId,
      newValue:   params.newValue,
      timestamp:  new Date().toISOString(),
    });

    const hash = createHash('sha256').update(prevHash + data).digest('hex');

    const { browserName, osName } = this.parseUserAgent(params.userAgent);

    const log = this.auditRepo.create({
      ...params,
      browserName,
      osName,
      timestamp: new Date(),
      hash,
      prevHash,
      status: params.status ?? AuditStatus.SUCCESS,
    });

    return this.auditRepo.save(log);
  }

  // ============================================================
  // QUERY
  // ============================================================
  async findAll(query: QueryAuditLogDto) {
    const { page = 1, limit = 50, ...filters } = query;
    const qb = this.buildQuery(filters);

    const total = await qb.getCount();
    const data = await qb
      .orderBy('al.timestamp', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<AuditLog> {
    return this.auditRepo.findOneOrFail({ where: { id } });
  }

  async getTimeline(entityType: string, entityId: string) {
    return this.auditRepo.find({
      where: { entityType, entityId },
      order: { timestamp: 'ASC' },
    });
  }

  async getSummaryStats(dateFrom?: string, dateTo?: string) {
    const baseQb = this.auditRepo.createQueryBuilder('al');

    if (dateFrom) baseQb.andWhere('al.timestamp >= :dateFrom', { dateFrom });
    if (dateTo)   baseQb.andWhere('al.timestamp <= :dateTo',   { dateTo: dateTo + 'T23:59:59' });

    const [
      totalActivities,
      failedActivities,
      uniqueUsersRow,
      todayActivities,
      actionBreakdown,
    ] = await Promise.all([
      baseQb.clone().getCount(),
      baseQb.clone().andWhere('al.status = :s', { s: 'FAILED' }).getCount(),
      baseQb.clone().select('COUNT(DISTINCT al.userId)', 'count').getRawOne<{ count: string }>(),
      this.auditRepo.createQueryBuilder('al')
        .andWhere('al.timestamp >= :today', { today: new Date().toISOString().split('T')[0] })
        .getCount(),
      this.auditRepo.createQueryBuilder('al')
        .select('al.action', 'action')
        .addSelect('COUNT(*)', 'count')
        .groupBy('al.action')
        .getRawMany<{ action: string; count: string }>(),
    ]);

    return {
      totalActivities,
      failedActivities,
      uniqueUsers: parseInt(uniqueUsersRow?.count ?? '0'),
      todayActivities,
      actionBreakdown: actionBreakdown.map(r => ({
        action: r.action,
        count: parseInt(r.count),
      })),
    };
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================
  private buildQuery(filters: Partial<QueryAuditLogDto>): SelectQueryBuilder<AuditLog> {
    const qb = this.auditRepo.createQueryBuilder('al');

    if (filters.userId)    qb.andWhere('al.userId = :userId',       { userId: filters.userId });
    if (filters.status)    qb.andWhere('al.status = :status',       { status: filters.status });
    if (filters.ipAddress) qb.andWhere('al.ipAddress = :ip',        { ip: filters.ipAddress });
    if (filters.dateFrom)  qb.andWhere('al.timestamp >= :dateFrom', { dateFrom: filters.dateFrom });
    if (filters.dateTo)    qb.andWhere('al.timestamp <= :dateTo',   { dateTo: filters.dateTo + 'T23:59:59' });

    if (filters.actions?.length) {
      qb.andWhere('al.action IN (:...actions)', { actions: filters.actions });
    }
    if (filters.entityTypes?.length) {
      qb.andWhere('al.entityType IN (:...entityTypes)', { entityTypes: filters.entityTypes });
    }
    if (filters.search) {
      qb.andWhere(
        '(al.userName ILIKE :s OR al.entityLabel ILIKE :s OR al.userNip ILIKE :s)',
        { s: `%${filters.search}%` },
      );
    }

    return qb;
  }

  private parseUserAgent(ua?: string): { browserName: string; osName: string } {
    if (!ua) return { browserName: 'Unknown', osName: 'Unknown' };

    let browserName = 'Unknown';
    let osName      = 'Unknown';

    if (ua.includes('Edg'))         browserName = 'Edge';
    else if (ua.includes('Chrome')) browserName = 'Chrome';
    else if (ua.includes('Firefox')) browserName = 'Firefox';
    else if (ua.includes('Safari'))  browserName = 'Safari';

    if (ua.includes('Windows'))      osName = 'Windows';
    else if (ua.includes('Mac'))     osName = 'macOS';
    else if (ua.includes('Linux'))   osName = 'Linux';
    else if (ua.includes('Android')) osName = 'Android';
    else if (ua.includes('iOS'))     osName = 'iOS';

    return { browserName, osName };
  }
}
