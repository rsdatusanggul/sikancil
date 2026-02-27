import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: JournalMappingRule
 * Configuration for auto-posting journal from transactions
 * Maps transaction types to CoA debit/credit rules
 */
@Entity('journal_mapping_rules')
export class JournalMappingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  sourceType: string; // e.g., PENDAPATAN_JASA_LAYANAN, BELANJA_LS, etc.

  @Column({ type: 'varchar', length: 255 })
  description: string;

  /**
   * Debit Rules - JSON array
   * Example: [
   *   {
   *     "coaCode": "1.1.1.01.01",
   *     "description": "Kas di Bendahara Penerimaan",
   *     "percentage": 100,
   *     "isFixed": false,
   *     "fixedAmount": null
   *   }
   * ]
   */
  @Column({ type: 'jsonb' })
  debitRules: Array<{
    coaCode: string;
    description: string;
    percentage?: number;
    isFixed?: boolean;
    fixedAmount?: number;
    note?: string;
  }>;

  /**
   * Credit Rules - JSON array
   * Example: [
   *   {
   *     "coaCode": "4.1.1.01.01",
   *     "description": "Pendapatan Jasa Layanan",
   *     "percentage": 100,
   *     "isFixed": false,
   *     "fixedAmount": null
   *   }
   * ]
   */
  @Column({ type: 'jsonb' })
  creditRules: Array<{
    coaCode: string;
    description: string;
    percentage?: number;
    isFixed?: boolean;
    fixedAmount?: number;
    note?: string;
  }>;

  /**
   * Additional Conditions - JSON object (optional)
   * For complex conditional mapping
   * Example: { "sumberDana": "APBD", "kategori": "OPERASIONAL" }
   */
  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number; // For multiple rules on same sourceType

  @Column({ type: 'varchar', length: 255, nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  updatedBy: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
