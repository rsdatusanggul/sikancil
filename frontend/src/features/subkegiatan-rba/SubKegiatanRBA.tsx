import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
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
} from '@/components/ui';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { subKegiatanRBAApi } from './api';
import { kegiatanRBAApi } from '../kegiatan-rba/api';
import { formatMonthRange } from './components/TimelineInput';
import SubKegiatanRBAForm from './SubKegiatanRBAForm';
import type { SubKegiatanRBA } from './types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

export default function SubKegiatanRBAPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();

  const selectedYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const [selectedKegiatan, setSelectedKegiatan] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingSubKegiatan, setEditingSubKegiatan] = React.useState<SubKegiatanRBA | null>(null);

  // Fetch sub kegiatan list
  const { data: subKegiatanList, isLoading, refetch } = useQuery({
    queryKey: [
      'subkegiatan-rba',
      {
        tahun: selectedYear,
        kegiatanId: selectedKegiatan || undefined,
        search: searchQuery || undefined,
        isActive: true,
      },
    ],
    queryFn: () =>
      subKegiatanRBAApi.getAll({
        tahun: selectedYear,
        kegiatanId: selectedKegiatan || undefined,
        search: searchQuery || undefined,
        isActive: true,
      }),
    refetchOnWindowFocus: true,
    staleTime: 0, // Always refetch to ensure fresh data
  });

  // Fetch kegiatan for filter
  const { data: kegiatanList } = useQuery({
    queryKey: ['kegiatan-rba', selectedYear, true],
    queryFn: () => kegiatanRBAApi.getAll({ tahun: selectedYear, isActive: true }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subKegiatanRBAApi.delete(id),
    onSuccess: async () => {
      // Invalidate queries and refetch
      await queryClient.invalidateQueries({ queryKey: ['subkegiatan-rba'] });
      await queryClient.invalidateQueries({ queryKey: ['kegiatan-pagu-info'] });

      // Explicit refetch to ensure list updates
      await refetch();

      // Show success notification
      alert('✅ Sub Kegiatan berhasil dihapus!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal menghapus sub kegiatan';
      alert('❌ ' + message);
    },
  });

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Hapus sub kegiatan "${nama}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (subKegiatan: SubKegiatanRBA) => {
    setEditingSubKegiatan(subKegiatan);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingSubKegiatan(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingSubKegiatan(null);

    // Explicitly refetch to ensure list is updated
    refetch();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredList = React.useMemo(() => {
    if (!subKegiatanList) return [];
    if (!searchQuery) return subKegiatanList;

    return subKegiatanList.filter(
      (sk) =>
        sk.namaSubKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sk.kodeSubKegiatan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [subKegiatanList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sub Kegiatan RBA</h1>
          <p className="text-muted-foreground">Kelola sub kegiatan dalam Kegiatan RBA</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Sub Kegiatan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 bg-white dark:bg-gray-950 border dark:border-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-4">
            {/* Kegiatan Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Kegiatan:</label>
              <select
                value={selectedKegiatan}
                onChange={(e) => setSelectedKegiatan(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[250px]"
              >
                <option value="">Semua Kegiatan</option>
                {kegiatanList?.data?.map((kegiatan) => (
                  <option key={kegiatan.id} value={kegiatan.id}>
                    [{kegiatan.kodeKegiatan}] {kegiatan.namaKegiatan}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari kode atau nama sub kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Sub Kegiatan RBA</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="w-[130px] text-base dark:text-gray-300">Kode</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Nama Sub Kegiatan</TableHead>
                    <TableHead className="w-[200px] text-base dark:text-gray-300">Kegiatan</TableHead>
                    <TableHead className="w-[150px] text-right text-base dark:text-gray-300">Volume Target</TableHead>
                    <TableHead className="w-[120px] text-center text-base dark:text-gray-300">Timeline</TableHead>
                    <TableHead className="w-[150px] text-right text-base dark:text-gray-300">Total Pagu</TableHead>
                    <TableHead className="w-[150px] text-center text-base dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList && filteredList.length > 0 ? (
                    filteredList.map((subKegiatan) => (
                      <TableRow key={subKegiatan.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="font-medium text-gray-100 dark:text-gray-50">{subKegiatan.kodeSubKegiatan}</TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-100 dark:text-gray-50">{subKegiatan.namaSubKegiatan}</div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {subKegiatan.kegiatan ? (
                            <>
                              <div className="font-medium text-gray-100 dark:text-gray-50">[{subKegiatan.kegiatan.kodeKegiatan}]</div>
                              <div>{subKegiatan.kegiatan.namaKegiatan.substring(0, 30)}...</div>
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-100 dark:text-gray-50">
                            {subKegiatan.volumeTarget.toLocaleString('id-ID')}{' '}
                            <span className="text-gray-600 dark:text-gray-400">{subKegiatan.satuan}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-xs">
                            {formatMonthRange(subKegiatan.bulanMulai, subKegiatan.bulanSelesai)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-100 dark:text-gray-50">
                            {formatCurrency(subKegiatan.totalPagu)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/subkegiatan-rba/${subKegiatan.id}`)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(subKegiatan)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(subKegiatan.id, subKegiatan.namaSubKegiatan)}
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        {searchQuery
                          ? 'Tidak ada sub kegiatan yang sesuai dengan pencarian'
                          : `Tidak ada data sub kegiatan untuk tahun ${selectedYear}`}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <SubKegiatanRBAForm
          subKegiatan={editingSubKegiatan}
          onClose={handleFormClose}
          defaultKegiatanId={selectedKegiatan || undefined}
        />
      )}
    </div>
  );
}
