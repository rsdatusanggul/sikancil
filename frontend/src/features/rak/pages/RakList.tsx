import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useRakList } from '../hooks/useRakQuery';
import { RakStatusBadge } from '../components/RakDetail/RakStatusBadge';
import { RakStatus } from '../types/rak.types';
import { Plus, Search, Eye, Pencil } from 'lucide-react';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

export function RakList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RakStatus | ''>('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const { activeFiscalYear } = useFiscalYear();
  const tahunAnggaran = activeFiscalYear?.tahun || new Date().getFullYear();

  const { data, isLoading, error } = useRakList({
    search,
    tahun_anggaran: tahunAnggaran,
    status: status || undefined,
    page,
    limit,
  });

  const handleView = (id: string) => {
    navigate(`/rak/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/rak/${id}/edit`);
  };

  const handleCreate = () => {
    navigate('/rak/create');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading RAK data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Daftar RAK</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Rencana Anggaran Kas per Subkegiatan
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Buat RAK Baru
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Cari subkegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RakStatus | '')}
            className="w-full px-3 py-2 border rounded-md bg-background dark:bg-gray-950 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Semua Status</option>
            <option value={RakStatus.DRAFT}>Draft</option>
            <option value={RakStatus.SUBMITTED}>Diajukan</option>
            <option value={RakStatus.APPROVED}>Disetujui</option>
            <option value={RakStatus.REJECTED}>Ditolak</option>
            <option value={RakStatus.REVISED}>Direvisi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border dark:border-gray-700">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-950">
            <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
              <TableHead className="text-base dark:text-gray-300">Subkegiatan</TableHead>
              <TableHead className="text-base dark:text-gray-300">Tahun</TableHead>
              <TableHead className="text-base dark:text-gray-300">Total Pagu</TableHead>
              <TableHead className="text-base dark:text-gray-300">Status</TableHead>
              <TableHead className="text-base dark:text-gray-300">Revisi</TableHead>
              <TableHead className="text-base dark:text-gray-300">Tanggal Submit</TableHead>
              <TableHead className="text-right text-base dark:text-gray-300">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.length === 0 ? (
              <TableRow className="bg-background">
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">Tidak ada data RAK</p>
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((rak) => (
                <TableRow key={rak.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                  <TableCell>
                    <div>
                      <p className="font-medium text-gray-950 dark:text-gray-50">{rak.subkegiatan.kode}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rak.subkegiatan.uraian}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-100 dark:text-gray-50">{rak.tahun_anggaran}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-100 dark:text-gray-50">
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                      }).format(rak.total_pagu)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RakStatusBadge status={rak.status} />
                  </TableCell>
                  <TableCell className="text-gray-100 dark:text-gray-50">{rak.revision_number}</TableCell>
                  <TableCell className="text-gray-100 dark:text-gray-50">
                    {rak.submitted_at
                      ? new Date(rak.submitted_at).toLocaleDateString('id-ID')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleView(rak.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(rak.id)}
                        disabled={rak.status !== RakStatus.DRAFT}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex justify-center gap-2 px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {page} of {data.meta.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === data.meta.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}