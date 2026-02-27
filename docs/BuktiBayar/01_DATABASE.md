# 01 - Database Schema
## Modul Bukti Pembayaran | SI-KANCIL

---

## Tabel-tabel yang Diperlukan

### 1. `tax_rules` — Aturan Pajak per Kode Rekening

> **8 Jenis Pajak** yang dikelola:
> PPN | PPh 21 | PPh 22 | PPh 23 | PPh 4(2) | PPh Final UMKM | PPh 24 | PBJT (flag saja)

```sql
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

-- Index
CREATE INDEX idx_tax_rules_pattern ON tax_rules(account_code_pattern);
CREATE INDEX idx_tax_rules_active  ON tax_rules(is_active, effective_from);

-- ──────────────────────────────────────────────────────────────
-- SEED DATA
-- ──────────────────────────────────────────────────────────────

-- Farmasi & BMHP
INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph22_rate, description) VALUES
  ('4.1.6.1.02.01.01', 11.00, 1.50, 'Belanja Obat-obatan'),
  ('5.2.02.10.01',     11.00, 1.50, 'Belanja BMHP'),
  ('5.2.02.10.02',     11.00, 1.50, 'Belanja Alkes Habis Pakai');

-- Jasa (PPh 23)
INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph23_rate, description) VALUES
  ('5.2.02.02', 11.00, 2.00, 'Belanja Jasa'),
  ('5.2.02.03', 11.00, 2.00, 'Belanja Jasa Konsultansi');

-- Makan & Minum (katering/vendor)
-- PPTK pilih rule ini saat vendor katering adalah PKP
INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph23_rate, includes_pbjt, description) VALUES
  ('5.2.02.06', 11.00, 2.00, false, 'Belanja Makan Minum - Vendor Katering PKP');

-- Makan & Minum langsung di restoran (bukan katering)
-- Harga sudah termasuk PBJT 10% dari restoran — BLUD tidak potong apapun
INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph22_rate, pph23_rate,
                       includes_pbjt, pbjt_rate, description) VALUES
  ('5.2.02.06', 0, 0, 0, true, 10.00,
   'Belanja Makan Minum - Beli Langsung di Restoran (harga sudah include PBJT)');

-- Sewa (PPh 4 ayat 2)
INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph4a2_rate, description) VALUES
  ('5.2.02.03.01', 11.00, 10.00, 'Belanja Sewa Gedung/Ruangan/Tanah');

-- Belanja Barang/Material
INSERT INTO tax_rules (account_code_pattern, ppn_rate, pph22_rate, description) VALUES
  ('5.2.02.01', 11.00, 1.50, 'Belanja Bahan/Material'),
  ('5.2.02.05', 11.00, 1.50, 'Belanja Cetak dan Penggandaan'),
  ('5.2.03',    11.00, 1.50, 'Belanja Modal Peralatan');

-- Vendor UMKM (PP 23/2018) — is_final_tax=true → PPh 22/23 tidak dipotong
INSERT INTO tax_rules (account_code_pattern, pph_final_umkm_rate, is_final_tax, description) VALUES
  ('5.2.02', 0.50, true,
   'Belanja ke Vendor UMKM (SK PP 23/2018) - PPh Final 0.5%, tanpa PPh 22/23');

-- Gaji & Tunjangan (non-taxable untuk PPN/PPh 22/23)
INSERT INTO tax_rules (account_code_pattern, description) VALUES
  ('5.1.01', 'Belanja Gaji Pegawai - Non-Taxable'),
  ('5.1.02', 'Belanja Tambahan Penghasilan Pegawai - Non-Taxable');
```

---

### 2. `voucher_sequences` — Auto-Numbering

```sql
CREATE TABLE voucher_sequences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  fiscal_year   INTEGER     NOT NULL,
  voucher_month INTEGER     NOT NULL CHECK (voucher_month BETWEEN 1 AND 12),
  account_code  VARCHAR(60) NOT NULL,
  unit_code     VARCHAR(20) NOT NULL DEFAULT 'RSUD-DS',
  last_sequence INTEGER     DEFAULT 0,
  
  UNIQUE (fiscal_year, voucher_month, account_code, unit_code)
);

-- Function generate nomor bukti
CREATE OR REPLACE FUNCTION generate_voucher_number(
  p_fiscal_year  INTEGER,
  p_month        INTEGER,
  p_account_code VARCHAR,
  p_unit_code    VARCHAR DEFAULT 'RSUD-DS'
)
RETURNS TABLE(voucher_number VARCHAR, sequence_number INTEGER)
LANGUAGE plpgsql AS $$
DECLARE
  v_seq INTEGER;
  v_num VARCHAR;
BEGIN
  INSERT INTO voucher_sequences (fiscal_year, voucher_month, account_code, unit_code, last_sequence)
  VALUES (p_fiscal_year, p_month, p_account_code, p_unit_code, 1)
  ON CONFLICT (fiscal_year, voucher_month, account_code, unit_code)
  DO UPDATE SET last_sequence = voucher_sequences.last_sequence + 1
  RETURNING last_sequence INTO v_seq;

  -- Format: 0001/5.2.02.10.01.0003/01/RSUD-DS/2025
  v_num := LPAD(v_seq::TEXT, 4, '0')
         || '/' || p_account_code
         || '/' || LPAD(p_month::TEXT, 2, '0')
         || '/' || p_unit_code
         || '/' || p_fiscal_year;

  RETURN QUERY SELECT v_num, v_seq;
END;
$$;

-- Test:
-- SELECT * FROM generate_voucher_number(2025, 1, '5.2.02.10.01.0003');
-- → ('0001/5.2.02.10.01.0003/01/RSUD-DS/2025', 1)
```

---

### 3. `payment_vouchers` — Tabel Utama Bukti Pembayaran

```sql
CREATE TABLE payment_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ==========================================
  -- IDENTITAS DOKUMEN
  -- ==========================================
  voucher_number    VARCHAR(120) UNIQUE NOT NULL,
  voucher_sequence  INTEGER      NOT NULL,
  fiscal_year       INTEGER      NOT NULL,
  voucher_month     INTEGER      NOT NULL CHECK (voucher_month BETWEEN 1 AND 12),
  voucher_date      DATE         NOT NULL,
  unit_code         VARCHAR(20)  NOT NULL DEFAULT 'RSUD-DS',

  -- ==========================================
  -- HIERARKI ANGGARAN
  -- ==========================================
  program_id          UUID    REFERENCES rba_programs(id),
  program_code        VARCHAR(30) NOT NULL,
  program_name        TEXT,

  kegiatan_id         UUID    REFERENCES rba_kegiatans(id),
  kegiatan_code       VARCHAR(30) NOT NULL,
  kegiatan_name       TEXT,

  -- Output RBA = Sub Kegiatan
  sub_kegiatan_id     UUID    REFERENCES rba_outputs(id),
  sub_kegiatan_code   VARCHAR(30),
  sub_kegiatan_name   TEXT,

  account_code        VARCHAR(60) NOT NULL,   -- Kode Rekening Belanja
  account_name        TEXT        NOT NULL,

  -- ==========================================
  -- CACHE VALIDASI ANGGARAN (saat dibuat)
  -- ==========================================
  available_pagu        DECIMAL(15,2),  -- Sisa pagu saat BB dibuat
  rak_monthly_limit     DECIMAL(15,2),  -- Limit RAK bulan berjalan
  previous_commitments  DECIMAL(15,2),  -- BB Approved yg belum jadi SPP

  -- ==========================================
  -- PPTK
  -- ==========================================
  pptk_id   UUID NOT NULL REFERENCES users(id),

  -- ==========================================
  -- DETAIL PEMBAYARAN
  -- ==========================================
  payee_name        TEXT NOT NULL,
  -- Default: 'BENDAHARA PENGELUARAN RSUD DATU SANGGUL RANTAU'

  payment_purpose   TEXT NOT NULL,
  -- Contoh: 'Pembayaran Belanja BMHP PT. XYZ Invoice ABC123, ABC456'

  -- Vendor
  vendor_name     VARCHAR(255),
  vendor_npwp     VARCHAR(30),
  vendor_address  TEXT,
  invoice_numbers TEXT[],    -- Array nomor invoice/faktur
  invoice_date    DATE,

  -- ==========================================
  -- PERHITUNGAN KEUANGAN
  -- Formula: NET = GROSS - TOTAL_PAJAK
  -- ==========================================
  gross_amount  DECIMAL(15,2) NOT NULL CHECK (gross_amount > 0),

  -- Tax rule yang digunakan
  tax_rule_id   UUID REFERENCES tax_rules(id),

  -- ── Pajak Pusat (dipotong BLUD) ──────────────────────────────
  pph21_rate    DECIMAL(5,2) DEFAULT 0,   -- PPh 21: gaji/honorarium
  pph21_amount  DECIMAL(15,2) DEFAULT 0,

  pph22_rate    DECIMAL(5,2) DEFAULT 0,   -- PPh 22: pembelian barang (1.5%)
  pph22_amount  DECIMAL(15,2) DEFAULT 0,

  pph23_rate    DECIMAL(5,2) DEFAULT 0,   -- PPh 23: jasa (2%)
  pph23_amount  DECIMAL(15,2) DEFAULT 0,

  pph4a2_rate   DECIMAL(5,2) DEFAULT 0,   -- PPh 4(2): sewa (10%)
  pph4a2_amount DECIMAL(15,2) DEFAULT 0,

  pph_final_umkm_rate   DECIMAL(5,2) DEFAULT 0,   -- PPh Final UMKM PP23/2018 (0.5%)
  pph_final_umkm_amount DECIMAL(15,2) DEFAULT 0,

  pph24_rate    DECIMAL(5,2) DEFAULT 0,   -- PPh 24: luar negeri (jarang)
  pph24_amount  DECIMAL(15,2) DEFAULT 0,

  ppn_rate      DECIMAL(5,2) DEFAULT 0,   -- PPN 11%
  ppn_amount    DECIMAL(15,2) DEFAULT 0,

  other_deductions       DECIMAL(15,2) DEFAULT 0,
  other_deductions_note  TEXT,

  -- ── Pajak Daerah (flag, bukan potongan) ──────────────────────
  -- PBJT Makan Minum (UU HKPD 1/2022)
  -- BLUD BUKAN pemotong PBJT. Flag ini menandakan bahwa
  -- harga dalam tagihan sudah termasuk PBJT dari vendor/restoran.
  includes_pbjt BOOLEAN DEFAULT false,
  pbjt_rate     DECIMAL(5,2) DEFAULT 0,   -- untuk catatan laporan audit
  pbjt_amount   DECIMAL(15,2) DEFAULT 0,  -- estimasi PBJT dalam harga (info saja)

  -- ── Data UMKM (jika vendor PP 23/2018) ───────────────────────
  sk_umkm_number  VARCHAR(50),   -- Nomor SK dari KPP
  sk_umkm_expiry  DATE,          -- Berlaku s.d. akhir tahun pajak

  -- ── Kolom computed (auto-calculated oleh PostgreSQL) ─────────
  total_deductions DECIMAL(15,2) GENERATED ALWAYS AS (
    pph21_amount + pph22_amount + pph23_amount +
    pph4a2_amount + pph_final_umkm_amount +
    pph24_amount + ppn_amount + other_deductions
  ) STORED,

  net_payment DECIMAL(15,2) GENERATED ALWAYS AS (
    gross_amount - (
      pph21_amount + pph22_amount + pph23_amount +
      pph4a2_amount + pph_final_umkm_amount +
      pph24_amount + ppn_amount + other_deductions
    )
  ) STORED,

  -- Terbilang dari GROSS
  gross_amount_text TEXT,

  -- ==========================================
  -- TANDA TANGAN (4 Pihak - Pyramid)
  -- ==========================================

  -- [1] Pejabat Teknis BLUD (kiri atas)
  technical_officer_id    UUID REFERENCES users(id),
  technical_officer_name  VARCHAR(255),
  technical_officer_nip   VARCHAR(30),
  technical_signed_at     TIMESTAMP,
  technical_notes         TEXT,

  -- [2] Yang Menerima / PPTK (kanan atas)
  receiver_id    UUID REFERENCES users(id),
  receiver_name  VARCHAR(255),
  receiver_nip   VARCHAR(30),
  receiver_signed_at TIMESTAMP,

  -- [3] Bendahara Pengeluaran (tengah)
  treasurer_id    UUID REFERENCES users(id),
  treasurer_name  VARCHAR(255),
  treasurer_nip   VARCHAR(30),
  treasurer_signed_at TIMESTAMP,
  treasurer_notes     TEXT,

  -- [4] Direktur / PA (bawah)
  approver_id    UUID REFERENCES users(id),
  approver_name  VARCHAR(255),
  approver_nip   VARCHAR(30),
  approver_signed_at TIMESTAMP,

  -- ==========================================
  -- STATUS & LINK KE SPP
  -- ==========================================
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  -- DRAFT | SUBMITTED | APPROVED | REJECTED | SPP_CREATED | CANCELLED

  rejection_reason TEXT,
  rejection_by     UUID REFERENCES users(id),
  rejected_at      TIMESTAMP,

  -- Setelah approved, boleh buat SPP
  spp_id         UUID REFERENCES spp_documents(id),
  spp_created_at TIMESTAMP,

  -- ==========================================
  -- AUDIT TRAIL
  -- ==========================================
  created_by  UUID NOT NULL REFERENCES users(id),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by  UUID REFERENCES users(id),
  updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_by  UUID REFERENCES users(id),
  deleted_at  TIMESTAMP,  -- Soft delete

  -- ==========================================
  -- CONSTRAINTS
  -- ==========================================
  CONSTRAINT chk_net_payment_positive
    CHECK (net_payment >= 0),
  CONSTRAINT chk_deductions_not_exceed_gross
    CHECK (total_deductions <= gross_amount),
  CONSTRAINT chk_spp_only_when_approved
    CHECK (spp_id IS NULL OR status IN ('APPROVED', 'SPP_CREATED'))
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_pv_voucher_number    ON payment_vouchers(voucher_number);
CREATE INDEX idx_pv_fiscal_year       ON payment_vouchers(fiscal_year);
CREATE INDEX idx_pv_year_month        ON payment_vouchers(fiscal_year, voucher_month);
CREATE INDEX idx_pv_account_code      ON payment_vouchers(account_code);
CREATE INDEX idx_pv_kegiatan          ON payment_vouchers(kegiatan_id);
CREATE INDEX idx_pv_sub_kegiatan      ON payment_vouchers(sub_kegiatan_id);
CREATE INDEX idx_pv_pptk              ON payment_vouchers(pptk_id);
CREATE INDEX idx_pv_status            ON payment_vouchers(status);
CREATE INDEX idx_pv_vendor            ON payment_vouchers(vendor_name);
CREATE INDEX idx_pv_voucher_date      ON payment_vouchers(voucher_date);
CREATE INDEX idx_pv_not_deleted       ON payment_vouchers(deleted_at)
  WHERE deleted_at IS NULL;

-- Unique sequence per rekening per bulan per tahun
CREATE UNIQUE INDEX idx_pv_sequence_unique
  ON payment_vouchers(voucher_sequence, account_code, voucher_month, fiscal_year, unit_code)
  WHERE deleted_at IS NULL;
```

---

### 4. `payment_voucher_attachments` — Lampiran Dokumen

```sql
CREATE TABLE payment_voucher_attachments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id  UUID NOT NULL REFERENCES payment_vouchers(id) ON DELETE CASCADE,

  -- File info
  file_name   VARCHAR(255) NOT NULL,
  file_type   VARCHAR(50),    -- pdf, jpg, png, xlsx
  file_size   INTEGER,        -- bytes
  file_path   TEXT NOT NULL,  -- path di storage (S3/local)

  -- Tipe lampiran
  attachment_type VARCHAR(30) NOT NULL DEFAULT 'OTHER',
  -- INVOICE | CONTRACT | BA | BAST | PHOTO | OTHER

  description TEXT,

  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pva_voucher ON payment_voucher_attachments(voucher_id);
```

---

### 5. `payment_voucher_audit_logs` — Audit Trail Lengkap

```sql
CREATE TABLE payment_voucher_audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id  UUID NOT NULL REFERENCES payment_vouchers(id),

  action      VARCHAR(50) NOT NULL,
  -- CREATED | UPDATED | SUBMITTED | APPROVED_TECHNICAL |
  -- APPROVED_TREASURER | APPROVED_FINAL | REJECTED | CANCELLED |
  -- SPP_CREATED | PRINTED

  old_status  VARCHAR(30),
  new_status  VARCHAR(30),

  notes       TEXT,
  metadata    JSONB,    -- Data tambahan (IP, browser, dll)

  performed_by  UUID REFERENCES users(id),
  performed_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_pval_voucher     ON payment_voucher_audit_logs(voucher_id);
CREATE INDEX idx_pval_performed   ON payment_voucher_audit_logs(performed_at);
```

---

### 6. `short_urls` — Untuk QR Code Verification

```sql
CREATE TABLE short_urls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hash        VARCHAR(16) UNIQUE NOT NULL,  -- Short code untuk URL
  target_id   UUID NOT NULL,
  target_type VARCHAR(50) NOT NULL DEFAULT 'PAYMENT_VOUCHER',
  expires_at  TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_short_urls_hash ON short_urls(hash);
```

---

## Migration File

Buat file: `backend/src/database/migrations/YYYYMMDD-create-payment-vouchers.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePaymentVouchers1708123456789 implements MigrationInterface {
  name = 'CreatePaymentVouchers1708123456789';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      -- Jalankan SQL tabel di atas secara berurutan:
      -- 1. tax_rules
      -- 2. voucher_sequences + function
      -- 3. payment_vouchers
      -- 4. payment_voucher_attachments
      -- 5. payment_voucher_audit_logs
      -- 6. short_urls
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS short_urls;
      DROP TABLE IF EXISTS payment_voucher_audit_logs;
      DROP TABLE IF EXISTS payment_voucher_attachments;
      DROP TABLE IF EXISTS payment_vouchers;
      DROP FUNCTION IF EXISTS generate_voucher_number;
      DROP TABLE IF EXISTS voucher_sequences;
      DROP TABLE IF EXISTS tax_rules;
    `);
  }
}
```
