import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SPP } from './spp.entity';

/**
 * Entity: DokumenSPP
 * Supporting documents for SPP
 */
@Entity('dokumen_spp')
export class DokumenSPP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  sppId: string;

  @Column({ type: 'varchar', length: 255 })
  namaDokumen: string;

  @Column({ type: 'varchar', length: 100 })
  jenisDokumen: string; // INVOICE, KUITANSI, BA_SERAH_TERIMA, KONTRAK, dll

  @Column({ type: 'varchar', length: 500 })
  filePath: string;

  @Column({ type: 'int' })
  fileSize: number;

  @Column({ type: 'varchar' })
  uploadedBy: string;

  @CreateDateColumn()
  uploadedAt: Date;

  // Relations
  @ManyToOne(() => SPP, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sppId' })
  spp: SPP;
}
