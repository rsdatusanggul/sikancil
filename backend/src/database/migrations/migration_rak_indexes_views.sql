-- =====================================================
-- INDEXES for Performance Optimization
-- =====================================================

BEGIN;

-- rak_subkegiatan indexes
CREATE INDEX IF NOT EXISTS idx_rak_subkegiatan_subkegiatan ON rak_subkegiatan(subkegiatan_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rak_subkegiatan_tahun ON rak_subkegiatan(tahun_anggaran) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rak_subkegiatan_status ON rak_subkegiatan(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rak_subkegiatan_created ON rak_subkegiatan(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rak_subkegiatan_approved ON rak_subkegiatan(approved_at DESC) WHERE approved_at IS NOT NULL;

-- Composite index for common query
CREATE INDEX IF NOT EXISTS idx_rak_subkegiatan_tahun_status ON rak_subkegiatan(tahun_anggaran, status) WHERE deleted_at IS NULL;

-- rak_detail indexes
CREATE INDEX IF NOT EXISTS idx_rak_detail_rak_subkegiatan ON rak_detail(rak_subkegiatan_id);
CREATE INDEX IF NOT EXISTS idx_rak_detail_kode_rekening ON rak_detail(kode_rekening_id);

-- Composite index for join queries
CREATE INDEX IF NOT EXISTS idx_rak_detail_composite ON rak_detail(rak_subkegiatan_id, kode_rekening_id);

COMMIT;

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
  sk.kodeSubKegiatan AS subkegiatan_kode,
  sk.namaSubKegiatan AS subkegiatan_nama,
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
JOIN subkegiatan_rba sk ON rs.subkegiatan_id = sk.id
LEFT JOIN rak_detail rd ON rs.id = rd.rak_subkegiatan_id
LEFT JOIN users u_submitted ON rs.submitted_by = u_submitted.id
LEFT JOIN users u_approved ON rs.approved_by = u_approved.id
WHERE rs.deleted_at IS NULL
GROUP BY 
  rs.id, sk.kodeSubKegiatan, sk.namaSubKegiatan, 
  u_submitted.nama, u_approved.nama;

-- =====================================================
-- VIEW: v_cash_flow_monthly
-- Description: Aggregate cash flow per bulan (untuk backward compatibility)
-- =====================================================
CREATE OR REPLACE VIEW v_cash_flow_monthly AS
SELECT 
  rs.tahun_anggaran,
  rs.subkegiatan_id,
  sk.namaSubKegiatan AS subkegiatan_nama,
  k.kodeKegiatan AS kegiatan_kode,
  
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
JOIN subkegiatan_rba sk ON rs.subkegiatan_id = sk.id
JOIN kegiatan_rba k ON sk.kegiatanId = k.id
WHERE 
  rs.status = 'APPROVED'
  AND rs.deleted_at IS NULL
GROUP BY 
  rs.tahun_anggaran,
  rs.subkegiatan_id,
  sk.namaSubKegiatan,
  k.kodeKegiatan;

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
  sk.namaSubKegiatan AS subkegiatan_nama,
  rd.kode_rekening_id,
  coa.kodeRekening AS kode_rekening,
  coa.namaRekening AS uraian_rekening,
  
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
JOIN subkegiatan_rba sk ON rs.subkegiatan_id = sk.id
JOIN chart_of_accounts coa ON rd.kode_rekening_id = coa.id
WHERE rs.deleted_at IS NULL;

COMMIT;