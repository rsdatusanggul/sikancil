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
import { VoucherAuditAction } from '../enums';

/**
 * Entity: PaymentVoucherAuditLog
 * Audit trail lengkap untuk semua aktivitas payment voucher
 * Untuk compliance dan tracking
 */
@Entity('payment_voucher_audit_logs')
export class PaymentVoucherAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  voucherId: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  action: VoucherAuditAction;

  // Status transition
  @Column({ type: 'varchar', length: 30, nullable: true })
  oldStatus?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  newStatus?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Metadata JSONB untuk info tambahan (IP, browser, device, changes, dll)
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // Audit
  @Column({ type: 'uuid', nullable: true })
  @Index()
  performedBy: string;

  @CreateDateColumn()
  @Index()
  performedAt: Date;

  // Relations
  @ManyToOne(() => PaymentVoucher, (voucher) => voucher.auditLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'voucherId' })
  voucher: PaymentVoucher;
}
