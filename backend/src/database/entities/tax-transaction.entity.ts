import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: TaxTransaction
 * Tax withholding and payments
 */
@Entity('tax_transactions')
export class TaxTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorBuktiPotong: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  jenisPajak: string; // PPH21, PPH22, PPH23, PPN

  @Column({ type: 'varchar', length: 255 })
  namaWP: string;

  @Column({ type: 'varchar', length: 100 })
  npwp: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  dpp: number; // Dasar Pengenaan Pajak

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tarif: number; // Percentage

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  jumlahPajak: number;

  @Column({ type: 'uuid', nullable: true })
  sppId: string;

  @Column({ type: 'boolean', default: false })
  isSetor: boolean;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSetor: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorNTPN: string;

  @Column({ type: 'uuid', nullable: true })
  journalId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
