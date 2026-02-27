import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { AssetStatus, DepreciationMethod } from '../enums';

/**
 * Entity: FixedAsset
 * Fixed assets management
 */
@Entity('fixed_assets')
export class FixedAsset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  kodeAset: string;

  @Column({ type: 'varchar', length: 255 })
  namaAset: string;

  @Column({ type: 'varchar', length: 100 })
  kategori: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lokasi: string;

  // Purchase info
  @Column({ type: 'date' })
  tanggalPerolehan: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiPerolehan: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  supplier: string;

  // Depreciation
  @Column({ type: 'enum', enum: DepreciationMethod })
  metodeDepresiasi: DepreciationMethod;

  @Column({ type: 'int' })
  umurEkonomis: number; // in years

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  nilaiResidu: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  akumulasiDepresiasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiBuku: number;

  // Status
  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.ACTIVE })
  @Index()
  status: AssetStatus;

  @Column({ type: 'date', nullable: true })
  tanggalDisposal: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  nilaiDisposal: number;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
