import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: BukuPembantu
 * Buku pembantu untuk berbagai jenis (9 jenis sesuai Per-47/PB/2014)
 * Supporting books untuk BKU
 */
@Entity('buku_pembantu')
export class BukuPembantu {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Jenis Buku Pembantu
  @Column({ type: 'varchar', length: 50 })
  @Index()
  jenisBuku: string;
  // KAS_TUNAI, BANK, PAJAK, PANJAR, PENDAPATAN, DEPOSITO, INVESTASI, PIUTANG, PERSEDIAAN

  // Identifikasi (opsional, tergantung jenis)
  @Column({ type: 'uuid', nullable: true })
  @Index()
  bankId: string; // Untuk buku bank

  @Column({ type: 'varchar', length: 50, nullable: true })
  nomorRekening: string; // Untuk buku bank

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  jenisPajak: string; // Untuk buku pajak (PPh21, PPh22, PPh23, PPh4(2), PPN)

  @Column({ type: 'uuid', nullable: true })
  jenisDepositoID: string; // Untuk buku deposito

  // Tanggal & Periode
  @Column({ type: 'timestamp' })
  @Index()
  tanggal: Date;

  @Column({ type: 'int' })
  @Index()
  bulan: number; // 1-12

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'int' })
  nomorUrut: number;

  // Uraian
  @Column({ type: 'text' })
  uraian: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  nomorBukti: string;

  // Jumlah (flexible untuk debet/kredit atau masuk/keluar)
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  debet: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  kredit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  saldo: number;

  // Link ke BKU (opsional)
  @Column({ type: 'uuid', nullable: true })
  bkuId: string;

  // Metadata
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
