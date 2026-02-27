import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DPABelanja } from './dpa-belanja.entity';
import { DPAPendapatan } from './dpa-pendapatan.entity';
import { DPAPembiayaan } from './dpa-pembiayaan.entity';
import { DPAHistory } from './dpa-history.entity';

/**
 * Entity: DPA
 * Dokumen Pelaksanaan Anggaran / Dokumen Pelaksanaan Perubahan Anggaran
 * Dokumen resmi pelaksanaan anggaran BLUD yang dibuat dari RBA yang sudah disetujui
 */
@Entity('dpa')
export class DPA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorDPA: string; // DPA-001/BLUD/2026

  @Column({ type: 'varchar', length: 10 })
  @Index()
  jenisDokumen: string; // DPA, DPPA

  @Column({ type: 'int' })
  @Index()
  tahun: number; // Tahun pembuatan dokumen

  @Column({ type: 'int' })
  @Index()
  tahunAnggaran: number; // Tahun anggaran yang dilaksanakan

  // Status & Workflow
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, SUBMITTED, APPROVED, REJECTED, ACTIVE, REVISED

  @Column({ type: 'timestamp', nullable: true })
  tanggalDokumen: Date;

  @Column({ type: 'timestamp', nullable: true })
  tanggalBerlaku: Date;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSelesai: Date;

  // Relasi ke RBA (source data)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  revisiRBAId: string; // Link ke revisi RBA yang sudah approved

  // DPA sebelumnya (untuk DPPA)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  dpaSebelumnyaId: string; // Link ke DPA yang diganti (untuk DPPA)

  @Column({ type: 'int', default: 0 })
  nomorRevisi: number; // 0 untuk DPA awal, 1,2,3... untuk DPPA

  @Column({ type: 'text', nullable: true })
  alasanRevisi: string; // Wajib untuk DPPA

  // Total Anggaran (calculated)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaguPendapatan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaguBelanja: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPaguPembiayaan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRealisasiPendapatan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRealisasiBelanja: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalRealisasiPembiayaan: number;

  // Approval Workflow
  @Column({ type: 'uuid', nullable: true })
  diajukanOleh: string; // User ID (Pemimpin BLUD)

  @Column({ type: 'timestamp', nullable: true })
  tanggalPengajuan: Date;

  @Column({ type: 'uuid', nullable: true })
  disetujuiOleh: string; // User ID (PPKD)

  @Column({ type: 'timestamp', nullable: true })
  tanggalPersetujuan: Date;

  @Column({ type: 'text', nullable: true })
  catatanPersetujuan: string;

  // SK Pengesahan
  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorSK: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSK: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  fileSK: string; // Path ke file PDF SK

  // Dokumen
  @Column({ type: 'varchar', length: 500, nullable: true })
  fileDPA: string; // Path ke file PDF DPA yang sudah digenerate

  // Metadata
  @Column({ type: 'varchar', length: 255 })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => DPA, { nullable: true })
  @JoinColumn({ name: 'dpaSebelumnyaId' })
  dpaSebelumnya: DPA;

  @OneToMany(() => DPABelanja, (belanja) => belanja.dpa)
  belanja: DPABelanja[];

  @OneToMany(() => DPAPendapatan, (pendapatan) => pendapatan.dpa)
  pendapatan: DPAPendapatan[];

  @OneToMany(() => DPAPembiayaan, (pembiayaan) => pembiayaan.dpa)
  pembiayaan: DPAPembiayaan[];

  @OneToMany(() => DPAHistory, (history) => history.dpa)
  history: DPAHistory[];
}
