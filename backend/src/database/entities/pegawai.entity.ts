import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: Pegawai
 * Master employee data
 */
@Entity('pegawai')
export class Pegawai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  nip: string;

  @Column({ type: 'varchar', length: 255 })
  namaLengkap: string;

  @Column({ type: 'uuid' })
  @Index()
  unitKerjaId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  jabatan: string;

  @Column({ type: 'varchar', length: 100 })
  golongan: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telepon: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  npwp: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorRekening: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  namaRekening: string;

  @Column({ type: 'date', nullable: true })
  tanggalMasuk: Date;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVE' })
  status: string; // ACTIVE, INACTIVE, RETIRED

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
