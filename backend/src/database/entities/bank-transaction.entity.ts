import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BankTransactionType, TransactionStatus } from '../enums';

/**
 * Entity: BankTransaction
 * Bank account transactions
 */
@Entity('bank_transactions')
export class BankTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorTransaksi: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  @Column({ type: 'uuid' })
  @Index()
  bankAccountId: string;

  @Column({ type: 'enum', enum: BankTransactionType })
  jenis: BankTransactionType;

  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldo: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNo: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType: string; // SP2D, STS, TRANSFER, etc

  @Column({ type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ type: 'boolean', default: false })
  isReconciled: boolean;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.DRAFT })
  @Index()
  status: TransactionStatus;

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
