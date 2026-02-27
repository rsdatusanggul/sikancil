import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: SPJTU
 * Surat Pertanggungjawaban Tambahan Uang Persediaan
 * Untuk kebutuhan mendesak di luar UP yang tersedia
 */
@Entity('spj_tu')
export class SPJTU {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorSPJ: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  // Alasan TU
  @Column({ type: 'text' })
  alasanTU: string; // Mengapa perlu TU, kebutuhan mendesak apa

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sisaUPSaatIni: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  persentaseSisaUP: number; // Persentase sisa UP (%)

  // Kebutuhan Mendesak
  @Column({ type: 'text' })
  kebutuhanMendesak: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiTU: number;

  // Detail Penggunaan (JSON array)
  // Format: [{tanggal, noBukti, uraian, kodeRekening, jumlah}]
  @Column({ type: 'jsonb' })
  detailPengeluaran: any;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPengeluaran: number;

  // Sisa TU (harus disetorkan)
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sisaTU: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  buktiSetor: string; // File path bukti setor sisa

  @Column({ type: 'timestamp', nullable: true })
  tanggalSetor: Date;

  // Link ke SPP/SPM/SP2D
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSPP: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSPM: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSP2D: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSP2D: Date;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, APPROVED, USED, SETTLED, REJECTED

  // Pertanggungjawaban
  @Column({ type: 'timestamp' })
  batasPertanggungjawaban: Date; // Max 1 bulan dari SP2D

  @Column({ type: 'boolean', default: false })
  isPertanggungjawab: boolean;

  @Column({ type: 'text', nullable: true })
  alasanReject: string;

  @Column({ type: 'uuid' })
  @Index()
  bendaharaId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
