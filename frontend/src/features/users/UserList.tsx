import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Badge,
  Input,
} from '@/components/ui';
import { Plus, Edit, Trash2, Eye, Search, UserCheck, UserX, Ban } from 'lucide-react';
import { usersApi } from './api';
import { UserForm } from './UserForm';
import { UserDetailModal } from './UserDetailModal';
import type { User } from './types';
import { getRoleLabel, getStatusLabel, getStatusColor } from './types';

export default function UserList() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Fetch all users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Status change mutations
  const activateMutation = useMutation({
    mutationFn: (id: string) => usersApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => usersApi.suspend(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // Filter users based on search query
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    if (!searchQuery) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.nip?.toLowerCase().includes(query) ||
        user.jabatan?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const handleCreate = () => {
    setFormMode('create');
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    setFormMode('edit');
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsDetailOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus user "${user.fullName}"?`)) {
      try {
        await deleteMutation.mutateAsync(user.id);
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Gagal menghapus user');
      }
    }
  };

  const handleStatusChange = async (user: User, action: 'activate' | 'deactivate' | 'suspend') => {
    const confirmMessages = {
      activate: `Aktifkan user "${user.fullName}"?`,
      deactivate: `Nonaktifkan user "${user.fullName}"?`,
      suspend: `Tangguhkan user "${user.fullName}"?`,
    };

    if (window.confirm(confirmMessages[action])) {
      try {
        switch (action) {
          case 'activate':
            await activateMutation.mutateAsync(user.id);
            break;
          case 'deactivate':
            await deactivateMutation.mutateAsync(user.id);
            break;
          case 'suspend':
            await suspendMutation.mutateAsync(user.id);
            break;
        }
      } catch (error) {
        console.error('Failed to change user status:', error);
        alert('Gagal mengubah status user');
      }
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600">Kelola pengguna sistem Si-Kancil</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-sm text-gray-600">Total User</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {users?.filter((u) => u.status === 'active').length || 0}
            </div>
            <p className="text-sm text-gray-600">Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {users?.filter((u) => u.status === 'inactive').length || 0}
            </div>
            <p className="text-sm text-gray-600">Tidak Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {users?.filter((u) => u.status === 'suspended').length || 0}
            </div>
            <p className="text-sm text-gray-600">Ditangguhkan</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Daftar User</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Memuat data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="text-base dark:text-gray-300">Username</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Nama Lengkap</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Email</TableHead>
                    <TableHead className="text-base dark:text-gray-300">NIP</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Jabatan</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Role</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Status</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Last Login</TableHead>
                    <TableHead className="text-base text-right dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.nip || '-'}</TableCell>
                        <TableCell>{user.jabatan || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getRoleLabel(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(user.status)}>
                            {getStatusLabel(user.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(user.lastLogin)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(user)}
                              title="Lihat detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(user)}
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.status === 'active' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(user, 'deactivate')}
                                title="Nonaktifkan"
                              >
                                <UserX className="h-4 w-4 text-yellow-600" />
                              </Button>
                            )}
                            {user.status === 'inactive' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(user, 'activate')}
                                title="Aktifkan"
                              >
                                <UserCheck className="h-4 w-4 text-green-600" />
                              </Button>
                            )}
                            {user.status !== 'suspended' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(user, 'suspend')}
                                title="Tangguhkan"
                              >
                                <Ban className="h-4 w-4 text-orange-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(user)}
                              title="Hapus user"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        {searchQuery ? 'Tidak ada user yang cocok dengan pencarian' : 'Belum ada data user'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Form Modal */}
      {isFormOpen && (
        <UserForm
          mode={formMode}
          user={selectedUser}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setIsFormOpen(false);
            setSelectedUser(null);
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }}
        />
      )}

      {/* User Detail Modal */}
      {isDetailOpen && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}
