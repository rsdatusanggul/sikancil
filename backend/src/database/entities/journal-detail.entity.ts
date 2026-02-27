import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { ChartOfAccount } from './chart-of-account.entity';

/**
 * Entity: JournalDetail
 * Detail lines for journal entry
 */
@Entity('journal_details')
export class JournalDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  journalId: string;

  @Column({ type: 'int' })
  lineNumber: number;

  @Column({ type: 'uuid' })
  @Index()
  coaId: string; // Link to Chart of Account

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string; // Denormalized for performance

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string; // Denormalized for performance

  @Column({ type: 'varchar', length: 255, nullable: true })
  uraian: string; // Changed from deskripsi to uraian

  @Column({ type: 'uuid', nullable: true })
  unitKerjaId: string; // For cost center tracking

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debet: number; // Changed from debit to debet for consistency

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  kredit: number; // Changed from credit to kredit for consistency

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => JournalEntry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journalId' })
  journal: JournalEntry;

  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'coaId' })
  coa: ChartOfAccount;
}
