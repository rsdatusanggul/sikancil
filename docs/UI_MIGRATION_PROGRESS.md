# UI Migration Progress - shadcn/ui Implementation

**Date:** 16 Februari 2026
**Status:** In Progress
**Reference:** Tech Stack v3 - Section 2.4 Component Library

---

## Overview

Dokumen ini melacak progres migrasi komponen UI dari inline Tailwind styling ke **shadcn/ui** + **Radix UI** standar.

**Tujuan:**
- ✅ Konsistensi visual di seluruh aplikasi
- ✅ Accessibility yang lebih baik (ARIA compliant via Radix UI)
- ✅ Type safety dengan prop variants
- ✅ Theming yang mudah (CSS variables)
- ✅ Maintenance yang lebih mudah

---

## Progress Summary

| Tahap | Kategori | Status | Progress |
|--------|-----------|---------|----------|
| Tahap 1 | Foundation & Auth | ✅ Complete | 100% |
| Tahap 2 | Planning & Budgeting | 🔄 In Progress | 10% |
| Tahap 3 | Penatausahaan & Dokumentasi | ⏳ Pending | 0% |
| Tahap 4 | Accounting & Reporting | ⏳ Pending | 0% |
| Tahap 5: Dashboard & Layout | ✅ Complete | 100% |

---

## Tahap 1: Foundation & Auth (Complete ✅)

### 1.1 Setup Infrastructure
- [x] Add dependencies: `@radix-ui/react-slot`, `@radix-ui/react-label`, `class-variance-authority`
- [x] Create `components.json` configuration
- [x] Add CSS variables to `index.css` (theming support)
- [x] Configure Tailwind for shadcn/ui

### 1.2 Base UI Components
- [x] `Button.tsx` - Full shadcn/ui standard with variants and isLoading
- [x] `Input.tsx` - Simplified with error prop support
- [x] `Label.tsx` - Migrated to Radix UI Label primitive
- [x] `Badge.tsx` - Added destructive variant
- [x] `Alert.tsx` - Added destructive variant and improved icons
- [x] `Select.tsx` - Made options optional, added children support

### 1.3 Auth Pages
- [x] `frontend/src/features/auth/components/LoginForm.tsx`
  - Migrated to use Button, Input, Label, Alert from shadcn/ui
  - Replaced all inline styles with components
  - Verified visual consistency

**Files Modified:** 8 files
**Time:** ~30 minutes

---

## Tahap 2: Core Planning & Budgeting (In Progress 🔄)

### 2.1 Modul Anggaran Kas

#### 2.1.1 AnggaranKas.tsx (List Page)
**Path:** `frontend/src/features/anggaran-kas/AnggaranKas.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace `<label>` with `Label` component
- Replace `<select>` with `Select` component
- Replace `<input>` with `Input` component (search field)
- Replace `<button>` with `Button` component (create button)
- Update inline classes to use shadcn/ui components
- Verify error states and loading states

---

#### 2.1.2 AnggaranKasForm.tsx (Form Page)
**Path:** `frontend/src/features/anggaran-kas/AnggaranKasForm.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace form fields with `Input` component
- Add `Label` components for each field
- Replace submit button with `Button` component
- Update error alert to use `Alert` component
- Add validation error display

---

#### 2.1.3 CashFlowChart.tsx (Chart Component)
**Path:** `frontend/src/features/anggaran-kas/components/CashFlowChart.tsx`

**Status:** ✅ Complete

**Changes Made:**
- Fixed import typo: `@tantml:query` → `@tanstack/react-query`
- Added `CashFlowData` interface for type safety
- Updated Badge usage to use `destructive` variant
- All components are using shadcn/ui Card, Badge, Alert

---

### 2.2 Modul Program & Kegiatan RBA

#### 2.2.1 ProgramRBA.tsx (List Page)
**Path:** `frontend/src/features/program-rba/ProgramRBA.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Migrate filter dropdowns to `Select` component
- Replace button with `Button` component
- Update search input to use `Input` component
- Replace table with enhanced shadcn/ui Table (if available) or add pagination buttons

---

#### 2.2.2 KegiatanRBA.tsx (List & Detail Pages)
**Path:** `frontend/src/features/kegiatan-rba/KegiatanRBA.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace filter dropdowns with `Select` component
- Replace search input with `Input` component
- Replace action buttons with `Button` component
- Migrate detail page form fields

---

#### 2.2.3 KegiatanRBAForm.tsx (Form Page)
**Path:** `frontend/src/features/kegiatan-rba/KegiatanRBAForm.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace all form fields with `Input` component
- Add `Label` components
- Replace submit button with `Button` component
- Add `Alert` for error/success messages

---

### 2.3 Modul Sub-Kegiatan RBA

#### 2.3.1 SubKegiatanRBA.tsx (List Page)
**Path:** `frontend/src/features/subkegiatan-rba/SubKegiatanRBA.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Migrate filter dropdowns to `Select` component
- Replace search input with `Input` component
- Replace action buttons with `Button` component

---

#### 2.3.2 SubKegiatanRBAForm.tsx (Form Page)
**Path:** `frontend/src/features/subkegiatan-rba/SubKegiatanRBAForm.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace form fields with `Input` component
- Add `Label` components
- Replace submit button with `Button` component

---

## Tahap 3: Penatausahaan & Dokumentasi (Pending ⏳)

### 3.1 Modul DPA

#### 3.1.1 DPA.tsx (List Page)
**Path:** `frontend/src/features/dpa/DPA.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace pagination buttons with `Button` component
- Migrate filter panel to use shadcn/ui components
- Update table styling if needed

---

#### 3.1.2 **DPADetail.tsx (Detail Page) ⭐ PRIORITY**
**Path:** `frontend/src/features/dpa/DPADetail.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace all card divs with shadcn/ui `Card` component
- Replace buttons with `Button` component
- Add `Badge` for status indicators
- Ensure proper accessibility

---

#### 3.1.3 DPAForm.tsx (Form Page)
**Path:** `frontend/src/features/dpa/DPAForm.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace all form fields with `Input` component
- Add `Label` components
- Replace submit/cancel buttons with `Button` component
- Add `Alert` for validation messages

---

#### 3.1.4 DPAWorkflowActions.tsx (Workflow Component)
**Path:** `frontend/src/features/dpa/components/DPAWorkflowActions.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace buttons with `Button` component
- Replace textareas with shadcn/ui `Textarea` component
- Replace alerts with `Alert` component

---

#### 3.1.5 DPAFilterPanel.tsx (Filter Component)
**Path:** `frontend/src/features/dpa/components/DPAFilterPanel.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Replace all form fields with `Input` component
- Add `Label` components
- Replace selects with `Select` component
- Replace reset button with `Button` component

---

#### 3.1.6 DPARealisasiCard.tsx (Card Component)
**Path:** `frontend/src/features/dpa/components/DPARealisasiCard.tsx`

**Status:** ⏳ Pending

**Changes Needed:**
- Use shadcn/ui `Card` component
- Replace badges with `Badge` component
- Update button styling

---

### 3.2 Modul SPP/SPM
**Status:** ⏳ Pending

**Files to Migrate:**
- `frontend/src/features/spp/SPP.tsx`
- `frontend/src/features/spp/SPPForm.tsx`
- `frontend/src/features/spm/SPM.tsx`
- `frontend/src/features/spm/SPMForm.tsx`

### 3.3 Modul Revisi RBA
**Status:** ⏳ Pending

**Files to Migrate:**
- `frontend/src/features/revisi-rba/RevisiRBA.tsx`
- `frontend/src/features/revisi-rba/RevisiRBAForm.tsx`
- `frontend/src/features/revisi-rba/components/ApprovalWorkflow.tsx`

---

## Tahap 4: Accounting & Reporting (Pending ⏳)

### 4.1 Modul Jurnal & Buku Besar
**Status:** ⏳ Pending

**Files to Migrate:**
- `frontend/src/features/jurnal/Jurnal.tsx`
- `frontend/src/features/jurnal/JurnalForm.tsx`
- `frontend/src/features/buku-besar/BukuBesar.tsx`

### 4.2 Modul Laporan Keuangan
**Status:** ⏳ Pending

**Files to Migrate:**
- `frontend/src/features/lra/LRA.tsx`
- `frontend/src/features/neraca/Neraca.tsx`
- `frontend/src/features/laporan-arus-kas/LaporanArusKas.tsx`
- `frontend/src/features/laporan-perubahan-ekuitas/LaporanPerubahanEkuitas.tsx`

### 4.3 Dashboards & Visualization
**Status:** ⏳ Pending

**Files to Migrate:**
- `frontend/src/features/dashboard/Dashboard.tsx`
- Update all charts to use Recharts properly

---

## Tahap 5: Dashboard Enhancement (Priority - COMPLETED ✅)

### 5.1 Layout Components - COMPLETED ✅

#### 5.1.1 MainLayout.tsx
**Path:** `frontend/src/components/layout/MainLayout.tsx`

**Changes Made:**
- ✅ Replaced `bg-gray-50` with `bg-background`

#### 5.1.2 Header.tsx
**Path:** `frontend/src/components/layout/Header.tsx`

**Changes Made:**
- ✅ Replaced `border-gray-200` with `border-border`
- ✅ Replaced `bg-white` with `bg-background`
- ✅ Replaced `text-gray-400` with `text-muted-foreground`
- ✅ Replaced `border-gray-300` with `border-input`
- ✅ Replaced `focus:ring-blue-500` with `focus:ring-ring`
- ✅ Replaced `hover:bg-gray-100` with `hover:bg-muted`
- ✅ Replaced `text-gray-600` with `text-muted-foreground`
- ✅ Replaced `bg-red-500` with `bg-destructive`
- ✅ Replaced `bg-blue-600` with `bg-primary`
- ✅ Replaced `text-white` with `text-primary-foreground`
- ✅ Replaced `text-gray-900` with `text-foreground`
- ✅ Replaced `text-gray-500` with `text-muted-foreground`
- ✅ Replaced `bg-white` with `bg-card`
- ✅ Replaced `ring-black ring-opacity-5` with `ring-border`
- ✅ Replaced `text-gray-700` with `text-foreground`
- ✅ Replaced `text-red-600` with `text-destructive`

#### 5.1.3 Sidebar.tsx
**Path:** `frontend/src/components/layout/Sidebar.tsx`

**Changes Made:**
- ✅ Replaced `hover:bg-gray-100` with `hover:bg-muted`
- ✅ Replaced `bg-blue-50` with `bg-primary/10`
- ✅ Replaced `text-blue-700` with `text-primary`
- ✅ Replaced `hover:bg-blue-100` with `hover:bg-primary/20`
- ✅ Replaced `border-gray-200` with `border-border`
- ✅ Replaced `bg-white` with `bg-card`
- ✅ Replaced `text-blue-600` with `text-primary`
- ✅ Replaced `text-gray-500` with `text-muted-foreground`
- ✅ Replaced `border-gray-200` with `border-border`

### 5.4 Skeleton Component - COMPLETED ✅
**Path:** `frontend/src/components/ui/Skeleton.tsx`

**Status:** ✅ Complete

### 5.5 Dashboard Component - COMPLETED ✅
**Path:** `frontend/src/features/dashboard/Dashboard.tsx`

**Changes Made:**
- ✅ Migrated to use Card components with proper shadcn/ui styling
- ✅ Updated all text colors to use CSS variables
- ✅ Removed all hardcoded colors
- ✅ Responsive grid layouts work on mobile
- ✅ Proper spacing and consistency with design system

---

## ⚠️ INSTRUKSI PENTING: Hard Refresh Browser

**Untuk melihat perubahan visual:**

1. **Hard Refresh Browser:**
   - Windows/Linux: Tekan `Ctrl + Shift + R`
   - Mac: Tekan `Cmd + Shift + R`

2. **Atau Clear Browser Cache:**
   - Buka DevTools (F12)
   - Network tab → Centang "Disable cache"
   - Refresh halaman

3. **Pastikan Dev Server Berjalan:**
   ```bash
   cd /opt/sikancil/frontend
   npm run dev
   ```

4. **Restart Dev Server jika perlu:**
   - Stop: `Ctrl + C`
   - Jalankan lagi: `npm run dev`

**Perubahan yang Seharusnya Terlihat:**
- Background layout sekarang menggunakan warna dari CSS variables (bukan `bg-gray-50`)
- Header background konsisten dengan design system
- Sidebar menggunakan warna primary untuk active items
- Semua text menggunakan `text-foreground` atau `text-muted-foreground`
- Hover states menggunakan `hover:bg-muted`

---

## Tahap 5: Dashboard Enhancement (Historical Reference)

### 5.1 Dashboard Layout & Styling

#### 5.1.1 Dashboard.tsx (Main Dashboard Page)
**Path:** `frontend/src/features/dashboard/Dashboard.tsx`

**Status:** ⏳ Pending

**Tantangan yang Dihadapi:**
1. ⚠️ Card components using inline styles (`bg-blue-100`, `text-gray-600`)
2. ⚠️ Typography not using CSS variables (`text-gray-900` → `text-foreground`)
3. ⚠️ Chart placeholders need Recharts implementation
4. ⚠️ No data fetching - using static mock data
5. ⚠️ No loading states - should use Skeleton components
6. ⚠️ Real-time data updates not implemented

**Changes Needed:**
- Migrate `StatCard` to use `Card` components with proper shadcn/ui styling
- Update all text colors to use CSS variables (`text-foreground`, `text-muted-foreground`)
- Remove all hardcoded colors (`bg-blue-100`, `text-gray-600`, etc.)
- Ensure responsive grid layouts work on mobile
- Add proper spacing and consistency with design system

---

#### 5.1.2 Create Skeleton Components
**Path:** `frontend/src/components/ui/Skeleton.tsx`

**Status:** ⏳ Pending

**Purpose:**
- Loading states for dashboard stats while data is being fetched
- Consistent loading experience across the app
- Prevent layout shift during data loading

**Implementation:**
```typescript
// Skeleton pattern for stat cards
export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 bg-muted rounded-full animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
```

---

#### 5.1.3 Create Chart Components
**Status:** ⏳ Pending

**Files to Create:**
- `frontend/src/features/dashboard/components/RevenueVsTargetChart.tsx`
- `frontend/src/features/dashboard/components/ExpensePerProgramChart.tsx`

**RevenueVsTargetChart - Realisasi Pendapatan vs Target:**
- Line chart showing monthly revenue vs target
- Use Recharts `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend`
- Responsive to container size
- Proper color scheme (blue for revenue, green for target)
- Tooltip with formatted currency values

**ExpensePerProgramChart - Realisasi Belanja per Program:**
- Bar chart showing expense by program
- Use Recharts `BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`
- Horizontal or vertical bar based on space
- Color-coded by program categories
- Clickable bars to drill down to program details

---

### 5.2 Dashboard Data Integration

#### 5.2.1 Data Fetching Strategy
**Status:** ⏳ Pending

**Challenge:** Dashboard needs aggregated data from multiple modules:
- Pendapatan: `/api/pendapatan/summary`
- Belanja: `/api/belanja/summary`
- Kas: `/api/kas/saldo`
- Piutang: `/api/piutang/outstanding`

**Implementation Options:**

Option 1: Multiple Queries (Recommended)
```typescript
// Fetch all data in parallel
const { data: pendapatanData, isLoading: pendapatanLoading } = useQuery({
  queryKey: ['dashboard', 'pendapatan-summary'],
  queryFn: () => dashboardApi.getPendapatanSummary(),
});

const { data: belanjaData, isLoading: belanjaLoading } = useQuery({
  queryKey: ['dashboard', 'belanja-summary'],
  queryFn: () => dashboardApi.getBelanjaSummary(),
});
```

Option 2: Single Aggregated Query
```typescript
// Backend endpoint that returns all dashboard data
const { data: dashboardData, isLoading } = useQuery({
  queryKey: ['dashboard', 'all'],
  queryFn: () => dashboardApi.getAll(),
  // Returns: { pendapatan, belanja, kas, piutang, charts }
});
```

**Rekomendasi:** Mulai dengan Option 1 (multiple queries) untuk perubahan frontend-only. 
Pertimbangkan Option 2 jika timbul masalah performa.

---

#### 5.2.2 Real-time Updates
**Status:** ⏳ Pending

**Challenge:** Dashboard data harus update otomatis ketika transaksi terjadi

**Implementation Options:**

Option 1: Polling (Sederhana)
```typescript
// Refetch setiap 30 detik
const { data } = useQuery({
  queryKey: ['dashboard', 'all'],
  queryFn: () => dashboardApi.getAll(),
  refetchInterval: 30000, // 30 detik
});
```

Option 2: WebSocket / SSE (Advanced)
- Server-sent events saat data berubah
- Lebih kompleks tapi lebih baik untuk real-time
- Beban server lebih rendah dari polling

**Rekomendasi:** Mulai dengan Option 1 (polling). Upgrade ke Option 2 jika dibutuhkan.

---

### 5.3 Recent Transactions Table

#### 5.3.1 Create TransactionList Component
**Path:** `frontend/src/features/dashboard/components/RecentTransactions.tsx`

**Status:** ⏳ Pending

**Features Needed:**
- Table showing last 10 transactions
- Types: Pendapatan, Belanja, Penerimaan, Pengeluaran kas
- Status badges (Pending, Approved, Rejected)
- Link to detail pages
- Pagination or "View All" link
- Proper shadcn/ui Table component

---

## Component Checklist

### Available shadcn/ui Components
- [x] Button
- [x] Input
- [x] Label
- [x] Badge
- [x] Alert
- [x] Select
- [x] Textarea
- [x] Card
- [x] CardHeader
- [x] CardTitle
- [x] CardContent
- [x] CardFooter
- [ ] Form (React Hook Form integration)
- [ ] FormField
- [ ] FormItem
- [ ] FormMessage
- [ ] Dialog
- [ ] DropdownMenu
- [ ] Tabs
- [ ] Table
- [ ] Checkbox
- [ ] RadioGroup
- [ ] Switch
- [ ] DatePicker

### Components to Add for Dashboard
- [ ] Skeleton (for loading states)
- [ ] RevenueVsTargetChart (Recharts)
- [ ] ExpensePerProgramChart (Recharts)
- [ ] RecentTransactions (data table)
- [ ] StatCard (migrated version)

### Components to Add Later
- [ ] Toast (for notifications)
- [ ] Accordion (for FAQ/help sections)
- [ ] Popover (for tooltips)
- [ ] Command Palette (for search)
- [ ] Data Table (with sorting/filtering)

---

## Migration Guidelines

### Before Migration
1. Read the file carefully
2. Identify all inline styles (bg-blue-600, border-gray-300, etc.)
3. Identify all HTML elements (input, button, label, select, textarea)
4. Note any custom behaviors (loading states, error states)

### During Migration
1. Import components from `@/components/ui`
2. Replace HTML elements with shadcn/ui components
3. Remove inline classes that are now handled by components
4. Keep only utility classes that are not part of component styles
5. Test component functionality

### After Migration
1. Run TypeScript check: `cd frontend && tsc --noEmit`
2. Test the page in browser
3. Check for visual regressions
4. Verify accessibility (keyboard navigation, screen readers)
5. Update this document with completion status

---

## Known Issues & Workarounds

### Issue: Select Component Options
**Problem:** Some files use inline `<select>` with manual options
**Solution:** Use our `Select` component with `options` prop or children

### Issue: Custom Form Fields
**Problem:** Some components have custom input behaviors
**Solution:** Extend shadcn/ui components with custom props if needed

### Issue: Table Components
**Problem:** shadcn/ui Table is not fully migrated yet
**Solution:** Use existing table styling until Table component is fully implemented

---

## Testing Checklist

For each migrated file:
- [ ] Component renders without errors
- [ ] TypeScript compilation successful
- [ ] Visual styling matches design system
- [ ] Form validation works correctly
- [ ] Loading states display properly
- [ ] Error states display properly
- [ ] Accessibility: Keyboard navigation works
- [ ] Accessibility: Screen reader announces changes
- [ ] Responsive design works on mobile
- [ ] Dark mode works (if implemented)

---

## Next Steps

1. Complete Phase 2.1 (Anggaran Kas) - Estimated: 2 hours
2. Complete Phase 2.2 (Program & Kegiatan RBA) - Estimated: 3 hours
3. Complete Phase 2.3 (Sub-Kegiatan RBA) - Estimated: 2 hours
4. Begin Phase 3.1 (DPA) - Start with DPADetail.tsx as priority

---

## Notes

- All migrations should maintain existing functionality
- Visual changes should be minimal (just consistency improvements)
- No breaking changes to business logic
- Each file should be tested independently before moving to next

---

**Last Updated:** 16 Februari 2026, 21:08 WITA
**Updated By:** AI Assistant