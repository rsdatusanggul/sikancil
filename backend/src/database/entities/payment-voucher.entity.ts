import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
  DeleteDateColumn,
} from 'typeorm';
import { StatusBuktiBayar } from '../enums';
import { TaxRule } from './tax-rule.entity';
import { SPP } from './spp.entity';
import { PaymentVoucherAttachment } from './payment-voucher-attachment.entity';
import { PaymentVoucherAuditLog } from './payment-voucher-audit-log.entity';

/**
 * Entity: PaymentVoucher (formerly BuktiBayar)
 * Dokumen Bukti Pembayaran BLUD dengan dukungan lengkap:
 * - 8 Jenis Pajak (PPN, PPh 21/22/23/4(2)/Final UMKM/24, PBJT)
 * - 4 Level Tanda Tangan Pyramid
 * - Auto-numbering System
 * - Tax Calculation Engine
 * - Audit Trail
 * - QR Code Verification
 */
@Entity('payment_vouchers')
export class PaymentVoucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ══════════════════════════════════════════════════════════
  // IDENTITAS DOKUMEN
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'varchar', length: 120, unique: true })
  @Index()
  voucherNumber: string; // 0001/5.2.02.10.01.0003/01/RSUD-DS/2025

  @Column({ type: 'integer', nullable: true })
  voucherSequence: number;

  @Column({ type: 'integer' })
  @Index()
  fiscalYear: number;

  @Column({ type: 'integer' })
  @Index()
  voucherMonth: number; // 1-12

  @Column({ type: 'date' })
  @Index()
  voucherDate: Date;

  @Column({ type: 'varchar', length: 20, default: 'RSUD-DS' })
  unitCode: string;

  // ══════════════════════════════════════════════════════════
  // HIERARKI ANGGARAN
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'uuid', nullable: true })
  programId: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  programCode: string;

  @Column({ type: 'text', nullable: true })
  programName: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  kegiatanId: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  kegiatanCode: string;

  @Column({ type: 'text', nullable: true })
  kegiatanName: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  subKegiatanId: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  subKegiatanCode: string;

  @Column({ type: 'text', nullable: true })
  subKegiatanName: string;

  @Column({ type: 'varchar', length: 60, nullable: true })
  @Index()
  accountCode: string; // Kode Rekening Belanja

  @Column({ type: 'text', nullable: true })
  accountName: string;

  // ══════════════════════════════════════════════════════════
  // CACHE VALIDASI ANGGARAN (snapshot saat dibuat)
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  availablePagu: number; // Sisa pagu saat BB dibuat

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  rakMonthlyLimit: number; // Limit RAK bulan berjalan

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  previousCommitments: number; // BB Approved yang belum jadi SPP

  // ══════════════════════════════════════════════════════════
  // PPTK
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'uuid', nullable: true })
  @Index()
  pptkId: string;

  // ══════════════════════════════════════════════════════════
  // DETAIL PEMBAYARAN
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'text' })
  payeeName: string; // Default: 'BENDAHARA PENGELUARAN RSUD DATU SANGGUL RANTAU'

  @Column({ type: 'text' })
  paymentPurpose: string; // Contoh: 'Pembayaran Belanja BMHP PT. XYZ Invoice ABC123'

  // Vendor
  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  vendorName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  vendorNpwp: string;

  @Column({ type: 'text', nullable: true })
  vendorAddress: string;

  @Column({ type: 'text', array: true, nullable: true })
  invoiceNumbers: string[]; // Array nomor invoice/faktur

  @Column({ type: 'date', nullable: true })
  invoiceDate?: Date;

  // ══════════════════════════════════════════════════════════
  // PERHITUNGAN KEUANGAN
  // Formula: NET = GROSS - TOTAL_PAJAK
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  grossAmount: number; // Nilai Invoice/Tagihan

  // Tax rule reference
  @Column({ type: 'uuid', nullable: true })
  taxRuleId: string;

  // ── Pajak Pusat (dipotong BLUD) ──────────────────────────

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph21Rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph21Amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph22Rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph22Amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph23Rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph23Amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph4a2Rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph4a2Amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pphFinalUmkmRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pphFinalUmkmAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph24Rate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph24Amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ppnRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ppnAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ type: 'text', nullable: true })
  otherDeductionsNote: string;

  // ── Pajak Daerah (flag, bukan potongan) ──────────────────

  @Column({ type: 'boolean', default: false })
  includesPbjt: boolean; // Flag harga sudah include PBJT

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pbjtRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pbjtAmount: number; // Estimasi PBJT dalam harga (info saja)

  // ── Data UMKM (jika vendor PP 23/2018) ───────────────────

  @Column({ type: 'varchar', length: 50, nullable: true })
  skUmkmNumber: string; // Nomor SK dari KPP

  @Column({ type: 'date', nullable: true })
  skUmkmExpiry?: Date;

  // ── Computed Columns (auto-calculated oleh PostgreSQL) ────

  // NOTE: TypeORM belum support GENERATED ALWAYS AS secara native
  // Jadi kita declare sebagai regular column, tapi valuenya diisi oleh DB
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, insert: false, update: false })
  totalDeductions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, insert: false, update: false })
  netPayment: number;

  @Column({ type: 'text', nullable: true })
  grossAmountText: string; // Terbilang dari GROSS

  // ══════════════════════════════════════════════════════════
  // TANDA TANGAN (4 Pihak - Pyramid)
  // ══════════════════════════════════════════════════════════

  // [1] Pejabat Teknis BLUD (kiri atas)
  @Column({ type: 'uuid', nullable: true })
  technicalOfficerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  technicalOfficerName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  technicalOfficerNip: string;

  @Column({ type: 'timestamp', nullable: true })
  technicalSignedAt: Date;

  @Column({ type: 'text', nullable: true })
  technicalNotes?: string;

  // [2] Yang Menerima / PPTK (kanan atas)
  @Column({ type: 'uuid', nullable: true })
  receiverId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  receiverName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  receiverNip: string;

  @Column({ type: 'timestamp', nullable: true })
  receiverSignedAt: Date;

  // [3] Bendahara Pengeluaran (tengah)
  @Column({ type: 'uuid', nullable: true })
  treasurerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  treasurerName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  treasurerNip: string;

  @Column({ type: 'timestamp', nullable: true })
  treasurerSignedAt: Date;

  @Column({ type: 'text', nullable: true })
  treasurerNotes?: string;

  // [4] Direktur / PA (bawah)
  @Column({ type: 'uuid', nullable: true })
  approverId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  approverName: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  approverNip: string;

  @Column({ type: 'timestamp', nullable: true })
  approverSignedAt: Date;

  // ══════════════════════════════════════════════════════════
  // STATUS & LINK KE SPP
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'varchar', length: 30, default: StatusBuktiBayar.DRAFT })
  @Index()
  status: StatusBuktiBayar;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'uuid', nullable: true })
  rejectionBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  // Link ke SPP
  @Column({ type: 'uuid', nullable: true })
  sppId: string;

  @Column({ type: 'timestamp', nullable: true })
  sppCreatedAt: Date;

  // ══════════════════════════════════════════════════════════
  // AUDIT TRAIL
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  deletedBy: string;

  @DeleteDateColumn()
  @Index()
  deletedAt: Date; // Soft delete

  // ══════════════════════════════════════════════════════════
  // RELATIONS
  // ══════════════════════════════════════════════════════════

  @ManyToOne(() => TaxRule, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'taxRuleId' })
  taxRule: TaxRule;

  @ManyToOne(() => SPP, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sppId' })
  spp: SPP;

  @OneToMany(() => PaymentVoucherAttachment, (attachment) => attachment.voucher)
  attachments: PaymentVoucherAttachment[];

  @OneToMany(() => PaymentVoucherAuditLog, (log) => log.voucher)
  auditLogs: PaymentVoucherAuditLog[];
}
