import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, Button, Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge } from '@/components/ui';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { programRBAApi } from './api';
import ProgramRBAForm from './ProgramRBAForm';
import type { ProgramRBA as ProgramRBAType } from './types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

export default function ProgramRBA() {
  const navigate = useNavigate();
  const { activeFiscalYear } = useFiscalYear();
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<ProgramRBAType | undefined>();
  const queryClient = useQueryClient();

  const selectedYear = activeFiscalYear?.tahun || new Date().getFullYear();

  const { data: programs, isLoading } = useQuery({
    queryKey: ['program-rba', selectedYear],
    queryFn: () => programRBAApi.getAll(selectedYear),
  });

  const deleteMutation = useMutation({
    mutationFn: programRBAApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-rba'] });
      alert('✅ Program RBA berhasil dihapus!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Gagal menghapus program';
      alert('❌ Error: ' + errorMessage);
    },
  });

  const handleAdd = () => {
    setSelectedProgram(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (program: ProgramRBAType) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const handleViewDetail = (program: ProgramRBAType) => {
    navigate(`/program-rba/${program.id}`);
  };

  const handleDelete = async (program: ProgramRBAType) => {
    // Check if program has kegiatan
    const hasKegiatan = program.kegiatan && program.kegiatan.length > 0;

    if (hasKegiatan) {
      alert(
        `❌ Program "${program.namaProgram}" tidak dapat dihapus karena masih memiliki ${program.kegiatan?.length || 0} kegiatan.\n\n` +
        'Hapus semua kegiatan terlebih dahulu sebelum menghapus program.'
      );
      return;
    }

    if (window.confirm(`Apakah Anda yakin ingin menghapus program "${program.namaProgram}"?`)) {
      await deleteMutation.mutateAsync(program.id);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedProgram(undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Program RBA</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola program dalam Rencana Bisnis dan Anggaran</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Program
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Program RBA</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">Memuat data...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-gray-950">
                  <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                    <TableHead className="w-[120px] text-base dark:text-gray-300">Kode</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Nama Program</TableHead>
                    <TableHead className="text-base dark:text-gray-300">Indikator</TableHead>
                    <TableHead className="w-[180px] text-right text-base dark:text-gray-300">Pagu Anggaran</TableHead>
                    <TableHead className="w-[150px] text-center text-base dark:text-gray-300">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs && programs.length > 0 ? (
                    programs.map((program) => {
                      const hasKegiatan = program.kegiatan && program.kegiatan.length > 0;

                      return (
                        <TableRow key={program.id} className="bg-background hover:bg-gray-100 dark:hover:bg-gray-800">
                          <TableCell className="font-medium text-gray-100 dark:text-gray-50">{program.kodeProgram}</TableCell>
                          <TableCell>{program.namaProgram}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {program.indikatorProgram?.length ?? 0} indikator
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="font-medium text-gray-100 dark:text-gray-50">
                              {program.paguAnggaran
                                ? new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                  }).format(Number(program.paguAnggaran))
                                : 'Rp 0'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewDetail(program)}
                                title="Lihat Detail"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEdit(program)}
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(program)}
                                disabled={hasKegiatan}
                                title={hasKegiatan
                                  ? `Tidak bisa dihapus - memiliki ${program.kegiatan?.length || 0} kegiatan`
                                  : 'Hapus'}
                              >
                                <Trash2 className={`h-4 w-4 ${hasKegiatan ? 'text-gray-400' : 'text-red-600'}`} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Tidak ada data program untuk tahun {selectedYear}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProgramRBAForm open={isFormOpen} onClose={handleCloseForm} program={selectedProgram} />
    </div>
  );
}