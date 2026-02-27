# Rencana Perbaikan: Program → Kegiatan → SubKegiatan → RAK

## 📋 Ringkasan Masalah

Data tidak muncul di halaman Program, Kegiatan, SubKegiatan, dan RAK. Setelah investigasi mendalam, ditemukan beberapa bug kritis yang menyebabkan error cascade di seluruh modul.

## 🔍 Root Cause Analysis

### Bug Kritis yang Ditemukan

| Prioritas | Masalah | Lokasi | Dampak |
|-----------|---------|--------|--------|
| **P0** | Getter TypeORM tidak serialize ke JSON | `subkegiatan-rba.entity.ts` | RAK menampilkan nama subkegiatan kosong |
| **P1** | Null reference crash `indikatorProgram.length` | `ProgramRBA.tsx:119` | Program list crash jika data null |
| **P1** | RAK controller double prefix `/api` | `rak.controller.ts:31` | Route jadi `/api/v1/api/rak` |
| **P2** | Year filter default 2026 | Semua komponen | Data 2024/2025 tidak muncul |
| **P2** | Soft-deleted records tersembunyi | Backend services | Tidak bisa lihat data yang dihapus |

### Detail Bug P0: RAK Serialization Issue

**Penyebab:**
```typescript
// Di subkegiatan-rba.entity.ts (line 100-110)
get kode(): string {
  return this.kodeSubKegiatan;
}

get uraian(): string {
  return this.namaSubKegiatan;
}
```

TypeORM mengembalikan **Plain Objects (POJOs)**, bukan class instances. Getter tidak ter-serialize otomatis ke JSON response.

**Akibat:**
```typescript
// Frontend mengharapkan (RakList.tsx:135-137)
rak.subkegiatan.kode      // undefined ❌
rak.subkegiatan.uraian    // undefined ❌

// Tapi yang ada di database
rak.subkegiatan.kodeSubKegiatan   // "1.01.01" ✅
rak.subkegiatan.namaSubKegiatan   // "Nama SubKegiatan" ✅
```

---

## 🔧 Rencana Perbaikan Bertahap

### FASE 1: Perbaikan Modul Program RBA

#### 1.1 Fix Crash Null Safety (P1)
**File:** `frontend/src/features/program-rba/ProgramRBA.tsx`

**Baris 119 - Ganti:**
```typescript
// SEBELUM (crash jika null)
{program.indikatorProgram.length} indikator

// SESUDAH (aman dengan optional chaining)
{program.indikatorProgram?.length ?? 0} indikator
```

#### 1.2 Tambah API Endpoint untuk Tahun Tersedia
**File:** `backend/src/modules/program-rba/program-rba.service.ts`

**Tambah method baru:**
```typescript
async getAvailableYears(): Promise<number[]> {
  const result = await this.programRbaRepository
    .createQueryBuilder('program')
    .select('DISTINCT program.tahun', 'tahun')
    .orderBy('program.tahun', 'DESC')
    .getRawMany();

  return result.map(r => r.tahun);
}
```

**File:** `backend/src/modules/program-rba/program-rba.controller.ts`

**Tambah endpoint:**
```typescript
@Get('years')
@ApiOperation({ summary: 'Get available years with program data' })
async getAvailableYears() {
  return this.programRbaService.getAvailableYears();
}
```

#### 1.3 Update Frontend: Year Selector Dinamis
**File:** `frontend/src/features/program-rba/ProgramRBA.tsx`

**Tambah query:**
```typescript
const { data: availableYears } = useQuery({
  queryKey: ['program-rba-years'],
  queryFn: () => programRBAApi.getAvailableYears(),
});
```

**Ganti dropdown tahun (sekitar baris 151-153):**
```typescript
// SEBELUM (hardcoded)
<option value={currentYear - 1}>{currentYear - 1}</option>
<option value={currentYear}>{currentYear}</option>
<option value={currentYear + 1}>{currentYear + 1}</option>

// SESUDAH (dinamis dari database)
{availableYears?.map(year => (
  <option key={year} value={year}>{year}</option>
))}
```

**Set default ke tahun terbaru:**
```typescript
React.useEffect(() => {
  if (availableYears && availableYears.length > 0) {
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]); // Tahun terbaru
    }
  }
}, [availableYears]);
```

#### 1.4 Tambah Toggle "Tampilkan yang Dihapus"
**File:** `frontend/src/features/program-rba/ProgramRBA.tsx`

**Tambah state:**
```typescript
const [showInactive, setShowInactive] = React.useState(false);
```

**Update query:**
```typescript
const { data: programs, isLoading } = useQuery({
  queryKey: ['program-rba', selectedYear, showInactive],
  queryFn: () => programRBAApi.getAll(selectedYear, showInactive),
});
```

**Tambah UI toggle (setelah year selector):**
```typescript
<label className="flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    checked={showInactive}
    onChange={(e) => setShowInactive(e.target.checked)}
    className="rounded border-gray-300"
  />
  <span>Tampilkan yang dihapus</span>
</label>
```

**File:** `frontend/src/features/program-rba/api.ts`

**Update fungsi API:**
```typescript
export const getAll = async (tahun: number, showInactive = false) => {
  const response = await apiClient.get<ProgramRBA[]>('/program-rba', {
    params: { tahun, isActive: showInactive ? undefined : true },
  });
  return response.data.data;
};

export const getAvailableYears = async (): Promise<number[]> => {
  const response = await apiClient.get<number[]>('/program-rba/years');
  return response.data;
};
```

**File:** `backend/src/modules/program-rba/program-rba.service.ts`

**Modifikasi `findAll()`:**
```typescript
async findAll(tahun: number, isActive?: boolean) {
  const where: any = { tahun };

  // Hanya filter isActive jika explicitly provided
  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return this.programRbaRepository.find({
    where,
    order: { kodeProgram: 'ASC' },
  });
}
```

#### ✅ Verifikasi Fase 1
- [ ] Halaman Program RBA load tanpa crash
- [ ] Dropdown tahun menampilkan tahun dari database
- [ ] Toggle "Tampilkan yang dihapus" berfungsi
- [ ] Create, edit, delete program masih bekerja

---

### FASE 2: Perbaikan Modul Kegiatan RBA

#### 2.1 Tambah API untuk Tahun Tersedia
**File:** `backend/src/modules/kegiatan-rba/kegiatan-rba.service.ts`

**Tambah method:**
```typescript
async getAvailableYears(): Promise<number[]> {
  const result = await this.kegiatanRbaRepository
    .createQueryBuilder('kegiatan')
    .select('DISTINCT kegiatan.tahun', 'tahun')
    .orderBy('kegiatan.tahun', 'DESC')
    .getRawMany();

  return result.map(r => r.tahun);
}
```

**File:** `backend/src/modules/kegiatan-rba/kegiatan-rba.controller.ts`

**Tambah endpoint:**
```typescript
@Get('years')
@ApiOperation({ summary: 'Get available years' })
async getAvailableYears() {
  return this.kegiatanRbaService.getAvailableYears();
}
```

#### 2.2 Update Frontend
**File:** `frontend/src/features/kegiatan-rba/KegiatanRBA.tsx`

**Tambah query dan update year selector** (pola sama seperti Fase 1.3)

#### 2.3 Tambah Toggle untuk Inactive
**File:** `frontend/src/features/kegiatan-rba/KegiatanRBA.tsx`

**Query saat ini (baris 37):**
```typescript
queryFn: async () => {
  return await kegiatanRBAApi.getAll({
    tahun: selectedYear,
    programId: selectedProgram || undefined,
    search: searchQuery || undefined,
    isActive: true, // <- HARDCODED
  });
}
```

**Ubah menjadi:**
```typescript
const [showInactive, setShowInactive] = React.useState(false);

// Update query
queryFn: async () => {
  return await kegiatanRBAApi.getAll({
    tahun: selectedYear,
    programId: selectedProgram || undefined,
    search: searchQuery || undefined,
    isActive: showInactive ? undefined : true,
  });
}
```

**Tambah toggle UI** (di section filters)

#### ✅ Verifikasi Fase 2
- [ ] Dropdown tahun menampilkan data dari database
- [ ] Toggle inactive berfungsi
- [ ] Filter Program masih bekerja
- [ ] Search berfungsi
- [ ] CRUD operations normal

---

### FASE 3: Perbaikan Modul SubKegiatan RBA

#### 3.1 Tambah API untuk Tahun Tersedia
**File:** `backend/src/modules/subkegiatan-rba/subkegiatan-rba.service.ts`

**Tambah method:**
```typescript
async getAvailableYears(): Promise<number[]> {
  const result = await this.subKegiatanRbaRepository
    .createQueryBuilder('subkegiatan')
    .select('DISTINCT subkegiatan.tahun', 'tahun')
    .orderBy('subkegiatan.tahun', 'DESC')
    .getRawMany();

  return result.map(r => r.tahun);
}
```

**File:** `backend/src/modules/subkegiatan-rba/subkegiatan-rba.controller.ts`

**Tambah endpoint `@Get('years')`**

#### 3.2 Update Frontend
**File:** `frontend/src/features/subkegiatan-rba/SubKegiatanRBA.tsx`

**Tambah query tahun dan toggle inactive** (pola sama seperti Fase 1 & 2)

**Query saat ini (baris 46):**
```typescript
queryFn: () =>
  subKegiatanRBAApi.getAll({
    tahun: selectedYear,
    kegiatanId: selectedKegiatan || undefined,
    search: searchQuery || undefined,
  }),
```

**Tambah parameter `isActive` berdasarkan toggle**

#### 3.3 Fix Backend Default Filter
**File:** `backend/src/modules/subkegiatan-rba/subkegiatan-rba.service.ts`

**Saat ini (sekitar baris 50):**
```typescript
if (filter.isActive !== undefined) {
  where.isActive = filter.isActive;
} else {
  where.isActive = true; // default
}
```

**Ubah menjadi:**
```typescript
// Hanya set filter isActive jika explicitly provided
if (filter.isActive !== undefined) {
  where.isActive = filter.isActive;
}
```

#### ✅ Verifikasi Fase 3
- [ ] Dropdown tahun berfungsi
- [ ] Toggle inactive bekerja
- [ ] Filter Kegiatan bekerja
- [ ] Timeline display benar
- [ ] Kalkulasi pagu akurat

---

### FASE 4: Perbaikan Modul RAK (PALING KRITIS)

#### 4.1 Fix Controller Route Prefix (P1)
**File:** `backend/src/modules/rak/controllers/rak.controller.ts`

**Baris 31 - Ubah:**
```typescript
// SEBELUM (membuat route /api/v1/api/rak)
@Controller('api/rak')

// SESUDAH (membuat route /api/v1/rak)
@Controller('rak')
```

**Penjelasan:** Dengan global prefix NestJS `api/v1`, controller path cukup `'rak'` saja. Double prefix membuat route salah.

#### 4.2 Fix Serialization SubKegiatan (P0 - KRITIS)
**File:** `backend/src/modules/rak/services/rak.service.ts`

**Masalah:** TypeORM mengembalikan POJO, getter di entity tidak ter-serialize. Frontend mengharapkan `rak.subkegiatan.kode` tapi mendapat `undefined`.

**Solusi:** Transform data di service layer sebelum return

**Modifikasi method `findAll()` (setelah baris ~120):**
```typescript
const [data, total] = await qb
  .orderBy('rak.created_at', 'DESC')
  .skip((page - 1) * limit)
  .take(limit)
  .getManyAndCount();

// Transform subkegiatan fields untuk kompatibilitas frontend
const transformedData = data.map(rak => ({
  ...rak,
  subkegiatan: rak.subkegiatan ? {
    ...rak.subkegiatan,
    kode: rak.subkegiatan.kodeSubKegiatan,
    uraian: rak.subkegiatan.namaSubKegiatan,
    kegiatan_id: rak.subkegiatan.kegiatanId,
    program_id: rak.subkegiatan.kegiatan?.programId || '',
  } : null,
}));

return {
  data: transformedData,
  meta: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
};
```

**Juga modifikasi method `findOne()` (sekitar baris 130):**
```typescript
const rak = await this.rakRepo.findOne({
  where: { id },
  relations: ['subkegiatan', 'subkegiatan.kegiatan'],
});

if (!rak) {
  throw new NotFoundException('RAK tidak ditemukan');
}

// Transform untuk kompatibilitas frontend
return {
  ...rak,
  subkegiatan: rak.subkegiatan ? {
    ...rak.subkegiatan,
    kode: rak.subkegiatan.kodeSubKegiatan,
    uraian: rak.subkegiatan.namaSubKegiatan,
    kegiatan_id: rak.subkegiatan.kegiatanId,
    program_id: rak.subkegiatan.kegiatan?.programId || '',
  } : null,
};
```

**Terapkan juga ke `getDetails()` method** jika mengembalikan data subkegiatan.

#### 4.3 Tambah API untuk Tahun Tersedia
**File:** `backend/src/modules/rak/services/rak.service.ts`

**Tambah method:**
```typescript
async getAvailableYears(): Promise<number[]> {
  const result = await this.rakRepo
    .createQueryBuilder('rak')
    .select('DISTINCT rak.tahun_anggaran', 'tahun')
    .orderBy('rak.tahun_anggaran', 'DESC')
    .getRawMany();

  return result.map(r => r.tahun);
}
```

**File:** `backend/src/modules/rak/controllers/rak.controller.ts`

**Tambah endpoint:**
```typescript
@Get('years')
@ApiOperation({ summary: 'Get available years' })
async getAvailableYears() {
  return this.rakService.getAvailableYears();
}
```

#### 4.4 Update Frontend Year Selector
**File:** `frontend/src/features/rak/pages/RakList.tsx`

**Ganti number input dengan select dropdown (baris 89-94):**
```typescript
// SEBELUM
<Input
  type="number"
  placeholder="Tahun Anggaran"
  value={tahunAnggaran}
  onChange={(e) => setTahunAnggaran(Number(e.target.value))}
/>

// SESUDAH
const { data: availableYears } = useQuery({
  queryKey: ['rak-years'],
  queryFn: () => rakApi.getAvailableYears(),
});

<select
  value={tahunAnggaran}
  onChange={(e) => setTahunAnggaran(Number(e.target.value))}
  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
>
  {availableYears?.length ? (
    availableYears.map(year => (
      <option key={year} value={year}>{year}</option>
    ))
  ) : (
    <option value={tahunAnggaran}>{tahunAnggaran}</option>
  )}
</select>
```

**Set default ke tahun terbaru:**
```typescript
React.useEffect(() => {
  if (availableYears && availableYears.length > 0) {
    setTahunAnggaran(availableYears[0]); // Tahun terbaru
  }
}, [availableYears]);
```

**File:** `frontend/src/features/rak/services/rakApi.ts`

**Tambah fungsi:**
```typescript
export const getAvailableYears = async (): Promise<number[]> => {
  const response = await apiClient.get<number[]>('/api/rak/years');
  return response.data;
};
```

#### 4.5 Tambah Komentar di Entity
**File:** `backend/src/database/entities/subkegiatan-rba.entity.ts`

**Tambah catatan di atas getters (baris 93):**
```typescript
// === GETTERS FOR FRONTEND COMPATIBILITY ===
// CATATAN: Getter ini tidak serialize otomatis dengan TypeORM POJOs.
// Transformasi data dilakukan di RakService (rak.service.ts) sebelum return ke frontend.
// Getter tetap ada untuk type safety TypeScript dan penggunaan class instance.
```

#### ✅ Verifikasi Fase 4
- [ ] RAK list load dan menampilkan nama subkegiatan dengan benar
- [ ] Route adalah `/api/v1/rak` bukan `/api/v1/api/rak` (cek Network tab)
- [ ] Dropdown tahun menampilkan tahun yang ada data RAK
- [ ] RAK detail view menampilkan info subkegiatan benar
- [ ] Workflow create RAK berfungsi
- [ ] Workflow Submit/Approve/Reject bekerja
- [ ] Export ke PDF/Excel berfungsi

---

## 📊 Testing Strategy

### Manual Testing Checklist (Per Fase)

Untuk setiap modul setelah perbaikan:
- [ ] Halaman list load tanpa error di console
- [ ] Dropdown tahun terisi dari database
- [ ] Toggle inactive menampilkan/menyembunyikan record yang dihapus
- [ ] Buat record baru
- [ ] Edit record yang ada
- [ ] Hapus (soft delete) record
- [ ] Verifikasi record yang dihapus muncul dengan toggle inactive
- [ ] Fungsi search/filter bekerja
- [ ] Navigasi ke halaman detail bekerja

### Integration Testing

Setelah semua fase selesai:
- [ ] Full hierarchy flow: Buat Program → Kegiatan → SubKegiatan → RAK
- [ ] Filter tahun cascade dengan benar (ubah tahun menampilkan data terkait)
- [ ] Soft delete cascade dengan benar (hapus Program menampilkan Kegiatan inactive)
- [ ] Validasi budget masih bekerja (RAK pagu ≤ SubKegiatan pagu)

### Verifikasi Data di Database

Jalankan SQL query ini untuk verifikasi data ada:
```sql
-- Cek tahun yang ada data
SELECT DISTINCT tahun FROM program_rba ORDER BY tahun DESC;
SELECT DISTINCT tahun FROM kegiatan_rba ORDER BY tahun DESC;
SELECT DISTINCT tahun FROM subkegiatan_rba ORDER BY tahun DESC;
SELECT DISTINCT tahun_anggaran FROM rak_subkegiatan ORDER BY tahun_anggaran DESC;

-- Cek ada record yang inactive
SELECT COUNT(*) FROM program_rba WHERE "isActive" = false;
SELECT COUNT(*) FROM kegiatan_rba WHERE "isActive" = false;
SELECT COUNT(*) FROM subkegiatan_rba WHERE "isActive" = false;

-- Cek program dengan indikator null
SELECT COUNT(*) FROM program_rba WHERE "indikatorProgram" IS NULL;
```

---

## ⚠️ Risk Assessment

### High Risk
- **Fase 4.2 (RAK Serialization)**: Transformasi data core - harus ditest menyeluruh
  - *Mitigasi*: Tambah unit test untuk logic transformasi
  - *Rollback*: Revert service changes, update frontend pakai field name asli

### Medium Risk
- **Fase 4.1 (Route Change)**: Bisa break frontend jika URL di-cache
  - *Mitigasi*: Clear browser cache setelah deployment
  - *Rollback*: Revert controller change jika ada masalah

### Low Risk
- **Semua fix null safety**: Optional chaining backward compatible
- **Year selector changes**: Additive feature, tidak break existing
- **Toggle inactive**: Additive feature, default behavior tidak berubah

---

## 🚀 Strategi Deployment

### Opsi A: Phased Deployment (Direkomendasikan)
1. Deploy Fase 1 (Program) → Test di production
2. Deploy Fase 2 (Kegiatan) → Test
3. Deploy Fase 3 (SubKegiatan) → Test
4. Deploy Fase 4 (RAK) → Comprehensive testing

**Keuntungan**: Issue terisolasi per modul

### Opsi B: All-at-Once Deployment
Deploy semua fase sekaligus setelah testing menyeluruh di staging.

**Keuntungan**: Resolusi lebih cepat untuk user
**Kerugian**: Lebih susah isolasi issue jika ada yang break

**Rekomendasi**: Gunakan Opsi A untuk rollout yang lebih aman.

---

## 📝 File Kritis yang Perlu Dimodifikasi

### Backend
1. `backend/src/modules/rak/services/rak.service.ts` - **P0** fix serialization
2. `backend/src/modules/rak/controllers/rak.controller.ts:31` - **P1** fix route
3. `backend/src/modules/program-rba/program-rba.service.ts` - Tambah endpoint years
4. `backend/src/modules/program-rba/program-rba.controller.ts` - Tambah endpoint years
5. `backend/src/modules/kegiatan-rba/kegiatan-rba.service.ts` - Tambah endpoint years
6. `backend/src/modules/kegiatan-rba/kegiatan-rba.controller.ts` - Tambah endpoint years
7. `backend/src/modules/subkegiatan-rba/subkegiatan-rba.service.ts` - Tambah endpoint years + fix default filter
8. `backend/src/modules/subkegiatan-rba/subkegiatan-rba.controller.ts` - Tambah endpoint years

### Frontend
1. `frontend/src/features/program-rba/ProgramRBA.tsx:119` - **P1** fix null crash
2. `frontend/src/features/program-rba/ProgramRBA.tsx` - Year selector + toggle inactive
3. `frontend/src/features/program-rba/api.ts` - Tambah fungsi API
4. `frontend/src/features/kegiatan-rba/KegiatanRBA.tsx` - Year selector + toggle inactive
5. `frontend/src/features/kegiatan-rba/api.ts` - Update fungsi API
6. `frontend/src/features/subkegiatan-rba/SubKegiatanRBA.tsx` - Year selector + toggle inactive
7. `frontend/src/features/subkegiatan-rba/api.ts` - Update fungsi API
8. `frontend/src/features/rak/pages/RakList.tsx` - Year selector
9. `frontend/src/features/rak/services/rakApi.ts` - Tambah fungsi getAvailableYears

---

## ✅ Kriteria Sukses

Perbaikan dianggap selesai ketika:
- ✅ Semua 4 halaman modul load tanpa crash
- ✅ Data tampil dengan benar di semua tabel (tidak ada nama/kode kosong)
- ✅ Year selector menampilkan tahun dari database, bukan hardcoded
- ✅ User dapat melihat dan restore record yang soft-deleted via toggle
- ✅ Semua operasi CRUD bekerja di semua modul
- ✅ Full hierarchy creation bekerja: Program → Kegiatan → SubKegiatan → RAK
- ✅ Tidak ada console error di browser dev tools
- ✅ Backend logs tidak ada TypeORM warning atau error

---

## 📅 Estimasi Waktu

| Fase | Estimasi Waktu | Kompleksitas |
|------|----------------|--------------|
| Fase 1 (Program) | 2-3 jam | Medium |
| Fase 2 (Kegiatan) | 1-2 jam | Low (pola sama) |
| Fase 3 (SubKegiatan) | 1-2 jam | Low (pola sama) |
| Fase 4 (RAK) | 3-4 jam | High (kritis) |
| Testing & QA | 2-3 jam | - |
| **Total** | **9-14 jam** | **~2 hari kerja** |

---

**Dokumen Dibuat:** 2026-02-17
**Status:** Rencana Siap Dieksekusi
**Next Step:** Mulai implementasi dari Fase 1 (Program RBA)
