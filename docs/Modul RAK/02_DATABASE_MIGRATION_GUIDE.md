# 🗄️ Database Migration Guide - RAK Module

## 📋 Overview

Dokumen ini berisi panduan lengkap untuk database migration upgrade RAK Module, termasuk DDL, migration scripts, sample data, dan rollback procedures.

---

## 🎯 Migration Objectives

1. ✅ Create `rak_subkegiatan` table
2. ✅ Create `rak_detail` table
3. ✅ Create supporting views
4. ✅ Add indexes for performance
5. ✅ Setup constraints & validations
6. ✅ Preserve existing data (if any)

---

## 📊 ERD - Entity Relationship Diagram

```
┌─────────────────┐          ┌──────────────────┐
│  subkegiatan    │          │ kode_rekening    │
├─────────────────┤          ├──────────────────┤
│ id (PK)         │          │ id (PK)          │
│ kegiatan_id     │          │ kode             │
│ kode            │          │ uraian           │
│ nama            │          │ level            │
│ pagu            │          │ ...              │
└────────┬────────┘          └────────┬─────────┘
         │                            │
         │                            │
         │      ┌───────────────────┐ │
         └─────>│ rak_subkegiatan   │<┘
                ├───────────────────┤
                │ id (PK)           │
                │ subkegiatan_id FK │
                │ tahun_anggaran    │
                │ total_pagu        │
                │ status            │
                │ approved_by       │
                │ approved_at       │
                └────────┬──────────┘
                         │
                         │
                ┌────────▼──────────┐
                │ rak_detail        │
                ├───────────────────┤
                │ id (PK)           │
                │ rak_subkeg_id FK  │
                │ kode_rekening_id  │
                │ jumlah_anggaran   │
                │ januari           │
                │ februari          │
                │ ...               │
                │ desember          │
                └───────────────────┘
```

---

## 📝 Migration Scripts

### **1. Create Tables**

```sql
-- =====================================================
-- MIGRATION: RAK Module Tables
-- Version: 1.0
-- Date: 2025-02-17
-- Description: Create tables for RAK (Rencana Anggaran Kas)
-- =====================================================

BEGIN;

-- =====================================================
-- TABLE: rak_subkegiatan
-- Description: RAK header per subkegiatan per tahun
-- =====================================================
CREATE TABLE IF NOT EXISTS rak_subkegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subkegiatan_id UUID NOT NULL REFERENCES subkegiatan(id) ON DELETE RESTRICT,
  tahun_anggaran INTEGER NOT NULL,
  total_pagu DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Status & Workflow
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  -- Possible values: DRAFT, SUBMITTED, APPROVED, REJECTED, REVISED
  
  -- Submission
  submitted_at TIMESTAMP,
  submitted_by UUID REFERENCES users(id),
  
  -- Approval
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approval_notes TEXT,
  
  -- Rejection
  rejected_at TIMESTAMP,
  rejected_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  
  -- Revision History
  revision_number INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES rak_subkegiatan(id),
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP,
  deleted_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT rak_subkegiatan_unique UNIQUE(subkegiatan_id, tahun_anggaran, revision_number),
  CONSTRAINT rak_subkegiatan_status_check CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'REVISED')),
  CONSTRAINT rak_subkegiatan_pagu_positive CHECK (total_pagu >= 0),
  CONSTRAINT rak_subkegiatan_tahun_valid CHECK (tahun_anggaran >= 2020 AND tahun_anggaran <= 2100)
);

-- Comments
COMMENT ON TABLE rak_subkegiatan IS 'Rencana Anggaran Kas header per subkegiatan';
COMMENT ON COLUMN rak_subkegiatan.status IS 'Status RAK: DRAFT, SUBMITTED, APPROVED, REJECTED, REVISED';
COMMENT ON COLUMN rak_subkegiatan.revision_number IS 'Nomor revisi RAK (mulai dari 1)';

-- =====================================================
-- TABLE: rak_detail
-- Description: RAK detail per kode rekening dengan breakdown bulanan
-- =====================================================
CREATE TABLE IF NOT EXISTS rak_detail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rak_subkegiatan_id UUID NOT NULL REFERENCES rak_subkegiatan(id) ON DELETE CASCADE,
  kode_rekening_id UUID NOT NULL REFERENCES kode_rekening(id) ON DELETE RESTRICT,
  
  -- Total Anggaran
  jumlah_anggaran DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Breakdown Bulanan (12 bulan)
  januari DECIMAL(15,2) NOT NULL DEFAULT 0,
  februari DECIMAL(15,2) NOT NULL DEFAULT 0,
  maret DECIMAL(15,2) NOT NULL DEFAULT 0,
  april DECIMAL(15,2) NOT NULL DEFAULT 0,
  mei DECIMAL(15,2) NOT NULL DEFAULT 0,
  juni DECIMAL(15,2) NOT NULL DEFAULT 0,
  juli DECIMAL(15,2) NOT NULL DEFAULT 0,
  agustus DECIMAL(15,2) NOT NULL DEFAULT 0,
  september DECIMAL(15,2) NOT NULL DEFAULT 0,
  oktober DECIMAL(15,2) NOT NULL DEFAULT 0,
  november DECIMAL(15,2) NOT NULL DEFAULT 0,
  desember DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- Auto-calculated Aggregates (Generated Columns)
  semester_1 DECIMAL(15,2) GENERATED ALWAYS AS 
    (januari + februari + maret + april + mei + juni) STORED,
  semester_2 DECIMAL(15,2) GENERATED ALWAYS AS 
    (juli + agustus + september + oktober + november + desember) STORED,
  
  triwulan_1 DECIMAL(15,2) GENERATED ALWAYS AS 
    (januari + februari + maret) STORED,
  triwulan_2 DECIMAL(15,2) GENERATED ALWAYS AS 
    (april + mei + juni) STORED,
  triwulan_3 DECIMAL(15,2) GENERATED ALWAYS AS 
    (juli + agustus + september) STORED,
  triwulan_4 DECIMAL(15,2) GENERATED ALWAYS AS 
    (oktober + november + desember) STORED,
  
  -- Metadata
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT rak_detail_unique UNIQUE(rak_subkegiatan_id, kode_rekening_id),
  CONSTRAINT rak_detail_balance_check CHECK (
    ABS(jumlah_anggaran - (
      COALESCE(januari,0) + COALESCE(februari,0) + COALESCE(maret,0) + 
      COALESCE(april,0) + COALESCE(mei,0) + COALESCE(juni,0) +
      COALESCE(juli,0) + COALESCE(agustus,0) + COALESCE(september,0) + 
      COALESCE(oktober,0) + COALESCE(november,0) + COALESCE(desember,0)
    )) < 0.01
  ),
  CONSTRAINT rak_detail_non_negative CHECK (
    jumlah_anggaran >= 0 AND
    januari >= 0 AND februari >= 0 AND maret >= 0 AND
    april >= 0 AND mei >= 0 AND juni >= 0 AND
    juli >= 0 AND agustus >= 0 AND september >= 0 AND
    oktober >= 0 AND november >= 0 AND desember >= 0
  )
);

-- Comments
COMMENT ON TABLE rak_detail IS 'Rencana Anggaran Kas detail per kode rekening dengan breakdown bulanan';
COMMENT ON COLUMN rak_detail.jumlah_anggaran IS 'Total anggaran tahunan (harus sama dengan sum 12 bulan)';
COMMENT ON COLUMN rak_detail.semester_1 IS 'Auto-calculated: Jan-Jun';
COMMENT ON COLUMN rak_detail.semester_2 IS 'Auto-calculated: Jul-Des';

COMMIT;
```

---

### **2. Create Indexes**

```sql
-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================

BEGIN;

-- rak_subkegiatan indexes
CREATE INDEX idx_rak_subkegiatan_subkegiatan ON rak_subkegiatan(subkegiatan_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_rak_subkegiatan_tahun ON rak_subkegiatan(tahun_anggaran) WHERE deleted_at IS NULL;
CREATE INDEX idx_rak_subkegiatan_status ON rak_subkegiatan(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_rak_subkegiatan_created ON rak_subkegiatan(created_at DESC);
CREATE INDEX idx_rak_subkegiatan_approved ON rak_subkegiatan(approved_at DESC) WHERE approved_at IS NOT NULL;

-- Composite index for common query
CREATE INDEX idx_rak_subkegiatan_tahun_status ON rak_subkegiatan(tahun_anggaran, status) WHERE deleted_at IS NULL;

-- rak_detail indexes
CREATE INDEX idx_rak_detail_rak_subkegiatan ON rak_detail(rak_subkegiatan_id);
CREATE INDEX idx_rak_detail_kode_rekening ON rak_detail(kode_rekening_id);

-- Composite index for join queries
CREATE INDEX idx_rak_detail_composite ON rak_detail(rak_subkegiatan_id, kode_rekening_id);

COMMIT;
```

---

### **3. Create Views**

```sql
-- =====================================================
-- VIEWS for Common Queries
-- =====================================================

BEGIN;

-- =====================================================
-- VIEW: v_rak_summary
-- Description: Summary of RAK per subkegiatan
-- =====================================================
CREATE OR REPLACE VIEW v_rak_summary AS
SELECT 
  rs.id,
  rs.subkegiatan_id,
  s.kode AS subkegiatan_kode,
  s.nama AS subkegiatan_nama,
  rs.tahun_anggaran,
  rs.total_pagu,
  rs.status,
  rs.revision_number,
  
  -- Aggregates from detail
  COUNT(rd.id) AS jumlah_kode_rekening,
  COALESCE(SUM(rd.jumlah_anggaran), 0) AS total_rencana,
  
  -- Variance
  (rs.total_pagu - COALESCE(SUM(rd.jumlah_anggaran), 0)) AS selisih,
  
  -- Metadata
  rs.created_at,
  rs.submitted_at,
  rs.approved_at,
  u_submitted.nama AS submitted_by_name,
  u_approved.nama AS approved_by_name
  
FROM rak_subkegiatan rs
JOIN subkegiatan s ON rs.subkegiatan_id = s.id
LEFT JOIN rak_detail rd ON rs.id = rd.rak_subkegiatan_id
LEFT JOIN users u_submitted ON rs.submitted_by = u_submitted.id
LEFT JOIN users u_approved ON rs.approved_by = u_approved.id
WHERE rs.deleted_at IS NULL
GROUP BY 
  rs.id, s.kode, s.nama, 
  u_submitted.nama, u_approved.nama;

-- =====================================================
-- VIEW: v_cash_flow_monthly
-- Description: Aggregate cash flow per bulan (untuk backward compatibility)
-- =====================================================
CREATE OR REPLACE VIEW v_cash_flow_monthly AS
SELECT 
  rs.tahun_anggaran,
  rs.subkegiatan_id,
  s.nama AS subkegiatan_nama,
  k.kode AS kegiatan_kode,
  
  -- Monthly totals
  SUM(rd.januari) AS total_januari,
  SUM(rd.februari) AS total_februari,
  SUM(rd.maret) AS total_maret,
  SUM(rd.april) AS total_april,
  SUM(rd.mei) AS total_mei,
  SUM(rd.juni) AS total_juni,
  SUM(rd.juli) AS total_juli,
  SUM(rd.agustus) AS total_agustus,
  SUM(rd.september) AS total_september,
  SUM(rd.oktober) AS total_oktober,
  SUM(rd.november) AS total_november,
  SUM(rd.desember) AS total_desember,
  
  -- Semester totals
  SUM(rd.semester_1) AS total_semester_1,
  SUM(rd.semester_2) AS total_semester_2,
  
  -- Triwulan totals
  SUM(rd.triwulan_1) AS total_triwulan_1,
  SUM(rd.triwulan_2) AS total_triwulan_2,
  SUM(rd.triwulan_3) AS total_triwulan_3,
  SUM(rd.triwulan_4) AS total_triwulan_4,
  
  -- Total tahunan
  SUM(rd.jumlah_anggaran) AS total_tahunan
  
FROM rak_detail rd
JOIN rak_subkegiatan rs ON rd.rak_subkegiatan_id = rs.id
JOIN subkegiatan s ON rs.subkegiatan_id = s.id
JOIN kegiatan k ON s.kegiatan_id = k.id
WHERE 
  rs.status = 'APPROVED'
  AND rs.deleted_at IS NULL
GROUP BY 
  rs.tahun_anggaran,
  rs.subkegiatan_id,
  s.nama,
  k.kode;

-- =====================================================
-- VIEW: v_rak_detail_with_realisasi
-- Description: RAK vs Realisasi comparison
-- =====================================================
CREATE OR REPLACE VIEW v_rak_detail_with_realisasi AS
SELECT 
  rd.id,
  rd.rak_subkegiatan_id,
  rs.tahun_anggaran,
  rs.subkegiatan_id,
  s.nama AS subkegiatan_nama,
  rd.kode_rekening_id,
  kr.kode AS kode_rekening,
  kr.uraian AS uraian_rekening,
  
  -- RAK (Rencana)
  rd.jumlah_anggaran AS rencana_tahunan,
  rd.januari AS rencana_jan,
  rd.februari AS rencana_feb,
  rd.maret AS rencana_mar,
  rd.april AS rencana_apr,
  rd.mei AS rencana_mei,
  rd.juni AS rencana_jun,
  rd.juli AS rencana_jul,
  rd.agustus AS rencana_agu,
  rd.september AS rencana_sep,
  rd.oktober AS rencana_okt,
  rd.november AS rencana_nov,
  rd.desember AS rencana_des
  
  -- TODO: Join with realisasi_belanja table when available
  
FROM rak_detail rd
JOIN rak_subkegiatan rs ON rd.rak_subkegiatan_id = rs.id
JOIN subkegiatan s ON rs.subkegiatan_id = s.id
JOIN kode_rekening kr ON rd.kode_rekening_id = kr.id
WHERE rs.deleted_at IS NULL;

COMMIT;
```

---

### **4. Create Triggers**

```sql
-- =====================================================
-- TRIGGERS for Automatic Updates
-- =====================================================

BEGIN;

-- =====================================================
-- TRIGGER: Auto-update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_rak_subkegiatan_updated_at
BEFORE UPDATE ON rak_subkegiatan
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_rak_detail_updated_at
BEFORE UPDATE ON rak_detail
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- TRIGGER: Validate total_pagu vs sum(rak_detail)
-- =====================================================
CREATE OR REPLACE FUNCTION validate_rak_total()
RETURNS TRIGGER AS $$
DECLARE
  v_total_detail DECIMAL(15,2);
  v_total_pagu DECIMAL(15,2);
BEGIN
  -- Get total from rak_detail
  SELECT COALESCE(SUM(jumlah_anggaran), 0)
  INTO v_total_detail
  FROM rak_detail
  WHERE rak_subkegiatan_id = NEW.id;
  
  -- Get total_pagu
  SELECT total_pagu
  INTO v_total_pagu
  FROM rak_subkegiatan
  WHERE id = NEW.id;
  
  -- Validate (allow 0.01 tolerance for rounding)
  IF ABS(v_total_pagu - v_total_detail) > 0.01 THEN
    RAISE EXCEPTION 'Total RAK detail (%) tidak sama dengan total pagu (%)', v_total_detail, v_total_pagu;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger on status change to SUBMITTED
CREATE TRIGGER trigger_validate_rak_on_submit
BEFORE UPDATE ON rak_subkegiatan
FOR EACH ROW
WHEN (NEW.status = 'SUBMITTED' AND OLD.status != 'SUBMITTED')
EXECUTE FUNCTION validate_rak_total();

COMMIT;
```

---

## 📊 Sample Data

```sql
-- =====================================================
-- SAMPLE DATA for Testing
-- =====================================================

BEGIN;

-- Assume we have:
-- - subkegiatan_id: '123e4567-e89b-12d3-a456-426614174000'
-- - kode_rekening_id (5.1.1.01): '223e4567-e89b-12d3-a456-426614174001'
-- - kode_rekening_id (5.1.1.02): '223e4567-e89b-12d3-a456-426614174002'
-- - user_id: '323e4567-e89b-12d3-a456-426614174000'

-- Insert RAK Header
INSERT INTO rak_subkegiatan (
  id,
  subkegiatan_id,
  tahun_anggaran,
  total_pagu,
  status,
  created_by,
  revision_number
) VALUES (
  'rak00001-e89b-12d3-a456-426614174000',
  '123e4567-e89b-12d3-a456-426614174000',
  2025,
  48000000, -- 48 juta
  'DRAFT',
  '323e4567-e89b-12d3-a456-426614174000',
  1
);

-- Insert RAK Detail - Kode Rekening 1
INSERT INTO rak_detail (
  rak_subkegiatan_id,
  kode_rekening_id,
  jumlah_anggaran,
  januari, februari, maret,
  april, mei, juni,
  juli, agustus, september,
  oktober, november, desember,
  created_by
) VALUES (
  'rak00001-e89b-12d3-a456-426614174000',
  '223e4567-e89b-12d3-a456-426614174001', -- Gaji Pokok
  30000000, -- 30 juta
  2500000, 2500000, 2500000, -- Q1
  2500000, 2500000, 2500000, -- Q2
  2500000, 2500000, 2500000, -- Q3
  2500000, 2500000, 2500000, -- Q4
  '323e4567-e89b-12d3-a456-426614174000'
);

-- Insert RAK Detail - Kode Rekening 2
INSERT INTO rak_detail (
  rak_subkegiatan_id,
  kode_rekening_id,
  jumlah_anggaran,
  januari, februari, maret,
  april, mei, juni,
  juli, agustus, september,
  oktober, november, desember,
  created_by
) VALUES (
  'rak00001-e89b-12d3-a456-426614174000',
  '223e4567-e89b-12d3-a456-426614174002', -- Tunjangan
  18000000, -- 18 juta
  1500000, 1500000, 1500000, -- Q1
  1500000, 1500000, 1500000, -- Q2
  1500000, 1500000, 1500000, -- Q3
  1500000, 1500000, 1500000, -- Q4
  '323e4567-e89b-12d3-a456-426614174000'
);

COMMIT;

-- Verify
SELECT * FROM v_rak_summary WHERE tahun_anggaran = 2025;
SELECT * FROM v_cash_flow_monthly WHERE tahun_anggaran = 2025;
```

---

## 🔄 Rollback Procedure

```sql
-- =====================================================
-- ROLLBACK SCRIPT (use with caution!)
-- =====================================================

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_validate_rak_on_submit ON rak_subkegiatan;
DROP TRIGGER IF EXISTS trigger_rak_detail_updated_at ON rak_detail;
DROP TRIGGER IF EXISTS trigger_rak_subkegiatan_updated_at ON rak_subkegiatan;

-- Drop functions
DROP FUNCTION IF EXISTS validate_rak_total();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop views
DROP VIEW IF EXISTS v_rak_detail_with_realisasi;
DROP VIEW IF EXISTS v_cash_flow_monthly;
DROP VIEW IF EXISTS v_rak_summary;

-- Drop indexes
DROP INDEX IF EXISTS idx_rak_detail_composite;
DROP INDEX IF EXISTS idx_rak_detail_kode_rekening;
DROP INDEX IF EXISTS idx_rak_detail_rak_subkegiatan;
DROP INDEX IF EXISTS idx_rak_subkegiatan_tahun_status;
DROP INDEX IF EXISTS idx_rak_subkegiatan_approved;
DROP INDEX IF EXISTS idx_rak_subkegiatan_created;
DROP INDEX IF EXISTS idx_rak_subkegiatan_status;
DROP INDEX IF EXISTS idx_rak_subkegiatan_tahun;
DROP INDEX IF EXISTS idx_rak_subkegiatan_subkegiatan;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS rak_detail CASCADE;
DROP TABLE IF EXISTS rak_subkegiatan CASCADE;

COMMIT;
```

---

## ✅ Post-Migration Validation

```sql
-- =====================================================
-- VALIDATION QUERIES
-- =====================================================

-- 1. Check table existence
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('rak_subkegiatan', 'rak_detail');

-- 2. Check indexes
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('rak_subkegiatan', 'rak_detail');

-- 3. Check constraints
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid IN (
  'rak_subkegiatan'::regclass,
  'rak_detail'::regclass
);

-- 4. Check views
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'v_rak%';

-- 5. Check triggers
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE event_object_table IN ('rak_subkegiatan', 'rak_detail');

-- 6. Test data integrity
SELECT 
  rs.id,
  rs.total_pagu,
  SUM(rd.jumlah_anggaran) AS total_detail,
  (rs.total_pagu - SUM(rd.jumlah_anggaran)) AS selisih
FROM rak_subkegiatan rs
LEFT JOIN rak_detail rd ON rs.id = rd.rak_subkegiatan_id
WHERE rs.deleted_at IS NULL
GROUP BY rs.id, rs.total_pagu
HAVING ABS(rs.total_pagu - COALESCE(SUM(rd.jumlah_anggaran), 0)) > 0.01;
-- Should return 0 rows if all data is valid
```

---

## 📋 Migration Checklist

- [ ] Backup database sebelum migration
- [ ] Review DDL scripts dengan DBA
- [ ] Test migration di development environment
- [ ] Test migration di staging environment
- [ ] Validate data integrity post-migration
- [ ] Test rollback procedure
- [ ] Update ORMs (Prisma schema)
- [ ] Run Prisma generate
- [ ] Update API documentation
- [ ] Inform development team
- [ ] Schedule production migration window
- [ ] Execute production migration
- [ ] Run post-migration validation
- [ ] Monitor performance metrics
- [ ] Document any issues encountered

---

**Migration Owner:** Database Team  
**Review Date:** 2025-02-17  
**Status:** ✅ Ready for Implementation
