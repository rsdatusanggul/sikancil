import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { BudgetStatus } from '../enums';

/**
 * Entity: Budget
 * Master budget allocation per account per year
 */
@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  fiscalYearId: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  anggaranAwal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  revisi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  anggaranAkhir: number; // anggaranAwal + revisi

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sisa: number; // anggaranAkhir - realisasi

  @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.DRAFT })
  @Index()
  status: BudgetStatus;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
