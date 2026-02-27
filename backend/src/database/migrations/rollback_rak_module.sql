-- =====================================================
-- ROLLBACK SCRIPT (use with caution!)
-- Version: 1.0
-- Date: 2026-02-17
-- Description: Remove RAK module tables and related objects
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

-- =====================================================
-- VALIDATION AFTER ROLLBACK
-- =====================================================

-- Check if tables are removed
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('rak_subkegiatan', 'rak_detail');

-- Should return 0 rows if rollback is successful