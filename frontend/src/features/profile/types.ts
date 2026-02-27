import { UserRole, UserStatus } from '@/features/users';

export interface UserProfile {
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
}

export interface UpdateProfileDto {
  email?: string;
  fullName?: string;
  nip?: string;
  jabatan?: string;
  phone?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}