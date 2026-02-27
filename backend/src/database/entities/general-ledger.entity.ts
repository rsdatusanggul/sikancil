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
 * Entity: GeneralLedger (Buku Besar)
 * Buku besar per CoA per periode
 * Auto-updated dari journal entries
 */
@Entity('general_ledger')
export class GeneralLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  coaId: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string; // Denormalized for performance

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string; // Denormalized for performance

  @Column({ type: 'varchar', length: 7 }) // Format: YYYY-MM
  @Index()
  periode: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'int' })
  bulan: number; // 1-12

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAwal: number; // Opening balance (from previous period)

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDebet: number; // Sum of current period debits

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalKredit: number; // Sum of current period credits

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  mutasi: number; // totalDebet - totalKredit

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAkhir: number; // Ending balance

  @Column({ type: 'varchar', length: 10, default: 'DEBET' }) // DEBET or KREDIT
  saldoNormal: string; // From CoA

  @UpdateDateColumn()
  lastUpdated: Date;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => ChartOfAccount)
  @JoinColumn({ name: 'coaId' })
  coa: ChartOfAccount;
}
