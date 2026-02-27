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
import { JenisBelanjaBLUD } from '../enums';
import { RBA } from './rba.entity';

/**
 * Entity: RBABelanja
 * Detail proyeksi belanja dalam RBA
 */
@Entity('rba_belanja')
export class RBABelanja {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  rbaId: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string;

  @Column({ type: 'varchar', length: 255 })
  uraian: string;

  @Column({ type: 'enum', enum: JenisBelanjaBLUD })
  jenisBelanja: JenisBelanjaBLUD;

  // Proyeksi per triwulan
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tw1: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tw2: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tw3: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  tw4: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalProyeksi: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => RBA, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rbaId' })
  rba: RBA;
}
