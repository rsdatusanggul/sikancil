import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { SubKegiatanRBA } from '../../../database/entities/subkegiatan-rba.entity';
import { User } from '../../../modules/users/entities/user.entity';
import { RakDetail } from './rak-detail.entity';

export enum RakStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISED = 'REVISED',
}

@Entity('rak_subkegiatan')
export class RakSubkegiatan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  subkegiatan_id: string;

  @Column('integer')
  tahun_anggaran: number;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  total_pagu: number;

  @Column({
    type: 'enum',
    enum: RakStatus,
    default: RakStatus.DRAFT,
  })
  status: RakStatus;

  @Column('integer', { default: 1 })
  revision_number: number;

  @Column('uuid', { nullable: true })
  previous_version_id: string;

  // Submission
  @Column('timestamp', { nullable: true })
  submitted_at: Date;

  @Column('uuid', { nullable: true })
  submitted_by: string;

  // Approval
  @Column('timestamp', { nullable: true })
  approved_at: Date;

  @Column('uuid', { nullable: true })
  approved_by: string;

  @Column('text', { nullable: true })
  approval_notes: string;

  // Rejection
  @Column('timestamp', { nullable: true })
  rejected_at: Date;

  @Column('uuid', { nullable: true })
  rejected_by: string;

  @Column('text', { nullable: true })
  rejection_reason: string;

  // Metadata
  @CreateDateColumn()
  created_at: Date;

  @Column('uuid', { nullable: true })
  created_by: string;

  @UpdateDateColumn()
  updated_at: Date;

  @Column('uuid', { nullable: true })
  updated_by: string;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column('uuid', { nullable: true })
  deleted_by: string;

  // Relations
  @ManyToOne(() => SubKegiatanRBA, { eager: true })
  @JoinColumn({ name: 'subkegiatan_id' })
  subkegiatan: SubKegiatanRBA;

  @OneToMany(() => RakDetail, (detail) => detail.rak_subkegiatan, {
    cascade: true,
  })
  details: RakDetail[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;
}