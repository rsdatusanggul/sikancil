import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Modal, Input, SimpleSelect as Select, Button } from '@/components/ui';
import { usersApi } from './api';
import type { User, CreateUserDto, UpdateUserDto } from './types';
import { UserRole, UserStatus, getRoleLabel, getStatusLabel } from './types';

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UserForm({ mode, user, onClose, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    nip: '',
    jabatan: '',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    phone: '',
    blud_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        nip: user.nip || '',
        jabatan: user.jabatan || '',
        role: user.role,
        status: user.status,
        phone: user.phone || '',
        blud_id: user.blud_id || '',
      });
    }
  }, [mode, user]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal membuat user';
      setErrors({ submit: message });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.update(user!.id, data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal mengupdate user';
      setErrors({ submit: message });
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.username?.trim()) {
      newErrors.username = 'Username wajib diisi';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (mode === 'create' && !formData.password?.trim()) {
      newErrors.password = 'Password wajib diisi';
    }

    if (mode === 'create' && formData.password && formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Nama lengkap wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(formData as CreateUserDto);
      } else {
        // Don't send password if it's empty during update
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await updateMutation.mutateAsync(updateData as UpdateUserDto);
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={mode === 'create' ? 'Tambah User Baru' : 'Edit User'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.username || ''}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="johndoe"
            disabled={mode === 'edit'} // Username tidak bisa diubah saat edit
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john.doe@example.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password {mode === 'create' && <span className="text-red-500">*</span>}
            {mode === 'edit' && <span className="text-gray-500 text-xs ml-1">(kosongkan jika tidak ingin mengubah)</span>}
          </label>
          <Input
            type="password"
            value={formData.password || ''}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={mode === 'create' ? 'Minimal 6 karakter' : 'Biarkan kosong jika tidak diubah'}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="John Doe"
          />
          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
        </div>

        {/* NIP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
          <Input
            value={formData.nip || ''}
            onChange={(e) => handleChange('nip', e.target.value)}
            placeholder="198501012010011001"
          />
        </div>

        {/* Jabatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
          <Input
            value={formData.jabatan || ''}
            onChange={(e) => handleChange('jabatan', e.target.value)}
            placeholder="Kepala Bagian Keuangan"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
          <Input
            value={formData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="08123456789"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <Select
            value={formData.role || UserRole.USER}
            onChange={(e) => handleChange('role', e.target.value)}
            options={Object.values(UserRole).map((role) => ({
              value: role,
              label: getRoleLabel(role),
            }))}
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select
            value={formData.status || UserStatus.ACTIVE}
            onChange={(e) => handleChange('status', e.target.value)}
            options={Object.values(UserStatus).map((status) => ({
              value: status,
              label: getStatusLabel(status),
            }))}
          />
        </div>

        {/* BLUD ID (optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            BLUD ID
            <span className="text-gray-500 text-xs ml-1">(opsional, untuk multi-tenancy)</span>
          </label>
          <Input
            value={formData.blud_id || ''}
            onChange={(e) => handleChange('blud_id', e.target.value)}
            placeholder="blud-uuid-123"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                {mode === 'create' ? 'Membuat...' : 'Menyimpan...'}
              </span>
            ) : (
              <span>{mode === 'create' ? 'Buat User' : 'Simpan Perubahan'}</span>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
        </div>
      </form>
    </Modal>
  );
}
