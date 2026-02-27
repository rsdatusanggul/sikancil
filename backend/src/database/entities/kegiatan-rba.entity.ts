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
import { ProgramRBA } from './program-rba.entity';
import { SubKegiatanRBA } from './subkegiatan-rba.entity';

/**
 * Entity: KegiatanRBA
 * Master Kegiatan dalam Program RBA (Level 2)
 * Note: Unique constraint on (kodeKegiatan, tahun) handled by partial index in DB
 */
@Entity('kegiatan_rba')
export class KegiatanRBA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeKegiatan: string; // Contoh: "01.01", "01.02"

  @Column({ type: 'varchar', length: 500 })
  namaKegiatan: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'uuid' })
  @Index()
  programId: string;

  // Indikator Kegiatan (JSON array)
  // Format: [{nama: string, satuan: string, target: number}]
  @Column({ type: 'jsonb', nullable: true })
  indikatorKegiatan: any;

  // Pagu Anggaran Kegiatan (dalam Rupiah)
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true, default: 0 })
  paguAnggaran: number;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ProgramRBA, (program) => program.kegiatan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'programId' })
  program: ProgramRBA;

  @OneToMany(() => SubKegiatanRBA, (subKegiatan) => subKegiatan.kegiatan)
  subKegiatan: SubKegiatanRBA[];
}
