import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: RegisterSTS
 * Register Surat Tanda Setoran
 * Untuk tracking penyetoran pendapatan dan pajak
 */
@Entity('register_sts')
export class RegisterSTS {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  nomorSTS: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  // Jenis Setoran
  @Column({ type: 'varchar', length: 50 })
  @Index()
  jenisSetoran: string; // PENDAPATAN, PAJAK, LAINNYA

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  jumlah: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  // Link ke transaksi sumber
  @Column({ type: 'uuid', nullable: true })
  transaksiId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  transaksiType: string; // PENDAPATAN_BLUD, TAX_TRANSACTION, dll

  // Bank tujuan
  @Column({ type: 'uuid', nullable: true })
  bankTujuanId: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nomorRekeningTujuan: string;

  // Bendahara
  @Column({ type: 'uuid' })
  @Index()
  bendaharaId: string;

  // Periode
  @Column({ type: 'int' })
  @Index()
  bulan: number;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
