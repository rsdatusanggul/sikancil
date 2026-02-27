import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Modal, CurrencyInput, Label, Textarea } from '@/components/ui';
import { kegiatanRBAApi } from './api';
import { programRBAApi } from '../program-rba/api';
import IndikatorKegiatanInput from './components/IndikatorKegiatanInput';
import type { KegiatanRBA, CreateKegiatanRBADto } from './types';
import { formatCurrency } from '@/lib/utils';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

interface KegiatanRBAFormProps {
  kegiatan: KegiatanRBA | null;
  onClose: () => void;
}

export default function KegiatanRBAForm({
  kegiatan,
  onClose,
}: KegiatanRBAFormProps) {
  const queryClient = useQueryClient();
  const { activeFiscalYear } = useFiscalYear();
  const fiscalYear = activeFiscalYear?.tahun || new Date().getFullYear();
  const isEdit = !!kegiatan;

  const [formData, setFormData] = React.useState<CreateKegiatanRBADto>({
    kodeKegiatan: kegiatan?.kodeKegiatan || '',
    namaKegiatan: kegiatan?.namaKegiatan || '',
    programId: kegiatan?.programId || '',
    tahun: fiscalYear,
    deskripsi: kegiatan?.deskripsi || '',
    indikatorKegiatan: kegiatan?.indikatorKegiatan || [],
    paguAnggaran: kegiatan?.paguAnggaran || 0,
    isActive: kegiatan?.isActive ?? true,
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Fetch programs for dropdown - use fiscal year from context
  const { data: programs } = useQuery({
    queryKey: ['program-rba', fiscalYear],
    queryFn: () => programRBAApi.getAll(fiscalYear),
  });

  // Get selected program data
  const selectedProgram = React.useMemo(() => {
    if (!programs || !formData.programId) return null;
    return programs.find(p => p.id === formData.programId);
  }, [programs, formData.programId]);

  // Fetch real-time pagu info from backend
  const { data: paguInfoData, refetch: refetchPaguInfo } = useQuery({
    queryKey: ['program-pagu-info', formData.programId],
    queryFn: () => programRBAApi.getPaguInfo(formData.programId!),
    enabled: !!formData.programId,
    // Refetch on window focus to ensure data is always fresh
    refetchOnWindowFocus: true,
    // Stale time 0 means always refetch
    staleTime: 0,
  });

  // Calculate remaining pagu (adjust for current kegiatan if editing)
  const paguInfo = React.useMemo(() => {
    if (!paguInfoData) return null;

    // If editing, add back the current kegiatan's pagu to sisaPagu
    const currentKegiatanPagu = kegiatan?.paguAnggaran || 0;
    const adjustedSisaPagu = paguInfoData.sisaPagu + (isEdit ? Number(currentKegiatanPagu) : 0);

    return {
      paguProgram: paguInfoData.paguAnggaran,
      totalPaguKegiatan: paguInfoData.paguTerpakai - (isEdit ? Number(currentKegiatanPagu) : 0),
      sisaPagu: adjustedSisaPagu,
      jumlahKegiatanAktif: paguInfoData.jumlahKegiatanAktif,
      persentasePenggunaan: paguInfoData.persentasePenggunaan,
    };
  }, [paguInfoData, kegiatan?.paguAnggaran, isEdit]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateKegiatanRBADto) => {
      console.log('Creating kegiatan RBA with data:', data);
      const result = await kegiatanRBAApi.create(data);
      console.log('Kegiatan RBA created successfully:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Invalidating kegiatan-rba queries...');
      queryClient.invalidateQueries({ queryKey: ['kegiatan-rba'] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan-in-program'] });
      queryClient.invalidateQueries({ queryKey: ['program-pagu-info'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating kegiatan RBA:', error);
      const message = error.response?.data?.message || error.message || 'Gagal menambahkan kegiatan';
      setErrors({ submit: Array.isArray(message) ? message.join(', ') : message });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: CreateKegiatanRBADto) => {
      console.log('Updating kegiatan RBA with data:', data);
      const result = await kegiatanRBAApi.update(kegiatan!.id, data);
      console.log('Kegiatan RBA updated successfully:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Invalidating kegiatan-rba queries...');
      queryClient.invalidateQueries({ queryKey: ['kegiatan-rba'] });
      queryClient.invalidateQueries({ queryKey: ['kegiatan-in-program'] });
      queryClient.invalidateQueries({ queryKey: ['program-pagu-info'] });
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating kegiatan RBA:', error);
      const message = error.response?.data?.message || error.message || 'Gagal mengupdate kegiatan';
      setErrors({ submit: Array.isArray(message) ? message.join(', ') : message });
    },
  });

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.kodeKegiatan.trim()) {
      newErrors.kodeKegiatan = 'Kode kegiatan wajib diisi';
    } else if (formData.kodeKegiatan.length > 20) {
      newErrors.kodeKegiatan = 'Kode kegiatan maksimal 20 karakter';
    }

    if (!formData.namaKegiatan.trim()) {
      newErrors.namaKegiatan = 'Nama kegiatan wajib diisi';
    } else if (formData.namaKegiatan.length > 500) {
      newErrors.namaKegiatan = 'Nama kegiatan maksimal 500 karakter';
    }

    if (!formData.programId) {
      newErrors.programId = 'Program RBA wajib dipilih';
    }

    // Validate pagu anggaran
    if (formData.paguAnggaran && formData.paguAnggaran > 0) {
      if (!paguInfo) {
        newErrors.paguAnggaran = 'Silakan pilih program terlebih dahulu';
      } else if (paguInfo.paguProgram === 0) {
        newErrors.paguAnggaran = 'Program belum memiliki pagu anggaran. Silakan set pagu program terlebih dahulu.';
      } else if (formData.paguAnggaran > paguInfo.sisaPagu) {
        newErrors.paguAnggaran = `Pagu melebihi sisa pagu program (Rp ${paguInfo.sisaPagu.toLocaleString('id-ID')})`;
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

    if (isEdit) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleChange = (field: keyof CreateKegiatanRBADto, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const formFooter = (
    <>
      <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
        Batal
      </Button>
      <Button type="submit" form="kegiatan-form" disabled={isSubmitting}>
        {isSubmitting ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEdit ? 'Edit Kegiatan RBA' : 'Tambah Kegiatan RBA'}
      size="xl"
      footer={formFooter}
    >
      <form id="kegiatan-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Error Alert */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
            {errors.submit}
          </div>
        )}

        {/* Kode Kegiatan */}
        <div className="space-y-2">
          <Label htmlFor="kodeKegiatan">
            Kode Kegiatan <span className="text-red-500">*</span>
          </Label>
          <Input
            id="kodeKegiatan"
            value={formData.kodeKegiatan}
            onChange={(e) => handleChange('kodeKegiatan', e.target.value)}
            placeholder="Contoh: 1.02.01"
            error={errors.kodeKegiatan}
            disabled={isSubmitting}
          />
          {errors.kodeKegiatan && (
            <p className="text-sm text-red-500">{errors.kodeKegiatan}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Format fleksibel (contoh: 1.02.01 atau 01.01)
          </p>
        </div>

        {/* Nama Kegiatan */}
        <div className="space-y-2">
          <Label htmlFor="namaKegiatan">
            Nama Kegiatan <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="namaKegiatan"
            value={formData.namaKegiatan}
            onChange={(e) => handleChange('namaKegiatan', e.target.value)}
            placeholder="Contoh: Penyediaan Jasa Komunikasi, Sumber Daya Air dan Listrik"
            rows={2}
            className={errors.namaKegiatan ? 'border-red-500' : ''}
            disabled={isSubmitting}
          />
          {errors.namaKegiatan && (
            <p className="text-sm text-red-500">{errors.namaKegiatan}</p>
          )}
        </div>

        {/* Program RBA */}
        <div className="space-y-2">
          <Label htmlFor="programId">
            Program RBA <span className="text-red-500">*</span>
          </Label>
          <select
            id="programId"
            value={formData.programId}
            onChange={(e) => handleChange('programId', e.target.value)}
            className={`w-full h-9 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 ${
              errors.programId ? 'border-red-500' : ''
            }`}
            disabled={isSubmitting}
          >
            <option value="">Pilih Program</option>
            {programs?.map((program) => (
              <option key={program.id} value={program.id}>
                [{program.kodeProgram}] {program.namaProgram}
              </option>
            ))}
          </select>
          {errors.programId && <p className="text-sm text-red-500">{errors.programId}</p>}
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

        {/* Deskripsi */}
        <div className="space-y-2">
          <Label htmlFor="deskripsi">
            Deskripsi <span className="text-gray-500 dark:text-gray-400">(Opsional)</span>
          </Label>
          <Textarea
            id="deskripsi"
            value={formData.deskripsi}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            placeholder="Deskripsi detail kegiatan..."
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        {/* Info Pagu Program */}
        {paguInfo && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Informasi Pagu Program</h4>
            <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
              <div className="flex justify-between">
                <span>Total Pagu Program:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(paguInfo.paguProgram)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sudah Dialokasikan:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(paguInfo.totalPaguKegiatan)}
                </span>
              </div>
              <div className="flex justify-between border-t border-blue-300 dark:border-blue-700 pt-1 mt-1">
                <span className="font-semibold">Sisa Pagu:</span>
                <span className="font-bold text-lg">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                  }).format(paguInfo.sisaPagu)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Pagu Anggaran */}
        <div className="space-y-2">
          <Label htmlFor="paguAnggaran">
            Pagu Anggaran Kegiatan
          </Label>
          <CurrencyInput
            id="paguAnggaran"
            value={formData.paguAnggaran || 0}
            onChange={(value) => handleChange('paguAnggaran', value)}
            placeholder={paguInfo ? `Maksimal: ${paguInfo.sisaPagu.toLocaleString('id-ID')}` : "Pilih program terlebih dahulu"}
            disabled={isSubmitting || !formData.programId}
            error={errors.paguAnggaran}
            helperText={paguInfo ? `Sisa pagu program: ${formatCurrency(paguInfo.sisaPagu)}` : undefined}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Format: 100.245.969.427 atau 100.245.969.427,00
          </p>
        </div>

        {/* Indikator Kegiatan */}
        <IndikatorKegiatanInput
          value={formData.indikatorKegiatan || []}
          onChange={(value) => handleChange('indikatorKegiatan', value)}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}