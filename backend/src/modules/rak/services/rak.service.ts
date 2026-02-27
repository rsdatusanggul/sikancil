import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RakSubkegiatan, RakStatus } from '../entities/rak-subkegiatan.entity';
import { RakDetail } from '../entities/rak-detail.entity';
import { CreateRakDto } from '../dto/create-rak.dto';
import { UpdateRakDto } from '../dto/update-rak.dto';
import { RakQueryDto } from '../dto/rak-query.dto';
import { RakValidationService } from './rak-validation.service';
import { SubKegiatanRBA } from '../../../database/entities/subkegiatan-rba.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';

@Injectable()
export class RakService {
  constructor(
    @InjectRepository(RakSubkegiatan)
    private rakRepo: Repository<RakSubkegiatan>,
    @InjectRepository(RakDetail)
    private rakDetailRepo: Repository<RakDetail>,
    @InjectRepository(SubKegiatanRBA)
    private subkegiatanRepo: Repository<SubKegiatanRBA>,
    @InjectRepository(ChartOfAccount)
    private chartOfAccountRepo: Repository<ChartOfAccount>,
    private validationService: RakValidationService,
  ) {}

  /**
   * Transform RAK entity for frontend compatibility
   * TypeORM returns POJOs, so getters in entity don't serialize automatically
   */
  private transformRak(rak: any) {
    return {
      ...rak,
      subkegiatan: rak.subkegiatan ? {
        ...rak.subkegiatan,
        kode: rak.subkegiatan.kodeSubKegiatan,
        uraian: rak.subkegiatan.namaSubKegiatan,
        kegiatan_id: rak.subkegiatan.kegiatanId,
        program_id: rak.subkegiatan.kegiatan?.programId || '',
      } : null,
    };
  }

  // ============================================
  // CREATE
  // ============================================

  /**
   * Calculate monthly breakdown from quarterly values
   */
  private calculateMonthlyFromQuarterly(quarterly: {
    triwulan_1?: number;
    triwulan_2?: number;
    triwulan_3?: number;
    triwulan_4?: number;
  }): {
    januari: number;
    februari: number;
    maret: number;
    april: number;
    mei: number;
    juni: number;
    juli: number;
    agustus: number;
    september: number;
    oktober: number;
    november: number;
    desember: number;
  } {
    const result = {
      januari: 0,
      februari: 0,
      maret: 0,
      april: 0,
      mei: 0,
      juni: 0,
      juli: 0,
      agustus: 0,
      september: 0,
      oktober: 0,
      november: 0,
      desember: 0,
    };

    // Triwulan 1 (Jan-Mar)
    if (quarterly.triwulan_1) {
      const perMonth = Math.floor(quarterly.triwulan_1 / 3);
      const remainder = quarterly.triwulan_1 - (perMonth * 3);
      result.januari = perMonth + remainder;
      result.februari = perMonth;
      result.maret = perMonth;
    }

    // Triwulan 2 (Apr-Jun)
    if (quarterly.triwulan_2) {
      const perMonth = Math.floor(quarterly.triwulan_2 / 3);
      const remainder = quarterly.triwulan_2 - (perMonth * 3);
      result.april = perMonth + remainder;
      result.mei = perMonth;
      result.juni = perMonth;
    }

    // Triwulan 3 (Jul-Sep)
    if (quarterly.triwulan_3) {
      const perMonth = Math.floor(quarterly.triwulan_3 / 3);
      const remainder = quarterly.triwulan_3 - (perMonth * 3);
      result.juli = perMonth + remainder;
      result.agustus = perMonth;
      result.september = perMonth;
    }

    // Triwulan 4 (Oct-Dec)
    if (quarterly.triwulan_4) {
      const perMonth = Math.floor(quarterly.triwulan_4 / 3);
      const remainder = quarterly.triwulan_4 - (perMonth * 3);
      result.oktober = perMonth + remainder;
      result.november = perMonth;
      result.desember = perMonth;
    }

    return result;
  }

  /**
   * Calculate quarterly values from monthly breakdown
   */
  private calculateQuarterlyFromMonthly(monthly: {
    januari?: number;
    februari?: number;
    maret?: number;
    april?: number;
    mei?: number;
    juni?: number;
    juli?: number;
    agustus?: number;
    september?: number;
    oktober?: number;
    november?: number;
    desember?: number;
  }): {
    triwulan_1: number;
    triwulan_2: number;
    triwulan_3: number;
    triwulan_4: number;
  } {
    return {
      triwulan_1: (monthly.januari || 0) + (monthly.februari || 0) + (monthly.maret || 0),
      triwulan_2: (monthly.april || 0) + (monthly.mei || 0) + (monthly.juni || 0),
      triwulan_3: (monthly.juli || 0) + (monthly.agustus || 0) + (monthly.september || 0),
      triwulan_4: (monthly.oktober || 0) + (monthly.november || 0) + (monthly.desember || 0),
    };
  }

  /**
   * Process RAK detail to ensure quarterly and monthly values are consistent
   */
  private processDetailData(detail: any): any {
    const hasMonthly = Object.keys(detail).some(key => 
      ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 
       'juli', 'agustus', 'september', 'oktober', 'november', 'desember'].includes(key) && 
      detail[key] !== undefined
    );

    const hasQuarterly = Object.keys(detail).some(key => 
      ['triwulan_1', 'triwulan_2', 'triwulan_3', 'triwulan_4'].includes(key) && 
      detail[key] !== undefined
    );

    // If only quarterly provided, calculate monthly
    if (hasQuarterly && !hasMonthly) {
      const monthly = this.calculateMonthlyFromQuarterly(detail);
      Object.assign(detail, monthly);
    }
    // If only monthly provided, no need to calculate quarterly (DB will do it)
    // If both provided, use monthly values

    return detail;
  }

  async create(createRakDto: CreateRakDto, userId: string) {
    // Check if RAK already exists (exclude soft-deleted records)
    const existing = await this.rakRepo
      .createQueryBuilder('rak')
      .where('rak.subkegiatan_id = :subkegiatanId', { 
        subkegiatanId: createRakDto.subkegiatan_id 
      })
      .andWhere('rak.tahun_anggaran = :tahun', { 
        tahun: createRakDto.tahun_anggaran 
      })
      .andWhere('rak.deleted_at IS NULL') // Explicitly exclude soft-deleted records
      .getOne();

    if (existing) {
      throw new ConflictException(
        'RAK untuk subkegiatan dan tahun ini sudah ada',
      );
    }
    
    // Fetch Subkegiatan
    const subkegiatan = await this.subkegiatanRepo.findOne({
      where: { id: createRakDto.subkegiatan_id },
      relations: ['anggaranBelanja'],
    });

    if (!subkegiatan) {
      throw new NotFoundException('Subkegiatan tidak ditemukan');
    }

    // Validate RBA prerequisite
    if (subkegiatan.totalPagu <= 0) {
      throw new BadRequestException(
        'Subkegiatan tidak memiliki pagu anggaran. Pastikan RBA sudah approved dan memiliki pagu.'
      );
    }

    // Use totalPagu from Subkegiatan
    const totalPagu = subkegiatan.totalPagu;

    // Determine if auto-populate or use manual details
    const shouldAutoPopulate = createRakDto.auto_populate !== false && !createRakDto.details;
    let detailsToCreate: any[] = createRakDto.details || [];

    if (shouldAutoPopulate) {
      // Auto-populate from AnggaranBelanjaRBA
      const anggaranBelanja = subkegiatan.anggaranBelanja || [];
      
      if (anggaranBelanja.length === 0) {
        throw new BadRequestException(
          'Subkegiatan tidak memiliki data anggaran belanja. Tidak dapat membuat RAK.'
        );
      }

      const tempDetails = await Promise.all(
        anggaranBelanja.map(async (anggaran) => {
          const chartOfAccount = await this.chartOfAccountRepo.findOne({
            where: { kodeRekening: anggaran.kodeRekening, isActive: true },
          });

          if (!chartOfAccount) {
            console.warn(`Chart of account ${anggaran.kodeRekening} tidak ditemukan, skipping...`);
            return null;
          }

          const monthlyTotal = 
            Number(anggaran.januari || 0) +
            Number(anggaran.februari || 0) +
            Number(anggaran.maret || 0) +
            Number(anggaran.april || 0) +
            Number(anggaran.mei || 0) +
            Number(anggaran.juni || 0) +
            Number(anggaran.juli || 0) +
            Number(anggaran.agustus || 0) +
            Number(anggaran.september || 0) +
            Number(anggaran.oktober || 0) +
            Number(anggaran.november || 0) +
            Number(anggaran.desember || 0);

          return {
            kode_rekening_id: chartOfAccount.id,
            jumlah_anggaran: monthlyTotal,
            januari: anggaran.januari,
            februari: anggaran.februari,
            maret: anggaran.maret,
            april: anggaran.april,
            mei: anggaran.mei,
            juni: anggaran.juni,
            juli: anggaran.juli,
            agustus: anggaran.agustus,
            september: anggaran.september,
            oktober: anggaran.oktober,
            november: anggaran.november,
            desember: anggaran.desember,
          };
        })
      );

      // Filter out null values
      detailsToCreate = tempDetails.filter((d): d is any => d !== null);
    }

    // Validate and process details
    if (detailsToCreate.length > 0) {
      // Check for duplicate kode rekening
      const kodeRekeningIds = detailsToCreate
        .filter((d): d is any => d !== null)
        .map(d => d.kode_rekening_id);
      const uniqueIds = new Set(kodeRekeningIds);
      
      if (uniqueIds.size !== kodeRekeningIds.length) {
        throw new BadRequestException('Terdapat kode rekening yang duplikat');
      }

      // Process each detail (calculate monthly from quarterly if needed)
      detailsToCreate = detailsToCreate
        .filter((d): d is any => d !== null)
        .map(detail => this.processDetailData(detail));

      // Calculate total input
      const totalInput = detailsToCreate.reduce(
        (sum, d) => sum + Number(d.jumlah_anggaran || 0),
        0
      );

      // Validate pagu limit
      if (totalInput > totalPagu) {
        throw new BadRequestException(
          `Total input (${this.formatCurrency(totalInput)}) melebihi pagu subkegiatan (${this.formatCurrency(totalPagu)}). Selisih: ${this.formatCurrency(totalInput - totalPagu)}`
        );
      }
    }

    // Create RAK header
    const rak = this.rakRepo.create({
      subkegiatan_id: createRakDto.subkegiatan_id,
      tahun_anggaran: createRakDto.tahun_anggaran,
      total_pagu: totalPagu,
      created_by: userId,
      updated_by: userId,
    });

    const saved = await this.rakRepo.save(rak);

    // Create RAK details
    if (detailsToCreate.length > 0) {
      const details = await Promise.all(
        detailsToCreate.map(async (detail) => {
          return this.rakDetailRepo.create({
            rak_subkegiatan_id: saved.id,
            kode_rekening_id: detail.kode_rekening_id,
            jumlah_anggaran: detail.jumlah_anggaran,
            januari: detail.januari || 0,
            februari: detail.februari || 0,
            maret: detail.maret || 0,
            april: detail.april || 0,
            mei: detail.mei || 0,
            juni: detail.juni || 0,
            juli: detail.juli || 0,
            agustus: detail.agustus || 0,
            september: detail.september || 0,
            oktober: detail.oktober || 0,
            november: detail.november || 0,
            desember: detail.desember || 0,
            created_by: userId,
            updated_by: userId,
          });
        })
      );

      await this.rakDetailRepo.save(details);
    }

    return this.findOne(saved.id);
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // ============================================
  // READ
  // ============================================

  /**
   * Get available years with RAK data
   */
  async getAvailableYears(): Promise<number[]> {
    const result = await this.rakRepo
      .createQueryBuilder('rak')
      .select('DISTINCT rak.tahun_anggaran', 'tahun')
      .where('rak.deleted_at IS NULL')
      .orderBy('rak.tahun_anggaran', 'DESC')
      .getRawMany();

    return result.map(r => r.tahun);
  }

  async findAll(query: RakQueryDto) {
    const { tahun_anggaran, subkegiatan_id, status, search, page = 1, limit = 10 } = query;

    const qb = this.rakRepo
      .createQueryBuilder('rak')
      .leftJoinAndSelect('rak.subkegiatan', 'subkegiatan')
      .leftJoinAndSelect('rak.creator', 'creator')
      .leftJoinAndSelect('rak.approver', 'approver')
      .where('rak.deleted_at IS NULL');

    if (tahun_anggaran) {
      qb.andWhere('rak.tahun_anggaran = :tahun', { tahun: tahun_anggaran });
    }

    if (subkegiatan_id) {
      qb.andWhere('rak.subkegiatan_id = :subkegiatanId', { subkegiatan_id });
    }

    if (status) {
      qb.andWhere('rak.status = :status', { status });
    }

    // Search by subkegiatan code or name
    if (search) {
      qb.andWhere(
        '(subkegiatan.kodeSubKegiatan ILIKE :search OR subkegiatan.namaSubKegiatan ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const [data, total] = await qb
      .orderBy('rak.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Transform subkegiatan fields for frontend compatibility
    // TypeORM returns POJOs, so getters in entity don't serialize automatically
    const transformedData = data.map(rak => ({
      ...rak,
      subkegiatan: rak.subkegiatan ? {
        ...rak.subkegiatan,
        kode: rak.subkegiatan.kodeSubKegiatan,
        uraian: rak.subkegiatan.namaSubKegiatan,
        kegiatan_id: rak.subkegiatan.kegiatanId,
        program_id: rak.subkegiatan.kegiatan?.programId || '',
      } : null,
    }));

    return {
      data: transformedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find raw RAK entity (internal use for database operations)
   */
  private async findOneRaw(id: string) {
    const rak = await this.rakRepo.findOne({
      where: { id },
      relations: ['subkegiatan', 'subkegiatan.kegiatan', 'details', 'details.kode_rekening'],
    });

    if (!rak) {
      throw new NotFoundException('RAK tidak ditemukan');
    }

    return rak;
  }

  /**
   * Find RAK by ID with transformation for frontend compatibility
   */
  async findOne(id: string) {
    const rak = await this.findOneRaw(id);
    
    // Transform subkegiatan fields for frontend compatibility
    // TypeORM returns POJOs, so getters in entity don't serialize automatically
    return this.transformRak(rak);
  }

  async getDetails(id: string) {
    const rak = await this.findOne(id);

    return {
      id: rak.id,
      subkegiatan: rak.subkegiatan,
      tahun_anggaran: rak.tahun_anggaran,
      total_pagu: rak.total_pagu,
      status: rak.status,
      details: rak.details.map((d) => ({
        id: d.id,
        kode_rekening: d.kode_rekening,
        jumlah_anggaran: d.jumlah_anggaran,
        monthly: {
          januari: d.januari,
          februari: d.februari,
          maret: d.maret,
          april: d.april,
          mei: d.mei,
          juni: d.juni,
          juli: d.juli,
          agustus: d.agustus,
          september: d.september,
          oktober: d.oktober,
          november: d.november,
          desember: d.desember,
        },
      })),
    };
  }

  async findBySubkegiatanAndTahun(
    subkegiatanId: string,
    tahun: number,
  ) {
    const rak = await this.rakRepo.findOne({
      where: {
        subkegiatan_id: subkegiatanId,
        tahun_anggaran: tahun,
      },
      relations: ['subkegiatan', 'details', 'details.kode_rekening'],
    });

    if (!rak) {
      throw new NotFoundException('RAK tidak ditemukan');
    }

    return rak;
  }

  // ============================================
  // UPDATE
  // ============================================

  async update(id: string, updateRakDto: UpdateRakDto, userId: string) {
    const rak = await this.findOneRaw(id);

    if (rak.status !== RakStatus.DRAFT) {
      throw new BadRequestException('Hanya RAK berstatus DRAFT yang bisa diubah');
    }

    Object.assign(rak, updateRakDto);
    rak.updated_by = userId;

    const saved = await this.rakRepo.save(rak);
    return this.findOne(saved.id);
  }

  // ============================================
  // WORKFLOW
  // ============================================

  async submit(id: string, userId: string) {
    const rak = await this.findOneRaw(id);

    if (rak.status !== RakStatus.DRAFT) {
      throw new BadRequestException('Hanya RAK DRAFT yang bisa disubmit');
    }

    // Validate total detail = total pagu
    await this.validationService.validateTotalDetail(id);

    rak.status = RakStatus.SUBMITTED;
    rak.submitted_at = new Date();
    rak.submitted_by = userId;
    rak.updated_by = userId;

    const saved = await this.rakRepo.save(rak);
    return this.findOne(saved.id);
  }

  async approve(id: string, userId: string, notes?: string) {
    const rak = await this.findOneRaw(id);

    if (rak.status !== RakStatus.SUBMITTED) {
      throw new BadRequestException('Hanya RAK SUBMITTED yang bisa diapprove');
    }

    rak.status = RakStatus.APPROVED;
    rak.approved_at = new Date();
    rak.approved_by = userId;
    rak.approval_notes = notes || '';
    rak.updated_by = userId;

    const saved = await this.rakRepo.save(rak);
    return this.findOne(saved.id);
  }

  async reject(id: string, userId: string, reason: string) {
    const rak = await this.findOneRaw(id);

    if (rak.status !== RakStatus.SUBMITTED) {
      throw new BadRequestException('Hanya RAK SUBMITTED yang bisa direject');
    }

    rak.status = RakStatus.REJECTED;
    rak.rejected_at = new Date();
    rak.rejected_by = userId;
    rak.rejection_reason = reason;
    rak.updated_by = userId;

    const saved = await this.rakRepo.save(rak);
    return this.findOne(saved.id);
  }

  async createRevision(id: string, userId: string) {
    const rak = await this.findOneRaw(id);

    if (rak.status !== RakStatus.REJECTED) {
      throw new BadRequestException('Hanya RAK REJECTED yang bisa direvisi');
    }

    // Create new revision
    const newRevision = this.rakRepo.create({
      subkegiatan_id: rak.subkegiatan_id,
      tahun_anggaran: rak.tahun_anggaran,
      total_pagu: rak.total_pagu,
      status: RakStatus.DRAFT,
      revision_number: rak.revision_number + 1,
      previous_version_id: rak.id,
      created_by: userId,
      updated_by: userId,
    });

    const saved = await this.rakRepo.save(newRevision);

    // Copy details
    const details = await this.rakDetailRepo.find({
      where: { rak_subkegiatan_id: id },
    });

    if (details.length > 0) {
      const newDetails = details.map((d) =>
        this.rakDetailRepo.create({
          ...d,
          rak_subkegiatan_id: saved.id,
          created_by: userId,
          updated_by: userId,
        }),
      );

      await this.rakDetailRepo.save(newDetails);
    }

    return this.findOne(saved.id);
  }

  // ============================================
  // DELETE (Soft Delete)
  // ============================================

  async softDelete(id: string, userId: string) {
    const rak = await this.findOneRaw(id);

    if (rak.status === RakStatus.APPROVED) {
      throw new BadRequestException('RAK yang sudah diapprove tidak bisa dihapus');
    }

    rak.deleted_at = new Date();
    rak.deleted_by = userId;

    const saved = await this.rakRepo.save(rak);
    return this.findOne(saved.id);
  }

  // ============================================
  // EXPORT (Placeholder - to be implemented)
  // ============================================

  async exportPdf(id: string) {
    throw new BadRequestException('PDF export belum diimplementasikan');
  }

  async exportExcel(id: string) {
    throw new BadRequestException('Excel export belum diimplementasikan');
  }

  async exportConsolidation(tahun: number) {
    throw new BadRequestException('Consolidation export belum diimplementasikan');
  }
}