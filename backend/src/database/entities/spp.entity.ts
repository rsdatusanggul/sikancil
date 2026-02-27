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
import { JenisSPP, StatusSPP } from '../enums';
import { BuktiBayar } from './bukti-bayar.entity';

/**
 * Entity: SPP (Surat Permintaan Pembayaran)
 * Core entity for expenditure workflow
 */
@Entity('spp')
export class SPP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorSPP: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggalSPP: Date;

  @Column({ type: 'enum', enum: JenisSPP })
  jenisSPP: JenisSPP;

  @Column({ type: 'int' })
  tahunAnggaran: number;

  // Pengaju
  @Column({ type: 'uuid' })
  @Index()
  unitKerjaId: string;

  @Column({ type: 'uuid' })
  pengajuId: string;

  // Nilai
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiSPP: number;

  @Column({ type: 'text' })
  uraian: string;

  // Pajak
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph21: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph22: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pph23: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  ppn: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPajak: number;

  // Nilai Bersih
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiBersih: number;

  // Penerima
  @Column({ type: 'varchar', length: 255 })
  namaPenerima: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  npwpPenerima: string;

  @Column({ type: 'varchar', length: 255 })
  bankPenerima: string;

  @Column({ type: 'varchar', length: 100 })
  rekeningPenerima: string;

  // Referensi
  @Column({ type: 'uuid', nullable: true })
  @Index()
  buktiBayarId: string;

  @Column({ type: 'uuid', nullable: true })
  kontrakId: string;

  // Status & Approval
  @Column({ type: 'enum', enum: StatusSPP, default: StatusSPP.DRAFT })
  @Index()
  status: StatusSPP;

  @Column({ type: 'varchar', nullable: true })
  submittedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  rejectedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ type: 'text', nullable: true })
  alasanReject: string;

  // SPM Reference
  @Column({ type: 'uuid', nullable: true })
  spmId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => BuktiBayar, (buktiBayar) => buktiBayar.spp, { nullable: true })
  @JoinColumn({ name: 'buktiBayarId' })
  buktiBayar: BuktiBayar;
}
