import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: RegisterSPJ
 * Register Surat Pertanggungjawaban
 * Untuk tracking semua SPJ (UP/GU/TU/LS)
 */
@Entity('register_spj')
export class RegisterSPJ {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorSPJ: string;

  @Column({ type: 'int' })
  @Index()
  bulan: number; // 1-12

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'timestamp' })
  @Index()
  tanggalSPJ: Date;

  // Jenis SPJ
  @Column({ type: 'varchar', length: 20 })
  @Index()
  jenisSPJ: string; // UP, GU, TU, LS

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  jumlah: number;

  @Column({ type: 'timestamp', nullable: true })
  tanggalPengesahan: Date;

  @Column({ type: 'varchar', length: 50, default: 'DRAFT' })
  @Index()
  status: string; // DRAFT, SUBMITTED, VERIFIED, APPROVED, REJECTED

  // Link ke SPJ entity
  @Column({ type: 'uuid' })
  @Index()
  spjId: string; // Link to SPJUP/SPJGU/SPJTU/SPJLS

  @Column({ type: 'varchar', length: 50 })
  spjType: string; // SPJUP, SPJGU, SPJTU, SPJLS

  @Column({ type: 'uuid' })
  @Index()
  bendaharaId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
