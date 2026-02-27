import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChartOfAccount } from './chart-of-account.entity';

/**
 * Entity: TrialBalance (Neraca Saldo)
 * Materialized view of general ledger for reporting
 * Generated on-demand or scheduled
 */
@Entity('trial_balance')
export class TrialBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 7 }) // Format: YYYY-MM
  @Index()
  periode: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'uuid' })
  @Index()
  coaId: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string;

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string;

  @Column({ type: 'int' })
  level: number; // CoA level (1-6)

  @Column({ type: 'varchar', length: 20, nullable: true })
  parentCode: string; // For hierarchy

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debet: number; // Current period debit balance

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  kredit: number; // Current period credit balance

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debetAdjustment: number; // Adjustment entries (if any)

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  kreditAdjustment: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debetAdjusted: number; // Adjusted balance

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  kreditAdjusted: number;

  @CreateDateColumn()
  generatedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'coaId' })
  coa: ChartOfAccount;
}
