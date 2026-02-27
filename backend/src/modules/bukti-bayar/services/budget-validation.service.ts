import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not, In, IsNull, Like, ILike } from 'typeorm';

// Note: We use DataSource.getRepository() for ChartOfAccount to avoid module dependency issues
import { PaymentVoucher } from '../../../database/entities/payment-voucher.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { StatusBuktiBayar } from '../../../database/enums';

/**
 * Interface untuk input validasi budget
 */
export interface BudgetValidationInput {
  kegiatanId: string;
  subKegiatanId?: string;
  accountCode: string;
  fiscalYear: number;
  voucherMonth: number;
  grossAmount: number;
  excludeVoucherId?: string; // ID voucher yang di-exclude saat update
}

/**
 * Interface untuk hasil validasi budget
 */
export interface BudgetValidationResult {
  isValid: boolean;
  message?: string;
  details: {
    pagu: number;
    rakMonthlyLimit: number;
    realization: number;
    commitments: number;
    available: number;
    requested: number;
  };
}

@Injectable()
export class BudgetValidationService {
  private readonly logger = new Logger(BudgetValidationService.name);
  private readonly coaRepo: Repository<ChartOfAccount>;

  constructor(
    @InjectRepository(PaymentVoucher)
    private readonly voucherRepo: Repository<PaymentVoucher>,
    private readonly dataSource: DataSource,
  ) {
    // Get ChartOfAccount repository from DataSource to avoid module import issues
    this.coaRepo = dataSource.getRepository(ChartOfAccount);
  }

  /**
   * Validasi apakah grossAmount masih dalam batas pagu dan RAK
   */
  async validate(input: BudgetValidationInput): Promise<BudgetValidationResult> {
    try {
      // 1. Get pagu dari RBA
      const pagu = await this.getPagu(
        input.kegiatanId,
        input.subKegiatanId,
        input.accountCode,
        input.fiscalYear,
      );

      // 2. Get RAK limit bulanan
      const rakMonthlyLimit = await this.getRakLimit(
        input.kegiatanId,
        input.voucherMonth,
        input.fiscalYear,
      );

      // 3. Get realization (SPM yang sudah approved)
      const realization = await this.getRealization(
        input.kegiatanId,
        input.accountCode,
        input.fiscalYear,
      );

      // 4. Get commitments (Payment Vouchers approved belum jadi SPP)
      const commitments = await this.getCommitments(
        input.kegiatanId,
        input.accountCode,
        input.fiscalYear,
        input.excludeVoucherId,
      );

      // 5. Calculate available budget
      const available = pagu - realization - commitments;

      // 6. Validate
      if (input.grossAmount > available) {
        const message = this.formatMessage(
          'Pagu tidak mencukupi',
          pagu,
          realization,
          commitments,
          available,
          input.grossAmount,
        );

        return {
          isValid: false,
          message,
          details: {
            pagu,
            rakMonthlyLimit,
            realization,
            commitments,
            available,
            requested: input.grossAmount,
          },
        };
      }

      // 7. Validate RAK monthly limit (if exists)
      if (rakMonthlyLimit > 0) {
        const rakAvailable = rakMonthlyLimit - realization - commitments;

        if (input.grossAmount > rakAvailable) {
          const message = this.formatMessage(
            'RAK bulanan tidak mencukupi',
            rakMonthlyLimit,
            realization,
            commitments,
            rakAvailable,
            input.grossAmount,
          );

          return {
            isValid: false,
            message,
            details: {
              pagu,
              rakMonthlyLimit,
              realization,
              commitments,
              available: rakAvailable,
              requested: input.grossAmount,
            },
          };
        }
      }

      // 8. Success
      return {
        isValid: true,
        details: {
          pagu,
          rakMonthlyLimit,
          realization,
          commitments,
          available,
          requested: input.grossAmount,
        },
      };
    } catch (error) {
      this.logger.error(`Budget validation error: ${error.message}`, error.stack);

      // Graceful degradation: jika tabel tidak ada, return valid dengan warning
      this.logger.warn(
        'Budget validation failed, allowing transaction to proceed (graceful degradation)',
      );

      return {
        isValid: true,
        message: 'Validasi anggaran dilewati karena data RBA/RAK tidak tersedia',
        details: {
          pagu: 0,
          rakMonthlyLimit: 0,
          realization: 0,
          commitments: 0,
          available: 0,
          requested: input.grossAmount,
        },
      };
    }
  }

  /**
   * Get pagu dari RBA (total anggaran yang dialokasikan)
   */
  private async getPagu(
    kegiatanId: string,
    subKegiatanId: string | undefined,
    accountCode: string,
    fiscalYear: number,
  ): Promise<number> {
    try {
      const query = `
        SELECT COALESCE(SUM(amount), 0) as pagu
        FROM rba_details
        WHERE kegiatan_id = $1
          AND account_code = $2
          AND fiscal_year = $3
          ${subKegiatanId ? 'AND output_id = $4' : ''}
      `;

      const params = subKegiatanId
        ? [kegiatanId, accountCode, fiscalYear, subKegiatanId]
        : [kegiatanId, accountCode, fiscalYear];

      const result = await this.dataSource.query(query, params);
      return parseFloat(result[0]?.pagu || '0');
    } catch (error) {
      this.logger.warn(`Failed to get pagu: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get RAK limit bulanan
   */
  private async getRakLimit(
    kegiatanId: string,
    month: number,
    fiscalYear: number,
  ): Promise<number> {
    try {
      const query = `
        SELECT COALESCE(SUM(planned_amount), 0) as rak_limit
        FROM rak_details
        WHERE kegiatan_id = $1
          AND fiscal_year = $2
          AND month = $3
          AND status = 'APPROVED'
      `;

      const result = await this.dataSource.query(query, [
        kegiatanId,
        fiscalYear,
        month,
      ]);

      return parseFloat(result[0]?.rak_limit || '0');
    } catch (error) {
      this.logger.warn(`Failed to get RAK limit: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get realisasi (SPM yang sudah approved/dicairkan)
   */
  private async getRealization(
    kegiatanId: string,
    accountCode: string,
    fiscalYear: number,
  ): Promise<number> {
    try {
      const query = `
        SELECT COALESCE(SUM(amount), 0) as realization
        FROM spm_documents
        WHERE kegiatan_id = $1
          AND account_code = $2
          AND fiscal_year = $3
          AND status IN ('APPROVED', 'SP2D_ISSUED')
          AND deleted_at IS NULL
      `;

      const result = await this.dataSource.query(query, [
        kegiatanId,
        accountCode,
        fiscalYear,
      ]);

      return parseFloat(result[0]?.realization || '0');
    } catch (error) {
      this.logger.warn(`Failed to get realization: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get commitments (Payment Vouchers FINAL tapi belum jadi SPP)
   */
  private async getCommitments(
    kegiatanId: string,
    accountCode: string,
    fiscalYear: number,
    excludeVoucherId?: string,
  ): Promise<number> {
    try {
      const qb = this.voucherRepo
        .createQueryBuilder('pv')
        .select('COALESCE(SUM(pv.grossAmount), 0)', 'commitments')
        .where('pv.kegiatanId = :kegiatanId', { kegiatanId })
        .andWhere('pv.accountCode = :accountCode', { accountCode })
        .andWhere('pv.fiscalYear = :fiscalYear', { fiscalYear })
        .andWhere('pv.status = :status', { status: StatusBuktiBayar.FINAL })
        .andWhere('pv.sppId IS NULL') // Belum jadi SPP
        .andWhere('pv.deletedAt IS NULL'); // Not soft-deleted

      // Exclude voucher yang sedang di-update
      if (excludeVoucherId) {
        qb.andWhere('pv.id != :excludeVoucherId', { excludeVoucherId });
      }

      const result = await qb.getRawOne();
      return parseFloat(result?.commitments || '0');
    } catch (error) {
      this.logger.warn(`Failed to get commitments: ${error.message}`);
      return 0;
    }
  }

  /**
   * Search kode rekening untuk autocomplete (similar to RAK creation)
   * Uses case-insensitive search on both kodeRekening and namaRekening
   * Only returns active, non-header accounts (posting accounts)
   */
  async searchKodeRekening(query: string): Promise<
    Array<{
      id: string;
      kodeRekening: string;
      namaRekening: string;
      level: number;
    }>
  > {
    try {
      // Use ILike for case-insensitive search
      // Filter: active, non-header accounts only
      const results = await this.coaRepo.find({
        where: [
          {
            kodeRekening: ILike(`${query}%`),
            isActive: true,
            isHeader: false,
          }, // Starts with query
          {
            namaRekening: ILike(`%${query}%`),
            isActive: true,
            isHeader: false,
          }, // Contains query
        ],
        select: ['id', 'kodeRekening', 'namaRekening', 'level'],
        order: { kodeRekening: 'ASC' },
        take: 50, // Limit results
      });

      return results;
    } catch (error) {
      this.logger.error(`Error searching kode rekening: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Get all subkegiatan with program and kegiatan info for dropdown
   * Returns simplified data structure for frontend dropdown
   */
  async getSubkegiatanDropdown(
    tahun?: number,
    search?: string,
  ): Promise<
    Array<{
      id: string;
      kodeSubKegiatan: string;
      namaSubKegiatan: string;
      kegiatanId: string;
      kodeKegiatan: string;
      namaKegiatan: string;
      programId: string;
      kodeProgram: string;
      namaProgram: string;
      tahun: number;
    }>
  > {
    try {
      let query = `
        SELECT 
          sk.id as id,
          sk."kodeSubKegiatan" as "kodeSubKegiatan",
          sk."namaSubKegiatan" as "namaSubKegiatan",
          sk."kegiatanId" as "kegiatanId",
          k."kodeKegiatan" as "kodeKegiatan",
          k."namaKegiatan" as "namaKegiatan",
          k."programId" as "programId",
          p."kodeProgram" as "kodeProgram",
          p."namaProgram" as "namaProgram",
          sk.tahun as "tahun"
        FROM subkegiatan_rba sk
        LEFT JOIN kegiatan_rba k ON sk."kegiatanId" = k.id
        LEFT JOIN program_rba p ON k."programId" = p.id
        WHERE sk."isActive" = true
      `;

      const params: any[] = [];

      // Filter by tahun if provided
      if (tahun) {
        query += ` AND sk.tahun = $${params.length + 1}`;
        params.push(tahun);
      }

      // Search by kode or nama subkegiatan if provided
      if (search && search.trim()) {
        query += ` AND (
          sk."kodeSubKegiatan" ILIKE $${params.length + 1} OR
          sk."namaSubKegiatan" ILIKE $${params.length + 2}
        )`;
        const searchPattern = `%${search.trim()}%`;
        params.push(`${searchPattern}%`, searchPattern); // Starts with for kode, contains for nama
      }

      query += ` ORDER BY sk.tahun DESC, p."kodeProgram" ASC, k."kodeKegiatan" ASC, sk."kodeSubKegiatan" ASC`;
      query += ` LIMIT 100`;

      const results = await this.dataSource.query(query, params);

      return results.map((row: any) => ({
        id: row.id,
        kodeSubKegiatan: row.kodeSubKegiatan,
        namaSubKegiatan: row.namaSubKegiatan,
        kegiatanId: row.kegiatanId,
        kodeKegiatan: row.kodeKegiatan,
        namaKegiatan: row.namaKegiatan,
        programId: row.programId,
        kodeProgram: row.kodeProgram,
        namaProgram: row.namaProgram,
        tahun: row.tahun,
      }));
    } catch (error) {
      this.logger.error(`Error getting subkegiatan dropdown: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * Format pesan error validasi anggaran
   */
  private formatMessage(
    reason: string,
    limit: number,
    realization: number,
    commitment: number,
    available: number,
    requested: number,
  ): string {
    const format = (val: number) =>
      'Rp ' + val.toLocaleString('id-ID', { maximumFractionDigits: 0 });

    return (
      `${reason}. ` +
      `Batas: ${format(limit)}, ` +
      `Realisasi: ${format(realization)}, ` +
      `Komitmen: ${format(commitment)}, ` +
      `Tersedia: ${format(available)}, ` +
      `Diminta: ${format(requested)}`
    );
  }
}