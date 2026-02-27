import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui';
import { ArrowLeft, Edit, Plus } from 'lucide-react';
import { programRBAApi } from './api';
import ProgramRBAForm from './ProgramRBAForm';

export default function ProgramRBADetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  const { data: program, isLoading, error } = useQuery({
    queryKey: ['program-rba', id],
    queryFn: () => programRBAApi.getById(id!),
    enabled: !!id,
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-destructive">Gagal memuat data program</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/program-rba')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Detail Program RBA</h1>
            <p className="text-muted-foreground">Informasi lengkap program RBA</p>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Program
        </Button>
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Program</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kode Program</p>
              <p className="text-lg font-medium">{program.kodeProgram}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tahun Anggaran</p>
              <p className="text-lg font-medium">{program.tahun}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Nama Program</p>
              <p className="text-lg font-medium">{program.namaProgram}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Pagu Anggaran</p>
              <p className="text-lg font-medium text-foreground">
                {program.paguAnggaran ? formatCurrency(Number(program.paguAnggaran)) : 'Rp 0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Jumlah Kegiatan</p>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {program.kegiatan?.length || 0} kegiatan
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indikator Program Card */}
      <Card>
        <CardHeader>
          <CardTitle>Indikator Program</CardTitle>
        </CardHeader>
        <CardContent>
          {program.indikatorProgram && program.indikatorProgram.length > 0 ? (
            <div className="space-y-4">
              {program.indikatorProgram.map((indikator: any, index: number) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Nama Indikator</p>
                      <p className="font-medium">{indikator.namaIndikator || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Target</p>
                      <p className="font-medium">{indikator.target || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Satuan</p>
                      <p className="font-medium">{indikator.satuan || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Tidak ada indikator program
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kegiatan List Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kegiatan dalam Program</CardTitle>
          <Button size="sm" onClick={() => navigate(`/kegiatan-rba?programId=${program.id}`)}>
            <Plus className="h-4 w-4 mr-2" />
            Lihat Semua Kegiatan
          </Button>
        </CardHeader>
        <CardContent>
          {program.kegiatan && program.kegiatan.length > 0 ? (
            <div className="space-y-3">
              {program.kegiatan.slice(0, 5).map((kegiatan: any) => (
                <div
                  key={kegiatan.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/kegiatan-rba/${kegiatan.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{kegiatan.kodeKegiatan}</span>
                        <Badge variant="outline" className="text-xs">
                          {kegiatan.tahun}
                        </Badge>
                      </div>
                      <p className="font-medium">{kegiatan.namaKegiatan}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {kegiatan.paguAnggaran ? formatCurrency(Number(kegiatan.paguAnggaran)) : 'Rp 0'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {program.kegiatan.length > 5 && (
                <div className="text-center pt-2">
                  <Button variant="link" onClick={() => navigate(`/kegiatan-rba?programId=${program.id}`)}>
                    Lihat {program.kegiatan.length - 5} kegiatan lainnya
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Belum ada kegiatan dalam program ini</p>
              <Button
                variant="link"
                className="mt-2"
                onClick={() => navigate(`/kegiatan-rba?programId=${program.id}`)}
              >
                Tambah Kegiatan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal */}
      {isFormOpen && (
        <ProgramRBAForm
          open={isFormOpen}
          onClose={handleCloseForm}
          program={program}
        />
      )}
    </div>
  );
}