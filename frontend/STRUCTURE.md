# Frontend Structure Documentation

## 📂 Directory Structure Detail

```
frontend/
├── public/                     # Static files served directly
│   └── vite.svg               # Favicon
│
├── src/
│   ├── assets/                # Static assets
│   │   ├── images/           # Image files
│   │   ├── fonts/            # Custom fonts
│   │   └── icons/            # Icon files
│   │
│   ├── components/           # Reusable components
│   │   ├── ui/              # Base UI components (8 created)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Alert.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── layout/          # Layout components (3 created)
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── shared/          # Shared business components
│   │       ├── DataTable.tsx
│   │       ├── FormField.tsx
│   │       ├── PageHeader.tsx
│   │       └── EmptyState.tsx
│   │
│   ├── features/            # Feature-based modules (48 modules)
│   │   │
│   │   ├── dashboard/       # ✅ Dashboard module (IMPLEMENTED)
│   │   │   ├── index.ts
│   │   │   └── Dashboard.tsx
│   │   │
│   │   ├── program-rba/     # ✅ Program RBA module (IMPLEMENTED)
│   │   │   ├── index.ts
│   │   │   ├── types.ts
│   │   │   ├── api.ts
│   │   │   └── ProgramRBA.tsx
│   │   │
│   │   ├── kegiatan-rba/    # ⏳ Kegiatan RBA (TO BE IMPLEMENTED)
│   │   ├── output-rba/      # ⏳ Output RBA (TO BE IMPLEMENTED)
│   │   ├── anggaran-kas/    # ⏳ Anggaran Kas (TO BE IMPLEMENTED)
│   │   ├── revisi-rba/      # ⏳ Revisi RBA (TO BE IMPLEMENTED)
│   │   │
│   │   ├── pendapatan-operasional/  # ⏳ Pendapatan Operasional
│   │   ├── penerimaan-apbd/         # ⏳ Penerimaan APBD
│   │   ├── hibah/                   # ⏳ Hibah
│   │   ├── piutang/                 # ⏳ Piutang
│   │   ├── simrs-integration/       # ⏳ SIMRS Integration
│   │   │
│   │   ├── spp/             # ⏳ SPP (4 jenis)
│   │   ├── spm/             # ⏳ SPM
│   │   ├── sp2d/            # ⏳ SP2D
│   │   ├── dpa/             # ⏳ DPA/DPPA
│   │   ├── realisasi-belanja/  # ⏳ Realisasi Belanja
│   │   ├── pajak/           # ⏳ Pajak
│   │   │
│   │   ├── bku-penerimaan/  # ⏳ BKU Penerimaan
│   │   ├── bku-pengeluaran/ # ⏳ BKU Pengeluaran
│   │   ├── buku-pembantu/   # ⏳ Buku Pembantu
│   │   ├── spj-up/          # ⏳ SPJ UP
│   │   ├── spj-gu/          # ⏳ SPJ GU
│   │   ├── spj-tu/          # ⏳ SPJ TU
│   │   ├── sts/             # ⏳ STS
│   │   ├── penutupan-kas/   # ⏳ Penutupan Kas
│   │   │
│   │   ├── jurnal/          # ⏳ Jurnal
│   │   ├── buku-besar/      # ⏳ Buku Besar
│   │   ├── neraca-saldo/    # ⏳ Neraca Saldo
│   │   │
│   │   ├── lra/             # ⏳ LRA
│   │   ├── lpsal/           # ⏳ LPSAL
│   │   ├── neraca/          # ⏳ Neraca
│   │   ├── laporan-operasional/         # ⏳ Laporan Operasional
│   │   ├── laporan-arus-kas/            # ⏳ Laporan Arus Kas
│   │   ├── laporan-perubahan-ekuitas/   # ⏳ Laporan Perubahan Ekuitas
│   │   ├── calk/            # ⏳ CaLK
│   │   │
│   │   ├── laporan-pendapatan-blud/     # ⏳ Laporan Pendapatan BLUD
│   │   ├── laporan-pengeluaran-blud/    # ⏳ Laporan Pengeluaran BLUD
│   │   ├── spj-fungsional/              # ⏳ SPJ Fungsional
│   │   │
│   │   ├── aset/            # ⏳ Aset
│   │   ├── gaji/            # ⏳ Gaji & Honorarium
│   │   ├── kontrak/         # ⏳ Kontrak
│   │   ├── workflow/        # ⏳ Workflow
│   │   ├── notifications/   # ⏳ Notifications
│   │   ├── audit-trail/     # ⏳ Audit Trail
│   │   └── settings/        # ⏳ Settings
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useMediaQuery.ts
│   │   └── usePagination.ts
│   │
│   ├── lib/                # Utilities & helpers
│   │   ├── utils.ts        # ✅ Utility functions
│   │   ├── api-client.ts   # ✅ Axios instance & interceptors
│   │   ├── query-client.ts # ✅ React Query configuration
│   │   └── index.ts        # ✅ Barrel export
│   │
│   ├── routes/             # Routing configuration
│   │   └── index.tsx       # ✅ Route definitions (48 routes)
│   │
│   ├── stores/             # Zustand state management
│   │   ├── auth.store.ts   # ✅ Authentication state
│   │   ├── app.store.ts    # ✅ App-level state
│   │   └── index.ts        # ✅ Barrel export
│   │
│   ├── types/              # TypeScript types
│   │   ├── common.ts       # ✅ Common types
│   │   └── index.ts        # ✅ Barrel export
│   │
│   ├── App.tsx             # ✅ Main App component
│   ├── main.tsx            # ✅ Entry point
│   └── index.css           # ✅ Global styles
│
├── .env.example            # ✅ Environment variables template
├── .eslintrc.cjs           # ✅ ESLint configuration
├── .gitignore              # ✅ Git ignore rules
├── index.html              # ✅ HTML template
├── package.json            # ✅ Dependencies
├── postcss.config.js       # ✅ PostCSS configuration
├── tailwind.config.js      # ✅ Tailwind CSS configuration
├── tsconfig.json           # ✅ TypeScript configuration
├── tsconfig.node.json      # ✅ TypeScript Node configuration
├── vite.config.ts          # ✅ Vite configuration
├── README.md               # ✅ Project documentation
└── STRUCTURE.md            # ✅ This file
```

## 📊 Module Implementation Status

### ✅ Completed (3/48 modules)
1. Dashboard - Main dashboard dengan statistik
2. Program RBA - Full CRUD dengan React Query
3. Layout - Sidebar, Header, MainLayout

### ⏳ To Be Implemented (45/48 modules)

**Priority P0 (High) - 15 modules**
- Kegiatan RBA
- Output RBA
- Anggaran Kas
- Pendapatan Operasional
- SPP (4 jenis: UP/GU/TU/LS)
- SPM
- SP2D
- BKU Penerimaan
- BKU Pengeluaran
- Jurnal
- LRA
- LPSAL
- Neraca
- Auth
- Users

**Priority P1 (Medium) - 20 modules**
- Revisi RBA
- Penerimaan APBD
- Hibah
- Piutang
- DPA/DPPA
- Realisasi Belanja
- Pajak
- Buku Pembantu
- SPJ UP/GU/TU
- STS
- Penutupan Kas
- Buku Besar
- Neraca Saldo
- Laporan Operasional
- Laporan Arus Kas
- Laporan Perubahan Ekuitas
- CaLK
- Laporan Pendapatan BLUD
- Laporan Pengeluaran BLUD
- SPJ Fungsional

**Priority P2 (Low) - 10 modules**
- SIMRS Integration
- Aset
- Gaji
- Kontrak
- Workflow
- Notifications
- Audit Trail
- Settings
- Master Data modules

## 🎯 Standard Module Template

Setiap modul harus mengikuti struktur ini:

```typescript
// features/module-name/index.ts
export { default as ModuleName } from './ModuleName';
export * from './types';
export * from './api';

// features/module-name/types.ts
export interface Entity {
  id: string;
  // ... fields
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityDto {
  // ... create fields
}

export interface UpdateEntityDto extends Partial<CreateEntityDto> {}

// features/module-name/api.ts
import { apiClient } from '@/lib/api-client';
import type { Entity, CreateEntityDto, UpdateEntityDto } from './types';

export const entityApi = {
  getAll: async () => {
    const response = await apiClient.get<Entity[]>('/endpoint');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Entity>(`/endpoint/${id}`);
    return response.data;
  },

  create: async (data: CreateEntityDto) => {
    const response = await apiClient.post<Entity>('/endpoint', data);
    return response.data;
  },

  update: async (id: string, data: UpdateEntityDto) => {
    const response = await apiClient.patch<Entity>(`/endpoint/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/endpoint/${id}`);
  },
};

// features/module-name/ModuleName.tsx
import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, Button, Table } from '@/components/ui';
import { entityApi } from './api';

export default function ModuleName() {
  const { data, isLoading } = useQuery({
    queryKey: ['entity'],
    queryFn: entityApi.getAll,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Module Name</h1>
          <p className="text-gray-600">Description</p>
        </div>
        <Button>Add New</Button>
      </div>

      <Card>
        {/* Content */}
      </Card>
    </div>
  );
}
```

## 🔧 Development Guidelines

### Naming Conventions
- **Components**: PascalCase (e.g., `ProgramRBA.tsx`)
- **Files**: kebab-case (e.g., `api-client.ts`)
- **Types**: PascalCase with suffix (e.g., `CreateProgramRBADto`)
- **Functions**: camelCase (e.g., `getProgramRBA`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Component Guidelines
1. Use functional components with hooks
2. Use TypeScript for type safety
3. Extract reusable logic to custom hooks
4. Keep components small and focused
5. Use composition over inheritance

### State Management
- **Local state**: useState for component-specific state
- **Form state**: React Hook Form
- **Server state**: React Query
- **Global state**: Zustand stores

### Styling
- Use Tailwind CSS utility classes
- Use `cn()` helper for conditional classes
- Follow responsive design patterns
- Use consistent spacing and colors

## 📈 Progress Tracking

**Total Files Created**: ~50 files
- Configuration files: 8
- UI Components: 8
- Layout components: 3
- Utilities: 5
- Stores: 2
- Routes: 1
- Feature modules: 2 (implemented)
- Feature module folders: 48 (created, 46 pending implementation)

**Estimated Remaining Work**:
- ~450 files to be created for all feature modules
- ~200 API endpoints to be integrated
- ~100 forms to be implemented
- ~50 tables/lists to be created
- ~20 charts/visualizations

## 🚀 Next Steps

1. **Implement P0 modules** (15 modules)
   - Start with Auth & Users
   - Then RBA modules
   - Then Belanja modules (SPP/SPM/SP2D)

2. **Setup development environment**
   - Run `pnpm install`
   - Copy `.env.example` to `.env`
   - Start dev server: `pnpm dev`

3. **Backend integration**
   - Verify API endpoints
   - Test authentication flow
   - Sync data models with backend

4. **Team collaboration**
   - Assign modules to developers
   - Setup code review process
   - Regular sync meetings

---

**Last Updated**: 2026-02-15
**Status**: Skeleton Complete ✅
**Coverage**: 3/48 modules implemented (6.25%)
