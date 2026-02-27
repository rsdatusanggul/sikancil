import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
import { ArrowLeft, Edit, Trash2, Plus, Eye } from 'lucide-react';
import { subKegiatanRBAApi } from './api';
import { aktivitasRBAApi } from '../aktivitas-rba/api';
import { formatMonthRange } from './components/TimelineInput';
import SubKegiatanRBAForm from './SubKegiatanRBAForm';
import AktivitasRBAForm from '../aktivitas-rba/AktivitasRBAForm';

export default function SubKegiatanRBADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditFormOpen, setIsEditFormOpen] = React.useState(false);
  const [isAktivitasFormOpen, setIsAktivitasFormOpen] = React.useState(false);

  const { data: subKegiatan, isLoading } = useQuery({
    queryKey: ['subkegiatan-rba', id],
    queryFn: () => subKegiatanRBAApi.getById(id!),
    enabled: !!id,
  });

  const { data: aktivitasList = [], isLoading: isLoadingAktivitas, refetch: refetchAktivitas } = useQuery({
    queryKey: ['aktivitas-by-subkegiatan', id],
    queryFn: () => aktivitasRBAApi.getBySubKegiatan(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => subKegiatanRBAApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subkegiatan-rba'] });
      navigate('/subkegiatan-rba');
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Hapus sub kegiatan "${subKegiatan?.namaSubKegiatan}"?`)) {
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
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Memuat data...</p></div>;
  }

  if (!subKegiatan) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Sub Kegiatan tidak ditemukan</p>
        <Button onClick={() => navigate('/subkegiatan-rba')}>Kembali ke Daftar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/subkegiatan-rba')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Sub Kegiatan RBA</h1>
            <p className="text-gray-600">{subKegiatan.kodeSubKegiatan}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Informasi Sub Kegiatan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Kode Sub Kegiatan</label>
              <p className="text-lg font-semibold">{subKegiatan.kodeSubKegiatan}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tahun Anggaran</label>
              <p className="text-lg font-semibold">{subKegiatan.tahun}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Nama Sub Kegiatan</label>
            <p className="text-base">{subKegiatan.namaSubKegiatan}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Kegiatan RBA</label>
            <p className="text-base">
              {subKegiatan.kegiatan ? (
                <>
                  <span className="font-medium">[{subKegiatan.kegiatan.kodeKegiatan}]</span> {subKegiatan.kegiatan.namaKegiatan}
                </>
              ) : (
                '-'
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Volume Target</label>
              <p className="text-lg font-semibold">
                {subKegiatan.volumeTarget.toLocaleString('id-ID')} {subKegiatan.satuan}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timeline Pelaksanaan</label>
              <div className="mt-1">
                <Badge variant="outline">
                  {formatMonthRange(subKegiatan.bulanMulai, subKegiatan.bulanSelesai)}
                </Badge>
              </div>
            </div>
          </div>

          {subKegiatan.lokasi && (
            <div>
              <label className="text-sm font-medium text-gray-500">Lokasi</label>
              <p className="text-base">{subKegiatan.lokasi}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Total Pagu</label>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(subKegiatan.totalPagu)}</p>
          </div>

          {subKegiatan.deskripsi && (
            <div>
              <label className="text-sm font-medium text-gray-500">Deskripsi</label>
              <p className="text-base text-gray-700">{subKegiatan.deskripsi}</p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={subKegiatan.isActive ? 'success' : 'secondary'}>
                {subKegiatan.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aktivitas Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Aktivitas</CardTitle>
          <Button size="sm" onClick={() => setIsAktivitasFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Aktivitas
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingAktivitas ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">Memuat aktivitas...</div>
          ) : aktivitasList.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Belum ada aktivitas untuk sub kegiatan ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="text-base dark:text-gray-300">Kode</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Nama Aktivitas</TableHead>
                    <TableHead className="text-right text-base dark:text-gray-300">Volume</TableHead>
                    <TableHead className="text-right text-base dark:text-gray-300">Total Pagu</TableHead>
                    <TableHead className="text-center text-base dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aktivitasList.map((aktivitas) => (
                    <TableRow key={aktivitas.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{aktivitas.kodeSubOutput}</TableCell>
                      <TableCell>{aktivitas.namaSubOutput}</TableCell>
                      <TableCell className="text-right">
                        {aktivitas.volumeTarget.toLocaleString('id-ID')}{' '}
                        <span className="text-gray-600 dark:text-gray-400">{aktivitas.satuan}</span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(aktivitas.totalPagu)}
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {isEditFormOpen && <SubKegiatanRBAForm subKegiatan={subKegiatan} onClose={() => setIsEditFormOpen(false)} />}
      {isAktivitasFormOpen && (
        <AktivitasRBAForm
          aktivitas={null}
          onClose={() => {
            setIsAktivitasFormOpen(false);
            refetchAktivitas();
          }}
          defaultSubKegiatanId={subKegiatan.id}
        />
      )}
    </div>
  );
}
