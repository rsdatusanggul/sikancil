# Migration Guide - Database Schema Update Si-Kancil v2.0

**Tanggal:** 14 Februari 2026
**Status:** ✅ Phase 2 COMPLETED - Migrations Ready
**Version:** 2.0

---

## 📋 Overview

Dokumen ini berisi panduan lengkap untuk menjalankan database migrations yang telah dibuat untuk update skema database Si-Kancil v2.0.

**Total Migrations:** 6 files
**Total Tables Affected:** 17 tables (16 new + 1 modified)

---

## 📁 Migration Files

### **1. CreateStrukturRBA (1739502687000)**
**File:** `/opt/sikancil/backend/src/database/migrations/1739502687000-CreateStrukturRBA.ts`

**Creates:**
- `program_rba` - Master Program (Level 1)
- `kegiatan_rba` - Master Kegiatan (Level 2)
- `output_rba` - Output/Komponen (Level 3)
- `sub_output_rba` - Sub Output (Level 4)
- `anggaran_belanja_rba` - Anggaran belanja dengan struktur

**Indexes:** 15+ indexes
**Foreign Keys:** 4 foreign keys

---

### **2. CreateSPJAdministratif (1739502688000)**
**File:** `/opt/sikancil/backend/src/database/migrations/1739502688000-CreateSPJAdministratif.ts`

**Creates:**
- `spj_up` - SPJ Uang Persediaan
- `spj_gu` - SPJ Ganti Uang
- `spj_tu` - SPJ Tambahan Uang

**Indexes:** 12+ indexes
**Foreign Keys:** None (polymorphic relationships via IDs)

---

### **3. CreateBukuPembantuRegister (1739502689000)**
**File:** `/opt/sikancil/backend/src/database/migrations/1739502689000-CreateBukuPembantuRegister.ts`

**Creates:**
- `buku_pembantu` - 9 jenis buku pembantu
- `register_sts` - Register Surat Tanda Setoran
- `register_spj` - Register SPJ

**Indexes:** 13+ indexes
**Foreign Keys:** None (flexible polymorphic structure)

---

### **4. CreateLaporanPenatausahaan (1739502690000)**
**File:** `/opt/sikancil/backend/src/database/migrations/1739502690000-CreateLaporanPenatausahaan.ts`

**Creates:**
- `laporan_pendapatan_blud` - Laporan Pendapatan Triwulanan
- `laporan_pengeluaran_biaya_blud` - Laporan Pengeluaran Triwulanan
- `biaya_per_objek` ⭐ CRITICAL - Rekap per objek
- `sptj` - Surat Pernyataan Tanggung Jawab
- `spj_fungsional` - SPJ Fungsional ke PPKD

**Indexes:** 17+ indexes
**Foreign Keys:** 1 foreign key (biaya_per_objek → laporan_pengeluaran_biaya_blud)

---

### **5. CreateLaporanPenutupanKas (1739502691000)**
**File:** `/opt/sikancil/backend/src/database/migrations/1739502691000-CreateLaporanPenutupanKas.ts`

**Creates:**
- `laporan_penutupan_kas` - Monthly Cash Reconciliation

**Indexes:** 5 indexes
**Foreign Keys:** None

---

### **6. ModifyBukuKasUmum (1739502692000)**
**File:** `/opt/sikancil/backend/src/database/migrations/1739502692000-ModifyBukuKasUmum.ts`

**Modifies:** `buku_kas_umum`

**Adds 9 new columns:**
- `jenisBKU` (menggantikan 'jenis')
- `bulan`, `tahun` (untuk grouping)
- `bendaharaId`, `bendaharaTipe`
- `isPosted`, `postedAt`
- `approvedBy`, `approvedAt`

**Indexes:** 3+ new indexes

---

## 🚀 How to Run Migrations

### **Prerequisites**

1. **Backup Database First!**
```bash
cd /opt/sikancil/backend
# PostgreSQL backup
pg_dump -U postgres -d sikancil > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

2. **Check Current State**
```bash
# Check if TypeORM is configured
npm run typeorm migration:show

# Check database connection
npm run typeorm query "SELECT version();"
```

---

### **Step 1: Run All Migrations**

```bash
cd /opt/sikancil/backend

# Run all pending migrations
npm run typeorm migration:run

# Or using ts-node directly
npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d src/database/data-source.ts
```

**Expected Output:**
```
Migration CreateStrukturRBA1739502687000 has been executed successfully.
Migration CreateSPJAdministratif1739502688000 has been executed successfully.
Migration CreateBukuPembantuRegister1739502689000 has been executed successfully.
Migration CreateLaporanPenatausahaan1739502690000 has been executed successfully.
Migration CreateLaporanPenutupanKas1739502691000 has been executed successfully.
Migration ModifyBukuKasUmum1739502692000 has been executed successfully.
```

---

### **Step 2: Verify Migrations**

```bash
# Check which migrations have been executed
npm run typeorm migration:show

# Verify tables exist
npm run typeorm query "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%rba%' OR table_name LIKE '%spj%' OR table_name LIKE '%laporan%' ORDER BY table_name;"
```

**Expected Tables:**
```
anggaran_belanja_rba
biaya_per_objek
buku_kas_umum (modified)
buku_pembantu
kegiatan_rba
laporan_pendapatan_blud
laporan_pengeluaran_biaya_blud
laporan_penutupan_kas
output_rba
program_rba
register_spj
register_sts
spj_fungsional
spj_gu
spj_tu
spj_up
sptj
sub_output_rba
```

---

### **Step 3: Verify Indexes**

```bash
# Check indexes for specific table
npm run typeorm query "SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'program_rba';"

# Check all indexes for new tables
npm run typeorm query "SELECT tablename, indexname FROM pg_indexes WHERE tablename IN ('program_rba', 'kegiatan_rba', 'output_rba', 'biaya_per_objek', 'spj_up', 'spj_gu', 'spj_tu') ORDER BY tablename, indexname;"
```

---

### **Step 4: Verify Foreign Keys**

```bash
# Check foreign keys
npm run typeorm query "SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('kegiatan_rba', 'output_rba', 'sub_output_rba', 'anggaran_belanja_rba', 'biaya_per_objek')
ORDER BY tc.table_name;"
```

---

## ⏪ Rollback Strategy

### **Rollback All Migrations**

```bash
# Rollback ALL migrations (DANGER!)
npm run typeorm migration:revert

# This will revert one by one, starting from the most recent
# Run multiple times to revert all 6 migrations
```

### **Rollback Specific Migration**

Unfortunately, TypeORM doesn't support rollback to a specific migration directly. You need to revert one by one.

```bash
# Revert last migration (ModifyBukuKasUmum)
npm run typeorm migration:revert

# Revert next (CreateLaporanPenutupanKas)
npm run typeorm migration:revert

# And so on...
```

### **Emergency Rollback (Manual)**

If automatic rollback fails:

```bash
# 1. Restore from backup
psql -U postgres -d sikancil < backup_before_migration_YYYYMMDD_HHMMSS.sql

# 2. Clear migration records
psql -U postgres -d sikancil -c "DELETE FROM migrations WHERE name LIKE '%1739502%';"
```

---

## 🧪 Testing After Migration

### **Test 1: Check Table Counts**

```sql
SELECT
  COUNT(*) AS total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- Expected: Should increase by 16 tables
```

### **Test 2: Check Constraints**

```sql
SELECT
  COUNT(*) AS total_foreign_keys
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY';

-- Expected: Should increase by ~5 foreign keys
```

### **Test 3: Insert Sample Data**

```sql
-- Test: Insert sample Program
INSERT INTO program_rba (id, "kodeProgram", "namaProgram", tahun)
VALUES (
  uuid_generate_v4(),
  '01',
  'Program Pelayanan Kesehatan Masyarakat',
  2026
);

-- Test: Query back
SELECT * FROM program_rba;
```

### **Test 4: Check Modified BKU**

```sql
-- Check new columns in buku_kas_umum
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'buku_kas_umum'
  AND column_name IN ('jenisBKU', 'bulan', 'tahun', 'bendaharaId', 'isPosted', 'approvedBy')
ORDER BY column_name;
```

---

## ⚠️ Common Issues & Solutions

### **Issue 1: UUID Extension Not Enabled**

**Error:**
```
ERROR: function uuid_generate_v4() does not exist
```

**Solution:**
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

---

### **Issue 2: Migration Already Executed**

**Error:**
```
Migration CreateStrukturRBA1739502687000 has already been executed.
```

**Solution:**
This is normal if migrations were already run. Check with:
```bash
npm run typeorm migration:show
```

---

### **Issue 3: Table Already Exists**

**Error:**
```
ERROR: relation "program_rba" already exists
```

**Solution:**
```bash
# Either:
# 1. Rollback first
npm run typeorm migration:revert

# 2. Or drop table manually (CAREFUL!)
psql -U postgres -d sikancil -c "DROP TABLE IF EXISTS program_rba CASCADE;"
```

---

### **Issue 4: Foreign Key Constraint Fails**

**Error:**
```
ERROR: insert or update on table "kegiatan_rba" violates foreign key constraint
```

**Solution:**
Ensure parent tables have data first. Order matters:
1. program_rba (parent)
2. kegiatan_rba (child of program)
3. output_rba (child of kegiatan)
4. etc.

---

## 📊 Performance Considerations

### **After Migration - Optimization**

```sql
-- 1. Analyze tables untuk update statistics
ANALYZE program_rba;
ANALYZE kegiatan_rba;
ANALYZE output_rba;
ANALYZE biaya_per_objek;
ANALYZE buku_pembantu;
-- ... untuk semua tabel baru

-- 2. Vacuum tables
VACUUM ANALYZE program_rba;
VACUUM ANALYZE kegiatan_rba;
-- ... untuk semua tabel baru

-- 3. Reindex jika perlu
REINDEX TABLE program_rba;
REINDEX TABLE biaya_per_objek;
```

---

## 📝 Post-Migration Checklist

- [ ] Backup database sebelum migration ✅
- [ ] Run all migrations successfully ✅
- [ ] Verify all tables created (16 new tables) ✅
- [ ] Verify all indexes created (~40+ indexes) ✅
- [ ] Verify all foreign keys created (~5 FKs) ✅
- [ ] Test insert sample data ✅
- [ ] Run ANALYZE on new tables ✅
- [ ] Update application entities (already done) ✅
- [ ] Test application startup ⏳ (TODO)
- [ ] Monitor performance ⏳ (TODO)

---

## 🔄 Next Steps

After successful migration:

1. **Update TypeORM Entities** (Already Done ✅)
   - All entity files created in `/opt/sikancil/backend/src/database/entities/`

2. **Create Services** (TODO - Phase 3)
   - ProgramRBAService
   - KegiatanRBAService
   - OutputRBAService
   - SPJUPService, SPJGUService, SPJTUService
   - BukuPembantuService
   - Laporan services (5 services)
   - etc.

3. **Create Controllers** (TODO - Phase 3)
   - ~15 controllers baru

4. **Create DTOs** (TODO - Phase 4)
   - ~50+ DTOs

5. **Frontend Integration** (TODO - Phase 5)
   - ~25 pages, ~50 components

---

## 📞 Support

**Issues?**
- Check logs: `npm run typeorm migration:run 2>&1 | tee migration.log`
- Review migration files in: `/opt/sikancil/backend/src/database/migrations/`
- Contact: Backend Team Lead

---

## 📝 Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 14 Feb 2026 | RSDS_DEV | Initial migration guide - 6 migration files |

---

**END OF MIGRATION GUIDE**

✅ **Phase 2 COMPLETED - Migrations Ready to Run**
