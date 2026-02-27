import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, Label, Textarea } from '@/components/ui';
import { subKegiatanRBAApi } from './api';
import { kegiatanRBAApi } from '../kegiatan-rba/api';
import VolumeTargetInput from './components/VolumeTargetInput';
import TimelineInput from './components/TimelineInput';
import type { SubKegiatanRBA, CreateSubKegiatanRBADto } from './types';
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

interface SubKegiatanRBAFormProps {
  subKegiatan: SubKegiatanRBA | null;
  onClose: () => void;
  defaultKegiatanId?: string;
}

export default function SubKegiatanRBAForm({
  subKegiatan,
  onClose,
  defaultKegiatanId,
}: SubKegiatanRBAFormProps) {
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();
  const fiscalYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const isEdit = !!subKegiatan;

  const [formData, setFormData] = React.useState<CreateSubKegiatanRBADto>({
    kodeSubKegiatan: subKegiatan?.kodeSubKegiatan || '',
    namaSubKegiatan: subKegiatan?.namaSubKegiatan || '',
    kegiatanId: subKegiatan?.kegiatanId || defaultKegiatanId || '',
    tahun: fiscalYear,
    volumeTarget: subKegiatan?.volumeTarget || 0,
    satuan: subKegiatan?.satuan || '',
    lokasi: subKegiatan?.lokasi || '',
    bulanMulai: subKegiatan?.bulanMulai,
    bulanSelesai: subKegiatan?.bulanSelesai,
    unitKerjaId: subKegiatan?.unitKerjaId,
    totalPagu: subKegiatan?.totalPagu || 0,
    deskripsi: subKegiatan?.deskripsi || '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const errorBannerRef = React.useRef<HTMLDivElement>(null);

  // Local state for formatted pagu display
  const [paguDisplay, setPaguDisplay] = React.useState<string>(
    formatRupiah(subKegiatan?.totalPagu || 0)
  );

  // Fetch kegiatan for dropdown - use fiscal year from context
  const { data: kegiatanList } = useQuery({
    queryKey: ['kegiatan-rba', fiscalYear, true],
    queryFn: () => kegiatanRBAApi.getAll({ tahun: fiscalYear, isActive: true }),
  });

  // Fetch real-time pagu info from selected Kegiatan
  const { data: paguInfoData } = useQuery({
    queryKey: ['kegiatan-pagu-info', formData.kegiatanId],
    queryFn: () => kegiatanRBAApi.getPaguInfo(formData.kegiatanId!),
    enabled: !!formData.kegiatanId,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Deduplicate kegiatan list (safety measure)
  const uniqueKegiatanList = React.useMemo(() => {
    if (!kegiatanList?.data) return [];

    const seen = new Set<string>();
    return kegiatanList.data.filter((kegiatan) => {
      if (seen.has(kegiatan.id)) return false;
      seen.add(kegiatan.id);
      return true;
    });
  }, [kegiatanList]);

  // Calculate adjusted pagu info (exclude current subkegiatan if editing)
  const paguInfo = React.useMemo(() => {
    if (!paguInfoData) return null;

    // If editing, add back current subkegiatan's pagu to sisaPagu
    const currentSubKegiatanPagu = subKegiatan?.totalPagu || 0;
    const adjustedSisaPagu = paguInfoData.sisaPagu + (isEdit ? Number(currentSubKegiatanPagu) : 0);

    return {
      paguKegiatan: paguInfoData.paguAnggaran,
      totalPaguSubKegiatan: paguInfoData.paguTerpakai - (isEdit ? Number(currentSubKegiatanPagu) : 0),
      sisaPagu: adjustedSisaPagu,
      jumlahSubKegiatanAktif: paguInfoData.jumlahSubKegiatanAktif,
      persentasePenggunaan: paguInfoData.persentasePenggunaan,
    };
  }, [paguInfoData, subKegiatan?.totalPagu, isEdit]);

  // Remove auto-populate - user wants manual input with info display

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateSubKegiatanRBADto) => subKegiatanRBAApi.create(data),
    onSuccess: async () => {
      // Show success alert immediately
      alert('✅ Sub Kegiatan berhasil ditambahkan!');

      // Invalidate all related queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['subkegiatan-rba'] });
      await queryClient.invalidateQueries({ queryKey: ['kegiatan-pagu-info'] });
      await queryClient.invalidateQueries({ queryKey: ['kegiatan-rba'] });

      // Small delay to ensure queries refetch before closing
      await new Promise(resolve => setTimeout(resolve, 300));

      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal menambahkan sub kegiatan';
      const errorText = Array.isArray(message) ? message.join(', ') : message;
      setErrors({ submit: errorText });
      // Show alert so user immediately sees the error
      alert('❌ ' + errorText);

      // Scroll error banner into view after alert is dismissed
      setTimeout(() => {
        errorBannerRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateSubKegiatanRBADto) => subKegiatanRBAApi.update(subKegiatan!.id, data),
    onSuccess: async () => {
      // Show success alert immediately
      alert('✅ Sub Kegiatan berhasil diupdate!');

      // Invalidate all related queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['subkegiatan-rba'] });
      await queryClient.invalidateQueries({ queryKey: ['kegiatan-pagu-info'] });
      await queryClient.invalidateQueries({ queryKey: ['kegiatan-rba'] });

      // Small delay to ensure queries refetch before closing
      await new Promise(resolve => setTimeout(resolve, 300));

      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal mengupdate sub kegiatan';
      const errorText = Array.isArray(message) ? message.join(', ') : message;
      setErrors({ submit: errorText });
      // Show alert so user immediately sees the error
      alert('❌ ' + errorText);

      // Scroll error banner into view after alert is dismissed
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

    if (!formData.kodeSubKegiatan.trim()) newErrors.kodeSubKegiatan = 'Kode sub kegiatan wajib diisi';
    if (!formData.namaSubKegiatan.trim()) newErrors.namaSubKegiatan = 'Nama sub kegiatan wajib diisi';
    if (!formData.kegiatanId) newErrors.kegiatanId = 'Kegiatan RBA wajib dipilih';
    if (!formData.volumeTarget || formData.volumeTarget < 0)
      newErrors.volumeTarget = 'Volume target wajib diisi dan >= 0';
    if (!formData.satuan.trim()) newErrors.satuan = 'Satuan wajib diisi';

    // Timeline validation
    if (
      formData.bulanMulai &&
      formData.bulanSelesai &&
      formData.bulanSelesai < formData.bulanMulai
    ) {
      newErrors.bulanSelesai = 'Bulan selesai harus >= bulan mulai';
    }

    // Pagu validation
    if (formData.totalPagu && formData.totalPagu > 0) {
      if (!paguInfo) {
        newErrors.totalPagu = 'Silakan pilih kegiatan terlebih dahulu';
      } else if (paguInfo.paguKegiatan === 0) {
        newErrors.totalPagu = 'Kegiatan belum memiliki pagu anggaran. Silakan set pagu kegiatan terlebih dahulu.';
      } else if (formData.totalPagu > paguInfo.sisaPagu) {
        newErrors.totalPagu = `Pagu melebihi sisa pagu kegiatan (${formatRupiah(paguInfo.sisaPagu)})`;
      }
    }

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

    // Confirmation dialog
    const action = isEdit ? 'mengupdate' : 'menambahkan';
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${action} Sub Kegiatan "${formData.namaSubKegiatan}"?`
    );

    if (!confirmed) return;

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (field: keyof CreateSubKegiatanRBADto, value: any) => {
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

    // Parse and update formData
    const parsedValue = parseRupiah(inputValue);
    setFormData((prev) => ({ ...prev, totalPagu: parsedValue }));
  };

  const handlePaguBlur = () => {
    // Reformat display value on blur
    setPaguDisplay(formatRupiah(formData.totalPagu || 0));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const formFooter = (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        Batal
      </Button>
      <Button type="submit" form="subkegiatan-form" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Sub Kegiatan RBA' : 'Tambah Sub Kegiatan RBA'}
      size="xl"
      footer={formFooter}
    >
      <form id="subkegiatan-form" onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div
            ref={errorBannerRef}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded"
          >
            {errors.submit}
          </div>
        )}

        {/* Kode Sub Kegiatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kode Sub Kegiatan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.kodeSubKegiatan}
            onChange={(e) => handleChange('kodeSubKegiatan', e.target.value)}
            placeholder="Contoh: 1.02.01.001"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.kodeSubKegiatan ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          {errors.kodeSubKegiatan && <p className="text-red-500 text-xs mt-1">{errors.kodeSubKegiatan}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Format: [kode kegiatan].XXX (contoh: 1.02.01.001)
          </p>
        </div>

        {/* Nama Sub Kegiatan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nama Sub Kegiatan <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.namaSubKegiatan}
            onChange={(e) => handleChange('namaSubKegiatan', e.target.value)}
            placeholder="Contoh: Pelayanan Rawat Jalan"
            rows={2}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.namaSubKegiatan ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          />
          {errors.namaSubKegiatan && <p className="text-red-500 text-xs mt-1">{errors.namaSubKegiatan}</p>}
        </div>

        {/* Kegiatan RBA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Kegiatan RBA <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.kegiatanId}
            onChange={(e) => handleChange('kegiatanId', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.kegiatanId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting}
          >
            <option value="">Pilih Kegiatan</option>
            {uniqueKegiatanList.map((kegiatan) => (
              <option key={kegiatan.id} value={kegiatan.id}>
                [{kegiatan.kodeKegiatan}] {kegiatan.namaKegiatan}
              </option>
            ))}
          </select>
          {errors.kegiatanId && <p className="text-red-500 text-xs mt-1">{errors.kegiatanId}</p>}
        </div>

        {/* Tahun - Display only, not editable */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tahun Anggaran
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
            {fiscalYear}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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

        {/* Timeline */}
        <TimelineInput
          startMonth={formData.bulanMulai}
          endMonth={formData.bulanSelesai}
          onStartChange={(val) => handleChange('bulanMulai', val)}
          onEndChange={(val) => handleChange('bulanSelesai', val)}
          disabled={isSubmitting}
          errors={{ end: errors.bulanSelesai }}
        />

        {/* Lokasi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Lokasi <span className="text-gray-500 dark:text-gray-400">(Opsional)</span>
          </label>
          <input
            type="text"
            value={formData.lokasi}
            onChange={(e) => handleChange('lokasi', e.target.value)}
            placeholder="Contoh: Poli Umum, Gedung A Lt. 1"
            maxLength={255}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isSubmitting}
          />
        </div>

        {/* Info Pagu Kegiatan */}
        {paguInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Informasi Pagu Kegiatan</h4>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex justify-between">
                <span>Total Pagu Kegiatan:</span>
                <span className="font-medium">
                  {formatRupiah(paguInfo.paguKegiatan)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sudah Dialokasikan:</span>
                <span className="font-medium">
                  {formatRupiah(paguInfo.totalPaguSubKegiatan)}
                </span>
              </div>
              <div className="flex justify-between border-t border-blue-300 dark:border-blue-700 pt-1 mt-1">
                <span className="font-semibold">Sisa Pagu:</span>
                <span className="font-bold text-lg">
                  {formatRupiah(paguInfo.sisaPagu)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Total Pagu */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Total Pagu Sub Kegiatan
          </label>
          <input
            type="text"
            value={paguDisplay}
            onChange={handlePaguChange}
            onBlur={handlePaguBlur}
            placeholder={paguInfo ? `Maksimal: ${formatRupiah(paguInfo.sisaPagu)}` : "Rp 0"}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.totalPagu ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={isSubmitting || !formData.kegiatanId}
          />
          {errors.totalPagu && <p className="text-red-500 text-xs mt-1">{errors.totalPagu}</p>}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {paguInfo
              ? `Sisa pagu kegiatan: ${formatRupiah(paguInfo.sisaPagu)}. Mendukung copy-paste dari Excel.`
              : 'Pilih kegiatan terlebih dahulu untuk melihat sisa pagu.'}
          </p>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Deskripsi <span className="text-gray-500 dark:text-gray-400">(Opsional)</span>
          </label>
          <textarea
            value={formData.deskripsi}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            placeholder="Deskripsi detail sub kegiatan..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Modal>
  );
}