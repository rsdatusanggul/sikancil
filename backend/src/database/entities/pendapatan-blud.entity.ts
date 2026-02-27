import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  SumberDanaBLUD,
  TransactionStatus,
  KategoriPendapatanBLUD,
  JenisPenjamin,
} from '../enums';
import { HibahBLUD } from './hibah-blud.entity';
import { SIMRSBilling } from './simrs-billing.entity';

/**
 * Entity: PendapatanBLUD
 * Enhanced revenue management with BLUD classification
 */
@Entity('pendapatan_blud')
export class PendapatanBLUD {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorBukti: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  // Klasifikasi BLUD Specific
  @Column({ type: 'enum', enum: SumberDanaBLUD })
  @Index()
  sumberDana: SumberDanaBLUD;

  @Column({ type: 'enum', enum: KategoriPendapatanBLUD })
  @Index()
  kategoriPendapatan: KategoriPendapatanBLUD;

  // Untuk Pendapatan Jasa Layanan
  @Column({ type: 'enum', enum: JenisPenjamin, nullable: true })
  @Index()
  jenisPenjamin: JenisPenjamin;

  // Detail
  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  jumlah: number;

  // Jika dari SIMRS
  @Column({ type: 'uuid', nullable: true })
  @Index()
  simrsBillingId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  simrsReferenceId: string;

  @Column({ type: 'jsonb', nullable: true })
  simrsData: any;

  // Jika APBD
  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorSP2D: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSP2D: Date;

  // Jika Hibah
  @Column({ type: 'uuid', nullable: true })
  @Index()
  hibahId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pemberiHibah: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorSKHibah: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSKHibah: Date;

  // Penyetoran
  @Column({ type: 'boolean', default: false })
  disetor: boolean;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSetor: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorSTS: string; // Surat Tanda Setoran

  // BKU Reference
  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  nomorBKU: string;

  // Journal
  @Column({ type: 'uuid', nullable: true, unique: true })
  journalId: string;

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  // Unit Kerja
  @Column({ type: 'uuid', nullable: true })
  unitKerjaId: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.DRAFT })
  status: TransactionStatus;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => HibahBLUD, { nullable: true })
  @JoinColumn({ name: 'hibahId' })
  hibah: HibahBLUD;

  @ManyToOne(() => SIMRSBilling, { nullable: true })
  @JoinColumn({ name: 'simrsBillingId' })
  simrsBilling: SIMRSBilling;
}
