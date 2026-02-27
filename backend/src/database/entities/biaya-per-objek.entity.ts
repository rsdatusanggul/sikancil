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
import { LaporanPengeluaranBiayaBLUD } from './laporan-pengeluaran-biaya-blud.entity';

/**
 * Entity: BiayaPerObjek
 * Rekap Pengeluaran Per Objek (Detail breakdown)
 * CRITICAL untuk laporan penatausahaan
 * Struktur kode rekening 6 level
 */
@Entity('biaya_per_objek')
export class BiayaPerObjek {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  bulan: number; // 1-12, null jika tahunan

  @Column({ type: 'int', nullable: true })
  @Index()
  triwulan: number; // 1-4, untuk grouping

  // Kode Rekening (6 level)
  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string; // Contoh: 5.1.01.01

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string;

  @Column({ type: 'int' })
  levelRekening: number; // 1-6

  @Column({ type: 'varchar', length: 20, nullable: true })
  parentKode: string; // Parent kode rekening

  // Klasifikasi
  @Column({ type: 'varchar', length: 50 })
  @Index()
  kategori: string; // OPERASIONAL, NON_OPERASIONAL

  @Column({ type: 'varchar', length: 50, nullable: true })
  subKategori: string; // PELAYANAN, UMUM_ADM

  // Unit Kerja (opsional)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string;

  // Sumber Dana
  @Column({ type: 'varchar', length: 50 })
  @Index()
  sumberDana: string; // APBD, FUNGSIONAL, HIBAH

  // Anggaran & Realisasi
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pagu: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sisa: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  persentase: number; // Realisasi/Pagu * 100

  // Link ke transaksi (array of transaction IDs)
  @Column({ type: 'jsonb', nullable: true })
  transaksiIds: string[];

  // Link ke laporan
  @Column({ type: 'uuid', nullable: true })
  @Index()
  laporanPengeluaranId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(
    () => LaporanPengeluaranBiayaBLUD,
    (laporan) => laporan.detailPerObjek,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'laporanPengeluaranId' })
  laporanPengeluaran: LaporanPengeluaranBiayaBLUD;
}
