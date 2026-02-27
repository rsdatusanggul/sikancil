import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: Supplier
 * Master supplier/vendor data
 */
@Entity('suppliers')
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  kodeSupplier: string;

  @Column({ type: 'varchar', length: 255 })
  namaSupplier: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  npwp: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  kota: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  kodePos: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telepon: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contactPerson: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contactPhone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorRekening: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  namaRekening: string;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE, BLACKLIST

  @Column({ type: 'text', nullable: true })
  catatan: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
