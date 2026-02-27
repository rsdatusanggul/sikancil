import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { RencanaAnggaranKas } from './rencana-anggaran-kas.entity';
import { SPP } from './spp.entity';
import { StatusBuktiBayar, JenisBelanjaBuktiBayar } from '../enums';

/**
 * Entity: BuktiBayar
 * Dokumen bukti pembayaran yang dibuat berdasarkan saldo rencana anggaran kas
 * Menjadi dasar pembuatan SPP dalam alur: Rencana Anggaran Kas > Bukti Bayar > SPP > SPM > SP2D
 */
@Entity('bukti_bayar')
export class BuktiBayar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorBuktiBayar: string; // BB-001/BLUD/2026

  @Column({ type: 'timestamp' })
  @Index()
  tanggalBuktiBayar: Date;

  @Column({ type: 'int' })
  @Index()
  tahunAnggaran: number;

  @Column({ type: 'int' })
  @Index()
  bulan: number; // 1-12

  // Relasi ke Anggaran Kas (sumber dana)
  @Column({ type: 'uuid' })
  @Index()
  anggaranKasId: string;

  // Nilai Pembayaran
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiPembayaran: number;

  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  // Jenis Belanja
  @Column({ type: 'enum', enum: JenisBelanjaBuktiBayar })
  @Index()
  jenisBelanja: JenisBelanjaBuktiBayar;

  // Penerima Pembayaran
  @Column({ type: 'varchar', length: 255 })
  namaPenerima: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  npwpPenerima: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  alamatPenerima: string;

  // Rekening Bank Penerima
  @Column({ type: 'varchar', length: 255, nullable: true })
  bankPenerima: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rekeningPenerima: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  atasNamaRekening: string;

  // Status & Workflow
  @Column({ type: 'enum', enum: StatusBuktiBayar, default: StatusBuktiBayar.DRAFT })
  @Index()
  status: StatusBuktiBayar;

  // Approval Workflow
  @Column({ type: 'uuid', nullable: true })
  submittedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  rejectedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  alasanReject: string;

  // Dokumen Pendukung
  @Column({ type: 'varchar', length: 500, nullable: true })
  fileLampiran: string; // Path ke file PDF lampiran

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileBuktiBayar: string; // Path ke file PDF bukti bayar yang sudah digenerate

  // Metadata
  @Column({ type: 'varchar', length: 255 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => RencanaAnggaranKas, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'anggaranKasId' })
  anggaranKas: RencanaAnggaranKas;

  @OneToMany(() => SPP, (spp) => spp.buktiBayar)
  spp: SPP[];
}
