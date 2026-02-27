import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { RBA } from './rba.entity';

/**
 * Entity: RencanaAnggaranKas
 * Proyeksi arus kas bulanan dalam RBA
 */
@Entity('rencana_anggaran_kas')
@Unique(['rbaId', 'tahun', 'bulan'])
export class RencanaAnggaranKas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  rbaId: string;

  @Column({ type: 'int' })
  bulan: number; // 1-12

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  // Saldo Awal
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldoAwal: number;

  // Penerimaan
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penerimaanAPBD: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penerimaanFungsional: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penerimaanHibah: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penerimaanLain: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPenerimaan: number;

  // Pengeluaran
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  belanjaPegawai: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  belanjaBarangJasa: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  belanjaModal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  belanjaLain: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPengeluaran: number;

  // Saldo Akhir
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldoAkhir: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => RBA, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rbaId' })
  rba: RBA;
}
