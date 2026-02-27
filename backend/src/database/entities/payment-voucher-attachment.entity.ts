import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { PaymentVoucher } from './payment-voucher.entity';
import { AttachmentType } from '../enums';

/**
 * Entity: PaymentVoucherAttachment
 * Lampiran dokumen pendukung untuk payment voucher
 * (Invoice, Kontrak, BA, BAST, Photo, dll)
 */
@Entity('payment_voucher_attachments')
export class PaymentVoucherAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  voucherId: string;

  // File information
  @Column({ type: 'varchar', length: 255 })
  fileName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  fileType: string; // pdf, jpg, png, xlsx, docx

  @Column({ type: 'integer', nullable: true })
  fileSize: number; // bytes

  @Column({ type: 'text' })
  filePath: string; // Path di storage (S3/local)

  // Tipe lampiran
  @Column({ type: 'varchar', length: 30, default: AttachmentType.OTHER })
  @Index()
  attachmentType: AttachmentType;

  @Column({ type: 'text', nullable: true })
  description: string;

  // Audit
  @Column({ type: 'uuid', nullable: true })
  uploadedBy: string;

  @CreateDateColumn()
  uploadedAt: Date;

  // Relations
  @ManyToOne(() => PaymentVoucher, (voucher) => voucher.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'voucherId' })
  voucher: PaymentVoucher;
}
