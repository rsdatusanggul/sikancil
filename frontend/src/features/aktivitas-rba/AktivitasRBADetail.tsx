import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { aktivitasRBAApi, kodeBelanjaApi } from './api';
import AktivitasRBAForm from './AktivitasRBAForm';
import KodeBelanjaForm from './components/KodeBelanjaForm';
import type { KodeBelanja } from './types';

export default function AktivitasRBADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditFormOpen, setIsEditFormOpen] = React.useState(false);
  const [isKodeBelanjaFormOpen, setIsKodeBelanjaFormOpen] = React.useState(false);
  const [editingKodeBelanja, setEditingKodeBelanja] = React.useState<KodeBelanja | null>(null);

  const { data: aktivitas, isLoading: isLoadingAktivitas } = useQuery({
    queryKey: ['aktivitas-rba', id],
    queryFn: () => aktivitasRBAApi.getById(id!),
    enabled: !!id,
  });

  const { data: kodeBelanjaList = [], isLoading: isLoadingKodeBelanja, refetch: refetchKodeBelanja } = useQuery({
    queryKey: ['kode-belanja', id],
    queryFn: () => kodeBelanjaApi.getAll(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => aktivitasRBAApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aktivitas-rba'] });
      navigate('/aktivitas-rba');
    },
  });

  const deleteKodeBelanjaMutation = useMutation({
    mutationFn: (kodeBelanjaId: string) => kodeBelanjaApi.delete(kodeBelanjaId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['kode-belanja'] });
      await queryClient.invalidateQueries({ queryKey: ['aktivitas-rba'] });
      await refetchKodeBelanja();
      alert('✅ Kode Belanja berhasil dihapus!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal menghapus kode belanja';
      alert('❌ ' + message);
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Hapus aktivitas "${aktivitas?.namaSubOutput}"?`)) {
      deleteMutation.mutate();
    }
  };

  const handleDeleteKodeBelanja = (kodeBelanjaId: string, nama: string) => {
    if (window.confirm(`Hapus Kode Belanja "${nama}"?`)) {
      deleteKodeBelanjaMutation.mutate(kodeBelanjaId);
    }
  };

  const handleEditKodeBelanja = (kodeBelanja: KodeBelanja) => {
    setEditingKodeBelanja(kodeBelanja);
    setIsKodeBelanjaFormOpen(true);
  };

  const handleAddKodeBelanja = () => {
    setEditingKodeBelanja(null);
    setIsKodeBelanjaFormOpen(true);
  };

  const handleKodeBelanjaFormClose = () => {
    setIsKodeBelanjaFormOpen(false);
    setEditingKodeBelanja(null);
    refetchKodeBelanja();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total pagu from all kode belanja
  const totalKodeBelanja = React.useMemo(() => {
    return kodeBelanjaList.reduce((sum, kb) => sum + (kb.pagu || 0), 0);
  }, [kodeBelanjaList]);

  if (isLoadingAktivitas) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Memuat data...</p></div>;
  }

  if (!aktivitas) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">Aktivitas tidak ditemukan</p>
        <Button onClick={() => navigate('/aktivitas-rba')}>Kembali ke Daftar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/aktivitas-rba')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Aktivitas</h1>
            <p className="text-gray-600">{aktivitas.kodeSubOutput}</p>
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

      {/* Aktivitas Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Aktivitas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Kode Aktivitas</label>
              <p className="text-lg font-semibold">{aktivitas.kodeSubOutput}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Tahun Anggaran</label>
              <p className="text-lg font-semibold">{aktivitas.tahun}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Nama Aktivitas</label>
            <p className="text-base">{aktivitas.namaSubOutput}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Sub Kegiatan RBA</label>
            <p className="text-base">
              {aktivitas.subKegiatan ? (
                <Link 
                  to={`/subkegiatan-rba/${aktivitas.subKegiatan.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span className="font-medium">[{aktivitas.subKegiatan.kodeSubKegiatan}]</span> {aktivitas.subKegiatan.namaSubKegiatan}
                </Link>
              ) : (
                '-'
              )}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Volume Target</label>
            <p className="text-lg font-semibold">
              {aktivitas.volumeTarget.toLocaleString('id-ID')} {aktivitas.satuan}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Total Pagu</label>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(aktivitas.totalPagu)}</p>
            {totalKodeBelanja !== aktivitas.totalPagu && (
              <p className="text-sm text-orange-600 mt-1">
                Total Kode Belanja: {formatCurrency(totalKodeBelanja)}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge variant={aktivitas.isActive ? 'success' : 'secondary'}>
                {aktivitas.isActive ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kode Belanja Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kode Belanja</CardTitle>
          <Button size="sm" onClick={handleAddKodeBelanja}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kode Belanja
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingKodeBelanja ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">Memuat kode belanja...</div>
          ) : kodeBelanjaList.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              Belum ada kode belanja untuk aktivitas ini
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="text-base dark:text-gray-300">Kode Rekening</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Nama Rekening</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Jenis Belanja</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Sumber Dana</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Kategori</TableHead>
                    <TableHead className="text-right text-base dark:text-gray-300">Pagu</TableHead>
                    <TableHead className="text-center text-base dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {kodeBelanjaList.map((kodeBelanja) => (
                    <TableRow key={kodeBelanja.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                      <TableCell className="font-medium">{kodeBelanja.kodeRekening}</TableCell>
                      <TableCell>{kodeBelanja.namaRekening}</TableCell>
                      <TableCell>
                        <Badge variant={kodeBelanja.jenisBelanja === 'OPERASIONAL' ? 'default' : 'outline'}>
                          {kodeBelanja.jenisBelanja}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{kodeBelanja.sumberDana}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{kodeBelanja.kategori || '-'}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(kodeBelanja.pagu)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditKodeBelanja(kodeBelanja)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteKodeBelanja(kodeBelanja.id, kodeBelanja.namaRekening)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* Edit Aktivitas Modal */}
      {isEditFormOpen && (
        <AktivitasRBAForm
          aktivitas={aktivitas}
          onClose={() => setIsEditFormOpen(false)}
        />
      )}

      {/* Kode Belanja Form Modal */}
      {isKodeBelanjaFormOpen && (
        <KodeBelanjaForm
          kodeBelanja={editingKodeBelanja}
          onClose={handleKodeBelanjaFormClose}
          subOutputId={aktivitas.id}
          tahun={aktivitas.tahun}
          existingKodeRekenings={kodeBelanjaList.map(kb => kb.kodeRekening)}
        />
      )}
    </div>
  );
}