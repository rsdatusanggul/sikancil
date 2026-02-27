import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: SystemSetting
 * Application configuration and settings
 */
@Entity('system_settings')
export class SystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  settingKey: string;

  @Column({ type: 'text' })
  settingValue: string;

  @Column({ type: 'varchar', length: 100 })
  settingGroup: string; // GENERAL, BLUD, ACCOUNTING, etc

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
