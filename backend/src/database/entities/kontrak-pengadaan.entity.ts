import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { JenisPengadaan, MetodePengadaan, KontrakStatus } from '../enums';

/**
 * Entity: KontrakPengadaan
 * Contract and procurement management
 */
@Entity('kontrak_pengadaan')
export class KontrakPengadaan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorKontrak: string;

  @Column({ type: 'timestamp' })
  tanggalKontrak: Date;

  // Vendor
  @Column({ type: 'uuid', nullable: true })
  vendorId: string;

  @Column({ type: 'varchar', length: 255 })
  namaVendor: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  npwpVendor: string;

  // Jenis
  @Column({ type: 'enum', enum: JenisPengadaan })
  jenisPengadaan: JenisPengadaan;

  @Column({ type: 'enum', enum: MetodePengadaan })
  metodePengadaan: MetodePengadaan;

  // Nilai
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiKontrak: number;

  // Anggaran
  @Column({ type: 'int' })
  @Index()
  tahunAnggaran: number;

  @Column({ type: 'varchar', length: 20 })
  kodeRekening: string;

  // Periode
  @Column({ type: 'date' })
  tanggalMulai: Date;

  @Column({ type: 'date' })
  tanggalSelesai: Date;

  // Progress
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  progresRealisasi: number;

  // Pembayaran
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalDibayar: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  sisaKontrak: number;

  // Status
  @Column({ type: 'enum', enum: KontrakStatus })
  @Index()
  status: KontrakStatus;

  // Dokumen
  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
