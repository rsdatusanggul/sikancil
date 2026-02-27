import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TransactionStatus } from '../enums';

/**
 * Entity: Payroll
 * Employee payroll data
 */
@Entity('payroll')
export class Payroll {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorPayroll: string;

  @Column({ type: 'int' })
  @Index()
  bulan: number;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'uuid' })
  @Index()
  pegawaiId: string;

  // Penghasilan
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gajiPokok: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tunjanganJabatan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tunjanganKinerja: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tunjanganLain: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPenghasilan: number;

  // Potongan
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph21: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  iuranPensiun: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  bpjs: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  potonganLain: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPotongan: number;

  // Take Home Pay
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  gajiNetto: number;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.DRAFT })
  @Index()
  status: TransactionStatus;

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
