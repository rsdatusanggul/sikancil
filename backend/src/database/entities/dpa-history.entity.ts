import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DPA } from './dpa.entity';

/**
 * Entity: DPAHistory
 * Audit Trail untuk semua perubahan pada DPA
 * Untuk transparansi dan akuntabilitas
 */
@Entity('dpa_history')
export class DPAHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  dpaId: string;

  // Action yang dilakukan
  @Column({ type: 'varchar', length: 50 })
  @Index()
  action: string; // CREATE, UPDATE, SUBMIT, APPROVE, REJECT, REVISE, ACTIVATE

  // Field yang berubah (untuk UPDATE)
  @Column({ type: 'jsonb', nullable: true })
  fieldChanged: any; // Array of field names: ["status", "totalPaguBelanja"]

  // Old value (before change)
  @Column({ type: 'jsonb', nullable: true })
  oldValue: any;

  // New value (after change)
  @Column({ type: 'jsonb', nullable: true })
  newValue: any;

  // Notes/Catatan
  @Column({ type: 'text', nullable: true })
  notes: string;

  // User yang melakukan action
  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  userRole: string; // ADMIN, PPKD, BENDAHARA, dll

  @Column({ type: 'varchar', length: 255, nullable: true })
  userName: string; // Untuk display purpose

  // IP Address & User Agent (optional, untuk audit)
  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => DPA, (dpa) => dpa.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'dpaId' })
  dpa: DPA;
}
