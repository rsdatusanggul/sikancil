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
import { kegiatanRBAApi } from './api';
import { programRBAApi } from '../program-rba/api';
import KegiatanRBAForm from './KegiatanRBAForm';
import type { KegiatanRBA } from './types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

export default function KegiatanRBAPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();

  const selectedYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const [selectedProgram, setSelectedProgram] = React.useState<string>('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingKegiatan, setEditingKegiatan] = React.useState<KegiatanRBA | null>(null);

  // Fetch kegiatan list
  const { data: kegiatanResponse, isLoading, error: fetchError } = useQuery({
    queryKey: ['kegiatan-rba', { tahun: selectedYear, programId: selectedProgram || undefined, isActive: true }],
    queryFn: async () => {
      console.log('Fetching kegiatan RBA with params:', {
        tahun: selectedYear,
        programId: selectedProgram || undefined,
        search: searchQuery || undefined,
        isActive: true,
      });
      const result = await kegiatanRBAApi.getAll({
        tahun: selectedYear,
        programId: selectedProgram || undefined,
        search: searchQuery || undefined,
        isActive: true,
      });
      console.log('Kegiatan RBA response:', result);
      return result;
    },
  });

  const kegiatanList = kegiatanResponse?.data || [];

  // Log errors
  React.useEffect(() => {
    if (fetchError) {
      console.error('Error fetching kegiatan RBA:', fetchError);
    }
  }, [fetchError]);

  // Fetch programs for filter
  const { data: programs } = useQuery({
    queryKey: ['program-rba', selectedYear],
    queryFn: () => programRBAApi.getAll(selectedYear),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting kegiatan RBA:', id);
      const result = await kegiatanRBAApi.delete(id);
      console.log('Delete result:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Kegiatan deleted successfully, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['kegiatan-rba'] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan-in-program'] });
      queryClient.invalidateQueries({ queryKey: ['program-pagu-info'] });
      alert('✅ Kegiatan berhasil dihapus!');
    },
    onError: (error: any) => {
      console.error('Error deleting kegiatan:', error);
      const message = error.response?.data?.message || error.message || 'Gagal menghapus kegiatan';
      alert('❌ Error: ' + message);
    },
  });

  const handleDelete = (id: string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus kegiatan "${nama}"?\n\nTindakan ini tidak dapat dibatalkan.`)) {
      console.log('User confirmed delete for:', { id, nama });
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (kegiatan: KegiatanRBA) => {
    setEditingKegiatan(kegiatan);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingKegiatan(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingKegiatan(null);
  };

  const filteredList = React.useMemo(() => {
    if (!kegiatanList || kegiatanList.length === 0) return [];
    if (!searchQuery) return kegiatanList;

    return kegiatanList.filter(
      (k) =>
        k.namaKegiatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.kodeKegiatan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [kegiatanList, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Kegiatan RBA</h1>
          <p className="text-muted-foreground">Kelola kegiatan dalam Program RBA</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kegiatan
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 bg-white dark:bg-gray-950 border dark:border-gray-700 rounded-lg">
          <div className="flex flex-wrap gap-4">
            {/* Program Filter */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">Program:</label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
              >
                <option value="">Semua Program</option>
                {programs?.map((program) => (
                  <option key={program.id} value={program.id}>
                    [{program.kodeProgram}] {program.namaProgram}
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
                  placeholder="Cari kode atau nama kegiatan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-10 pr-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {fetchError && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <p className="font-medium">Terjadi kesalahan saat memuat data:</p>
              <p className="text-sm mt-1">{(fetchError as any)?.message || 'Unknown error'}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Kegiatan RBA</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Memuat data...</div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-950">
                <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                  <TableHead className="w-[120px] text-base dark:text-gray-300">Kode</TableHead>
                  <TableHead className="text-base dark:text-gray-300">Nama Kegiatan</TableHead>
                  <TableHead className="w-[180px] text-right text-base dark:text-gray-300">Pagu Anggaran</TableHead>
                  <TableHead className="w-[200px] text-base dark:text-gray-300">Program</TableHead>
                  <TableHead className="w-[100px] text-center text-base dark:text-gray-300">Indikator</TableHead>
                  <TableHead className="w-[80px] text-center text-base dark:text-gray-300">Tahun</TableHead>
                  <TableHead className="w-[130px] text-center text-base dark:text-gray-300">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredList && filteredList.length > 0 ? (
                  filteredList.map((kegiatan) => (
                    <TableRow key={kegiatan.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableCell className="font-medium text-gray-100 dark:text-gray-50">{kegiatan.kodeKegiatan}</TableCell>
                      <TableCell>
                        <div className="font-medium text-gray-100 dark:text-gray-50">{kegiatan.namaKegiatan}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-gray-100 dark:text-gray-50">
                          {kegiatan.paguAnggaran
                            ? new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                              }).format(Number(kegiatan.paguAnggaran))
                            : 'Rp 0'}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {kegiatan.program ? (
                          <>
                            <div className="font-medium text-gray-100 dark:text-gray-50">[{kegiatan.program.kodeProgram}]</div>
                            <div>{kegiatan.program.namaProgram}</div>
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {kegiatan.indikatorKegiatan && kegiatan.indikatorKegiatan.length > 0 ? (
                          <Badge variant="secondary">
                            {kegiatan.indikatorKegiatan.length} indikator
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{kegiatan.tahun}</TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => navigate(`/kegiatan-rba/${kegiatan.id}`)}
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(kegiatan)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(kegiatan.id, kegiatan.namaKegiatan)}
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
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      {searchQuery
                        ? 'Tidak ada kegiatan yang sesuai dengan pencarian'
                        : `Tidak ada data kegiatan untuk tahun ${selectedYear}`}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <KegiatanRBAForm
          kegiatan={editingKegiatan}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
