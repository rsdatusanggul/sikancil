# Implementation Plan: Modul DPA/DPPA (Module #11)

**Dokumen Pelaksanaan Anggaran / Dokumen Pelaksanaan Perubahan Anggaran**

**Tanggal**: 15 Februari 2026
**Status**: Ready for Implementation
**Priority**: P0 (Critical - Core Module)
**Backend API**: ✅ Available & Complete
**Estimasi**: 5-7 hari kerja

---

## 📋 Executive Summary

Modul DPA/DPPA adalah modul **kunci** dalam sistem keuangan BLUD yang berfungsi sebagai:
1. **Dokumen resmi pelaksanaan anggaran** yang menjadi dasar legal untuk melakukan belanja
2. **Budget control system** yang mencegah overspending
3. **Bridge** antara perencanaan (RBA) dengan pelaksanaan (SPP/SPM/SP2D)
4. **Monitoring tool** untuk tracking realisasi vs pagu anggaran

**Backend sudah 100% ready**, tinggal implementasi frontend.

---

## 🎯 Tujuan Implementasi

### Functional Goals
- ✅ User dapat membuat DPA secara manual atau generate dari RBA yang sudah approved
- ✅ User dapat manage DPPA (revisi DPA) dengan tracking history
- ✅ Implementasi approval workflow: DRAFT → SUBMITTED → APPROVED → ACTIVE
- ✅ User dapat melihat detail DPA lengkap dengan rincian Belanja, Pendapatan, Pembiayaan
- ✅ User dapat monitoring realisasi vs pagu per program-kegiatan-output
- ✅ User dapat filter dan search DPA berdasarkan tahun, status, jenis dokumen

### Technical Goals
- ✅ Reusable components (Table, Form, Modal, Status Badge)
- ✅ React Query for state management & caching
- ✅ TypeScript untuk type safety
- ✅ Responsive design (desktop & tablet)
- ✅ Error handling yang baik (user-friendly messages)
- ✅ Loading states untuk semua async operations

---

## 📊 Backend Analysis

### ✅ Available Entities

1. **DPA** (Master Table)
   - Stores main DPA information
   - Workflow status tracking
   - Approval information
   - Totals (auto-calculated)

2. **DPABelanja** (Detail Belanja)
   - Rincian belanja per Program-Kegiatan-Output
   - Kode rekening belanja
   - Breakdown bulanan (12 months)
   - Realisasi & komitmen tracking
   - Sisa anggaran calculation

3. **DPAPendapatan** (Detail Pendapatan)
   - Target pendapatan per kode rekening
   - Jenis pendapatan (Operasional, Hibah, Transfer APBD)
   - Breakdown bulanan
   - Realisasi tracking

4. **DPAPembiayaan** (Detail Pembiayaan)
   - Penerimaan pembiayaan (SiLPA, pinjaman)
   - Pengeluaran pembiayaan (investasi)
   - Breakdown bulanan

5. **DPAHistory** (Audit Trail)
   - Log semua perubahan
   - Track who, what, when

### ✅ Available API Endpoints

#### CRUD Operations
```
GET    /dpa                          - List all DPA with filters
GET    /dpa/active/:tahunAnggaran    - Get active DPA for year
GET    /dpa/:id                      - Get DPA detail
GET    /dpa/:id/summary              - Get DPA summary with totals
GET    /dpa/:id/history              - Get audit trail
POST   /dpa                          - Create DPA manually
POST   /dpa/generate-from-rba        - Generate DPA from RBA
PUT    /dpa/:id                      - Update DPA (DRAFT only)
DELETE /dpa/:id                      - Delete DPA (DRAFT only)
```

#### Workflow Operations
```
POST   /dpa/:id/submit               - Submit for approval
POST   /dpa/:id/approve              - Approve (PPKD only)
POST   /dpa/:id/reject               - Reject with reason
POST   /dpa/:id/activate             - Activate DPA
POST   /dpa/:id/recalculate          - Recalculate totals
```

### 🔐 Business Rules (Backend Enforced)

1. **Unique Active DPA**: Hanya 1 DPA ACTIVE per tahun anggaran
2. **Edit Restriction**: Hanya DRAFT yang dapat diedit/dihapus
3. **Workflow Enforcement**:
   - DRAFT → submit → SUBMITTED
   - SUBMITTED → approve → APPROVED
   - SUBMITTED → reject → REJECTED
   - APPROVED → activate → ACTIVE
   - ACTIVE → (when new DPPA activated) → REVISED
4. **DPPA Requirements**: Harus punya DPA sebelumnya + alasan revisi
5. **Auto-calculation**: Total pagu otomatis dihitung dari detail tables

### 📊 Status Flow

```
DRAFT ──submit──> SUBMITTED ──approve──> APPROVED ──activate──> ACTIVE
          ↓                      ↓                                  ↓
       (editable)            reject                           (when DPPA activated)
                                ↓                                  ↓
                           REJECTED                            REVISED
                                ↓
                           (editable)
```

---

## 🎨 UI/UX Design Plan

### 1. Main DPA List Page (`/dpa`)

**Layout**: Table with filters & actions

**Components**:
- **Header Section**
  - Title: "DPA/DPPA - Dokumen Pelaksanaan Anggaran"
  - Create DPA button (dropdown: "Manual" / "Generate dari RBA")
  - Filter section (collapsible):
    - Tahun Anggaran (select)
    - Status (multi-select: DRAFT, SUBMITTED, APPROVED, ACTIVE, REVISED)
    - Jenis Dokumen (select: DPA, DPPA)
    - Search box (nomor DPA)

- **Table Columns**:
  | Column | Description | Width |
  |--------|-------------|-------|
  | Nomor DPA | DPA-001/BLUD/2026 | 200px |
  | Jenis | Badge: DPA/DPPA | 80px |
  | Tahun Anggaran | 2026 | 100px |
  | Status | Colored badge | 120px |
  | Total Pagu Belanja | Formatted currency | 150px |
  | Total Pagu Pendapatan | Formatted currency | 150px |
  | Realisasi Belanja | % + progress bar | 150px |
  | Tanggal Berlaku | DD/MM/YYYY | 120px |
  | Actions | View, Edit, Delete | 120px |

- **Status Badge Colors**:
  - DRAFT: gray
  - SUBMITTED: blue
  - APPROVED: green
  - REJECTED: red
  - ACTIVE: purple (bold)
  - REVISED: yellow

- **Actions (Dropdown)**:
  - View Detail
  - Edit (only DRAFT/REJECTED)
  - Delete (only DRAFT)
  - Submit (only DRAFT)
  - Approve (only SUBMITTED, role: PPKD)
  - Reject (only SUBMITTED, role: PPKD)
  - Activate (only APPROVED)
  - View History (audit trail)
  - Download PDF (future)

- **Pagination**: Bottom, show 10/20/50 per page

### 2. DPA Detail Page (`/dpa/:id`)

**Layout**: Tabs for different sections

**Header Card**:
- Nomor DPA (large, bold)
- Status badge (large)
- Jenis Dokumen (DPA/DPPA)
- Tahun Anggaran
- Tanggal Dokumen, Berlaku, Selesai
- Nomor SK & Tanggal SK (if APPROVED/ACTIVE)
- Action buttons (based on status & role)

**Tabs**:

1. **Tab: Ringkasan**
   - Total Pagu Pendapatan vs Realisasi (chart: donut)
   - Total Pagu Belanja vs Realisasi (chart: donut)
   - Total Pagu Pembiayaan vs Realisasi
   - SiLPA calculation
   - Quick stats cards

2. **Tab: Belanja** (main focus)
   - Tree table: Program → Kegiatan → Output → Sub-Output → Kode Rekening
   - Columns:
     - Kode & Nama
     - Volume & Satuan
     - Pagu
     - Realisasi
     - Komitmen
     - Sisa
     - % Realisasi (progress bar)
   - Expandable rows
   - Subtotal per program/kegiatan
   - Grand total (footer sticky)
   - Filter by: Jenis Belanja, Sumber Dana, Unit Kerja
   - Export to Excel button

3. **Tab: Pendapatan**
   - Table with grouping by Jenis Pendapatan
   - Columns:
     - Kode Rekening & Nama
     - Jenis Pendapatan
     - Kategori
     - Sumber Pendapatan
     - Pagu
     - Realisasi
     - Sisa
     - % Realisasi
   - Subtotal per jenis
   - Chart: breakdown by kategori

4. **Tab: Pembiayaan**
   - Two sections: Penerimaan & Pengeluaran
   - Similar structure to Pendapatan
   - Show SiLPA separately

5. **Tab: Breakdown Bulanan**
   - Chart: line chart showing pagu vs realisasi per bulan
   - Table: monthly breakdown
   - Columns for each month (Jan-Dec)
   - Rows: Penerimaan, Belanja, Saldo Kas
   - Projection vs actual

6. **Tab: Revisi History** (if DPPA or REVISED)
   - Timeline of revisions
   - Link to previous DPA
   - Show alasan revisi
   - Comparison table: before vs after

7. **Tab: Audit Trail**
   - Table of all changes
   - Columns: Timestamp, User, Action, Old Value, New Value, Notes
   - Filter by date range

**Action Buttons (Dynamic based on status)**:
- DRAFT: Edit, Delete, Submit for Approval
- SUBMITTED: Approve (PPKD), Reject (PPKD)
- APPROVED: Activate
- ACTIVE: Create DPPA (revisi)
- ALL: Download PDF, Print

### 3. Create/Edit DPA Form

**Layout**: Multi-step wizard OR single long form

**Option A: Wizard (Recommended)**

**Step 1: Informasi Dasar**
- Jenis Dokumen: Radio (DPA / DPPA)
- If DPPA: Select DPA Sebelumnya, Nomor Revisi, Alasan Revisi
- Nomor DPA (auto-generate with preview)
- Tahun Anggaran (select: current year ± 2)
- Tanggal Dokumen (date picker)
- Tanggal Berlaku (date picker)
- Tanggal Selesai (date picker, default: 31 Dec of tahun anggaran)

**Step 2: Pilih Sumber Data**
- Option 1: Manual Entry (empty DPA)
- Option 2: Generate dari RBA (select approved RBA, auto-fill data)

If Option 2:
- Select Revisi RBA (dropdown: only APPROVED status)
- Preview data yang akan di-copy
- Checkbox: Copy Belanja, Copy Pendapatan, Copy Pembiayaan
- Info: "Data akan dicopy, Anda masih bisa edit setelah DPA dibuat"

**Step 3: Review & Konfirmasi**
- Preview all data
- Terms & conditions checkbox (optional)
- Create button

**Option B: Single Form** (simpler, for manual only)
- All fields in Step 1
- Generate dari RBA: separate button/page

### 4. Generate DPA from RBA Page

**Layout**: Wizard

**Step 1: Select RBA**
- Filter: Tahun Anggaran
- Table of APPROVED RBA revisions
- Columns: Nomor Revisi, Tanggal, Total Pagu, Status
- Radio select

**Step 2: Configure DPA**
- Nomor DPA (with template: DPA-XXX/BLUD/YYYY)
- Tanggal Dokumen (default: today)
- Tanggal Berlaku (default: 1 Jan tahun anggaran)
- Tanggal Selesai (default: 31 Dec tahun anggaran)
- Preview: Total Belanja, Total Pendapatan, Total Pembiayaan from RBA

**Step 3: Konfirmasi**
- Summary of what will be created
- List of programs, kegiatans, outputs to be copied
- Generate button

### 5. Approval Modal (for PPKD)

**Approve**:
- DPA Info (readonly)
- Catatan Persetujuan (textarea, optional)
- Nomor SK (text input, optional)
- Tanggal SK (date picker, optional)
- Upload SK file (PDF, optional)
- Confirm button

**Reject**:
- DPA Info (readonly)
- Alasan Penolakan (textarea, required)
- Reject button (red, confirmation dialog)

### 6. Components to Build

**New Components**:
1. `DPAStatusBadge` - colored badge based on status
2. `DPAWorkflowActions` - dynamic action buttons based on status & role
3. `DPATreeTable` - tree table for belanja with expand/collapse
4. `DPAMonthlyChart` - line chart for monthly breakdown
5. `DPARealisasiCard` - card showing pagu vs realisasi with progress bar
6. `DPAAuditTrail` - timeline/table for history
7. `DPAFilterPanel` - collapsible filter section

**Reuse Existing**:
- `Button`, `Input`, `Select`, `Card`, `Table`, `Modal`, `Badge`, `Alert`
- Layout components (Sidebar, Header, MainLayout)

---

## 📁 File Structure

```
frontend/src/features/dpa/
├── index.ts                          # Barrel export
├── types.ts                          # TypeScript interfaces & enums
├── api.ts                            # API client functions
├── hooks.ts                          # React Query hooks
│
├── DPA.tsx                           # Main page (list)
├── DPADetail.tsx                     # Detail page with tabs
├── DPAForm.tsx                       # Create/Edit form (wizard)
├── DPAGenerateFromRBA.tsx            # Generate from RBA page
│
├── components/
│   ├── DPAStatusBadge.tsx
│   ├── DPAWorkflowActions.tsx
│   ├── DPATreeTable.tsx
│   ├── DPAMonthlyChart.tsx
│   ├── DPARealisasiCard.tsx
│   ├── DPAAuditTrail.tsx
│   ├── DPAFilterPanel.tsx
│   ├── DPAApprovalModal.tsx
│   └── DPARejectModal.tsx
│
└── utils.ts                          # Helper functions
```

**Estimated File Count**: 17 files
**Estimated Lines of Code**: ~2,500-3,000 LOC

---

## 🔧 Technical Implementation Details

### 1. TypeScript Types (`types.ts`)

```typescript
// Status enum
export enum DPAStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ACTIVE = 'ACTIVE',
  REVISED = 'REVISED',
}

// Jenis Dokumen
export enum JenisDokumenDPA {
  DPA = 'DPA',
  DPPA = 'DPPA',
}

// Main DPA interface
export interface DPA {
  id: string;
  nomorDPA: string;
  jenisDokumen: JenisDokumenDPA;
  tahun: number;
  tahunAnggaran: number;
  status: DPAStatus;
  tanggalDokumen: string | null;
  tanggalBerlaku: string | null;
  tanggalSelesai: string | null;

  // Relations
  revisiRBAId: string | null;
  dpaSebelumnyaId: string | null;
  nomorRevisi: number;
  alasanRevisi: string | null;

  // Totals
  totalPaguPendapatan: number;
  totalPaguBelanja: number;
  totalPaguPembiayaan: number;
  totalRealisasiPendapatan: number;
  totalRealisasiBelanja: number;
  totalRealisasiPembiayaan: number;

  // Approval
  diajukanOleh: string | null;
  tanggalPengajuan: string | null;
  disetujuiOleh: string | null;
  tanggalPersetujuan: string | null;
  catatanPersetujuan: string | null;

  // SK
  nomorSK: string | null;
  tanggalSK: string | null;
  fileSK: string | null;

  // Files
  fileDPA: string | null;

  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Relations (populated)
  belanja?: DPABelanja[];
  pendapatan?: DPAPendapatan[];
  pembiayaan?: DPAPembiayaan[];
  history?: DPAHistory[];
  dpaSebelumnya?: DPA;
}

// DPA Belanja
export interface DPABelanja {
  id: string;
  dpaId: string;

  // Program-Kegiatan-Output
  programId: string | null;
  kegiatanId: string | null;
  outputId: string | null;
  subOutputId: string | null;

  kodeProgram: string;
  namaProgram: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  kodeOutput: string;
  namaOutput: string;
  kodeSubOutput: string | null;
  namaSubOutput: string | null;

  // Rekening
  kodeRekening: string;
  namaRekening: string;

  // Klasifikasi
  jenisBelanja: string; // OPERASIONAL, MODAL, TAK_TERDUGA
  kategori: string;     // PEGAWAI, BARANG_JASA, MODAL
  sumberDana: string;   // APBD, FUNGSIONAL, HIBAH, LAINNYA

  // Target
  volumeTarget: number | null;
  satuan: string | null;

  // Pagu
  pagu: number;

  // Monthly breakdown
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;

  // Realisasi
  realisasi: number;
  komitmen: number;
  sisa: number;
  persentaseRealisasi: number;

  // Unit
  unitKerjaId: string | null;
  keterangan: string | null;

  createdAt: string;
  updatedAt: string;
}

// DPA Pendapatan
export interface DPAPendapatan {
  id: string;
  dpaId: string;

  // Rekening
  kodeRekening: string;
  namaRekening: string;

  // Klasifikasi
  jenisPendapatan: string; // OPERASIONAL, NON_OPERASIONAL, HIBAH, TRANSFER_APBD
  kategori: string;        // JASA_LAYANAN, USAHA_LAIN, BUNGA, SEWA
  sumberPendapatan: string | null; // BPJS, UMUM, ASURANSI, APBD

  // Pagu
  pagu: number;

  // Monthly breakdown
  januari: number;
  februari: number;
  maret: number;
  april: number;
  mei: number;
  juni: number;
  juli: number;
  agustus: number;
  september: number;
  oktober: number;
  november: number;
  desember: number;

  // Realisasi
  realisasi: number;
  sisa: number;
  persentaseRealisasi: number;

  unitKerjaId: string | null;
  keterangan: string | null;

  createdAt: string;
  updatedAt: string;
}

// DPA Pembiayaan (similar structure)
export interface DPAPembiayaan {
  id: string;
  dpaId: string;

  kodeRekening: string;
  namaRekening: string;

  jenisPembiayaan: string; // PENERIMAAN, PENGELUARAN
  kategori: string;

  pagu: number;

  // Monthly breakdown (same as above)
  januari: number;
  // ... other months

  realisasi: number;
  sisa: number;
  persentaseRealisasi: number;

  keterangan: string | null;

  createdAt: string;
  updatedAt: string;
}

// History
export interface DPAHistory {
  id: string;
  dpaId: string;
  action: string;
  userId: string;
  userName: string;
  oldValue: string | null;
  newValue: string | null;
  notes: string | null;
  createdAt: string;
}

// DTOs
export interface CreateDPADto {
  nomorDPA: string;
  jenisDokumen: JenisDokumenDPA;
  tahun: number;
  tahunAnggaran: number;
  tanggalDokumen?: string;
  tanggalBerlaku?: string;
  tanggalSelesai?: string;
  dpaSebelumnyaId?: string;
  nomorRevisi?: number;
  alasanRevisi?: string;
}

export interface UpdateDPADto extends Partial<CreateDPADto> {}

export interface GenerateDPAFromRBADto {
  revisiRBAId: string;
  tahunAnggaran: number;
  nomorDPA: string;
}

export interface QueryDPAParams {
  page?: number;
  limit?: number;
  tahunAnggaran?: number;
  status?: DPAStatus;
  jenisDokumen?: JenisDokumenDPA;
  search?: string;
}

export interface DPASummary {
  dpa: DPA;
  totalBelanja: {
    pagu: number;
    realisasi: number;
    komitmen: number;
    sisa: number;
    persentase: number;
  };
  totalPendapatan: {
    pagu: number;
    realisasi: number;
    sisa: number;
    persentase: number;
  };
  totalPembiayaan: {
    penerimaan: number;
    pengeluaran: number;
    net: number;
  };
  silpa: number;
}
```

### 2. API Client (`api.ts`)

```typescript
import { apiClient } from '@/lib/api-client';
import type {
  DPA,
  CreateDPADto,
  UpdateDPADto,
  GenerateDPAFromRBADto,
  QueryDPAParams,
  DPASummary,
  DPAHistory,
} from './types';

const BASE_URL = '/dpa';

// List
export const getDPAList = async (params: QueryDPAParams) => {
  const { data } = await apiClient.get(BASE_URL, { params });
  return data;
};

// Get active DPA for year
export const getActiveDPA = async (tahunAnggaran: number) => {
  const { data } = await apiClient.get(`${BASE_URL}/active/${tahunAnggaran}`);
  return data;
};

// Get by ID
export const getDPAById = async (id: string) => {
  const { data } = await apiClient.get(`${BASE_URL}/${id}`);
  return data;
};

// Get summary
export const getDPASummary = async (id: string): Promise<DPASummary> => {
  const { data } = await apiClient.get(`${BASE_URL}/${id}/summary`);
  return data;
};

// Get history
export const getDPAHistory = async (id: string): Promise<DPAHistory[]> => {
  const { data } = await apiClient.get(`${BASE_URL}/${id}/history`);
  return data;
};

// Create
export const createDPA = async (dto: CreateDPADto): Promise<DPA> => {
  const { data } = await apiClient.post(BASE_URL, dto);
  return data;
};

// Generate from RBA
export const generateDPAFromRBA = async (dto: GenerateDPAFromRBADto): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/generate-from-rba`, dto);
  return data;
};

// Update
export const updateDPA = async (id: string, dto: UpdateDPADto): Promise<DPA> => {
  const { data } = await apiClient.put(`${BASE_URL}/${id}`, dto);
  return data;
};

// Delete
export const deleteDPA = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};

// Workflow actions
export const submitDPA = async (id: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/submit`);
  return data;
};

export const approveDPA = async (id: string, catatan?: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/approve`, { catatan });
  return data;
};

export const rejectDPA = async (id: string, alasan: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/reject`, { alasan });
  return data;
};

export const activateDPA = async (id: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/activate`);
  return data;
};

export const recalculateDPATotals = async (id: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/recalculate`);
  return data;
};
```

### 3. React Query Hooks (`hooks.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type { QueryDPAParams, CreateDPADto, UpdateDPADto, GenerateDPAFromRBADto } from './types';

// Query keys
export const dpaKeys = {
  all: ['dpa'] as const,
  lists: () => [...dpaKeys.all, 'list'] as const,
  list: (params: QueryDPAParams) => [...dpaKeys.lists(), params] as const,
  details: () => [...dpaKeys.all, 'detail'] as const,
  detail: (id: string) => [...dpaKeys.details(), id] as const,
  summary: (id: string) => [...dpaKeys.all, 'summary', id] as const,
  history: (id: string) => [...dpaKeys.all, 'history', id] as const,
  active: (tahunAnggaran: number) => [...dpaKeys.all, 'active', tahunAnggaran] as const,
};

// List
export const useDPAList = (params: QueryDPAParams) => {
  return useQuery({
    queryKey: dpaKeys.list(params),
    queryFn: () => api.getDPAList(params),
  });
};

// Active DPA
export const useActiveDPA = (tahunAnggaran: number) => {
  return useQuery({
    queryKey: dpaKeys.active(tahunAnggaran),
    queryFn: () => api.getActiveDPA(tahunAnggaran),
    enabled: !!tahunAnggaran,
  });
};

// Detail
export const useDPA = (id: string) => {
  return useQuery({
    queryKey: dpaKeys.detail(id),
    queryFn: () => api.getDPAById(id),
    enabled: !!id,
  });
};

// Summary
export const useDPASummary = (id: string) => {
  return useQuery({
    queryKey: dpaKeys.summary(id),
    queryFn: () => api.getDPASummary(id),
    enabled: !!id,
  });
};

// History
export const useDPAHistory = (id: string) => {
  return useQuery({
    queryKey: dpaKeys.history(id),
    queryFn: () => api.getDPAHistory(id),
    enabled: !!id,
  });
};

// Create
export const useCreateDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDPADto) => api.createDPA(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Generate from RBA
export const useGenerateDPAFromRBA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: GenerateDPAFromRBADto) => api.generateDPAFromRBA(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Update
export const useUpdateDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDPADto }) =>
      api.updateDPA(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Delete
export const useDeleteDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteDPA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Workflow mutations
export const useSubmitDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.submitDPA(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

export const useApproveDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan?: string }) =>
      api.approveDPA(id, catatan),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

export const useRejectDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, alasan }: { id: string; alasan: string }) =>
      api.rejectDPA(id, alasan),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

export const useActivateDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.activateDPA(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dpaKeys.active(data.tahunAnggaran) });
    },
  });
};
```

---

## 📅 Implementation Roadmap

### Phase 1: Foundation (Day 1-2)
**Goal**: Setup basic structure & types

**Tasks**:
1. ✅ Create folder structure (`/features/dpa/`)
2. ✅ Define TypeScript types & enums (`types.ts`)
3. ✅ Implement API client (`api.ts`)
4. ✅ Create React Query hooks (`hooks.ts`)
5. ✅ Create barrel export (`index.ts`)
6. ✅ Add route to router (`/dpa`)
7. ✅ Update sidebar menu item

**Deliverable**: Basic project structure ready, API integration working

**Estimated Time**: 1-2 days

---

### Phase 2: Core Components (Day 2-3)
**Goal**: Build reusable components

**Tasks**:
1. ✅ `DPAStatusBadge.tsx` - Status badge with colors
2. ✅ `DPARealisasiCard.tsx` - Card with progress bar
3. ✅ `DPAFilterPanel.tsx` - Collapsible filter section
4. ✅ `DPAWorkflowActions.tsx` - Dynamic action buttons
5. ✅ Write unit tests for components

**Deliverable**: Reusable components tested & ready

**Estimated Time**: 1 day

---

### Phase 3: Main List Page (Day 3-4)
**Goal**: Complete DPA list with filters & CRUD

**Tasks**:
1. ✅ Build `DPA.tsx` main page
2. ✅ Implement table with sorting & pagination
3. ✅ Implement filter panel (tahun, status, jenis)
4. ✅ Implement search functionality
5. ✅ Implement delete confirmation modal
6. ✅ Implement basic workflow actions (submit, approve, reject)
7. ✅ Add loading & error states
8. ✅ Add empty state (no data)

**Deliverable**: Fully functional DPA list page

**Estimated Time**: 1-2 days

---

### Phase 4: Detail Page with Tabs (Day 4-5)
**Goal**: Complete DPA detail view

**Tasks**:
1. ✅ Build `DPADetail.tsx` with tabs
2. ✅ **Tab 1: Ringkasan** - Summary cards & charts
3. ✅ **Tab 2: Belanja** - Tree table with expand/collapse
4. ✅ **Tab 3: Pendapatan** - Table with grouping
5. ✅ **Tab 4: Pembiayaan** - Two-section table
6. ✅ **Tab 5: Breakdown Bulanan** - Monthly chart
7. ✅ **Tab 6: Revisi History** - Timeline
8. ✅ **Tab 7: Audit Trail** - History table
9. ✅ Implement breadcrumb navigation
10. ✅ Test all tabs with real data

**Deliverable**: Complete detail page with all tabs functional

**Estimated Time**: 1-2 days

---

### Phase 5: Forms (Day 5-6)
**Goal**: Create & Edit functionality

**Tasks**:
1. ✅ Build `DPAForm.tsx` wizard (3 steps)
2. ✅ Step 1: Basic info form with validation
3. ✅ Step 2: Source selection (manual/from RBA)
4. ✅ Step 3: Review & confirm
5. ✅ Implement form state management
6. ✅ Implement validation rules
7. ✅ Build `DPAGenerateFromRBA.tsx` page
8. ✅ Implement RBA selection with preview
9. ✅ Test create & edit flows

**Deliverable**: Complete create/edit forms

**Estimated Time**: 1-2 days

---

### Phase 6: Workflow & Modals (Day 6-7)
**Goal**: Complete approval workflow

**Tasks**:
1. ✅ Build `DPAApprovalModal.tsx`
2. ✅ Build `DPARejectModal.tsx`
3. ✅ Implement activate confirmation
4. ✅ Implement delete confirmation
5. ✅ Test all workflow transitions
6. ✅ Add role-based UI visibility (PPKD only for approve/reject)
7. ✅ Add success/error toast notifications
8. ✅ Test edge cases (e.g., can't approve DRAFT)

**Deliverable**: Complete workflow system

**Estimated Time**: 1 day

---

### Phase 7: Advanced Features (Day 7 - Optional)
**Goal**: Polish & extras

**Tasks**:
1. 🔲 Implement `DPATreeTable.tsx` for hierarchical belanja view
2. 🔲 Implement `DPAMonthlyChart.tsx` with Chart.js
3. 🔲 Add export to Excel functionality
4. 🔲 Add print/PDF generation (future)
5. 🔲 Performance optimization (memoization, lazy loading)
6. 🔲 Accessibility improvements (keyboard navigation, ARIA)
7. 🔲 Add unit tests for complex components
8. 🔲 E2E tests with Playwright/Cypress (optional)

**Deliverable**: Polished, production-ready module

**Estimated Time**: 1-2 days (can be done later)

---

## 🧪 Testing Strategy

### Unit Tests
- All utility functions
- All custom hooks
- Complex components (tree table, charts)

### Integration Tests
- API integration
- Form validation
- Workflow state transitions

### E2E Tests (Optional)
- Complete user flows:
  1. Create DPA from scratch
  2. Generate DPA from RBA
  3. Submit → Approve → Activate workflow
  4. Create DPPA (revision)
  5. View detail & navigate tabs

### Manual Testing Checklist
- [ ] Create DPA manual
- [ ] Generate DPA from RBA
- [ ] Edit DPA (DRAFT only)
- [ ] Delete DPA (DRAFT only)
- [ ] Submit for approval
- [ ] Approve (as PPKD)
- [ ] Reject with reason
- [ ] Activate DPA
- [ ] Create DPPA from ACTIVE DPA
- [ ] View all tabs in detail page
- [ ] Filter & search in list
- [ ] Pagination works correctly
- [ ] All validation rules enforced
- [ ] Error handling works
- [ ] Loading states show correctly
- [ ] Toast notifications appear
- [ ] Responsive on tablet/mobile

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] All unit tests passing
- [ ] Manual testing completed
- [ ] Code review completed
- [ ] Update MODULE_INDEX.md (mark DPA as complete)
- [ ] Update changelog/release notes

### After Deployment
- [ ] Verify in staging environment
- [ ] Test with real backend data
- [ ] Performance monitoring
- [ ] User acceptance testing
- [ ] Documentation updated
- [ ] Training materials created (if needed)

---

## 📊 Success Metrics

### Functional Metrics
- ✅ All CRUD operations working
- ✅ All workflow transitions working
- ✅ All validations enforced
- ✅ All tabs displaying correct data

### Technical Metrics
- ✅ Code coverage > 70%
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Page load time < 2s
- ✅ API response time < 500ms

### User Metrics
- ✅ Task completion rate > 90%
- ✅ Error rate < 5%
- ✅ User satisfaction > 4/5

---

## 🎓 Key Learnings & Best Practices

### 1. Reuse Existing Patterns
- Follow structure from `anggaran-kas`, `kegiatan-rba` modules
- Use same table, form, modal components
- Follow same API client pattern

### 2. TypeScript First
- Define all types before coding
- Use strict mode
- No `any` types

### 3. React Query Best Practices
- Proper query key structure
- Optimistic updates for mutations
- Cache invalidation strategy
- Error handling with retry logic

### 4. Component Design
- Small, focused components
- Props interface for each component
- Proper prop validation
- Memoization for expensive renders

### 5. State Management
- Use React Query for server state
- Use useState for local UI state
- Avoid prop drilling (use context if needed)

### 6. Error Handling
- User-friendly error messages
- Fallback UI for errors
- Toast notifications for actions
- Validation messages inline

### 7. Performance
- Lazy load tabs content
- Virtualize long lists/tables
- Debounce search inputs
- Memoize expensive calculations

### 8. Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Focus management in modals

---

## 🔗 Dependencies & Integration Points

### Frontend Dependencies
- React Query (data fetching)
- React Hook Form (forms)
- Zod (validation)
- Chart.js / Recharts (charts)
- date-fns (date formatting)
- React Table / TanStack Table (tables)

### Backend Dependencies
- `/dpa` endpoints (primary)
- `/revisi-rba` endpoints (for generate from RBA)
- `/chart-of-accounts` (optional, for validation)
- `/unit-kerja` (optional, for filtering)
- `/auth` (authentication)

### Integration with Other Modules
- **RBA Module**: Generate DPA from approved RBA
- **SPP Module**: Check budget availability from active DPA (future)
- **Realisasi Belanja**: Update realisasi in DPA (future)
- **Dashboard**: Display DPA summary (future)
- **Laporan LRA**: Use DPA as budget baseline (future)

---

## 📚 Resources & References

### Backend Documentation
- Backend README: `/backend/src/modules/dpa/README.md`
- Entity definitions: `/backend/src/database/entities/dpa*.entity.ts`
- Controller: `/backend/src/modules/dpa/dpa.controller.ts`
- Service: `/backend/src/modules/dpa/dpa.service.ts`

### Similar Implemented Modules (Reference)
- Anggaran Kas: `/frontend/src/features/anggaran-kas/`
- Kegiatan RBA: `/frontend/src/features/kegiatan-rba/`
- Revisi RBA: `/frontend/src/features/revisi-rba/`

### External References
- PMK 220/2016: Sistem Akuntansi BLUD
- Permendagri 61/2007: Pedoman Teknis Keuangan BLUD
- React Query Docs: https://tanstack.com/query
- React Hook Form: https://react-hook-form.com

---

## 🐛 Known Issues & Limitations

### Current Limitations (Backend Phase 1)
1. **Generate from RBA**: Backend method exists but may not fully copy all data yet
2. **Detail tables CRUD**: No dedicated endpoints for DPABelanja, DPAPendapatan, DPAPembiayaan yet
3. **File upload**: SK file & DPA PDF upload not implemented yet
4. **PDF generation**: No PDF generation for official DPA document yet

### Frontend Limitations (Planned)
1. **Tree table**: May be complex to implement, can use flat table initially
2. **Charts**: Can use simple tables first, add charts later
3. **Excel export**: Can be added in Phase 2
4. **Mobile view**: Desktop-first, mobile can be limited

### Workarounds
1. For detail tables: Display readonly data from main DPA entity for now
2. For generate from RBA: May need manual data entry initially
3. For charts: Use simple stat cards with numbers

---

## 💡 Future Enhancements (Post-MVP)

### Phase 2 Features
1. **DPA Belanja Detail CRUD**: Add/edit/delete individual belanja items
2. **DPA Pendapatan Detail CRUD**: Add/edit/delete pendapatan items
3. **DPA Pembiayaan Detail CRUD**: Add/edit/delete pembiayaan items
4. **Bulk Import**: Import belanja from Excel
5. **Template System**: Save DPA as template for next year

### Phase 3 Features
6. **Budget Control**: Real-time budget check when creating SPP
7. **Auto-update Realisasi**: Listen to SP2D events, update realisasi
8. **Komitmen Tracking**: Link with Kontrak module
9. **Alert System**: Notify when approaching budget limit (90%)
10. **Comparison Reports**: Compare DPA across years

### Phase 4 Features
11. **PDF Generation**: Official DPA document with government format
12. **Digital Signature**: E-sign for approval workflow
13. **Mobile App**: View DPA on mobile (readonly)
14. **API for PPKD Integration**: Push DPA data to PPKD system
15. **Advanced Analytics**: Budget utilization trends, forecasting

---

## 🎯 Acceptance Criteria

### Module is considered COMPLETE when:

#### Functional Requirements
- [x] User can view list of DPA with filters (tahun, status, jenis)
- [x] User can search DPA by nomor
- [x] User can view DPA detail with all information
- [x] User can create DPA manually
- [x] User can generate DPA from approved RBA (if backend ready)
- [x] User can edit DPA (only DRAFT status)
- [x] User can delete DPA (only DRAFT status)
- [x] User can submit DPA for approval
- [x] PPKD can approve DPA with optional notes & SK info
- [x] PPKD can reject DPA with required reason
- [x] User can activate APPROVED DPA (make it active)
- [x] User can create DPPA (revision) from ACTIVE DPA
- [x] User can view audit trail/history of DPA
- [x] System enforces workflow rules (status transitions)
- [x] System shows proper error messages for invalid actions

#### UI/UX Requirements
- [x] Responsive layout (desktop & tablet)
- [x] Loading states for all async operations
- [x] Error states with user-friendly messages
- [x] Empty states (no data found)
- [x] Success toast notifications
- [x] Status badges with correct colors
- [x] Proper form validation with inline errors
- [x] Confirmation dialogs for destructive actions
- [x] Breadcrumb navigation
- [x] Accessible UI (keyboard navigation, ARIA labels)

#### Technical Requirements
- [x] TypeScript strict mode (no `any`)
- [x] All API calls using React Query
- [x] Proper error handling
- [x] Code follows project conventions
- [x] Components are reusable
- [x] No console errors
- [x] No memory leaks
- [x] Unit tests for critical functions (optional but recommended)

#### Integration Requirements
- [x] API integration working with backend
- [x] Authentication working (JWT)
- [x] Authorization working (role-based)
- [x] Sidebar menu updated
- [x] Routes registered
- [x] MODULE_INDEX.md updated

---

## 👥 Team & Responsibilities

### Frontend Developer
- Implement all UI components
- Integrate with backend API
- Write unit tests
- Code review

### Backend Developer (Support)
- Provide API documentation
- Fix backend bugs if found
- Add missing endpoints if needed

### QA Tester
- Manual testing
- Write test cases
- Report bugs

### Product Owner
- Define acceptance criteria
- Review UI/UX
- User acceptance testing

---

## 📞 Support & Communication

### Daily Standup
- Progress update
- Blockers discussion
- Next steps planning

### Code Review Process
1. Create PR with description
2. Tag reviewers
3. Address comments
4. Merge after approval

### Issue Tracking
- Use GitHub Issues / Jira
- Tag: `module:dpa`, `frontend`
- Priority labels: P0, P1, P2

### Documentation
- Inline code comments
- JSDoc for complex functions
- README updates
- Changelog updates

---

## 🎉 Summary

**Modul DPA/DPPA** adalah modul kritis yang menjadi **jembatan antara perencanaan dan pelaksanaan anggaran**.

**Good news**: Backend sudah 100% siap, tinggal implementasi frontend.

**Estimated effort**: 5-7 hari kerja untuk 1 frontend developer

**Priority**: P0 (harus selesai sebelum modul Belanja: SPP/SPM/SP2D)

**Next module after DPA**: Bukti Bayar (Module #17) - sudah ada backend juga!

---

**Let's build this! 🚀**

**Questions?** Contact the team or refer to:
- Backend README: `/backend/src/modules/dpa/README.md`
- API Docs: `http://localhost:3000/api/docs`
- Masterplan: `/docs/SIKANCIL_MASTERPLAN_v2_FINAL.md`

---

**Document Version**: 1.0
**Last Updated**: 15 Februari 2026
**Author**: Si-Kancil Development Team
**Status**: ✅ Ready for Implementation
