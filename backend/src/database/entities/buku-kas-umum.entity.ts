import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  Unique,
} from 'typeorm';

/**
 * Entity: BKU (Buku Kas Umum)
 * Central cash book for BLUD
 */
@Entity('buku_kas_umum')
@Unique(['nomorUrut'])
export class BukuKasUmum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  @Index()
  nomorUrut: number;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  // Klasifikasi
  @Column({ type: 'varchar', length: 50 })
  @Index()
  jenis: string; // PENERIMAAN, PENGELUARAN

  // Uraian
  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'varchar', length: 20 })
  kodeRekening: string;

  // Nilai
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penerimaan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pengeluaran: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldo: number;

  // Referensi
  @Column({ type: 'varchar', length: 50, nullable: true })
  referenceType: string; // SP2D, STS, TUNAI, BANK

  @Column({ type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  referenceNo: string;

  // Journal
  @Column({ type: 'uuid', nullable: true })
  journalId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
