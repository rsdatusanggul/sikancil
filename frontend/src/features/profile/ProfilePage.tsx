import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Mail, Phone, Briefcase, Shield, Calendar, Lock, Save, Camera } from 'lucide-react';
import { toast } from 'sonner';

import { profileApi } from './api';
import { UpdateProfileDto, ChangePasswordDto, UserProfile } from './types';
import { getRoleLabel, getStatusLabel, getStatusColor } from '@/features/users/types';
import { Badge, Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState<UpdateProfileDto>({});

  // Password form state
  const [passwordForm, setPasswordForm] = useState<ChangePasswordDto>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileDto) => profileApi.updateProfile(data),
    onSuccess: (updatedProfile) => {
      toast.success('Profil berhasil diperbarui');
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.setQueryData(['currentUser'], updatedProfile);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordDto) => profileApi.changePassword(data),
    onSuccess: (response: { message: string }) => {
      toast.success('Password berhasil diubah');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }

    changePasswordMutation.mutate(passwordForm);
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Profil tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profil Saya</h1>
          <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-border">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Informasi Profil
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'password'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Ubah Password
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informasi Akun</CardTitle>
                  {!isEditing && (
                    <Button
                      onClick={() => {
                        setIsEditing(true);
                        setProfileForm({
                          email: profile.email,
                          fullName: profile.fullName,
                          nip: profile.nip,
                          jabatan: profile.jabatan,
                          phone: profile.phone,
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Edit Profil
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6 mb-8">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {profile.avatar ? (
                      <img
                        src={profile.avatar}
                        alt={profile.fullName}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">
                          {profile.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-foreground mb-2">{profile.fullName}</h3>
                    <p className="text-muted-foreground mb-4">@{profile.username}</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant={getStatusColor(profile.status)}>{getStatusLabel(profile.status)}</Badge>
                      <Badge variant="secondary">{getRoleLabel(profile.role)}</Badge>
                    </div>
                  </div>
                </div>

                {/* Edit Form */}
                {isEditing ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nama Lengkap</Label>
                        <Input
                          id="fullName"
                          value={profileForm.fullName || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileForm.email || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nip">NIP</Label>
                        <Input
                          id="nip"
                          value={profileForm.nip || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, nip: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="jabatan">Jabatan</Label>
                        <Input
                          id="jabatan"
                          value={profileForm.jabatan || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, jabatan: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">No. Telepon</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={profileForm.phone || ''}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setProfileForm({});
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DetailItem icon={User} label="Username" value={profile.username} />
                    <DetailItem icon={Mail} label="Email" value={profile.email} />
                    <DetailItem icon={Phone} label="No. Telepon" value={profile.phone || '-'} />
                    <DetailItem icon={Briefcase} label="NIP" value={profile.nip || '-'} />
                    <DetailItem icon={Briefcase} label="Jabatan" value={profile.jabatan || '-'} />
                    <DetailItem
                      icon={Shield}
                      label="Role"
                      value={<Badge variant="secondary">{getRoleLabel(profile.role)}</Badge>}
                    />
                    <DetailItem icon={Calendar} label="Login Terakhir" value={formatDate(profile.lastLogin)} />
                    <DetailItem icon={Calendar} label="Dibuat Pada" value={formatDate(profile.createdAt)} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card>
            <CardHeader>
              <CardTitle>Ubah Password</CardTitle>
              <CardDescription>
                Ganti password akun Anda untuk keamanan. Gunakan password yang kuat dan unik.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password Saat Ini</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Password Baru</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    required
                    placeholder="Minimal 6 karakter"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    required
                    placeholder="Ulangi password baru"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {changePasswordMutation.isPending ? 'Mengubah...' : 'Ubah Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 text-sm text-foreground">{value}</dd>
      </div>
    </div>
  );
}