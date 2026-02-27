import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: ApprovalLog
 * Audit trail for all approval workflows
 */
@Entity('approval_logs')
export class ApprovalLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  documentType: string; // SPP, SPM, SP2D, RBA, KONTRAK, etc

  @Column({ type: 'uuid' })
  @Index()
  documentId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  documentNo: string;

  @Column({ type: 'varchar', length: 50 })
  action: string; // SUBMIT, VERIFY, APPROVE, REJECT

  @Column({ type: 'varchar', length: 50, nullable: true })
  previousStatus: string;

  @Column({ type: 'varchar', length: 50 })
  newStatus: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ type: 'varchar' })
  performedBy: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
