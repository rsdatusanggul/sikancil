import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { RBA } from './rba.entity';

/**
 * Entity: RBAPembiayaan
 * Detail proyeksi pembiayaan dalam RBA
 */
@Entity('rba_pembiayaan')
export class RBAPembiayaan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  rbaId: string;

  @Column({ type: 'varchar', length: 50 })
  jenis: string; // PENERIMAAN, PENGELUARAN

  @Column({ type: 'varchar', length: 20 })
  kodeRekening: string;

  @Column({ type: 'varchar', length: 255 })
  uraian: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilai: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => RBA, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rbaId' })
  rba: RBA;
}
