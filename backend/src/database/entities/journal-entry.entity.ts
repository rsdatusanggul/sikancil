import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { JournalEntryType, TransactionStatus } from '../enums';
import { JournalDetail } from './journal-detail.entity';

/**
 * Entity: JournalEntry
 * Master journal entry (header)
 */
@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorJurnal: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggalJurnal: Date;

  @Column({ type: 'varchar', length: 7 }) // Format: YYYY-MM
  @Index()
  periode: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'enum', enum: JournalEntryType, default: JournalEntryType.GENERAL })
  @Index()
  jenisJurnal: JournalEntryType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  sourceType: string; // PENDAPATAN, BELANJA, KAS_BANK, ASET, PAJAK

  @Column({ type: 'uuid', nullable: true })
  @Index()
  sourceId: string; // ID from source table

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceType: string; // SP2D, STS, CASH, BANK, PAYROLL, etc (legacy)

  @Column({ type: 'uuid', nullable: true })
  referenceId: string; // Legacy

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNo: string;

  @Column({ type: 'text' })
  uraian: string; // Changed from deskripsi to uraian for consistency

  @Column({ type: 'text', nullable: true })
  keterangan: string; // Additional notes

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalDebit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalCredit: number;

  @Column({ type: 'boolean', default: true })
  isBalanced: boolean; // totalDebit == totalCredit

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.DRAFT })
  @Index()
  status: TransactionStatus;

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  @Column({ type: 'varchar', nullable: true })
  postedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @Column({ type: 'boolean', default: false })
  isApproved: boolean; // For manual journals

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'boolean', default: false })
  isReversed: boolean;

  @Column({ type: 'varchar', nullable: true })
  reversedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  reversalJournalId: string; // Link to reversal journal

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => JournalDetail, (detail) => detail.journal, {
    cascade: true,
    eager: true,
  })
  items: JournalDetail[];
}
