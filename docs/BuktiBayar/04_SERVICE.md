# 04 - Service Layer
## Modul Bukti Pembayaran | SI-KANCIL

---

## 4.1 Tax Calculation Service

**File:** `services/tax-calculation.service.ts`

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaxRule } from '../entities/tax-rule.entity';

export interface TaxInput {
  accountCode: string;
  grossAmount: number;
  vendorNpwp?: string;
  transactionDate?: Date;
}

export interface TaxResult {
  taxRuleId: string;
  pph21Rate: number;  pph21Amount: number;
  pph22Rate: number;  pph22Amount: number;
  pph23Rate: number;  pph23Amount: number;
  pph24Rate: number;  pph24Amount: number;
  ppnRate: number;    ppnAmount: number;
  totalDeductions: number;
  netPayment: number;
  grossAmountText: string;
}

@Injectable()
export class TaxCalculationService {
  constructor(
    @InjectRepository(TaxRule)
    private taxRuleRepo: Repository<TaxRule>,
  ) {}

  async calculate(input: TaxInput): Promise<TaxResult> {
    const date = input.transactionDate ?? new Date();

    // 1. Cari tax rule yang sesuai (paling spesifik)
    const rule = await this.findBestMatchRule(input.accountCode, date);

    // 2. Hitung tiap komponen pajak
    const ppnAmount  = this.round(input.grossAmount * rule.ppnRate  / 100);
    const pph21Amount = this.round(input.grossAmount * rule.pph21Rate / 100);
    const pph22Amount = this.round(input.grossAmount * rule.pph22Rate / 100);
    const pph24Amount = this.round(input.grossAmount * rule.pph24Rate / 100);

    // PPh 23: tarif dobel jika vendor tanpa NPWP
    const pph23Rate = (!input.vendorNpwp && rule.pph23Rate > 0)
      ? rule.pph23Rate * 2
      : rule.pph23Rate;
    const pph23Amount = this.round(input.grossAmount * pph23Rate / 100);

    const totalDeductions = ppnAmount + pph21Amount + pph22Amount + pph23Amount + pph24Amount;
    const netPayment = input.grossAmount - totalDeductions;

    return {
      taxRuleId: rule.id,
      pph21Rate: rule.pph21Rate, pph21Amount,
      pph22Rate: rule.pph22Rate, pph22Amount,
      pph23Rate,                 pph23Amount,
      pph24Rate: rule.pph24Rate, pph24Amount,
      ppnRate: rule.ppnRate,     ppnAmount,
      totalDeductions,
      netPayment,
      grossAmountText: this.toTerbilang(input.grossAmount),
    };
  }

  private async findBestMatchRule(accountCode: string, date: Date): Promise<TaxRule> {
    // Cari rule dengan pattern matching terpanjang (paling spesifik)
    const allRules = await this.taxRuleRepo.find({
      where: { isActive: true },
      order: { accountCodePattern: 'DESC' }, // longer pattern = more specific
    });

    // Filter by date dan pattern
    const matching = allRules.filter(rule => {
      const matchPattern = accountCode.startsWith(rule.accountCodePattern);
      const afterFrom  = date >= new Date(rule.effectiveFrom);
      const beforeTo   = !rule.effectiveTo || date <= new Date(rule.effectiveTo);
      return matchPattern && afterFrom && beforeTo;
    });

    if (matching.length === 0) {
      // Default: no tax rule (non-taxable)
      return {
        id: null,
        accountCodePattern: accountCode,
        ppnRate: 0, pph21Rate: 0, pph22Rate: 0,
        pph23Rate: 0, pph24Rate: 0,
      } as TaxRule;
    }

    // Return paling spesifik (pattern terpanjang)
    return matching.sort((a, b) =>
      b.accountCodePattern.length - a.accountCodePattern.length
    )[0];
  }

  // ── Terbilang Generator ───────────────────────────────────────
  toTerbilang(amount: number): string {
    if (amount === 0) return 'Nol Rupiah';

    const satuan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
                    'Enam', 'Tujuh', 'Delapan', 'Sembilan'];
    const belasan = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas',
                     'Empat Belas', 'Lima Belas', 'Enam Belas',
                     'Tujuh Belas', 'Delapan Belas', 'Sembilan Belas'];
    const puluhan = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh',
                     'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh',
                     'Delapan Puluh', 'Sembilan Puluh'];

    const tiga = (n: number): string => {
      if (n === 0) return '';
      if (n < 10) return satuan[n];
      if (n < 20) return belasan[n - 10];
      if (n < 100) {
        const sisa = n % 10;
        return puluhan[Math.floor(n / 10)] + (sisa ? ' ' + satuan[sisa] : '');
      }
      const ratus = Math.floor(n / 100);
      const sisa  = n % 100;
      const ratusStr = ratus === 1 ? 'Seratus' : satuan[ratus] + ' Ratus';
      return ratusStr + (sisa ? ' ' + tiga(sisa) : '');
    };

    const parts: string[] = [];
    const triliun = Math.floor(amount / 1_000_000_000_000);
    const miliar  = Math.floor((amount % 1_000_000_000_000) / 1_000_000_000);
    const juta    = Math.floor((amount % 1_000_000_000) / 1_000_000);
    const ribu    = Math.floor((amount % 1_000_000) / 1_000);
    const sisa    = amount % 1_000;

    if (triliun > 0) parts.push(tiga(triliun) + ' Triliun');
    if (miliar  > 0) parts.push(tiga(miliar)  + ' Miliar');
    if (juta    > 0) parts.push(tiga(juta)    + ' Juta');
    if (ribu    === 1) parts.push('Seribu');
    else if (ribu > 1) parts.push(tiga(ribu) + ' Ribu');
    if (sisa    > 0) parts.push(tiga(sisa));

    return parts.join(' ') + ' Rupiah';
  }

  private round(val: number): number {
    return Math.round(val);
  }
}
```

---

## 4.2 Budget Validation Service

**File:** `services/budget-validation.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentVoucher, VoucherStatus } from '../entities/payment-voucher.entity';

export interface BudgetValidationInput {
  kegiatanId: string;
  subKegiatanId?: string;
  accountCode: string;
  grossAmount: number;
  fiscalYear: number;
  month: number;
  excludeVoucherId?: string; // Saat update: exclude BB itu sendiri
}

export interface BudgetValidationResult {
  isValid: boolean;
  totalPagu: number;
  totalRealization: number;
  previousCommitments: number;
  availablePagu: number;
  rakMonthlyLimit: number;
  remainingRak: number;
  message?: string;
}

@Injectable()
export class BudgetValidationService {
  constructor(
    @InjectRepository(PaymentVoucher)
    private voucherRepo: Repository<PaymentVoucher>,
  ) {}

  async validate(input: BudgetValidationInput): Promise<BudgetValidationResult> {
    // 1. Get Pagu dari RBA (melalui query ke tabel rba_details)
    const totalPagu = await this.getPagu(
      input.kegiatanId,
      input.subKegiatanId,
      input.accountCode,
      input.fiscalYear,
    );

    // 2. Get RAK limit bulan ini
    const rakMonthlyLimit = await this.getRakLimit(
      input.kegiatanId,
      input.month,
      input.fiscalYear,
    );

    // 3. Hitung realisasi (SPM/SP2D yang sudah approved)
    const totalRealization = await this.getRealization(
      input.kegiatanId,
      input.accountCode,
      input.fiscalYear,
    );

    // 4. Hitung komitmen (BB yang sudah SUBMITTED/APPROVED, belum jadi SPP)
    const previousCommitments = await this.getCommitments(
      input.kegiatanId,
      input.accountCode,
      input.fiscalYear,
      input.excludeVoucherId,
    );

    const availablePagu = totalPagu - totalRealization - previousCommitments;
    const remainingRak  = rakMonthlyLimit - totalRealization - previousCommitments;

    // 5. Validasi
    if (input.grossAmount > availablePagu) {
      return {
        isValid: false,
        totalPagu, totalRealization, previousCommitments,
        availablePagu, rakMonthlyLimit, remainingRak,
        message: this.formatMessage(
          'Pagu tidak mencukupi',
          totalPagu, totalRealization, previousCommitments,
          availablePagu, input.grossAmount,
        ),
      };
    }

    if (rakMonthlyLimit > 0 && input.grossAmount > remainingRak) {
      return {
        isValid: false,
        totalPagu, totalRealization, previousCommitments,
        availablePagu, rakMonthlyLimit, remainingRak,
        message: this.formatMessage(
          `Melebihi limit RAK bulan ini`,
          rakMonthlyLimit, totalRealization, previousCommitments,
          remainingRak, input.grossAmount,
        ),
      };
    }

    return {
      isValid: true,
      totalPagu, totalRealization, previousCommitments,
      availablePagu, rakMonthlyLimit, remainingRak,
    };
  }

  private async getPagu(
    kegiatanId: string,
    subKegiatanId: string | undefined,
    accountCode: string,
    fiscalYear: number,
  ): Promise<number> {
    // Query ke tabel rba_details untuk mendapat pagu
    // Sesuaikan dengan struktur tabel RBA yang ada
    const result = await this.voucherRepo.manager.query(`
      SELECT COALESCE(SUM(rd.amount), 0) AS total_pagu
      FROM rba_details rd
      WHERE rd.kegiatan_id   = $1
        AND rd.account_code  = $2
        AND rd.fiscal_year   = $3
        ${subKegiatanId ? 'AND rd.output_id = $4' : ''}
    `, subKegiatanId
      ? [kegiatanId, accountCode, fiscalYear, subKegiatanId]
      : [kegiatanId, accountCode, fiscalYear]);

    return Number(result[0]?.total_pagu ?? 0);
  }

  private async getRakLimit(
    kegiatanId: string,
    month: number,
    fiscalYear: number,
  ): Promise<number> {
    const result = await this.voucherRepo.manager.query(`
      SELECT COALESCE(SUM(rak.planned_amount), 0) AS total_rak
      FROM rak_details rak
      WHERE rak.kegiatan_id   = $1
        AND rak.fiscal_year   = $2
        AND rak.month         = $3
        AND rak.status        = 'APPROVED'
    `, [kegiatanId, fiscalYear, month]);

    return Number(result[0]?.total_rak ?? 0);
  }

  private async getRealization(
    kegiatanId: string,
    accountCode: string,
    fiscalYear: number,
  ): Promise<number> {
    const result = await this.voucherRepo.manager.query(`
      SELECT COALESCE(SUM(spm.amount), 0) AS total_real
      FROM spm_documents spm
      WHERE spm.kegiatan_id  = $1
        AND spm.account_code = $2
        AND spm.fiscal_year  = $3
        AND spm.status IN ('APPROVED', 'SP2D_ISSUED')
        AND spm.deleted_at IS NULL
    `, [kegiatanId, accountCode, fiscalYear]);

    return Number(result[0]?.total_real ?? 0);
  }

  private async getCommitments(
    kegiatanId: string,
    accountCode: string,
    fiscalYear: number,
    excludeId?: string,
  ): Promise<number> {
    const qb = this.voucherRepo
      .createQueryBuilder('pv')
      .select('COALESCE(SUM(pv.gross_amount), 0)', 'total')
      .where('pv.kegiatan_id = :kId', { kId: kegiatanId })
      .andWhere('pv.account_code = :ac', { ac: accountCode })
      .andWhere('pv.fiscal_year = :fy', { fy: fiscalYear })
      .andWhere('pv.status IN (:...statuses)', {
        statuses: [VoucherStatus.SUBMITTED, VoucherStatus.APPROVED],
      })
      .andWhere('pv.spp_id IS NULL')
      .andWhere('pv.deleted_at IS NULL');

    if (excludeId) {
      qb.andWhere('pv.id != :excludeId', { excludeId });
    }

    const result = await qb.getRawOne();
    return Number(result?.total ?? 0);
  }

  private formatMessage(
    reason: string,
    limit: number,
    realization: number,
    commitment: number,
    available: number,
    requested: number,
  ): string {
    const fmt = (n: number) => `Rp ${n.toLocaleString('id-ID')}`;
    return [
      `❌ ${reason}!`,
      `  Batas   : ${fmt(limit)}`,
      `  Realisasi: ${fmt(realization)}`,
      `  Komitmen : ${fmt(commitment)}`,
      `  Tersedia : ${fmt(available)}`,
      `  Diminta  : ${fmt(requested)}`,
    ].join('\n');
  }
}
```

---

## 4.3 Voucher Numbering Service

**File:** `services/voucher-numbering.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface NumberingResult {
  voucherNumber: string;
  sequenceNumber: number;
}

@Injectable()
export class VoucherNumberingService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async generate(
    fiscalYear: number,
    month: number,
    accountCode: string,
    unitCode: string = 'RSUD-DS',
  ): Promise<NumberingResult> {
    const result = await this.dataSource.query(
      `SELECT * FROM generate_voucher_number($1, $2, $3, $4)`,
      [fiscalYear, month, accountCode, unitCode],
    );

    return {
      voucherNumber:  result[0].voucher_number,
      sequenceNumber: result[0].sequence_number,
    };
  }

  // Untuk testing/preview format
  preview(sequence: number, accountCode: string, month: number, fiscalYear: number, unit = 'RSUD-DS'): string {
    const seq = String(sequence).padStart(4, '0');
    const mon = String(month).padStart(2, '0');
    return `${seq}/${accountCode}/${mon}/${unit}/${fiscalYear}`;
  }
}
```

---

## 4.4 Main BuktiBayar Service

**File:** `bukti-bayar.service.ts`

```typescript
import {
  Injectable, BadRequestException, NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaymentVoucher, VoucherStatus } from './entities/payment-voucher.entity';
import { PaymentVoucherAuditLog, AuditAction } from './entities/payment-voucher-audit-log.entity';
import { CreatePaymentVoucherDto }  from './dto/create-payment-voucher.dto';
import { QueryPaymentVoucherDto }   from './dto/query-payment-voucher.dto';
import { ApproveTechnicalDto, ApproveTreasurerDto, ApproveFinalDto, RejectPaymentVoucherDto }
  from './dto/approve-payment-voucher.dto';

import { TaxCalculationService }   from './services/tax-calculation.service';
import { BudgetValidationService } from './services/budget-validation.service';
import { VoucherNumberingService } from './services/voucher-numbering.service';

@Injectable()
export class BuktiBayarService {
  constructor(
    @InjectRepository(PaymentVoucher)
    private voucherRepo: Repository<PaymentVoucher>,

    @InjectRepository(PaymentVoucherAuditLog)
    private auditRepo: Repository<PaymentVoucherAuditLog>,

    private taxSvc: TaxCalculationService,
    private budgetSvc: BudgetValidationService,
    private numberingSvc: VoucherNumberingService,
  ) {}

  // ── CREATE ────────────────────────────────────────────────────
  async create(dto: CreatePaymentVoucherDto, currentUser: any): Promise<PaymentVoucher> {
    const vDate = new Date(dto.voucherDate);
    const month = vDate.getMonth() + 1;

    // 1. Validasi Budget
    const budgetCheck = await this.budgetSvc.validate({
      kegiatanId:   dto.kegiatanId,
      subKegiatanId: dto.subKegiatanId,
      accountCode:  dto.accountCode,
      grossAmount:  dto.grossAmount,
      fiscalYear:   dto.fiscalYear,
      month,
    });

    if (!budgetCheck.isValid) {
      throw new BadRequestException(budgetCheck.message);
    }

    // 2. Hitung Pajak (auto dari accountCode)
    const tax = await this.taxSvc.calculate({
      accountCode:     dto.accountCode,
      grossAmount:     dto.grossAmount,
      vendorNpwp:      dto.vendorNpwp,
      transactionDate: vDate,
    });

    // Override jika user suplai nilai manual
    const finalTax = {
      ppnRate:   dto.ppnRate   ?? tax.ppnRate,
      ppnAmount: dto.ppnAmount ?? tax.ppnAmount,
      pph22Rate: dto.pph22Rate ?? tax.pph22Rate,
      pph22Amount: dto.pph22Amount ?? tax.pph22Amount,
      pph23Rate: dto.pph23Rate ?? tax.pph23Rate,
      pph23Amount: dto.pph23Amount ?? tax.pph23Amount,
      otherDeductions: dto.otherDeductions ?? 0,
    };

    // 3. Generate Nomor Bukti
    const { voucherNumber, sequenceNumber } = await this.numberingSvc.generate(
      dto.fiscalYear,
      month,
      dto.accountCode,
      dto.unitCode ?? 'RSUD-DS',
    );

    // 4. Set default payeeName
    const payeeName = dto.payeeName
      ?? `BENDAHARA PENGELUARAN ${dto.unitCode ?? 'RSUD DATU SANGGUL RANTAU'}`;

    // 5. Create entity
    const voucher = this.voucherRepo.create({
      voucherNumber,
      voucherSequence: sequenceNumber,
      fiscalYear:    dto.fiscalYear,
      voucherMonth:  month,
      voucherDate:   vDate,
      unitCode:      dto.unitCode ?? 'RSUD-DS',

      programId:   dto.programId,
      programCode: dto.programCode,
      programName: dto.programName,

      kegiatanId:   dto.kegiatanId,
      kegiatanCode: dto.kegiatanCode,
      kegiatanName: dto.kegiatanName,

      subKegiatanId:   dto.subKegiatanId,
      subKegiatanCode: dto.subKegiatanCode,
      subKegiatanName: dto.subKegiatanName,

      accountCode: dto.accountCode,
      accountName: dto.accountName,

      availablePagu:       budgetCheck.availablePagu,
      rakMonthlyLimit:     budgetCheck.rakMonthlyLimit,
      previousCommitments: budgetCheck.previousCommitments,

      pptkId: currentUser.id,

      payeeName,
      paymentPurpose: dto.paymentPurpose,
      vendorName:     dto.vendorName,
      vendorNpwp:     dto.vendorNpwp,
      vendorAddress:  dto.vendorAddress,
      invoiceNumbers: dto.invoiceNumbers,
      invoiceDate:    dto.invoiceDate ? new Date(dto.invoiceDate) : null,

      grossAmount:    dto.grossAmount,
      taxRuleId:      tax.taxRuleId,

      ...finalTax,

      grossAmountText: tax.grossAmountText,

      status:    VoucherStatus.DRAFT,
      createdBy: currentUser.id,
    });

    const saved = await this.voucherRepo.save(voucher);

    // 6. Audit log
    await this.addAuditLog(saved.id, AuditAction.CREATED, null, VoucherStatus.DRAFT, currentUser.id);

    return saved;
  }

  // ── SUBMIT ────────────────────────────────────────────────────
  async submit(id: string, currentUser: any): Promise<PaymentVoucher> {
    const voucher = await this.findOneOrFail(id);

    if (voucher.pptkId !== currentUser.id) {
      throw new ForbiddenException('Hanya PPTK yang membuat BB yang bisa submit');
    }

    if (voucher.status !== VoucherStatus.DRAFT) {
      throw new BadRequestException(`Status harus DRAFT, bukan ${voucher.status}`);
    }

    // Re-validasi budget saat submit
    const budgetCheck = await this.budgetSvc.validate({
      kegiatanId:  voucher.kegiatanId,
      accountCode: voucher.accountCode,
      grossAmount: voucher.grossAmount,
      fiscalYear:  voucher.fiscalYear,
      month:       voucher.voucherMonth,
      excludeVoucherId: id,
    });

    if (!budgetCheck.isValid) {
      throw new BadRequestException(`Pagu berubah: ${budgetCheck.message}`);
    }

    const old = voucher.status;
    voucher.status    = VoucherStatus.SUBMITTED;
    voucher.updatedBy = currentUser.id;

    const saved = await this.voucherRepo.save(voucher);
    await this.addAuditLog(id, AuditAction.SUBMITTED, old, VoucherStatus.SUBMITTED, currentUser.id);
    return saved;
  }

  // ── APPROVE TECHNICAL ─────────────────────────────────────────
  async approveTechnical(id: string, dto: ApproveTechnicalDto, currentUser: any): Promise<PaymentVoucher> {
    const voucher = await this.findOneOrFail(id);
    this.assertStatus(voucher, VoucherStatus.SUBMITTED);

    const old = voucher.status;
    voucher.technicalOfficerId   = currentUser.id;
    voucher.technicalOfficerName = currentUser.name;
    voucher.technicalOfficerNip  = currentUser.nip;
    voucher.technicalSignedAt    = new Date();
    voucher.technicalNotes       = dto.notes;
    voucher.status    = VoucherStatus.APPROVED; // atau tambah status PENDING_TREASURER
    voucher.updatedBy = currentUser.id;

    const saved = await this.voucherRepo.save(voucher);
    await this.addAuditLog(id, AuditAction.APPROVED_TECHNICAL, old, voucher.status, currentUser.id, dto.notes);
    return saved;
  }

  // ── APPROVE TREASURER ─────────────────────────────────────────
  async approveTreasurer(id: string, dto: ApproveTreasurerDto, currentUser: any): Promise<PaymentVoucher> {
    const voucher = await this.findOneOrFail(id);

    voucher.treasurerId   = currentUser.id;
    voucher.treasurerName = currentUser.name;
    voucher.treasurerNip  = currentUser.nip;
    voucher.treasurerSignedAt = new Date();
    voucher.treasurerNotes    = dto.notes;
    voucher.updatedBy = currentUser.id;

    return this.voucherRepo.save(voucher);
  }

  // ── APPROVE FINAL (DIREKTUR) ──────────────────────────────────
  async approveFinal(id: string, dto: ApproveFinalDto, currentUser: any): Promise<PaymentVoucher> {
    const voucher = await this.findOneOrFail(id);

    const old = voucher.status;
    voucher.approverId   = currentUser.id;
    voucher.approverName = currentUser.name;
    voucher.approverNip  = currentUser.nip;
    voucher.approverSignedAt = new Date();
    voucher.status    = VoucherStatus.APPROVED;
    voucher.updatedBy = currentUser.id;

    const saved = await this.voucherRepo.save(voucher);
    await this.addAuditLog(id, AuditAction.APPROVED_FINAL, old, VoucherStatus.APPROVED, currentUser.id);
    return saved;
  }

  // ── REJECT ────────────────────────────────────────────────────
  async reject(id: string, dto: RejectPaymentVoucherDto, currentUser: any): Promise<PaymentVoucher> {
    const voucher = await this.findOneOrFail(id);

    if (![VoucherStatus.SUBMITTED, VoucherStatus.APPROVED].includes(voucher.status)) {
      throw new BadRequestException('Hanya SUBMITTED atau APPROVED yang bisa di-reject');
    }

    const old = voucher.status;
    voucher.status          = VoucherStatus.REJECTED;
    voucher.rejectionReason = dto.rejectionReason;
    voucher.rejectionBy     = currentUser.id;
    voucher.rejectedAt      = new Date();
    voucher.updatedBy       = currentUser.id;

    const saved = await this.voucherRepo.save(voucher);
    await this.addAuditLog(id, AuditAction.REJECTED, old, VoucherStatus.REJECTED, currentUser.id, dto.rejectionReason);
    return saved;
  }

  // ── LIST ──────────────────────────────────────────────────────
  async findAll(query: QueryPaymentVoucherDto, currentUser: any) {
    const qb = this.voucherRepo
      .createQueryBuilder('pv')
      .leftJoinAndSelect('pv.pptk', 'pptk')
      .where('pv.deleted_at IS NULL');

    // PPTK hanya lihat miliknya
    if (currentUser.role === 'PPTK') {
      qb.andWhere('pv.pptk_id = :uid', { uid: currentUser.id });
    }

    if (query.fiscalYear)  qb.andWhere('pv.fiscal_year = :fy',      { fy: query.fiscalYear });
    if (query.month)       qb.andWhere('pv.voucher_month = :m',     { m: query.month });
    if (query.status)      qb.andWhere('pv.status = :s',            { s: query.status });
    if (query.accountCode) qb.andWhere('pv.account_code ILIKE :ac', { ac: `%${query.accountCode}%` });
    if (query.pptkId)      qb.andWhere('pv.pptk_id = :pid',         { pid: query.pptkId });
    if (query.vendorName)  qb.andWhere('pv.vendor_name ILIKE :vn',  { vn: `%${query.vendorName}%` });
    if (query.kegiatanId)  qb.andWhere('pv.kegiatan_id = :kid',     { kid: query.kegiatanId });
    if (query.dateFrom)    qb.andWhere('pv.voucher_date >= :df',    { df: query.dateFrom });
    if (query.dateTo)      qb.andWhere('pv.voucher_date <= :dt',    { dt: query.dateTo });

    const sortField = query.sortBy ?? 'voucher_date';
    qb.orderBy(`pv.${sortField}`, query.sortOrder ?? 'DESC');

    const page  = query.page  ?? 1;
    const limit = query.limit ?? 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── DETAIL ────────────────────────────────────────────────────
  async findOne(id: string): Promise<PaymentVoucher> {
    return this.findOneOrFail(id, ['pptk', 'attachments', 'auditLogs']);
  }

  // ── SOFT DELETE ───────────────────────────────────────────────
  async remove(id: string, currentUser: any): Promise<void> {
    const voucher = await this.findOneOrFail(id);

    if (voucher.status !== VoucherStatus.DRAFT) {
      throw new BadRequestException('Hanya DRAFT yang bisa dihapus');
    }

    voucher.deletedBy = currentUser.id;
    voucher.deletedAt = new Date();
    await this.voucherRepo.save(voucher);
  }

  // ── HELPERS ───────────────────────────────────────────────────
  private async findOneOrFail(id: string, relations: string[] = []): Promise<PaymentVoucher> {
    const voucher = await this.voucherRepo.findOne({ where: { id }, relations });
    if (!voucher) throw new NotFoundException(`Bukti Pembayaran ID ${id} tidak ditemukan`);
    return voucher;
  }

  private assertStatus(voucher: PaymentVoucher, ...expected: VoucherStatus[]): void {
    if (!expected.includes(voucher.status)) {
      throw new BadRequestException(
        `Status harus ${expected.join(' atau ')}, bukan ${voucher.status}`,
      );
    }
  }

  private async addAuditLog(
    voucherId: string,
    action: AuditAction,
    oldStatus: string,
    newStatus: string,
    userId: string,
    notes?: string,
  ): Promise<void> {
    await this.auditRepo.save(
      this.auditRepo.create({ voucherId, action, oldStatus, newStatus, performedBy: userId, notes }),
    );
  }
}
```
