# 🚀 Quick Start Guide - Si-Kancil Frontend

Panduan cepat untuk memulai development frontend Si-Kancil v2.0

---

## ✅ Prerequisites

- Node.js >= 18
- pnpm (recommended) or npm
- Git
- Code editor (VS Code recommended)

---

## 📦 Installation

```bash
# Navigate to frontend directory
cd /opt/sikancil/frontend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Update .env file
# VITE_API_URL=http://localhost:3000/api
```

---

## 🏃 Run Development Server

```bash
# Start dev server (default: http://localhost:5173)
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint code
pnpm lint
```

---

## 📁 Project Structure (Quick Overview)

```
src/
├── components/ui/          # Reusable UI components (8 components)
├── components/layout/      # Layout components (Sidebar, Header)
├── features/              # Feature modules (49 modules)
│   ├── dashboard/        # ✅ Example: Implemented
│   ├── program-rba/      # ✅ Example: Implemented
│   └── [47 modules]/     # ⏳ Pending implementation
├── lib/                  # API client, utilities
├── stores/               # Zustand state management
├── routes/               # Route configuration
└── types/                # TypeScript types
```

---

## 🎯 Quick Implementation Example

### Step 1: Generate New Module

```bash
# Generate module skeleton
./scripts/generate-module.sh kegiatan-rba KegiatanRBA

# This creates:
# - src/features/kegiatan-rba/index.ts
# - src/features/kegiatan-rba/types.ts
# - src/features/kegiatan-rba/api.ts
# - src/features/kegiatan-rba/KegiatanRBA.tsx
```

### Step 2: Define Types

Edit `src/features/kegiatan-rba/types.ts`:

```typescript
export interface KegiatanRBA {
  id: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  programId: string;
  tahun: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKegiatanRBADto {
  kodeKegiatan: string;
  namaKegiatan: string;
  programId: string;
  tahun: number;
}
```

### Step 3: Update API Endpoint

Edit `src/features/kegiatan-rba/api.ts`:

```typescript
const ENDPOINT = '/kegiatan-rba'; // Update if needed
```

### Step 4: Build UI Component

Edit `src/features/kegiatan-rba/KegiatanRBA.tsx` - already has template!

### Step 5: Add to Routes

Edit `src/routes/index.tsx`:

```typescript
// Replace UnderDevelopment with lazy import
const KegiatanRBA = React.lazy(() => import('@/features/kegiatan-rba'));

// Update route
{
  path: 'kegiatan-rba',
  element: (
    <React.Suspense fallback={<div>Loading...</div>}>
      <KegiatanRBA />
    </React.Suspense>
  ),
}
```

### Step 6: Test!

Visit http://localhost:5173/kegiatan-rba

---

## 🎨 Using UI Components

```tsx
import { Button, Card, Input, Table, Badge } from '@/components/ui';

// Button with variants
<Button variant="default">Primary</Button>
<Button variant="outline">Secondary</Button>
<Button variant="destructive">Delete</Button>

// Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

// Input with validation
<Input
  label="Name"
  placeholder="Enter name"
  required
  error={errors.name?.message}
/>

// Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Value</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🔌 API Integration

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';
import { entityApi } from './api';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['entity'],
  queryFn: entityApi.getAll,
});

// Create/Update data
const createMutation = useMutation({
  mutationFn: entityApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries(['entity']);
  },
});

// Use in component
const handleCreate = (formData) => {
  createMutation.mutate(formData);
};
```

---

## 💾 State Management

```tsx
// Auth Store
import { useAuthStore } from '@/stores';

const { user, isAuthenticated, login, logout } = useAuthStore();

// App Store
import { useAppStore } from '@/stores';

const { currentFiscalYear, setFiscalYear } = useAppStore();
```

---

## 📚 Available Documentation

1. **README.md** - Project overview & setup
2. **STRUCTURE.md** - Detailed architecture guide
3. **MODULE_INDEX.md** - Complete module reference
4. **SKELETON_SUMMARY.md** - Implementation summary
5. **QUICK_START.md** - This guide

---

## 🎯 Module Priority

### P0 - High Priority (Start Here!)
1. Auth (login/logout)
2. Users Management
3. Kegiatan RBA
4. Output RBA
5. SPP/SPM/SP2D
6. BKU Penerimaan/Pengeluaran

### P1 - Medium Priority
- Pendapatan modules
- Laporan Keuangan
- Akuntansi

### P2 - Low Priority
- Supporting modules
- Settings
- Audit Trail

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
pnpm dev --port 5174
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### TypeScript Errors
```bash
# Restart TS server in VS Code
# Cmd/Ctrl + Shift + P
# TypeScript: Restart TS Server
```

### API Connection Issues
```bash
# Check .env file
cat .env

# Verify backend is running
curl http://localhost:3000/api/health
```

---

## 🔗 Useful Links

- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/docs
- Frontend Dev: http://localhost:5173
- Masterplan: `/opt/sikancil/docs/SIKANCIL_MASTERPLAN_v2_FINAL.md`

---

## 💡 Tips & Best Practices

1. **Always use TypeScript** - Type everything
2. **Use UI components** - Don't reinvent the wheel
3. **Follow the template** - Use module generator
4. **React Query for API** - Don't use useEffect for data fetching
5. **Zustand for global state** - Not props drilling
6. **Tailwind for styling** - Utility-first CSS
7. **Keep components small** - Single responsibility
8. **Test with backend** - Verify integration early

---

## 🤝 Getting Help

1. Check documentation files
2. Look at implemented examples (dashboard, program-rba)
3. Ask team lead
4. Refer to masterplan document

---

## ✨ Next Actions

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server
pnpm dev

# 3. Open browser
# Visit http://localhost:5173

# 4. Pick a module from MODULE_INDEX.md

# 5. Generate skeleton
./scripts/generate-module.sh <module-name> <EntityName>

# 6. Start coding! 🚀
```

---

**Happy Coding! 🎉**

