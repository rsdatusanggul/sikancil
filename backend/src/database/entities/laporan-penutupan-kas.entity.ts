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
 * Entity: LaporanPenutupanKas
 * Laporan Penutupan Kas (Monthly Cash Reconciliation)
 * Rekonsiliasi kas tunai dan bank setiap bulan
 */
@Entity('laporan_penutupan_kas')
@Unique(['bulan', 'tahun', 'bendaharaId'])
export class LaporanPenutupanKas {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Index()
  bulan: number; // 1-12

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  // Kas Tunai
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoBKUTunai: number; // Saldo menurut BKU

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  kasAktualTunai: number; // Kas hasil perhitungan fisik

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  selisihTunai: number; // Selisih (lebih/kurang)

  // Kas Bank (JSON array)
  // Format: [{bankId, namaBank, nomorRekening, saldoBKU, saldoBank, selisih}]
  @Column({ type: 'jsonb' })
  detailBank: any;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSaldoBKUBank: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSaldoAktualBank: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSelisihBank: number;

  // Total Kas
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalKas: number; // Kas Tunai + Kas Bank

  // Penjelasan Selisih (jika ada)
  @Column({ type: 'text', nullable: true })
  penjelasanSelisih: string;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, APPROVED, REJECTED

  // Approval
  @Column({ type: 'uuid' })
  @Index()
  bendaharaId: string;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string; // Pemimpin BLUD

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
}
