# Rencana Implementasi Modul #7 & #8

**Tanggal**: 2026-02-15
**Status**: Planning
**Modul**: Kegiatan RBA (#7) & Output RBA (#8)
**Priority**: P0 (Critical Path - Perencanaan & RBA)

---

## 📋 Ringkasan Eksekutif

Modul Kegiatan RBA dan Output RBA adalah komponen krusial dalam hierarki perencanaan RBA BLUD:
- **Program RBA** (Level 1) ✅ Sudah diimplementasi
- **Kegiatan RBA** (Level 2) 🎯 Modul #7 - Target implementasi
- **Output RBA** (Level 3) 🎯 Modul #8 - Target implementasi
- **Sub-Output RBA** (Level 4) ⏳ Modul masa depan

Kedua modul ini memiliki relasi **master-detail** yang kuat dan harus diimplementasikan secara bersamaan untuk memberikan user experience yang optimal.

---

## 🎯 Objektif Implementasi

### Modul #7: Kegiatan RBA
- ✅ CRUD lengkap untuk kegiatan dalam program RBA
- ✅ Relasi parent-child dengan Program RBA
- ✅ Manajemen indikator kegiatan (JSON array)
- ✅ Filter berdasarkan tahun dan program
- ✅ Validasi kode unik per tahun
- ✅ Preview hierarki program → kegiatan

### Modul #8: Output RBA
- ✅ CRUD lengkap untuk output/komponen dalam kegiatan
- ✅ Relasi parent-child dengan Kegiatan RBA
- ✅ Manajemen target volume dan satuan
- ✅ Timeline pelaksanaan (bulan mulai - selesai)
- ✅ Integrasi dengan Unit Kerja
- ✅ Total pagu anggaran
- ✅ Preview hierarki program → kegiatan → output

---

## 📊 Analisis Struktur Data

### 1. Kegiatan RBA Entity

```typescript
interface KegiatanRBA {
  // Primary
  id: string;                    // UUID
  kodeKegiatan: string;          // "01.01", "01.02" (unique per tahun)
  namaKegiatan: string;          // Max 500 chars
  deskripsi?: string;            // Text, optional

  // Relations
  programId: string;             // UUID - Parent: ProgramRBA

  // Indikator (JSONB)
  indikatorKegiatan?: {
    nama: string;
    satuan: string;
    target: number;
  }[];

  // Metadata
  tahun: number;                 // 2000-2100
  isActive: boolean;             // Default true
  createdAt: Date;
  updatedAt: Date;

  // Virtual Relations
  program?: ProgramRBA;          // Parent
  output?: OutputRBA[];          // Children (one-to-many)
}
```

**Business Rules:**
- `kodeKegiatan` + `tahun` harus unique (database constraint)
- `kodeKegiatan` format: `XX.YY` (2 digit program + 2 digit kegiatan)
- `indikatorKegiatan` adalah array yang bisa kosong
- Setiap kegiatan HARUS memiliki parent `programId`
- Soft delete via `isActive` flag

---

### 2. Output RBA Entity

```typescript
interface OutputRBA {
  // Primary
  id: string;                    // UUID
  kodeOutput: string;            // "01.01.001", "01.01.002" (unique per tahun)
  namaOutput: string;            // Max 500 chars
  deskripsi?: string;            // Text, optional

  // Relations
  kegiatanId: string;            // UUID - Parent: KegiatanRBA
  unitKerjaId?: string;          // UUID - Unit pelaksana (optional)

  // Target & Volume
  volumeTarget: number;          // Integer, >= 0
  satuan: string;                // "Orang", "Kunjungan", "Kegiatan", etc (max 50 chars)

  // Lokasi & Timeline
  lokasi?: string;               // Max 255 chars, optional
  bulanMulai?: number;           // 1-12, optional
  bulanSelesai?: number;         // 1-12, optional

  // Financial
  totalPagu: number;             // Decimal(15,2), default 0

  // Metadata
  tahun: number;                 // 2000-2100
  isActive: boolean;             // Default true
  createdAt: Date;
  updatedAt: Date;

  // Virtual Relations
  kegiatan?: KegiatanRBA;        // Parent
  unitKerja?: UnitKerja;         // Reference
  anggaranBelanja?: AnggaranBelanjaRBA[];  // Children (one-to-many)
  subOutput?: SubOutputRBA[];    // Children (one-to-many)
}
```

**Business Rules:**
- `kodeOutput` + `tahun` harus unique (database constraint)
- `kodeOutput` format: `XX.YY.ZZZ` (2 digit program + 2 digit kegiatan + 3 digit output)
- `volumeTarget` harus >= 0
- `bulanMulai` dan `bulanSelesai` jika diisi harus dalam range 1-12
- `bulanSelesai` >= `bulanMulai` (validasi client-side)
- `totalPagu` bisa dihitung otomatis dari relasi `anggaranBelanja` (future enhancement)
- Setiap output HARUS memiliki parent `kegiatanId`

---

## 🏗️ Arsitektur Implementasi

### Structure Frontend per Module

```
src/features/kegiatan-rba/
├── index.ts                    # Exports
├── types.ts                    # TypeScript interfaces & DTOs
├── api.ts                      # API client functions
├── KegiatanRBA.tsx            # Main list/table page
├── KegiatanRBAForm.tsx        # Create/Edit form (modal/drawer)
├── KegiatanRBADetail.tsx      # Detail view with outputs list
└── components/
    ├── IndikatorKegiatanInput.tsx   # Dynamic array input
    └── ProgramSelector.tsx          # Dropdown untuk pilih program

src/features/output-rba/
├── index.ts                    # Exports
├── types.ts                    # TypeScript interfaces & DTOs
├── api.ts                      # API client functions
├── OutputRBA.tsx              # Main list/table page
├── OutputRBAForm.tsx          # Create/Edit form (modal/drawer)
├── OutputRBADetail.tsx        # Detail view
└── components/
    ├── KegiatanSelector.tsx        # Dropdown pilih kegiatan
    ├── UnitKerjaSelector.tsx       # Dropdown pilih unit kerja
    ├── TimelineInput.tsx           # Bulan mulai - selesai
    └── VolumeTargetInput.tsx       # Volume + satuan input
```

---

## 🎨 UI/UX Design Specifications

### Modul #7: Kegiatan RBA

#### A. List Page (`KegiatanRBA.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 📊 Kegiatan RBA                    [Filter ▼] [+ Tambah]│
│ Kelola kegiatan dalam Program RBA                       │
├─────────────────────────────────────────────────────────┤
│ Filter:                                                  │
│ [Tahun: 2026 ▼] [Program: Semua ▼] [Status: Semua ▼]  │
├─────────────────────────────────────────────────────────┤
│ TABLE:                                                   │
│ | Kode    | Nama Kegiatan      | Program  | Indikator | │
│ |---------|-------------------|----------|-----------|  │
│ | 01.01   | Penyediaan Jasa..| Program 1| 2 item    | 👁 ✏️ 🗑│
│ | 01.02   | Pemeliharaan...  | Program 1| 3 item    | 👁 ✏️ 🗑│
│                                        [Prev] [1] [Next] │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Filter dropdown: Tahun, Program (parent), Status aktif
- Search box untuk nama/kode kegiatan
- Table dengan pagination (10/25/50 rows)
- Actions: View (👁), Edit (✏️), Delete (🗑)
- Badge untuk jumlah indikator kegiatan
- Click row → navigate ke detail page

#### B. Form Modal (`KegiatanRBAForm.tsx`)

**Fields:**
1. **Kode Kegiatan** (text input)
   - Format: `XX.YY`
   - Validation: Required, max 20 chars, unique check
   - Helper text: "Format: 2 digit program + 2 digit kegiatan, contoh: 01.01"

2. **Nama Kegiatan** (text input)
   - Validation: Required, max 500 chars
   - Multiline support (textarea)

3. **Program RBA** (select dropdown)
   - Load dari API `/program-rba?tahun={tahun}`
   - Show: `[kodeProgram] - namaProgram`
   - Validation: Required

4. **Tahun Anggaran** (number input / select)
   - Options: currentYear-1, currentYear, currentYear+1
   - Validation: Required, 2000-2100

5. **Deskripsi** (textarea)
   - Validation: Optional
   - Max height dengan scroll

6. **Indikator Kegiatan** (dynamic array input)
   - Component: `IndikatorKegiatanInput`
   - Fields per item:
     - Nama indikator (text)
     - Satuan (text, max 50 chars)
     - Target (number, min 0)
   - [+ Tambah Indikator] button
   - [🗑 Hapus] per item
   - Validation: Optional (bisa kosong)

**Actions:**
- [Simpan] → POST/PATCH API
- [Batal] → Close modal

#### C. Detail Page (`KegiatanRBADetail.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Kembali          [✏️ Edit] [🗑 Hapus]                 │
├─────────────────────────────────────────────────────────┤
│ 📊 Detail Kegiatan RBA                                  │
│                                                          │
│ Kode Kegiatan: 01.01                                    │
│ Nama: Penyediaan Jasa Komunikasi, SDM dan Listrik      │
│ Program: [01] - Pelayanan Administrasi Perkantoran     │
│ Tahun: 2026                                             │
│ Deskripsi: [...]                                        │
│                                                          │
│ Indikator Kegiatan:                                     │
│ 1. Jumlah tagihan terbayar - 12 tagihan                │
│ 2. Tingkat ketersediaan - 99 %                         │
├─────────────────────────────────────────────────────────┤
│ 📦 Output RBA (3)                   [+ Tambah Output]  │
│                                                          │
│ TABLE: Output dalam kegiatan ini                        │
│ | Kode      | Nama Output    | Volume  | Pagu        | │
│ | 01.01.001 | Pelayanan...   | 1000 Org| 50.000.000  | │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Info header dengan breadcrumb
- Display semua data kegiatan
- List indikator dalam format numbering
- **Embedded Output RBA table** (relasi child)
- Quick add output dari detail kegiatan

---

### Modul #8: Output RBA

#### A. List Page (`OutputRBA.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 📦 Output RBA                      [Filter ▼] [+ Tambah]│
│ Kelola output/komponen dalam Kegiatan RBA               │
├─────────────────────────────────────────────────────────┤
│ Filter:                                                  │
│ [Tahun: 2026 ▼] [Kegiatan: Semua ▼] [Unit: Semua ▼]   │
├─────────────────────────────────────────────────────────┤
│ TABLE:                                                   │
│ | Kode      | Nama Output    | Volume Target | Pagu   | │
│ |-----------|----------------|--------------|--------|  │
│ | 01.01.001 | Pelayanan RJ   | 1000 Orang  | 50M    | 👁 ✏️ 🗑│
│ | 01.01.002 | Pelayanan RI   | 500 Pasien  | 100M   | 👁 ✏️ 🗑│
│                                        [Prev] [1] [Next] │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Filter dropdown: Tahun, Kegiatan (parent), Unit Kerja, Status
- Search box untuk nama/kode output
- Table dengan pagination
- Display formatted currency untuk pagu
- Timeline badge (Jan-Des, Mar-Jun, etc)
- Actions: View, Edit, Delete

#### B. Form Modal (`OutputRBAForm.tsx`)

**Fields:**
1. **Kode Output** (text input)
   - Format: `XX.YY.ZZZ`
   - Validation: Required, max 20 chars, unique check
   - Helper: "Format: [kode kegiatan].XXX, contoh: 01.01.001"

2. **Nama Output** (text input)
   - Validation: Required, max 500 chars

3. **Kegiatan RBA** (select dropdown)
   - Load dari API `/kegiatan-rba?tahun={tahun}`
   - Show: `[kodeKegiatan] - namaKegiatan`
   - Cascade load program info
   - Validation: Required

4. **Tahun Anggaran** (number input)
   - Same as Kegiatan
   - Auto-fill dari kegiatan selected (optional UX enhancement)

5. **Volume Target & Satuan** (composite input)
   - Component: `VolumeTargetInput`
   - Volume: number input (min 0, required)
   - Satuan: text input (max 50, required)
   - Layout: [1000] [Orang]
   - Presets satuan: "Orang", "Pasien", "Kunjungan", "Kegiatan", "Dokumen"

6. **Lokasi** (text input)
   - Validation: Optional, max 255 chars
   - Example: "Poli Umum, Gedung A Lt. 1"

7. **Timeline Pelaksanaan** (composite input)
   - Component: `TimelineInput`
   - Bulan Mulai: select (1-12) optional
   - Bulan Selesai: select (1-12) optional
   - Validation: bulanSelesai >= bulanMulai
   - Display: [Januari ▼] s/d [Desember ▼]

8. **Unit Kerja Pelaksana** (select dropdown)
   - Component: `UnitKerjaSelector`
   - Load dari API `/unit-kerja`
   - Validation: Optional

9. **Total Pagu** (currency input)
   - Validation: Optional, min 0
   - Format: Rp 50.000.000,00
   - Note: "(akan dihitung otomatis dari anggaran belanja)" - future

10. **Deskripsi** (textarea)
    - Validation: Optional

**Actions:**
- [Simpan]
- [Batal]

#### C. Detail Page (`OutputRBADetail.tsx`)

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Kembali          [✏️ Edit] [🗑 Hapus]                 │
├─────────────────────────────────────────────────────────┤
│ 📦 Detail Output RBA                                    │
│                                                          │
│ Kode Output: 01.01.001                                  │
│ Nama: Pelayanan Rawat Jalan                             │
│ Kegiatan: [01.01] - Penyediaan Jasa ...                │
│ Program: [01] - Pelayanan Administrasi ...              │
│ Tahun: 2026                                             │
│                                                          │
│ 🎯 Target:                                              │
│ Volume: 1000 Orang                                      │
│ Timeline: Januari - Desember 2026                       │
│ Lokasi: Poli Umum, Gedung A Lt. 1                      │
│ Unit Pelaksana: Instalasi Rawat Jalan                  │
│                                                          │
│ 💰 Anggaran:                                            │
│ Total Pagu: Rp 50.000.000,00                           │
│                                                          │
│ Deskripsi: [...]                                        │
├─────────────────────────────────────────────────────────┤
│ 📊 Anggaran Belanja (future)                           │
│ 📋 Sub-Output (future)                                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 API Integration

### Backend Endpoints Available

#### Kegiatan RBA APIs
```
GET    /api/kegiatan-rba              # Get all (with query filters)
GET    /api/kegiatan-rba/:id          # Get by ID
POST   /api/kegiatan-rba              # Create
PATCH  /api/kegiatan-rba/:id          # Update
DELETE /api/kegiatan-rba/:id          # Delete
```

**Query Parameters:**
- `tahun`: number
- `programId`: UUID
- `isActive`: boolean
- `page`: number
- `limit`: number
- `search`: string

#### Output RBA APIs
```
GET    /api/output-rba                # Get all (with query filters)
GET    /api/output-rba/:id            # Get by ID
POST   /api/output-rba                # Create
PATCH  /api/output-rba/:id            # Update
DELETE /api/output-rba/:id            # Delete
```

**Query Parameters:**
- `tahun`: number
- `kegiatanId`: UUID
- `unitKerjaId`: UUID
- `isActive`: boolean
- `page`: number
- `limit`: number
- `search`: string

### React Query Keys Strategy

```typescript
// Kegiatan RBA
['kegiatan-rba']                                    // List all
['kegiatan-rba', { tahun, programId }]             // Filtered list
['kegiatan-rba', id]                                // Single item
['kegiatan-rba', 'by-program', programId]          // By parent

// Output RBA
['output-rba']                                      // List all
['output-rba', { tahun, kegiatanId, unitKerjaId }] // Filtered list
['output-rba', id]                                  // Single item
['output-rba', 'by-kegiatan', kegiatanId]          // By parent
```

---

## 🧪 Testing Strategy

### Unit Tests
- [ ] API client functions (mock axios)
- [ ] Form validation logic
- [ ] Utils/helpers (currency format, date format)
- [ ] IndikatorKegiatan array manipulation

### Integration Tests
- [ ] CRUD operations end-to-end
- [ ] Filter functionality
- [ ] Parent-child relationship (cascade load)
- [ ] Form submission with validation errors

### E2E Tests (Playwright/Cypress)
- [ ] User flow: Create program → kegiatan → output
- [ ] Edit existing kegiatan with outputs
- [ ] Delete with confirmation
- [ ] Filter & search operations

---

## 📝 Implementation Checklist

### Modul #7: Kegiatan RBA

#### Setup & Types
- [ ] Create `src/features/kegiatan-rba/` directory
- [ ] Define types in `types.ts`
  - [ ] `KegiatanRBA` interface
  - [ ] `IndikatorKegiatan` interface
  - [ ] `CreateKegiatanRBADto`
  - [ ] `UpdateKegiatanRBADto`
  - [ ] `QueryKegiatanRBAParams`
- [ ] Create API client in `api.ts`
  - [ ] `getAll()` with query params
  - [ ] `getById(id)`
  - [ ] `getByProgram(programId)`
  - [ ] `create(data)`
  - [ ] `update(id, data)`
  - [ ] `delete(id)`

#### Components
- [ ] `KegiatanRBA.tsx` - Main page
  - [ ] List table with pagination
  - [ ] Filter controls (tahun, program, status)
  - [ ] Search functionality
  - [ ] Action buttons (view, edit, delete)
  - [ ] Loading & error states
  - [ ] Empty state
- [ ] `KegiatanRBAForm.tsx` - Create/Edit form
  - [ ] Form fields dengan validation
  - [ ] ProgramSelector dropdown
  - [ ] IndikatorKegiatanInput component
  - [ ] Submit handler dengan React Query mutation
  - [ ] Error handling & toast notifications
- [ ] `KegiatanRBADetail.tsx` - Detail page
  - [ ] Display all kegiatan data
  - [ ] Breadcrumb navigation
  - [ ] List indikator kegiatan
  - [ ] Embedded output RBA table
  - [ ] Edit/Delete actions
- [ ] `components/IndikatorKegiatanInput.tsx`
  - [ ] Dynamic array input
  - [ ] Add/remove indikator
  - [ ] Validation per field
- [ ] `components/ProgramSelector.tsx`
  - [ ] Dropdown with search
  - [ ] Load programs by year
  - [ ] Display format: `[kode] - nama`

#### Integration
- [ ] Add route to `src/routes/index.tsx`
  - [ ] `/kegiatan-rba` → List page
  - [ ] `/kegiatan-rba/:id` → Detail page
- [ ] Update sidebar menu (already exists)
- [ ] Create `index.ts` barrel export
- [ ] Test with backend API
  - [ ] Create kegiatan
  - [ ] Edit kegiatan
  - [ ] Delete kegiatan
  - [ ] Filter by program
  - [ ] Validation errors

---

### Modul #8: Output RBA

#### Setup & Types
- [ ] Create `src/features/output-rba/` directory
- [ ] Define types in `types.ts`
  - [ ] `OutputRBA` interface
  - [ ] `CreateOutputRBADto`
  - [ ] `UpdateOutputRBADto`
  - [ ] `QueryOutputRBAParams`
- [ ] Create API client in `api.ts`
  - [ ] `getAll()` with query params
  - [ ] `getById(id)`
  - [ ] `getByKegiatan(kegiatanId)`
  - [ ] `create(data)`
  - [ ] `update(id, data)`
  - [ ] `delete(id)`

#### Components
- [ ] `OutputRBA.tsx` - Main page
  - [ ] List table with pagination
  - [ ] Filter controls (tahun, kegiatan, unit kerja, status)
  - [ ] Search functionality
  - [ ] Display volume + satuan
  - [ ] Display formatted pagu (currency)
  - [ ] Timeline badge
  - [ ] Action buttons
  - [ ] Loading & error states
- [ ] `OutputRBAForm.tsx` - Create/Edit form
  - [ ] All form fields dengan validation
  - [ ] KegiatanSelector dropdown
  - [ ] UnitKerjaSelector dropdown
  - [ ] VolumeTargetInput component
  - [ ] TimelineInput component
  - [ ] Currency input for pagu
  - [ ] Submit handler
- [ ] `OutputRBADetail.tsx` - Detail page
  - [ ] Display all output data
  - [ ] Breadcrumb (program → kegiatan → output)
  - [ ] Show parent kegiatan info
  - [ ] Future: Anggaran belanja table
  - [ ] Future: Sub-output table
- [ ] `components/KegiatanSelector.tsx`
  - [ ] Dropdown with search
  - [ ] Load by year
  - [ ] Show program in label
- [ ] `components/UnitKerjaSelector.tsx`
  - [ ] Dropdown from master data
  - [ ] Optional field
- [ ] `components/TimelineInput.tsx`
  - [ ] Bulan mulai & selesai selects
  - [ ] Validation: selesai >= mulai
  - [ ] Display range label
- [ ] `components/VolumeTargetInput.tsx`
  - [ ] Number + satuan composite
  - [ ] Satuan presets
  - [ ] Validation

#### Integration
- [ ] Add route to `src/routes/index.tsx`
  - [ ] `/output-rba` → List page
  - [ ] `/output-rba/:id` → Detail page
- [ ] Update sidebar menu (already exists)
- [ ] Create `index.ts` barrel export
- [ ] Test with backend API
  - [ ] CRUD operations
  - [ ] Filter by kegiatan
  - [ ] Timeline validation
  - [ ] Currency formatting

---

## 🚀 Implementation Sequence

### Phase 1: Foundation (Day 1-2)
1. Setup folder structure untuk kedua modul
2. Define TypeScript types berdasarkan backend DTOs
3. Create API client functions
4. Test API integration dengan Postman/curl

### Phase 2: Kegiatan RBA Core (Day 3-4)
1. Implement `KegiatanRBA.tsx` list page
2. Implement `KegiatanRBAForm.tsx` form modal
3. Build `IndikatorKegiatanInput` component
4. Add routes & test CRUD

### Phase 3: Kegiatan RBA Polish (Day 5)
1. Implement `KegiatanRBADetail.tsx` detail page
2. Add filters & search
3. Error handling & loading states
4. Validation & toast notifications

### Phase 4: Output RBA Core (Day 6-7)
1. Implement `OutputRBA.tsx` list page
2. Implement `OutputRBAForm.tsx` form modal
3. Build sub-components (VolumeTarget, Timeline, Selectors)
4. Add routes & test CRUD

### Phase 5: Output RBA Polish (Day 8)
1. Implement `OutputRBADetail.tsx` detail page
2. Add filters & search (including cascade kegiatan → program)
3. Currency formatting untuk pagu
4. Timeline badge & display

### Phase 6: Integration & Testing (Day 9-10)
1. Integrate Kegiatan detail → Output list
2. End-to-end testing full hierarchy
3. Bug fixes & refinements
4. Documentation update

---

## 🎨 Reusable Components to Build

### 1. CurrencyInput Component
```typescript
// src/components/ui/CurrencyInput.tsx
interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}
```

### 2. MonthRangeInput Component
```typescript
// src/components/ui/MonthRangeInput.tsx
interface MonthRangeInputProps {
  startMonth?: number;
  endMonth?: number;
  onStartChange: (month: number) => void;
  onEndChange: (month: number) => void;
}
```

### 3. DynamicArrayInput Component (Generic)
```typescript
// src/components/ui/DynamicArrayInput.tsx
interface DynamicArrayInputProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  renderItem: (item: T, index: number, onChange: (item: T) => void) => React.ReactNode;
  newItemTemplate: T;
  addButtonLabel?: string;
}
```

### 4. RelationSelector Component (Generic)
```typescript
// src/components/ui/RelationSelector.tsx
// Generic component untuk dropdown relasi dengan search
interface RelationSelectorProps<T> {
  value?: string;
  onChange: (value: string, item: T) => void;
  fetchItems: () => Promise<T[]>;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}
```

---

## 📚 Dependencies & Libraries

### Already Installed
- ✅ React Query (@tanstack/react-query) - Data fetching
- ✅ Axios - HTTP client
- ✅ Zod - Validation (optional)
- ✅ Lucide React - Icons
- ✅ Tailwind CSS - Styling
- ✅ Shadcn/ui components - UI kit

### Potentially Needed
- [ ] react-currency-input-field (for better currency UX)
- [ ] react-select (for advanced dropdowns with search)
- [ ] date-fns (for month name formatting)

---

## ⚠️ Potential Challenges & Solutions

### Challenge 1: Cascade Loading (Program → Kegiatan → Output)
**Problem**: User memilih program, harus auto-filter kegiatan, dst.
**Solution**:
- Use dependent queries di React Query
- `enabled` option untuk conditional fetching
- Clear child selections saat parent berubah

### Challenge 2: Indikator Kegiatan Array Management
**Problem**: Dynamic form array bisa kompleks
**Solution**:
- Build dedicated `IndikatorKegiatanInput` component
- Use React state untuk manage array
- Provide clear add/remove UX

### Challenge 3: Kode Validation (Unique per Tahun)
**Problem**: Backend validation, tapi user perlu instant feedback
**Solution**:
- Client-side check via API (`GET /kegiatan-rba?kodeKegiatan=XX.YY&tahun=2026`)
- Debounced async validation
- Show error sebelum submit

### Challenge 4: Timeline Validation (Bulan Selesai >= Mulai)
**Problem**: Form validation dependencies
**Solution**:
- Custom validation function
- Disable invalid options di dropdown
- Clear visual feedback

### Challenge 5: Total Pagu Auto-calculation
**Problem**: Idealnya dihitung dari `anggaranBelanja` relation (modul belum ada)
**Solution**:
- Allow manual input untuk sementara
- Add note: "(akan dihitung otomatis)"
- Future: Subscribe to anggaran changes & recalculate

---

## 🔐 Security & Permissions

### RBAC Checks (Frontend)
```typescript
// Permissions yang dibutuhkan
const PERMISSIONS = {
  KEGIATAN_RBA_VIEW: 'kegiatan-rba:view',
  KEGIATAN_RBA_CREATE: 'kegiatan-rba:create',
  KEGIATAN_RBA_UPDATE: 'kegiatan-rba:update',
  KEGIATAN_RBA_DELETE: 'kegiatan-rba:delete',

  OUTPUT_RBA_VIEW: 'output-rba:view',
  OUTPUT_RBA_CREATE: 'output-rba:create',
  OUTPUT_RBA_UPDATE: 'output-rba:update',
  OUTPUT_RBA_DELETE: 'output-rba:delete',
};
```

Gunakan `useAuth()` hook untuk check permissions sebelum render buttons.

---

## 📊 Success Metrics

### Functional Metrics
- [ ] 100% CRUD operations working
- [ ] All filters & search functional
- [ ] Parent-child relationships accurate
- [ ] Validation working (client + server)
- [ ] No console errors

### Performance Metrics
- [ ] List page load < 1s (100 items)
- [ ] Form submit < 500ms
- [ ] Filter response < 300ms
- [ ] Optimistic UI updates

### UX Metrics
- [ ] Intuitive navigation (max 3 clicks to any action)
- [ ] Clear error messages
- [ ] Loading states on all async actions
- [ ] Responsive design (desktop + tablet)

---

## 📅 Timeline Estimate

| Phase | Tasks | Duration | Dependencies |
|-------|-------|----------|--------------|
| Phase 1 | Foundation & API | 2 days | Backend must be ready |
| Phase 2 | Kegiatan RBA Core | 2 days | Phase 1 |
| Phase 3 | Kegiatan RBA Polish | 1 day | Phase 2 |
| Phase 4 | Output RBA Core | 2 days | Phase 3 |
| Phase 5 | Output RBA Polish | 1 day | Phase 4 |
| Phase 6 | Integration & Testing | 2 days | Phase 5 |
| **TOTAL** | | **10 days** | |

---

## 🎯 Next Steps

1. ✅ Review & approve this implementation plan
2. ⏳ Verify backend APIs are ready & documented
3. ⏳ Create feature branches: `feature/kegiatan-rba`, `feature/output-rba`
4. ⏳ Start Phase 1: Setup & API integration
5. ⏳ Daily standups untuk track progress
6. ⏳ Code review sebelum merge ke `develop`

---

## 📖 References

- **Masterplan**: `/opt/sikancil/docs/SIKANCIL_MASTERPLAN_v2_FINAL.md`
- **Backend Entities**:
  - `/opt/sikancil/backend/src/database/entities/kegiatan-rba.entity.ts`
  - `/opt/sikancil/backend/src/database/entities/output-rba.entity.ts`
- **Backend DTOs**:
  - `/opt/sikancil/backend/src/modules/kegiatan-rba/dto/`
  - `/opt/sikancil/backend/src/modules/output-rba/dto/`
- **Frontend Reference (Program RBA)**:
  - `/opt/sikancil/frontend/src/features/program-rba/`
- **API Docs**: http://localhost:3000/api/docs

---

**Prepared by**: Claude AI Assistant
**Date**: 2026-02-15
**Status**: Ready for Implementation
**Estimated Effort**: 10 person-days
**Priority**: P0 - Critical Path

