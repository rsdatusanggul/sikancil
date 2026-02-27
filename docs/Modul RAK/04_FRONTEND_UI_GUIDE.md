# 🎨 Frontend UI Guide - RAK Module

## 📋 Overview

Dokumentasi lengkap untuk frontend implementation RAK Module menggunakan React, Vite, TypeScript, dan Tailwind CSS dengan shadcn/ui components.

---

## 🏗️ Component Structure

```
src/features/rak/
├── components/
│   ├── RakList/
│   │   ├── RakList.tsx
│   │   ├── RakListFilters.tsx
│   │   └── RakListItem.tsx
│   ├── RakDetail/
│   │   ├── RakDetailView.tsx
│   │   ├── RakHeader.tsx
│   │   └── RakStatusBadge.tsx
│   ├── RakMatrix/
│   │   ├── RakMatrixInput.tsx
│   │   ├── RakMatrixRow.tsx
│   │   ├── MonthlyInputCell.tsx
│   │   └── AutoCalculateSummary.tsx
│   ├── RakForm/
│   │   ├── CreateRakForm.tsx
│   │   ├── UpdateRakForm.tsx
│   │   └── RakFormSchema.ts
│   ├── RakApproval/
│   │   ├── ApprovalPanel.tsx
│   │   ├── ApprovalHistory.tsx
│   │   └── ApprovalActions.tsx
│   ├── CashFlowChart/
│   │   ├── MonthlyFlowChart.tsx
│   │   ├── SemesterComparison.tsx
│   │   └── ChartLegend.tsx
│   └── RakExport/
│       ├── ExportButtons.tsx
│       └── ExportPreview.tsx
├── hooks/
│   ├── useRakQuery.ts
│   ├── useRakMutation.ts
│   ├── useRakValidation.ts
│   └── useCashFlowCalculation.ts
├── pages/
│   ├── RakDashboard.tsx
│   ├── RakCreate.tsx
│   ├── RakEdit.tsx
│   └── RakView.tsx
├── services/
│   └── rakApi.ts
├── types/
│   └── rak.types.ts
└── utils/
    ├── rakCalculations.ts
    ├── rakFormatters.ts
    └── rakValidators.ts
```

---

## 📝 TypeScript Types

### **rak.types.ts**

```typescript
export enum RakStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REVISED = 'REVISED',
}

export interface MonthlyBreakdown {
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
}

export interface RakDetail extends MonthlyBreakdown {
  id: string;
  rak_subkegiatan_id: string;
  kode_rekening_id: string;
  kode_rekening: KodeRekening;
  jumlah_anggaran: number;
  created_at: string;
  updated_at: string;
}

export interface RakSubkegiatan {
  id: string;
  subkegiatan_id: string;
  subkegiatan: Subkegiatan;
  tahun_anggaran: number;
  total_pagu: number;
  status: RakStatus;
  revision_number: number;
  
  // Submission
  submitted_at?: string;
  submitted_by?: string;
  
  // Approval
  approved_at?: string;
  approved_by?: string;
  approval_notes?: string;
  
  // Rejection
  rejected_at?: string;
  rejected_by?: string;
  rejection_reason?: string;
  
  // Relations
  details?: RakDetail[];
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface CreateRakPayload {
  subkegiatan_id: string;
  tahun_anggaran: number;
  total_pagu: number;
  details?: CreateRakDetailPayload[];
}

export interface CreateRakDetailPayload extends Partial<MonthlyBreakdown> {
  kode_rekening_id: string;
  jumlah_anggaran: number;
}

export interface RakQueryParams {
  tahun_anggaran?: number;
  subkegiatan_id?: string;
  status?: RakStatus;
  page?: number;
  limit?: number;
}

export interface RakListResponse {
  data: RakSubkegiatan[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// UI-specific types
export interface RakMatrixData {
  kode_rekening_id: string;
  kode: string;
  uraian: string;
  jumlah_anggaran: number;
  monthly: MonthlyBreakdown;
  semester_1: number;
  semester_2: number;
  triwulan_1: number;
  triwulan_2: number;
  triwulan_3: number;
  triwulan_4: number;
}
```

---

## 🔌 API Service

### **rakApi.ts**

```typescript
import axios from '@/lib/axios';
import type {
  RakSubkegiatan,
  CreateRakPayload,
  RakQueryParams,
  RakListResponse,
} from '../types/rak.types';

export const rakApi = {
  // GET all RAK
  getAll: async (params: RakQueryParams): Promise<RakListResponse> => {
    const { data } = await axios.get('/api/rak', { params });
    return data;
  },

  // GET RAK by ID
  getById: async (id: string): Promise<RakSubkegiatan> => {
    const { data } = await axios.get(`/api/rak/${id}`);
    return data;
  },

  // GET RAK details
  getDetails: async (id: string) => {
    const { data } = await axios.get(`/api/rak/${id}/details`);
    return data;
  },

  // GET by Subkegiatan & Tahun
  getBySubkegiatanAndTahun: async (
    subkegiatanId: string,
    tahun: number,
  ): Promise<RakSubkegiatan> => {
    const { data } = await axios.get(
      `/api/rak/subkegiatan/${subkegiatanId}/tahun/${tahun}`,
    );
    return data;
  },

  // CREATE RAK
  create: async (payload: CreateRakPayload): Promise<RakSubkegiatan> => {
    const { data } = await axios.post('/api/rak', payload);
    return data;
  },

  // UPDATE RAK
  update: async (
    id: string,
    payload: Partial<CreateRakPayload>,
  ): Promise<RakSubkegiatan> => {
    const { data } = await axios.patch(`/api/rak/${id}`, payload);
    return data;
  },

  // SUBMIT for approval
  submit: async (id: string): Promise<RakSubkegiatan> => {
    const { data } = await axios.post(`/api/rak/${id}/submit`);
    return data;
  },

  // APPROVE
  approve: async (
    id: string,
    notes?: string,
  ): Promise<RakSubkegiatan> => {
    const { data } = await axios.post(`/api/rak/${id}/approve`, {
      approval_notes: notes,
    });
    return data;
  },

  // REJECT
  reject: async (id: string, reason: string): Promise<RakSubkegiatan> => {
    const { data } = await axios.post(`/api/rak/${id}/reject`, {
      rejection_reason: reason,
    });
    return data;
  },

  // EXPORT PDF
  exportPdf: async (id: string): Promise<Blob> => {
    const { data } = await axios.get(`/api/rak/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return data;
  },

  // EXPORT Excel
  exportExcel: async (id: string): Promise<Blob> => {
    const { data } = await axios.get(`/api/rak/${id}/export/excel`, {
      responseType: 'blob',
    });
    return data;
  },

  // DELETE (soft delete)
  delete: async (id: string): Promise<void> => {
    await axios.delete(`/api/rak/${id}`);
  },
};
```

---

## 🎣 React Query Hooks

### **useRakQuery.ts**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rakApi } from '../services/rakApi';
import type { RakQueryParams, CreateRakPayload } from '../types/rak.types';
import { toast } from '@/components/ui/use-toast';

// Query Keys
export const rakKeys = {
  all: ['rak'] as const,
  lists: () => [...rakKeys.all, 'list'] as const,
  list: (params: RakQueryParams) => [...rakKeys.lists(), params] as const,
  details: () => [...rakKeys.all, 'detail'] as const,
  detail: (id: string) => [...rakKeys.details(), id] as const,
};

// GET all RAK
export function useRakList(params: RakQueryParams) {
  return useQuery({
    queryKey: rakKeys.list(params),
    queryFn: () => rakApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// GET RAK by ID
export function useRak(id: string) {
  return useQuery({
    queryKey: rakKeys.detail(id),
    queryFn: () => rakApi.getById(id),
    enabled: !!id,
  });
}

// GET RAK details
export function useRakDetails(id: string) {
  return useQuery({
    queryKey: [...rakKeys.detail(id), 'details'],
    queryFn: () => rakApi.getDetails(id),
    enabled: !!id,
  });
}
```

### **useRakMutation.ts**

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { rakApi } from '../services/rakApi';
import { rakKeys } from './useRakQuery';
import { toast } from '@/components/ui/use-toast';

// CREATE RAK
export function useCreateRak() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: rakApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast({
        title: 'Berhasil',
        description: 'RAK berhasil dibuat',
      });
      navigate(`/rak/${data.id}`);
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal membuat RAK',
        variant: 'destructive',
      });
    },
  });
}

// UPDATE RAK
export function useUpdateRak(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => rakApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast({
        title: 'Berhasil',
        description: 'RAK berhasil diupdate',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal update RAK',
        variant: 'destructive',
      });
    },
  });
}

// SUBMIT RAK
export function useSubmitRak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rakApi.submit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast({
        title: 'Berhasil',
        description: 'RAK berhasil disubmit untuk approval',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal submit RAK',
        variant: 'destructive',
      });
    },
  });
}

// APPROVE RAK
export function useApproveRak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      rakApi.approve(id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast({
        title: 'Berhasil',
        description: 'RAK berhasil diapprove',
      });
    },
  });
}

// REJECT RAK
export function useRejectRak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rakApi.reject(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast({
        title: 'RAK Ditolak',
        description: 'RAK telah ditolak',
      });
    },
  });
}

// EXPORT
export function useExportRakPdf() {
  return useMutation({
    mutationFn: rakApi.exportPdf,
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RAK_${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Berhasil',
        description: 'RAK berhasil diexport ke PDF',
      });
    },
  });
}
```

---

## 🎨 Main Components

### **RakMatrixInput.tsx** (Core Component)

```typescript
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { RakMatrixData, MonthlyBreakdown } from '../types/rak.types';
import { formatCurrency } from '@/lib/formatters';
import { Calculator, Copy } from 'lucide-react';

interface RakMatrixInputProps {
  data: RakMatrixData[];
  onChange: (data: RakMatrixData[]) => void;
  readonly?: boolean;
}

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const;

const MONTH_KEYS: (keyof MonthlyBreakdown)[] = [
  'januari',
  'februari',
  'maret',
  'april',
  'mei',
  'juni',
  'juli',
  'agustus',
  'september',
  'oktober',
  'november',
  'desember',
];

export function RakMatrixInput({
  data,
  onChange,
  readonly = false,
}: RakMatrixInputProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Calculate totals
  const calculateTotal = useCallback((monthly: MonthlyBreakdown) => {
    return MONTH_KEYS.reduce((sum, month) => sum + (monthly[month] || 0), 0);
  }, []);

  // Handle monthly input change
  const handleMonthChange = useCallback(
    (rowIndex: number, month: keyof MonthlyBreakdown, value: string) => {
      const numValue = parseFloat(value) || 0;
      const updatedData = [...data];
      updatedData[rowIndex].monthly[month] = numValue;
      
      // Recalculate total
      const newTotal = calculateTotal(updatedData[rowIndex].monthly);
      updatedData[rowIndex].jumlah_anggaran = newTotal;
      
      onChange(updatedData);
    },
    [data, onChange, calculateTotal],
  );

  // Auto-distribute equally
  const handleAutoDistribute = useCallback(
    (rowIndex: number) => {
      const row = data[rowIndex];
      const monthlyValue = Math.floor(row.jumlah_anggaran / 12);
      const remainder = row.jumlah_anggaran - monthlyValue * 12;

      const updatedData = [...data];
      MONTH_KEYS.forEach((month, idx) => {
        updatedData[rowIndex].monthly[month] =
          monthlyValue + (idx === 0 ? remainder : 0);
      });

      onChange(updatedData);
    },
    [data, onChange],
  );

  // Copy from previous month
  const handleCopyPrevious = useCallback(
    (rowIndex: number, monthIndex: number) => {
      if (monthIndex === 0) return;

      const updatedData = [...data];
      const currentMonth = MONTH_KEYS[monthIndex];
      const previousMonth = MONTH_KEYS[monthIndex - 1];

      updatedData[rowIndex].monthly[currentMonth] =
        updatedData[rowIndex].monthly[previousMonth];

      onChange(updatedData);
    },
    [data, onChange],
  );

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] sticky left-0 bg-background">
                Kode
              </TableHead>
              <TableHead className="min-w-[200px] sticky left-[100px] bg-background">
                Uraian
              </TableHead>
              <TableHead className="text-right min-w-[120px]">
                Jumlah Anggaran
              </TableHead>
              {MONTHS.map((month) => (
                <TableHead key={month} className="text-right min-w-[120px]">
                  {month}
                </TableHead>
              ))}
              <TableHead className="text-right min-w-[120px]">
                Semester 1
              </TableHead>
              <TableHead className="text-right min-w-[120px]">
                Semester 2
              </TableHead>
              {!readonly && (
                <TableHead className="w-[100px]">Aksi</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={row.kode_rekening_id}
                className={selectedRow === rowIndex ? 'bg-muted' : ''}
                onMouseEnter={() => setSelectedRow(rowIndex)}
                onMouseLeave={() => setSelectedRow(null)}
              >
                <TableCell className="font-medium sticky left-0 bg-background">
                  {row.kode}
                </TableCell>
                <TableCell className="sticky left-[100px] bg-background">
                  {row.uraian}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(row.jumlah_anggaran)}
                </TableCell>

                {MONTH_KEYS.map((month, monthIndex) => (
                  <TableCell key={month} className="p-1">
                    {readonly ? (
                      <div className="text-right">
                        {formatCurrency(row.monthly[month])}
                      </div>
                    ) : (
                      <div className="relative group">
                        <Input
                          type="number"
                          value={row.monthly[month] || 0}
                          onChange={(e) =>
                            handleMonthChange(rowIndex, month, e.target.value)
                          }
                          className="text-right"
                          step="0.01"
                        />
                        {monthIndex > 0 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 h-6 w-6"
                            onClick={() =>
                              handleCopyPrevious(rowIndex, monthIndex)
                            }
                            title="Copy from previous month"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                ))}

                <TableCell className="text-right bg-blue-50 font-semibold">
                  {formatCurrency(row.semester_1)}
                </TableCell>
                <TableCell className="text-right bg-green-50 font-semibold">
                  {formatCurrency(row.semester_2)}
                </TableCell>

                {!readonly && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAutoDistribute(rowIndex)}
                      title="Auto-distribute equally"
                    >
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="bg-muted p-4 rounded-md">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Pagu:</p>
            <p className="text-2xl font-bold">
              {formatCurrency(
                data.reduce((sum, row) => sum + row.jumlah_anggaran, 0),
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Rencana:</p>
            <p className="text-2xl font-bold">
              {formatCurrency(
                data.reduce(
                  (sum, row) => sum + calculateTotal(row.monthly),
                  0,
                ),
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### **RakStatusBadge.tsx**

```typescript
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { RakStatus } from '../types/rak.types';
import {
  FileEdit,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface RakStatusBadgeProps {
  status: RakStatus;
  className?: string;
}

const STATUS_CONFIG = {
  [RakStatus.DRAFT]: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileEdit,
    className: 'bg-gray-100 text-gray-800',
  },
  [RakStatus.SUBMITTED]: {
    label: 'Diajukan',
    variant: 'default' as const,
    icon: Send,
    className: 'bg-blue-100 text-blue-800',
  },
  [RakStatus.APPROVED]: {
    label: 'Disetujui',
    variant: 'default' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800',
  },
  [RakStatus.REJECTED]: {
    label: 'Ditolak',
    variant: 'destructive' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-800',
  },
  [RakStatus.REVISED]: {
    label: 'Direvisi',
    variant: 'default' as const,
    icon: RefreshCw,
    className: 'bg-yellow-100 text-yellow-800',
  },
};

export function RakStatusBadge({ status, className }: RakStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} ${className}`}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}
```

---

### **MonthlyFlowChart.tsx**

```typescript
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MonthlyBreakdown } from '../types/rak.types';
import { formatCurrency } from '@/lib/formatters';

interface MonthlyFlowChartProps {
  data: MonthlyBreakdown;
  title?: string;
}

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

export function MonthlyFlowChart({ data, title }: MonthlyFlowChartProps) {
  const chartData = MONTHS_SHORT.map((month, index) => {
    const monthKey = Object.keys(data)[index] as keyof MonthlyBreakdown;
    return {
      month,
      value: data[monthKey],
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || 'Proyeksi Bulanan'}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(value) =>
                formatCurrency(value, { compact: true })
              }
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              labelFormatter={(label) => `Bulan: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
```

---

## 📄 Main Pages

### **RakDashboard.tsx** (Layout Example)

```typescript
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RakList } from '../components/RakList/RakList';
import { MonthlyFlowChart } from '../components/CashFlowChart/MonthlyFlowChart';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function RakDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            RAK & Cash Flow Planning
          </h1>
          <p className="text-muted-foreground">
            Rencana Anggaran Kas per Subkegiatan
          </p>
        </div>
        <Button onClick={() => navigate('/rak/create')}>
          <Plus className="mr-2 h-4 w-4" />
          Buat RAK Baru
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Daftar RAK</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <RakList />
        </TabsContent>

        <TabsContent value="cashflow" className="space-y-4">
          {/* Cash Flow Aggregate View */}
          <MonthlyFlowChart data={/* aggregate data */} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## 🎨 UI/UX Best Practices

### **1. Loading States**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

export function RakMatrixSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
```

### **2. Error Handling**

```typescript
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function RakError({ error }: { error: Error }) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}
```

### **3. Validation Feedback**

```typescript
// Real-time validation display
const [errors, setErrors] = useState<Record<string, string>>({});

// Show inline error
{errors.januari && (
  <p className="text-sm text-red-500 mt-1">
    {errors.januari}
  </p>
)}
```

---

## ✅ Component Checklist

- [ ] RakList with filters
- [ ] RakMatrixInput with auto-calculate
- [ ] RakStatusBadge
- [ ] MonthlyFlowChart
- [ ] CreateRakForm with validation
- [ ] ApprovalPanel with workflow
- [ ] ExportButtons (PDF/Excel)
- [ ] Loading skeletons
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Responsive design (mobile-friendly)

---

**Frontend Owner:** Frontend Team  
**Review Date:** 2025-02-17  
**Status:** ✅ Ready for Implementation
