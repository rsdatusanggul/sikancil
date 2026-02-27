import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FixedAsset } from './fixed-asset.entity';

/**
 * Entity: DepreciationSchedule
 * Depreciation schedule for fixed assets
 */
@Entity('depreciation_schedules')
export class DepreciationSchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  assetId: string;

  @Column({ type: 'int' })
  tahun: number;

  @Column({ type: 'int' })
  bulan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiAwal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  bebanDepresiasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  akumulasiDepresiasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiBuku: number;

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  @Column({ type: 'uuid', nullable: true })
  journalId: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => FixedAsset, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'assetId' })
  asset: FixedAsset;
}
