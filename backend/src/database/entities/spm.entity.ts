import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: SPM (Surat Perintah Membayar)
 * Second stage of expenditure workflow
 */
@Entity('spm')
export class SPM {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  @Index()
  nomorSPM: string;

  @Column({ type: 'timestamp' })
  @Index()
  tanggalSPM: Date;

  // Nilai
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  nilaiSPM: number;

  // Penerima
  @Column({ type: 'varchar', length: 255 })
  namaPenerima: string;

  @Column({ type: 'varchar', length: 100 })
  nomorRekening: string;

  @Column({ type: 'varchar', length: 255 })
  namaBank: string;

  // Status
  @Column({ type: 'varchar', length: 50 })
  status: string; // DRAFT, APPROVED, REJECTED, DIBAYAR

  // Approval
  @Column({ type: 'varchar', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'varchar', length: 500, nullable: true })
  ttdDigital: string;

  // SP2D Reference
  @Column({ type: 'uuid', nullable: true })
  sp2dId: string;

  @Column({ type: 'varchar' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
