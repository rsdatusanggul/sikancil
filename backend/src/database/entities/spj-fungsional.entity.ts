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
 * Entity: SPJFungsional
 * SPJ Fungsional (Triwulanan ke PPKD)
 * Pertanggungjawaban lengkap dengan SPM dan SP2D Pengesahan
 */
@Entity('spj_fungsional')
@Unique(['tahun', 'triwulan'])
export class SPJFungsional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorSPJ: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'int' })
  @Index()
  triwulan: number; // 1, 2, 3, 4

  // Link ke Laporan-laporan
  @Column({ type: 'uuid' })
  @Index()
  laporanPendapatanId: string;

  @Column({ type: 'uuid' })
  @Index()
  laporanPengeluaranId: string;

  @Column({ type: 'uuid' })
  @Index()
  sptjId: string;

  // SPM Pengesahan
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSPM: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSPM: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nilaiSPM: number;

  // SP2D Pengesahan (dari PPKD)
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSP2D: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSP2D: Date;

  @Column({ type: 'varchar', length: 50, default: 'PENDING' })
  @Index()
  statusPengesahan: string; // PENDING, APPROVED, REJECTED

  // Dokumen Pendukung (array of file paths)
  @Column({ type: 'jsonb', nullable: true })
  rekeningKoran: string[];

  @Column({ type: 'jsonb', nullable: true })
  buktiTransaksi: string[];

  @Column({ type: 'jsonb', nullable: true })
  dokumenLainnya: string[];

  // Status
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED

  // Workflow
  @Column({ type: 'uuid', nullable: true })
  submittedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string; // PPKD verifikator

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string; // PPKD approver

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  // Catatan
  @Column({ type: 'text', nullable: true })
  catatanVerifikasi: string;

  @Column({ type: 'text', nullable: true })
  alasanReject: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
