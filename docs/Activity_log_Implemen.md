# Activity Log (Audit Trail Viewer) — Implementasi Lengkap
## Si-Kancil v3.0 | Backend NestJS + Frontend React

---

## RINGKASAN

Modul ini menampilkan **seluruh aktivitas user** di sistem secara real-time dengan filter, pagination, dan export. Mencakup semua jenis aksi: LOGIN, LOGOUT, CREATE, UPDATE, DELETE, APPROVE, REJECT, dan aksi gagal (UNAUTHORIZED, FAILED).

---

## BAGIAN 1: BACKEND (NestJS)

### 1.1 Database Schema — TypeORM Entity

```typescript
// src/modules/audit/entities/audit-log.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
} from 'typeorm';

export enum AuditAction {
  // Auth
  LOGIN           = 'LOGIN',
  LOGOUT          = 'LOGOUT',
  LOGIN_FAILED    = 'LOGIN_FAILED',
  TOKEN_REFRESH   = 'TOKEN_REFRESH',

  // CRUD
  CREATE          = 'CREATE',
  UPDATE          = 'UPDATE',
  DELETE          = 'DELETE',
  VIEW            = 'VIEW',
  EXPORT          = 'EXPORT',

  // Workflow BLUD
  APPROVE         = 'APPROVE',
  REJECT          = 'REJECT',
  SUBMIT          = 'SUBMIT',
  REVISE          = 'REVISE',
  CANCEL          = 'CANCEL',
  VERIFY          = 'VERIFY',

  // Security
  UNAUTHORIZED    = 'UNAUTHORIZED',
  FORBIDDEN       = 'FORBIDDEN',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  LOCK_ACCOUNT    = 'LOCK_ACCOUNT',
}

export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILED  = 'FAILED',
}

export enum AuditEntityType {
  // Auth
  SESSION   = 'SESSION',
  USER      = 'USER',

  // Keuangan
  SPP       = 'SPP',
  SPM       = 'SPM',
  SP2D      = 'SP2D',
  KWI       = 'KWI',         // Kuitansi/Voucher
  JURNAL    = 'JURNAL',
  BKU       = 'BKU',
  SPJ       = 'SPJ',

  // Anggaran
  RBA       = 'RBA',
  RAK       = 'RAK',
  DPA       = 'DPA',

  // Master Data
  PEGAWAI   = 'PEGAWAI',
  SUPPLIER  = 'SUPPLIER',
  COA       = 'COA',
  UNIT_KERJA = 'UNIT_KERJA',
  PAJAK     = 'PAJAK',

  // Laporan
  LAPORAN   = 'LAPORAN',
  SYSTEM    = 'SYSTEM',
}

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['entityType', 'entityId'])
@Index(['action', 'timestamp'])
@Index(['timestamp']) // for time-range queries
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- WHO ---
  @Column({ nullable: true })
  @Index()
  userId: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userNip: string;          // NIP pegawai

  @Column({ nullable: true })
  userRole: string;

  @Column({ nullable: true })
  unitKerja: string;

  // --- WHAT ---
  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditEntityType, nullable: true })
  entityType: AuditEntityType;

  @Column({ nullable: true })
  entityId: string;

  @Column({ nullable: true })
  entityLabel: string;      // Human-readable: "SPP-2024-001"

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  changedFields: string[];  // ['status', 'jumlah'] — field apa yang berubah

  @Column({ nullable: true })
  reason: string;           // Alasan reject/revisi/koreksi

  // --- STATUS ---
  @Column({ type: 'enum', enum: AuditStatus, default: AuditStatus.SUCCESS })
  status: AuditStatus;

  @Column({ nullable: true })
  errorMessage: string;     // Jika status FAILED

  // --- WHERE ---
  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  browserName: string;      // Parsed dari userAgent

  @Column({ nullable: true })
  osName: string;           // Parsed dari userAgent

  // --- WHEN ---
  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  @Index()
  timestamp: Date;

  // --- INTEGRITY ---
  @Column({ type: 'text' })
  hash: string;

  @Column({ type: 'text', nullable: true })
  prevHash: string;
}
```

### 1.2 Migration SQL

```sql
-- Buat tabel audit_logs (append-only)
CREATE TABLE audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      VARCHAR(36),
  user_name    VARCHAR(255),
  user_nip     VARCHAR(50),
  user_role    VARCHAR(100),
  unit_kerja   VARCHAR(255),
  action       VARCHAR(50) NOT NULL,
  entity_type  VARCHAR(50),
  entity_id    VARCHAR(36),
  entity_label VARCHAR(255),
  old_value    JSONB,
  new_value    JSONB,
  changed_fields JSONB,
  reason       TEXT,
  status       VARCHAR(10) DEFAULT 'SUCCESS',
  error_message TEXT,
  ip_address   VARCHAR(45),
  user_agent   TEXT,
  browser_name VARCHAR(100),
  os_name      VARCHAR(100),
  timestamp    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  hash         TEXT NOT NULL,
  prev_hash    TEXT
);

-- Indeks untuk performa query filter
CREATE INDEX idx_audit_user_time    ON audit_logs(user_id, timestamp DESC);
CREATE INDEX idx_audit_action_time  ON audit_logs(action, timestamp DESC);
CREATE INDEX idx_audit_entity       ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp    ON audit_logs(timestamp DESC);

-- PENTING: Trigger immutable — cegah UPDATE/DELETE
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs adalah immutable — tidak bisa diubah atau dihapus';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_update_audit
  BEFORE UPDATE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER trg_prevent_delete_audit
  BEFORE DELETE ON audit_logs
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- Partisi per tahun (untuk performa jangka panjang)
-- Implementasi partisi bisa ditambah saat data > 1 juta baris
```

### 1.3 DTOs

```typescript
// src/modules/audit/dto/query-audit-log.dto.ts

import { IsOptional, IsEnum, IsDateString, IsUUID, IsInt, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction, AuditEntityType, AuditStatus } from '../entities/audit-log.entity';

export class QueryAuditLogDto {
  @ApiPropertyOptional({ description: 'Filter by User ID' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: AuditAction, isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(AuditAction, { each: true })
  actions?: AuditAction[];

  @ApiPropertyOptional({ enum: AuditEntityType, isArray: true })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsEnum(AuditEntityType, { each: true })
  entityTypes?: AuditEntityType[];

  @ApiPropertyOptional({ enum: AuditStatus })
  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @ApiPropertyOptional({ description: 'Tanggal mulai (ISO8601)', example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'Tanggal selesai (ISO8601)', example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ description: 'Cari berdasar nama user / entity label' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'IP Address filter' })
  @IsOptional()
  ipAddress?: string;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 10, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(200)
  limit?: number = 50;
}
```

### 1.4 Service

```typescript
// src/modules/audit/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { createHash } from 'crypto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditLog, AuditAction, AuditStatus } from './entities/audit-log.entity';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

export interface LogParams {
  userId?: string;
  userName?: string;
  userNip?: string;
  userRole?: string;
  unitKerja?: string;
  action: AuditAction;
  entityType?: any;
  entityId?: string;
  entityLabel?: string;
  oldValue?: any;
  newValue?: any;
  changedFields?: string[];
  reason?: string;
  status?: AuditStatus;
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
  async log(params: LogParams): Promise<void> {
    try {
      // Gunakan queue agar tidak blocking request utama
      await this.auditQueue.add('write-log', params, {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: { type: 'exponential', delay: 1000 },
      });
    } catch (err) {
      // Jika queue gagal, tulis langsung (fallback)
      this.logger.error('Audit queue failed, writing directly', err);
      await this.writeLog(params);
    }
  }

  // Dipanggil oleh BullMQ worker
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

    // Parse browser/OS dari userAgent
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

  // Timeline per dokumen (untuk embedded di halaman detail)
  async getTimeline(entityType: string, entityId: string) {
    return this.auditRepo.find({
      where: { entityType: entityType as any, entityId },
      order: { timestamp: 'ASC' },
    });
  }

  // Statistik untuk summary cards
  async getSummaryStats(dateFrom?: string, dateTo?: string) {
    const qb = this.auditRepo.createQueryBuilder('al');

    if (dateFrom) qb.andWhere('al.timestamp >= :dateFrom', { dateFrom });
    if (dateTo)   qb.andWhere('al.timestamp <= :dateTo',   { dateTo: dateTo + 'T23:59:59' });

    const [
      totalActivities,
      failedActivities,
      uniqueUsers,
      todayActivities,
    ] = await Promise.all([
      qb.getCount(),
      qb.clone().andWhere('al.status = :s', { s: 'FAILED' }).getCount(),
      qb.clone().select('COUNT(DISTINCT al.userId)', 'count').getRawOne(),
      this.auditRepo.createQueryBuilder('al')
        .andWhere('al.timestamp >= :today', { today: new Date().toISOString().split('T')[0] })
        .getCount(),
    ]);

    // Breakdown per action
    const actionBreakdown = await this.auditRepo
      .createQueryBuilder('al')
      .select('al.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('al.action')
      .getRawMany();

    return {
      totalActivities,
      failedActivities,
      uniqueUsers: parseInt(uniqueUsers?.count ?? '0'),
      todayActivities,
      actionBreakdown,
    };
  }

  // ============================================================
  // PRIVATE HELPERS
  // ============================================================
  private buildQuery(filters: Partial<QueryAuditLogDto>): SelectQueryBuilder<AuditLog> {
    const qb = this.auditRepo.createQueryBuilder('al');

    if (filters.userId)      qb.andWhere('al.userId = :userId',          { userId: filters.userId });
    if (filters.status)      qb.andWhere('al.status = :status',          { status: filters.status });
    if (filters.ipAddress)   qb.andWhere('al.ipAddress = :ip',           { ip: filters.ipAddress });
    if (filters.dateFrom)    qb.andWhere('al.timestamp >= :dateFrom',    { dateFrom: filters.dateFrom });
    if (filters.dateTo)      qb.andWhere('al.timestamp <= :dateTo',      { dateTo: filters.dateTo + 'T23:59:59' });

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

    if (ua.includes('Chrome'))  browserName = 'Chrome';
    else if (ua.includes('Firefox')) browserName = 'Firefox';
    else if (ua.includes('Safari'))  browserName = 'Safari';
    else if (ua.includes('Edge'))    browserName = 'Edge';

    if (ua.includes('Windows'))      osName = 'Windows';
    else if (ua.includes('Mac'))     osName = 'macOS';
    else if (ua.includes('Linux'))   osName = 'Linux';
    else if (ua.includes('Android')) osName = 'Android';
    else if (ua.includes('iOS'))     osName = 'iOS';

    return { browserName, osName };
  }
}
```

### 1.5 BullMQ Worker

```typescript
// src/modules/audit/audit.processor.ts

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AuditService } from './audit.service';

@Processor('audit-queue')
export class AuditProcessor extends WorkerHost {
  constructor(private readonly auditService: AuditService) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    await this.auditService.writeLog(job.data);
  }
}
```

### 1.6 Controller

```typescript
// src/modules/audit/audit.controller.ts

import {
  Controller, Get, Param, Query,
  UseGuards, Roles, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuditService } from './audit.service';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

@ApiTags('Audit Log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  // Hanya Admin Sistem & SPI/Internal Auditor
  @Get('logs')
  @Roles('ADMIN', 'AUDITOR_INTERNAL', 'KEPALA_KEUANGAN')
  @ApiOperation({ summary: 'Daftar semua aktivitas user di sistem' })
  findAll(@Query() query: QueryAuditLogDto) {
    return this.auditService.findAll(query);
  }

  @Get('logs/:id')
  @Roles('ADMIN', 'AUDITOR_INTERNAL')
  @ApiOperation({ summary: 'Detail satu log aktivitas' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.auditService.findOne(id);
  }

  @Get('timeline/:entityType/:entityId')
  @Roles('ADMIN', 'AUDITOR_INTERNAL', 'KEPALA_KEUANGAN', 'BENDAHARA')
  @ApiOperation({ summary: 'Timeline aktivitas per dokumen' })
  getTimeline(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getTimeline(entityType, entityId);
  }

  @Get('stats')
  @Roles('ADMIN', 'AUDITOR_INTERNAL', 'KEPALA_KEUANGAN')
  @ApiOperation({ summary: 'Statistik ringkasan aktivitas' })
  getStats(
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.auditService.getSummaryStats(dateFrom, dateTo);
  }
}
```

### 1.7 Interceptor — Auto-log semua request

```typescript
// src/common/interceptors/audit.interceptor.ts
// Interceptor ini otomatis log setiap request yang masuk

import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../../modules/audit/audit.service';
import { AuditAction, AuditStatus } from '../../modules/audit/entities/audit-log.entity';

const METHOD_ACTION_MAP: Record<string, AuditAction> = {
  POST:   AuditAction.CREATE,
  PUT:    AuditAction.UPDATE,
  PATCH:  AuditAction.UPDATE,
  DELETE: AuditAction.DELETE,
};

const PATH_ACTION_OVERRIDE: Record<string, AuditAction> = {
  '/approve':  AuditAction.APPROVE,
  '/reject':   AuditAction.REJECT,
  '/submit':   AuditAction.SUBMIT,
  '/verify':   AuditAction.VERIFY,
  '/cancel':   AuditAction.CANCEL,
  '/export':   AuditAction.EXPORT,
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req     = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = req;

    // Skip: GET request (terlalu banyak, log manual jika VIEW diperlukan)
    // Skip: audit endpoint itu sendiri
    if (method === 'GET' || url.includes('/api/audit')) {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        const action   = this.resolveAction(method, url);
        const entityId = responseBody?.id ?? req.params?.id;
        const duration = Date.now() - startTime;

        this.auditService.log({
          userId:      user?.id,
          userName:    user?.name,
          userNip:     user?.nip,
          userRole:    user?.role,
          unitKerja:   user?.unitKerja,
          action,
          entityType:  this.resolveEntityType(url),
          entityId,
          entityLabel: responseBody?.nomorDokumen ?? responseBody?.nama,
          newValue:    this.sanitize(responseBody),
          status:      AuditStatus.SUCCESS,
          ipAddress:   ip,
          userAgent:   headers['user-agent'],
        }).catch(err => this.logger.error('Audit log failed', err));
      }),
      catchError((error) => {
        const action = this.resolveAction(method, url);
        const status = error?.status === 403 ? AuditStatus.FAILED : AuditStatus.FAILED;
        const auditAction = error?.status === 403
          ? AuditAction.FORBIDDEN
          : error?.status === 401
            ? AuditAction.UNAUTHORIZED
            : action;

        this.auditService.log({
          userId:       user?.id,
          userName:     user?.name,
          userNip:      user?.nip,
          userRole:     user?.role,
          action:       auditAction,
          entityType:   this.resolveEntityType(url),
          status:       AuditStatus.FAILED,
          errorMessage: error?.message,
          ipAddress:    ip,
          userAgent:    headers['user-agent'],
        }).catch(err => this.logger.error('Audit log error failed', err));

        return throwError(() => error);
      }),
    );
  }

  private resolveAction(method: string, url: string): AuditAction {
    // Cek path override dulu
    for (const [path, action] of Object.entries(PATH_ACTION_OVERRIDE)) {
      if (url.includes(path)) return action;
    }
    return METHOD_ACTION_MAP[method] ?? AuditAction.VIEW;
  }

  private resolveEntityType(url: string): any {
    if (url.includes('/spp'))        return 'SPP';
    if (url.includes('/spm'))        return 'SPM';
    if (url.includes('/sp2d'))       return 'SP2D';
    if (url.includes('/jurnal'))     return 'JURNAL';
    if (url.includes('/bku'))        return 'BKU';
    if (url.includes('/spj'))        return 'SPJ';
    if (url.includes('/rba'))        return 'RBA';
    if (url.includes('/rak'))        return 'RAK';
    if (url.includes('/pegawai'))    return 'PEGAWAI';
    if (url.includes('/supplier'))   return 'SUPPLIER';
    if (url.includes('/laporan'))    return 'LAPORAN';
    if (url.includes('/users'))      return 'USER';
    return 'SYSTEM';
  }

  private sanitize(obj: any): any {
    if (!obj) return obj;
    // Hapus field sensitif sebelum di-log
    const { password, token, hash, ...safe } = obj;
    return safe;
  }
}
```

### 1.8 Module

```typescript
// src/modules/audit/audit.module.ts

import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { AuditLog } from './entities/audit-log.entity';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditProcessor } from './audit.processor';

@Global() // Global agar AuditService bisa di-inject di mana saja
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    BullModule.registerQueue({ name: 'audit-queue' }),
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditProcessor],
  exports: [AuditService],
})
export class AuditModule {}
```

### 1.9 Daftarkan Interceptor Global di main.ts

```typescript
// src/main.ts (tambahkan ini)

import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { AuditService } from './modules/audit/audit.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // ... config lainnya ...

  // Daftarkan audit interceptor secara global
  const auditService = app.get(AuditService);
  app.useGlobalInterceptors(new AuditInterceptor(auditService));

  await app.listen(3000);
}
bootstrap();
```

---

## BAGIAN 2: FRONTEND (React + TypeScript)

### 2.1 Types

```typescript
// src/types/audit.types.ts

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'TOKEN_REFRESH'
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT'
  | 'APPROVE' | 'REJECT' | 'SUBMIT' | 'REVISE' | 'CANCEL' | 'VERIFY'
  | 'UNAUTHORIZED' | 'FORBIDDEN' | 'PASSWORD_CHANGE' | 'LOCK_ACCOUNT';

export type AuditStatus = 'SUCCESS' | 'FAILED';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  userRole: string;
  unitKerja: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityLabel: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changedFields?: string[];
  reason?: string;
  status: AuditStatus;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
  browserName: string;
  osName: string;
  timestamp: string;
}

export interface AuditLogMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AuditLogResponse {
  data: AuditLog[];
  meta: AuditLogMeta;
}

export interface AuditStats {
  totalActivities: number;
  failedActivities: number;
  uniqueUsers: number;
  todayActivities: number;
  actionBreakdown: { action: AuditAction; count: number }[];
}

export interface AuditFilter {
  userId?: string;
  actions?: AuditAction[];
  entityTypes?: string[];
  status?: AuditStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

### 2.2 API Service

```typescript
// src/services/audit.service.ts

import { apiClient } from './api-client';
import { AuditFilter, AuditLog, AuditLogResponse, AuditStats } from '../types/audit.types';

export const auditApi = {
  getLogs: (filter: AuditFilter): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        if (Array.isArray(v)) v.forEach(item => params.append(k, item));
        else params.set(k, String(v));
      }
    });
    return apiClient.get(`/api/audit/logs?${params}`).then(r => r.data);
  },

  getOne: (id: string): Promise<AuditLog> =>
    apiClient.get(`/api/audit/logs/${id}`).then(r => r.data),

  getTimeline: (entityType: string, entityId: string): Promise<AuditLog[]> =>
    apiClient.get(`/api/audit/timeline/${entityType}/${entityId}`).then(r => r.data),

  getStats: (dateFrom?: string, dateTo?: string): Promise<AuditStats> => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo)   params.set('dateTo', dateTo);
    return apiClient.get(`/api/audit/stats?${params}`).then(r => r.data);
  },
};
```

### 2.3 React Query Hooks

```typescript
// src/hooks/useAuditLog.ts

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditApi } from '../services/audit.service';
import { AuditFilter } from '../types/audit.types';

export const useAuditLogs = (filter: AuditFilter) =>
  useQuery({
    queryKey: ['audit-logs', filter],
    queryFn: () => auditApi.getLogs(filter),
    placeholderData: keepPreviousData,
    staleTime: 30_000, // 30 detik
  });

export const useAuditStats = (dateFrom?: string, dateTo?: string) =>
  useQuery({
    queryKey: ['audit-stats', dateFrom, dateTo],
    queryFn: () => auditApi.getStats(dateFrom, dateTo),
    staleTime: 60_000,
  });

export const useAuditTimeline = (entityType: string, entityId: string) =>
  useQuery({
    queryKey: ['audit-timeline', entityType, entityId],
    queryFn: () => auditApi.getTimeline(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
```

### 2.4 Helper Utilities

```typescript
// src/utils/audit.utils.ts

import { AuditAction, AuditStatus } from '../types/audit.types';

export const ACTION_CONFIG: Record<AuditAction, {
  label: string;
  color: string;       // Tailwind bg class
  textColor: string;   // Tailwind text class
  icon: string;        // emoji / icon name
  group: 'auth' | 'crud' | 'workflow' | 'security';
}> = {
  LOGIN:           { label: 'Login',           color: 'bg-emerald-100', textColor: 'text-emerald-700', icon: '🔐', group: 'auth' },
  LOGOUT:          { label: 'Logout',          color: 'bg-slate-100',   textColor: 'text-slate-600',   icon: '🚪', group: 'auth' },
  LOGIN_FAILED:    { label: 'Login Gagal',     color: 'bg-red-100',     textColor: 'text-red-700',     icon: '❌', group: 'auth' },
  TOKEN_REFRESH:   { label: 'Refresh Token',   color: 'bg-blue-100',    textColor: 'text-blue-600',    icon: '🔄', group: 'auth' },
  CREATE:          { label: 'Dibuat',          color: 'bg-green-100',   textColor: 'text-green-700',   icon: '➕', group: 'crud' },
  UPDATE:          { label: 'Diubah',          color: 'bg-amber-100',   textColor: 'text-amber-700',   icon: '✏️', group: 'crud' },
  DELETE:          { label: 'Dihapus',         color: 'bg-red-100',     textColor: 'text-red-700',     icon: '🗑️', group: 'crud' },
  VIEW:            { label: 'Dilihat',         color: 'bg-gray-100',    textColor: 'text-gray-600',    icon: '👁️', group: 'crud' },
  EXPORT:          { label: 'Diekspor',        color: 'bg-indigo-100',  textColor: 'text-indigo-700',  icon: '📤', group: 'crud' },
  APPROVE:         { label: 'Disetujui',       color: 'bg-emerald-100', textColor: 'text-emerald-700', icon: '✅', group: 'workflow' },
  REJECT:          { label: 'Ditolak',         color: 'bg-red-100',     textColor: 'text-red-700',     icon: '🚫', group: 'workflow' },
  SUBMIT:          { label: 'Diajukan',        color: 'bg-blue-100',    textColor: 'text-blue-700',    icon: '📨', group: 'workflow' },
  REVISE:          { label: 'Direvisi',        color: 'bg-orange-100',  textColor: 'text-orange-700',  icon: '🔁', group: 'workflow' },
  CANCEL:          { label: 'Dibatalkan',      color: 'bg-gray-100',    textColor: 'text-gray-700',    icon: '⛔', group: 'workflow' },
  VERIFY:          { label: 'Diverifikasi',    color: 'bg-teal-100',    textColor: 'text-teal-700',    icon: '🔍', group: 'workflow' },
  UNAUTHORIZED:    { label: 'Tidak Terotorisasi', color: 'bg-red-100',  textColor: 'text-red-700',     icon: '🔒', group: 'security' },
  FORBIDDEN:       { label: 'Akses Ditolak',   color: 'bg-red-100',     textColor: 'text-red-800',     icon: '⛔', group: 'security' },
  PASSWORD_CHANGE: { label: 'Ganti Password',  color: 'bg-purple-100',  textColor: 'text-purple-700',  icon: '🔑', group: 'security' },
  LOCK_ACCOUNT:    { label: 'Akun Dikunci',    color: 'bg-red-100',     textColor: 'text-red-900',     icon: '🔒', group: 'security' },
};

export const ENTITY_LABELS: Record<string, string> = {
  SESSION:    'Sesi',
  USER:       'Pengguna',
  SPP:        'SPP',
  SPM:        'SPM',
  SP2D:       'SP2D',
  KWI:        'Kuitansi',
  JURNAL:     'Jurnal',
  BKU:        'BKU',
  SPJ:        'SPJ',
  RBA:        'RBA',
  RAK:        'RAK',
  DPA:        'DPA',
  PEGAWAI:    'Pegawai',
  SUPPLIER:   'Supplier',
  COA:        'Akun',
  UNIT_KERJA: 'Unit Kerja',
  PAJAK:      'Pajak',
  LAPORAN:    'Laporan',
  SYSTEM:     'Sistem',
};

export const formatTimestamp = (ts: string): string => {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Makassar',   // WITA untuk Balikpapan
  }).format(new Date(ts));
};

export const timeAgo = (ts: string): string => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);

  if (mins < 1)    return 'Baru saja';
  if (mins < 60)   return `${mins} menit lalu`;
  if (hours < 24)  return `${hours} jam lalu`;
  if (days < 7)    return `${days} hari lalu`;
  return formatTimestamp(ts).split(',')[0];
};
```

### 2.5 Halaman Utama Activity Log

```tsx
// src/pages/audit/ActivityLogPage.tsx

import React, { useState, useCallback } from 'react';
import {
  Search, Filter, Download, RefreshCw,
  Shield, AlertTriangle, Users, Activity, Clock,
  ChevronLeft, ChevronRight, Eye, X,
} from 'lucide-react';
import { useAuditLogs, useAuditStats } from '../../hooks/useAuditLog';
import { AuditFilter, AuditLog } from '../../types/audit.types';
import { ACTION_CONFIG, ENTITY_LABELS, formatTimestamp, timeAgo } from '../../utils/audit.utils';
import { AuditDetailDrawer } from './AuditDetailDrawer';
import { AuditFilterPanel } from './AuditFilterPanel';
import { exportToExcel, exportToPdf } from '../../utils/export.utils';

const INITIAL_FILTER: AuditFilter = {
  page: 1,
  limit: 50,
};

export const ActivityLogPage: React.FC = () => {
  const [filter, setFilter]           = useState<AuditFilter>(INITIAL_FILTER);
  const [showFilter, setShowFilter]   = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [search, setSearch]           = useState('');

  const { data, isLoading, isFetching, refetch } = useAuditLogs(filter);
  const { data: stats } = useAuditStats();

  const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setFilter(f => ({ ...f, search: (e.target as HTMLInputElement).value, page: 1 }));
    }
  }, []);

  const handleFilter = useCallback((newFilter: Partial<AuditFilter>) => {
    setFilter(f => ({ ...f, ...newFilter, page: 1 }));
  }, []);

  const handlePage = (page: number) => setFilter(f => ({ ...f, page }));

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (!data?.data) return;
    if (format === 'excel') await exportToExcel(data.data);
    else await exportToPdf(data.data);
  };

  const activeFilterCount = Object.values(filter).filter(v =>
    v !== undefined && v !== '' && v !== 1 && v !== 50 &&
    !(Array.isArray(v) && v.length === 0)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Log Aktivitas</h1>
              <p className="text-sm text-slate-500">
                Riwayat seluruh aktivitas pengguna di sistem Si-Kancil
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <button
                onClick={() => {/* dropdown */}}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Ekspor
              </button>
              {/* Dropdown bisa dikembangkan */}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="w-5 h-5 text-indigo-600" />}
              bg="bg-indigo-50"
              label="Total Aktivitas"
              value={stats.totalActivities.toLocaleString('id-ID')}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-emerald-600" />}
              bg="bg-emerald-50"
              label="Hari Ini"
              value={stats.todayActivities.toLocaleString('id-ID')}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              bg="bg-blue-50"
              label="Pengguna Aktif"
              value={stats.uniqueUsers.toLocaleString('id-ID')}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
              bg="bg-red-50"
              label="Aktivitas Gagal"
              value={stats.failedActivities.toLocaleString('id-ID')}
              alert={stats.failedActivities > 0}
            />
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama pengguna, dokumen... (Enter)"
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              defaultValue={filter.search}
              onKeyDown={handleSearch}
            />
          </div>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${
              showFilter || activeFilterCount > 0
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <span className="bg-white text-indigo-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={() => setFilter(INITIAL_FILTER)}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <AuditFilterPanel filter={filter} onFilter={handleFilter} />
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Table Header Info */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm text-slate-500">
              {isLoading ? 'Memuat...' : (
                <>
                  Menampilkan <strong>{data?.data.length ?? 0}</strong> dari{' '}
                  <strong>{data?.meta.total.toLocaleString('id-ID') ?? 0}</strong> aktivitas
                </>
              )}
            </span>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Baris per halaman:</span>
              <select
                value={filter.limit}
                onChange={(e) => setFilter(f => ({ ...f, limit: Number(e.target.value), page: 1 }))}
                className="border border-slate-200 rounded px-2 py-0.5 text-sm"
              >
                {[25, 50, 100, 200].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-medium">Waktu</th>
                  <th className="px-4 py-3 text-left font-medium">Pengguna</th>
                  <th className="px-4 py-3 text-left font-medium">Aksi</th>
                  <th className="px-4 py-3 text-left font-medium">Modul / Dokumen</th>
                  <th className="px-4 py-3 text-left font-medium">IP / Browser</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-center font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data?.data.map((log) => (
                  <AuditTableRow
                    key={log.id}
                    log={log}
                    onSelect={() => setSelectedLog(log)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
              <span className="text-sm text-slate-500">
                Halaman {data.meta.page} dari {data.meta.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePage(data.meta.page - 1)}
                  disabled={!data.meta.hasPrev}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(
                    data.meta.page - 2 + i,
                    data.meta.totalPages
                  ));
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                        pageNum === data.meta.page
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePage(data.meta.page + 1)}
                  disabled={!data.meta.hasNext}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedLog && (
        <AuditDetailDrawer
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

// ============================================================
// Sub-components
// ============================================================

const StatCard: React.FC<{
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  alert?: boolean;
}> = ({ icon, bg, label, value, alert }) => (
  <div className={`bg-white rounded-xl border ${alert ? 'border-red-200' : 'border-slate-200'} p-4`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={`text-xl font-bold ${alert ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
      </div>
    </div>
  </div>
);

const AuditTableRow: React.FC<{
  log: AuditLog;
  onSelect: () => void;
}> = ({ log, onSelect }) => {
  const actionCfg = ACTION_CONFIG[log.action] ?? {
    label: log.action, color: 'bg-gray-100', textColor: 'text-gray-600', icon: '•',
  };

  return (
    <tr className="hover:bg-slate-50 transition-colors group">
      {/* Waktu */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="text-slate-900 font-mono text-xs">
          {formatTimestamp(log.timestamp).split(', ')[1]}
        </div>
        <div className="text-slate-400 text-xs mt-0.5">
          {formatTimestamp(log.timestamp).split(', ')[0]}
        </div>
        <div className="text-slate-400 text-xs italic">{timeAgo(log.timestamp)}</div>
      </td>

      {/* Pengguna */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-indigo-700">
              {log.userName?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <div className="font-medium text-slate-900 text-xs leading-tight">
              {log.userName ?? 'System'}
            </div>
            <div className="text-slate-400 text-xs">{log.userRole}</div>
          </div>
        </div>
      </td>

      {/* Aksi */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${actionCfg.color} ${actionCfg.textColor}`}>
          <span>{actionCfg.icon}</span>
          {actionCfg.label}
        </span>
      </td>

      {/* Modul / Dokumen */}
      <td className="px-4 py-3">
        {log.entityType ? (
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {ENTITY_LABELS[log.entityType] ?? log.entityType}
            </span>
            {log.entityLabel && (
              <div className="text-slate-900 text-xs mt-0.5 font-medium">{log.entityLabel}</div>
            )}
          </div>
        ) : (
          <span className="text-slate-400 text-xs">—</span>
        )}
      </td>

      {/* IP / Browser */}
      <td className="px-4 py-3">
        <div className="font-mono text-xs text-slate-600">{log.ipAddress}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {log.browserName} · {log.osName}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          log.status === 'SUCCESS'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-red-100 text-red-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            log.status === 'SUCCESS' ? 'bg-emerald-500' : 'bg-red-500'
          }`} />
          {log.status === 'SUCCESS' ? 'Berhasil' : 'Gagal'}
        </span>
      </td>

      {/* Detail */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={onSelect}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Lihat detail"
        >
          <Eye className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
};
```

### 2.6 Filter Panel Component

```tsx
// src/pages/audit/AuditFilterPanel.tsx

import React from 'react';
import { AuditFilter } from '../../types/audit.types';
import { ACTION_CONFIG, ENTITY_LABELS } from '../../utils/audit.utils';

interface Props {
  filter: AuditFilter;
  onFilter: (f: Partial<AuditFilter>) => void;
}

const ACTION_GROUPS = {
  'Autentikasi': ['LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'TOKEN_REFRESH'],
  'Data':        ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT'],
  'Workflow':    ['APPROVE', 'REJECT', 'SUBMIT', 'REVISE', 'CANCEL', 'VERIFY'],
  'Keamanan':    ['UNAUTHORIZED', 'FORBIDDEN', 'PASSWORD_CHANGE', 'LOCK_ACCOUNT'],
};

export const AuditFilterPanel: React.FC<Props> = ({ filter, onFilter }) => {
  const toggleAction = (action: string) => {
    const current = filter.actions ?? [];
    const updated = current.includes(action as any)
      ? current.filter(a => a !== action)
      : [...current, action as any];
    onFilter({ actions: updated.length ? updated : undefined });
  };

  const toggleEntity = (entity: string) => {
    const current = filter.entityTypes ?? [];
    const updated = current.includes(entity)
      ? current.filter(e => e !== entity)
      : [...current, entity];
    onFilter({ entityTypes: updated.length ? updated : undefined });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Rentang Tanggal */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Rentang Tanggal
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filter.dateFrom ?? ''}
              onChange={e => onFilter({ dateFrom: e.target.value || undefined })}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              type="date"
              value={filter.dateTo ?? ''}
              onChange={e => onFilter({ dateTo: e.target.value || undefined })}
              className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Status
          </label>
          <div className="space-y-2">
            {[undefined, 'SUCCESS', 'FAILED'].map(s => (
              <label key={s ?? 'all'} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  checked={filter.status === s}
                  onChange={() => onFilter({ status: s as any })}
                  className="text-indigo-600"
                />
                <span className="text-sm text-slate-700">
                  {s === undefined ? 'Semua' : s === 'SUCCESS' ? '✅ Berhasil' : '❌ Gagal'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Jenis Aksi */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Jenis Aksi
          </label>
          <div className="space-y-3">
            {Object.entries(ACTION_GROUPS).map(([group, actions]) => (
              <div key={group}>
                <p className="text-xs text-slate-400 mb-1">{group}</p>
                <div className="flex flex-wrap gap-1.5">
                  {actions.map(action => {
                    const cfg = ACTION_CONFIG[action as any];
                    const isActive = filter.actions?.includes(action as any);
                    return (
                      <button
                        key={action}
                        onClick={() => toggleAction(action)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                          isActive
                            ? `${cfg.color} ${cfg.textColor} border-current`
                            : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        {cfg.icon} {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modul / Entitas */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
          Modul
        </label>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ENTITY_LABELS).map(([key, label]) => {
            const isActive = filter.entityTypes?.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleEntity(key)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
```

### 2.7 Detail Drawer

```tsx
// src/pages/audit/AuditDetailDrawer.tsx

import React from 'react';
import { X, User, Clock, Monitor, FileText, AlertCircle } from 'lucide-react';
import { AuditLog } from '../../types/audit.types';
import { ACTION_CONFIG, ENTITY_LABELS, formatTimestamp } from '../../utils/audit.utils';

interface Props {
  log: AuditLog;
  onClose: () => void;
}

export const AuditDetailDrawer: React.FC<Props> = ({ log, onClose }) => {
  const actionCfg = ACTION_CONFIG[log.action] ?? { label: log.action, icon: '•', color: 'bg-gray-100', textColor: 'text-gray-600' };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-[480px] bg-white shadow-2xl overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${actionCfg.color} ${actionCfg.textColor}`}>
              {actionCfg.icon} {actionCfg.label}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Status Banner */}
          {log.status === 'FAILED' && (
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Aktivitas Gagal</p>
                <p className="text-xs text-red-600 mt-0.5">{log.errorMessage || 'Tidak ada pesan error'}</p>
              </div>
            </div>
          )}

          {/* Pengguna */}
          <Section icon={<User className="w-4 h-4" />} title="Pengguna">
            <InfoRow label="Nama"       value={log.userName || '—'} />
            <InfoRow label="NIP"        value={log.userNip || '—'} />
            <InfoRow label="Role"       value={log.userRole || '—'} />
            <InfoRow label="Unit Kerja" value={log.unitKerja || '—'} />
          </Section>

          {/* Waktu */}
          <Section icon={<Clock className="w-4 h-4" />} title="Waktu">
            <InfoRow label="Timestamp"  value={formatTimestamp(log.timestamp)} mono />
            <InfoRow label="Log ID"     value={log.id} mono small />
          </Section>

          {/* Dokumen */}
          {log.entityType && (
            <Section icon={<FileText className="w-4 h-4" />} title="Dokumen Terkait">
              <InfoRow label="Modul"    value={ENTITY_LABELS[log.entityType] ?? log.entityType} />
              <InfoRow label="Dokumen"  value={log.entityLabel || '—'} />
              <InfoRow label="Entity ID" value={log.entityId || '—'} mono small />
              {log.reason && <InfoRow label="Alasan" value={log.reason} />}
            </Section>
          )}

          {/* Perubahan */}
          {(log.oldValue || log.newValue) && (
            <Section icon={<FileText className="w-4 h-4" />} title="Perubahan Data">
              {log.changedFields && log.changedFields.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-slate-500 mb-1.5">Field yang berubah:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.changedFields.map(f => (
                      <span key={f} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {log.oldValue && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">Sebelum</p>
                    <pre className="text-xs bg-red-50 text-red-800 p-3 rounded-lg overflow-auto max-h-40 font-mono">
                      {JSON.stringify(log.oldValue, null, 2)}
                    </pre>
                  </div>
                )}
                {log.newValue && (
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1.5">Sesudah</p>
                    <pre className="text-xs bg-emerald-50 text-emerald-800 p-3 rounded-lg overflow-auto max-h-40 font-mono">
                      {JSON.stringify(log.newValue, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Teknis */}
          <Section icon={<Monitor className="w-4 h-4" />} title="Informasi Teknis">
            <InfoRow label="IP Address"  value={log.ipAddress || '—'} mono />
            <InfoRow label="Browser"     value={log.browserName || '—'} />
            <InfoRow label="Sistem Ops." value={log.osName || '—'} />
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-slate-400">{icon}</span>
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
    </div>
    <div className="bg-slate-50 rounded-xl p-4 space-y-2.5">
      {children}
    </div>
  </div>
);

const InfoRow: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}> = ({ label, value, mono, small }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-xs text-slate-500 shrink-0">{label}</span>
    <span className={`text-right break-all ${mono ? 'font-mono' : ''} ${small ? 'text-xs text-slate-500' : 'text-sm text-slate-800 font-medium'}`}>
      {value}
    </span>
  </div>
);
```

### 2.8 Timeline Component (untuk halaman detail dokumen)

```tsx
// src/components/AuditTimeline.tsx
// Gunakan ini di halaman detail SPP, SPM, BKU, dll.

import React from 'react';
import { Clock } from 'lucide-react';
import { useAuditTimeline } from '../hooks/useAuditLog';
import { ACTION_CONFIG, formatTimestamp } from '../utils/audit.utils';

interface Props {
  entityType: string;    // 'SPP'
  entityId: string;      // uuid
}

export const AuditTimeline: React.FC<Props> = ({ entityType, entityId }) => {
  const { data: logs, isLoading } = useAuditTimeline(entityType, entityId);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <p className="text-sm text-slate-400 italic text-center py-4">
        Belum ada riwayat aktivitas
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log, idx) => {
        const cfg = ACTION_CONFIG[log.action] ?? { label: log.action, icon: '•', color: 'bg-gray-100', textColor: 'text-gray-600' };
        const isLast = idx === logs.length - 1;

        return (
          <div key={log.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${cfg.color} flex-shrink-0`}>
                {cfg.icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${cfg.textColor}`}>{cfg.label}</span>
                <span className="text-slate-400 text-xs">oleh</span>
                <span className="text-sm font-medium text-slate-700">{log.userName}</span>
                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              {log.reason && (
                <p className="text-xs text-slate-500 mt-1 italic">"{log.reason}"</p>
              )}
              {log.status === 'FAILED' && log.errorMessage && (
                <p className="text-xs text-red-500 mt-1">⚠ {log.errorMessage}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
```

### 2.9 Router Setup

```tsx
// Tambahkan ke router Si-Kancil

import { ActivityLogPage } from '../pages/audit/ActivityLogPage';

// Di dalam Routes:
<Route
  path="/audit/activity-log"
  element={
    <RequireRole roles={['ADMIN', 'AUDITOR_INTERNAL', 'KEPALA_KEUANGAN']}>
      <ActivityLogPage />
    </RequireRole>
  }
/>
```

---

## BAGIAN 3: STRUKTUR FILE

```
si-kancil-backend/
└── src/
    ├── common/
    │   └── interceptors/
    │       └── audit.interceptor.ts    ← AUTO-LOG semua request
    └── modules/
        └── audit/
            ├── audit.module.ts
            ├── audit.controller.ts
            ├── audit.service.ts
            ├── audit.processor.ts      ← BullMQ worker
            ├── entities/
            │   └── audit-log.entity.ts
            └── dto/
                └── query-audit-log.dto.ts

si-kancil-frontend/
└── src/
    ├── types/
    │   └── audit.types.ts
    ├── services/
    │   └── audit.service.ts
    ├── hooks/
    │   └── useAuditLog.ts
    ├── utils/
    │   └── audit.utils.ts
    ├── components/
    │   └── AuditTimeline.tsx           ← Embedded di halaman detail
    └── pages/
        └── audit/
            ├── ActivityLogPage.tsx     ← Halaman utama
            ├── AuditFilterPanel.tsx    ← Panel filter
            └── AuditDetailDrawer.tsx   ← Slide-in detail
```

---

## BAGIAN 4: API ENDPOINTS SUMMARY

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/audit/logs` | Admin, Auditor, KaKeu | Daftar semua log dengan filter & pagination |
| GET | `/api/audit/logs/:id` | Admin, Auditor | Detail satu log |
| GET | `/api/audit/timeline/:type/:id` | Semua yang punya akses dokumen | Timeline per dokumen |
| GET | `/api/audit/stats` | Admin, Auditor, KaKeu | Statistik ringkasan |

**Query Parameters untuk `/api/audit/logs`:**
- `userId` — filter by user
- `actions[]` — LOGIN, CREATE, APPROVE, dll
- `entityTypes[]` — SPP, BKU, JURNAL, dll
- `status` — SUCCESS / FAILED
- `dateFrom` / `dateTo` — rentang tanggal
- `search` — cari nama/dokumen
- `page` / `limit` — pagination

---

## BAGIAN 5: CATATAN PENTING

### Performance
- Tabel `audit_logs` akan tumbuh sangat cepat. Pastikan **indeks sudah dibuat** (sudah ada di migration).
- Gunakan `limit` default 50, maksimum 200 per request.
- Pertimbangkan **partisi per tahun** saat data > 1 juta baris.
- Jangan query `oldValue/newValue` (JSONB) dalam kondisi WHERE — gunakan filter kolom biasa.

### Keamanan
- Endpoint ini **hanya untuk Admin/Auditor**. Jangan expose ke role Bendahara atau Staf biasa.
- Log ini **immutable** di database. Jangan tambahkan endpoint DELETE atau UPDATE.
- `oldValue` dan `newValue` tidak boleh mengandung password/token — sudah disanitasi di interceptor.

### Pengembangan Selanjutnya
- Export ke Excel/PDF (implementasi `exportToExcel` dan `exportToPdf` di `export.utils.ts`)
- Real-time update menggunakan Redis Pub/Sub + WebSocket
- Integrasi dengan Fraud Detection Dashboard (Feature 50 di masterplan)
- Scheduled report: kirim summary aktivitas harian via email ke Kepala Keuangan
```