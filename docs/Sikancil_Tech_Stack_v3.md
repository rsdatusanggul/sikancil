# Tech Stack v3 - Si-Kancil BLUD

**Version:** 3.0
**Date:** 15 Februari 2026
**Status:** Final Recommendation
**Based On:** Masterplan v2 + Rekomendasi Tahap 3 + Current Implementation Analysis

---

## Executive Summary

Tech Stack v3 adalah hasil komparasi dan harmonisasi antara:
- ✅ **SIKANCIL Masterplan v2 FINAL** (Comprehensive BLUD compliance)
- ✅ **Rekomendasi Tahap 3** (Modern automation & real-time integration)
- ✅ **Current Implementation** (Existing codebase analysis)

**Filosofi:** "Don't fix what ain't broken, enhance what matters"

**Prinsip Pemilihan:**
1. **Backward Compatible:** Tidak mengubah foundation yang sudah ada (TypeORM, Tailwind)
2. **Performance First:** Prioritas pada speed & scalability
3. **Production Ready:** Battle-tested technologies dengan community support kuat
4. **Cost Effective:** Open source & self-hosted preferred
5. **Future Proof:** Technology dengan roadmap jelas minimal 5 tahun

---

## Table of Contents

1. [Backend Stack](#1-backend-stack)
2. [Frontend Stack](#2-frontend-stack)
3. [Database & Caching](#3-database--caching)
4. [Integration Layer](#4-integration-layer)
5. [DevOps & Infrastructure](#5-devops--infrastructure)
6. [Security & Compliance](#6-security--compliance)
7. [Monitoring & Observability](#7-monitoring--observability)
8. [Comparison Matrix](#8-comparison-matrix)
9. [Migration Strategy](#9-migration-strategy)
10. [Tech Debt & Trade-offs](#10-tech-debt--trade-offs)

---

## 1. Backend Stack

### 1.1 Core Framework

#### **NestJS 11.x**
```yaml
Status: ✅ KEEP (Current: 11.0.1)
Justifikasi:
  ✅ Modular architecture → perfect untuk 40+ modules BLUD
  ✅ TypeScript native → type safety & better DX
  ✅ Built-in DI container → clean dependency management
  ✅ Decorator-based → readable & maintainable code
  ✅ Extensive ecosystem (Passport, TypeORM, Swagger, etc.)
  ✅ Excellent documentation & community support
  ✅ Microservices-ready (future scaling)

Alternatives Rejected:
  ❌ Express.js → Too basic, no structure
  ❌ Fastify → Good performance but less ecosystem
  ❌ Adonis.js → Smaller community

Version Strategy:
  - Stay on NestJS 11.x (LTS)
  - Update minor versions every 3 months
  - Major version upgrade setelah 6 bulan stable release
```

---

### 1.2 ORM & Database Access

#### **TypeORM 0.3.x**
```yaml
Status: ✅ KEEP (Current: 0.3.28)
Justifikasi:
  ✅ Already implemented with migrations
  ✅ Mature & stable (production-proven)
  ✅ Support Active Record & Data Mapper pattern
  ✅ Complex query support (needed for BLUD reporting)
  ✅ Migration system sudah berjalan
  ✅ Great PostgreSQL support (JSON, Array, etc.)
  ✅ TypeScript decorators untuk entity definition

Perbandingan dengan Prisma (Masterplan v2):
  Prisma Pros:
    ✅ Better type safety
    ✅ Auto-generated client
    ✅ Great DX (Developer Experience)

  Prisma Cons:
    ❌ Migration cost SANGAT TINGGI (73 tables + data)
    ❌ Less flexible untuk complex queries
    ❌ Tidak support multiple schemas (needed untuk audit)
    ❌ Learning curve untuk existing team

  TypeORM Wins Because:
    ✅ Zero migration cost
    ✅ Team sudah familiar
    ✅ Better untuk complex BLUD queries (CTEs, window functions)
    ✅ Support RAW SQL saat needed

Improvement Strategy:
  🔄 Implement Repository Pattern (Data Mapper)
  🔄 Create base repository dengan common methods
  🔄 Add Query Builder helpers
  🔄 Enable strict TypeScript checking
  🔄 Add database query logging (development)

Example Enhancement:
```typescript
// Base Repository Pattern
export abstract class BaseRepository<T> {
  constructor(
    private readonly repository: Repository<T>,
    private readonly logger: Logger,
  ) {}

  async findOneOrFail(id: string): Promise<T> {
    const entity = await this.repository.findOne({ where: { id } });
    if (!entity) {
      this.logger.error(`Entity not found: ${id}`);
      throw new NotFoundException();
    }
    return entity;
  }

  async createWithAudit(data: DeepPartial<T>, userId: string): Promise<T> {
    // Auto-add audit fields
    const entity = this.repository.create({
      ...data,
      createdBy: userId,
      createdAt: new Date(),
    });
    return this.repository.save(entity);
  }
}
```
```

---

### 1.3 Authentication & Authorization

#### **Passport.js + JWT**
```yaml
Status: ✅ KEEP (Current: passport-jwt 4.0.1)
Justifikasi:
  ✅ Industry standard
  ✅ NestJS first-class support (@nestjs/passport)
  ✅ Flexible strategy system
  ✅ JWT stateless → horizontally scalable

Enhancements:
  🆕 Refresh Token mechanism (7 days)
  🆕 Token rotation on refresh
  🆕 Blacklist for revoked tokens (Redis)
  🆕 Multi-device session management

Configuration:
  - Access Token: 1 day (secure but not too short)
  - Refresh Token: 7 days (stored in httpOnly cookie)
  - Algorithm: RS256 (asymmetric for better security)
  - Secret: Environment variable (never hardcoded)
```

#### **RBAC (Role-Based Access Control)**
```yaml
Status: 🆕 ENHANCE
Justifikasi:
  ✅ BLUD butuh granular permission (40+ modules)
  ✅ Segregation of Duties (SoD) untuk audit compliance

Implementation:
  - Guards: @nestjs/common Guards
  - Decorators: Custom @Roles(), @Permissions()
  - Database: roles, permissions, role_permissions tables

Roles Example:
  - SUPERADMIN (IT)
  - ADMIN_KEUANGAN (CFO)
  - BENDAHARA_PENERIMAAN
  - BENDAHARA_PENGELUARAN
  - AKUNTANSI
  - VERIFIKATOR
  - PPTK (Program-Kegiatan-Output owner)
  - VIEWER (Read-only)
```

---

### 1.4 API Documentation

#### **Swagger / OpenAPI 3.0**
```yaml
Status: ✅ KEEP (Current: @nestjs/swagger 11.2.6)
Justifikasi:
  ✅ Auto-generated from decorators
  ✅ Interactive API testing
  ✅ OpenAPI spec for external integration
  ✅ Essential for SIMRS/SIPD integration

Enhancements:
  🔄 Complete all endpoint documentation
  🔄 Add request/response examples
  🔄 Add error response schemas
  🔄 Group by modules (RBA, Belanja, Laporan, etc.)
  🔄 Add authentication examples

Endpoints Estimation:
  - Master Data: ~30 endpoints
  - RBA & Perencanaan: ~25 endpoints
  - Pendapatan: ~20 endpoints
  - Belanja (SPP-SPM-SP2D): ~30 endpoints
  - Penatausahaan: ~25 endpoints
  - Akuntansi: ~20 endpoints
  - Laporan Keuangan: ~15 endpoints
  - Laporan Penatausahaan: ~10 endpoints
  - Aset: ~15 endpoints
  - Gaji: ~10 endpoints
  - Pengadaan: ~15 endpoints
  - Pajak: ~15 endpoints
  - Dashboard: ~10 endpoints
  Total: ~240 endpoints
```

---

### 1.5 Validation & Transformation

#### **class-validator + class-transformer**
```yaml
Status: ✅ KEEP (Current: class-validator 0.14.3)
Justifikasi:
  ✅ NestJS native integration
  ✅ Decorator-based (consistent dengan NestJS style)
  ✅ Type-safe validation
  ✅ Custom validators support
  ✅ Transformation support (DTO → Entity)

Use Cases:
  ✅ Request body validation
  ✅ Query parameter validation
  ✅ Nested object validation (RBA structure)
  ✅ Custom BLUD rules (e.g., Nomor SPP format)

Example:
```typescript
export class CreateSPPDto {
  @IsEnum(JenisSPP)
  @ApiProperty({ enum: JenisSPP })
  jenisSPP: JenisSPP;

  @IsDecimal({ decimal_digits: '2' })
  @Min(0)
  @ApiProperty({ example: 1000000.00 })
  nilaiSPP: number;

  @IsUUID()
  @ApiProperty()
  outputId: string;

  @ValidateIf(o => o.jenisSPP === JenisSPP.LS)
  @IsNotEmpty({ message: 'Kontrak wajib untuk SPP-LS' })
  kontrakId?: string;
}
```
```

---

### 1.6 Logging

#### **Winston + nest-winston**
```yaml
Status: ✅ KEEP (Current: winston 3.19.0)
Justifikasi:
  ✅ Industry standard for Node.js
  ✅ Multiple transports (console, file, Loki)
  ✅ Log levels (error, warn, info, debug)
  ✅ Structured logging (JSON format)
  ✅ Context-aware logging

Configuration:
  Development:
    - Console transport (colorized)
    - File transport (logs/app.log)
    - Level: debug

  Production:
    - Loki transport (centralized)
    - File transport (rotation daily)
    - Level: info
    - JSON format (parseable)

Enhancement:
  🆕 Request ID tracking (correlation ID)
  🆕 User ID in log context
  🆕 Sensitive data masking (NIK, password)
  🆕 Log retention: 90 days
```

---

### 1.7 Job Queue & Background Tasks

#### **BullMQ (Redis-based)**
```yaml
Status: 🆕 ADD (Upgrade from Event Emitter)
Justifikasi:
  ✅ Reliable job processing
  ✅ Retry mechanism dengan exponential backoff
  ✅ Scheduled jobs (cron-like)
  ✅ Job prioritization
  ✅ Progress tracking
  ✅ Redis-based → already have Redis
  ✅ Better than Event Emitter untuk heavy tasks

Use Cases:
  - SIMRS data sync (scheduled every 5 minutes)
  - Laporan Keuangan generation (heavy computation)
  - PDF generation (async)
  - Email notifications (bulk)
  - Data export (Excel/CSV)
  - Penyusutan aset (monthly batch)
  - Jurnal auto-posting (batch)

Queue Categories:
  1. critical (SPP-SPM-SP2D, real-time)
  2. high (Pendapatan SIMRS sync)
  3. normal (Reports, notifications)
  4. low (Analytics, cleanup tasks)

Example:
```typescript
// Producer
await this.reportQueue.add('generate-lra', {
  tahun: 2026,
  bulan: 12,
  userId: user.id,
}, {
  priority: 2, // high
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
});

// Consumer
@Processor('report')
export class ReportProcessor {
  @Process('generate-lra')
  async handleLRA(job: Job<GenerateLRADto>) {
    const { tahun, bulan } = job.data;

    // Progress tracking
    await job.progress(10);

    // Generate report logic
    const data = await this.lraService.generate(tahun, bulan);
    await job.progress(50);

    const pdf = await this.pdfService.create(data);
    await job.progress(90);

    // Save to storage
    const url = await this.storageService.save(pdf);
    await job.progress(100);

    return { url };
  }
}
```
```

---

### 1.8 Event System

#### **@nestjs/event-emitter**
```yaml
Status: ✅ KEEP (Current: 3.0.1) for sync events
Justifikasi:
  ✅ Lightweight untuk sync events
  ✅ Built-in NestJS module
  ✅ Perfect untuk internal events

Use Cases (Sync Events):
  - Audit trail logging
  - Notification dispatch
  - Cache invalidation
  - Internal state updates

Kombinasi dengan BullMQ:
  - Event Emitter: Sync, in-process events
  - BullMQ: Async, heavy, retryable tasks

Example:
```typescript
// Emit event
this.eventEmitter.emit('spp.created', {
  sppId: spp.id,
  userId: user.id,
  timestamp: new Date(),
});

// Listen event
@OnEvent('spp.created')
async handleSPPCreated(payload: SPPCreatedEvent) {
  // Log to audit trail
  await this.auditService.log({
    action: 'SPP_CREATED',
    entityId: payload.sppId,
    userId: payload.userId,
  });

  // Send notification
  await this.notificationService.send({
    userId: payload.userId,
    message: 'SPP berhasil dibuat',
  });
}
```
```

---

### 1.9 Rate Limiting

#### **@nestjs/throttler**
```yaml
Status: ✅ KEEP (Current: 6.5.0)
Justifikasi:
  ✅ Built-in NestJS support
  ✅ Prevent brute force attacks
  ✅ Protect against DDoS
  ✅ API quota management

Configuration:
  Global:
    - 100 requests per minute per IP

  Authentication Endpoints:
    - 5 login attempts per 15 minutes per IP
    - 10 forgot password per hour per IP

  Heavy Endpoints (Reports):
    - 10 requests per minute per user

  Public Endpoints (Dashboard):
    - 200 requests per minute per IP

Example:
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 900000 } }) // 5 in 15 min
  async login(@Body() dto: LoginDto) {
    // ...
  }
}
```
```

---

### 1.10 File Upload & Storage

#### **MinIO (S3-Compatible)**
```yaml
Status: 🆕 ADD
Justifikasi:
  ✅ Self-hosted (cost effective)
  ✅ S3 API compatible (easy migration if needed)
  ✅ Scalable & distributed
  ✅ Object versioning support
  ✅ Bucket policies for access control

Use Cases:
  - Dokumen pendukung SPP (PDF, images)
  - Bukti transfer bank
  - SK Hibah
  - Kontrak pengadaan
  - Laporan PDF generated
  - Slip gaji PDF
  - Export files (Excel, CSV)

Bucket Structure:
  - spp-documents/
  - kontrak-documents/
  - hibah-documents/
  - reports-generated/
  - payroll-slips/
  - exports/

Configuration:
  - Max file size: 10MB (configurable)
  - Allowed types: PDF, JPG, PNG, XLSX, DOCX
  - Virus scanning: ClamAV integration
  - Retention: 10 years (audit requirement)

Alternative Considered:
  ❌ Local file system → Not scalable
  ❌ AWS S3 → Cost & vendor lock-in
  ❌ Google Cloud Storage → Same issues
```

---

## 2. Frontend Stack

### 2.1 Core Framework

#### **React 18.2 + TypeScript 5.2**
```yaml
Status: ✅ KEEP
Justifikasi:
  ✅ Industry standard (huge ecosystem)
  ✅ Component-based architecture
  ✅ Virtual DOM performance
  ✅ TypeScript support (type safety)
  ✅ Concurrent rendering (React 18)
  ✅ Server Components ready (future)
  ✅ Massive community & job market

Version Strategy:
  - React 18.x (stable)
  - Update to React 19 setelah 6 bulan stable
  - TypeScript 5.x (latest features)
```

---

### 2.2 Build Tool

#### **Vite 5.1**
```yaml
Status: ✅ KEEP
Justifikasi:
  ✅ Lightning fast HMR (Hot Module Replacement)
  ✅ Native ESM (no bundling in dev)
  ✅ Optimized production build (Rollup)
  ✅ Better DX than Webpack/CRA
  ✅ TypeScript support out-of-the-box
  ✅ Plugin ecosystem

Performance Comparison:
  - Dev server start: <1s (vs Webpack ~10s)
  - HMR: <50ms (vs Webpack ~500ms)
  - Production build: ~30s for large app

Configuration Enhancements:
  🔄 Code splitting optimization
  🔄 Tree shaking configuration
  🔄 Image optimization plugin
  🔄 Bundle size analysis
```

---

### 2.3 UI Framework & Styling

#### **Tailwind CSS 3.4**
```yaml
Status: ✅ KEEP (Current implementation)
Justifikasi:
  ✅ Utility-first → faster development
  ✅ Lightweight (purge unused CSS)
  ✅ Highly customizable
  ✅ Responsive design easy
  ✅ No CSS conflicts (no global styles)
  ✅ Better performance vs Ant Design

Comparison dengan Ant Design (Masterplan v2):
  Ant Design Pros:
    ✅ Pre-built components (forms, tables)
    ✅ Beautiful out-of-the-box
    ✅ Enterprise-grade

  Ant Design Cons:
    ❌ Bundle size besar (~500KB minified)
    ❌ Less customizable
    ❌ CSS override conflicts
    ❌ Opinionated design

  Tailwind Wins Because:
    ✅ Already implemented
    ✅ Bundle size ~30KB (with purge)
    ✅ Full control atas design
    ✅ Lebih cepat (no CSS-in-JS overhead)
    ✅ Modern & trending

Configuration:
```javascript
// tailwind.config.js
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // BLUD brand colors
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
```
```

---

### 2.4 Component Library

#### **shadcn/ui + Radix UI**
```yaml
Status: 🆕 ADD (Solusi untuk Ant Design replacement)
Justifikasi:
  ✅ Tailwind-based (konsisten dengan stack)
  ✅ Headless components (full control)
  ✅ Copy-paste approach (no dependency bloat)
  ✅ Accessible (ARIA compliant)
  ✅ Customizable 100%
  ✅ Modern & actively maintained

Components Needed:
  ✅ Button, Input, Select, Checkbox, Radio
  ✅ Form (dengan React Hook Form integration)
  ✅ Table (dengan sorting, filtering, pagination)
  ✅ Modal, Dialog, Alert
  ✅ Dropdown, Popover, Tooltip
  ✅ Tabs, Accordion
  ✅ DatePicker (untuk transaksi harian)
  ✅ Toast (notifications)
  ✅ Badge, Card, Avatar

Setup:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input form table
```

Architecture:
```typescript
// /src/components/ui/ (shadcn components)
// /src/components/shared/ (custom reusable)
// /src/components/modules/ (feature-specific)

// Example: Custom SPP Form Component
import { Form, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function SPPForm({ onSubmit }) {
  return (
    <Form onSubmit={onSubmit}>
      <FormField name="jenisSPP" label="Jenis SPP">
        <Select options={jenisSPPOptions} />
      </FormField>
      <FormField name="nilaiSPP" label="Nilai SPP">
        <Input type="number" />
      </FormField>
    </Form>
  );
}
```
```

#### **Headless UI (Kompleks Components)**
```yaml
Status: 🆕 ADD (Untuk advanced components)
Justifikasi:
  ✅ By Tailwind team (compatibility)
  ✅ Unstyled → full Tailwind control
  ✅ Accessible
  ✅ Perfect untuk custom complex components

Use Cases:
  - Multi-level dropdown menus
  - Combobox (autocomplete)
  - Listbox (custom select dengan search)
  - Transitions & animations
```

---

### 2.5 State Management

#### **Zustand 4.5**
```yaml
Status: ✅ KEEP (Current: 4.5.0)
Justifikasi:
  ✅ Minimal boilerplate (vs Redux)
  ✅ TypeScript native
  ✅ No Context Provider hell
  ✅ DevTools support
  ✅ Middleware support (persist, immer)
  ✅ Perfect untuk medium-sized apps

Comparison dengan Redux:
  Redux Pros:
    ✅ More mature
    ✅ Larger ecosystem
    ✅ Time-travel debugging

  Redux Cons:
    ❌ Boilerplate banyak (actions, reducers, etc.)
    ❌ Learning curve steep
    ❌ Overkill untuk Si-Kancil scale

  Zustand Wins Because:
    ✅ Simple & readable
    ✅ Less code = less bugs
    ✅ Faster development
    ✅ Sufficient untuk BLUD app complexity

Store Structure:
```typescript
// /src/stores/auth.store.ts
interface AuthState {
  user: User | null;
  token: string | null;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,

  login: async (credentials) => {
    const { user, token } = await authApi.login(credentials);
    set({ user, token });
    localStorage.setItem('token', token);
  },

  logout: () => {
    set({ user: null, token: null });
    localStorage.removeItem('token');
  },

  isAuthenticated: () => !!get().token,
}));

// /src/stores/rba.store.ts (Module-specific)
// /src/stores/spp.store.ts
// /src/stores/ui.store.ts (sidebar, theme, etc.)
```

Middleware:
```typescript
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist<AuthState>(
    (set) => ({
      // ... state
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token, // Only persist token
      }),
    }
  )
);
```
```

---

### 2.6 Data Fetching & Caching

#### **TanStack Query 5.20 (React Query)**
```yaml
Status: ✅ KEEP (Current: 5.20.0)
Justifikasi:
  ✅ Smart caching (reduce API calls)
  ✅ Auto refetch on window focus
  ✅ Optimistic updates (better UX)
  ✅ Pagination & infinite scroll
  ✅ Background refetch
  ✅ Error retry mechanism
  ✅ DevTools (query inspection)

Use Cases:
  - Fetch master data (Chart of Accounts, Unit Kerja)
  - Fetch transaksi (SPP, BKU, Jurnal)
  - Real-time dashboard data
  - Laporan generation status polling

Configuration:
```typescript
// /src/lib/react-query.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Usage
export function useSPPList(filter: SPPFilter) {
  return useQuery({
    queryKey: ['spp', 'list', filter],
    queryFn: () => sppApi.getList(filter),
    staleTime: 1000 * 60 * 2, // 2 min (transaksi update frequently)
  });
}

export function useCreateSPP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSPPDto) => sppApi.create(data),
    onSuccess: () => {
      // Invalidate & refetch
      queryClient.invalidateQueries({ queryKey: ['spp', 'list'] });

      // Optimistic update
      queryClient.setQueryData(['spp', 'list'], (old) => {
        return [...old, newSPP];
      });
    },
  });
}
```
```

---

### 2.7 Form Management

#### **React Hook Form 7.50 + Zod 3.22**
```yaml
Status: ✅ KEEP (Current implementation)
Justifikasi:
  ✅ Performance (uncontrolled components)
  ✅ Less re-renders (vs Formik)
  ✅ TypeScript support
  ✅ Zod integration (type-safe validation)
  ✅ Built-in error handling
  ✅ DevTools available

Perfect untuk BLUD karena:
  ✅ Complex forms (RBA multi-step)
  ✅ Nested fields (Program → Kegiatan → Output)
  ✅ Dynamic fields (Anggaran bulanan 12 bulan)
  ✅ File upload (dokumen SPP)

Example:
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const sppSchema = z.object({
  jenisSPP: z.enum(['UP', 'GU', 'TU', 'LS']),
  tanggalSPP: z.date(),
  nilaiSPP: z.number().min(0).max(999999999999.99),
  outputId: z.string().uuid(),
  uraian: z.string().min(10).max(500),
  dokumen: z.instanceof(File).optional(),
});

type SPPFormData = z.infer<typeof sppSchema>;

export function SPPForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<SPPFormData>({
    resolver: zodResolver(sppSchema),
  });

  const onSubmit = async (data: SPPFormData) => {
    await createSPP(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <select {...register('jenisSPP')}>
        <option value="UP">UP</option>
        <option value="GU">GU</option>
      </select>
      {errors.jenisSPP && <span>{errors.jenisSPP.message}</span>}

      <input type="number" {...register('nilaiSPP', { valueAsNumber: true })} />
      {errors.nilaiSPP && <span>{errors.nilaiSPP.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```
```

---

### 2.8 Routing

#### **React Router DOM 6.22**
```yaml
Status: ✅ KEEP (Current: 6.22.0)
Justifikasi:
  ✅ Industry standard
  ✅ Data fetching integration (loader)
  ✅ Nested routes (perfect untuk dashboard layout)
  ✅ Protected routes (auth guards)
  ✅ TypeScript support

Route Structure:
```typescript
// /src/routes/index.tsx
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AuthGuard><DashboardLayout /></AuthGuard>,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'rba',
        children: [
          { index: true, element: <RBAListPage /> },
          { path: 'create', element: <RBAFormPage /> },
          { path: ':id', element: <RBADetailPage /> },
          { path: ':id/edit', element: <RBAFormPage /> },
        ],
      },
      {
        path: 'spp',
        children: [
          { index: true, element: <SPPListPage /> },
          { path: 'create', element: <SPPFormPage /> },
          { path: ':id', element: <SPPDetailPage /> },
        ],
      },
      // ... 40+ module routes
    ],
  },
]);

// Protected Route Component
function AuthGuard({ children }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  return children;
}
```
```

---

### 2.9 Charts & Visualization

#### **Recharts 2.12**
```yaml
Status: ✅ KEEP (Current: 2.12.0)
Justifikasi:
  ✅ React-first (component-based)
  ✅ Responsive by default
  ✅ Customizable
  ✅ Good documentation
  ✅ TypeScript support

Dashboard Charts Needed:
  - Line Chart: Trend pendapatan/belanja (monthly)
  - Bar Chart: Realisasi per program/kegiatan
  - Pie Chart: Komposisi pendapatan by source
  - Area Chart: Cash flow projection
  - Composed Chart: Budget vs Actual comparison

Example:
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function PendapatanTrendChart({ data }) {
  return (
    <LineChart width={800} height={400} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="bulan" />
      <YAxis />
      <Tooltip formatter={(value) => formatCurrency(value)} />
      <Legend />
      <Line type="monotone" dataKey="target" stroke="#3b82f6" name="Target" />
      <Line type="monotone" dataKey="realisasi" stroke="#10b981" name="Realisasi" />
    </LineChart>
  );
}
```
```

#### **Apache ECharts (Advanced Charts)**
```yaml
Status: 🆕 ADD (Optional untuk advanced viz)
Justifikasi:
  ✅ More chart types (Gantt, Sankey, Tree)
  ✅ Better performance (canvas-based)
  ✅ Interactive features

Use Cases:
  - Gantt chart: Project timeline (RBA realization)
  - Sankey diagram: Budget flow visualization
  - Tree map: Budget distribution hierarchy
  - Heat map: Monthly transaction pattern

Note: Only use untuk advanced viz, Recharts untuk standard charts
```

---

### 2.10 Icons

#### **Lucide React**
```yaml
Status: ✅ KEEP (Current: 0.323.0)
Justifikasi:
  ✅ Lightweight (tree-shakeable)
  ✅ Consistent design
  ✅ 1000+ icons
  ✅ TypeScript support
  ✅ Customizable (size, color, stroke)

Alternative Considered:
  ❌ FontAwesome → Heavier, paid for Pro
  ❌ Material Icons → Too many unused icons
  ❌ Heroicons → Limited set

Usage:
```typescript
import { FileText, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export function StatCard({ title, value, icon: Icon, trend }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <Icon className="w-8 h-8 text-blue-500" />
      </div>
    </div>
  );
}
```
```

---

### 2.11 Date & Time

#### **date-fns 3.3**
```yaml
Status: ✅ KEEP (Current: 3.3.0)
Justifikasi:
  ✅ Modular (tree-shakeable)
  ✅ Immutable (functional programming)
  ✅ TypeScript support
  ✅ i18n support (Bahasa Indonesia)
  ✅ Smaller bundle vs Moment.js

Comparison:
  ❌ Moment.js → Deprecated, large bundle
  ❌ Day.js → Smaller tapi less features
  ❌ Luxon → Heavier, timezone complexity

Common Use Cases:
  - Format tanggal (DD/MM/YYYY, DD MMM YYYY)
  - Parse ISO string
  - Date calculation (start/end of month)
  - Validation (is valid date)
  - Relative time (time ago)

Example:
```typescript
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

// Format
format(new Date(), 'dd MMMM yyyy', { locale: id }); // "15 Februari 2026"

// Filter transaksi bulan ini
const thisMonth = {
  from: startOfMonth(new Date()),
  to: endOfMonth(new Date()),
};
```
```

---

### 2.12 HTTP Client

#### **Axios 1.6.5**
```yaml
Status: ✅ KEEP (Current: 1.6.5)
Justifikasi:
  ✅ Feature-rich (interceptors, timeout, etc.)
  ✅ Browser & Node.js support
  ✅ Request/Response interceptors (auth token)
  ✅ Auto JSON transformation
  ✅ Error handling
  ✅ TypeScript support

Configuration:
```typescript
// /src/lib/axios.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (add auth token)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handle 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

API Modules:
```typescript
// /src/api/spp.api.ts
export const sppApi = {
  getList: (filter: SPPFilter) =>
    api.get<SPP[]>('/spp', { params: filter }),

  getById: (id: string) =>
    api.get<SPP>(`/spp/${id}`),

  create: (data: CreateSPPDto) =>
    api.post<SPP>('/spp', data),

  update: (id: string, data: UpdateSPPDto) =>
    api.patch<SPP>(`/spp/${id}`, data),

  delete: (id: string) =>
    api.delete(`/spp/${id}`),
};
```
```

---

## 3. Database & Caching

### 3.1 Primary Database

#### **PostgreSQL 17**
```yaml
Status: 🔄 UPGRADE from 15 (Current: likely 15)
Justifikasi:
  ✅ ACID compliant (audit requirement)
  ✅ Mature & stable (25+ years)
  ✅ JSON/JSONB support (flexible schema)
  ✅ Advanced features (CTEs, window functions)
  ✅ Full-text search
  ✅ Open source (no licensing cost)

PostgreSQL 17 New Features (vs 15):
  ✅ Improved partitioning performance
  ✅ Better incremental backups
  ✅ VACUUM improvements (less bloat)
  ✅ Better query planner
  ✅ Faster bulk loading
  ✅ JSON improvements

Why 17 vs 15:
  - Partitioning → Critical untuk transaksi tables (by tahun)
  - Performance → ~20% faster queries on partitioned tables
  - Backup → Incremental backup → faster disaster recovery

Database Size Estimation (after 5 years):
  - Transaksi tables: ~50GB (dengan partitioning)
  - Master data: ~500MB
  - Audit logs: ~20GB
  - Total: ~70GB

Configuration Enhancements:
```sql
-- postgresql.conf
max_connections = 100
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1 # SSD
effective_io_concurrency = 200
work_mem = 20MB
min_wal_size = 1GB
max_wal_size = 4GB
```

Partitioning Strategy:
```sql
-- Partisi transaksi by tahun (performance)
CREATE TABLE jurnal (
  id UUID PRIMARY KEY,
  tanggal DATE NOT NULL,
  tahun INT GENERATED ALWAYS AS (EXTRACT(YEAR FROM tanggal)) STORED,
  -- ... other columns
) PARTITION BY RANGE (tahun);

CREATE TABLE jurnal_2024 PARTITION OF jurnal
  FOR VALUES FROM (2024) TO (2025);

CREATE TABLE jurnal_2025 PARTITION OF jurnal
  FOR VALUES FROM (2025) TO (2026);

-- Auto-create partitions via script/function
```

Indexes:
```sql
-- Composite indexes untuk common queries
CREATE INDEX idx_jurnal_tanggal_kode ON jurnal(tanggal, kode_rekening);
CREATE INDEX idx_spp_status_tanggal ON spp(status, tanggal_spp);
CREATE INDEX idx_bku_bulan_tahun ON buku_kas_umum(bulan, tahun, jenis_bku);

-- GIN index untuk full-text search
CREATE INDEX idx_spp_uraian_search ON spp
  USING gin(to_tsvector('indonesian', uraian));
```
```

---

### 3.2 Caching Layer

#### **Redis 7.x**
```yaml
Status: ✅ KEEP & ENHANCE (Current: configured but underutilized)
Justifikasi:
  ✅ In-memory speed (sub-millisecond latency)
  ✅ Pub/Sub for real-time (SIMRS events)
  ✅ Session storage (JWT blacklist)
  ✅ Queue backing store (BullMQ)
  ✅ Cache frequently accessed data

Use Cases:
  1. Session Management:
     - JWT blacklist (logout, token revocation)
     - Active sessions tracking
     - TTL: Same as JWT expiry

  2. Data Caching:
     - Master data (Chart of Accounts, Unit Kerja)
     - User permissions (RBAC)
     - Dashboard aggregations
     - TTL: 5-15 minutes

  3. Pub/Sub (Real-time):
     - SIMRS billing events
     - SPP approval notifications
     - Dashboard real-time updates

  4. Queue (BullMQ):
     - Job storage & processing
     - Scheduled tasks

  5. Rate Limiting:
     - API throttling counters
     - Login attempt tracking

Configuration:
```yaml
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru # Evict least recently used
save 900 1    # Save after 900s if 1 key changed
save 300 10   # Save after 300s if 10 keys changed
save 60 10000 # Save after 60s if 10000 keys changed
appendonly yes # AOF for durability
```

Code Example:
```typescript
// Cache service
@Injectable()
export class CacheService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: any, ttl: number = 300): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(...keys);
    }
  }
}

// Usage in service
async getChartOfAccounts() {
  const cacheKey = 'master:coa:all';

  // Try cache first
  let data = await this.cache.get(cacheKey);

  if (!data) {
    // Cache miss, fetch from DB
    data = await this.coaRepository.find();

    // Store in cache (15 min TTL)
    await this.cache.set(cacheKey, data, 900);
  }

  return data;
}
```
```

---

## 4. Integration Layer

### 4.1 SIMRS Integration

#### **Webhook-based (Event-driven)**
```yaml
Status: 🔄 UPGRADE from Polling (Masterplan v2: <5 min polling)
Justifikasi:
  ✅ Real-time (<1 second vs 5 minutes)
  ✅ No polling overhead (save server resources)
  ✅ Immediate data consistency
  ✅ Event-driven architecture (scalable)

Architecture:
  SIMRS → Webhook Endpoint → BullMQ Queue → Process → Auto-Posting Jurnal

Webhook Security:
  ✅ HMAC signature verification
  ✅ IP whitelist
  ✅ Request timestamp validation (prevent replay)
  ✅ Rate limiting

Implementation:
```typescript
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly simrsQueue: Queue,
    private readonly webhookService: WebhookService,
  ) {}

  @Post('simrs/billing')
  @UseGuards(WebhookSignatureGuard) // HMAC verification
  async handleBilling(@Body() payload: SIMRSBillingEvent) {
    // Validate signature
    const isValid = this.webhookService.verifySignature(
      payload,
      request.headers['x-signature']
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid signature');
    }

    // Add to queue for processing
    await this.simrsQueue.add('process-billing', payload, {
      priority: 1, // High priority
      attempts: 3,
    });

    return { status: 'accepted' };
  }
}

// Queue processor
@Processor('simrs')
export class SIMRSProcessor {
  @Process('process-billing')
  async handleBilling(job: Job<SIMRSBillingEvent>) {
    const { patientId, billAmount, services, penjamin } = job.data;

    // 1. Create Pendapatan record
    const pendapatan = await this.pendapatanService.create({
      tanggal: new Date(),
      jumlah: billAmount,
      sumber: 'SIMRS',
      penjamin,
      patientId,
    });

    // 2. Auto-posting jurnal
    await this.jurnalService.autoPost('PENDAPATAN', pendapatan);

    // 3. Update piutang (if BPJS)
    if (penjamin === 'BPJS') {
      await this.piutangService.create({
        patientId,
        amount: billAmount,
        dueDate: addDays(new Date(), 30),
      });
    }

    // 4. Emit event for real-time dashboard
    this.eventEmitter.emit('pendapatan.created', pendapatan);
  }
}
```

Fallback Strategy (if SIMRS doesn't support webhook):
```typescript
// Polling with BullMQ scheduled job (every 5 minutes)
@Injectable()
export class SIMRSSyncService {
  @Cron('*/5 * * * *') // Every 5 minutes
  async syncBilling() {
    const lastSync = await this.getLastSyncTimestamp();
    const newBillings = await this.simrsApi.getBillings({ since: lastSync });

    for (const billing of newBillings) {
      await this.processBilling(billing);
    }

    await this.updateLastSyncTimestamp();
  }
}
```
```

---

### 4.2 Bank Integration

#### **Host-to-Host + Virtual Account**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3)
Justifikasi:
  ✅ Auto-reconciliation (no manual matching)
  ✅ Unique VA per penjamin/pasien
  ✅ Real-time notification (payment received)
  ✅ Reduce human error

Use Cases:
  1. Penerimaan Pendapatan:
     - Generate VA per pasien
     - Bank notif → auto-create Penerimaan record
     - Auto-posting jurnal

  2. SP2D Online:
     - Submit SPM → Bank
     - Bank process → SP2D issued
     - Bank notif → auto-update status

Architecture:
  Si-Kancil → Bank API (SOAP/REST) → Callback Webhook

Implementation:
```typescript
// VA Generation
@Injectable()
export class VirtualAccountService {
  async generateVA(patientId: string, amount: number): Promise<string> {
    // Format: {bank_code}{blud_code}{patient_id}
    // Example: 002 + 1234 + 00001 = 002123400001
    const va = `${BANK_CODE}${BLUD_CODE}${patientId.padStart(5, '0')}`;

    // Register to bank
    await this.bankApi.createVA({
      accountNumber: va,
      amount,
      expiry: addDays(new Date(), 7), // 7 days
      name: `Pasien ${patientId}`,
    });

    // Store in DB
    await this.vaRepository.save({
      accountNumber: va,
      patientId,
      amount,
      status: 'ACTIVE',
    });

    return va;
  }

  @Post('webhooks/bank/payment')
  async handlePayment(@Body() payload: BankPaymentNotif) {
    const { accountNumber, amount, timestamp } = payload;

    // Find VA
    const va = await this.vaRepository.findOne({
      where: { accountNumber }
    });

    if (!va) {
      throw new NotFoundException('VA not found');
    }

    // Create Penerimaan
    const penerimaan = await this.penerimaanService.create({
      virtualAccount: accountNumber,
      jumlah: amount,
      tanggal: new Date(timestamp),
      patientId: va.patientId,
    });

    // Auto-posting jurnal
    await this.jurnalService.autoPost('PENERIMAAN', penerimaan);

    // Update VA status
    await this.vaRepository.update(va.id, { status: 'PAID' });

    return { status: 'success' };
  }
}
```
```

---

### 4.3 SIPD RI Integration

#### **API Adapter (Export format SIPD)**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3)
Justifikasi:
  ✅ Mandatory pelaporan ke Kemendagri
  ✅ Triwulanan submission
  ✅ Standardized format (XML/JSON)

Architecture:
  Si-Kancil → Generate SIPD Format → Submit API SIPD RI

Data yang dikirim:
  - Realisasi Pendapatan (per triwulan)
  - Realisasi Belanja (per kode rekening)
  - SPJ Fungsional (summary)

Implementation:
```typescript
@Injectable()
export class SIPDExportService {
  async exportRealisasi(tahun: number, triwulan: number): Promise<SIPDFormat> {
    // Fetch data
    const pendapatan = await this.lraService.getRealisasiPendapatan(tahun, triwulan);
    const belanja = await this.lraService.getRealisasiBelanja(tahun, triwulan);

    // Transform to SIPD format
    const sipdData = {
      header: {
        kodeBlud: BLUD_CODE,
        namaBlud: 'RSUD ...',
        tahun,
        triwulan,
      },
      pendapatan: pendapatan.map(p => ({
        kodeRekening: p.kodeRekening,
        uraian: p.uraian,
        anggaran: p.pagu,
        realisasi: p.realisasi,
      })),
      belanja: belanja.map(b => ({
        kodeRekening: b.kodeRekening,
        uraian: b.uraian,
        anggaran: b.pagu,
        realisasi: b.realisasi,
      })),
    };

    return sipdData;
  }

  async submitToSIPD(data: SIPDFormat): Promise<SIPDResponse> {
    // Call SIPD API
    const response = await this.sipdApi.submit(data);

    // Log submission
    await this.sipdLogRepository.save({
      tahun: data.header.tahun,
      triwulan: data.header.triwulan,
      status: response.status,
      timestamp: new Date(),
    });

    return response;
  }
}
```

Manual Export Option:
```typescript
// Export to Excel format (jika API SIPD belum ready)
@Get('sipd/export/:tahun/:triwulan')
async exportExcel(@Param('tahun') tahun: number, @Param('triwulan') triwulan: number) {
  const data = await this.sipdService.exportRealisasi(tahun, triwulan);

  // Generate Excel file
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Realisasi');

  // ... populate sheet

  const buffer = await workbook.xlsx.writeBuffer();

  return new StreamableFile(buffer);
}
```
```

---

### 4.4 DJP Online (e-Bupot)

#### **CSV Export Format**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3)
Justifikasi:
  ✅ Wajib lapor SPT Masa
  ✅ e-Bupot Unifikasi format (2024+)
  ✅ Reduce manual entry

Implementation:
```typescript
@Injectable()
export class PajakExportService {
  async exportEBupot(bulan: number, tahun: number, jenisPajak: string): Promise<string> {
    // Fetch pajak data
    const pajakRecords = await this.pajakRepository.find({
      where: {
        bulan,
        tahun,
        jenisPajak,
      },
      relations: ['supplier'],
    });

    // Generate CSV format e-Bupot
    const csv = [];

    // Header
    csv.push([
      'NPWP',
      'Nama',
      'Alamat',
      'Kode Objek Pajak',
      'Jumlah Bruto',
      'Tarif',
      'PPh Dipotong',
    ].join(','));

    // Data rows
    for (const pajak of pajakRecords) {
      csv.push([
        pajak.supplier.npwp,
        pajak.supplier.nama,
        pajak.supplier.alamat,
        pajak.kodeObjekPajak,
        pajak.jumlahBruto,
        pajak.tarif,
        pajak.pphDipotong,
      ].join(','));
    }

    return csv.join('\n');
  }

  @Get('pajak/export/ebupot')
  async downloadEBupot(@Query() query: EBupotExportDto) {
    const csv = await this.pajakService.exportEBupot(
      query.bulan,
      query.tahun,
      query.jenisPajak
    );

    return new StreamableFile(Buffer.from(csv), {
      type: 'text/csv',
      disposition: `attachment; filename=ebupot_${query.jenisPajak}_${query.bulan}_${query.tahun}.csv`,
    });
  }
}
```
```

---

## 5. DevOps & Infrastructure

### 5.1 Containerization

#### **Docker + Docker Compose**
```yaml
Status: 🆕 ADD (Not in current implementation)
Justifikasi:
  ✅ Consistent environment (dev = prod)
  ✅ Easy onboarding (new developer)
  ✅ Isolation (services don't conflict)
  ✅ Portability (run anywhere)

Development Setup:
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: sikancil_dev
      POSTGRES_USER: sikancil_user
      POSTGRES_PASSWORD: sikancil_dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U sikancil_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001" # Console
    environment:
      MINIO_ROOT_USER: minio_admin
      MINIO_ROOT_PASSWORD: minio_password
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      REDIS_HOST: redis
      REDIS_PORT: 6379
    volumes:
      - ./backend:/app
      - /app/node_modules
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    command: npm run start:dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev -- --host

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

Production Dockerfile:
```dockerfile
# backend/Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
```
```

---

### 5.2 Orchestration

#### **Kubernetes (Production HA)**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3)
Justifikasi:
  ✅ High Availability (auto restart, scaling)
  ✅ Load balancing (multiple backend instances)
  ✅ Rolling updates (zero downtime)
  ✅ Self-healing (auto-recovery)
  ✅ Production-grade (battle-tested)

Architecture:
  - 2+ Backend pods (horizontal scaling)
  - 1 PostgreSQL StatefulSet (with PV)
  - 1 Redis StatefulSet
  - 1 MinIO StatefulSet
  - 1 Nginx Ingress (load balancer)

Manifests:
```yaml
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sikancil-backend
spec:
  replicas: 2 # High availability
  selector:
    matchLabels:
      app: sikancil-backend
  template:
    metadata:
      labels:
        app: sikancil-backend
    spec:
      containers:
      - name: backend
        image: registry.example.com/sikancil-backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: sikancil-backend-service
spec:
  selector:
    app: sikancil-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sikancil-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - sikancil.rsud.go.id
    secretName: sikancil-tls
  rules:
  - host: sikancil.rsud.go.id
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: sikancil-backend-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sikancil-frontend-service
            port:
              number: 80
```
```

---

### 5.3 CI/CD Pipeline

#### **GitHub Actions**
```yaml
Status: 🆕 ADD
Justifikasi:
  ✅ Native to GitHub
  ✅ Free for private repos
  ✅ YAML-based (version controlled)
  ✅ Rich marketplace (actions)

Pipeline Stages:
  1. Lint & Format Check
  2. Unit Tests
  3. Build
  4. Integration Tests
  5. Security Scan (SonarQube)
  6. Docker Build & Push
  7. Deploy to Staging
  8. E2E Tests (Staging)
  9. Deploy to Production (manual approval)

Implementation:
```.github/workflows/backend.yml
name: Backend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:17
        env:
          POSTGRES_DB: test_db
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 3s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Lint
        working-directory: ./backend
        run: npm run lint

      - name: Run migrations
        working-directory: ./backend
        run: npm run migration:run
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_USERNAME: test_user
          DB_PASSWORD: test_password
          DB_DATABASE: test_db

      - name: Run tests
        working-directory: ./backend
        run: npm run test:cov
        env:
          DB_HOST: localhost
          REDIS_HOST: localhost

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: registry.example.com
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: registry.example.com/sikancil-backend:${{ github.sha }},registry.example.com/sikancil-backend:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging

    steps:
      - name: Deploy to Staging
        run: |
          # kubectl commands to update deployment
          kubectl set image deployment/sikancil-backend \
            backend=registry.example.com/sikancil-backend:${{ github.sha }} \
            -n staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to Production
        run: |
          kubectl set image deployment/sikancil-backend \
            backend=registry.example.com/sikancil-backend:${{ github.sha }} \
            -n production
          kubectl rollout status deployment/sikancil-backend -n production
```
```

---

### 5.4 Reverse Proxy

#### **Nginx**
```yaml
Status: 🆕 ADD
Justifikasi:
  ✅ High performance
  ✅ SSL/TLS termination
  ✅ Load balancing (multiple backend instances)
  ✅ Static file serving (frontend)
  ✅ Caching
  ✅ Rate limiting
  ✅ Request size limit

Configuration:
```nginx
# nginx.conf
upstream backend {
    least_conn; # Load balancing algorithm
    server backend-1:3000 max_fails=3 fail_timeout=30s;
    server backend-2:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth_limit:10m rate=5r/m;

server {
    listen 80;
    server_name sikancil.rsud.go.id;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sikancil.rsud.go.id;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Request size limit (10MB for file uploads)
    client_max_body_size 10M;

    # Frontend (React SPA)
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        limit_req zone=api_limit burst=20 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Connection "";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }

    # Auth endpoints (stricter rate limit)
    location /api/auth {
        limit_req zone=auth_limit burst=5 nodelay;

        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Swagger API Docs (only in staging/dev)
    location /api/docs {
        auth_basic "Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;

        proxy_pass http://backend;
    }

    # Health check (no rate limit)
    location /health {
        proxy_pass http://backend/health;
        access_log off;
    }
}
```
```

---

## 6. Security & Compliance

### 6.1 Data Encryption

#### **AES-256 (at rest) + TLS 1.3 (in transit)**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3 - UU PDP Compliance)
Justifikasi:
  ✅ UU PDP (Undang-Undang Perlindungan Data Pribadi) compliance
  ✅ Protect sensitive data (NIK, Data pasien, Gaji)
  ✅ Audit requirement (BPK)

Data Classification:
  🔒 Highly Sensitive (Encrypt):
    - NIK
    - Nomor Rekening Bank
    - Data Pasien (nama, alamat, diagnosa)
    - Gaji & Honorarium

  🔓 Less Sensitive (No encryption):
    - Transaksi keuangan (already protected by audit trail)
    - Master data (CoA, Unit Kerja)

Implementation:
```typescript
// Encryption service
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(configService: ConfigService) {
    // Key from environment (32 bytes for AES-256)
    this.key = Buffer.from(configService.get('ENCRYPTION_KEY'), 'hex');
  }

  encrypt(text: string): string {
    const iv = randomBytes(16); // Initialization vector
    const cipher = createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedHex] = encrypted.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(this.algorithm, this.key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// Entity with encrypted field
@Entity()
export class Pegawai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nama: string;

  @Column({ type: 'text' })
  @Encrypted() // Custom decorator
  nik: string; // Encrypted in DB

  @Column({ type: 'text', nullable: true })
  @Encrypted()
  nomorRekening?: string;
}

// Custom transformer
export function Encrypted() {
  return function (target: any, propertyKey: string) {
    const encryptionService = new EncryptionService(/* ... */);

    // Subscriber to encrypt before insert/update
    EventSubscriber()(class {
      beforeInsert(event: InsertEvent<any>) {
        if (event.entity[propertyKey]) {
          event.entity[propertyKey] = encryptionService.encrypt(
            event.entity[propertyKey]
          );
        }
      }

      beforeUpdate(event: UpdateEvent<any>) {
        if (event.entity[propertyKey]) {
          event.entity[propertyKey] = encryptionService.encrypt(
            event.entity[propertyKey]
          );
        }
      }

      afterLoad(entity: any) {
        if (entity[propertyKey]) {
          entity[propertyKey] = encryptionService.decrypt(
            entity[propertyKey]
          );
        }
      }
    });
  };
}
```

PostgreSQL Encryption (pgcrypto):
```sql
-- Alternative: DB-level encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt on insert
INSERT INTO pegawai (nama, nik) VALUES (
  'John Doe',
  pgp_sym_encrypt('1234567890123456', 'encryption_key')
);

-- Decrypt on select
SELECT
  nama,
  pgp_sym_decrypt(nik::bytea, 'encryption_key') as nik
FROM pegawai;
```
```

---

### 6.2 Audit Trail

#### **Immutable Audit Log**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3)
Justifikasi:
  ✅ Audit requirement (BPK compliance)
  ✅ Forensic investigation
  ✅ Non-repudiation (cannot deny action)
  ✅ 10-year retention (regulatory)

Features:
  - Append-only table (no UPDATE/DELETE)
  - Capture: Who, What, When, Where, Why
  - Hash chain (tamper detection)
  - Separate database (isolation)

Implementation:
```typescript
// Audit log entity
@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  userName: string;

  @Column()
  action: string; // CREATE, UPDATE, DELETE, APPROVE, etc.

  @Column()
  entityType: string; // SPP, BKU, Jurnal, etc.

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: any; // Before state

  @Column({ type: 'jsonb', nullable: true })
  newValue: any; // After state

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ nullable: true })
  reason: string; // For reversals, corrections

  @Column({ type: 'text' })
  hash: string; // SHA-256 hash of (prevHash + data)

  @Column({ type: 'text', nullable: true })
  prevHash: string; // Chain to previous log
}

// Audit service
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async log(params: AuditLogParams) {
    const { userId, action, entityType, entityId, oldValue, newValue, ipAddress, userAgent, reason } = params;

    // Get previous hash
    const lastLog = await this.auditRepo.findOne({
      order: { timestamp: 'DESC' },
    });

    const prevHash = lastLog?.hash || '';

    // Calculate hash (tamper detection)
    const data = JSON.stringify({ userId, action, entityType, entityId, newValue, timestamp: new Date() });
    const hash = createHash('sha256').update(prevHash + data).digest('hex');

    // Create log (append-only)
    const log = this.auditRepo.create({
      userId,
      userName: params.userName,
      action,
      entityType,
      entityId,
      oldValue,
      newValue,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      reason,
      hash,
      prevHash,
    });

    await this.auditRepo.insert(log); // INSERT only, no UPDATE/DELETE

    return log;
  }

  async verify(id: string): Promise<boolean> {
    const log = await this.auditRepo.findOneOrFail({ where: { id } });

    // Recalculate hash
    const data = JSON.stringify({
      userId: log.userId,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      newValue: log.newValue,
      timestamp: log.timestamp,
    });

    const calculatedHash = createHash('sha256')
      .update(log.prevHash + data)
      .digest('hex');

    return calculatedHash === log.hash;
  }
}

// Audit decorator (auto-log on method call)
export function Audit(action: string, entityType: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await originalMethod.apply(this, args);

      const auditService = this.auditService; // Injected in service
      const request = this.request; // Injected via REQUEST scope

      await auditService.log({
        userId: request.user.id,
        userName: request.user.name,
        action,
        entityType,
        entityId: result?.id,
        newValue: result,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return result;
    };

    return descriptor;
  };
}

// Usage
@Injectable()
export class SPPService {
  constructor(
    private readonly auditService: AuditService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @Audit('SPP_CREATED', 'SPP')
  async create(dto: CreateSPPDto) {
    const spp = await this.sppRepository.save(dto);
    return spp; // Auto-logged by decorator
  }

  @Audit('SPP_APPROVED', 'SPP')
  async approve(id: string, reason: string) {
    const spp = await this.sppRepository.findOneOrFail({ where: { id } });
    spp.status = 'APPROVED';
    spp.approvedAt = new Date();
    await this.sppRepository.save(spp);
    return spp;
  }
}
```

Database Constraint:
```sql
-- Prevent UPDATE/DELETE on audit_logs
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit logs are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_update_audit
BEFORE UPDATE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER prevent_delete_audit
BEFORE DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
```
```

---

### 6.3 Fraud Detection

#### **Anomaly Detection System**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3)
Justifikasi:
  ✅ Detect suspicious activities
  ✅ Prevent corruption (pemecahan kuitansi, etc.)
  ✅ Alert management immediately

Detection Rules:
  1. After-hours activity:
     - Transaction created/approved after 22:00 or before 06:00
     - Alert: Notify admin immediately

  2. Pemecahan nominal (split invoices to avoid tender):
     - Multiple SPP same supplier < threshold (e.g., < 50 juta)
     - Within short timeframe (e.g., same day)
     - Alert: Suspicious, require justification

  3. Rapid approval:
     - SPP created & approved within 5 minutes
     - Alert: Possible collusion

  4. Large amount:
     - SPP > threshold (e.g., 100 juta)
     - Alert: Require additional approval

  5. Backdated transactions:
     - Transaction date < system date - 7 days
     - Alert: Require justification

Implementation:
```typescript
@Injectable()
export class FraudDetectionService {
  constructor(
    private readonly alertService: AlertService,
    private readonly sppRepository: Repository<SPP>,
  ) {}

  async checkSPP(spp: SPP) {
    const alerts: FraudAlert[] = [];

    // Rule 1: After-hours
    const hour = spp.createdAt.getHours();
    if (hour >= 22 || hour < 6) {
      alerts.push({
        type: 'AFTER_HOURS',
        severity: 'MEDIUM',
        message: `SPP created at ${spp.createdAt.toISOString()} (outside working hours)`,
        entityId: spp.id,
      });
    }

    // Rule 2: Pemecahan nominal
    const recentSPPs = await this.sppRepository.find({
      where: {
        supplierId: spp.supplierId,
        tanggalSPP: Between(
          subDays(spp.tanggalSPP, 7),
          addDays(spp.tanggalSPP, 7)
        ),
        status: In(['APPROVED', 'SUBMITTED']),
      },
    });

    const totalNilai = recentSPPs.reduce((sum, s) => sum + Number(s.nilaiSPP), 0);
    const threshold = 50_000_000; // 50 juta

    if (recentSPPs.length >= 3 && recentSPPs.every(s => Number(s.nilaiSPP) < threshold) && totalNilai > threshold) {
      alerts.push({
        type: 'INVOICE_SPLITTING',
        severity: 'HIGH',
        message: `Suspected invoice splitting: ${recentSPPs.length} SPPs to same supplier within 7 days, total ${totalNilai}`,
        entityId: spp.id,
      });
    }

    // Rule 3: Rapid approval
    if (spp.approvedAt) {
      const approvalDuration = differenceInMinutes(spp.approvedAt, spp.createdAt);
      if (approvalDuration < 5) {
        alerts.push({
          type: 'RAPID_APPROVAL',
          severity: 'MEDIUM',
          message: `SPP approved within ${approvalDuration} minutes of creation`,
          entityId: spp.id,
        });
      }
    }

    // Rule 4: Large amount
    if (Number(spp.nilaiSPP) > 100_000_000) {
      alerts.push({
        type: 'LARGE_AMOUNT',
        severity: 'LOW',
        message: `Large SPP amount: ${spp.nilaiSPP}`,
        entityId: spp.id,
      });
    }

    // Rule 5: Backdated
    const daysDiff = differenceInDays(new Date(), spp.tanggalSPP);
    if (daysDiff > 7) {
      alerts.push({
        type: 'BACKDATED',
        severity: 'MEDIUM',
        message: `Backdated SPP: ${daysDiff} days ago`,
        entityId: spp.id,
      });
    }

    // Send alerts
    for (const alert of alerts) {
      await this.alertService.send({
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        entityType: 'SPP',
        entityId: alert.entityId,
        recipients: ['admin@rsud.go.id', 'audit@rsud.go.id'],
      });

      // Log to database
      await this.fraudAlertRepository.save(alert);
    }

    return alerts;
  }
}

// Hook into SPP lifecycle
@Injectable()
export class SPPService {
  constructor(
    private readonly fraudDetection: FraudDetectionService,
  ) {}

  async create(dto: CreateSPPDto) {
    const spp = await this.sppRepository.save(dto);

    // Run fraud detection (async, non-blocking)
    this.fraudDetection.checkSPP(spp).catch(err => {
      this.logger.error('Fraud detection failed', err);
    });

    return spp;
  }
}
```
```

---

## 7. Monitoring & Observability

### 7.1 Metrics

#### **Prometheus + Grafana**
```yaml
Status: 🆕 ADD (Rekomendasi Tahap 3)
Justifikasi:
  ✅ Industry standard
  ✅ Beautiful dashboards
  ✅ Alerting system
  ✅ Historical data analysis
  ✅ Open source

Metrics to Collect:
  Application:
    - Request count (per endpoint)
    - Response time (p50, p95, p99)
    - Error rate (4xx, 5xx)
    - Active users (concurrent sessions)
    - Queue length (BullMQ jobs pending)

  Business:
    - SPP created per hour/day
    - Pendapatan total (real-time)
    - Belanja total (real-time)
    - Kas position (real-time)

  System:
    - CPU usage
    - Memory usage
    - Disk I/O
    - Network I/O
    - Database connections
    - Redis connections

Implementation:
```typescript
// Install @willsoto/nestjs-prometheus
import { PrometheusModule, makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total HTTP requests',
      labelNames: ['method', 'route', 'status'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
      name: 'spp_created_total',
      help: 'Total SPP created',
      labelNames: ['jenis'],
    }),
  ],
})
export class AppModule {}

// Metrics interceptor
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_requests_total') private counter: Counter,
    @InjectMetric('http_request_duration_seconds') private histogram: Histogram,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = (Date.now() - start) / 1000;
          const status = context.switchToHttp().getResponse().statusCode;

          this.counter.inc({
            method: request.method,
            route: request.route.path,
            status,
          });

          this.histogram.observe(
            {
              method: request.method,
              route: request.route.path,
              status,
            },
            duration
          );
        },
        error: (error) => {
          this.counter.inc({
            method: request.method,
            route: request.route.path,
            status: error.status || 500,
          });
        },
      })
    );
  }
}
```

Grafana Dashboard:
```yaml
# dashboards/sikancil-overview.json
{
  "dashboard": {
    "title": "Si-Kancil Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{ route }}"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)",
            "legendFormat": "{{ route }}"
          }
        ]
      },
      {
        "title": "SPP Created (Today)",
        "targets": [
          {
            "expr": "increase(spp_created_total[24h])",
            "legendFormat": "{{ jenis }}"
          }
        ]
      }
    ]
  }
}
```

Alert Rules:
```yaml
# prometheus/alerts.yml
groups:
  - name: sikancil
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} req/s"

      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow response time"
          description: "P95 latency is {{ $value }}s"

      - alert: DatabaseConnectionHigh
        expr: pg_stat_activity_count > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High database connections"
```
```

---

### 7.2 Logging

#### **Winston + Loki**
```yaml
Status: ✅ ENHANCE (Winston already implemented)
Justifikasi:
  ✅ Centralized logging
  ✅ Grafana integration (unified view)
  ✅ Log aggregation (all pods)
  ✅ Query & search logs

Log Levels:
  - ERROR: Errors that need immediate attention
  - WARN: Warnings, potential issues
  - INFO: General information (API calls, business events)
  - DEBUG: Detailed debugging info (dev only)

Log Format (JSON):
```json
{
  "timestamp": "2026-02-15T10:30:00.000Z",
  "level": "info",
  "message": "SPP created",
  "context": "SPPService",
  "userId": "uuid",
  "userName": "John Doe",
  "requestId": "correlation-id",
  "sppId": "uuid",
  "jenisSPP": "LS",
  "nilaiSPP": 1000000,
  "duration": 123
}
```

Winston Configuration:
```typescript
// logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

export const loggerConfig = WinstonModule.createLogger({
  transports: [
    // Console (development)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          return `${timestamp} [${context}] ${level}: ${message} ${JSON.stringify(meta)}`;
        })
      ),
    }),

    // File (production)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10,
    }),

    new winston.transports.File({
      filename: 'logs/combined.log',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 30,
    }),

    // Loki (production)
    new LokiTransport({
      host: process.env.LOKI_HOST || 'http://loki:3100',
      labels: {
        app: 'sikancil-backend',
        environment: process.env.NODE_ENV,
      },
      json: true,
      format: winston.format.json(),
      onConnectionError: (err) => console.error('Loki connection error', err),
    }),
  ],
});
```

Sensitive Data Masking:
```typescript
// logger.interceptor.ts
@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers, user } = request;
    const requestId = request.id || randomUUID();

    // Mask sensitive data
    const sanitizedBody = this.maskSensitiveData(body);

    this.logger.log({
      message: 'Incoming request',
      method,
      url,
      body: sanitizedBody,
      userId: user?.id,
      requestId,
    });

    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log({
          message: 'Request completed',
          method,
          url,
          duration,
          requestId,
        });
      }),
      catchError((error) => {
        const duration = Date.now() - start;
        this.logger.error({
          message: 'Request failed',
          method,
          url,
          error: error.message,
          stack: error.stack,
          duration,
          requestId,
        });
        throw error;
      })
    );
  }

  private maskSensitiveData(data: any): any {
    if (!data) return data;

    const sensitiveFields = ['password', 'token', 'nik', 'nomorRekening'];
    const masked = { ...data };

    for (const field of sensitiveFields) {
      if (masked[field]) {
        masked[field] = '***MASKED***';
      }
    }

    return masked;
  }
}
```
```

---

### 7.3 Error Tracking

#### **Sentry**
```yaml
Status: 🆕 ADD (Optional but recommended)
Justifikasi:
  ✅ Real-time error tracking
  ✅ Stack trace & context
  ✅ User feedback
  ✅ Release tracking
  ✅ Performance monitoring

Installation:
```bash
npm install @sentry/node @sentry/integrations
```

Configuration:
```typescript
// main.ts
import * as Sentry from '@sentry/node';

async function bootstrap() {
  // Initialize Sentry
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% of transactions
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request?.data) {
        event.request.data = maskSensitiveData(event.request.data);
      }
      return event;
    },
  });

  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  // Sentry error handler
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());

  await app.listen(3000);
}
```

Usage:
```typescript
try {
  await this.processHeavyTask();
} catch (error) {
  Sentry.captureException(error, {
    user: {
      id: user.id,
      username: user.username,
    },
    tags: {
      module: 'SPP',
      action: 'create',
    },
    extra: {
      sppData: dto,
    },
  });

  throw error;
}
```
```

---

## 8. Comparison Matrix

### 8.1 Tech Stack Summary

| Layer | Masterplan v2 | Rekomendasi Tahap 3 | **Tech Stack v3 (FINAL)** | Decision Rationale |
|-------|---------------|---------------------|---------------------------|-------------------|
| **Backend Framework** | NestJS 10 | NestJS 10 | **NestJS 11** ✅ | Keep (latest version) |
| **ORM** | **Prisma** | - | **TypeORM** ✅ | Keep (already implemented, avoid migration cost) |
| **Database** | PostgreSQL 15 | **PostgreSQL 17** | **PostgreSQL 17** 🔄 | Upgrade (better partitioning & performance) |
| **Frontend UI** | **Ant Design 5** | Tailwind CSS | **Tailwind + shadcn/ui** ✅ | Keep Tailwind (lighter, more flexible) |
| **State Mgmt** | Zustand | - | **Zustand** ✅ | Keep (simple & sufficient) |
| **Real-time** | Polling <5min | **Webhook + Redis Pub/Sub** | **Webhook + Redis Pub/Sub** 🔄 | Upgrade (real-time <1s) |
| **Cache** | Redis 7 | Redis | **Redis 7** ✅ | Keep & enhance usage |
| **Queue** | - | - | **BullMQ** 🆕 | Add (reliable job processing) |
| **File Storage** | - | - | **MinIO** 🆕 | Add (S3-compatible, self-hosted) |
| **Container** | Docker Compose | **Kubernetes** | **Docker + K8s** 🆕 | Add (HA production) |
| **Monitoring** | Grafana + Prometheus | - | **Grafana + Prometheus** 🆕 | Add (observability) |
| **Logging** | Winston + Loki | Winston | **Winston + Loki** 🆕 | Add Loki (centralized) |
| **Security** | Standard | **AES-256 + UU PDP** | **AES-256 + Audit Trail** 🆕 | Add (compliance) |

**Legend:**
- ✅ Keep (already good)
- 🔄 Upgrade (improve existing)
- 🆕 Add (new addition)

---

### 8.2 Integration Comparison

| Integration | Masterplan v2 | Rekomendasi Tahap 3 | Tech Stack v3 (FINAL) |
|-------------|---------------|---------------------|----------------------|
| **SIMRS** | Polling API (<5 min) | **Webhook (<1 sec)** | Webhook (with polling fallback) |
| **Bank** | Manual/optional | **Host-to-Host + VA** | Host-to-Host + VA |
| **SIPD RI** | Optional | **API Adapter** | API Adapter + Excel export |
| **DJP Online** | Manual | **CSV e-Bupot** | CSV e-Bupot export |

---

### 8.3 Feature Enhancements

| Feature | Masterplan v2 | Tahap 3 Added | Tech Stack v3 Includes |
|---------|---------------|---------------|------------------------|
| **Budget Control Warning** | ❌ | ✅ | ✅ Implemented via business logic |
| **Virtual Account Recon** | ❌ | ✅ | ✅ Bank integration module |
| **Smart Tax Wizard** | ❌ | ✅ | ✅ Tax calculation engine |
| **Cash Opname Digital** | ❌ | ✅ | ✅ BKU enhancement |
| **SIPD Connector** | ❌ | ✅ | ✅ Integration layer |
| **Fraud Detection** | ❌ | ✅ | ✅ Security module |
| **Immutable Audit Trail** | Audit log | ✅ Enhanced | ✅ Hash chain implementation |

---

## 9. Migration Strategy

### Phase 1: Foundation Enhancement (Month 1-2)
```yaml
Tasks:
  Backend:
    ✅ Upgrade PostgreSQL 15 → 17
    ✅ Implement partitioning (jurnal, spp tables)
    ✅ Setup Redis caching layer
    ✅ Add BullMQ queue system
    ✅ Complete Swagger documentation

  Frontend:
    ✅ Install shadcn/ui components
    ✅ Build reusable component library
    ✅ Standardize form patterns
    ✅ Implement error boundaries

  Infrastructure:
    ✅ Create Docker Compose (development)
    ✅ Setup MinIO (file storage)
    ✅ Configure local SSL (HTTPS dev)

Risk: LOW (no breaking changes)
```

### Phase 2: Real-time Integration (Month 3-4)
```yaml
Tasks:
  Backend:
    ✅ SIMRS webhook endpoint
    ✅ Redis Pub/Sub implementation
    ✅ WebSocket gateway (frontend real-time)
    ✅ Bank Host-to-Host API
    ✅ Virtual Account system

  Frontend:
    ✅ WebSocket client
    ✅ Real-time dashboard updates
    ✅ Toast notifications

  Testing:
    ✅ Mock SIMRS webhook (stress test)
    ✅ Load testing (100 rps)

Risk: MEDIUM (external dependency on SIMRS/Bank)
```

### Phase 3: Security & Compliance (Month 5-6)
```yaml
Tasks:
  Backend:
    ✅ AES-256 encryption (NIK, sensitive data)
    ✅ Immutable audit trail (hash chain)
    ✅ Fraud detection rules
    ✅ RBAC enhancement (granular permissions)

  Frontend:
    ✅ XSS/CSRF protection audit
    ✅ CSP headers

  Infrastructure:
    ✅ Security hardening (Nginx, PostgreSQL)
    ✅ Penetration testing

Risk: LOW (security improvements)
```

### Phase 4: DevOps & Production (Month 7-8)
```yaml
Tasks:
  Infrastructure:
    ✅ Kubernetes cluster setup
    ✅ Helm charts
    ✅ CI/CD pipeline (GitHub Actions)
    ✅ Grafana + Prometheus setup
    ✅ Loki logging aggregation
    ✅ Backup automation
    ✅ SSL/TLS certificates

  Testing:
    ✅ Load testing (production-like)
    ✅ Disaster recovery drill

Risk: MEDIUM (complex infrastructure)
```

---

## 10. Tech Debt & Trade-offs

### 10.1 Tech Debt Accepted

```yaml
TypeORM vs Prisma:
  Debt: TypeORM less type-safe than Prisma
  Reason: Migration cost too high (73 tables + data)
  Mitigation:
    - Strict TypeScript checking
    - Repository pattern
    - Comprehensive tests
  Payoff Timeline: N/A (keep TypeORM)

Tailwind vs Ant Design:
  Debt: Need to build component library from scratch
  Reason: Tailwind more lightweight & flexible
  Mitigation:
    - Use shadcn/ui (pre-built Tailwind components)
    - Create design system
  Payoff Timeline: 2 months

Polling Fallback:
  Debt: If SIMRS doesn't support webhook, still need polling
  Reason: External dependency out of our control
  Mitigation:
    - Polling every 5 min (acceptable)
    - BullMQ scheduled job (reliable)
  Payoff Timeline: When SIMRS supports webhook
```

### 10.2 Future Tech Considerations (Beyond v3)

```yaml
GraphQL:
  Status: Not in v3
  Reason: REST sufficient untuk BLUD use case
  Consider: If mobile app needed (flexible queries)

Server-Side Rendering (Next.js):
  Status: Not in v3
  Reason: SPA sufficient (internal app)
  Consider: If public-facing portal needed (SEO)

Multi-Tenancy:
  Status: Not in v3
  Reason: Single BLUD instance
  Consider: If expanding to multiple BLUDs (SaaS)

Machine Learning:
  Status: Not in v3
  Reason: Focus on compliance first
  Consider: Budget prediction, anomaly detection (advanced)
```

---

## 11. Conclusion & Recommendations

### **Final Tech Stack v3 Decision:**

✅ **KEEP (Backward Compatible):**
- NestJS 11 (Backend framework)
- TypeORM 0.3 (ORM - already implemented)
- React 18 + TypeScript (Frontend)
- Tailwind CSS (UI styling)
- Vite (Build tool)
- Zustand (State management)
- TanStack Query (Data fetching)
- Winston (Logging)

🔄 **UPGRADE (Enhance Existing):**
- PostgreSQL 15 → **17** (Better performance & partitioning)
- Polling → **Webhook + Redis Pub/Sub** (Real-time integration)
- Basic security → **AES-256 + Immutable Audit Trail**

🆕 **ADD (New Capabilities):**
- **BullMQ** (Job queue)
- **MinIO** (File storage)
- **shadcn/ui** (Component library)
- **Docker + Kubernetes** (Containerization & orchestration)
- **Grafana + Prometheus** (Monitoring)
- **Loki** (Log aggregation)
- **Sentry** (Error tracking - optional)
- **Fraud Detection System**
- **Bank Integration** (Host-to-Host + VA)
- **SIPD Connector**
- **e-Bupot Export**

---

### **Why This Stack?**

1. **Pragmatic:** Keeps existing investments (TypeORM, Tailwind)
2. **Modern:** Adopts best practices (Kubernetes, monitoring)
3. **Compliant:** Meets BLUD regulations (audit trail, encryption)
4. **Scalable:** Ready for growth (queue, caching, HA)
5. **Cost-Effective:** Open source & self-hosted
6. **Production-Ready:** Battle-tested technologies

---

### **Success Metrics:**

```yaml
Performance:
  ✅ Page load < 3s (vs current unknown)
  ✅ API response < 500ms (p95)
  ✅ SIMRS sync < 1s (vs 5 min)
  ✅ Report generation < 30s

Reliability:
  ✅ 99.9% uptime (monthly)
  ✅ Zero data loss (HA + backup)
  ✅ Auto-recovery < 5 min

Security:
  ✅ Zero critical vulnerabilities
  ✅ 100% audit trail coverage
  ✅ UU PDP compliant (encryption)

Business:
  ✅ Time to close books < 5 days (from ~15 days)
  ✅ SPJ approval cycle < 3 days (from ~7 days)
  ✅ Zero audit findings (BPK compliance)
```

---

**Document Control:**
- Version: 3.0
- Date: 15 Februari 2026
- Author: Si-Kancil Development Team
- Status: Final Recommendation
- Next Review: Before implementation kickoff

---

**END OF TECH STACK v3**
