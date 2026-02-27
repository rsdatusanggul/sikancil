/**
 * Auth Module Type Definitions
 * Matches backend DTOs and entities
 */

export interface LoginCredentials {
  username: string;
  password: string;
  fiscalYearId?: string;  // ✅ ADD - optional UUID
  captchaId: string;       // ✅ ADD - required
  captcha: string;         // ✅ ADD - required
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  captchaId: string;  // ✅ ADD - required for registration
  captcha: string;    // ✅ ADD - required for registration
}

export interface AuthResponse {
  user: User;
  fiscalYear?: FiscalYear; // ✅ Fiscal year from login (optional for register)
  // ✅ REMOVED: access_token, refresh_token - now in httpOnly cookies
}

export interface FiscalYear {
  id: string;
  tahun: number;
  isCurrent: boolean;
  status: 'OPEN' | 'CLOSED' | 'LOCKED';
}

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  nip?: string;
  jabatan?: string;
  phone?: string;
  blud_id?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  KEPALA_BLUD = 'kepala_blud',
  BENDAHARA = 'bendahara',
  STAFF_KEUANGAN = 'staff_keuangan',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}