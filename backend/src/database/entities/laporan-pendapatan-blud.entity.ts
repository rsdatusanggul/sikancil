import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * Entity: LaporanPendapatanBLUD
 * Laporan Pendapatan BLUD Triwulanan
 * Untuk pengesahan ke PPKD setiap triwulan
 */
@Entity('laporan_pendapatan_blud')
@Unique(['tahun', 'triwulan'])
export class LaporanPendapatanBLUD {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'int' })
  @Index()
  triwulan: number; // 1, 2, 3, 4

  // Jasa Layanan
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  anggaranJasaLayanan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasiJasaLayanan: number;

  // Hibah
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  anggaranHibah: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasiHibah: number;

  // Hasil Kerja Sama
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  anggaranKerjaSama: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasiKerjaSama: number;

  // Pendapatan Lainnya
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  anggaranLainnya: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasiLainnya: number;

  // Total
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAnggaran: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRealisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  selisih: number;

  // Breakdown per bulan (JSON array)
  // Format: [{bulan, jenis, anggaran, realisasi}]
  @Column({ type: 'jsonb', nullable: true })
  detailBulanan: any;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, SUBMITTED, APPROVED, REJECTED

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorLaporan: string;

  // Approval
  @Column({ type: 'uuid', nullable: true })
  submittedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string; // PPKD

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  catatanApproval: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
