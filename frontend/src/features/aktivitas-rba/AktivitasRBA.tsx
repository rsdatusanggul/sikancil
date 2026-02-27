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
} from '@/components/ui';
import { Plus, Edit, Trash2, Eye, Search } from 'lucide-react';
import { aktivitasRBAApi } from './api';
import { subKegiatanRBAApi } from '../subkegiatan-rba/api';
import AktivitasRBAForm from './AktivitasRBAForm';
import type { AktivitasRBA } from './types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

export default function AktivitasRBAPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();

  const selectedYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const [selectedSubKegiatan, setSelectedSubKegiatan] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingAktivitas, setEditingAktivitas] = React.useState<AktivitasRBA | null>(null);

  // Fetch aktivitas list
  const { data: aktivitasList, isLoading, refetch } = useQuery({
    queryKey: [
      'aktivitas-rba',
      {
        tahun: selectedYear,
        subKegiatanId: selectedSubKegiatan || undefined,
        search: searchQuery || undefined,
        isActive: true,
      },
    ],
    queryFn: () =>
      aktivitasRBAApi.getAll({
        tahun: selectedYear,
        subKegiatanId: selectedSubKegiatan || undefined,
        search: searchQuery || undefined,
        isActive: true,
      }),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Fetch sub kegiatan for filter
  const { data: subKegiatanList } = useQuery({
    queryKey: ['subkegiatan-rba', selectedYear, true],
    queryFn: () => subKegiatanRBAApi.getAll({ tahun: selectedYear, isActive: true }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => aktivitasRBAApi.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['aktivitas-rba'] });
      await queryClient.invalidateQueries({ queryKey: ['subkegiatan-rba'] });
      await refetch();
      alert('✅ Aktivitas berhasil dihapus!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal menghapus aktivitas';
      alert('❌ ' + message);
    },
  });

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Hapus aktivitas "${nama}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (aktivitas: AktivitasRBA) => {
    setEditingAktivitas(aktivitas);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingAktivitas(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingAktivitas(null);
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
    if (!aktivitasList) return [];
    if (!searchQuery) return aktivitasList;

    return aktivitasList.filter(
      (a) =>
        a.namaSubOutput.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.kodeSubOutput.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [aktivitasList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aktivitas</h1>
          <p className="text-muted-foreground">Kelola aktivitas dalam Sub Kegiatan RBA</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Aktivitas
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 bg-white dark:bg-gray-950 border dark:border-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-4">
            {/* Sub Kegiatan Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Sub Kegiatan:</label>
              <select
                value={selectedSubKegiatan}
                onChange={(e) => setSelectedSubKegiatan(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[250px]"
              >
                <option value="">Semua Sub Kegiatan</option>
                {subKegiatanList?.map((subKegiatan) => (
                  <option key={subKegiatan.id} value={subKegiatan.id}>
                    [{subKegiatan.kodeSubKegiatan}] {subKegiatan.namaSubKegiatan}
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
                  placeholder="Cari kode atau nama aktivitas..."
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
          <CardTitle>Daftar Aktivitas</CardTitle>
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
                    <TableHead className="text-base dark:text-gray-300">Nama Aktivitas</TableHead>
                    <TableHead className="w-[200px] text-base dark:text-gray-300">Sub Kegiatan</TableHead>
                    <TableHead className="w-[120px] text-right text-base dark:text-gray-300">Volume</TableHead>
                    <TableHead className="w-[120px] text-right text-base dark:text-gray-300">Total Pagu</TableHead>
                    <TableHead className="w-[150px] text-center text-base dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredList && filteredList.length > 0 ? (
                    filteredList.map((aktivitas) => (
                      <TableRow key={aktivitas.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                        <TableCell className="font-medium text-gray-100 dark:text-gray-50">{aktivitas.kodeSubOutput}</TableCell>
                        <TableCell>
                          <div className="font-medium text-gray-100 dark:text-gray-50">{aktivitas.namaSubOutput}</div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                          {aktivitas.subKegiatan ? (
                            <>
                              <div className="font-medium text-gray-100 dark:text-gray-50">[{aktivitas.subKegiatan.kodeSubKegiatan}]</div>
                              <div>{aktivitas.subKegiatan.namaSubKegiatan.substring(0, 25)}...</div>
                            </>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-100 dark:text-gray-50">
                            {aktivitas.volumeTarget.toLocaleString('id-ID')}{' '}
                            <span className="text-gray-600 dark:text-gray-400">{aktivitas.satuan}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-100 dark:text-gray-50">
                            {formatCurrency(aktivitas.totalPagu)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 justify-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/aktivitas-rba/${aktivitas.id}`)}
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(aktivitas)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(aktivitas.id, aktivitas.namaSubOutput)}
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
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        {searchQuery
                          ? 'Tidak ada aktivitas yang sesuai dengan pencarian'
                          : `Tidak ada data aktivitas untuk tahun ${selectedYear}`}
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
        <AktivitasRBAForm
          aktivitas={editingAktivitas}
          onClose={handleFormClose}
          defaultSubKegiatanId={selectedSubKegiatan || undefined}
        />
      )}
    </div>
  );
}