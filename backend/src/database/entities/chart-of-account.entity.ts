import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { AccountType } from '../enums';

/**
 * Entity: ChartOfAccount (COA)
 * Master Chart of Accounts - 5 levels structure
 * Supports BLUD accounting classification
 */
@Entity('chart_of_accounts')
export class ChartOfAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  @Index()
  kodeRekening: string;

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string;

  @Column({ type: 'enum', enum: AccountType })
  @Index()
  jenisAkun: AccountType;

  @Column({ type: 'int' })
  level: number; // 1-5

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  parentKode: string; // Reference to parent account code

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isHeader: boolean; // True if this is a header account (not for posting)

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  // Normal balance
  @Column({ type: 'varchar', length: 10 })
  normalBalance: string; // DEBIT or CREDIT

  // For budget control
  @Column({ type: 'boolean', default: false })
  isBudgetControl: boolean;

  // Audit fields
  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
