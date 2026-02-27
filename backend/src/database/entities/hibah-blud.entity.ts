import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { JenisHibah, StatusHibah, TransactionStatus } from '../enums';

/**
 * Entity: HibahBLUD
 * Manajemen hibah untuk BLUD (Uang/Barang/Jasa)
 * Sesuai dengan PMK 220/2016 tentang BLUD
 */
@Entity('hibah_blud')
export class HibahBLUD {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorHibah: string; // Nomor registrasi hibah internal

  // SK Hibah
  @Column({ type: 'varchar', length: 100 })
  @Index()
  nomorSKHibah: string; // Nomor Surat Keputusan Hibah

  @Column({ type: 'timestamp' })
  @Index()
  tanggalSKHibah: Date;

  // Pemberi Hibah
  @Column({ type: 'varchar', length: 255 })
  @Index()
  namaPemberiHibah: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alamatPemberiHibah: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  teleponPemberiHibah: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emailPemberiHibah: string;

  // Jenis & Klasifikasi
  @Column({ type: 'enum', enum: JenisHibah })
  @Index()
  jenisHibah: JenisHibah;

  @Column({ type: 'text' })
  uraianHibah: string;

  // Nilai Hibah (untuk hibah uang)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nilaiHibah: number;

  // Detail Barang/Jasa (jika jenisHibah = BARANG atau JASA)
  @Column({ type: 'jsonb', nullable: true })
  detailBarangJasa: any; // [{namaBarang, kuantitas, satuan, nilaiEstimasi}]

  // Tanggal Penerimaan
  @Column({ type: 'timestamp', nullable: true })
  tanggalTerima: Date;

  // Dokumen SK Hibah (file path atau URL)
  @Column({ type: 'varchar', length: 500, nullable: true })
  dokumenSKHibah: string;

  @Column({ type: 'jsonb', nullable: true })
  dokumenPendukung: any; // [{namaFile, path, uploadedAt}]

  // Tracking Penggunaan
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nilaiTerpakai: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sisaHibah: number;

  @Column({ type: 'enum', enum: StatusHibah, default: StatusHibah.DITERIMA })
  @Index()
  statusPenggunaan: StatusHibah;

  // Laporan Pertanggungjawaban
  @Column({ type: 'boolean', default: false })
  sudahDilaporkan: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorLaporanPertanggungjawaban: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalLaporan: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  dokumenLaporan: string;

  // Unit Kerja Penerima
  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string;

  // Accounting Link
  @Column({ type: 'uuid', nullable: true, unique: true })
  journalId: string; // Link to journal entry (saat penerimaan)

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  // Status & Workflow
  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.DRAFT })
  @Index()
  status: TransactionStatus;

  @Column({ type: 'text', nullable: true })
  catatan: string;

  // Audit Fields
  @Column({ type: 'varchar' })
  createdBy: string;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
