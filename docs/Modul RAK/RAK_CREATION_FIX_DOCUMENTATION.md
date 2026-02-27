# Dokumentasi Perbaikan Error 500 pada Pembuatan RAK

**Tanggal**: 17 Februari 2026
**Modul**: RAK (Rencana Anggaran Kas)
**Status**: Approved - Siap Implementasi
**Prioritas**: CRITICAL - Workflow Blocker

---

## 📋 Daftar Isi

1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Analisis Masalah](#analisis-masalah)
3. [Root Cause Analysis](#root-cause-analysis)
4. [Solusi Teknis](#solusi-teknis)
5. [Detail Implementasi](#detail-implementasi)
6. [Strategi Testing](#strategi-testing)
7. [Rollback Plan](#rollback-plan)
8. [Timeline & Resources](#timeline--resources)

---

## 🎯 Ringkasan Eksekutif

### Masalah
User tidak dapat membuat RAK baru karena mendapat error **500 Internal Server Error** saat mengklik tombol "Buat RAK Baru".

### Error Detail
```
Status: 500 Internal Server Error
Method: GET
URL: http://192.168.11.30/api/v1/rak/create
Response: {"statusCode":500,"message":"Internal server error"}
```

### Dampak
- ❌ User tidak dapat membuat RAK sama sekali
- ❌ Workflow perencanaan anggaran terhenti
- ❌ Critical blocker untuk modul RAK

### Solusi Singkat
1. Tambahkan route `/rak/create` di frontend router
2. Buat halaman form `RakCreate.tsx`
3. Perbaiki definisi entity untuk generated columns

### Timeline Estimasi
- **Implementasi**: 2-3 jam
- **Testing**: 1 jam
- **Total**: 3-4 jam

---

## 🔍 Analisis Masalah

### Gejala yang Terlihat

1. **User Action**: Klik tombol "Buat RAK Baru" di halaman list RAK
2. **Expected Behavior**: Muncul form untuk membuat RAK baru
3. **Actual Behavior**: Error 500 Internal Server Error
4. **Error Endpoint**: `GET /api/v1/rak/create`

### Penelusuran Awal

#### Frontend Flow (Yang Terjadi Sekarang)
```
User klik "Buat RAK Baru"
  ↓
navigate('/rak/create')
  ↓
React Router mencari route yang cocok
  ↓
Tidak ada route 'rak/create'
  ↓
Router match ke route 'rak/:id' dengan id="create"
  ↓
RakDetail component load
  ↓
useRak("create") dipanggil
  ↓
GET /api/v1/rak/create
  ↓
Backend coba query database dengan UUID "create"
  ↓
PostgreSQL error: invalid UUID
  ↓
500 Internal Server Error
```

#### Backend Endpoint yang Ada
```typescript
// Yang tersedia:
POST /api/v1/rak              // Buat RAK baru
POST /api/v1/rak/create       // Alias untuk buat RAK baru
GET  /api/v1/rak/:id          // Get RAK by ID

// Yang dipanggil (salah):
GET  /api/v1/rak/create       // Diperlakukan sebagai GET by ID
```

---

## 🔬 Root Cause Analysis

### Masalah 1: Missing Route di Frontend (PRIMARY)

**File**: `/opt/sikancil/frontend/src/routes/index.tsx`

**Kondisi Saat Ini**:
```typescript
// Hanya ada 2 route untuk RAK:
{
  path: 'rak',
  element: <RakList />  // ✅ Ada
},
{
  path: 'rak/:id',
  element: <RakDetail />  // ✅ Ada
}
// ❌ TIDAK ADA route 'rak/create'
```

**Analisis**:
- Tombol "Buat RAK Baru" di `RakList.tsx` line 89-92 memanggil `navigate('/rak/create')`
- React Router matching route secara berurutan
- Route `/rak/create` tidak ditemukan
- Router match ke pattern `/rak/:id` dengan `id = "create"`
- `RakDetail` page load dan coba fetch RAK dengan ID "create"

**Impact**: 500 error karena "create" bukan UUID yang valid

### Masalah 2: Entity Definition Mismatch (SECONDARY)

**File**: `/opt/sikancil/backend/src/modules/rak/entities/rak-detail.entity.ts`

**Kondisi Database** (dari migration):
```sql
CREATE TABLE rak_detail (
  -- ... kolom lain
  semester_1 DECIMAL(15,2) GENERATED ALWAYS AS
    (januari + februari + maret + april + mei + juni) STORED,
  semester_2 DECIMAL(15,2) GENERATED ALWAYS AS
    (juli + agustus + september + oktober + november + desember) STORED,
  triwulan_1 DECIMAL(15,2) GENERATED ALWAYS AS
    (januari + februari + maret) STORED,
  -- ... triwulan_2, triwulan_3, triwulan_4
);
```

**Kondisi Entity** (lines 65-82):
```typescript
// ❌ SALAH: Didefinisikan sebagai kolom biasa
@Column('decimal', { precision: 15, scale: 2, select: false })
semester_1: number;

@Column('decimal', { precision: 15, scale: 2, select: false })
semester_2: number;
// ... dll
```

**Analisis**:
- Database: Kolom `GENERATED ALWAYS AS ... STORED` (auto-calculated, read-only)
- TypeORM: Kolom biasa dengan hanya `select: false`
- Saat INSERT, TypeORM akan coba menulis nilai ke kolom generated
- PostgreSQL akan reject: `cannot insert into column "semester_1"`
- Error 500 saat create RAK

**Impact**: Setelah route fix, pembuatan RAK akan tetap error 500

### Diagram Alur Masalah

```
┌─────────────────────────────────────────────────────────────┐
│ USER: Klik "Buat RAK Baru"                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND: navigate('/rak/create')                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ ROUTER: Cari route 'rak/create'                             │
│ ❌ Tidak ketemu                                              │
│ ✓ Match ke 'rak/:id' dengan id="create"                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ COMPONENT: RakDetail load dengan id="create"                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ API CALL: GET /api/v1/rak/create                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND: findOne({ id: "create" })                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ DATABASE: WHERE id = 'create'                               │
│ ❌ ERROR: invalid input syntax for type uuid                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ RESPONSE: 500 Internal Server Error                         │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Solusi Teknis

### Arsitektur Solusi

```
┌────────────────────────────────────────────────────────────┐
│ SOLUSI 1: Tambah Route & Form Page (Frontend)              │
├────────────────────────────────────────────────────────────┤
│ • Tambah route 'rak/create' SEBELUM 'rak/:id'              │
│ • Buat component RakCreate.tsx                             │
│ • Form minimal: subkegiatan_id + tahun_anggaran            │
│ • Backend auto-populate detail dari AnggaranBelanjaRBA    │
└────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────┐
│ SOLUSI 2: Fix Entity Definition (Backend)                  │
├────────────────────────────────────────────────────────────┤
│ • Tambah insert: false, update: false                      │
│ • Untuk 6 generated columns                                │
│ • Cegah TypeORM insert ke kolom GENERATED                  │
└────────────────────────────────────────────────────────────┘
```

### Prinsip Desain

1. **Minimal Input, Maximum Automation**
   - Form hanya 2 field (sesuai backend DTO)
   - Backend auto-populate semua detail
   - Kurangi human error

2. **Reuse Existing Code**
   - `useCreateRak()` mutation hook sudah ada
   - `rakApi.create()` service sudah ada
   - Backend service sudah implement auto-population
   - UI components sudah tersedia

3. **Type Safety**
   - Buat `CreateRakRequest` interface sesuai backend DTO
   - Hindari mismatch frontend/backend types

4. **Route Order Best Practice**
   - Static routes sebelum dynamic routes
   - Cegah ambiguitas route matching

---

## 🛠 Detail Implementasi

### BAGIAN 1: Fix Backend Entity

**Tujuan**: Cegah error INSERT pada generated columns

**File**: `/opt/sikancil/backend/src/modules/rak/entities/rak-detail.entity.ts`

**Perubahan**: Lines 65-82

#### Before (SALAH ❌)
```typescript
// Generated columns (calculated by DB)
@Column('decimal', { precision: 15, scale: 2, select: false })
semester_1: number;

@Column('decimal', { precision: 15, scale: 2, select: false })
semester_2: number;

@Column('decimal', { precision: 15, scale: 2, select: false })
triwulan_1: number;

@Column('decimal', { precision: 15, scale: 2, select: false })
triwulan_2: number;

@Column('decimal', { precision: 15, scale: 2, select: false })
triwulan_3: number;

@Column('decimal', { precision: 15, scale: 2, select: false })
triwulan_4: number;
```

#### After (BENAR ✅)
```typescript
// Generated columns (calculated by DB)
@Column('decimal', {
  precision: 15,
  scale: 2,
  select: false,   // Jangan select otomatis
  insert: false,   // ✨ TAMBAHAN: Jangan insert
  update: false    // ✨ TAMBAHAN: Jangan update
})
semester_1: number;

@Column('decimal', {
  precision: 15,
  scale: 2,
  select: false,
  insert: false,
  update: false
})
semester_2: number;

@Column('decimal', {
  precision: 15,
  scale: 2,
  select: false,
  insert: false,
  update: false
})
triwulan_1: number;

@Column('decimal', {
  precision: 15,
  scale: 2,
  select: false,
  insert: false,
  update: false
})
triwulan_2: number;

@Column('decimal', {
  precision: 15,
  scale: 2,
  select: false,
  insert: false,
  update: false
})
triwulan_3: number;

@Column('decimal', {
  precision: 15,
  scale: 2,
  select: false,
  insert: false,
  update: false
})
triwulan_4: number;
```

#### Penjelasan
- `select: false`: Jangan include di SELECT query
- `insert: false`: ⭐ **CRITICAL** - Jangan include di INSERT query
- `update: false`: ⭐ **CRITICAL** - Jangan include di UPDATE query

#### Mengapa Perlu?
```sql
-- Database schema:
semester_1 DECIMAL(15,2) GENERATED ALWAYS AS (...) STORED

-- Tanpa insert:false, TypeORM akan generate:
INSERT INTO rak_detail (..., semester_1, ...) VALUES (..., 600000, ...)
-- ❌ PostgreSQL error: cannot insert into generated column

-- Dengan insert:false, TypeORM akan generate:
INSERT INTO rak_detail (..., januari, februari, ...) VALUES (...)
-- ✅ PostgreSQL auto-calculate semester_1 dari januari-juni
```

---

### BAGIAN 2: Buat Form Component

**Tujuan**: Halaman form untuk input data RAK baru

**File**: `/opt/sikancil/frontend/src/features/rak/pages/RakCreate.tsx` *(FILE BARU)*

**Template Lengkap**:

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SimpleSelect } from '@/components/ui/SimpleSelect';
import { useCreateRak } from '../hooks/useRakMutation';
import { subKegiatanRBAApi } from '@/features/subkegiatan-rba/api';
import { AlertCircle } from 'lucide-react';

export function RakCreate() {
  const navigate = useNavigate();
  const createRak = useCreateRak();

  // State
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    subkegiatan_id: '',
    tahun_anggaran: currentYear,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch Subkegiatan list
  const {
    data: subkegiatanList,
    isLoading: isLoadingSubkegiatan,
    error: subkegiatanError,
  } = useQuery({
    queryKey: ['subkegiatan-rba', formData.tahun_anggaran],
    queryFn: async () => {
      const response = await subKegiatanRBAApi.getAll({
        tahun: formData.tahun_anggaran,
        limit: 1000, // Get all for dropdown
      });
      return response.data || response; // Handle berbeda response structure
    },
  });

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subkegiatan_id) {
      newErrors.subkegiatan_id = 'Subkegiatan wajib dipilih';
    }

    if (!formData.tahun_anggaran) {
      newErrors.tahun_anggaran = 'Tahun anggaran wajib diisi';
    } else if (formData.tahun_anggaran < 2020) {
      newErrors.tahun_anggaran = 'Tahun anggaran minimal 2020';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createRak.mutateAsync({
        subkegiatan_id: formData.subkegiatan_id,
        tahun_anggaran: formData.tahun_anggaran,
      });
      // Navigation handled by useCreateRak onSuccess
    } catch (error: any) {
      // Error toast handled by useCreateRak onError
      console.error('Error creating RAK:', error);
    }
  };

  // Year change handler
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      tahun_anggaran: year,
      subkegiatan_id: '', // Reset subkegiatan saat tahun berubah
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Buat RAK Baru</h1>
        <p className="text-gray-600 mt-2">
          Rencana Anggaran Kas (RAK) akan otomatis dibuat dari data Anggaran
          Belanja RBA
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Tahun Anggaran Field */}
        <div>
          <label
            htmlFor="tahun_anggaran"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Tahun Anggaran <span className="text-red-500">*</span>
          </label>
          <Input
            id="tahun_anggaran"
            type="number"
            min="2020"
            max="2099"
            value={formData.tahun_anggaran}
            onChange={handleYearChange}
            className={errors.tahun_anggaran ? 'border-red-500' : ''}
            placeholder="Contoh: 2026"
          />
          {errors.tahun_anggaran && (
            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.tahun_anggaran}
            </p>
          )}
        </div>

        {/* Subkegiatan Dropdown */}
        <div>
          <label
            htmlFor="subkegiatan_id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Subkegiatan <span className="text-red-500">*</span>
          </label>

          {isLoadingSubkegiatan ? (
            <div className="text-sm text-gray-500">Memuat daftar subkegiatan...</div>
          ) : subkegiatanError ? (
            <div className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Gagal memuat subkegiatan
            </div>
          ) : (
            <>
              <SimpleSelect
                id="subkegiatan_id"
                value={formData.subkegiatan_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subkegiatan_id: value }))
                }
                disabled={isLoadingSubkegiatan}
                className={errors.subkegiatan_id ? 'border-red-500' : ''}
              >
                <option value="">-- Pilih Subkegiatan --</option>
                {subkegiatanList?.map((sk: any) => (
                  <option key={sk.id} value={sk.id}>
                    {sk.kodeSubKegiatan} - {sk.namaSubKegiatan}
                    {sk.totalPagu > 0
                      ? ` (Pagu: Rp ${sk.totalPagu.toLocaleString('id-ID')})`
                      : ' (Belum ada pagu)'}
                  </option>
                ))}
              </SimpleSelect>

              {errors.subkegiatan_id && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.subkegiatan_id}
                </p>
              )}

              {subkegiatanList?.length === 0 && (
                <p className="text-sm text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Tidak ada subkegiatan untuk tahun {formData.tahun_anggaran}
                </p>
              )}
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ℹ️ Informasi Auto-Population
          </h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>RAK akan dibuat dengan status <strong>DRAFT</strong></li>
            <li>Total pagu otomatis diambil dari data Subkegiatan</li>
            <li>
              Detail RAK otomatis dibuat dari data Anggaran Belanja RBA (kode
              rekening dan breakdown bulanan)
            </li>
            <li>
              Kolom semester dan triwulan otomatis dihitung oleh sistem
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/rak')}
            disabled={createRak.isPending}
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={createRak.isPending || isLoadingSubkegiatan}
          >
            {createRak.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Membuat RAK...
              </>
            ) : (
              'Buat RAK'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

#### Fitur Component

1. **Auto-reload Subkegiatan saat tahun berubah**
   ```typescript
   const { data: subkegiatanList } = useQuery({
     queryKey: ['subkegiatan-rba', formData.tahun_anggaran],
     // ⬆ Dependency pada tahun_anggaran
   });
   ```

2. **Validation Inline**
   - Required field validation
   - Min year validation
   - Error display di bawah field

3. **Loading States**
   - Loading saat fetch Subkegiatan
   - Loading saat submit form
   - Disable button saat loading

4. **Error Handling**
   - Error fetch Subkegiatan
   - Error submit (handled by mutation hook)
   - Empty state saat tidak ada data

5. **UX Enhancements**
   - Show pagu di dropdown
   - Warning saat tidak ada subkegiatan
   - Info box jelaskan auto-population
   - Reset subkegiatan saat tahun berubah

---

### BAGIAN 3: Update Router

**Tujuan**: Tambah route `/rak/create` sebelum `/rak/:id`

**File**: `/opt/sikancil/frontend/src/routes/index.tsx`

#### Step 3.1: Tambah Import

**Lokasi**: Setelah line 17 (setelah import RakDetail)

```typescript
const RakCreate = React.lazy(() =>
  import('@/features/rak/pages/RakCreate').then((m) => ({ default: m.RakCreate }))
);
```

#### Step 3.2: Tambah Route

**Lokasi**: Di dalam children array, SEBELUM route `rak/:id`

**⚠️ PENTING: Urutan route HARUS seperti ini**

```typescript
// RAK Routes
{
  path: 'rak',
  element: (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RakList />
    </React.Suspense>
  ),
},
{
  path: 'rak/create',  // ✨ ROUTE BARU - HARUS SEBELUM rak/:id
  element: (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RakCreate />
    </React.Suspense>
  ),
},
{
  path: 'rak/:id',  // Route dynamic HARUS setelah route static
  element: (
    <React.Suspense fallback={<div>Loading...</div>}>
      <RakDetail />
    </React.Suspense>
  ),
},
```

#### Mengapa Urutan Penting?

```
❌ SALAH - Dynamic route sebelum static:
  /rak/:id       → Match '/rak/create' dengan id="create"
  /rak/create    → Tidak pernah tercapai

✅ BENAR - Static route sebelum dynamic:
  /rak/create    → Match exact '/rak/create'
  /rak/:id       → Match '/rak/{uuid}'
```

---

### BAGIAN 4: Update Types (Optional)

**Tujuan**: Type safety untuk payload create RAK

**File**: `/opt/sikancil/frontend/src/features/rak/types/rak.types.ts`

#### Tambah Interface Baru

**Lokasi**: Setelah `CreateRakPayload` (sekitar line 85)

```typescript
/**
 * Request payload untuk create RAK
 * Hanya 2 field yang dibutuhkan - backend auto-populate sisanya
 */
export interface CreateRakRequest {
  /** UUID Subkegiatan yang akan dibuatkan RAK */
  subkegiatan_id: string;

  /** Tahun anggaran (contoh: 2026) */
  tahun_anggaran: number;
}
```

#### Update Mutation Hook (Optional)

**File**: `/opt/sikancil/frontend/src/features/rak/hooks/useRakMutation.ts`

**Perubahan**: Line 23

```typescript
// Before
export function useCreateRak() {
  return useMutation({
    mutationFn: (payload: CreateRakPayload) => rakApi.create(payload),
    // ...
  });
}

// After
export function useCreateRak() {
  return useMutation({
    mutationFn: (payload: CreateRakRequest) => rakApi.create(payload),
    // ...
  });
}
```

---

### BAGIAN 5: Export Component

**Tujuan**: Expose component untuk import di router

**File**: `/opt/sikancil/frontend/src/features/rak/index.ts`

#### Tambah Export

```typescript
export { RakList } from './pages/RakList';
export { RakDetail } from './pages/RakDetail';
export { RakCreate } from './pages/RakCreate'; // ✨ TAMBAHAN
export { RakStatusBadge } from './components/RakDetail/RakStatusBadge';
export { RakMatrixInput } from './components/RakMatrix/RakMatrixInput';
```

---

## 🧪 Strategi Testing

### 1. Unit Testing (Backend)

#### Test Entity Configuration

**File**: `/opt/sikancil/backend/src/modules/rak/entities/rak-detail.entity.spec.ts` *(BARU)*

```typescript
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RakDetail } from './rak-detail.entity';

describe('RakDetail Entity - Generated Columns', () => {
  let rakDetailRepo: Repository<RakDetail>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(RakDetail),
          useClass: Repository,
        },
      ],
    }).compile();

    rakDetailRepo = module.get(getRepositoryToken(RakDetail));
  });

  it('should not include generated columns in INSERT query', async () => {
    const detail = rakDetailRepo.create({
      rak_subkegiatan_id: 'uuid-rak',
      kode_rekening_id: 'uuid-coa',
      jumlah_anggaran: 1200000,
      januari: 100000,
      februari: 100000,
      maret: 100000,
      april: 100000,
      mei: 100000,
      juni: 100000,
      juli: 100000,
      agustus: 100000,
      september: 100000,
      oktober: 100000,
      november: 100000,
      desember: 100000,
      // NOTE: semester_1, triwulan_1, dll TIDAK di-set
    });

    // Verify TypeORM metadata excludes generated columns from insert
    const metadata = rakDetailRepo.metadata;
    const insertColumns = metadata.columns.filter((col) => col.isInsert);
    const generatedCols = ['semester_1', 'semester_2', 'triwulan_1', 'triwulan_2', 'triwulan_3', 'triwulan_4'];

    generatedCols.forEach((colName) => {
      const isIncluded = insertColumns.some((col) => col.propertyName === colName);
      expect(isIncluded).toBe(false); // Harus FALSE
    });
  });
});
```

#### Test RAK Creation Service

```typescript
describe('RakService - Create RAK', () => {
  it('should create RAK with auto-populated details', async () => {
    // Setup mock Subkegiatan dengan AnggaranBelanja
    const mockSubkegiatan = {
      id: 'uuid-subkegiatan',
      totalPagu: 10000000,
      anggaranBelanja: [
        {
          kodeRekening: '5.1.01',
          januari: 100000,
          februari: 100000,
          // ... bulan lainnya
        },
      ],
    };

    // Create RAK
    const result = await rakService.create(
      {
        subkegiatan_id: 'uuid-subkegiatan',
        tahun_anggaran: 2026,
      },
      'user-id'
    );

    // Assertions
    expect(result.id).toBeDefined();
    expect(result.status).toBe('DRAFT');
    expect(result.total_pagu).toBe(10000000);
    expect(result.details).toHaveLength(1);
    expect(result.details[0].januari).toBe(100000);
    // Generated columns tidak perlu di-check (auto by DB)
  });

  it('should throw ConflictException if RAK already exists', async () => {
    // Test duplicate creation
    await expect(
      rakService.create(
        {
          subkegiatan_id: 'existing-id',
          tahun_anggaran: 2026,
        },
        'user-id'
      )
    ).rejects.toThrow(ConflictException);
  });

  it('should throw BadRequestException if no anggaran belanja', async () => {
    // Test Subkegiatan tanpa anggaran
    await expect(
      rakService.create(
        {
          subkegiatan_id: 'no-anggaran-id',
          tahun_anggaran: 2026,
        },
        'user-id'
      )
    ).rejects.toThrow(BadRequestException);
  });
});
```

---

### 2. Integration Testing (E2E)

#### Test Navigation & Form

**File**: `/opt/sikancil/frontend/src/features/rak/__tests__/RakCreate.e2e.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { RakCreate } from '../pages/RakCreate';

describe('RAK Creation E2E', () => {
  const queryClient = new QueryClient();

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  it('should render form successfully', () => {
    render(<RakCreate />, { wrapper });

    expect(screen.getByText('Buat RAK Baru')).toBeInTheDocument();
    expect(screen.getByLabelText(/Tahun Anggaran/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Subkegiatan/)).toBeInTheDocument();
  });

  it('should show validation errors on empty submit', async () => {
    render(<RakCreate />, { wrapper });

    const submitButton = screen.getByText('Buat RAK');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Subkegiatan wajib dipilih/)).toBeInTheDocument();
    });
  });

  it('should submit form successfully', async () => {
    // Mock API
    jest.mock('../services/rakApi', () => ({
      rakApi: {
        create: jest.fn().mockResolvedValue({ id: 'new-rak-id' }),
      },
    }));

    render(<RakCreate />, { wrapper });

    // Fill form
    const yearInput = screen.getByLabelText(/Tahun Anggaran/);
    fireEvent.change(yearInput, { target: { value: '2026' } });

    const subkegiatanSelect = screen.getByLabelText(/Subkegiatan/);
    fireEvent.change(subkegiatanSelect, { target: { value: 'uuid-subkegiatan' } });

    // Submit
    const submitButton = screen.getByText('Buat RAK');
    fireEvent.click(submitButton);

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByText(/Membuat RAK/)).toBeInTheDocument();
    });
  });
});
```

---

### 3. Manual Testing Checklist

#### ✅ Test Case 1: Happy Path - Buat RAK Baru

**Langkah**:
1. Login ke aplikasi
2. Navigate ke menu RAK
3. Klik tombol "Buat RAK Baru"
4. **Verify**: Halaman form muncul (BUKAN error 500)
5. **Verify**: URL = `/rak/create`
6. Pilih tahun anggaran: 2026
7. **Verify**: Dropdown Subkegiatan ter-load
8. Pilih Subkegiatan dengan pagu > 0
9. Klik "Buat RAK"
10. **Verify**: Loading state muncul
11. **Verify**: Redirect ke `/rak/{id}` (halaman detail)
12. **Verify**: RAK ter-create dengan:
    - Status: DRAFT
    - Total pagu sesuai Subkegiatan
    - Ada detail RAK (dari AnggaranBelanjaRBA)
    - Kolom semester & triwulan ter-isi otomatis

**Expected Result**: ✅ RAK ter-create tanpa error

---

#### ✅ Test Case 2: Error Handling - Duplicate RAK

**Langkah**:
1. Pilih Subkegiatan yang SUDAH punya RAK untuk tahun tertentu
2. Submit form
3. **Verify**: Error message muncul
4. **Verify**: Message = "RAK untuk subkegiatan dan tahun ini sudah ada"
5. **Verify**: Status code = 409 Conflict

**Expected Result**: ✅ Error ditampilkan dengan jelas

---

#### ✅ Test Case 3: Error Handling - No Anggaran Belanja

**Langkah**:
1. Pilih Subkegiatan yang belum punya data AnggaranBelanjaRBA
2. Submit form
3. **Verify**: Error message muncul
4. **Verify**: Message = "Subkegiatan tidak memiliki data anggaran belanja"
5. **Verify**: Status code = 400 Bad Request

**Expected Result**: ✅ Error ditampilkan dengan jelas

---

#### ✅ Test Case 4: Database - Verify Generated Columns

**Langkah**:
1. Buat RAK baru via form
2. Connect ke PostgreSQL
3. Run query:
   ```sql
   SELECT
     id,
     kode_rekening_id,
     januari, februari, maret, april, mei, juni,
     juli, agustus, september, oktober, november, desember,
     jumlah_anggaran,
     semester_1,  -- Harus = jan + feb + mar + apr + may + jun
     semester_2,  -- Harus = jul + aug + sep + oct + nov + dec
     triwulan_1,  -- Harus = jan + feb + mar
     triwulan_2,  -- Harus = apr + may + jun
     triwulan_3,  -- Harus = jul + aug + sep
     triwulan_4   -- Harus = oct + nov + dec
   FROM rak_detail
   WHERE rak_subkegiatan_id = 'id-rak-yang-baru-dibuat'
   ORDER BY created_at DESC;
   ```
4. **Verify**: Semua kolom generated ter-isi dengan nilai yang benar

**Expected Result**: ✅ Generated columns auto-calculated correctly

---

#### ✅ Test Case 5: Route Matching

**Langkah**:
1. Navigate ke `/rak/create`
2. **Verify**: RakCreate form muncul (BUKAN RakDetail)
3. Navigate ke `/rak/{valid-uuid}`
4. **Verify**: RakDetail muncul (BUKAN RakCreate)
5. Navigate ke `/rak/invalid-string`
6. **Verify**: Error 404 atau error message appropriate

**Expected Result**: ✅ Routes match correctly

---

### 4. Performance Testing

#### Load Test - Subkegiatan Dropdown

**Scenario**: 1000+ Subkegiatan di database

**Test**:
```typescript
// Measure dropdown render time
console.time('Dropdown Render');
render(<RakCreate />);
await waitFor(() => screen.getByLabelText(/Subkegiatan/));
console.timeEnd('Dropdown Render');

// Expected: < 2 seconds
```

**Mitigation jika lambat**:
- Implement pagination di dropdown
- Add search/filter input
- Use virtualized list (react-window)

---

### 5. Accessibility Testing

**Checklist**:
- ✅ Form fields punya label yang jelas
- ✅ Error messages associated dengan field (aria-describedby)
- ✅ Keyboard navigation works
- ✅ Screen reader dapat baca form
- ✅ Focus management correct

**Test Tool**: axe DevTools

---

## 🔄 Rollback Plan

### Jika Terjadi Masalah Setelah Deploy

#### Rollback Step 1: Revert Backend Entity

```bash
cd /opt/sikancil/backend
git revert <commit-hash-entity-fix>
# Atau manual edit, hapus insert:false dan update:false
npm run build
pm2 restart sikancil-backend
```

#### Rollback Step 2: Revert Frontend Route

```bash
cd /opt/sikancil/frontend
# Hapus route 'rak/create' dari routes/index.tsx
# Hapus import RakCreate
npm run build
# Deploy build baru
```

#### Rollback Step 3: Hapus File RakCreate.tsx

```bash
rm /opt/sikancil/frontend/src/features/rak/pages/RakCreate.tsx
```

#### Rollback Step 4: Revert Types

```bash
# Revert CreateRakRequest addition di rak.types.ts
git revert <commit-hash-types>
```

### Database Rollback

**TIDAK DIPERLUKAN** - Tidak ada perubahan schema/migration

---

## ⏱ Timeline & Resources

### Estimasi Waktu

| Task | Estimasi | PIC |
|------|----------|-----|
| **Backend**: Fix entity | 30 menit | Backend Developer |
| **Frontend**: Buat RakCreate.tsx | 2 jam | Frontend Developer |
| **Frontend**: Update router | 15 menit | Frontend Developer |
| **Frontend**: Update types | 15 menit | Frontend Developer |
| **Testing**: Unit tests | 1 jam | QA / Developer |
| **Testing**: Manual E2E | 1 jam | QA |
| **Review**: Code review | 30 menit | Tech Lead |
| **Deploy**: Build & deploy | 30 menit | DevOps |
| **Total** | **5.5 - 6 jam** | |

### Dependencies

**Backend**:
- ✅ TypeORM (sudah terinstall)
- ✅ NestJS (sudah terinstall)
- ✅ PostgreSQL (sudah running)

**Frontend**:
- ✅ React Router DOM (sudah terinstall)
- ✅ TanStack Query (sudah terinstall)
- ✅ UI Components (sudah ada)

**Tidak ada dependency baru yang perlu diinstall**

---

## 📊 Success Metrics

### Kriteria Sukses

1. **Functional**
   - ✅ User dapat navigate ke `/rak/create` tanpa error
   - ✅ Form load successfully
   - ✅ User dapat create RAK baru
   - ✅ RAK ter-create dengan status DRAFT
   - ✅ Detail RAK auto-populated dari AnggaranBelanjaRBA
   - ✅ Generated columns auto-calculated

2. **Technical**
   - ✅ No 500 errors di console
   - ✅ No TypeORM insert errors
   - ✅ Database constraints satisfied
   - ✅ Route matching correct

3. **User Experience**
   - ✅ Form validation jelas
   - ✅ Error messages user-friendly
   - ✅ Loading states appropriate
   - ✅ Success feedback jelas

### Monitoring Post-Deploy

**Metrik yang di-monitor**:
- Error rate untuk endpoint `POST /api/v1/rak`
- Success rate pembuatan RAK
- Response time form submission
- User feedback via support tickets

**Tools**:
- Backend logs (`pm2 logs`)
- PostgreSQL logs
- Sentry/error tracking (jika ada)

---

## 📝 Catatan Tambahan

### Business Rules yang Diikuti

**BR-001: RAK Auto-Population**
- RAK detail HARUS dibuat dari data AnggaranBelanjaRBA
- Total pagu HARUS sesuai dengan Subkegiatan.totalPagu
- Breakdown bulanan diambil dari AnggaranBelanjaRBA

**BR-002: RAK Status Workflow**
- RAK baru dibuat dengan status DRAFT
- User dapat edit sebelum submit
- Setelah submit, status berubah ke SUBMITTED

### Database Constraints yang Dipenuhi

1. **rak_detail_unique**: `(rak_subkegiatan_id, kode_rekening_id)` UNIQUE
   - Satu kode rekening hanya muncul 1x per RAK

2. **rak_detail_balance_check**: `jumlah_anggaran ≈ sum(jan..dec)`
   - Total harus sama dengan sum bulanan (toleransi 0.01)

3. **Generated Columns**: Auto-calculated, tidak boleh di-insert manual
   - `semester_1 = jan + feb + mar + apr + may + jun`
   - `semester_2 = jul + aug + sep + oct + nov + dec`
   - `triwulan_1 = jan + feb + mar`
   - `triwulan_2 = apr + may + jun`
   - `triwulan_3 = jul + aug + sep`
   - `triwulan_4 = oct + nov + dec`

### Security Considerations

1. **Authentication**: JWT token required untuk endpoint create RAK
2. **Authorization**: User harus punya permission create RAK
3. **Input Validation**: Backend validate `subkegiatan_id` (UUID) dan `tahun_anggaran` (integer)
4. **SQL Injection**: Protected by TypeORM parameterized queries

### Future Improvements (Out of Scope)

1. **Bulk Create**: Buat RAK untuk multiple Subkegiatan sekaligus
2. **RAK Template**: Copy RAK dari tahun sebelumnya
3. **Preview**: Show preview sebelum create
4. **Validation**: Frontend pre-check apakah Subkegiatan punya anggaran
5. **Search**: Search/filter di Subkegiatan dropdown
6. **Notification**: Email notification saat RAK dibuat

---

## 🎓 Lessons Learned

### Mengapa Masalah Ini Terjadi?

1. **Incomplete Implementation**
   - Backend service sudah siap
   - Mutation hook sudah siap
   - Tapi form page & route tidak dibuat

2. **Route Design Oversight**
   - Dynamic route (`:id`) didefinisikan tanpa static alternative
   - Tidak anticipate `/create` sebagai reserved keyword

3. **Entity-Schema Mismatch**
   - Migration dibuat dengan generated columns
   - Entity tidak disesuaikan
   - Tidak ada validation bahwa entity match dengan schema

### Preventive Measures

**Untuk Masa Depan**:

1. **Feature Checklist**
   ```
   ✅ Backend endpoint
   ✅ Backend service
   ✅ Frontend API service
   ✅ Frontend mutation hook
   ✅ Frontend form component  ← MISSING di case ini
   ✅ Router configuration     ← MISSING di case ini
   ✅ E2E testing
   ```

2. **Route Planning**
   - Definisikan semua routes di awal
   - Static routes sebelum dynamic
   - Document route hierarchy

3. **Entity-Migration Sync**
   - Setelah migration, update entity
   - Add test untuk verify entity metadata
   - Use `synchronize: true` di development untuk catch mismatch

4. **Integration Testing**
   - Test full user flow, bukan hanya unit test
   - Include navigation testing
   - Test error scenarios

---

## 📞 Support & Contact

**Jika ada pertanyaan atau issue saat implementasi**:

- Technical Lead: [Nama]
- Backend Developer: [Nama]
- Frontend Developer: [Nama]
- QA Lead: [Nama]

**Documentation**:
- API Docs: `http://localhost:3000/api-docs`
- Code Repository: [URL]
- Issue Tracker: [URL]

---

## ✅ Implementation Checklist

**Backend**:
- [ ] Edit `rak-detail.entity.ts` - tambah `insert: false, update: false`
- [ ] Build backend: `npm run build`
- [ ] Restart backend: `pm2 restart sikancil-backend`
- [ ] Test dengan curl: `POST /api/v1/rak`

**Frontend**:
- [ ] Buat file `RakCreate.tsx`
- [ ] Update `routes/index.tsx` - tambah import
- [ ] Update `routes/index.tsx` - tambah route
- [ ] Update `rak.types.ts` - tambah `CreateRakRequest`
- [ ] Update `index.ts` - export `RakCreate`
- [ ] Build frontend: `npm run build`
- [ ] Deploy frontend

**Testing**:
- [ ] Manual test: Navigate ke `/rak/create`
- [ ] Manual test: Submit form dengan valid data
- [ ] Manual test: Test error scenarios
- [ ] Database check: Verify generated columns
- [ ] E2E test: Full user flow
- [ ] Performance test: Dropdown dengan banyak data

**Deployment**:
- [ ] Commit changes dengan message jelas
- [ ] Push ke repository
- [ ] Create PR / MR
- [ ] Code review
- [ ] Merge ke main branch
- [ ] Deploy ke staging
- [ ] Test di staging
- [ ] Deploy ke production
- [ ] Monitor logs & errors

---

**Dokumentasi dibuat**: 17 Februari 2026
**Versi**: 1.0
**Status**: APPROVED - Ready for Implementation
