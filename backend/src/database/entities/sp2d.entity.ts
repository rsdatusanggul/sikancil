import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: SP2D (Surat Perintah Pencairan Dana)
 * Final stage of expenditure workflow
 */
@Entity('sp2d')
export class SP2D {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorSP2D: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggalSP2D: Date;

  // Nilai
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiSP2D: number;

  // Pencairan
  @Column({ type: 'timestamp', nullable: true })
  tanggalCair: Date;

  @Column({ type: 'varchar', length: 50 })
  statusCair: string; // PENDING, CAIR, GAGAL

  // Bank
  @Column({ type: 'varchar', length: 255 })
  bankPencairan: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorReferensi: string; // No. transaksi bank

  // Approval Final
  @Column({ type: 'varchar' })
  approvedBy: string; // Pemimpin BLUD

  @Column({ type: 'timestamp' })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ttdDigital: string;

  // BKU & Jurnal
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  nomorBKU: string;

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  @Column({ type: 'uuid', nullable: true, unique: true })
  journalId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
