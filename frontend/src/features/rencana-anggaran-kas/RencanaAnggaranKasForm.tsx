import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, SimpleSelect as Select, Alert } from '@/components/ui';
import { anggaranKasApi } from './rencana-anggaran-kas.api';
import type { AnggaranKas, JenisAnggaranKas } from './rencana-anggaran-kas.types';

interface AnggaranKasFormProps {
  anggaranKas: AnggaranKas | null;
  onClose: () => void;
  defaultTahun?: number;
  defaultBulan?: number;
}

const BULAN_OPTIONS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

export default function AnggaranKasForm({
  anggaranKas,
  onClose,
  defaultTahun = new Date().getFullYear(),
  defaultBulan = new Date().getMonth() + 1,
}: AnggaranKasFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    tahun: anggaranKas?.tahun || defaultTahun,
    bulan: anggaranKas?.bulan || defaultBulan,
    jenisAnggaran: (anggaranKas?.jenisAnggaran || 'PENERIMAAN') as JenisAnggaranKas,
    kodeRekening: anggaranKas?.kodeRekening || '',
    uraian: anggaranKas?.uraian || '',
    jumlahAnggaran: anggaranKas?.jumlahAnggaran || 0,
    realisasi: anggaranKas?.realisasi || 0,
    keterangan: anggaranKas?.keterangan || '',
  });

  const createMutation = useMutation({
    mutationFn: anggaranKasApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran-kas'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projection'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Gagal menyimpan data');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => anggaranKasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anggaran-kas'] });
      queryClient.invalidateQueries({ queryKey: ['cash-flow-projection'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Gagal memperbarui data');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.kodeRekening.trim()) {
      setError('Kode rekening harus diisi');
      return;
    }
    if (!formData.uraian.trim()) {
      setError('Uraian harus diisi');
      return;
    }
    if (formData.jumlahAnggaran <= 0) {
      setError('Jumlah anggaran harus lebih dari 0');
      return;
    }

    if (anggaranKas) {
      updateMutation.mutate({ id: anggaranKas.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={anggaranKas ? 'Edit Anggaran Kas' : 'Tambah Anggaran Kas'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="destructive">{error}</Alert>}

        <div className="grid grid-cols-2 gap-4">
          {/* Tahun */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.tahun}
              onChange={(e) => setFormData({ ...formData, tahun: parseInt(e.target.value) })}
              min={2000}
              max={2100}
              required
            />
          </div>

          {/* Bulan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.bulan.toString()}
              onChange={(e) => setFormData({ ...formData, bulan: parseInt(e.target.value) })}
              required
            >
              {BULAN_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Jenis Anggaran */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Anggaran <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.jenisAnggaran}
            onChange={(e) => setFormData({ ...formData, jenisAnggaran: e.target.value as JenisAnggaranKas })}
            required
          >
            <option value="PENERIMAAN">Penerimaan</option>
            <option value="PENGELUARAN">Pengeluaran</option>
          </Select>
        </div>

        {/* Kode Rekening */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Kode Rekening <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={formData.kodeRekening}
            onChange={(e) => setFormData({ ...formData, kodeRekening: e.target.value })}
            placeholder="Contoh: 4.1.01.01"
            required
          />
        </div>

        {/* Uraian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Uraian <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.uraian}
            onChange={(e) => setFormData({ ...formData, uraian: e.target.value })}
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Deskripsi anggaran kas"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Jumlah Anggaran */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah Anggaran <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={formData.jumlahAnggaran}
              onChange={(e) => setFormData({ ...formData, jumlahAnggaran: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
              required
            />
          </div>

          {/* Realisasi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Realisasi
            </label>
            <Input
              type="number"
              value={formData.realisasi}
              onChange={(e) => setFormData({ ...formData, realisasi: parseFloat(e.target.value) || 0 })}
              min={0}
              step={0.01}
            />
          </div>
        </div>

        {/* Keterangan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Keterangan
          </label>
          <Input
            type="text"
            value={formData.keterangan}
            onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
            placeholder="Keterangan tambahan (opsional)"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : anggaranKas ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
