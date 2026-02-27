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
import { DPA } from './dpa.entity';

/**
 * Entity: DPAPembiayaan
 * Rincian Pembiayaan dalam DPA (Penerimaan & Pengeluaran Pembiayaan)
 * Untuk cover defisit atau alokasi surplus
 */
@Entity('dpa_pembiayaan')
export class DPAPembiayaan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  dpaId: string;

  // Jenis Pembiayaan
  @Column({ type: 'varchar', length: 20 })
  @Index()
  jenis: string; // PENERIMAAN, PENGELUARAN

  // Kode Rekening Pembiayaan
  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string; // "6.1.01" (Penerimaan) atau "7.1.01" (Pengeluaran)

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string;

  // Kategori
  @Column({ type: 'varchar', length: 100 })
  kategori: string; // SiLPA, Pinjaman, Investasi Jangka Panjang, dll

  // Sumber/Tujuan
  @Column({ type: 'varchar', length: 255, nullable: true })
  sumberTujuan: string; // Nama bank, lembaga, dll

  // Pagu
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pagu: number;

  // Breakdown Bulanan
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  januari: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  februari: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  maret: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  april: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  mei: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  juni: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  juli: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  agustus: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  september: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  oktober: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  november: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  desember: number;

  // Realisasi
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sisa: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  persentaseRealisasi: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => DPA, (dpa) => dpa.pembiayaan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dpaId' })
  dpa: DPA;
}
