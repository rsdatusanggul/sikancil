import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusBuktiBayar } from '../../../database/enums';

/**
 * DTO untuk breakdown detail pajak
 */
export class TaxBreakdownDto {
  @ApiProperty({ description: 'Tarif PPh 21 (%)' })
  @Expose()
  pph21Rate: number;

  @ApiProperty({ description: 'Jumlah PPh 21' })
  @Expose()
  pph21Amount: number;

  @ApiProperty({ description: 'Tarif PPh 22 (%)' })
  @Expose()
  pph22Rate: number;

  @ApiProperty({ description: 'Jumlah PPh 22' })
  @Expose()
  pph22Amount: number;

  @ApiProperty({ description: 'Tarif PPh 23 (%)' })
  @Expose()
  pph23Rate: number;

  @ApiProperty({ description: 'Jumlah PPh 23' })
  @Expose()
  pph23Amount: number;

  @ApiProperty({ description: 'Tarif PPh 4 ayat 2 (%)' })
  @Expose()
  pph4a2Rate: number;

  @ApiProperty({ description: 'Jumlah PPh 4 ayat 2' })
  @Expose()
  pph4a2Amount: number;

  @ApiProperty({ description: 'Tarif PPh Final UMKM (%)' })
  @Expose()
  pphFinalUmkmRate: number;

  @ApiProperty({ description: 'Jumlah PPh Final UMKM' })
  @Expose()
  pphFinalUmkmAmount: number;

  @ApiProperty({ description: 'Tarif PPh 24 (%)' })
  @Expose()
  pph24Rate: number;

  @ApiProperty({ description: 'Jumlah PPh 24' })
  @Expose()
  pph24Amount: number;

  @ApiProperty({ description: 'Tarif PPN (%)' })
  @Expose()
  ppnRate: number;

  @ApiProperty({ description: 'Jumlah PPN' })
  @Expose()
  ppnAmount: number;

  @ApiProperty({ description: 'Potongan lain-lain' })
  @Expose()
  otherDeductions: number;

  @ApiPropertyOptional({ description: 'Keterangan potongan lain' })
  @Expose()
  otherDeductionsNote?: string;

  /**
   * Hanya potongan yang > 0 yang ditampilkan di dokumen
   */
  get activeDeductions() {
    return {
      pph21: this.pph21Amount > 0 ? { rate: this.pph21Rate, amount: this.pph21Amount } : null,
      pph22: this.pph22Amount > 0 ? { rate: this.pph22Rate, amount: this.pph22Amount } : null,
      pph23: this.pph23Amount > 0 ? { rate: this.pph23Rate, amount: this.pph23Amount } : null,
      pph4a2: this.pph4a2Amount > 0 ? { rate: this.pph4a2Rate, amount: this.pph4a2Amount } : null,
      pphFinalUmkm: this.pphFinalUmkmAmount > 0 ? { rate: this.pphFinalUmkmRate, amount: this.pphFinalUmkmAmount } : null,
      pph24: this.pph24Amount > 0 ? { rate: this.pph24Rate, amount: this.pph24Amount } : null,
      ppn: this.ppnAmount > 0 ? { rate: this.ppnRate, amount: this.ppnAmount } : null,
      other: this.otherDeductions > 0 ? { amount: this.otherDeductions, note: this.otherDeductionsNote } : null,
    };
  }
}

/**
 * DTO untuk informasi anggaran & validasi
 */
export class BudgetInfoDto {
  @ApiPropertyOptional({ description: 'Sisa pagu saat dibuat' })
  @Expose()
  availablePagu?: number;

  @ApiPropertyOptional({ description: 'Limit RAK bulanan' })
  @Expose()
  rakMonthlyLimit?: number;

  @ApiPropertyOptional({ description: 'Komitmen sebelumnya (BB approved belum jadi SPP)' })
  @Expose()
  previousCommitments?: number;
}

/**
 * DTO untuk penandatangan (generic untuk semua level)
 */
export class SignatoryDto {
  @ApiPropertyOptional()
  @Expose()
  id?: string;

  @ApiPropertyOptional()
  @Expose()
  name?: string;

  @ApiPropertyOptional()
  @Expose()
  nip?: string;

  @ApiPropertyOptional()
  @Expose()
  signedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  notes?: string;
}

/**
 * DTO Response untuk Payment Voucher
 */
export class PaymentVoucherResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  // ══════════════════════════════════════════════════════════
  // IDENTITAS DOKUMEN
  // ══════════════════════════════════════════════════════════

  @ApiProperty()
  @Expose()
  voucherNumber: string;

  @ApiProperty()
  @Expose()
  voucherSequence: number;

  @ApiProperty()
  @Expose()
  fiscalYear: number;

  @ApiProperty()
  @Expose()
  voucherMonth: number;

  @ApiProperty()
  @Expose()
  voucherDate: Date;

  @ApiProperty()
  @Expose()
  unitCode: string;

  // ══════════════════════════════════════════════════════════
  // HIERARKI ANGGARAN
  // ══════════════════════════════════════════════════════════

  @ApiPropertyOptional()
  @Expose()
  programId?: string;

  @ApiPropertyOptional()
  @Expose()
  programCode?: string;

  @ApiPropertyOptional()
  @Expose()
  programName?: string;

  @ApiPropertyOptional()
  @Expose()
  kegiatanId?: string;

  @ApiPropertyOptional()
  @Expose()
  kegiatanCode?: string;

  @ApiPropertyOptional()
  @Expose()
  kegiatanName?: string;

  @ApiPropertyOptional()
  @Expose()
  subKegiatanId?: string;

  @ApiPropertyOptional()
  @Expose()
  subKegiatanCode?: string;

  @ApiPropertyOptional()
  @Expose()
  subKegiatanName?: string;

  @ApiProperty()
  @Expose()
  accountCode: string;

  @ApiProperty()
  @Expose()
  accountName: string;

  // ══════════════════════════════════════════════════════════
  // DETAIL PEMBAYARAN
  // ══════════════════════════════════════════════════════════

  @ApiProperty()
  @Expose()
  payeeName: string;

  @ApiProperty()
  @Expose()
  paymentPurpose: string;

  @ApiPropertyOptional()
  @Expose()
  vendorName?: string;

  @ApiPropertyOptional()
  @Expose()
  vendorNpwp?: string;

  @ApiPropertyOptional()
  @Expose()
  vendorAddress?: string;

  @ApiPropertyOptional({ type: [String] })
  @Expose()
  invoiceNumbers?: string[];

  @ApiPropertyOptional()
  @Expose()
  invoiceDate?: Date;

  // ══════════════════════════════════════════════════════════
  // KEUANGAN
  // ══════════════════════════════════════════════════════════

  @ApiProperty({ description: 'Jumlah bruto tagihan' })
  @Expose()
  grossAmount: number;

  @ApiPropertyOptional({ description: 'Terbilang dari gross amount' })
  @Expose()
  grossAmountText?: string;

  @ApiProperty({ description: 'Total potongan pajak (computed)' })
  @Expose()
  totalDeductions: number;

  @ApiProperty({ description: 'Jumlah bersih yang diterima (computed)' })
  @Expose()
  netPayment: number;

  @ApiProperty({ description: 'Breakdown pajak', type: TaxBreakdownDto })
  @Expose()
  @Type(() => TaxBreakdownDto)
  taxBreakdown: TaxBreakdownDto;

  @ApiPropertyOptional({ description: 'Informasi anggaran', type: BudgetInfoDto })
  @Expose()
  @Type(() => BudgetInfoDto)
  budgetInfo?: BudgetInfoDto;

  // ══════════════════════════════════════════════════════════
  // TANDA TANGAN (4 LEVEL PYRAMID)
  // ══════════════════════════════════════════════════════════

  @ApiPropertyOptional({ description: 'Pejabat Teknis', type: SignatoryDto })
  @Expose()
  @Type(() => SignatoryDto)
  technicalOfficer?: SignatoryDto;

  @ApiPropertyOptional({ description: 'Yang Menerima / PPTK', type: SignatoryDto })
  @Expose()
  @Type(() => SignatoryDto)
  receiver?: SignatoryDto;

  @ApiPropertyOptional({ description: 'Bendahara Pengeluaran', type: SignatoryDto })
  @Expose()
  @Type(() => SignatoryDto)
  treasurer?: SignatoryDto;

  @ApiPropertyOptional({ description: 'Direktur / PA (Approver Final)', type: SignatoryDto })
  @Expose()
  @Type(() => SignatoryDto)
  approver?: SignatoryDto;

  // ══════════════════════════════════════════════════════════
  // STATUS & WORKFLOW
  // ══════════════════════════════════════════════════════════

  @ApiProperty({ enum: StatusBuktiBayar })
  @Expose()
  status: StatusBuktiBayar;

  @ApiPropertyOptional()
  @Expose()
  rejectionReason?: string;

  @ApiPropertyOptional()
  @Expose()
  rejectionBy?: string;

  @ApiPropertyOptional()
  @Expose()
  rejectedAt?: Date;

  @ApiPropertyOptional()
  @Expose()
  sppId?: string;

  @ApiPropertyOptional()
  @Expose()
  sppCreatedAt?: Date;

  // ══════════════════════════════════════════════════════════
  // AUDIT TRAIL
  // ══════════════════════════════════════════════════════════

  @ApiProperty()
  @Expose()
  createdBy: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose()
  updatedBy?: string;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional()
  @Expose()
  deletedBy?: string;

  @ApiPropertyOptional()
  @Expose()
  deletedAt?: Date;

  // ══════════════════════════════════════════════════════════
  // COMPUTED PROPERTIES
  // ══════════════════════════════════════════════════════════

  /**
   * Apakah voucher bisa diedit (hanya saat DRAFT)
   */
  get isEditable(): boolean {
    return this.status === StatusBuktiBayar.DRAFT;
  }

  /**
   * Apakah bisa membuat SPP (final dan belum dibuat SPP)
   */
  get canCreateSpp(): boolean {
    return this.status === StatusBuktiBayar.FINAL && !this.sppId;
  }

  /**
   * Apakah sudah final
   */
  get isApproved(): boolean {
    return this.status === StatusBuktiBayar.FINAL;
  }
}
