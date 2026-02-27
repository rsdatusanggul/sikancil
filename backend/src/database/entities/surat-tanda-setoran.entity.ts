import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: STS (Surat Tanda Setoran)
 * Bukti penerimaan kas untuk BLUD
 */
@Entity('surat_tanda_setoran')
export class SuratTandaSetoran {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorSTS: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggalSTS: Date;

  // Penyetor
  @Column({ type: 'varchar', length: 255 })
  namaPenyetor: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  alamatPenyetor: string;

  // Detail Setoran
  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  jumlah: number;

  // Klasifikasi
  @Column({ type: 'varchar', length: 20 })
  kodeRekening: string;

  @Column({ type: 'varchar', length: 100 })
  jenisPendapatan: string;

  // Penyetoran ke Bank
  @Column({ type: 'varchar', length: 255, nullable: true })
  bankTujuan: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  rekeningTujuan: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalSetor: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  buktiSetorPath: string;

  // BKU & Journal
  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorBKU: string;

  @Column({ type: 'uuid', nullable: true, unique: true })
  journalId: string;

  @Column({ type: 'boolean', default: false })
  isPosted: boolean;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
