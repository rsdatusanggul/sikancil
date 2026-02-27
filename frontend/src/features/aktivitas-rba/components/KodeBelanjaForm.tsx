import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Modal } from '@/components/ui';
import { kodeBelanjaApi } from '../api';
import { AddAccountCodeModal } from '@/features/rak/components/RakForm/AddAccountCodeModal';
import type { ChartOfAccount } from '@/features/chart-of-accounts/types';
import type { KodeBelanja, CreateKodeBelanjaDto } from '../types';

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
  const isIndonesianFormat = lastCommaIndex > lastDotIndex &&
                             lastCommaIndex === cleaned.length - 3;

  if (isIndonesianFormat) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    cleaned = cleaned.replace(/,/g, '');
  }

  const parsed = Number(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

interface KodeBelanjaFormProps {
  kodeBelanja: KodeBelanja | null;
  onClose: () => void;
  subOutputId: string;
  tahun: number;
  existingKodeBelanjaIds?: string[]; // IDs of kode belanja records (for backward compatibility)
  existingKodeRekenings?: string[]; // Kode rekenings already added
}

export default function KodeBelanjaForm({
  kodeBelanja,
  onClose,
  subOutputId,
  tahun,
  existingKodeBelanjaIds = [],
  existingKodeRekenings = [],
}: KodeBelanjaFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!kodeBelanja;

  const [formData, setFormData] = React.useState<CreateKodeBelanjaDto>({
    kodeRekening: kodeBelanja?.kodeRekening || '',
    namaRekening: kodeBelanja?.namaRekening || '',
    subOutputId,
    jenisBelanja: kodeBelanja?.jenisBelanja || 'OPERASIONAL',
    kategori: kodeBelanja?.kategori || '',
    sumberDana: kodeBelanja?.sumberDana || 'APBD',
    pagu: kodeBelanja?.pagu || 0,
    januari: kodeBelanja?.januari || 0,
    februari: kodeBelanja?.februari || 0,
    maret: kodeBelanja?.maret || 0,
    april: kodeBelanja?.april || 0,
    mei: kodeBelanja?.mei || 0,
    juni: kodeBelanja?.juni || 0,
    juli: kodeBelanja?.juli || 0,
    agustus: kodeBelanja?.agustus || 0,
    september: kodeBelanja?.september || 0,
    oktober: kodeBelanja?.oktober || 0,
    november: kodeBelanja?.november || 0,
    desember: kodeBelanja?.desember || 0,
    tahun,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const errorBannerRef = React.useRef<HTMLDivElement>(null);

  // Local state for formatted pagu display
  const [paguDisplay, setPaguDisplay] = React.useState<string>(
    formatRupiah(kodeBelanja?.pagu || 0)
  );

  // State for account code modal
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  // Get existing kode rekening to exclude from selection
  const excludeKodeRekenings = React.useMemo(() => {
    return existingKodeRekenings.filter(kode => kode !== kodeBelanja?.kodeRekening);
  }, [existingKodeRekenings, kodeBelanja?.kodeRekening]);

  const handleAccountSelect = (account: ChartOfAccount) => {
    setFormData(prev => ({
      ...prev,
      kodeRekening: account.kodeRekening,
      namaRekening: account.namaRekening,
    }));
    setIsAccountModalOpen(false);
  };

  // Calculate total from monthly breakdown
  const monthlyTotal = React.useMemo(() => {
    return (
      formData.januari +
      formData.februari +
      formData.maret +
      formData.april +
      formData.mei +
      formData.juni +
      formData.juli +
      formData.agustus +
      formData.september +
      formData.oktober +
      formData.november +
      formData.desember
    );
  }, [formData]);

  // Auto-update pagu when monthly values change
  React.useEffect(() => {
    if (!isEdit) {
      setFormData(prev => ({ ...prev, pagu: monthlyTotal }));
      setPaguDisplay(formatRupiah(monthlyTotal));
    }
  }, [monthlyTotal, isEdit]);

  // Create/Update mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateKodeBelanjaDto) => kodeBelanjaApi.create(data),
    onSuccess: async () => {
      alert('✅ Kode Belanja berhasil ditambahkan!');

      await queryClient.invalidateQueries({ queryKey: ['kode-belanja'] });
      await queryClient.invalidateQueries({ queryKey: ['aktivitas-rba'] });

      await new Promise(resolve => setTimeout(resolve, 300));

      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal menambahkan kode belanja';
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
    mutationFn: (data: CreateKodeBelanjaDto) => kodeBelanjaApi.update(kodeBelanja!.id, data),
    onSuccess: async () => {
      alert('✅ Kode Belanja berhasil diupdate!');

      await queryClient.invalidateQueries({ queryKey: ['kode-belanja'] });
      await queryClient.invalidateQueries({ queryKey: ['aktivitas-rba'] });

      await new Promise(resolve => setTimeout(resolve, 300));

      onClose();
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Gagal mengupdate kode belanja';
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

    if (!formData.kodeRekening.trim()) newErrors.kodeRekening = 'Kode rekening wajib diisi';
    if (!formData.namaRekening.trim()) newErrors.namaRekening = 'Nama rekening wajib diisi';
    if (!formData.kategori) newErrors.kategori = 'Kategori wajib dipilih';
    if (!formData.sumberDana) newErrors.sumberDana = 'Sumber dana wajib dipilih';
    if (!formData.pagu || formData.pagu < 0)
      newErrors.pagu = 'Pagu wajib diisi dan >= 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const action = isEdit ? 'mengupdate' : 'menambahkan';
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin ${action} Kode Belanja "${formData.namaRekening}"?`
    );

    if (!confirmed) return;

    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (field: keyof CreateKodeBelanjaDto, value: any) => {
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
    setFormData((prev) => ({ ...prev, pagu: parsedValue }));
  };

  const handlePaguBlur = () => {
    setPaguDisplay(formatRupiah(formData.pagu || 0));
  };

  const handleMonthlyChange = (month: string, value: string) => {
    const numValue = Number(value) || 0;
    setFormData((prev) => ({ ...prev, [month]: numValue }));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const formFooter = (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        Batal
      </Button>
      <Button type="submit" form="kode-belanja-form" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
      </Button>
    </>
  );

  const months = [
    'januari', 'februari', 'maret', 'april', 'mei', 'juni',
    'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
  ];

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={isEdit ? 'Edit Kode Belanja' : 'Tambah Kode Belanja'}
        size="xl"
        footer={formFooter}
      >
        <form id="kode-belanja-form" onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <div
              ref={errorBannerRef}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded"
            >
              {errors.submit}
            </div>
          )}

          {/* Kode Rekening */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kode Rekening <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.kodeRekening}
                placeholder="Contoh: 5.1.2.01.01"
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.kodeRekening ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting}
                readOnly
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAccountModalOpen(true)}
                disabled={isSubmitting}
              >
                Pilih Kode
              </Button>
            </div>
            {errors.kodeRekening && <p className="text-red-500 text-xs mt-1">{errors.kodeRekening}</p>}
          </div>

          {/* Nama Rekening */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Rekening <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.namaRekening}
              placeholder="Contoh: Belanja Obat-obatan"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                errors.namaRekening ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isSubmitting}
            />
            {errors.namaRekening && <p className="text-red-500 text-xs mt-1">{errors.namaRekening}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Jenis Belanja */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jenis Belanja <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.jenisBelanja}
                onChange={(e) => handleChange('jenisBelanja', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                disabled={isSubmitting}
              >
                <option value="OPERASIONAL">Operasional</option>
                <option value="MODAL">Modal</option>
              </select>
            </div>

            {/* Sumber Dana */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Sumber Dana <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.sumberDana}
                onChange={(e) => handleChange('sumberDana', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                  errors.sumberDana ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                disabled={isSubmitting}
              >
                <option value="APBD">APBD</option>
                <option value="PNBP_FUNGSIONAL">PNBP Fungsional</option>
                <option value="HIBAH">Hibah</option>
                <option value="PINJAMAN">Pinjaman</option>
                <option value="LAIN_LAIN">Lain-lain</option>
              </select>
              {errors.sumberDana && <p className="text-red-500 text-xs mt-1">{errors.sumberDana}</p>}
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.kategori}
              onChange={(e) => handleChange('kategori', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                errors.kategori ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Pilih Kategori</option>
              <option value="PEGAWAI">Pegawai</option>
              <option value="BARANG_JASA">Barang & Jasa</option>
              <option value="MODAL">Modal</option>
            </select>
            {errors.kategori && <p className="text-red-500 text-xs mt-1">{errors.kategori}</p>}
          </div>

          {/* Total Pagu */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Total Pagu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={paguDisplay}
              onChange={handlePaguChange}
              onBlur={handlePaguBlur}
              placeholder="Rp 0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
                errors.pagu ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isSubmitting}
            />
            {errors.pagu && <p className="text-red-500 text-xs mt-1">{errors.pagu}</p>}
            {!isEdit && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total dari rincian bulanan: {formatRupiah(monthlyTotal)}
              </p>
            )}
          </div>

          {/* Rincian Bulanan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rincian Bulanan
            </label>
            <div className="grid grid-cols-3 gap-2">
              {months.map((month) => (
                <div key={month}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 capitalize">
                    {month}
                  </label>
                  <input
                    type="number"
                    value={formData[month as keyof CreateKodeBelanjaDto] as number || ''}
                    onChange={(e) => handleMonthlyChange(month, e.target.value)}
                    placeholder="0"
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                    disabled={isSubmitting}
                  />
                </div>
              ))}
            </div>
          </div>
        </form>
      </Modal>

      {/* Account Code Selection Modal */}
      <AddAccountCodeModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onSelect={handleAccountSelect}
        excludeKodeRekenings={excludeKodeRekenings}
      />
    </>
  );
}