import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SubKegiatanRBA } from './subkegiatan-rba.entity';
import { SubOutputRBA } from './sub-output-rba.entity';

/**
 * Entity: AnggaranBelanjaRBA
 * Detail anggaran belanja per Output/Sub Output dengan kode rekening
 * Enhanced dari RBABelanja dengan link ke struktur Program-Kegiatan-Output
 */
@Entity('anggaran_belanja_rba')
export class AnggaranBelanjaRBA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Link ke Sub Kegiatan atau Sub Output
  @Column({ type: 'uuid', nullable: true })
  @Index()
  subKegiatanId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  subOutputId: string;

  // Kode Rekening (6 level)
  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeRekening: string; // Contoh: 5.1.01.01

  @Column({ type: 'varchar', length: 255 })
  namaRekening: string;

  // Klasifikasi
  @Column({ type: 'varchar', length: 50 })
  jenisBelanja: string; // OPERASIONAL, MODAL, TAK_TERDUGA

  @Column({ type: 'varchar', length: 50 })
  kategori: string; // PEGAWAI, BARANG_JASA, MODAL

  // Sumber Dana
  @Column({ type: 'varchar', length: 50 })
  @Index()
  sumberDana: string; // APBD, FUNGSIONAL, HIBAH

  // Pagu
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  pagu: number;

  // Realisasi (diupdate dari transaksi)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  realisasi: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  komitmen: number; // Dari kontrak yang sudah ditandatangani

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  sisa: number; // Pagu - (Realisasi + Komitmen)

  // Breakdown bulanan (untuk anggaran kas)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  januari: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  februari: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  maret: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  april: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  mei: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  juni: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  juli: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  agustus: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  september: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  oktober: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  november: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  desember: number;

  // Unit Kerja
  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => SubKegiatanRBA, (subKegiatan) => subKegiatan.anggaranBelanja, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subKegiatanId' })
  subKegiatan: SubKegiatanRBA;

  @ManyToOne(() => SubOutputRBA, (subOutput) => subOutput.anggaranBelanja, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subOutputId' })
  subOutput: SubOutputRBA;
}
