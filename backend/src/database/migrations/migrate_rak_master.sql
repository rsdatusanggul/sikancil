-- =====================================================
-- MASTER MIGRATION SCRIPT - RAK Module
-- Version: 1.0
-- Date: 2026-02-17
-- Description: Execute all RAK module migrations in order
-- Usage: psql -U sikancil_user -d sikancil_dev -f migrate_rak_master.sql
-- =====================================================

\echo '=========================================='
\echo 'RAK Module Migration Started'
\echo '=========================================='

-- =====================================================
-- STEP 1: Create Tables
-- =====================================================
\echo ''
\echo 'STEP 1: Creating tables...'
\i migration_rak_module.sql
\echo '✓ Tables created successfully'

-- =====================================================
-- STEP 2: Create Indexes and Views
-- =====================================================
\echo ''
\echo 'STEP 2: Creating indexes and views...'
\i migration_rak_indexes_views.sql
\echo '✓ Indexes and views created successfully'

-- =====================================================
-- STEP 3: Create Triggers
-- =====================================================
\echo ''
\echo 'STEP 3: Creating triggers...'
\i migration_rak_triggers.sql
\echo '✓ Triggers created successfully'

-- =====================================================
-- VALIDATION
-- =====================================================
\echo ''
\echo '=========================================='
\echo 'Running validation checks...'
\echo '=========================================='

-- Check table existence
\echo ''
\echo '1. Checking table existence...'
SELECT 
  table_name, 
  '✓ EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('rak_subkegiatan', 'rak_detail')
ORDER BY table_name;

-- Check indexes
\echo ''
\echo '2. Checking indexes...'
SELECT 
  indexname,
  '✓ CREATED' as status
FROM pg_indexes 
WHERE tablename IN ('rak_subkegiatan', 'rak_detail')
  AND indexname LIKE 'idx_rak%'
ORDER BY tablename, indexname;

-- Check views
\echo ''
\echo '3. Checking views...'
SELECT 
  table_name,
  '✓ CREATED' as status
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name LIKE 'v_rak%'
ORDER BY table_name;

-- Check triggers
\echo ''
\echo '4. Checking triggers...'
SELECT 
  trigger_name, 
  event_object_table,
  '✓ CREATED' as status
FROM information_schema.triggers 
WHERE event_object_table IN ('rak_subkegiatan', 'rak_detail')
  AND trigger_name LIKE 'trigger_rak%'
ORDER BY event_object_table, trigger_name;

-- Check constraints
\echo ''
\echo '5. Checking constraints...'
SELECT 
  conname, 
  contype,
  '✓ CREATED' as status
FROM pg_constraint 
WHERE conrelid IN (
  'rak_subkegiatan'::regclass,
  'rak_detail'::regclass
)
ORDER BY conrelid::regclass::text, conname;

\echo ''
\echo '=========================================='
\echo 'RAK Module Migration Completed Successfully!'
\echo '=========================================='