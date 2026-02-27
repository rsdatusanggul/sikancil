# 03 - DTOs (Data Transfer Objects)
## Modul Bukti Pembayaran | SI-KANCIL

---

### `create-payment-voucher.dto.ts`

```typescript
import {
  IsString, IsNumber, IsDateString, IsOptional, IsUUID,
  IsArray, IsPositive, Min, MaxLength, IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentVoucherDto {
  // ── Identitas ─────────────────────────────────────────────────
  @ApiProperty({ example: '2025-01-15', description: 'Tanggal bukti pembayaran' })
  @IsDateString()
  voucherDate: string;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  fiscalYear: number;

  @ApiPropertyOptional({ example: 'RSUD-DS' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  unitCode?: string;

  // ── Hierarki Anggaran ─────────────────────────────────────────
  @ApiProperty({ example: 'uuid-program' })
  @IsUUID()
  programId: string;

  @ApiProperty({ example: '01.02.02' })
  @IsString()
  programCode: string;

  @ApiPropertyOptional({ example: 'Penyelenggaraan Rumah Sakit' })
  @IsOptional()
  @IsString()
  programName?: string;

  @ApiProperty({ example: 'uuid-kegiatan' })
  @IsUUID()
  kegiatanId: string;

  @ApiProperty({ example: '1.02.02.2.02' })
  @IsString()
  kegiatanCode: string;

  @ApiPropertyOptional({ example: 'Pelayanan Kesehatan Rujukan' })
  @IsOptional()
  @IsString()
  kegiatanName?: string;

  @ApiPropertyOptional({ example: 'uuid-sub-kegiatan' })
  @IsOptional()
  @IsUUID()
  subKegiatanId?: string;

  @ApiPropertyOptional({ example: '1.02.02.2.02.032' })
  @IsOptional()
  @IsString()
  subKegiatanCode?: string;

  @ApiPropertyOptional({ example: 'Pelayanan Kesehatan Rawat Inap' })
  @IsOptional()
  @IsString()
  subKegiatanName?: string;

  @ApiProperty({ example: '5.2.02.10.01.0003' })
  @IsString()
  @IsNotEmpty()
  accountCode: string;

  @ApiProperty({ example: 'Belanja Obat-obatan' })
  @IsString()
  @IsNotEmpty()
  accountName: string;

  // ── Detail Pembayaran ─────────────────────────────────────────
  @ApiPropertyOptional({ example: 'BENDAHARA PENGELUARAN RSUD DATU SANGGUL RANTAU' })
  @IsOptional()
  @IsString()
  payeeName?: string;

  @ApiProperty({ example: 'Pembayaran Belanja BMHP PT. MENSA BINA SUKSES Invoice CD250967456' })
  @IsString()
  @IsNotEmpty()
  paymentPurpose: string;

  @ApiPropertyOptional({ example: 'PT. MENSA BINA SUKSES' })
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional({ example: '01.234.567.8-901.000' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  vendorNpwp?: string;

  @ApiPropertyOptional({ example: 'Jl. Sudirman No.1, Jakarta' })
  @IsOptional()
  @IsString()
  vendorAddress?: string;

  @ApiPropertyOptional({
    example: ['CD250967456', 'CD250967457'],
    description: 'Array nomor invoice/faktur'
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  invoiceNumbers?: string[];

  @ApiPropertyOptional({ example: '2025-01-10' })
  @IsOptional()
  @IsDateString()
  invoiceDate?: string;

  // ── Jumlah ────────────────────────────────────────────────────
  @ApiProperty({ example: 18938178, description: 'Total tagihan GROSS dari vendor' })
  @IsNumber()
  @IsPositive()
  grossAmount: number;

  // ── Pajak (Optional - auto-calculated dari accountCode) ───────
  // Jika tidak disuplai, system akan auto-calculate dari tax_rules
  @ApiPropertyOptional({ example: 11.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ppnRate?: number;

  @ApiPropertyOptional({ example: 1876757 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  ppnAmount?: number;

  @ApiPropertyOptional({ example: 1.50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pph22Rate?: number;

  @ApiPropertyOptional({ example: 255921 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pph22Amount?: number;

  @ApiPropertyOptional({ example: 2.00 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  pph23Rate?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  pph23Amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  otherDeductions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  otherDeductionsNote?: string;
}
```

---

### `query-payment-voucher.dto.ts`

```typescript
import { IsOptional, IsString, IsNumber, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { VoucherStatus } from '../entities/payment-voucher.entity';

export class QueryPaymentVoucherDto {
  @ApiPropertyOptional({ example: 2025 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fiscalYear?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  month?: number;

  @ApiPropertyOptional({ enum: VoucherStatus })
  @IsOptional()
  @IsEnum(VoucherStatus)
  status?: VoucherStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accountCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pptkId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  kegiatanId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'voucher_date', description: 'Sort field' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'voucher_date';

  @ApiPropertyOptional({ example: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
```

---

### `approve-payment-voucher.dto.ts`

```typescript
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ApproveTechnicalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  // Diisi otomatis dari user yang login
  // technicalOfficerId, name, nip dari user session
}

export class ApproveTreasurerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ApproveFinalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RejectPaymentVoucherDto {
  @ApiPropertyOptional({ example: 'Dokumen invoice tidak lengkap' })
  @IsString()
  rejectionReason: string;
}
```

---

### `payment-voucher-response.dto.ts`

```typescript
import { Exclude, Expose, Type } from 'class-transformer';
import { VoucherStatus } from '../entities/payment-voucher.entity';

export class TaxBreakdownDto {
  @Expose() pph21Rate: number;
  @Expose() pph21Amount: number;
  @Expose() pph22Rate: number;
  @Expose() pph22Amount: number;
  @Expose() pph23Rate: number;
  @Expose() pph23Amount: number;
  @Expose() pph24Rate: number;
  @Expose() pph24Amount: number;
  @Expose() ppnRate: number;
  @Expose() ppnAmount: number;
  @Expose() otherDeductions: number;
  @Expose() otherDeductionsNote: string;

  // Hanya yang > 0 ditampilkan di dokumen
  get activeDeductions() {
    return {
      pph21: this.pph21Amount > 0 ? this.pph21Amount : null,
      pph22: this.pph22Amount > 0 ? this.pph22Amount : null,
      pph23: this.pph23Amount > 0 ? this.pph23Amount : null,
      pph24: this.pph24Amount > 0 ? this.pph24Amount : null,
      ppn:   this.ppnAmount   > 0 ? this.ppnAmount   : null,
      other: this.otherDeductions > 0 ? this.otherDeductions : null,
    };
  }
}

export class BudgetInfoDto {
  @Expose() availablePagu: number;
  @Expose() rakMonthlyLimit: number;
  @Expose() previousCommitments: number;
}

export class SignatoryDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() nip: string;
  @Expose() signedAt: Date;
  @Expose() notes: string;
}

export class PaymentVoucherResponseDto {
  @Expose() id: string;
  @Expose() voucherNumber: string;
  @Expose() fiscalYear: number;
  @Expose() voucherMonth: number;
  @Expose() voucherDate: Date;
  @Expose() unitCode: string;

  // Hierarki
  @Expose() programCode: string;
  @Expose() programName: string;
  @Expose() kegiatanCode: string;
  @Expose() kegiatanName: string;
  @Expose() subKegiatanCode: string;
  @Expose() subKegiatanName: string;
  @Expose() accountCode: string;
  @Expose() accountName: string;

  // Detail Pembayaran
  @Expose() payeeName: string;
  @Expose() paymentPurpose: string;
  @Expose() vendorName: string;
  @Expose() vendorNpwp: string;
  @Expose() invoiceNumbers: string[];
  @Expose() invoiceDate: Date;

  // Keuangan
  @Expose() grossAmount: number;
  @Expose() grossAmountText: string;
  @Expose() totalDeductions: number;
  @Expose() netPayment: number;

  @Expose()
  @Type(() => TaxBreakdownDto)
  taxBreakdown: TaxBreakdownDto;

  @Expose()
  @Type(() => BudgetInfoDto)
  budgetInfo: BudgetInfoDto;

  // Tanda Tangan
  @Expose()
  @Type(() => SignatoryDto)
  technicalOfficer: SignatoryDto;

  @Expose()
  @Type(() => SignatoryDto)
  receiver: SignatoryDto;

  @Expose()
  @Type(() => SignatoryDto)
  treasurer: SignatoryDto;

  @Expose()
  @Type(() => SignatoryDto)
  approver: SignatoryDto;

  // Status
  @Expose() status: VoucherStatus;
  @Expose() rejectionReason: string;
  @Expose() sppId: string;
  @Expose() sppCreatedAt: Date;

  // Audit
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;

  // Computed
  get isEditable()  { return this.status === VoucherStatus.DRAFT; }
  get canCreateSpp(){ return this.status === VoucherStatus.APPROVED && !this.sppId; }
}
```
