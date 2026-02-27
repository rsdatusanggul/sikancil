import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PaymentStatus } from '../enums';

/**
 * Entity: AccountReceivable
 * Accounts receivable (Piutang Usaha)
 */
@Entity('accounts_receivable')
export class AccountReceivable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorAR: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  @Column({ type: 'date' })
  tanggalJatuhTempo: Date;

  @Column({ type: 'varchar', length: 255 })
  namaDebitur: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorInvoice: string;

  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiPiutang: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nilaiDiterima: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sisaPiutang: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  @Index()
  status: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  journalId: string;

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
