import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: FiscalYear
 * Master fiscal year (tahun anggaran)
 */
@Entity('fiscal_years')
export class FiscalYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', unique: true })
  @Index()
  tahun: number;

  @Column({ type: 'date' })
  tanggalMulai: Date;

  @Column({ type: 'date' })
  tanggalSelesai: Date;

  @Column({ type: 'varchar', length: 50 })
  status: string; // OPEN, CLOSED, LOCKED

  @Column({ type: 'boolean', default: false })
  isCurrent: boolean;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
