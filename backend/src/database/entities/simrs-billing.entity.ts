import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { JenisPenjamin } from '../enums';

/**
 * Entity: SIMRSBilling
 * Data billing dari SIMRS untuk sinkronisasi pendapatan
 * Real-time sync dengan delay maksimal 5 menit
 */
@Entity('simrs_billing')
export class SIMRSBilling {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // SIMRS Reference
  @Column({ unique: true, length: 100 })
  @Index()
  simrsId: string; // ID billing dari SIMRS

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorRegistrasi: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorRM: string; // Nomor Rekam Medis

  // Pasien Info
  @Column({ type: 'varchar', length: 255 })
  namaPasien: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nomorIdentitas: string; // NIK/KTP

  // Billing Info
  @Column({ type: 'timestamp' })
  @Index()
  tanggalBilling: Date;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  jenisLayanan: string; // Rawat Jalan, Rawat Inap, IGD, Lab, Radiologi, dll

  @Column({ type: 'enum', enum: JenisPenjamin })
  @Index()
  jenisPenjamin: JenisPenjamin;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorKartuPenjamin: string; // Nomor kartu BPJS, Asuransi, dll

  // Breakdown Biaya
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaTindakan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaObat: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaLaboratorium: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaRadiologi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaKonsultasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  biayaLainnya: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalTagihan: number;

  // Pembayaran
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dibayarPenjamin: number; // Yang dibayar oleh BPJS/Asuransi

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  dibayarPasien: number; // Yang dibayar langsung oleh pasien

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  piutang: number; // Sisa yang belum terbayar

  @Column({ type: 'boolean', default: false })
  lunas: boolean;

  // Mapping ke Akun Pendapatan
  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  kodeRekeningPendapatan: string; // Auto-mapped dari jenis layanan

  // Raw Data dari SIMRS (JSON)
  @Column({ type: 'jsonb', nullable: true })
  rawData: any; // Original data dari SIMRS API

  // Sync Status
  @Column({ type: 'boolean', default: false })
  @Index()
  isSynced: boolean; // Sudah di-sync ke PendapatanBLUD?

  @Column({ type: 'timestamp', nullable: true })
  syncedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  pendapatanBludId: string; // Link ke PendapatanBLUD setelah sync

  @Column({ type: 'boolean', default: false })
  syncError: boolean;

  @Column({ type: 'text', nullable: true })
  syncErrorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  // Dokter & Unit Kerja
  @Column({ type: 'varchar', length: 255, nullable: true })
  namaDokter: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  namaPoliklinik: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string; // Mapping ke Unit Kerja di Si-Kancil

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  lastSyncAttempt: Date;
}
