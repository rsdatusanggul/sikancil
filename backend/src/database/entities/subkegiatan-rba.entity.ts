import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { KegiatanRBA } from './kegiatan-rba.entity';
import { SubOutputRBA } from './sub-output-rba.entity';
import { AnggaranBelanjaRBA } from './anggaran-belanja-rba.entity';

/**
 * Entity: SubKegiatanRBA
 * Sub Kegiatan dalam Kegiatan RBA (Level 3)
 * Note: Unique constraint on (kodeSubKegiatan, tahun) handled by partial index in DB
 */
@Entity('subkegiatan_rba')
export class SubKegiatanRBA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  kodeSubKegiatan: string; // Contoh: "01.01.001", "01.01.002"

  @Column({ type: 'varchar', length: 500 })
  namaSubKegiatan: string;

  @Column({ type: 'text', nullable: true })
  deskripsi: string;

  @Column({ type: 'uuid' })
  @Index()
  kegiatanId: string;

  // Target Sub Kegiatan
  @Column({ type: 'int' })
  volumeTarget: number; // Jumlah target (pasien, kunjungan, dll)

  @Column({ type: 'varchar', length: 50 })
  satuan: string; // Orang, Kunjungan, Kegiatan, dll

  // Lokasi
  @Column({ type: 'varchar', length: 255, nullable: true })
  lokasi: string;

  // Waktu Pelaksanaan
  @Column({ type: 'int', nullable: true })
  bulanMulai: number; // 1-12

  @Column({ type: 'int', nullable: true })
  bulanSelesai: number; // 1-12

  // Unit Pelaksana
  @Column({ type: 'uuid', nullable: true })
  @Index()
  unitKerjaId: string;

  // Total Pagu (calculated from AnggaranBelanjaRBA)
  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalPagu: number;

  @Column({ type: 'int' })
  @Index()
  tahun: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => KegiatanRBA, (kegiatan) => kegiatan.subKegiatan, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'kegiatanId' })
  kegiatan: KegiatanRBA;

  @OneToMany(() => AnggaranBelanjaRBA, (anggaran) => anggaran.subKegiatan)
  anggaranBelanja: AnggaranBelanjaRBA[];

  @OneToMany(() => SubOutputRBA, (subOutput) => subOutput.subKegiatan)
  subOutput: SubOutputRBA[];

  // === GETTERS FOR FRONTEND COMPATIBILITY ===
  // These properties match the frontend expectations

  /**
   * Getter for 'kode' - maps to 'kodeSubKegiatan'
   * Frontend expects: rak.subkegiatan.kode
   */
  get kode(): string {
    return this.kodeSubKegiatan;
  }

  /**
   * Getter for 'uraian' - maps to 'namaSubKegiatan'
   * Frontend expects: rak.subkegiatan.uraian
   */
  get uraian(): string {
    return this.namaSubKegiatan;
  }

  /**
   * Getter for 'kegiatan_id' - maps to 'kegiatanId'
   * Frontend expects: rak.subkegiatan.kegiatan_id
   */
  get kegiatan_id(): string {
    return this.kegiatanId;
  }

  /**
   * Getter for 'program_id' - derived from kegiatan.programId
   * Frontend expects: rak.subkegiatan.program_id
   */
  get program_id(): string {
    return this.kegiatan?.programId || '';
  }
}
