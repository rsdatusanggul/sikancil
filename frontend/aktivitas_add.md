# Rencana Implementasi: Menu Aktivitas di Perencanaan & RBA

## Context

User meminta penambahan menu "Aktivitas" di bawah menu "Perencanaan & RBA" pada sidebar. **Aktivitas = Sub Output RBA** (Level 4 dalam hierarki perencanaan), yaitu turunan dari Subkegiatan. Dari daftar Aktivitas, user bisa mengelola Kode Belanja (Anggaran Belanja RBA).

**Hierarki RBA yang diperbarui:**
```
Program RBA (L1) → Kegiatan RBA (L2) → Sub Kegiatan RBA (L3) → Aktivitas (L4 = SubOutputRBA) → Kode Belanja (AnggaranBelanjaRBA)
```

**Kondisi saat ini:**
- Backend `SubOutputRBA` dan `AnggaranBelanjaRBA` sudah ada dengan full CRUD
- Frontend **tidak punya** feature directory untuk sub-output-rba atau aktivitas
- Sidebar dan routes belum punya entri untuk Aktivitas
- SubKegiatanRBADetail tidak menampilkan sub-item Aktivitas

## Scope of Changes

### Backend (TIDAK ADA PERUBAHAN DIPERLUKAN)
- `/sub-output-rba` — sudah ada full CRUD di `SubOutputRbaModule`
- `/anggaran-belanja-rba` — sudah ada full CRUD di `AnggaranBelanjaRbaModule`

### Frontend (SEMUA PERUBAHAN DI SINI)

---

## File yang Dimodifikasi

### 1. Sidebar
**File:** `frontend/src/components/layout/Sidebar.tsx`

Tambahkan entri "Aktivitas" di grup "Perencanaan & RBA", setelah "Sub Kegiatan RBA":
```typescript
{ title: 'Aktivitas', href: '/aktivitas-rba', icon: FileText },
```

### 2. Router
**File:** `frontend/src/routes/index.tsx`

Tambahkan 2 route baru di section Perencanaan & RBA:
```typescript
{ path: '/aktivitas-rba', element: <AktivitasRBA /> },
{ path: '/aktivitas-rba/:id', element: <AktivitasRBADetail /> },
```

Import lazy-loaded components mengikuti pola yang sudah ada.

### 3. SubKegiatanRBADetail
**File:** `frontend/src/features/subkegiatan-rba/SubKegiatanRBADetail.tsx`

Tambahkan section inline "Aktivitas" di bawah info card (mengikuti pola `KegiatanRBADetail.tsx` yang sudah menampilkan SubKegiatan inline):
- Fetch `GET /sub-output-rba?subKegiatanId={id}` untuk list Aktivitas milik Subkegiatan ini
- Tampilkan dalam tabel: kode, nama, volume+satuan, totalPagu, actions (View → `/aktivitas-rba/:id`)
- Tombol "Tambah Aktivitas" yang membuka `AktivitasRBAForm` modal (pre-filled `subKegiatanId`)

---

## File Baru yang Dibuat

### 4. `frontend/src/features/aktivitas-rba/types.ts`
Interface `AktivitasRBA` (wrapper alias untuk SubOutputRBA):
```typescript
interface AktivitasRBA {
  id: string;
  kodeSubOutput: string;        // kode aktivitas e.g. "01.01.001.01"
  namaSubOutput: string;        // nama aktivitas
  subKegiatanId: string;
  subKegiatan?: SubKegiatanRBA; // parent relation
  volumeTarget: number;
  satuan: string;
  totalPagu: number;
  tahun: number;
  isActive: boolean;
  anggaranBelanja?: KodeBelanja[];
}
// DTOs: CreateAktivitasRBADto, UpdateAktivitasRBADto, QueryAktivitasRBAParams
```

### 5. `frontend/src/features/aktivitas-rba/api.ts`
Memanggil endpoint `/sub-output-rba`:
- `getAll(params)` — list dengan filter
- `getBySubKegiatan(subKegiatanId)` — child fetch dari SubKegiatanRBADetail
- `getById(id)`
- `create(dto)`, `update(id, dto)`, `remove(id)`
- `getAvailableYears()`

Dan endpoint `/anggaran-belanja-rba`:
- `getKodeBelanja(subOutputId)` — fetch kode belanja milik aktivitas ini
- `createKodeBelanja(dto)`, `updateKodeBelanja(id, dto)`, `removeKodeBelanja(id)`

### 6. `frontend/src/features/aktivitas-rba/AktivitasRBA.tsx` (List Page)
Mirip `SubKegiatanRBA.tsx`:
- Filter: tahun, subKegiatanId (dropdown), search
- Tabel: kode, nama, subkegiatan parent, volume+satuan, totalPagu, tahun, status
- Actions: View (→ `/aktivitas-rba/:id`), Edit, Delete
- Tombol "Tambah Aktivitas" buka `AktivitasRBAForm` modal

### 7. `frontend/src/features/aktivitas-rba/AktivitasRBADetail.tsx` (Detail Page)
Mirip `SubKegiatanRBADetail.tsx` dengan tambahan section Kode Belanja:
- Card "Informasi Aktivitas": kode, nama, subkegiatan parent (link), volume+satuan, totalPagu, tahun
- Section "Kode Belanja" (inline table):
  - Fetch `/anggaran-belanja-rba?subOutputId={id}`
  - Kolom: kodeRekening, namaRekening, jenisBelanja, sumberDana, pagu, rincian bulanan
  - Actions: Edit, Delete per baris
  - Tombol "Tambah Kode Belanja" buka `KodeBelanjaForm` modal
  - Reuse `AddAccountCodeModal` dari `frontend/src/features/rak/components/RakForm/AddAccountCodeModal.tsx` untuk pilih kode rekening

### 8. `frontend/src/features/aktivitas-rba/AktivitasRBAForm.tsx` (Modal Form)
Mirip `SubKegiatanRBAForm.tsx`:
- Field: kodeSubOutput, namaSubOutput, subKegiatanId (dropdown filter by tahun), tahun, volumeTarget+satuan (reuse `VolumeTargetInput`), deskripsi
- Validasi: kode belum dipakai di tahun yang sama

### 9. `frontend/src/features/aktivitas-rba/components/KodeBelanjaForm.tsx`
Modal form untuk create/edit AnggaranBelanjaRBA dari dalam AktivitasRBADetail:
- Pilih kodeRekening via `AddAccountCodeModal` (reuse dari RAK)
- Field: jenisBelanja (OPERASIONAL/MODAL), kategori, sumberDana (APBD/FUNGSIONAL/HIBAH), pagu
- Rincian bulanan (januari-desember) — 12 input angka
- Auto-calculate total dari rincian bulanan

### 10. `frontend/src/features/aktivitas-rba/index.ts`
Barrel export semua komponen.

---

## Komponen yang Direuse (Tanpa Modifikasi)

| Komponen | Lokasi | Dipakai di |
|---|---|---|
| `TimelineInput` | `subkegiatan-rba/components/TimelineInput.tsx` | AktivitasRBAForm (opsional) |
| `VolumeTargetInput` | `subkegiatan-rba/components/VolumeTargetInput.tsx` | AktivitasRBAForm |
| `AddAccountCodeModal` | `rak/components/RakForm/AddAccountCodeModal.tsx` | KodeBelanjaForm |
| `useDetailAccounts` | `chart-of-accounts/hooks.ts` | KodeBelanjaForm |

---

## Urutan Implementasi

1. **types.ts** — definisi interface dan DTOs
2. **api.ts** — fungsi API client
3. **AktivitasRBAForm.tsx** — modal form (dibutuhkan oleh list dan detail)
4. **KodeBelanjaForm.tsx** — modal form kode belanja
5. **AktivitasRBA.tsx** — list page
6. **AktivitasRBADetail.tsx** — detail page dengan section kode belanja
7. **index.ts** — barrel exports
8. **routes/index.tsx** — tambah routes
9. **Sidebar.tsx** — tambah menu item
10. **SubKegiatanRBADetail.tsx** — tambah inline aktivitas section

---

## Verifikasi

1. Buka sidebar → grup "Perencanaan & RBA" → pastikan muncul menu "Aktivitas"
2. Klik menu Aktivitas → `/aktivitas-rba` → tampil list dengan filter tahun/subkegiatan/search
3. Buat Aktivitas baru → pilih Subkegiatan parent → isi kode, nama, volume → Save
4. Klik View → `/aktivitas-rba/:id` → tampil detail + section Kode Belanja (awalnya kosong)
5. Tambah Kode Belanja → pilih kode rekening via modal → isi pagu + rincian bulanan → Save
6. Buka SubKegiatanRBADetail → tampil section Aktivitas inline dengan list + tombol Tambah
7. Klik aktivitas dari SubKegiatanRBADetail → navigasi ke `/aktivitas-rba/:id`
