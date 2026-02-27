import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  Unique,
} from 'typeorm';
import { BiayaPerObjek } from './biaya-per-objek.entity';

/**
 * Entity: LaporanPengeluaranBiayaBLUD
 * Laporan Pengeluaran Biaya BLUD Triwulanan
 * Dengan breakdown per kode rekening
 */
@Entity('laporan_pengeluaran_biaya_blud')
@Unique(['tahun', 'triwulan'])
export class LaporanPengeluaranBiayaBLUD {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'int' })
  @Index()
  triwulan: number; // 1, 2, 3, 4

  // Detail Biaya (JSON array) - Summary level
  // Format: [{kode, uraian, anggaran, realisasi, selisih}]
  @Column({ type: 'jsonb' })
  detailBiaya: any;

  // Summary
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBiayaOperasional: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalBiayaNonOps: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalAnggaran: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRealisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  selisih: number;

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

  // Relations
  @OneToMany(() => BiayaPerObjek, (biaya) => biaya.laporanPengeluaran)
  detailPerObjek: BiayaPerObjek[];
}
