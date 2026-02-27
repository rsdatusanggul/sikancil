import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RakSubkegiatan } from './rak-subkegiatan.entity';
import { ChartOfAccount } from '../../../database/entities/chart-of-account.entity';
import { User } from '../../../modules/users/entities/user.entity';

@Entity('rak_detail')
export class RakDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  rak_subkegiatan_id: string;

  @Column('uuid')
  kode_rekening_id: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  jumlah_anggaran: number;

  // Monthly breakdown
  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  januari: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  februari: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  maret: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  april: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  mei: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  juni: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  juli: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  agustus: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  september: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  oktober: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  november: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  desember: number;

  // Generated columns (calculated by DB)
  @Column({ type: 'decimal', precision: 15, scale: 2, select: false, insert: false, update: false })
  semester_1: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, select: false, insert: false, update: false })
  semester_2: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, select: false, insert: false, update: false })
  triwulan_1: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, select: false, insert: false, update: false })
  triwulan_2: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, select: false, insert: false, update: false })
  triwulan_3: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, select: false, insert: false, update: false })
  triwulan_4: number;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @Column('uuid', { nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('uuid', { nullable: true })
  updated_by: string;

  // Relations
  @ManyToOne(() => RakSubkegiatan, (rak) => rak.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rak_subkegiatan_id' })
  rak_subkegiatan: RakSubkegiatan;

  @ManyToOne(() => ChartOfAccount, { eager: true })
  @JoinColumn({ name: 'kode_rekening_id' })
  kode_rekening: ChartOfAccount;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}