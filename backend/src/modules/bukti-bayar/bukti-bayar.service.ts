import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { PaymentVoucher } from '../../database/entities/payment-voucher.entity';
import { PaymentVoucherAuditLog } from '../../database/entities/payment-voucher-audit-log.entity';
import { StatusBuktiBayar, VoucherAuditAction } from '../../database/enums';

import { TaxCalculationService } from './services/tax-calculation.service';
import { BudgetValidationService } from './services/budget-validation.service';
import { VoucherNumberingService } from './services/voucher-numbering.service';

import {
  CreatePaymentVoucherDto,
  UpdatePaymentVoucherDto,
  QueryPaymentVoucherDto,
  ApproveTechnicalDto,
  ApproveTreasurerDto,
  ApproveFinalDto,
  RejectPaymentVoucherDto,
} from './dto';

/**
 * Interface untuk paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class BuktiBayarService {
  private readonly logger = new Logger(BuktiBayarService.name);

  constructor(
    @InjectRepository(PaymentVoucher)
    private readonly voucherRepo: Repository<PaymentVoucher>,

    @InjectRepository(PaymentVoucherAuditLog)
    private readonly auditRepo: Repository<PaymentVoucherAuditLog>,

    private readonly taxSvc: TaxCalculationService,
    private readonly budgetSvc: BudgetValidationService,
    private readonly numberingSvc: VoucherNumberingService,
  ) {}

  /**
   * Create new payment voucher
   */
  async create(dto: CreatePaymentVoucherDto, currentUser: any): Promise<PaymentVoucher> {
    // 1. Extract voucher month from voucher date
    const voucherDate = new Date(dto.voucherDate);
    const voucherMonth = voucherDate.getMonth() + 1; // 1-12

    // 2. Validate budget
    const budgetValidation = await this.budgetSvc.validate({
      kegiatanId: dto.kegiatanId,
      subKegiatanId: dto.subKegiatanId,
      accountCode: dto.accountCode,
      fiscalYear: dto.fiscalYear,
      voucherMonth,
      grossAmount: dto.grossAmount,
    });

    if (!budgetValidation.isValid) {
      throw new BadRequestException(budgetValidation.message);
    }

    // 3. Calculate tax (unless manual override provided)
    let taxResult;
    if (dto.ppnRate !== undefined || dto.pph22Rate !== undefined || dto.pph23Rate !== undefined) {
      // Manual override: use provided tax values
      this.logger.log('Using manual tax override');
      taxResult = {
        taxRuleId: null,
        pph21Rate: dto.pph21Rate || 0,
        pph21Amount: dto.pph21Amount || 0,
        pph22Rate: dto.pph22Rate || 0,
        pph22Amount: dto.pph22Amount || 0,
        pph23Rate: dto.pph23Rate || 0,
        pph23Amount: dto.pph23Amount || 0,
        pph4a2Rate: dto.pph4a2Rate || 0,
        pph4a2Amount: dto.pph4a2Amount || 0,
        pphFinalUmkmRate: dto.pphFinalUmkmRate || 0,
        pphFinalUmkmAmount: dto.pphFinalUmkmAmount || 0,
        pph24Rate: dto.pph24Rate || 0,
        pph24Amount: dto.pph24Amount || 0,
        ppnRate: dto.ppnRate || 0,
        ppnAmount: dto.ppnAmount || 0,
        totalDeductions: 0,
        netPayment: 0,
        grossAmountText: '',
      };
    } else {
      // Auto-calculate from tax rules
      taxResult = await this.taxSvc.calculate({
        accountCode: dto.accountCode,
        grossAmount: dto.grossAmount,
        vendorNpwp: dto.vendorNpwp,
        transactionDate: voucherDate,
      });
    }

    // 4. Generate voucher number
    const numberingResult = await this.numberingSvc.generate(
      dto.fiscalYear,
      voucherMonth,
      dto.accountCode,
      dto.unitCode || 'RSUD-DS',
    );

    // 5. Set default payee name if not provided
    const payeeName =
      dto.payeeName || `BENDAHARA PENGELUARAN ${dto.unitCode || 'RSUD DATU SANGGUL RANTAU'}`;

    // 6. Create entity
    const voucherData: Partial<PaymentVoucher> = {
      // Identitas dokumen
      voucherNumber: numberingResult.voucherNumber,
      voucherSequence: numberingResult.sequenceNumber,
      fiscalYear: dto.fiscalYear,
      voucherMonth,
      voucherDate: voucherDate,
      unitCode: dto.unitCode || 'RSUD-DS',

      // Hierarki anggaran
      programId: dto.programId,
      programCode: dto.programCode,
      programName: dto.programName,
      kegiatanId: dto.kegiatanId,
      kegiatanCode: dto.kegiatanCode,
      kegiatanName: dto.kegiatanName,
      subKegiatanId: dto.subKegiatanId,
      subKegiatanCode: dto.subKegiatanCode,
      subKegiatanName: dto.subKegiatanName,
      accountCode: dto.accountCode,
      accountName: dto.accountName,

      // Cache budget info
      availablePagu: budgetValidation.details.available,
      rakMonthlyLimit: budgetValidation.details.rakMonthlyLimit,
      previousCommitments: budgetValidation.details.commitments,

      // PPTK (creator is PPTK)
      pptkId: currentUser.id,

      // Detail pembayaran
      payeeName,
      paymentPurpose: dto.paymentPurpose,
      vendorName: dto.vendorName,
      vendorNpwp: dto.vendorNpwp,
      vendorAddress: dto.vendorAddress,
      invoiceNumbers: dto.invoiceNumbers,
      invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : undefined,

      // Keuangan
      grossAmount: dto.grossAmount,
      taxRuleId: taxResult.taxRuleId,

      pph21Rate: taxResult.pph21Rate,
      pph21Amount: taxResult.pph21Amount,
      pph22Rate: taxResult.pph22Rate,
      pph22Amount: taxResult.pph22Amount,
      pph23Rate: taxResult.pph23Rate,
      pph23Amount: taxResult.pph23Amount,
      pph4a2Rate: taxResult.pph4a2Rate,
      pph4a2Amount: taxResult.pph4a2Amount,
      pphFinalUmkmRate: taxResult.pphFinalUmkmRate,
      pphFinalUmkmAmount: taxResult.pphFinalUmkmAmount,
      pph24Rate: taxResult.pph24Rate,
      pph24Amount: taxResult.pph24Amount,
      ppnRate: taxResult.ppnRate,
      ppnAmount: taxResult.ppnAmount,
      otherDeductions: dto.otherDeductions || 0,
      otherDeductionsNote: dto.otherDeductionsNote,

      grossAmountText: taxResult.grossAmountText,

      // Data UMKM
      skUmkmNumber: dto.skUmkmNumber,
      skUmkmExpiry: dto.skUmkmExpiry ? new Date(dto.skUmkmExpiry) : undefined,

      // Status
      status: StatusBuktiBayar.DRAFT,

      // Audit
      createdBy: currentUser.id,
    };

    const voucher = this.voucherRepo.create(voucherData);

    const saved = await this.voucherRepo.save(voucher);

    // 7. Create audit log
    await this.addAuditLog(
      saved.id,
      VoucherAuditAction.CREATED,
      null,
      StatusBuktiBayar.DRAFT,
      currentUser.id,
    );

    this.logger.log(`Created payment voucher ${saved.voucherNumber} by user ${currentUser.id}`);

    return this.findOne(saved.id);
  }

  /**
   * Find all payment vouchers with filtering and pagination
   */
  async findAll(
    query: QueryPaymentVoucherDto,
    currentUser: any,
  ): Promise<PaginatedResult<PaymentVoucher>> {
    const { page = 1, limit = 20, sortBy = 'voucherDate', sortOrder = 'DESC' } = query;

    const qb = this.voucherRepo
      .createQueryBuilder('pv')
      .where('pv.deletedAt IS NULL');

    // Role-based filtering: PPTK only sees their own vouchers
    if (currentUser.role === 'PPTK') {
      qb.andWhere('pv.pptkId = :pptkId', { pptkId: currentUser.id });
    }

    // Apply filters
    if (query.fiscalYear) {
      qb.andWhere('pv.fiscalYear = :fiscalYear', { fiscalYear: query.fiscalYear });
    }

    if (query.month) {
      qb.andWhere('pv.voucherMonth = :month', { month: query.month });
    }

    if (query.status) {
      qb.andWhere('pv.status = :status', { status: query.status });
    }

    if (query.accountCode) {
      qb.andWhere('pv.accountCode LIKE :accountCode', {
        accountCode: `${query.accountCode}%`,
      });
    }

    if (query.pptkId) {
      qb.andWhere('pv.pptkId = :pptkId', { pptkId: query.pptkId });
    }

    if (query.vendorName) {
      qb.andWhere('pv.vendorName ILIKE :vendorName', {
        vendorName: `%${query.vendorName}%`,
      });
    }

    if (query.kegiatanId) {
      qb.andWhere('pv.kegiatanId = :kegiatanId', { kegiatanId: query.kegiatanId });
    }

    if (query.subKegiatanId) {
      qb.andWhere('pv.subKegiatanId = :subKegiatanId', {
        subKegiatanId: query.subKegiatanId,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('pv.voucherDate >= :dateFrom', { dateFrom: query.dateFrom });
    }

    if (query.dateTo) {
      qb.andWhere('pv.voucherDate <= :dateTo', { dateTo: query.dateTo });
    }

    if (query.voucherNumber) {
      qb.andWhere('pv.voucherNumber LIKE :voucherNumber', {
        voucherNumber: `%${query.voucherNumber}%`,
      });
    }

    // Sorting
    const sortField = `pv.${sortBy}`;
    qb.orderBy(sortField, sortOrder);

    // Pagination
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find one payment voucher by ID
   */
  async findOne(id: string): Promise<PaymentVoucher> {
    const voucher = await this.voucherRepo.findOne({
      where: { id },
      withDeleted: false,
      relations: ['attachments', 'auditLogs'],
    });

    if (!voucher) {
      throw new NotFoundException(`Payment voucher dengan ID ${id} tidak ditemukan`);
    }

    return voucher;
  }

  /**
   * Update payment voucher (only when DRAFT)
   */
  async update(
    id: string,
    dto: UpdatePaymentVoucherDto,
    currentUser: any,
  ): Promise<PaymentVoucher> {
    const voucher = await this.findOne(id);

    // Only editable when DRAFT
    if (voucher.status !== StatusBuktiBayar.DRAFT) {
      throw new BadRequestException('Hanya voucher berstatus DRAFT yang bisa diubah');
    }

    // If grossAmount or accountCode changed, re-validate budget
    if (dto.grossAmount !== undefined || dto.accountCode !== undefined) {
      const budgetValidation = await this.budgetSvc.validate({
        kegiatanId: dto.kegiatanId || voucher.kegiatanId,
        subKegiatanId: dto.subKegiatanId || voucher.subKegiatanId,
        accountCode: dto.accountCode || voucher.accountCode,
        fiscalYear: voucher.fiscalYear,
        voucherMonth: voucher.voucherMonth,
        grossAmount: dto.grossAmount || voucher.grossAmount,
        excludeVoucherId: id,
      });

      if (!budgetValidation.isValid) {
        throw new BadRequestException(budgetValidation.message);
      }

      // Recalculate tax if grossAmount or accountCode changed
      if (dto.grossAmount !== undefined || dto.accountCode !== undefined) {
        const taxResult = await this.taxSvc.calculate({
          accountCode: dto.accountCode || voucher.accountCode,
          grossAmount: dto.grossAmount || voucher.grossAmount,
          vendorNpwp: dto.vendorNpwp || voucher.vendorNpwp,
        });

        Object.assign(voucher, {
          pph21Rate: taxResult.pph21Rate,
          pph21Amount: taxResult.pph21Amount,
          pph22Rate: taxResult.pph22Rate,
          pph22Amount: taxResult.pph22Amount,
          pph23Rate: taxResult.pph23Rate,
          pph23Amount: taxResult.pph23Amount,
          pph4a2Rate: taxResult.pph4a2Rate,
          pph4a2Amount: taxResult.pph4a2Amount,
          pphFinalUmkmRate: taxResult.pphFinalUmkmRate,
          pphFinalUmkmAmount: taxResult.pphFinalUmkmAmount,
          pph24Rate: taxResult.pph24Rate,
          pph24Amount: taxResult.pph24Amount,
          ppnRate: taxResult.ppnRate,
          ppnAmount: taxResult.ppnAmount,
          grossAmountText: taxResult.grossAmountText,
        });
      }
    }

    // Update fields
    Object.assign(voucher, dto);
    voucher.updatedBy = currentUser.id;

    const saved = await this.voucherRepo.save(voucher);

    // Add audit log
    await this.addAuditLog(
      saved.id,
      VoucherAuditAction.UPDATED,
      StatusBuktiBayar.DRAFT,
      StatusBuktiBayar.DRAFT,
      currentUser.id,
    );

    this.logger.log(`Updated payment voucher ${saved.voucherNumber}`);

    return this.findOne(saved.id);
  }

  /**
   * Soft delete payment voucher (only when DRAFT)
   */
  async delete(id: string, currentUser: any): Promise<void> {
    const voucher = await this.findOne(id);

    // Only deletable when DRAFT
    if (voucher.status !== StatusBuktiBayar.DRAFT) {
      throw new BadRequestException('Hanya voucher berstatus DRAFT yang bisa dihapus');
    }

    voucher.deletedBy = currentUser.id;
    await this.voucherRepo.softRemove(voucher);

    // Add audit log
    await this.addAuditLog(
      id,
      VoucherAuditAction.DELETED,
      StatusBuktiBayar.DRAFT,
      null,
      currentUser.id,
    );

    this.logger.log(`Deleted payment voucher ${voucher.voucherNumber}`);
  }

  /**
   * Finalize voucher (DRAFT → FINAL)
   */
  async finalize(id: string, currentUser: any): Promise<PaymentVoucher> {
    const voucher = await this.findOne(id);

    // Only creator (PPTK) can finalize
    if (voucher.pptkId !== currentUser.id) {
      throw new BadRequestException('Hanya pembuat voucher yang bisa finalisasi');
    }

    // Only finalizable when DRAFT
    if (voucher.status !== StatusBuktiBayar.DRAFT) {
      throw new BadRequestException('Hanya voucher berstatus DRAFT yang bisa difinalisasi');
    }

    // Re-validate budget (in case pagu changed)
    const budgetValidation = await this.budgetSvc.validate({
      kegiatanId: voucher.kegiatanId,
      subKegiatanId: voucher.subKegiatanId,
      accountCode: voucher.accountCode,
      fiscalYear: voucher.fiscalYear,
      voucherMonth: voucher.voucherMonth,
      grossAmount: voucher.grossAmount,
      excludeVoucherId: id,
    });

    if (!budgetValidation.isValid) {
      throw new BadRequestException(budgetValidation.message);
    }

    const oldStatus = voucher.status;
    voucher.status = StatusBuktiBayar.FINAL;
    voucher.updatedBy = currentUser.id;

    const saved = await this.voucherRepo.save(voucher);

    await this.addAuditLog(
      saved.id,
      VoucherAuditAction.UPDATED,
      oldStatus,
      StatusBuktiBayar.FINAL,
      currentUser.id,
      'Voucher difinalisasi',
    );

    this.logger.log(`Finalized payment voucher ${saved.voucherNumber}`);

    return this.findOne(saved.id);
  }

  /**
   * Add audit log entry
   */
  private async addAuditLog(
    voucherId: string,
    action: VoucherAuditAction,
    oldStatus: StatusBuktiBayar | null,
    newStatus: StatusBuktiBayar | null,
    userId: string,
    notes?: string,
  ): Promise<void> {
    const auditLogData: Partial<PaymentVoucherAuditLog> = {
      voucherId,
      action,
      oldStatus: oldStatus ?? undefined,
      newStatus: newStatus ?? undefined,
      performedBy: userId,
      notes,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    const auditLog = this.auditRepo.create(auditLogData);
    await this.auditRepo.save(auditLog);
  }
}