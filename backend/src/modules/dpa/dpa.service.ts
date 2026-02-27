import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { DPA } from '../../database/entities/dpa.entity';
import { DPABelanja } from '../../database/entities/dpa-belanja.entity';
import { DPAPendapatan } from '../../database/entities/dpa-pendapatan.entity';
import { DPAPembiayaan } from '../../database/entities/dpa-pembiayaan.entity';
import { DPAHistory } from '../../database/entities/dpa-history.entity';
import {
  CreateDPADto,
  UpdateDPADto,
  QueryDPADto,
  GenerateDPAFromRBADto,
} from './dto';

@Injectable()
export class DPAService {
  constructor(
    @InjectRepository(DPA)
    private readonly dpaRepository: Repository<DPA>,
    @InjectRepository(DPABelanja)
    private readonly dpaBelanjaRepository: Repository<DPABelanja>,
    @InjectRepository(DPAPendapatan)
    private readonly dpaPendapatanRepository: Repository<DPAPendapatan>,
    @InjectRepository(DPAPembiayaan)
    private readonly dpaPembiayaanRepository: Repository<DPAPembiayaan>,
    @InjectRepository(DPAHistory)
    private readonly dpaHistoryRepository: Repository<DPAHistory>,
  ) {}

  /**
   * Find all DPA with pagination and filters
   */
  async findAll(query: QueryDPADto) {
    const {
      page = 1,
      limit = 10,
      search,
      jenisDokumen,
      status,
      tahun,
      tahunAnggaran,
    } = query;

    const qb = this.dpaRepository.createQueryBuilder('dpa');

    // Filters
    if (search) {
      qb.where('dpa.nomorDPA LIKE :search OR dpa.nomorSK LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (jenisDokumen) {
      qb.andWhere('dpa.jenisDokumen = :jenisDokumen', { jenisDokumen });
    }

    if (status) {
      qb.andWhere('dpa.status = :status', { status });
    }

    if (tahun) {
      qb.andWhere('dpa.tahun = :tahun', { tahun });
    }

    if (tahunAnggaran) {
      qb.andWhere('dpa.tahunAnggaran = :tahunAnggaran', { tahunAnggaran });
    }

    // Pagination
    qb.skip((page - 1) * limit).take(limit);

    // Order by
    qb.orderBy('dpa.createdAt', 'DESC');

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find DPA by ID with all relations
   */
  async findOne(id: string) {
    const dpa = await this.dpaRepository.findOne({
      where: { id },
      relations: ['belanja', 'pendapatan', 'pembiayaan', 'dpaSebelumnya'],
    });

    if (!dpa) {
      throw new NotFoundException(`DPA with ID ${id} not found`);
    }

    return dpa;
  }

  /**
   * Get active DPA for a specific tahun anggaran
   */
  async getActiveDPA(tahunAnggaran: number) {
    const dpa = await this.dpaRepository.findOne({
      where: { tahunAnggaran, status: 'ACTIVE' },
      relations: ['belanja', 'pendapatan', 'pembiayaan'],
    });

    if (!dpa) {
      throw new NotFoundException(
        `No active DPA found for tahun anggaran ${tahunAnggaran}`,
      );
    }

    return dpa;
  }

  /**
   * Create new DPA manually
   */
  async create(createDPADto: CreateDPADto, userId: string) {
    // Check if nomor DPA already exists
    const existing = await this.dpaRepository.findOne({
      where: { nomorDPA: createDPADto.nomorDPA },
    });

    if (existing) {
      throw new ConflictException(
        `DPA with nomor ${createDPADto.nomorDPA} already exists`,
      );
    }

    // Validate DPPA
    if (createDPADto.jenisDokumen === 'DPPA') {
      if (!createDPADto.dpaSebelumnyaId) {
        throw new BadRequestException(
          'dpaSebelumnyaId is required for DPPA',
        );
      }
      if (!createDPADto.alasanRevisi) {
        throw new BadRequestException('alasanRevisi is required for DPPA');
      }

      // Check if DPA sebelumnya exists
      const dpaSebelumnya = await this.dpaRepository.findOne({
        where: { id: createDPADto.dpaSebelumnyaId },
      });
      if (!dpaSebelumnya) {
        throw new NotFoundException(
          `Previous DPA with ID ${createDPADto.dpaSebelumnyaId} not found`,
        );
      }
    }

    // Create DPA
    const dpa = this.dpaRepository.create({
      ...createDPADto,
      status: 'DRAFT',
    });

    const saved = await this.dpaRepository.save(dpa);

    // Log history
    await this.logHistory(saved.id, 'CREATE', userId, 'Created new DPA');

    return saved;
  }

  /**
   * Generate DPA from approved RBA
   * This is the main way to create DPA in production
   */
  async generateFromRBA(dto: GenerateDPAFromRBADto, userId: string) {
    // TODO: Implement RBA integration
    // For now, create empty DPA structure
    // In production, this should:
    // 1. Fetch approved RBA data
    // 2. Copy all anggaran belanja to DPA Belanja
    // 3. Copy pendapatan target to DPA Pendapatan
    // 4. Calculate totals

    const dpa = await this.create(
      {
        nomorDPA: dto.nomorDPA,
        jenisDokumen: 'DPA',
        tahun: new Date().getFullYear(),
        tahunAnggaran: dto.tahunAnggaran,
        revisiRBAId: dto.revisiRBAId,
        nomorRevisi: 0,
        createdBy: dto.createdBy,
      },
      userId,
    );

    // Log
    await this.logHistory(
      dpa.id,
      'CREATE',
      userId,
      `Generated DPA from RBA ${dto.revisiRBAId}`,
    );

    return dpa;
  }

  /**
   * Update DPA (only in DRAFT status)
   */
  async update(id: string, updateDPADto: UpdateDPADto, userId: string) {
    const dpa = await this.findOne(id);

    if (dpa.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT DPA can be updated');
    }

    // Store old values for history
    const oldValue = { ...dpa };

    // Update
    Object.assign(dpa, updateDPADto);
    const updated = await this.dpaRepository.save(dpa);

    // Log history
    await this.logHistory(
      id,
      'UPDATE',
      userId,
      'Updated DPA',
      oldValue,
      updated,
    );

    return updated;
  }

  /**
   * Delete DPA (only in DRAFT status)
   */
  async remove(id: string, userId: string) {
    const dpa = await this.findOne(id);

    if (dpa.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT DPA can be deleted');
    }

    await this.logHistory(id, 'DELETE', userId, 'Deleted DPA');
    await this.dpaRepository.remove(dpa);

    return { message: 'DPA deleted successfully' };
  }

  /**
   * Submit DPA for approval
   */
  async submit(id: string, userId: string, userName: string) {
    const dpa = await this.findOne(id);

    if (dpa.status !== 'DRAFT') {
      throw new BadRequestException('Only DRAFT DPA can be submitted');
    }

    dpa.status = 'SUBMITTED';
    dpa.diajukanOleh = userId;
    dpa.tanggalPengajuan = new Date();

    const updated = await this.dpaRepository.save(dpa);

    await this.logHistory(
      id,
      'SUBMIT',
      userId,
      `DPA submitted for approval by ${userName}`,
    );

    return updated;
  }

  /**
   * Approve DPA (by PPKD)
   */
  async approve(
    id: string,
    userId: string,
    userName: string,
    catatan?: string,
  ) {
    const dpa = await this.findOne(id);

    if (dpa.status !== 'SUBMITTED') {
      throw new BadRequestException('Only SUBMITTED DPA can be approved');
    }

    // Check if there's already an ACTIVE DPA for this tahun anggaran
    const existingActive = await this.dpaRepository.findOne({
      where: { tahunAnggaran: dpa.tahunAnggaran, status: 'ACTIVE' },
    });

    if (existingActive && existingActive.id !== id) {
      throw new ConflictException(
        `There is already an ACTIVE DPA for tahun anggaran ${dpa.tahunAnggaran}`,
      );
    }

    dpa.status = 'APPROVED';
    dpa.disetujuiOleh = userId;
    dpa.tanggalPersetujuan = new Date();
    if (catatan) {
      dpa.catatanPersetujuan = catatan;
    }

    const updated = await this.dpaRepository.save(dpa);

    await this.logHistory(
      id,
      'APPROVE',
      userId,
      `DPA approved by PPKD (${userName})${catatan ? ': ' + catatan : ''}`,
    );

    return updated;
  }

  /**
   * Reject DPA
   */
  async reject(id: string, userId: string, userName: string, alasan: string) {
    const dpa = await this.findOne(id);

    if (dpa.status !== 'SUBMITTED') {
      throw new BadRequestException('Only SUBMITTED DPA can be rejected');
    }

    dpa.status = 'REJECTED';
    dpa.catatanPersetujuan = alasan;

    const updated = await this.dpaRepository.save(dpa);

    await this.logHistory(
      id,
      'REJECT',
      userId,
      `DPA rejected by ${userName}: ${alasan}`,
    );

    return updated;
  }

  /**
   * Activate DPA (make it the active budget document)
   */
  async activate(id: string, userId: string, userName: string) {
    const dpa = await this.findOne(id);

    if (dpa.status !== 'APPROVED') {
      throw new BadRequestException('Only APPROVED DPA can be activated');
    }

    // Deactivate existing active DPA for the same tahun anggaran
    await this.dpaRepository.update(
      { tahunAnggaran: dpa.tahunAnggaran, status: 'ACTIVE' },
      { status: 'REVISED' },
    );

    dpa.status = 'ACTIVE';
    dpa.tanggalBerlaku = new Date();

    const updated = await this.dpaRepository.save(dpa);

    await this.logHistory(
      id,
      'ACTIVATE',
      userId,
      `DPA activated by ${userName}`,
    );

    return updated;
  }

  /**
   * Get DPA summary with totals
   */
  async getSummary(id: string) {
    const dpa = await this.findOne(id);

    // Recalculate totals from detail tables
    const totalBelanja = await this.dpaBelanjaRepository
      .createQueryBuilder('belanja')
      .select('SUM(belanja.pagu)', 'totalPagu')
      .addSelect('SUM(belanja.realisasi)', 'totalRealisasi')
      .where('belanja.dpaId = :dpaId', { dpaId: id })
      .getRawOne();

    const totalPendapatan = await this.dpaPendapatanRepository
      .createQueryBuilder('pendapatan')
      .select('SUM(pendapatan.pagu)', 'totalPagu')
      .addSelect('SUM(pendapatan.realisasi)', 'totalRealisasi')
      .where('pendapatan.dpaId = :dpaId', { dpaId: id })
      .getRawOne();

    return {
      dpa,
      summary: {
        belanja: {
          pagu: parseFloat(totalBelanja?.totalPagu || '0'),
          realisasi: parseFloat(totalBelanja?.totalRealisasi || '0'),
        },
        pendapatan: {
          pagu: parseFloat(totalPendapatan?.totalPagu || '0'),
          realisasi: parseFloat(totalPendapatan?.totalRealisasi || '0'),
        },
      },
    };
  }

  /**
   * Get DPA history/audit trail
   */
  async getHistory(id: string) {
    await this.findOne(id); // Check if exists

    return this.dpaHistoryRepository.find({
      where: { dpaId: id },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Log action to history
   */
  private async logHistory(
    dpaId: string,
    action: string,
    userId: string,
    notes: string,
    oldValue?: any,
    newValue?: any,
  ) {
    const history = this.dpaHistoryRepository.create({
      dpaId,
      action,
      userId,
      userRole: 'USER', // TODO: Get from actual user role
      userName: 'System User', // TODO: Get from actual user
      notes,
      oldValue,
      newValue,
    });

    await this.dpaHistoryRepository.save(history);
  }

  /**
   * Recalculate DPA totals from detail tables
   */
  async recalculateTotals(id: string) {
    const dpa = await this.findOne(id);

    // Calculate from belanja
    const totalBelanja = await this.dpaBelanjaRepository
      .createQueryBuilder('b')
      .select('SUM(b.pagu)', 'pagu')
      .addSelect('SUM(b.realisasi)', 'realisasi')
      .where('b.dpaId = :id', { id })
      .getRawOne();

    // Calculate from pendapatan
    const totalPendapatan = await this.dpaPendapatanRepository
      .createQueryBuilder('p')
      .select('SUM(p.pagu)', 'pagu')
      .addSelect('SUM(p.realisasi)', 'realisasi')
      .where('p.dpaId = :id', { id })
      .getRawOne();

    // Calculate from pembiayaan
    const totalPembiayaan = await this.dpaPembiayaanRepository
      .createQueryBuilder('p')
      .select('SUM(p.pagu)', 'pagu')
      .addSelect('SUM(p.realisasi)', 'realisasi')
      .where('p.dpaId = :id', { id })
      .getRawOne();

    // Update DPA
    dpa.totalPaguBelanja = parseFloat(totalBelanja?.pagu || '0');
    dpa.totalRealisasiBelanja = parseFloat(totalBelanja?.realisasi || '0');
    dpa.totalPaguPendapatan = parseFloat(totalPendapatan?.pagu || '0');
    dpa.totalRealisasiPendapatan = parseFloat(
      totalPendapatan?.realisasi || '0',
    );
    dpa.totalPaguPembiayaan = parseFloat(totalPembiayaan?.pagu || '0');
    dpa.totalRealisasiPembiayaan = parseFloat(
      totalPembiayaan?.realisasi || '0',
    );

    return this.dpaRepository.save(dpa);
  }
}
