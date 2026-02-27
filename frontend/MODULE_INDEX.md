# Module Index - Si-Kancil Frontend

Quick reference untuk semua modul frontend yang tersedia.

## 📊 Statistics
- **Total Modules**: 50
- **Implemented**: 11 (22%)
- **Pending**: 39 (78%)
- **Backend Ready**: 11 (DPA & Bukti Bayar!)
- **UI Components**: 8
- **Layout Components**: 3

---

## 📂 Module List

### ✅ IMPLEMENTED

| # | Module | Path | Status | Priority | Notes |
|---|--------|------|--------|----------|-------|
| 1 | Dashboard | `/dashboard` | ✅ Complete | P0 | Main dashboard with stats |
| 2 | Program RBA | `/program-rba` | ✅ Complete | P0 | Full CRUD implementation |
| 3 | Users | `/users` | ✅ Complete | P0 | User management with RBAC |
| 4 | Auth | `/auth` | ✅ Complete | P0 | Login, logout, auth state |
| 5 | Roles & Permissions | `/roles` | ✅ Complete | P0 | Role management & permission matrix |
| 6 | Master Data | `/master-data` | ✅ Complete | P0 | Hub for 6 master data modules |
| 7 | Kegiatan RBA | `/kegiatan-rba` | ✅ Complete | P0 | RBA activities with indicators |
| 8 | Output RBA | `/output-rba` | ✅ Complete | P0 | RBA outputs with volume & pagu |
| 9 | Anggaran Kas | `/anggaran-kas` | ✅ Complete | P0 | Cash budget with 12-month projection |
| 10 | Revisi RBA | `/revisi-rba` | ✅ Complete | P0 | RBA revision workflow with approval |
| 11 | DPA/DPPA | `/dpa` | ✅ Complete | P0 | Budget execution document with approval workflow |

---

### ⏳ READY FOR IMPLEMENTATION

#### 🔐 Core Modules (Priority P0)

All core modules completed! ✅

#### 📋 Perencanaan & RBA (Priority P0)

All modules completed! ✅

#### 💰 Pendapatan (Priority P0)

| # | Module | Path | Backend API | Description |
|---|--------|------|-------------|-------------|
| 12 | Pendapatan Operasional | `/pendapatan-operasional` | `/pendapatan-operasional` | Operational revenue |
| 13 | Penerimaan APBD | `/penerimaan-apbd` | `/penerimaan-apbd` | APBD receipt tracking |
| 14 | Hibah | `/hibah` | `/hibah` | Grant management |
| 15 | Piutang | `/piutang` | `/piutang` | Receivables tracking |
| 16 | SIMRS Integration | `/simrs-integration` | `/simrs-integration` | Hospital system sync |

#### 🛒 Belanja (Priority P0)

**Workflow**: Anggaran Kas → **Bukti Bayar** → SPP → SPM → SP2D

| # | Module | Path | Backend API | Description |
|---|--------|------|-------------|-------------|
| 17 | **Bukti Bayar** | `/bukti-bayar` | ✅ `/bukti-bayar` | **Payment proof based on cash budget** |
| 18 | SPP | `/spp` | `/spp` | Payment request (UP/GU/TU/LS) |
| 19 | SPM | `/spm` | `/spm` | Payment order |
| 20 | SP2D | `/sp2d` | `/sp2d` | Fund disbursement order |
| 21 | Realisasi Belanja | `/realisasi-belanja` | `/realisasi-belanja` | Expenditure realization |
| 22 | Pajak | `/pajak` | `/pajak` | Tax management |

#### 📖 Penatausahaan (Priority P1)

| # | Module | Path | Backend API | Description |
|---|--------|------|-------------|-------------|
| 22 | BKU Penerimaan | `/bku-penerimaan` | `/bku` | Cash receipt book |
| 23 | BKU Pengeluaran | `/bku-pengeluaran` | `/bku` | Cash disbursement book |
| 24 | Buku Pembantu | `/buku-pembantu` | `/buku-pembantu` | Subsidiary ledgers (9 types) |
| 25 | SPJ UP | `/spj-up` | `/spj-up` | UP accountability |
| 26 | SPJ GU | `/spj-gu` | `/spj-gu` | GU accountability |
| 27 | SPJ TU | `/spj-tu` | `/spj-tu` | TU accountability |
| 28 | STS | `/sts` | `/sts` | Deposit slip |
| 29 | Penutupan Kas | `/penutupan-kas` | `/penutupan-kas` | Cash closing report |

#### 📊 Akuntansi (Priority P1)

| # | Module | Path | Backend API | Description |
|---|--------|------|-------------|-------------|
| 30 | Jurnal | `/jurnal` | `/jurnal` | Journal entries |
| 31 | Buku Besar | `/buku-besar` | `/buku-besar` | General ledger |
| 32 | Neraca Saldo | `/neraca-saldo` | `/neraca-saldo` | Trial balance |

#### 📈 Laporan Keuangan (Priority P1)

| # | Module | Path | Backend API | Description |
|---|--------|------|-------------|-------------|
| 33 | LRA | `/lra` | `/lra` | Budget realization report |
| 34 | LPSAL | `/lpsal` | `/lpsal` | SAL changes report |
| 35 | Neraca | `/neraca` | `/neraca` | Balance sheet |
| 36 | Laporan Operasional | `/laporan-operasional` | `/laporan-operasional` | Operating statement |
| 37 | Laporan Arus Kas | `/laporan-arus-kas` | `/laporan-arus-kas` | Cash flow statement |
| 38 | Laporan Perubahan Ekuitas | `/laporan-perubahan-ekuitas` | `/laporan-perubahan-ekuitas` | Equity changes |
| 39 | CaLK | `/calk` | `/calk` | Notes to financial statements |

#### 📑 Laporan Penatausahaan (Priority P1)

| # | Module | Path | Backend API | Description |
|---|--------|------|-------------|-------------|
| 40 | Laporan Pendapatan BLUD | `/laporan-pendapatan-blud` | `/laporan-pendapatan-blud` | BLUD revenue report |
| 41 | Laporan Pengeluaran BLUD | `/laporan-pengeluaran-blud` | `/laporan-pengeluaran-blud` | BLUD expenditure report |
| 42 | SPJ Fungsional | `/spj-fungsional` | `/spj-fungsional` | Functional accountability |

#### 🏗️ Supporting Modules (Priority P2)

| # | Module | Path | Backend API | Description |
|---|--------|------|-------------|-------------|
| 43 | Aset | `/aset` | `/aset` | Fixed assets (KIB A-F) |
| 44 | Gaji | `/gaji` | `/gaji` | Payroll & honorarium |
| 45 | Kontrak | `/kontrak` | `/kontrak` | Contract management |
| 46 | Workflow | `/workflow` | `/workflow` | Approval workflow |
| 47 | Notifications | `/notifications` | `/notifications` | Notification center |
| 48 | Audit Trail | `/audit-trail` | `/audit-trail` | System audit logs |
| 49 | Settings | `/settings` | `/settings` | System settings |

---

## 🗂️ Master Data Modules

| Module | Path | Backend API | Description |
|--------|------|-------------|-------------|
| Chart of Accounts | `/chart-of-accounts` | `/chart-of-accounts` | Account structure |
| Unit Kerja | `/unit-kerja` | `/unit-kerja` | Work units |
| Pegawai | `/pegawai` | `/pegawai` | Employee data |
| Supplier | `/supplier` | `/supplier` | Supplier/vendor data |
| Bank Account | `/bank-account` | `/bank-account` | Bank accounts |

---

## 🎨 UI Components

| Component | File | Description |
|-----------|------|-------------|
| Button | `ui/Button.tsx` | Multi-variant button |
| Input | `ui/Input.tsx` | Form input with validation |
| Select | `ui/Select.tsx` | Dropdown select |
| Card | `ui/Card.tsx` | Container card |
| Table | `ui/Table.tsx` | Data table |
| Badge | `ui/Badge.tsx` | Status badge |
| Modal | `ui/Modal.tsx` | Dialog modal |
| Alert | `ui/Alert.tsx` | Alert notification |

---

## 🏗️ Layout Components

| Component | File | Description |
|-----------|------|-------------|
| Sidebar | `layout/Sidebar.tsx` | Navigation sidebar (48 menu items) |
| Header | `layout/Header.tsx` | Top header bar |
| MainLayout | `layout/MainLayout.tsx` | Main app layout wrapper |

---

## 🔧 Utilities

| Utility | File | Description |
|---------|------|-------------|
| API Client | `lib/api-client.ts` | Axios instance with auth |
| Query Client | `lib/query-client.ts` | React Query config |
| Utils | `lib/utils.ts` | Helper functions |

---

## 💾 Stores

| Store | File | Description |
|-------|------|-------------|
| Auth Store | `stores/auth.store.ts` | Authentication state |
| App Store | `stores/app.store.ts` | Application state |

---

## 📝 Development Workflow

### 1. Pick a Module
Choose from the table above based on priority (P0 > P1 > P2)

### 2. Generate Skeleton
```bash
./scripts/generate-module.sh <module-name> <EntityName>
```

### 3. Implement Module
1. Update `types.ts` with actual data structure
2. Update `api.ts` with correct endpoints
3. Build UI in main component
4. Add forms, tables, charts as needed
5. Test with backend API

### 4. Add Route
Update `src/routes/index.tsx` to replace UnderDevelopment component

### 5. Update Sidebar
Verify menu item exists in `src/components/layout/Sidebar.tsx`

### 6. Test & Review
1. Test CRUD operations
2. Test validation
3. Test error handling
4. Code review
5. Merge to develop

---

## 📚 Resources

- **Backend API**: http://localhost:3000/api
- **API Docs**: http://localhost:3000/api/docs
- **Masterplan**: `/opt/sikancil/docs/SIKANCIL_MASTERPLAN_v2_FINAL.md`
- **Backend Modules**: `/opt/sikancil/backend/src/modules/`

---

## 🎯 Implementation Checklist

For each module, ensure:
- [ ] Types defined in `types.ts`
- [ ] API functions in `api.ts`
- [ ] Main component with CRUD UI
- [ ] Form component (create/edit)
- [ ] Table/List component
- [ ] Detail view component
- [ ] React Query hooks
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Validation (client-side)
- [ ] Route added
- [ ] Menu item exists
- [ ] Backend integration tested

---

## 📦 Module Detail: Bukti Bayar

### Overview
Bukti Bayar adalah dokumen pembayaran yang dibuat berdasarkan **saldo anggaran kas**. Modul ini menjadi gatekeeper untuk mencegah pembayaran yang melebihi anggaran kas yang tersedia.

### Key Features
- ✅ **Validasi Saldo Otomatis**: Sistem otomatis mengecek saldo anggaran kas sebelum membuat bukti bayar
- ✅ **Workflow Approval**: DRAFT → SUBMITTED → VERIFIED → APPROVED → USED
- ✅ **Jenis Belanja**: PEGAWAI, BARANG_JASA, MODAL, LAIN
- ✅ **Cek Sisa Saldo**: Endpoint khusus untuk cek sisa saldo per jenis belanja
- ✅ **Integrasi dengan SPP**: Bukti bayar yang approved bisa digunakan untuk membuat SPP

### Business Rules
1. **Tidak bisa membuat bukti bayar jika saldo anggaran kas habis**
2. **Validasi per jenis belanja** (Pegawai, Barang/Jasa, Modal, Lain)
3. **Hanya status DRAFT & REJECTED yang bisa diedit/dihapus**
4. **Status APPROVED bisa digunakan untuk membuat SPP**

### Backend API Endpoints
```
POST   /bukti-bayar                    - Create new bukti bayar
GET    /bukti-bayar                    - List with filters
GET    /bukti-bayar/:id                - Get detail
PUT    /bukti-bayar/:id                - Update (DRAFT/REJECTED only)
DELETE /bukti-bayar/:id                - Delete (DRAFT/REJECTED only)
POST   /bukti-bayar/:id/submit         - Submit for verification
POST   /bukti-bayar/:id/verify         - Verify
POST   /bukti-bayar/:id/approve        - Approve
POST   /bukti-bayar/:id/reject         - Reject
GET    /bukti-bayar/:anggaranKasId/sisa-saldo/:jenisBelanja - Check balance
```

### Database Schema
- **Table**: `bukti_bayar`
- **Relations**:
  - `anggaran_kas` (Many-to-One) - Source of funds
  - `spp` (One-to-Many) - Can be used by multiple SPP

### Status Flow
```
DRAFT → SUBMITTED → VERIFIED → APPROVED → USED
   ↓                   ↓
REJECTED ←────────────┘
```

### Filter Options
- `tahunAnggaran` - Filter by fiscal year
- `bulan` - Filter by month (1-12)
- `status` - Filter by status
- `jenisBelanja` - Filter by expenditure type
- `anggaranKasId` - Filter by cash budget ID

### Implementation Files (Backend)
- Entity: `/backend/src/database/entities/bukti-bayar.entity.ts`
- Service: `/backend/src/modules/bukti-bayar/bukti-bayar.service.ts`
- Controller: `/backend/src/modules/bukti-bayar/bukti-bayar.controller.ts`
- Migration: `/backend/src/database/migrations/1771142123000-CreateBuktiBayarModule.ts`

### Frontend Implementation Checklist
- [ ] Create types in `src/modules/bukti-bayar/types.ts`
- [ ] Implement API client in `src/modules/bukti-bayar/api.ts`
- [ ] Build main list view with filters
- [ ] Create form component with validation
- [ ] Add saldo checker component
- [ ] Implement approval workflow UI
- [ ] Add status badges
- [ ] Test integration with Anggaran Kas
- [ ] Add route to router
- [ ] Update sidebar menu

---

**Last Updated**: 2026-02-15
**Maintained By**: Frontend Team
