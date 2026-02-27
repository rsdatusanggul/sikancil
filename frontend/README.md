# Si-Kancil Frontend

Sistem Keuangan Cepat Lincah untuk BLUD - Frontend Application

## 🏗️ Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Form Handling**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, fonts, icons)
├── components/          # Reusable components
│   ├── ui/             # Base UI components (Button, Input, Table, etc)
│   ├── layout/         # Layout components (Sidebar, Header, MainLayout)
│   └── shared/         # Shared business components
├── features/            # Feature modules (48 modules)
│   ├── dashboard/
│   ├── program-rba/
│   ├── kegiatan-rba/
│   ├── pendapatan-operasional/
│   ├── spp/
│   ├── bku-penerimaan/
│   ├── jurnal/
│   ├── lra/
│   └── ... (48 total modules)
├── hooks/              # Custom React hooks
├── lib/                # Utilities, helpers, API client
├── routes/             # Route definitions
├── stores/             # Zustand state management
├── types/              # TypeScript types & interfaces
├── App.tsx             # Main App component
├── main.tsx            # Entry point
└── index.css           # Global styles
```

## 🎯 Feature Modules (48 Modules)

### Core Modules
- ✅ Dashboard
- ✅ Auth
- Users
- Roles & Permissions
- Master Data

### Perencanaan & RBA (6 modules)
- ✅ Program RBA
- Kegiatan RBA
- Output RBA
- Rencana Anggaran Kas
- Revisi RBA
- DPA/DPPA

### Pendapatan (5 modules)
- Pendapatan Operasional
- Penerimaan APBD
- Hibah
- Piutang
- SIMRS Integration

### Belanja (6 modules)
- SPP (4 jenis: UP/GU/TU/LS)
- SPM
- SP2D
- DPA
- Realisasi Belanja
- Pajak

### Penatausahaan (8 modules)
- BKU Penerimaan
- BKU Pengeluaran
- Buku Pembantu (9 jenis)
- SPJ UP
- SPJ GU
- SPJ TU
- STS
- Penutupan Kas

### Akuntansi (3 modules)
- Jurnal
- Buku Besar
- Neraca Saldo

### Laporan Keuangan (7 modules)
- LRA (Laporan Realisasi Anggaran)
- LPSAL (Laporan Perubahan SAL)
- Neraca
- Laporan Operasional
- Laporan Arus Kas
- Laporan Perubahan Ekuitas
- CaLK (Catatan atas Laporan Keuangan)

### Laporan Penatausahaan (3 modules)
- Laporan Pendapatan BLUD
- Laporan Pengeluaran BLUD
- SPJ Fungsional

### Supporting Modules (10 modules)
- Aset
- Gaji & Honorarium
- Kontrak
- Workflow
- Notifications
- Audit Trail
- Settings
- Chart of Accounts
- Unit Kerja
- Pegawai
- Supplier
- Bank Account

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Update .env with your API URL
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint
pnpm lint
```

## 📦 UI Components

Base UI components tersedia di `src/components/ui/`:

- **Button** - Tombol dengan berbagai variant (default, destructive, outline, ghost, link)
- **Input** - Input field dengan label dan error handling
- **Select** - Dropdown select dengan options
- **Card** - Container card dengan header, content, footer
- **Table** - Tabel dengan header, body, footer
- **Badge** - Label badge dengan warna variant
- **Modal** - Modal dialog
- **Alert** - Alert notification dengan variant (info, success, warning, danger)

## 🔄 State Management

### Auth Store
```typescript
import { useAuthStore } from '@/stores';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### App Store
```typescript
import { useAppStore } from '@/stores';

const { currentFiscalYear, setFiscalYear } = useAppStore();
```

## 🌐 API Client

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const response = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', data);

// PUT/PATCH request
const response = await apiClient.patch('/endpoint/:id', data);

// DELETE request
await apiClient.delete('/endpoint/:id');
```

## 📝 Feature Module Template

Setiap feature module mengikuti struktur standar:

```
features/module-name/
├── index.ts                 # Public exports
├── ModuleName.tsx           # Main component
├── types.ts                 # TypeScript interfaces
├── api.ts                   # API functions
├── components/              # Module-specific components
│   ├── ModuleForm.tsx
│   └── ModuleTable.tsx
└── hooks/                   # Module-specific hooks
    └── useModuleName.ts
```

## 🎨 Styling Guidelines

- Menggunakan Tailwind CSS untuk styling
- Utility function `cn()` untuk menggabungkan class names
- Responsive design dengan breakpoints: sm, md, lg, xl
- Color palette: blue (primary), red (danger), green (success), yellow (warning)

## 🔐 Authentication Flow

1. Login → mendapatkan `accessToken` dan `refreshToken`
2. Token disimpan di localStorage dan Zustand store
3. Setiap request menyertakan Bearer token di header
4. Auto refresh token jika 401 Unauthorized
5. Logout → hapus token dan redirect ke login

## 📊 Data Fetching dengan React Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { programRBAApi } from './api';

// Fetch data
const { data, isLoading } = useQuery({
  queryKey: ['program-rba'],
  queryFn: programRBAApi.getAll,
});

// Mutate data
const { mutate } = useMutation({
  mutationFn: programRBAApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['program-rba']);
  },
});
```

## 🧪 Testing

```bash
# Run tests (to be implemented)
pnpm test

# Run e2e tests (to be implemented)
pnpm test:e2e
```

## 📚 Documentation

- [Masterplan v2.0](/opt/sikancil/docs/SIKANCIL_MASTERPLAN_v2_FINAL.md)
- [Backend API Documentation](http://localhost:3000/api/docs)
- [Component Storybook (to be implemented)]

## 🤝 Contributing

1. Create feature branch dari `develop`
2. Implement feature sesuai modul yang ditugaskan
3. Follow coding standards dan naming conventions
4. Create Pull Request dengan deskripsi lengkap

## 📄 License

Proprietary - RSDS (Rumah Sakit Daerah Sikancil)

## 👥 Team

- Project Manager: [Name]
- Frontend Lead: [Name]
- Frontend Developers: [Names]

---

**Status**: Skeleton structure created ✅
**Next Steps**: Implementasi detail untuk setiap feature module
**Version**: 2.0.0-alpha
