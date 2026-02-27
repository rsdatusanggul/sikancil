# Auth Module Documentation

## 📋 Overview

Auth Module menangani semua fungsi autentikasi dan otorisasi dalam aplikasi Si-Kancil, termasuk login, logout, register, dan proteksi route.

## 🏗️ Struktur Directory

```
auth/
├── components/          # React components
│   ├── LoginForm.tsx   # Form login dengan validasi
│   ├── ProtectedRoute.tsx  # Route guard component
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hooks
│   └── index.ts
├── pages/              # Page components
│   └── LoginPage.tsx   # Halaman login
├── api.ts              # API functions
├── types.ts            # TypeScript interfaces
├── schemas.ts          # Zod validation schemas
├── index.ts            # Barrel export
└── README.md           # This file
```

## 🔑 Key Features

### 1. **Authentication**
- ✅ Login dengan username & password
- ✅ Logout functionality
- ✅ Register new user (optional)
- ✅ JWT token management (access + refresh)
- ✅ Auto-refresh token via axios interceptor

### 2. **Authorization**
- ✅ Protected routes
- ✅ Role-based access control (RBAC)
- ✅ Permission checking

### 3. **State Management**
- ✅ Zustand store untuk auth state
- ✅ React Query untuk server state
- ✅ LocalStorage persistence

### 4. **Form Validation**
- ✅ Client-side validation dengan Zod
- ✅ Real-time error messages
- ✅ Password visibility toggle

## 📦 Components

### LoginForm
Form login dengan validation dan error handling.

**Props:** None

**Usage:**
```tsx
import { LoginForm } from '@/features/auth';

<LoginForm />
```

**Features:**
- Username & password input dengan validasi
- Show/hide password
- Loading state saat login
- Error message display
- Remember me checkbox

---

### ProtectedRoute
Wrapper component untuk melindungi routes yang memerlukan autentikasi.

**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string | string[];
  fallbackPath?: string;
}
```

**Usage:**
```tsx
import { ProtectedRoute } from '@/features/auth';

// Basic protection (require authentication)
<ProtectedRoute>
  <DashboardPage />
</ProtectedRoute>

// Role-based protection
<ProtectedRoute requiredRoles={['super_admin', 'admin']}>
  <UsersPage />
</ProtectedRoute>

// Custom fallback
<ProtectedRoute fallbackPath="/unauthorized">
  <SecretPage />
</ProtectedRoute>
```

---

### LoginPage
Halaman login dengan branding dan responsive design.

**Features:**
- Split layout (form + branding)
- Auto-redirect jika sudah login
- Responsive design (mobile-friendly)
- Professional UI dengan gradient background

## 🪝 Custom Hooks

### useLogin()
Hook untuk login mutation.

**Returns:** `UseMutationResult<AuthResponse, Error, LoginCredentials>`

**Usage:**
```tsx
import { useLogin } from '@/features/auth';

const loginMutation = useLogin();

const handleLogin = (credentials: LoginCredentials) => {
  loginMutation.mutate(credentials, {
    onSuccess: (data) => {
      console.log('Login success:', data.user);
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
};
```

---

### useLogout()
Hook untuk logout mutation.

**Returns:** `UseMutationResult<void, Error, void>`

**Usage:**
```tsx
import { useLogout } from '@/features/auth';

const logoutMutation = useLogout();

const handleLogout = () => {
  logoutMutation.mutate();
};
```

---

### useProfile()
Hook untuk fetch user profile.

**Returns:** `UseQueryResult<User, Error>`

**Usage:**
```tsx
import { useProfile } from '@/features/auth';

const { data: user, isLoading, error } = useProfile();

if (isLoading) return <div>Loading...</div>;
if (error) return <div>Error loading profile</div>;

return <div>Welcome, {user?.fullName}</div>;
```

---

### useIsAuthenticated()
Check if user is authenticated.

**Returns:** `boolean`

**Usage:**
```tsx
import { useIsAuthenticated } from '@/features/auth';

const isAuthenticated = useIsAuthenticated();

if (!isAuthenticated) {
  return <Navigate to="/login" />;
}
```

---

### useCurrentUser()
Get current logged-in user.

**Returns:** `User | null`

**Usage:**
```tsx
import { useCurrentUser } from '@/features/auth';

const currentUser = useCurrentUser();

return (
  <div>
    <h1>Hello, {currentUser?.fullName}</h1>
    <p>Role: {currentUser?.role}</p>
  </div>
);
```

---

### useHasRole(roles)
Check if user has specific role(s).

**Params:**
- `roles: string | string[]` - Single role or array of roles

**Returns:** `boolean`

**Usage:**
```tsx
import { useHasRole } from '@/features/auth';

const isAdmin = useHasRole(['super_admin', 'admin']);

return (
  <div>
    {isAdmin && <AdminPanel />}
  </div>
);
```

## 🔐 Authentication Flow

### Login Flow
```
1. User enters credentials
2. LoginForm validates input (Zod)
3. useLogin() mutation called
4. API request to POST /auth/login
5. On success:
   - Save tokens to localStorage
   - Update auth store (Zustand)
   - Invalidate queries (React Query)
   - Navigate to /dashboard
6. On error:
   - Display error message
```

### Logout Flow
```
1. User clicks logout
2. useLogout() mutation called
3. API request to POST /auth/logout (optional)
4. Clear tokens from localStorage
5. Clear auth store
6. Clear all React Query cache
7. Navigate to /login
```

### Auto-Refresh Flow
```
1. Request fails with 401 Unauthorized
2. Axios interceptor catches error
3. Attempt to refresh token:
   - POST /auth/refresh with refreshToken
   - On success: Update accessToken
   - Retry original request
4. On refresh failure:
   - Clear tokens
   - Redirect to /login
```

## 🎨 UI/UX Features

### LoginPage Design
- **Split Layout**: Form on left, branding on right
- **Responsive**: Mobile-first design
- **Gradient Background**: Blue gradient for branding
- **Feature Highlights**: 3 key features displayed
- **Professional Look**: Clean, modern interface

### Form Validation
- **Real-time**: Validation on blur & submit
- **Clear Messages**: Indonesian error messages
- **Visual Feedback**: Red borders for errors
- **Loading States**: Disabled + spinner during submission

## 🔒 Security Features

1. **JWT Tokens**
   - Access token (short-lived) for API requests
   - Refresh token (long-lived) for token renewal

2. **Secure Storage**
   - Tokens stored in localStorage
   - Auto-clear on logout/failure

3. **Auto-Refresh**
   - Seamless token refresh on expiry
   - No user interruption

4. **Route Protection**
   - ProtectedRoute guards all protected pages
   - Role-based access control

5. **CSRF Protection**
   - Axios interceptor adds auth headers
   - Token-based authentication

## 📝 Validation Schemas

### Login Schema
```typescript
{
  username: string (min 3 chars)
  password: string (min 6 chars)
}
```

### Register Schema
```typescript
{
  username: string (3-50 chars, alphanumeric + _)
  email: string (valid email format)
  fullName: string (3-100 chars)
  password: string (6-100 chars)
  confirmPassword: string (must match password)
}
```

## 🧪 Testing Checklist

- [x] ✅ Build successfully without errors
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout functionality
- [ ] Auto-redirect after login
- [ ] Protected route access (authenticated)
- [ ] Protected route redirect (unauthenticated)
- [ ] Role-based access control
- [ ] Token refresh on 401
- [ ] Session persistence (refresh page)
- [ ] Form validation (all fields)
- [ ] Error handling & display
- [ ] Loading states
- [ ] Responsive design (mobile/tablet/desktop)

## 🔗 Integration Points

### Auth Store (`/stores/auth.store.ts`)
- Manages global auth state
- Persists user data
- Provides login/logout actions

### API Client (`/lib/api-client.ts`)
- Axios instance with base URL
- Request interceptor (adds token)
- Response interceptor (handles 401)

### Router (`/routes/index.tsx`)
- `/login` - Public route
- `/` - Protected with ProtectedRoute wrapper
- All child routes inherit protection

### Header Component (`/components/layout/Header.tsx`)
- Displays current user info
- Logout button
- User menu dropdown

## 📊 User Roles

```typescript
enum UserRole {
  SUPER_ADMIN = 'super_admin',      // Full access
  ADMIN = 'admin',                  // Admin access
  KEPALA_BLUD = 'kepala_blud',      // BLUD Head
  BENDAHARA = 'bendahara',          // Treasurer
  STAFF_KEUANGAN = 'staff_keuangan', // Finance Staff
  USER = 'user',                    // Basic user
}
```

## 🚀 Next Steps (Future Enhancements)

- [ ] Forgot password functionality
- [ ] Change password in profile
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, etc.)
- [ ] Session timeout warning
- [ ] Login history / audit log
- [ ] Email verification
- [ ] Account lockout after failed attempts

## 📚 Related Documentation

- Backend Auth API: `/opt/sikancil/backend/src/modules/auth`
- User Entity: `/opt/sikancil/backend/src/modules/users/entities/user.entity.ts`
- API Documentation: `http://localhost:3000/api/docs`

---

**Last Updated:** 2026-02-15
**Status:** ✅ **Phase 1 Complete**
