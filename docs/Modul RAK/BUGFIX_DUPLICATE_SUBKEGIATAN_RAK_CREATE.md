# 🐛 Bugfix: Duplikasi Sub-Kegiatan pada Form RAK Create

**Tanggal:** 2026-02-17
**Status:** ✅ Identified - Ready for Implementation
**Severity:** 🔴 High (Blocking RAK creation for users)
**Module:** RAK Module - Create RAK Form

---

## 📋 Deskripsi Masalah

### Gejala yang Dilaporkan
Ketika BA (Budget Administrator) mencoba membuat RAK baru dan memilih sub-kegiatan:

1. ❌ **Duplikasi Data:** Muncul 2 sub-kegiatan yang identik di dropdown
2. ❌ **Error Message:** Kedua pilihan menampilkan notifikasi _"Subkegiatan ini belum memiliki data anggaran"_ saat dipilih
3. ✅ **Data Sebenarnya:** Di halaman list Sub-Kegiatan hanya ada 1 sub-kegiatan dan sudah memiliki data anggaran

### Screenshot Masalah
```
Dropdown Sub-Kegiatan di RAK Create Form:
┌─────────────────────────────────────────────┐
│ Pilih Sub-Kegiatan:                         │
│ ┌─────────────────────────────────────────┐ │
│ │ ▼ Penyediaan Gaji dan Tunjangan ASN    │ │ <- Duplikat 1
│ │   Penyediaan Gaji dan Tunjangan ASN    │ │ <- Duplikat 2
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

Saat salah satu dipilih dan submit:
┌─────────────────────────────────────────────┐
│ ⚠️ Subkegiatan ini belum memiliki data     │
│    anggaran                                 │
└─────────────────────────────────────────────┘
```

---

## 🔍 Investigasi & Root Cause Analysis

### 1. File yang Bermasalah

**Primary Issue:**
[frontend/src/features/rak/pages/RakCreate.tsx](../../frontend/src/features/rak/pages/RakCreate.tsx) - Line 27-30

### 2. Root Cause

#### Frontend (RakCreate.tsx)
Saat mengambil data sub-kegiatan untuk dropdown, kode tidak menyertakan filter `isActive`:

```tsx
// ❌ BEFORE (Line 27-30) - PROBLEMATIC
const data = await subKegiatanRBAApi.getAll({
  tahun: tahunAnggaran,
  limit: 1000 // Get all for dropdown
});
// Missing: isActive: true
```

#### Backend (subkegiatan-rba.service.ts)
Service backend hanya menerapkan filter `isActive` jika parameter tersebut **explicitly provided**:

```ts
// Line 91-93
if (isActive !== undefined) {
  where.isActive = isActive;  // Only filters if provided
}
```

**Akibatnya:**
- Query mengembalikan **SEMUA** record sub-kegiatan, termasuk yang sudah di-soft-delete (`isActive = false`)
- Jika ada sub-kegiatan yang pernah dihapus (soft-delete) lalu dibuat ulang, kedua record muncul di dropdown
- Record yang inactive memiliki `totalPagu = 0` dan tidak ada `anggaranBelanja`, sehingga memicu error validasi

### 3. Mengapa Error "Belum Memiliki Data Anggaran" Muncul?

Backend validation di [rak.service.ts](../../backend/src/modules/subkegiatan-rba/rak.service.ts) line 210-230:

```ts
// Validation 1: Check totalPagu
if (subkegiatan.totalPagu <= 0) {
  throw new BadRequestException(
    'Subkegiatan tidak memiliki pagu anggaran...'
  );
}

// Validation 2: Check anggaranBelanja records
if (anggaranBelanja.length === 0) {
  throw new BadRequestException(
    'Subkegiatan tidak memiliki data anggaran belanja...'
  );
}
```

Record yang inactive (soft-deleted) memiliki `totalPagu = 0` atau tidak ada `anggaranBelanja`, sehingga ketika dipilih akan memicu salah satu error di atas.

### 4. Mengapa Halaman List Tidak Bermasalah?

Di halaman list [SubKegiatanRBA.tsx](../../frontend/src/features/subkegiatan-rba/SubKegiatanRBA.tsx) line 63:

```tsx
// ✅ CORRECT - Has isActive filter
isActive: showInactive ? undefined : true,  // Default: true
```

Halaman list secara default mengirim `isActive: true`, sehingga hanya menampilkan sub-kegiatan yang aktif.

---

## 🔧 Solusi & Implementation Plan

### File yang Diubah
**1 file saja:** [frontend/src/features/rak/pages/RakCreate.tsx](../../frontend/src/features/rak/pages/RakCreate.tsx)

### Perubahan Kode

**Line 27-30, tambahkan parameter `isActive: true`:**

```diff
const data = await subKegiatanRBAApi.getAll({
  tahun: tahunAnggaran,
+ isActive: true, // Only fetch active sub-activities
  limit: 1000 // Get all for dropdown
});
```

**Hanya 1 line penambahan!** ✅

---

## ✅ Verification & Testing Plan

### Pre-Fix: Reproduksi Masalah

#### Step 1: Check Database
```sql
SELECT
  id,
  kodeSubKegiatan,
  namaSubKegiatan,
  tahun,
  isActive,
  totalPagu
FROM subkegiatan_rba
WHERE tahun = 2026
ORDER BY kodeSubKegiatan, isActive DESC;
```

**Cari:** Sub-kegiatan dengan `kodeSubKegiatan` sama tapi `isActive` berbeda (true/false).

#### Step 2: Test Form (Before Fix)
1. Buka form create RAK
2. Pilih tahun 2026
3. Klik dropdown "Pilih Sub-Kegiatan"
4. **Verify:** Ada 2 entry yang sama (duplikat)
5. Pilih salah satu
6. **Verify:** Muncul error _"Subkegiatan ini belum memiliki data anggaran"_

---

### Post-Fix: Testing

#### Step 1: Apply Fix
```bash
# Navigate to frontend
cd /opt/sikancil/frontend

# Apply the code change (add isActive: true)
# Rebuild or restart dev server
npm run dev  # atau npm run build
```

#### Step 2: Test Form (After Fix)
1. Clear browser cache
2. Reload halaman
3. Buka form create RAK
4. Pilih tahun 2026
5. Klik dropdown "Pilih Sub-Kegiatan"
6. **Expected:** ✅ Hanya 1 sub-kegiatan muncul (yang aktif)
7. Pilih sub-kegiatan tersebut
8. **Expected:** ✅ Tidak ada error, form bisa di-submit
9. Submit form
10. **Expected:** ✅ RAK berhasil dibuat

#### Step 3: Cross-Verification
- Buka halaman list Sub-Kegiatan RBA
- **Verify:** Sub-kegiatan yang muncul di list sama dengan yang muncul di dropdown RAK create
- **Verify:** Data anggaran terlihat di list

#### Step 4: Edge Cases
- ✅ Test dengan tahun berbeda (2025, 2027)
- ✅ Test dengan kegiatan yang memiliki banyak sub-kegiatan
- ✅ Test dengan kegiatan yang tidak punya sub-kegiatan (dropdown kosong)
- ✅ Test ubah tahun di form (dropdown refresh dengan benar)

---

## 📊 Impact Analysis

### Affected Components
| Component | Impact | Status |
|-----------|--------|--------|
| **RAK Create Form** | ✅ Fixed | Dropdown hanya tampilkan active records |
| Sub-Kegiatan List | ➖ No change | Sudah benar dari awal |
| Existing RAK records | ➖ No change | Tidak ada perubahan data |
| Backend API | ➖ No change | Tidak perlu diubah |
| Database | ➖ No change | Tidak ada migration |

### Risk Assessment
- **Complexity:** 🟢 Very Low (1-line change)
- **Risk:** 🟢 Very Low (follows existing pattern)
- **Rollback:** 🟢 Easy (revert 1 line)
- **Testing Time:** 🟢 < 10 minutes

---

## 📝 Technical Details

### API Call Flow

#### Before Fix (Problematic)
```
RakCreate.tsx
  └─> subKegiatanRBAApi.getAll({ tahun: 2026, limit: 1000 })
       └─> GET /subkegiatan-rba?tahun=2026&limit=1000
            └─> Backend: findAll({ tahun: 2026 })
                 └─> WHERE tahun = 2026  (NO isActive filter!)
                      └─> Returns: [active_record, inactive_record]  ❌
```

#### After Fix (Correct)
```
RakCreate.tsx
  └─> subKegiatanRBAApi.getAll({ tahun: 2026, isActive: true, limit: 1000 })
       └─> GET /subkegiatan-rba?tahun=2026&isActive=true&limit=1000
            └─> Backend: findAll({ tahun: 2026, isActive: true })
                 └─> WHERE tahun = 2026 AND isActive = true  ✅
                      └─> Returns: [active_record]  ✅
```

### Related Files Reference

| File | Line | Purpose |
|------|------|---------|
| [RakCreate.tsx](../../frontend/src/features/rak/pages/RakCreate.tsx) | 27-30 | ❌ Missing isActive filter (TO FIX) |
| [SubKegiatanRBA.tsx](../../frontend/src/features/subkegiatan-rba/SubKegiatanRBA.tsx) | 63 | ✅ Correct pattern (reference) |
| [subkegiatan-rba.service.ts](../../backend/src/modules/subkegiatan-rba/subkegiatan-rba.service.ts) | 91-93 | Backend filter logic |
| [rak.service.ts](../../backend/src/modules/subkegiatan-rba/rak.service.ts) | 210-230 | Budget validation (triggers error) |

---

## 🎯 Next Steps

### Immediate Actions
1. ✅ Apply the 1-line fix to `RakCreate.tsx`
2. ✅ Test locally dengan skenario di atas
3. ✅ Create commit: `fix: Filter inactive sub-kegiatan on RAK create form`
4. ✅ Submit PR for review

### Optional: Preventive Measures
Consider auditing other components yang menggunakan `subKegiatanRBAApi.getAll()` untuk memastikan semua sudah menggunakan `isActive: true` filter.

```bash
# Search for similar patterns
grep -r "subKegiatanRBAApi.getAll" frontend/src/
```

**Current Status:** Only 2 files use it:
- ✅ `SubKegiatanRBA.tsx` - Already correct
- ❌ `RakCreate.tsx` - Needs fix

---

## 📌 Notes

- **Pattern Consistency:** Fix ini mengikuti pattern yang sudah ada di `SubKegiatanRBA.tsx`
- **No Breaking Changes:** Pure frontend fix, tidak mempengaruhi backend atau database
- **High Confidence:** Simple parameter addition dengan impact yang jelas
- **Quick Win:** Low effort, high impact bugfix

---

## ✍️ Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-02-17 | Claude (Investigation) | Root cause analysis & documentation |
| 2026-02-17 | [Implementer] | Implementation (pending) |

---

**Status:** 📝 Documented - Ready for Implementation
**Priority:** 🔴 High (User-facing bug blocking RAK creation)
**Estimated Fix Time:** < 5 minutes
