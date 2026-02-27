import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TransactionStatus } from '../enums';

/**
 * Entity: CashTransaction
 * Petty cash and cash transactions
 */
@Entity('cash_transactions')
export class CashTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorTransaksi: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  @Column({ type: 'varchar', length: 50 })
  jenis: string; // PENERIMAAN, PENGELUARAN

  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  jumlah: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  diterima_dari: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  dibayar_kepada: string;

  @Column({ type: 'uuid', nullable: true })
  unitKerjaId: string;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.DRAFT })
  @Index()
  status: TransactionStatus;

  @Column({ type: 'uuid', nullable: true })
  journalId: string;

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
