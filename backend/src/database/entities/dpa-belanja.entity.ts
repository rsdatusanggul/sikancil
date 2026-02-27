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
 * Entity: DPABelanja
 * Rincian Belanja dalam DPA per Program-Kegiatan-Output dengan kode rekening
 * Dibuat dari struktur RBA yang sudah approved
 */
@Entity('dpa_belanja')
export class DPABelanja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  dpaId: string;

  // Link ke Struktur RBA (optional - untuk tracking)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  programId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  kegiatanId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  outputId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  subOutputId: string;

  // Kode Program-Kegiatan-Output
  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeProgram: string; // "01"

  @Column({ type: 'varchar', length: 500 })
  namaProgram: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeKegiatan: string; // "01.01"

  @Column({ type: 'varchar', length: 500 })
  namaKegiatan: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeOutput: string; // "01.01.001"

  @Column({ type: 'varchar', length: 500 })
  namaOutput: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  kodeSubOutput: string; // "01.01.001.A" (optional)

  @Column({ type: 'varchar', length: 500, nullable: true })
  namaSubOutput: string;

  // Kode Rekening Belanja
  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string; // "5.1.01.01"

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string;

  // Klasifikasi
  @Column({ type: 'varchar', length: 50 })
  jenisBelanja: string; // OPERASIONAL, MODAL, TAK_TERDUGA

  @Column({ type: 'varchar', length: 50 })
  kategori: string; // PEGAWAI, BARANG_JASA, MODAL

  @Column({ type: 'varchar', length: 50 })
  @Index()
  sumberDana: string; // APBD, FUNGSIONAL, HIBAH, LAINNYA

  // Target Output
  @Column({ type: 'int', nullable: true })
  volumeTarget: number; // Jumlah target

  @Column({ type: 'varchar', length: 50, nullable: true })
  satuan: string; // Orang, Kunjungan, Kegiatan, dll

  // Pagu
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

  // Realisasi & Monitoring (updated dari transaksi)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  komitmen: number; // Dari kontrak yang sudah ditandatangani

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sisa: number; // Pagu - (Realisasi + Komitmen)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  persentaseRealisasi: number; // (Realisasi / Pagu) * 100

  // Unit Pelaksana
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
  @ManyToOne(() => DPA, (dpa) => dpa.belanja, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dpaId' })
  dpa: DPA;
}
