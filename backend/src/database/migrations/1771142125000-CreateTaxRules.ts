import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateTaxRules
 *
 * Membuat tabel tax_rules untuk menyimpan aturan pajak per kode rekening.
 * Mendukung 8 jenis pajak:
 * - PPN (Pajak Pertambahan Nilai)
 * - PPh 21 (Gaji/Honorarium)
 * - PPh 22 (Pembelian Barang)
 * - PPh 23 (Jasa)
 * - PPh 4(2) (Sewa Gedung/Tanah)
 * - PPh Final UMKM (PP 23/2018)
 * - PPh 24 (Luar Negeri)
 * - PBJT (Pajak Barang dan Jasa Tertentu - flag saja)
 */
export class CreateTaxRules1771142125000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create tax_rules table
    await queryRunner.query(`
      CREATE TABLE tax_rules (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        -- Pattern matching kode rekening
        -- Bisa exact: '5.2.02.10.01.0003'
        -- Bisa prefix: '5.2.02.10' (semua sub-rekening)
        account_code_pattern  VARCHAR(60) NOT NULL,
        description           TEXT NOT NULL,

        -- ── Pajak Pusat (dipotong BLUD, disetor ke kas negara) ──────
        ppn_rate              DECIMAL(5,2) DEFAULT 0,  -- PPN 11% (UU 42/2009)
        pph21_rate            DECIMAL(5,2) DEFAULT 0,  -- PPh 21: gaji/honorarium
        pph22_rate            DECIMAL(5,2) DEFAULT 0,  -- PPh 22: pembelian barang (1.5%)
        pph23_rate            DECIMAL(5,2) DEFAULT 0,  -- PPh 23: jasa (2%)
        pph4a2_rate           DECIMAL(5,2) DEFAULT 0,  -- PPh 4(2): sewa gedung/tanah (10%)
        pph_final_umkm_rate   DECIMAL(5,2) DEFAULT 0,  -- PPh Final UMKM PP 23/2018 (0.5%)
        pph24_rate            DECIMAL(5,2) DEFAULT 0,  -- PPh 24: luar negeri (jarang)

        -- ── Pajak Daerah ────────────────────────────────────────────
        -- PBJT Makan Minum (UU HKPD 1/2022) maks 10%
        -- BLUD BUKAN pemotong PBJT — ini flag penanda saja
        -- bahwa harga sudah termasuk PBJT dari vendor/restoran
        includes_pbjt         BOOLEAN DEFAULT false,
        pbjt_rate             DECIMAL(5,2) DEFAULT 0,  -- untuk keperluan laporan audit

        -- ── Flag Khusus ──────────────────────────────────────────────
        -- Jika true: PPh 22 & PPh 23 = 0 (digantikan PPh Final UMKM)
        -- Vendor harus serahkan fotokopi SK PP 23/2018 dari KPP
        is_final_tax          BOOLEAN DEFAULT false,

        -- ── Metadata ─────────────────────────────────────────────────
        is_active       BOOLEAN DEFAULT true,
        effective_from  DATE NOT NULL DEFAULT CURRENT_DATE,
        effective_to    DATE,   -- NULL = berlaku selamanya
        notes           TEXT,   -- catatan tambahan untuk auditor

        -- Audit
        created_by  UUID,
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await queryRunner.query(`
      CREATE INDEX idx_tax_rules_pattern ON tax_rules(account_code_pattern);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_tax_rules_active ON tax_rules(is_active, effective_from);
    `);

    // ──────────────────────────────────────────────────────────────
    // SEED DATA - Aturan Pajak untuk Berbagai Jenis Belanja
    // ──────────────────────────────────────────────────────────────

    // 1. Farmasi & BMHP (Bahan Medis Habis Pakai)
    await queryRunner.query(`
      INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph22_rate, description) VALUES
        ('4.1.6.1.02.01.01', 11.00, 1.50, 'Belanja Obat-obatan'),
        ('5.2.02.10.01', 11.00, 1.50, 'Belanja BMHP'),
        ('5.2.02.10.02', 11.00, 1.50, 'Belanja Alkes Habis Pakai');
    `);

    // 2. Jasa (PPh 23)
    await queryRunner.query(`
      INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph23_rate, description) VALUES
        ('5.2.02.02', 11.00, 2.00, 'Belanja Jasa'),
        ('5.2.02.03', 11.00, 2.00, 'Belanja Jasa Konsultansi');
    `);

    // 3. Makan & Minum - Vendor Katering PKP
    await queryRunner.query(`
      INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph23_rate, includes_pbjt, description) VALUES
        ('5.2.02.06', 11.00, 2.00, false, 'Belanja Makan Minum - Vendor Katering PKP');
    `);

    // 4. Makan & Minum - Beli Langsung di Restoran (sudah include PBJT)
    await queryRunner.query(`
      INSERT INTO tax_rules (
        account_code_pattern, ppn_rate, pph22_rate, pph23_rate,
        includes_pbjt, pbjt_rate, description
      ) VALUES (
        '5.2.02.06', 0, 0, 0, true, 10.00,
        'Belanja Makan Minum - Beli Langsung di Restoran (harga sudah include PBJT)'
      );
    `);

    // 5. Sewa (PPh 4 ayat 2)
    await queryRunner.query(`
      INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph4a2_rate, description) VALUES
        ('5.2.02.03.01', 11.00, 10.00, 'Belanja Sewa Gedung/Ruangan/Tanah');
    `);

    // 6. Belanja Barang/Material
    await queryRunner.query(`
      INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph22_rate, description) VALUES
        ('5.2.02.01', 11.00, 1.50, 'Belanja Bahan/Material'),
        ('5.2.02.05', 11.00, 1.50, 'Belanja Cetak dan Penggandaan'),
        ('5.2.03', 11.00, 1.50, 'Belanja Modal Peralatan');
    `);

    // 7. Vendor UMKM (PP 23/2018) — is_final_tax=true → PPh 22/23 tidak dipotong
    await queryRunner.query(`
      INSERT INTO tax_rules (
        account_code_pattern, pph_final_umkm_rate, is_final_tax, description
      ) VALUES (
        '5.2.02', 0.50, true,
        'Belanja ke Vendor UMKM (SK PP 23/2018) - PPh Final 0.5%, tanpa PPh 22/23'
      );
    `);

    // 8. Gaji & Tunjangan (non-taxable untuk PPN/PPh 22/23)
    await queryRunner.query(`
      INSERT INTO tax_rules (account_code_pattern, description) VALUES
        ('5.1.01', 'Belanja Gaji Pegawai - Non-Taxable'),
        ('5.1.02', 'Belanja Tambahan Penghasilan Pegawai - Non-Taxable');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tax_rules_active;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_tax_rules_pattern;`);

    // Drop table
    await queryRunner.query(`DROP TABLE IF EXISTS tax_rules;`);
  }
}
