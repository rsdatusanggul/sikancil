import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';

/**
 * Entity: RBA (Rencana Bisnis dan Anggaran)
 * Master RBA for BLUD planning
 */
@Entity('rba')
export class RBA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  kode: string;

  @Column({ type: 'int' })
  @Index()
  tahunAnggaran: number;

  // Status
  @Column({ type: 'varchar', length: 50 })
  @Index()
  status: string; // DRAFT, SUBMITTED, APPROVED, REVISED

  @Column({ type: 'int', default: 0 })
  revisiKe: number;

  // Komponen RBA
  @Column({ type: 'text', nullable: true })
  visi: string;

  @Column({ type: 'text', nullable: true })
  misi: string;

  @Column({ type: 'text', nullable: true })
  tujuan: string;

  // Target Kinerja (JSON)
  @Column({ type: 'jsonb', nullable: true })
  targetOutput: any;

  @Column({ type: 'jsonb', nullable: true })
  iku: any; // Indikator Kinerja Utama

  // Total Proyeksi
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  proyeksiPendapatan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  proyeksiBelanja: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  proyeksiPembiayaan: number;

  // Approval
  @Column({ type: 'timestamp' })
  tanggalPenyusunan: Date;

  @Column({ type: 'timestamp', nullable: true })
  tanggalApproval: Date;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
