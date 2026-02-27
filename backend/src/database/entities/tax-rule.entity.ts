import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * Entity: TaxRule
 * Aturan pajak per kode rekening untuk auto-calculate pajak
 * Mendukung 8 jenis pajak: PPN, PPh 21/22/23/4(2)/Final UMKM/24, PBJT
 */
@Entity('tax_rules')
export class TaxRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Pattern matching kode rekening (exact atau prefix)
  @Column({ type: 'varchar', length: 60 })
  @Index()
  accountCodePattern: string;

  @Column({ type: 'text' })
  description: string;

  // ══════════════════════════════════════════════════════════
  // PAJAK PUSAT (dipotong BLUD, disetor ke kas negara)
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  ppnRate: number; // PPN 11%

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph21Rate: number; // PPh 21: gaji/honorarium

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph22Rate: number; // PPh 22: pembelian barang (1.5%)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph23Rate: number; // PPh 23: jasa (2%)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph4a2Rate: number; // PPh 4(2): sewa (10%)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pphFinalUmkmRate: number; // PPh Final UMKM PP 23/2018 (0.5%)

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pph24Rate: number; // PPh 24: luar negeri

  // ══════════════════════════════════════════════════════════
  // PAJAK DAERAH
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'boolean', default: false })
  includesPbjt: boolean; // Flag bahwa harga sudah termasuk PBJT

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  pbjtRate: number; // PBJT rate untuk laporan audit

  // ══════════════════════════════════════════════════════════
  // FLAG KHUSUS
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'boolean', default: false })
  isFinalTax: boolean; // Jika true: PPh 22/23 = 0, digantikan PPh Final UMKM

  // ══════════════════════════════════════════════════════════
  // METADATA
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive: boolean;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  @Index()
  effectiveFrom: Date;

  @Column({ type: 'date', nullable: true })
  effectiveTo: Date; // NULL = berlaku selamanya

  @Column({ type: 'text', nullable: true })
  notes: string; // Catatan untuk auditor

  // ══════════════════════════════════════════════════════════
  // AUDIT
  // ══════════════════════════════════════════════════════════

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
