import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: SPJGU
 * Surat Pertanggungjawaban Ganti Uang Persediaan
 * Gabungan dari SPJ UP yang telah disahkan untuk penggantian UP
 */
@Entity('spj_gu')
export class SPJGU {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorSPJ: string;

  @Column({ type: 'timestamp' })
  periodeAwal: Date;

  @Column({ type: 'timestamp' })
  periodeAkhir: Date;

  // SPJ UP yang digabung (array of SPJ UP IDs)
  @Column({ type: 'jsonb' })
  spjUPIds: string[];

  // Total GU yang dimintakan
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalGU: number;

  // Rekap per Kode Rekening (JSON array)
  // Format: [{kodeRekening, uraian, jumlah}]
  @Column({ type: 'jsonb' })
  rekapPerRekening: any;

  // Link ke SPP/SPM/SP2D
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSPP: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSPP: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSPM: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSPM: Date;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  nomorSP2D: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSP2D: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  nilaiSP2D: number;

  // Status
  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, SPJ_APPROVED, SPP_CREATED, SPM_ISSUED, SP2D_ISSUED

  // Workflow
  @Column({ type: 'uuid' })
  @Index()
  bendaharaId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
