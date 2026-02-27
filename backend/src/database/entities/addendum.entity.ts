import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { KontrakPengadaan } from './kontrak-pengadaan.entity';

/**
 * Entity: Addendum
 * Contract amendments
 */
@Entity('addendum')
export class Addendum {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  kontrakId: string;

  @Column({ type: 'varchar', length: 100 })
  nomorAddendum: string;

  @Column({ type: 'timestamp' })
  tanggalAddendum: Date;

  @Column({ type: 'varchar', length: 100 })
  jenisPerubahan: string; // NILAI, WAKTU, LINGKUP

  // Perubahan Nilai
  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  nilaiSebelum: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  nilaiSesudah: number;

  // Perubahan Waktu
  @Column({ type: 'timestamp', nullable: true })
  waktuSebelum: Date;

  @Column({ type: 'timestamp', nullable: true })
  waktuSesudah: Date;

  @Column({ type: 'text' })
  alasanPerubahan: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => KontrakPengadaan)
  @JoinColumn({ name: 'kontrakId' })
  kontrak: KontrakPengadaan;
}
