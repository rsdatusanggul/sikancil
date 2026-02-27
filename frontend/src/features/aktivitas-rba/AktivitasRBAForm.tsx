import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Label, Input, Textarea } from '@/components/ui';
import { aktivitasRBAApi } from './api';
import { subKegiatanRBAApi } from '../subkegiatan-rba/api';
import VolumeTargetInput from '../subkegiatan-rba/components/VolumeTargetInput';
import type { AktivitasRBA, CreateAktivitasRBADto } from './types';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

// Helper functions for Rupiah formatting
const formatRupiah = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const parseRupiah = (value: string): number => {
  if (!value) return 0;

  // Remove currency symbols and spaces first
  let cleaned = value.replace(/[Rp\s]/g, '');

  // Detect format based on position of comma and dot
  const lastCommaIndex = cleaned.lastIndexOf(',');
  const lastDotIndex = cleaned.lastIndexOf('.');

  // Indonesian format: 5.590.070.700,00 (dot = thousand, comma = decimal)
  // Check if comma is likely decimal separator (last comma followed by 2 digits at end)
  const isIndonesianFormat = lastCommaIndex > lastDotIndex &&
                             lastCommaIndex === cleaned.length - 3;

  if (isIndonesianFormat) {
    // Indonesian format: remove dots (thousands), replace comma with dot (decimal)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // US/International format: 5,590,070,700.00 (comma = thousand, dot = decimal)
    // Or mixed format - remove commas (thousands), keep dot (decimal)
    cleaned = cleaned.replace(/,/g, '');
  }

  const parsed = Number(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

interface AktivitasRBAFormProps {
  aktivitas: AktivitasRBA | null;
  onClose: () => void;
  defaultSubKegiatanId?: string;
}

export default function AktivitasRBAForm({
  aktivitas,
  onClose,
  defaultSubKegiatanId,
}: AktivitasRBAFormProps) {
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();
  const fiscalYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const isEdit = !!aktivitas;

  const [formData, setFormData] = React.useState<CreateAktivitasRBADto>({
    kodeSubOutput: aktivitas?.kodeSubOutput || '',
    namaSubOutput: aktivitas?.namaSubOutput || '',
    subKegiatanId: aktivitas?.subKegiatanId || defaultSubKegiatanId || '',
    tahun: fiscalYear,
    volumeTarget: aktivitas?.volumeTarget || 0,
    satuan: aktivitas?.satuan || '',
    totalPagu: aktivitas?.totalPagu || 0,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const errorBannerRef = React.useRef<HTMLDivElement>(null);

  // Local state for formatted pagu display
  const [paguDisplay, setPaguDisplay] = React.useState<string>(
    formatRupiah(aktivitas?.totalPagu || 0)
  );

  // Fetch sub kegiatan for dropdown - use fiscal year from context
  const { data: subKegiatanList } = useQuery({
    queryKey: ['subkegiatan-rba', fiscalYear, true],
    queryFn: () => subKegiatanRBAApi.getAll({ tahun: fiscalYear, isActive: true }),
  });

  // Deduplicate sub kegiatan list (safety measure)
  const uniqueSubKegiatanList = React.useMemo(() => {
    if (!subKegiatanList) return [];

    const seen = new Set<string>();
    return subKegiatanList.filter((sk) => {
      if (seen.has(sk.id)) return false;
      seen.add(sk.id);
      return true;
    });
  }, [subKegiatanList]);

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateAktivitasRBADto) => aktivitasRBAApi.create(data),
    onSuccess: async () => {
      alert('✅ Aktivitas berhasil ditambahkan!');

      await queryClient.invalidateQueries({ queryKey: ['aktivitas-rba'] });
      await queryClient.invalidateQueries({ queryKey: ['subkegiatan-rba'] });

      await new Promise(resolve => setTimeout(resolve, 300));

      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal menambahkan aktivitas';
      const errorText = Array.isArray(message) ? message.join(', ') : message;
      setErrors({ submit: errorText });
      alert('❌ ' + errorText);

      setTimeout(() => {
        errorBannerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateAktivitasRBADto) => aktivitasRBAApi.update(aktivitas!.id, data),
    onSuccess: async () => {
      alert('✅ Aktivitas berhasil diupdate!');

      await queryClient.invalidateQueries({ queryKey: ['aktivitas-rba'] });
      await queryClient.invalidateQueries({ queryKey: ['subkegiatan-rba'] });

      await new Promise(resolve => setTimeout(resolve, 300));

      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal mengupdate aktivitas';
      const errorText = Array.isArray(message) ? message.join(', ') : message;
      setErrors({ submit: errorText });
      alert('❌ ' + errorText);

      setTimeout(() => {
        errorBannerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.kodeSubOutput.trim()) newErrors.kodeSubOutput = 'Kode aktivitas wajib diisi';
    if (!formData.namaSubOutput.trim()) newErrors.namaSubOutput = 'Nama aktivitas wajib diisi';
    if (!formData.subKegiatanId) newErrors.subKegiatanId = 'Sub Kegiatan RBA wajib dipilih';
    if (!formData.volumeTarget || formData.volumeTarget < 0)
      newErrors.volumeTarget = 'Volume target wajib diisi dan >= 0';
    if (!formData.satuan.trim()) newErrors.satuan = 'Satuan wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Add fiscal year from context
    const submitData = {
      ...formData,
      tahun: fiscalYear,
    };

    const action = isEdit ? 'mengupdate' : 'menambahkan';
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${action} Aktivitas "${formData.namaSubOutput}"?`
    );

    if (!confirmed) return;

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (field: keyof CreateAktivitasRBADto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePaguChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPaguDisplay(inputValue);

    const parsedValue = parseRupiah(inputValue);
    setFormData((prev) => ({ ...prev, totalPagu: parsedValue }));
  };

  const handlePaguBlur = () => {
    setPaguDisplay(formatRupiah(formData.totalPagu || 0));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const formFooter = (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        Batal
      </Button>
      <Button type="submit" form="aktivitas-form" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Aktivitas' : 'Tambah Aktivitas'}
      size="xl"
      footer={formFooter}
    >
      <form id="aktivitas-form" onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div
            ref={errorBannerRef}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded"
          >
            {errors.submit}
          </div>
        )}

        {/* Kode Aktivitas */}
        <div className="space-y-2">
          <Label htmlFor="kodeSubOutput">
            Kode Aktivitas <span className="text-red-500">*</span>
          </Label>
          <Input
            id="kodeSubOutput"
            value={formData.kodeSubOutput}
            onChange={(e) => handleChange('kodeSubOutput', e.target.value)}
            placeholder="Contoh: 1.02.01.001.01"
            error={errors.kodeSubOutput}
            disabled={isSubmitting}
          />
          {errors.kodeSubOutput && <p className="text-sm text-red-500">{errors.kodeSubOutput}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Format: [kode sub kegiatan].XX (contoh: 1.02.01.001.01)
          </p>
        </div>

        {/* Nama Aktivitas */}
        <div className="space-y-2">
          <Label htmlFor="namaSubOutput">
            Nama Aktivitas <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="namaSubOutput"
            value={formData.namaSubOutput}
            onChange={(e) => handleChange('namaSubOutput', e.target.value)}
            placeholder="Contoh: Pemeriksaan Pasien Rawat Jalan"
            rows={2}
            className={errors.namaSubOutput ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.namaSubOutput && <p className="text-sm text-red-500">{errors.namaSubOutput}</p>}
        </div>

        {/* Sub Kegiatan RBA */}
        <div className="space-y-2">
          <Label htmlFor="subKegiatanId">
            Sub Kegiatan RBA <span className="text-red-500">*</span>
          </Label>
          <select
            id="subKegiatanId"
            value={formData.subKegiatanId}
            onChange={(e) => handleChange('subKegiatanId', e.target.value)}
            className={`w-full h-9 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${
              errors.subKegiatanId ? 'border-red-500' : ''
            }`}
            disabled={isSubmitting}
          >
            <option value="">Pilih Sub Kegiatan</option>
            {uniqueSubKegiatanList.map((subKegiatan) => (
              <option key={subKegiatan.id} value={subKegiatan.id}>
                [{subKegiatan.kodeSubKegiatan}] {subKegiatan.namaSubKegiatan}
              </option>
            ))}
          </select>
          {errors.subKegiatanId && <p className="text-sm text-red-500">{errors.subKegiatanId}</p>}
        </div>

        {/* Tahun - Display only, not editable */}
        <div className="space-y-2">
          <Label htmlFor="tahun">Tahun Anggaran</Label>
          <div className="w-full h-9 px-3 py-2 border border-input rounded-md bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 flex items-center">
            {fiscalYear}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Tahun anggaran diambil dari pengaturan tahun fiskal aktif
          </p>
        </div>

        {/* Volume Target */}
        <VolumeTargetInput
          volume={formData.volumeTarget}
          satuan={formData.satuan}
          onVolumeChange={(val) => handleChange('volumeTarget', val)}
          onSatuanChange={(val) => handleChange('satuan', val)}
          disabled={isSubmitting}
          errors={{ volume: errors.volumeTarget, satuan: errors.satuan }}
        />

        {/* Total Pagu */}
        <div className="space-y-2">
          <Label htmlFor="totalPagu">
            Total Pagu Aktivitas
          </Label>
          <input
            id="totalPagu"
            type="text"
            value={paguDisplay}
            onChange={handlePaguChange}
            onBlur={handlePaguBlur}
            placeholder="Rp 0"
            className={`w-full h-9 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${
              errors.totalPagu ? 'border-red-500' : ''
            }`}
            disabled={isSubmitting}
          />
          {errors.totalPagu && <p className="text-sm text-red-500">{errors.totalPagu}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mendukung copy-paste dari Excel.
          </p>
        </div>
      </form>
    </Modal>
  );
}