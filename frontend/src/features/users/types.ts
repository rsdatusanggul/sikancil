// User Module Types
// Based on backend User entity and DTOs

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

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  nip?: string;
  jabatan?: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  blud_id?: string;
  avatar?: string;
  lastLogin?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  fullName: string;
  nip?: string;
  jabatan?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  blud_id?: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  fullName?: string;
  nip?: string;
  jabatan?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  blud_id?: string;
}

// Helper function to get role label
export function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.KEPALA_BLUD]: 'Kepala BLUD',
    [UserRole.BENDAHARA]: 'Bendahara',
    [UserRole.STAFF_KEUANGAN]: 'Staff Keuangan',
    [UserRole.USER]: 'User',
  };
  return labels[role] || role;
}

// Helper function to get status label
export function getStatusLabel(status: UserStatus): string {
  const labels: Record<UserStatus, string> = {
    [UserStatus.ACTIVE]: 'Aktif',
    [UserStatus.INACTIVE]: 'Tidak Aktif',
    [UserStatus.SUSPENDED]: 'Ditangguhkan',
  };
  return labels[status] || status;
}

// Helper function to get status color
export function getStatusColor(status: UserStatus): 'success' | 'warning' | 'danger' {
  const colors: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
    [UserStatus.ACTIVE]: 'success',
    [UserStatus.INACTIVE]: 'warning',
    [UserStatus.SUSPENDED]: 'danger',
  };
  return colors[status] || 'warning';
}
