import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { kegiatanRBAApi } from './api';
import { subKegiatanRBAApi } from '../subkegiatan-rba/api';
import KegiatanRBAForm from './KegiatanRBAForm';

export default function KegiatanRBADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditFormOpen, setIsEditFormOpen] = React.useState(false);

  // Fetch kegiatan detail
  const { data: kegiatan, isLoading } = useQuery({
    queryKey: ['kegiatan-rba', id],
    queryFn: () => kegiatanRBAApi.getById(id!),
    enabled: !!id,
  });

  // Fetch sub kegiatan for this kegiatan
  const { data: subKegiatanList } = useQuery({
    queryKey: ['subkegiatan-rba', 'by-kegiatan', id],
    queryFn: () => subKegiatanRBAApi.getByKegiatan(id!),
    enabled: !!id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => kegiatanRBAApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kegiatan-rba'] });
      navigate('/kegiatan-rba');
    },
  });

  const handleDelete = () => {
    if (
      window.confirm(
        `Hapus kegiatan "${kegiatan?.namaKegiatan}"? Semua sub kegiatan dalam kegiatan ini juga akan terhapus.`
      )
    ) {
      deleteMutation.mutate();
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Memuat data...</p>
      </div>
    );
  }

  if (!kegiatan) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Kegiatan tidak ditemukan</p>
        <Button onClick={() => navigate('/kegiatan-rba')}>Kembali ke Daftar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/kegiatan-rba')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Kegiatan RBA</h1>
            <p className="text-gray-600">{kegiatan.kodeKegiatan}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditFormOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4 mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      {/* Main Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kegiatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Kode Kegiatan</label>
              <p className="text-lg font-semibold">{kegiatan.kodeKegiatan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tahun Anggaran</label>
              <p className="text-lg font-semibold">{kegiatan.tahun}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Nama Kegiatan</label>
            <p className="text-base">{kegiatan.namaKegiatan}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Program RBA</label>
            <p className="text-base">
              {kegiatan.program ? (
                <>
                  <span className="font-medium">[{kegiatan.program.kodeProgram}]</span>{' '}
                  {kegiatan.program.namaProgram}
                </>
              ) : (
                '-'
              )}
            </p>
          </div>

          {kegiatan.deskripsi && (
            <div>
              <label className="text-sm font-medium text-gray-500">Deskripsi</label>
              <p className="text-base text-gray-700">{kegiatan.deskripsi}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={kegiatan.isActive ? 'success' : 'secondary'}>
                {kegiatan.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indikator Kegiatan */}
      <Card>
        <CardHeader>
          <CardTitle>Indikator Kegiatan</CardTitle>
        </CardHeader>
        <CardContent>
          {kegiatan.indikatorKegiatan && kegiatan.indikatorKegiatan.length > 0 ? (
            <ol className="space-y-2 list-decimal list-inside">
              {kegiatan.indikatorKegiatan.map((indikator, idx) => (
                <li key={idx} className="text-base">
                  <span className="font-medium">{indikator.nama}</span> -{' '}
                  <span className="text-gray-700">
                    {indikator.target} {indikator.satuan}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-gray-500 italic">Tidak ada indikator kegiatan</p>
          )}
        </CardContent>
      </Card>

      {/* Sub Kegiatan RBA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sub Kegiatan RBA</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Sub kegiatan dalam kegiatan ini ({subKegiatanList?.length || 0})
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/subkegiatan-rba')}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Sub Kegiatan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {subKegiatanList && subKegiatanList.length > 0 ? (
            <Table>
              <TableHeader className="bg-gray-100 dark:bg-gray-950">
                <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                  <TableHead className="text-base dark:text-gray-300">Kode</TableHead>
                  <TableHead className="text-base dark:text-gray-300">Nama Sub Kegiatan</TableHead>
                  <TableHead className="text-right text-base dark:text-gray-300">Volume Target</TableHead>
                  <TableHead className="text-right text-base dark:text-gray-300">Total Pagu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subKegiatanList.map((subKegiatan) => (
                  <TableRow
                    key={subKegiatan.id}
                    className="cursor-pointer bg-background hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => navigate(`/subkegiatan-rba/${subKegiatan.id}`)}
                  >
                    <TableCell className="font-medium">{subKegiatan.kodeSubKegiatan}</TableCell>
                    <TableCell>{subKegiatan.namaSubKegiatan}</TableCell>
                    <TableCell className="text-right">
                      {subKegiatan.volumeTarget.toLocaleString('id-ID')} {subKegiatan.satuan}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(subKegiatan.totalPagu) || 0)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Belum ada sub kegiatan dalam kegiatan ini</p>
              <Button size="sm" onClick={() => navigate('/subkegiatan-rba')}>
                Tambah Sub Kegiatan Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Form Modal */}
      {isEditFormOpen && (
        <KegiatanRBAForm kegiatan={kegiatan} onClose={() => setIsEditFormOpen(false)} />
      )}
    </div>
  );
}
