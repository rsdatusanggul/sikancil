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
 * Entity: SPJUP
 * Surat Pertanggungjawaban Uang Persediaan
 * Digunakan untuk pertanggungjawaban penggunaan UP sebelum mengajukan GU
 */
@Entity('spj_up')
@Unique(['bulan', 'tahun', 'bendaharaId'])
export class SPJUP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorSPJ: string;

  @Column({ type: 'int' })
  @Index()
  bulan: number; // 1-12

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  // UP Info
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiUP: number; // Nilai UP dari SK

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldoAwalUP: number;

  // Detail Pengeluaran (JSON array)
  // Format: [{tanggal, noBukti, uraian, kodeRekening, jumlah, keterangan}]
  @Column({ type: 'jsonb' })
  detailPengeluaran: any;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPengeluaran: number;

  // Sisa
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sisaUP: number;

  // Dokumen Pendukung (array of file paths)
  @Column({ type: 'jsonb', nullable: true })
  buktiPengeluaran: string[];

  @Column({ type: 'jsonb', nullable: true })
  buktiSetorPajak: string[];

  // Status
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED

  // Workflow
  @Column({ type: 'uuid' })
  @Index()
  bendaharaId: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string; // Verifikator

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string; // PPK atau Pemimpin BLUD

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'text', nullable: true })
  catatanVerifikasi: string;

  @Column({ type: 'text', nullable: true })
  alasanReject: string;

  // Link ke GU
  @Column({ type: 'boolean', default: false })
  isUsedForGU: boolean;

  @Column({ type: 'uuid', nullable: true })
  spjGUId: string; // Link to next GU

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
