import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, Edit, Trash2, Filter, RefreshCw, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useChartOfAccounts } from './hooks';
import type { ChartOfAccount, AccountType } from './types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/pagination';
import { apiClient } from '@/lib/api-client';

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'ASSET' as AccountType, label: 'Aset' },
  { value: 'LIABILITY' as AccountType, label: 'Kewajiban' },
  { value: 'EQUITY' as AccountType, label: 'Ekuitas' },
  { value: 'REVENUE' as AccountType, label: 'Pendapatan' },
  { value: 'EXPENSE' as AccountType, label: 'Beban' },
];

interface FormProps {
  account?: ChartOfAccount;
  onSuccess: () => void;
  onCancel: () => void;
}

function AccountForm({ account, onSuccess, onCancel }: FormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    kodeRekening: account?.kodeRekening || '',
    namaRekening: account?.namaRekening || '',
    jenisAkun: account?.jenisAkun || ('ASSET' as AccountType),
    level: account?.level || 1,
    parentKode: account?.parentKode || '',
    isDetail: account?.isHeader === false,
    isBudgetControl: account?.isBudgetControl || false,
    deskripsi: account?.deskripsi || '',
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (account) {
        return apiClient.patch(`/chart-of-accounts/${account.id}`, data);
      }
      return apiClient.post('/chart-of-accounts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts', 'hierarchy'] });
      toast.success(account ? 'Akun berhasil diperbarui' : 'Akun berhasil dibuat');
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="kodeRekening">Kode Rekening *</Label>
        <Input
          id="kodeRekening"
          value={formData.kodeRekening}
          onChange={(e) => setFormData({ ...formData, kodeRekening: e.target.value })}
          placeholder="Contoh: 1.1.1.01.01"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="namaRekening">Nama Rekening *</Label>
        <Input
          id="namaRekening"
          value={formData.namaRekening}
          onChange={(e) => setFormData({ ...formData, namaRekening: e.target.value })}
          placeholder="Contoh: Kas di Tangan"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jenisAkun">Jenis Akun *</Label>
        <Select
          value={formData.jenisAkun}
          onValueChange={(value: string) => setFormData({ ...formData, jenisAkun: value as AccountType })}
        >
          <SelectTrigger id="jenisAkun">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="level">Level *</Label>
        <Select
          value={formData.level.toString()}
          onValueChange={(value) => setFormData({ ...formData, level: parseInt(value) })}
        >
          <SelectTrigger id="level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((level) => (
              <SelectItem key={level} value={level.toString()}>
                Level {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="parentKode">Akun Induk (Opsional)</Label>
        <Input
          id="parentKode"
          value={formData.parentKode}
          onChange={(e) => setFormData({ ...formData, parentKode: e.target.value })}
          placeholder="Contoh: 1.1.1"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDetail"
          checked={formData.isDetail}
          onCheckedChange={(checked) => setFormData({ ...formData, isDetail: !!checked })}
        />
        <Label htmlFor="isDetail">Akun Detail (dapat diposting)</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isBudgetControl"
          checked={formData.isBudgetControl}
          onCheckedChange={(checked) => setFormData({ ...formData, isBudgetControl: !!checked })}
        />
        <Label htmlFor="isBudgetControl">Kontrol Anggaran</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deskripsi">Deskripsi (Opsional)</Label>
        <Input
          id="deskripsi"
          value={formData.deskripsi}
          onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
          placeholder="Keterangan tambahan"
        />
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Menyimpan...' : account ? 'Perbarui' : 'Buat'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ChartOfAccounts() {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<AccountType | undefined>();
  const [filterLevel, setFilterLevel] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<ChartOfAccount | undefined>();

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch, isRefetching } = useChartOfAccounts({
    search: search || undefined,
    jenisAkun: filterType,
    level: filterLevel,
    page: currentPage,
    limit: itemsPerPage,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiClient.delete(`/chart-of-accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['chart-of-accounts', 'hierarchy'] });
      toast.success('Akun berhasil dihapus');
      setDeleteDialogOpen(false);
      setDeletingAccount(undefined);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Terjadi kesalahan');
    },
  });

  const handleEdit = (account: ChartOfAccount) => {
    setEditingAccount(account);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (account: ChartOfAccount) => {
    setDeletingAccount(account);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingAccount) {
      deleteMutation.mutate(deletingAccount.id);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterTypeChange = (value: string) => {
    // value sudah diproses di onValueChange untuk mengubah 'all' menjadi ''
    setFilterType(value === '' ? undefined : (value as AccountType));
    setCurrentPage(1);
  };

  const handleFilterLevelChange = (value: string) => {
    // value sudah diproses di onValueChange untuk mengubah 'all' menjadi ''
    setFilterLevel(value === '' ? undefined : parseInt(value));
    setCurrentPage(1);
  };

  const getAccountTypeColor = (type: AccountType) => {
    const colors: Record<string, { light: string; dark: string }> = {
      ASSET: { light: 'bg-blue-100 text-blue-700', dark: 'dark:bg-blue-900/30 dark:text-blue-400' },
      LIABILITY: { light: 'bg-red-100 text-red-700', dark: 'dark:bg-red-900/30 dark:text-red-400' },
      EQUITY: { light: 'bg-green-100 text-green-700', dark: 'dark:bg-green-900/30 dark:text-green-400' },
      REVENUE: { light: 'bg-emerald-100 text-emerald-700', dark: 'dark:bg-emerald-900/30 dark:text-emerald-400' },
      EXPENSE: { light: 'bg-orange-100 text-orange-700', dark: 'dark:bg-orange-900/30 dark:text-orange-400' },
    };
    const color = colors[type] || { light: 'bg-gray-100 text-gray-700', dark: 'dark:bg-gray-800 dark:text-gray-400' };
    return `${color.light} ${color.dark}`;
  };

  const getAccountTypeLabel = (type: AccountType) => {
    return ACCOUNT_TYPES.find((t) => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chart of Accounts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola struktur akun keuangan</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Akun
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-950 border dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="justify-start"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {isFilterOpen ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>

          {isFilterOpen && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">Jenis Akun</label>
                <Select
                  value={filterType || 'all'}
                  onValueChange={(value) => handleFilterTypeChange(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Semua jenis akun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua jenis akun</SelectItem>
                    {ACCOUNT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">Level</label>
                <Select
                  value={filterLevel?.toString() || 'all'}
                  onValueChange={(value) => handleFilterLevelChange(value === 'all' ? '' : value)}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Semua level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua level</SelectItem>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        Level {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 block">Pencarian</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
                  <Input
                    placeholder="Cari kode, nama, atau deskripsi..."
                    value={search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-[300px] pl-9"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg overflow-hidden">
        {error ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error instanceof Error ? error.message : 'Gagal memuat data akun'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              Coba Lagi
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Belum Ada Data</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {search || filterType || filterLevel
                ? 'Tidak ada akun yang sesuai dengan filter'
                : 'Belum ada akun yang terdaftar'}
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Buat Akun Pertama
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="w-[150px] text-base dark:text-gray-300">Kode Rekening</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Nama Rekening</TableHead>
                    <TableHead className="w-[130px] text-base dark:text-gray-300">Jenis Akun</TableHead>
                    <TableHead className="w-[80px] text-base dark:text-gray-300">Level</TableHead>
                    <TableHead className="w-[120px] text-base dark:text-gray-300">Induk</TableHead>
                    <TableHead className="w-[120px] text-base text-right dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.map((account) => (
                    <TableRow key={account.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{account.kodeRekening}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-950 dark:text-gray-50">{account.namaRekening}</div>
                          {account.deskripsi && (
                            <div className="text-sm text-gray-600 dark:text-gray-400">{account.deskripsi}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.jenisAkun)}`}>
                          {getAccountTypeLabel(account.jenisAkun)}
                        </span>
                      </TableCell>
                      <TableCell>Level {account.level}</TableCell>
                      <TableCell className="text-sm">{account.parentKode || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(account)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(account)}
                            title="Hapus"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {data && data.meta && (
              <div className="px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
                <Pagination
                  currentPage={data.meta.page}
                  totalPages={data.meta.totalPages}
                  totalItems={data.meta.total}
                  itemsPerPage={data.meta.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Akun Baru</DialogTitle>
            <DialogDescription>
              Buat akun baru dalam Chart of Accounts. Pastikan kode rekening unik.
            </DialogDescription>
          </DialogHeader>
          <AccountForm
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Akun</DialogTitle>
            <DialogDescription>
              Perbarui informasi akun. Pastikan data yang dimasukkan benar.
            </DialogDescription>
          </DialogHeader>
          {editingAccount && (
            <AccountForm
              account={editingAccount}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setEditingAccount(undefined);
              }}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingAccount(undefined);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Akun</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus akun "{deletingAccount?.namaRekening}"? Tindakan ini
              tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
