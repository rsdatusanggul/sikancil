# Quick Start: Modul #7 & #8 - Kegiatan RBA & Output RBA

> **TL;DR**: Implementasi 2 modul RBA dengan relasi hierarki: Program → Kegiatan → Output

---

## 🎯 Objektif

**Modul #7 - Kegiatan RBA**
- Kegiatan dalam program RBA (level 2 hierarki)
- CRUD + indikator kegiatan (dynamic array)
- Relasi parent: Program RBA

**Modul #8 - Output RBA**
- Output/komponen dalam kegiatan (level 3 hierarki)
- CRUD + volume target + timeline + pagu
- Relasi parent: Kegiatan RBA

---

## 📋 Checklist Implementasi

### Setup Awal
```bash
# 1. Create folder structure
mkdir -p src/features/kegiatan-rba/components
mkdir -p src/features/output-rba/components

# 2. Create files
touch src/features/kegiatan-rba/{index.ts,types.ts,api.ts,KegiatanRBA.tsx,KegiatanRBAForm.tsx,KegiatanRBADetail.tsx}
touch src/features/output-rba/{index.ts,types.ts,api.ts,OutputRBA.tsx,OutputRBAForm.tsx,OutputRBADetail.tsx}
```

### Modul #7: Kegiatan RBA

#### 1. Types (`types.ts`)
```typescript
export interface KegiatanRBA {
  id: string;
  kodeKegiatan: string;      // "01.01"
  namaKegiatan: string;
  deskripsi?: string;
  programId: string;
  indikatorKegiatan?: IndikatorKegiatan[];
  tahun: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  program?: ProgramRBA;
  output?: OutputRBA[];
}

export interface IndikatorKegiatan {
  nama: string;
  satuan: string;
  target: number;
}

export interface CreateKegiatanRBADto {
  kodeKegiatan: string;
  namaKegiatan: string;
  programId: string;
  tahun: number;
  deskripsi?: string;
  indikatorKegiatan?: IndikatorKegiatan[];
  isActive?: boolean;
}

export interface UpdateKegiatanRBADto extends Partial<CreateKegiatanRBADto> {}
```

#### 2. API Client (`api.ts`)
```typescript
import { apiClient } from '@/lib/api-client';
import type { KegiatanRBA, CreateKegiatanRBADto, UpdateKegiatanRBADto } from './types';

export const kegiatanRBAApi = {
  getAll: async (params?: { tahun?: number; programId?: string; search?: string }) => {
    const response = await apiClient.get<KegiatanRBA[]>('/kegiatan-rba', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<KegiatanRBA>(`/kegiatan-rba/${id}`);
    return response.data;
  },

  create: async (data: CreateKegiatanRBADto) => {
    const response = await apiClient.post<KegiatanRBA>('/kegiatan-rba', data);
    return response.data;
  },

  update: async (id: string, data: UpdateKegiatanRBADto) => {
    const response = await apiClient.patch<KegiatanRBA>(`/kegiatan-rba/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/kegiatan-rba/${id}`);
  },
};
```

#### 3. Main Page Component (`KegiatanRBA.tsx`)
```typescript
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, Table, Button } from '@/components/ui';
import { Plus } from 'lucide-react';
import { kegiatanRBAApi } from './api';

export default function KegiatanRBA() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = React.useState(currentYear);
  const [selectedProgram, setSelectedProgram] = React.useState<string>('');

  const { data: kegiatanList, isLoading } = useQuery({
    queryKey: ['kegiatan-rba', { tahun: selectedYear, programId: selectedProgram }],
    queryFn: () => kegiatanRBAApi.getAll({
      tahun: selectedYear,
      programId: selectedProgram || undefined
    }),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kegiatan RBA</h1>
          <p className="text-gray-600">Kelola kegiatan dalam Program RBA</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kegiatan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex gap-4 p-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded px-3 py-2"
          >
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear + 1}>{currentYear + 1}</option>
          </select>

          {/* TODO: Add Program filter dropdown */}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          <Table>
            {/* TODO: Implement table */}
          </Table>
        )}
      </Card>
    </div>
  );
}
```

#### 4. Form Modal Component (`KegiatanRBAForm.tsx`)
Key features:
- Form with validation (kode, nama, program, tahun)
- Dynamic IndikatorKegiatan array input
- React Hook Form + Zod validation (optional)
- useMutation for create/update

#### 5. Detail Page (`KegiatanRBADetail.tsx`)
Features:
- Display kegiatan info + indikator list
- Embedded Output RBA table (child records)
- Edit/Delete actions

#### 6. Sub-component: `IndikatorKegiatanInput.tsx`
```typescript
interface IndikatorKegiatanInputProps {
  value: IndikatorKegiatan[];
  onChange: (value: IndikatorKegiatan[]) => void;
}

export function IndikatorKegiatanInput({ value, onChange }: IndikatorKegiatanInputProps) {
  const handleAdd = () => {
    onChange([...value, { nama: '', satuan: '', target: 0 }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof IndikatorKegiatan, val: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {value.map((item, idx) => (
        <div key={idx} className="flex gap-2">
          <input
            placeholder="Nama indikator"
            value={item.nama}
            onChange={(e) => handleChange(idx, 'nama', e.target.value)}
          />
          <input
            placeholder="Satuan"
            value={item.satuan}
            onChange={(e) => handleChange(idx, 'satuan', e.target.value)}
          />
          <input
            type="number"
            placeholder="Target"
            value={item.target}
            onChange={(e) => handleChange(idx, 'target', Number(e.target.value))}
          />
          <button onClick={() => handleRemove(idx)}>🗑</button>
        </div>
      ))}
      <button onClick={handleAdd}>+ Tambah Indikator</button>
    </div>
  );
}
```

---

### Modul #8: Output RBA

#### 1. Types (`types.ts`)
```typescript
export interface OutputRBA {
  id: string;
  kodeOutput: string;         // "01.01.001"
  namaOutput: string;
  deskripsi?: string;
  kegiatanId: string;
  volumeTarget: number;
  satuan: string;
  lokasi?: string;
  bulanMulai?: number;        // 1-12
  bulanSelesai?: number;      // 1-12
  unitKerjaId?: string;
  totalPagu: number;
  tahun: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  kegiatan?: KegiatanRBA;
  unitKerja?: UnitKerja;
}

export interface CreateOutputRBADto {
  kodeOutput: string;
  namaOutput: string;
  kegiatanId: string;
  tahun: number;
  volumeTarget: number;
  satuan: string;
  lokasi?: string;
  bulanMulai?: number;
  bulanSelesai?: number;
  unitKerjaId?: string;
  totalPagu?: number;
  deskripsi?: string;
}

export interface UpdateOutputRBADto extends Partial<CreateOutputRBADto> {}
```

#### 2. API Client (`api.ts`)
Same pattern as Kegiatan RBA

#### 3. Main Page Component (`OutputRBA.tsx`)
Features:
- Filter: tahun, kegiatan, unit kerja
- Table columns: kode, nama, volume+satuan, pagu (currency), timeline
- Search functionality

#### 4. Form Modal (`OutputRBAForm.tsx`)
Key fields:
- Kode output (text)
- Nama output (text)
- Kegiatan selector (dropdown)
- Volume + satuan (composite input)
- Timeline (bulan mulai - selesai)
- Unit kerja selector
- Total pagu (currency input)

#### 5. Detail Page (`OutputRBADetail.tsx`)
Display output info + breadcrumb (program → kegiatan → output)

#### 6. Sub-components

**VolumeTargetInput.tsx**
```typescript
interface VolumeTargetInputProps {
  volume: number;
  satuan: string;
  onVolumeChange: (val: number) => void;
  onSatuanChange: (val: string) => void;
}

export function VolumeTargetInput(props: VolumeTargetInputProps) {
  const satuanPresets = ['Orang', 'Pasien', 'Kunjungan', 'Kegiatan', 'Dokumen'];

  return (
    <div className="flex gap-2">
      <input
        type="number"
        value={props.volume}
        onChange={(e) => props.onVolumeChange(Number(e.target.value))}
        placeholder="1000"
        className="flex-1"
      />
      <input
        list="satuan-presets"
        value={props.satuan}
        onChange={(e) => props.onSatuanChange(e.target.value)}
        placeholder="Satuan"
        className="flex-1"
      />
      <datalist id="satuan-presets">
        {satuanPresets.map(s => <option key={s} value={s} />)}
      </datalist>
    </div>
  );
}
```

**TimelineInput.tsx**
```typescript
interface TimelineInputProps {
  startMonth?: number;
  endMonth?: number;
  onStartChange: (val: number | undefined) => void;
  onEndChange: (val: number | undefined) => void;
}

export function TimelineInput(props: TimelineInputProps) {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return (
    <div className="flex gap-2 items-center">
      <select
        value={props.startMonth || ''}
        onChange={(e) => props.onStartChange(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">-</option>
        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
      </select>
      <span>s/d</span>
      <select
        value={props.endMonth || ''}
        onChange={(e) => props.onEndChange(e.target.value ? Number(e.target.value) : undefined)}
      >
        <option value="">-</option>
        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
      </select>
    </div>
  );
}
```

---

## 🛣️ Routes

Update `src/routes/index.tsx`:

```typescript
// Import components
import KegiatanRBA from '@/features/kegiatan-rba';
import KegiatanRBADetail from '@/features/kegiatan-rba/KegiatanRBADetail';
import OutputRBA from '@/features/output-rba';
import OutputRBADetail from '@/features/output-rba/OutputRBADetail';

// Add routes
{
  path: '/kegiatan-rba',
  element: <KegiatanRBA />
},
{
  path: '/kegiatan-rba/:id',
  element: <KegiatanRBADetail />
},
{
  path: '/output-rba',
  element: <OutputRBA />
},
{
  path: '/output-rba/:id',
  element: <OutputRBADetail />
},
```

---

## 🧪 Testing Commands

```bash
# 1. Test backend API
curl http://localhost:3000/api/kegiatan-rba
curl http://localhost:3000/api/output-rba

# 2. Create test data
curl -X POST http://localhost:3000/api/kegiatan-rba \
  -H "Content-Type: application/json" \
  -d '{
    "kodeKegiatan": "01.01",
    "namaKegiatan": "Test Kegiatan",
    "programId": "uuid-program-id",
    "tahun": 2026
  }'

# 3. Run frontend
cd /opt/sikancil/frontend
pnpm run dev
```

---

## 🎨 UI Styling Reference

### Colors
- Primary: blue-600
- Success: green-600
- Danger: red-600
- Gray: gray-600 (text), gray-200 (borders)

### Spacing
- Section gap: `space-y-6`
- Card padding: `p-4` or `p-6`
- Button gap: `gap-2`

### Icons (Lucide React)
- Add: `<Plus />`
- Edit: `<Edit />`
- Delete: `<Trash2 />`
- View: `<Eye />`
- Search: `<Search />`
- Filter: `<Filter />`

---

## 🔥 Common Pitfalls

1. **Lupa handle loading states** → User melihat blank screen
   - Solution: Always show loading spinner/skeleton

2. **Tidak validate bulanSelesai >= bulanMulai** → Bad data
   - Solution: Add validation di form

3. **Hard-code tahun** → Tidak flexible
   - Solution: Use year selector dengan range (currentYear ± 1)

4. **Fetch semua data tanpa filter** → Performance issue
   - Solution: Always implement pagination & filters

5. **Lupa invalidate queries setelah mutation** → Stale data
   - Solution: Use `queryClient.invalidateQueries()` di onSuccess

6. **Currency input tidak format** → Confusing for user
   - Solution: Use number formatter: `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })`

---

## 📚 Helpful Snippets

### Format Currency
```typescript
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Usage: formatCurrency(5000000) → "Rp 5.000.000"
```

### Format Month Range
```typescript
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export const formatMonthRange = (start?: number, end?: number): string => {
  if (!start && !end) return '-';
  if (start && !end) return `${MONTHS[start - 1]}`;
  if (!start && end) return `s/d ${MONTHS[end - 1]}`;
  return `${MONTHS[start! - 1]} - ${MONTHS[end! - 1]}`;
};

// Usage: formatMonthRange(1, 12) → "Jan - Des"
```

### React Query Mutation Pattern
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const createMutation = useMutation({
  mutationFn: (data: CreateKegiatanRBADto) => kegiatanRBAApi.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['kegiatan-rba'] });
    toast.success('Kegiatan berhasil ditambahkan');
  },
  onError: (error) => {
    toast.error('Gagal menambahkan kegiatan');
  },
});

// Usage:
createMutation.mutate({ kodeKegiatan: '01.01', ... });
```

---

## ✅ Definition of Done

Modul dianggap selesai jika:
- [ ] CRUD berfungsi 100% (create, read, update, delete)
- [ ] Filter & search bekerja
- [ ] Validation client + server handled
- [ ] Loading & error states implemented
- [ ] Responsive design (desktop & tablet)
- [ ] No console errors
- [ ] Code reviewed & approved
- [ ] Tested dengan minimal 5 test cases
- [ ] Documentation updated (MODULE_INDEX.md)

---

## 🚀 Quick Start Command

```bash
# Clone pattern from Program RBA
cd /opt/sikancil/frontend/src/features
cp -r program-rba kegiatan-rba
cp -r program-rba output-rba

# Edit files sesuai spec
# Run dev server
cd /opt/sikancil/frontend
pnpm run dev
```

---

**Happy Coding! 🎉**

Jika ada pertanyaan, refer ke:
- [Detailed Implementation Plan](./IMPLEMENTATION_PLAN_MODULES_7_8.md)
- [Module Index](./MODULE_INDEX.md)
- Backend API Docs: http://localhost:3000/api/docs
