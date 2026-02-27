import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: BankAccount
 * Master bank accounts for BLUD
 */
@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  kodeBank: string;

  @Column({ type: 'varchar', length: 255 })
  namaBank: string;

  @Column({ type: 'varchar', length: 100 })
  nomorRekening: string;

  @Column({ type: 'varchar', length: 255 })
  namaPemilik: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cabang: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  swift: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoAwal: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  saldoBerjalan: number;

  @Column({ type: 'varchar', length: 50, default: 'IDR' })
  currency: string;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE, CLOSED

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
