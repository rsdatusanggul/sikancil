-- =====================================================
-- MIGRATION: RAK Module Tables
-- Version: 1.0
-- Date: 2026-02-17
-- Description: Create tables for RAK (Rencana Anggaran Kas)
-- Notes: Adapted for existing database structure
-- =====================================================

BEGIN;

-- =====================================================
-- TABLE: rak_subkegiatan
-- Description: RAK header per subkegiatan per tahun
-- =====================================================
CREATE TABLE IF NOT EXISTS rak_subkegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subkegiatan_id UUID NOT NULL REFERENCES subkegiatan_rba(id) ON DELETE RESTRICT,
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
  kode_rekening_id UUID NOT NULL REFERENCES chart_of_accounts(id) ON DELETE RESTRICT,
  
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