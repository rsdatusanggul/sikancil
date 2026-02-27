import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, SimpleSelect as Select, Alert } from '@/components/ui';
import { revisiRBAApi } from './api';
import { programRBAApi } from '../program-rba/api';
import type { RevisiRBA, JenisRevisiRBA, PerubahanData } from './types';

interface RevisiRBAFormProps {
  revisi: RevisiRBA | null;
  onClose: () => void;
  defaultRBAId?: string;
}

const JENIS_REVISI_OPTIONS: { value: JenisRevisiRBA; label: string }[] = [
  { value: 'PERUBAHAN_PAGU', label: 'Perubahan Pagu' },
  { value: 'PERUBAHAN_VOLUME', label: 'Perubahan Volume' },
  { value: 'PERUBAHAN_WAKTU', label: 'Perubahan Waktu' },
  { value: 'PERGESERAN_ANGGARAN', label: 'Pergeseran Anggaran' },
  { value: 'LAIN_LAIN', label: 'Lain-lain' },
];

export default function RevisiRBAForm({ revisi, onClose, defaultRBAId = '' }: RevisiRBAFormProps) {
  const queryClient = useQueryClient();
  const [error, setError] = React.useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = React.useState({
    rbaId: revisi?.rbaId || defaultRBAId,
    tanggalRevisi: revisi?.tanggalRevisi?.split('T')[0] || new Date().toISOString().split('T')[0],
    alasanRevisi: revisi?.alasanRevisi || '',
  });

  const [perubahanData, setPerubahanData] = React.useState<PerubahanData>({
    type: revisi?.perubahanData.type || 'PERUBAHAN_PAGU',
    kodeRekening: revisi?.perubahanData.kodeRekening || '',
    paguSebelum: revisi?.perubahanData.paguSebelum || 0,
    paguSesudah: revisi?.perubahanData.paguSesudah || 0,
    selisih: revisi?.perubahanData.selisih || 0,
    volumeSebelum: revisi?.perubahanData.volumeSebelum || 0,
    volumeSesudah: revisi?.perubahanData.volumeSesudah || 0,
    waktuSebelum: revisi?.perubahanData.waktuSebelum || '',
    waktuSesudah: revisi?.perubahanData.waktuSesudah || '',
    keteranganTambahan: revisi?.perubahanData.keteranganTambahan || '',
  });

  // Fetch RBA list
  const { data: rbaList } = useQuery({
    queryKey: ['program-rba', currentYear],
    queryFn: () => programRBAApi.getAll(currentYear),
  });

  // Auto-calculate selisih
  React.useEffect(() => {
    if (perubahanData.type === 'PERUBAHAN_PAGU') {
      const selisih = (perubahanData.paguSesudah || 0) - (perubahanData.paguSebelum || 0);
      setPerubahanData((prev) => ({ ...prev, selisih }));
    }
  }, [perubahanData.paguSebelum, perubahanData.paguSesudah, perubahanData.type]);

  const createMutation = useMutation({
    mutationFn: revisiRBAApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisi-rba'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Gagal menyimpan data');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => revisiRBAApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisi-rba'] });
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
    if (!formData.rbaId) {
      setError('RBA harus dipilih');
      return;
    }
    if (!formData.alasanRevisi.trim()) {
      setError('Alasan revisi harus diisi');
      return;
    }

    const payload = {
      ...formData,
      perubahanData,
    };

    if (revisi) {
      updateMutation.mutate({ id: revisi.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={true} onClose={onClose} title={revisi ? 'Edit Revisi RBA' : 'Tambah Revisi RBA'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="destructive">{error}</Alert>}

        {/* RBA Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RBA / Program <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.rbaId}
            onChange={(e) => setFormData({ ...formData, rbaId: e.target.value })}
            required
          >
            <option value="">Pilih RBA</option>
            {rbaList?.map((rba) => (
              <option key={rba.id} value={rba.id}>
                [{rba.kodeProgram}] {rba.namaProgram}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tanggal Revisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Revisi <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={formData.tanggalRevisi}
              onChange={(e) => setFormData({ ...formData, tanggalRevisi: e.target.value })}
              required
            />
          </div>

          {/* Jenis Revisi */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Revisi <span className="text-red-500">*</span>
            </label>
            <Select
              value={perubahanData.type}
              onChange={(e) => setPerubahanData({ ...perubahanData, type: e.target.value as JenisRevisiRBA })}
              required
            >
              {JENIS_REVISI_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Alasan Revisi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Alasan Revisi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.alasanRevisi}
            onChange={(e) => setFormData({ ...formData, alasanRevisi: e.target.value })}
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Jelaskan alasan dilakukannya revisi"
            required
          />
        </div>

        {/* Kode Rekening */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kode Rekening</label>
          <Input
            type="text"
            value={perubahanData.kodeRekening}
            onChange={(e) => setPerubahanData({ ...perubahanData, kodeRekening: e.target.value })}
            placeholder="Contoh: 5.1.1.01.01"
          />
        </div>

        {/* Conditional Fields based on Jenis Revisi */}
        {perubahanData.type === 'PERUBAHAN_PAGU' && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm text-gray-700">Detail Perubahan Pagu</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Sebelum</label>
                <Input
                  type="number"
                  value={perubahanData.paguSebelum}
                  onChange={(e) =>
                    setPerubahanData({ ...perubahanData, paguSebelum: parseFloat(e.target.value) || 0 })
                  }
                  step={0.01}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pagu Sesudah</label>
                <Input
                  type="number"
                  value={perubahanData.paguSesudah}
                  onChange={(e) =>
                    setPerubahanData({ ...perubahanData, paguSesudah: parseFloat(e.target.value) || 0 })
                  }
                  step={0.01}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Selisih</label>
                <Input type="number" value={perubahanData.selisih} disabled className="bg-gray-100" />
              </div>
            </div>
          </div>
        )}

        {perubahanData.type === 'PERUBAHAN_VOLUME' && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm text-gray-700">Detail Perubahan Volume</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Volume Sebelum</label>
                <Input
                  type="number"
                  value={perubahanData.volumeSebelum}
                  onChange={(e) =>
                    setPerubahanData({ ...perubahanData, volumeSebelum: parseFloat(e.target.value) || 0 })
                  }
                  step={0.01}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Volume Sesudah</label>
                <Input
                  type="number"
                  value={perubahanData.volumeSesudah}
                  onChange={(e) =>
                    setPerubahanData({ ...perubahanData, volumeSesudah: parseFloat(e.target.value) || 0 })
                  }
                  step={0.01}
                />
              </div>
            </div>
          </div>
        )}

        {perubahanData.type === 'PERUBAHAN_WAKTU' && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm text-gray-700">Detail Perubahan Waktu</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Waktu Sebelum</label>
                <Input
                  type="text"
                  value={perubahanData.waktuSebelum}
                  onChange={(e) => setPerubahanData({ ...perubahanData, waktuSebelum: e.target.value })}
                  placeholder="Contoh: Januari - Maret 2024"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Waktu Sesudah</label>
                <Input
                  type="text"
                  value={perubahanData.waktuSesudah}
                  onChange={(e) => setPerubahanData({ ...perubahanData, waktuSesudah: e.target.value })}
                  placeholder="Contoh: April - Juni 2024"
                />
              </div>
            </div>
          </div>
        )}

        {/* Keterangan Tambahan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan Tambahan</label>
          <textarea
            value={perubahanData.keteranganTambahan}
            onChange={(e) => setPerubahanData({ ...perubahanData, keteranganTambahan: e.target.value })}
            className="w-full min-h-[60px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Keterangan tambahan (opsional)"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Menyimpan...' : revisi ? 'Update' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
