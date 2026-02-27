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
 * Entity: DPAPendapatan
 * Rincian Pendapatan dalam DPA dengan kode rekening
 * Target pendapatan yang akan dicapai dalam tahun anggaran
 */
@Entity('dpa_pendapatan')
export class DPAPendapatan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  dpaId: string;

  // Kode Rekening Pendapatan
  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string; // "4.1.01.01"

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string;

  // Klasifikasi
  @Column({ type: 'varchar', length: 50 })
  @Index()
  jenisPendapatan: string; // OPERASIONAL, NON_OPERASIONAL, HIBAH, TRANSFER_APBD

  @Column({ type: 'varchar', length: 50 })
  kategori: string; // JASA_LAYANAN, USAHA_LAIN, BUNGA, SEWA, dll

  // Sumber/Asal Pendapatan
  @Column({ type: 'varchar', length: 100, nullable: true })
  sumberPendapatan: string; // BPJS, UMUM, ASURANSI, APBD, dll

  // Anggaran/Target
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pagu: number;

  // Breakdown Bulanan (untuk monitoring kas)
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

  // Realisasi (updated dari transaksi)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sisa: number; // Pagu - Realisasi

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  persentaseRealisasi: number; // (Realisasi / Pagu) * 100

  // Unit Kerja (jika applicable)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => DPA, (dpa) => dpa.pendapatan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dpaId' })
  dpa: DPA;
}
