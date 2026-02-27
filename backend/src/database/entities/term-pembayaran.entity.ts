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
import { KontrakPengadaan } from './kontrak-pengadaan.entity';

/**
 * Entity: TermPembayaran
 * Payment terms for contracts
 */
@Entity('term_pembayaran')
export class TermPembayaran {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  kontrakId: string;

  @Column({ type: 'int' })
  termKe: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  persentase: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilai: number;

  @Column({ type: 'text' })
  syaratPembayaran: string;

  // Status
  @Column({ type: 'varchar', length: 50 })
  statusPembayaran: string; // BELUM, DIPROSES, DIBAYAR

  @Column({ type: 'uuid', nullable: true })
  sppId: string;

  @Column({ type: 'timestamp', nullable: true })
  tanggalBayar: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => KontrakPengadaan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'kontrakId' })
  kontrak: KontrakPengadaan;
}
