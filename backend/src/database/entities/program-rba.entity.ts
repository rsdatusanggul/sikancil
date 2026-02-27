import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  Unique,
} from 'typeorm';
import { KegiatanRBA } from './kegiatan-rba.entity';

/**
 * Entity: ProgramRBA
 * Master Program untuk struktur RBA BLUD (Level 1)
 * Sesuai Permendagri 61/2007 - Struktur Program-Kegiatan-Output
 */
@Entity('program_rba')
@Index(['kodeProgram', 'tahun'], { unique: true })
export class ProgramRBA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeProgram: string; // Contoh: "01", "02", "03"

  @Column({ type: 'varchar', length: 500 })
  namaProgram: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  // Indikator Program (JSON array)
  // Format: [{nama: string, satuan: string, target: number}]
  @Column({ type: 'jsonb', nullable: true })
  indikatorProgram: any;

  // Pagu Anggaran Program (dalam Rupiah)
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
  @OneToMany(() => KegiatanRBA, (kegiatan) => kegiatan.program)
  kegiatan: KegiatanRBA[];
}
