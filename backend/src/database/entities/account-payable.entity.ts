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
 * Entity: AccountPayable
 * Accounts payable (Hutang Usaha)
 */
@Entity('accounts_payable')
export class AccountPayable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorAP: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  @Column({ type: 'date' })
  tanggalJatuhTempo: Date;

  @Column({ type: 'uuid' })
  @Index()
  supplierId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorInvoice: string;

  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiHutang: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nilaiDibayar: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sisaHutang: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.UNPAID })
  @Index()
  status: PaymentStatus;

  @Column({ type: 'uuid', nullable: true })
  sppId: string;

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
