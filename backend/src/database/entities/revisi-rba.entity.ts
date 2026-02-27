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
 * Entity: RevisiRBA
 * Tracking revisi RBA
 */
@Entity('revisi_rba')
export class RevisiRBA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  rbaId: string;

  @Column({ type: 'int' })
  revisiKe: number;

  @Column({ type: 'timestamp' })
  tanggalRevisi: Date;

  @Column({ type: 'text' })
  alasanRevisi: string;

  // Perubahan (JSON)
  @Column({ type: 'jsonb' })
  perubahanData: any;

  // Approval
  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => RBA)
  @JoinColumn({ name: 'rbaId' })
  rba: RBA;
}
