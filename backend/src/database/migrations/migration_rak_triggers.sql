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

CREATE TRIGGER IF NOT EXISTS trigger_rak_subkegiatan_updated_at
BEFORE UPDATE ON rak_subkegiatan
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS trigger_rak_detail_updated_at
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
CREATE TRIGGER IF NOT EXISTS trigger_validate_rak_on_submit
BEFORE UPDATE ON rak_subkegiatan
FOR EACH ROW
WHEN (NEW.status = 'SUBMITTED' AND OLD.status != 'SUBMITTED')
EXECUTE FUNCTION validate_rak_total();

COMMIT;