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
 * Entity: SPTJ
 * Surat Pernyataan Tanggung Jawab
 * Pernyataan dari Pemimpin BLUD untuk pengesahan pengeluaran triwulanan
 */
@Entity('sptj')
@Unique(['tahun', 'triwulan'])
export class SPTJ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorSPTJ: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'int' })
  @Index()
  triwulan: number; // 1, 2, 3, 4

  // Total Pengeluaran
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPengeluaran: number;

  @Column({ type: 'text' })
  totalPengeluaranText: string; // Terbilang

  // Sumber Dana (JSON)
  // Format: {jasaLayanan: number, hibah: number, kerjaSama: number, lainnya: number}
  @Column({ type: 'jsonb' })
  sumberDana: any;

  // Pernyataan (boolean checkboxes)
  @Column({ type: 'boolean', default: true })
  pernyataanSPI: boolean; // Sistem Pengendalian Intern memadai

  @Column({ type: 'boolean', default: true })
  pernyataanDPA: boolean; // Sesuai DPA BLUD

  @Column({ type: 'boolean', default: true })
  pernyataanAkuntansi: boolean; // Sesuai Standar Akuntansi

  @Column({ type: 'boolean', default: true })
  pernyataanBukti: boolean; // Bukti-bukti ada

  // Link ke Laporan Pengeluaran
  @Column({ type: 'uuid', nullable: true })
  @Index()
  laporanPengeluaranId: string;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, SIGNED, SUBMITTED, APPROVED

  // Penandatangan (Pemimpin BLUD)
  @Column({ type: 'varchar', length: 255 })
  pemimpinBLUD: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nipPemimpin: string;

  @Column({ type: 'timestamp' })
  tanggalTandaTangan: Date;

  // Submission ke PPKD
  @Column({ type: 'varchar', length: 255, nullable: true })
  submittedTo: string; // Nama PPKD

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
