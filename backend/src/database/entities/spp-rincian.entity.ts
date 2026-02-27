import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SPP } from './spp.entity';

/**
 * Entity: SPPRincian
 * Detail/rincian item dalam SPP
 */
@Entity('spp_rincian')
export class SPPRincian {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  sppId: string;

  @Column({ type: 'varchar', length: 20 })
  kodeRekening: string;

  @Column({ type: 'varchar', length: 255 })
  uraian: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  volume: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  satuan: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  hargaSatuan: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  jumlah: number;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => SPP, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sppId' })
  spp: SPP;
}
