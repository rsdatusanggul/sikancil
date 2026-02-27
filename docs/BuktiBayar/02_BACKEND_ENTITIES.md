# 02 - Backend Structure & Entities
## Modul Bukti Pembayaran | SI-KANCIL

---

## Struktur Folder

```
backend/src/modules/bukti-bayar/
├── bukti-bayar.module.ts
├── bukti-bayar.controller.ts
├── bukti-bayar.service.ts
│
├── entities/
│   ├── payment-voucher.entity.ts
│   ├── tax-rule.entity.ts
│   ├── voucher-sequence.entity.ts
│   ├── payment-voucher-attachment.entity.ts
│   ├── payment-voucher-audit-log.entity.ts
│   └── short-url.entity.ts
│
├── dto/
│   ├── create-payment-voucher.dto.ts
│   ├── update-payment-voucher.dto.ts
│   ├── query-payment-voucher.dto.ts
│   ├── approve-payment-voucher.dto.ts
│   ├── reject-payment-voucher.dto.ts
│   └── payment-voucher-response.dto.ts
│
└── services/
    ├── tax-calculation.service.ts
    ├── budget-validation.service.ts
    ├── voucher-numbering.service.ts
    ├── pdf-generator.service.ts
    └── qr-code.service.ts
```

---

## TypeORM Entities

### `payment-voucher.entity.ts`

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany,
  JoinColumn, Check, Index,
} from 'typeorm';
import { User }       from '@/modules/users/entities/user.entity';
import { RbaProgram } from '@/modules/anggaran/entities/rba-program.entity';
import { RbaKegiatan } from '@/modules/anggaran/entities/rba-kegiatan.entity';
import { RbaOutput }  from '@/modules/anggaran/entities/rba-output.entity';
import { TaxRule }    from './tax-rule.entity';
import { PaymentVoucherAttachment } from './payment-voucher-attachment.entity';
import { PaymentVoucherAuditLog }   from './payment-voucher-audit-log.entity';

export enum VoucherStatus {
  DRAFT       = 'DRAFT',
  SUBMITTED   = 'SUBMITTED',
  APPROVED    = 'APPROVED',
  REJECTED    = 'REJECTED',
  SPP_CREATED = 'SPP_CREATED',
  CANCELLED   = 'CANCELLED',
}

@Entity('payment_vouchers')
@Index(['fiscalYear', 'voucherMonth'])
@Index(['accountCode'])
@Index(['status'])
@Index(['pptkId'])
@Check(`"net_payment" >= 0`)
@Check(`"total_deductions" <= "gross_amount"`)
export class PaymentVoucher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ── Identitas Dokumen ───────────────────────────────────────────
  @Column({ name: 'voucher_number', length: 120, unique: true })
  voucherNumber: string;

  @Column({ name: 'voucher_sequence' })
  voucherSequence: number;

  @Column({ name: 'fiscal_year' })
  fiscalYear: number;

  @Column({ name: 'voucher_month' })
  voucherMonth: number;

  @Column({ name: 'voucher_date', type: 'date' })
  voucherDate: Date;

  @Column({ name: 'unit_code', length: 20, default: 'RSUD-DS' })
  unitCode: string;

  // ── Hierarki Anggaran ───────────────────────────────────────────
  @Column({ name: 'program_id', nullable: true })
  programId: string;

  @ManyToOne(() => RbaProgram, { nullable: true })
  @JoinColumn({ name: 'program_id' })
  program: RbaProgram;

  @Column({ name: 'program_code', length: 30 })
  programCode: string;

  @Column({ name: 'program_name', nullable: true })
  programName: string;

  @Column({ name: 'kegiatan_id', nullable: true })
  kegiatanId: string;

  @ManyToOne(() => RbaKegiatan, { nullable: true })
  @JoinColumn({ name: 'kegiatan_id' })
  kegiatan: RbaKegiatan;

  @Column({ name: 'kegiatan_code', length: 30 })
  kegiatanCode: string;

  @Column({ name: 'kegiatan_name', nullable: true })
  kegiatanName: string;

  @Column({ name: 'sub_kegiatan_id', nullable: true })
  subKegiatanId: string;

  @ManyToOne(() => RbaOutput, { nullable: true })
  @JoinColumn({ name: 'sub_kegiatan_id' })
  subKegiatan: RbaOutput;

  @Column({ name: 'sub_kegiatan_code', length: 30, nullable: true })
  subKegiatanCode: string;

  @Column({ name: 'sub_kegiatan_name', nullable: true })
  subKegiatanName: string;

  @Column({ name: 'account_code', length: 60 })
  accountCode: string;

  @Column({ name: 'account_name' })
  accountName: string;

  // ── Cache Validasi Anggaran ─────────────────────────────────────
  @Column({ name: 'available_pagu', type: 'decimal', precision: 15, scale: 2, nullable: true })
  availablePagu: number;

  @Column({ name: 'rak_monthly_limit', type: 'decimal', precision: 15, scale: 2, nullable: true })
  rakMonthlyLimit: number;

  @Column({ name: 'previous_commitments', type: 'decimal', precision: 15, scale: 2, nullable: true })
  previousCommitments: number;

  // ── PPTK ────────────────────────────────────────────────────────
  @Column({ name: 'pptk_id' })
  pptkId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'pptk_id' })
  pptk: User;

  // ── Detail Pembayaran ───────────────────────────────────────────
  @Column({ name: 'payee_name' })
  payeeName: string;

  @Column({ name: 'payment_purpose' })
  paymentPurpose: string;

  @Column({ name: 'vendor_name', nullable: true })
  vendorName: string;

  @Column({ name: 'vendor_npwp', length: 30, nullable: true })
  vendorNpwp: string;

  @Column({ name: 'vendor_address', nullable: true })
  vendorAddress: string;

  @Column({ name: 'invoice_numbers', type: 'text', array: true, nullable: true })
  invoiceNumbers: string[];

  @Column({ name: 'invoice_date', type: 'date', nullable: true })
  invoiceDate: Date;

  // ── Perhitungan Keuangan ────────────────────────────────────────
  @Column({ name: 'gross_amount', type: 'decimal', precision: 15, scale: 2 })
  grossAmount: number;

  @Column({ name: 'tax_rule_id', nullable: true })
  taxRuleId: string;

  @ManyToOne(() => TaxRule, { nullable: true })
  @JoinColumn({ name: 'tax_rule_id' })
  taxRule: TaxRule;

  @Column({ name: 'pph21_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph21Rate: number;

  @Column({ name: 'pph21_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph21Amount: number;

  @Column({ name: 'pph22_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph22Rate: number;

  @Column({ name: 'pph22_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph22Amount: number;

  @Column({ name: 'pph23_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph23Rate: number;

  @Column({ name: 'pph23_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph23Amount: number;

  @Column({ name: 'pph24_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph24Rate: number;

  @Column({ name: 'pph24_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph24Amount: number;

  @Column({ name: 'ppn_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  ppnRate: number;

  @Column({ name: 'ppn_amount', type: 'decimal', precision: 15, scale: 2, default: 0 })
  ppnAmount: number;

  @Column({ name: 'other_deductions', type: 'decimal', precision: 15, scale: 2, default: 0 })
  otherDeductions: number;

  @Column({ name: 'other_deductions_note', nullable: true })
  otherDeductionsNote: string;

  // Computed oleh PostgreSQL (GENERATED ALWAYS AS ... STORED)
  @Column({ name: 'total_deductions', type: 'decimal', precision: 15, scale: 2, insert: false, update: false })
  totalDeductions: number;

  @Column({ name: 'net_payment', type: 'decimal', precision: 15, scale: 2, insert: false, update: false })
  netPayment: number;

  @Column({ name: 'gross_amount_text', nullable: true })
  grossAmountText: string;

  // ── Tanda Tangan (Pyramid) ──────────────────────────────────────
  @Column({ name: 'technical_officer_id', nullable: true })
  technicalOfficerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'technical_officer_id' })
  technicalOfficer: User;

  @Column({ name: 'technical_officer_name', length: 255, nullable: true })
  technicalOfficerName: string;

  @Column({ name: 'technical_officer_nip', length: 30, nullable: true })
  technicalOfficerNip: string;

  @Column({ name: 'technical_signed_at', type: 'timestamp', nullable: true })
  technicalSignedAt: Date;

  @Column({ name: 'technical_notes', nullable: true })
  technicalNotes: string;

  @Column({ name: 'receiver_id', nullable: true })
  receiverId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;

  @Column({ name: 'receiver_name', length: 255, nullable: true })
  receiverName: string;

  @Column({ name: 'receiver_nip', length: 30, nullable: true })
  receiverNip: string;

  @Column({ name: 'receiver_signed_at', type: 'timestamp', nullable: true })
  receiverSignedAt: Date;

  @Column({ name: 'treasurer_id', nullable: true })
  treasurerId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'treasurer_id' })
  treasurer: User;

  @Column({ name: 'treasurer_name', length: 255, nullable: true })
  treasurerName: string;

  @Column({ name: 'treasurer_nip', length: 30, nullable: true })
  treasurerNip: string;

  @Column({ name: 'treasurer_signed_at', type: 'timestamp', nullable: true })
  treasurerSignedAt: Date;

  @Column({ name: 'treasurer_notes', nullable: true })
  treasurerNotes: string;

  @Column({ name: 'approver_id', nullable: true })
  approverId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @Column({ name: 'approver_name', length: 255, nullable: true })
  approverName: string;

  @Column({ name: 'approver_nip', length: 30, nullable: true })
  approverNip: string;

  @Column({ name: 'approver_signed_at', type: 'timestamp', nullable: true })
  approverSignedAt: Date;

  // ── Status & Links ──────────────────────────────────────────────
  @Column({ type: 'enum', enum: VoucherStatus, default: VoucherStatus.DRAFT })
  status: VoucherStatus;

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @Column({ name: 'rejection_by', nullable: true })
  rejectionBy: string;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'spp_id', nullable: true })
  sppId: string;

  @Column({ name: 'spp_created_at', type: 'timestamp', nullable: true })
  sppCreatedAt: Date;

  // ── Audit Trail ─────────────────────────────────────────────────
  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // ── Relations ───────────────────────────────────────────────────
  @OneToMany(() => PaymentVoucherAttachment, (a) => a.voucher, { cascade: true })
  attachments: PaymentVoucherAttachment[];

  @OneToMany(() => PaymentVoucherAuditLog, (l) => l.voucher)
  auditLogs: PaymentVoucherAuditLog[];

  // ── Computed Getters ────────────────────────────────────────────
  get isEditable(): boolean {
    return this.status === VoucherStatus.DRAFT;
  }

  get isApproved(): boolean {
    return this.status === VoucherStatus.APPROVED;
  }

  get canCreateSpp(): boolean {
    return this.status === VoucherStatus.APPROVED && !this.sppId;
  }
}
```

---

### `tax-rule.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tax_rules')
export class TaxRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'account_code_pattern', length: 60 })
  accountCodePattern: string;

  @Column()
  description: string;

  @Column({ name: 'ppn_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  ppnRate: number;

  @Column({ name: 'pph21_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph21Rate: number;

  @Column({ name: 'pph22_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph22Rate: number;

  @Column({ name: 'pph23_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph23Rate: number;

  @Column({ name: 'pph24_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph24Rate: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: Date;

  @Column({ name: 'effective_to', type: 'date', nullable: true })
  effectiveTo: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

### `payment-voucher-attachment.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PaymentVoucher } from './payment-voucher.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum AttachmentType {
  INVOICE  = 'INVOICE',
  CONTRACT = 'CONTRACT',
  BA       = 'BA',     // Berita Acara
  BAST     = 'BAST',   // Berita Acara Serah Terima
  PHOTO    = 'PHOTO',
  OTHER    = 'OTHER',
}

@Entity('payment_voucher_attachments')
export class PaymentVoucherAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voucher_id' })
  voucherId: string;

  @ManyToOne(() => PaymentVoucher, (v) => v.attachments)
  @JoinColumn({ name: 'voucher_id' })
  voucher: PaymentVoucher;

  @Column({ name: 'file_name', length: 255 })
  fileName: string;

  @Column({ name: 'file_type', length: 50, nullable: true })
  fileType: string;

  @Column({ name: 'file_size', nullable: true })
  fileSize: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({
    name: 'attachment_type',
    type: 'enum',
    enum: AttachmentType,
    default: AttachmentType.OTHER,
  })
  attachmentType: AttachmentType;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by' })
  uploader: User;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
```

---

### `payment-voucher-audit-log.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { PaymentVoucher } from './payment-voucher.entity';
import { User } from '@/modules/users/entities/user.entity';

export enum AuditAction {
  CREATED             = 'CREATED',
  UPDATED             = 'UPDATED',
  SUBMITTED           = 'SUBMITTED',
  APPROVED_TECHNICAL  = 'APPROVED_TECHNICAL',
  APPROVED_TREASURER  = 'APPROVED_TREASURER',
  APPROVED_FINAL      = 'APPROVED_FINAL',
  REJECTED            = 'REJECTED',
  CANCELLED           = 'CANCELLED',
  SPP_CREATED         = 'SPP_CREATED',
  PRINTED             = 'PRINTED',
}

@Entity('payment_voucher_audit_logs')
export class PaymentVoucherAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'voucher_id' })
  voucherId: string;

  @ManyToOne(() => PaymentVoucher, (v) => v.auditLogs)
  @JoinColumn({ name: 'voucher_id' })
  voucher: PaymentVoucher;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ name: 'old_status', length: 30, nullable: true })
  oldStatus: string;

  @Column({ name: 'new_status', length: 30, nullable: true })
  newStatus: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'performed_by', nullable: true })
  performedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @CreateDateColumn({ name: 'performed_at' })
  performedAt: Date;
}
```

---

### `bukti-bayar.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule }   from '@nestjs/bull';

import { BuktiBayarController } from './bukti-bayar.controller';
import { BuktiBayarService }    from './bukti-bayar.service';

import { PaymentVoucher }           from './entities/payment-voucher.entity';
import { TaxRule }                  from './entities/tax-rule.entity';
import { VoucherSequence }          from './entities/voucher-sequence.entity';
import { PaymentVoucherAttachment } from './entities/payment-voucher-attachment.entity';
import { PaymentVoucherAuditLog }   from './entities/payment-voucher-audit-log.entity';
import { ShortUrl }                 from './entities/short-url.entity';

import { TaxCalculationService }  from './services/tax-calculation.service';
import { BudgetValidationService } from './services/budget-validation.service';
import { VoucherNumberingService } from './services/voucher-numbering.service';
import { PdfGeneratorService }    from './services/pdf-generator.service';
import { QrCodeService }          from './services/qr-code.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentVoucher,
      TaxRule,
      VoucherSequence,
      PaymentVoucherAttachment,
      PaymentVoucherAuditLog,
      ShortUrl,
    ]),
    BullModule.registerQueue({ name: 'pdf-generation' }),
  ],
  controllers: [BuktiBayarController],
  providers: [
    BuktiBayarService,
    TaxCalculationService,
    BudgetValidationService,
    VoucherNumberingService,
    PdfGeneratorService,
    QrCodeService,
  ],
  exports: [BuktiBayarService],
})
export class BuktiBayarModule {}
```
