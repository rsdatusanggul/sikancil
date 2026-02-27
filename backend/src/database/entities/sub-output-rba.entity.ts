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
  Unique,
} from 'typeorm';
import { SubKegiatanRBA } from './subkegiatan-rba.entity';
import { AnggaranBelanjaRBA } from './anggaran-belanja-rba.entity';

/**
 * Entity: SubOutputRBA
 * Sub Output untuk breakdown lebih detail (Level 4, Optional)
 */
@Entity('sub_output_rba')
@Unique(['kodeSubOutput', 'tahun'])
export class SubOutputRBA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeSubOutput: string; // Contoh: "01.01.001.01"

  @Column({ type: 'varchar', length: 500 })
  namaSubOutput: string;

  @Column({ type: 'uuid' })
  @Index()
  subKegiatanId: string;

  // Target
  @Column({ type: 'int' })
  volumeTarget: number;

  @Column({ type: 'varchar', length: 50 })
  satuan: string;

  // Total Pagu
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPagu: number;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SubKegiatanRBA, (subKegiatan) => subKegiatan.subOutput, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subKegiatanId' })
  subKegiatan: SubKegiatanRBA;

  @OneToMany(() => AnggaranBelanjaRBA, (anggaran) => anggaran.subOutput)
  anggaranBelanja: AnggaranBelanjaRBA[];
}
