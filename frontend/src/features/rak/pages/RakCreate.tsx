import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SimpleSelect } from '@/components/ui/SimpleSelect';
import { useCreateRak } from '../hooks/useRakMutation';
import { subKegiatanRBAApi } from '@/features/subkegiatan-rba/api';
import type { SubKegiatanRBA } from '@/features/subkegiatan-rba/types';
import type { ChartOfAccount } from '@/features/chart-of-accounts/types';
import type { RakMatrixData } from '../types/rak.types';
import { RakMatrixInput } from '../components/RakMatrix/RakMatrixInput';
import { AddAccountCodeModal } from '../components/RakForm/AddAccountCodeModal';
import { formatCurrency } from '../utils/rakFormatters';
import { ArrowLeft, Save, AlertCircle, Plus, Trash2, Info } from 'lucide-react';
import { useFiscalYear } from '@/contexts/FiscalYearContext';

export function RakCreate() {
  const navigate = useNavigate();
  const createRak = useCreateRak();
  const { activeFiscalYear } = useFiscalYear();
  const tahunAnggaran = activeFiscalYear?.tahun || new Date().getFullYear();

  const [subkegiatanId, setSubkegiatanId] = useState<string>('');
  const [selectedSubkegiatan, setSelectedSubkegiatan] = useState<SubKegiatanRBA | null>(null);
  const [subkegiatanList, setSubkegiatanList] = useState<SubKegiatanRBA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Matrix data for RAK details
  const [rakDetails, setRakDetails] = useState<RakMatrixData[]>([]);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);

  // Fetch Subkegiatan list filtered by year
  useEffect(() => {
    const fetchSubkegiatan = async () => {
      setIsLoading(true);
      try {
        const data = await subKegiatanRBAApi.getAll({
          tahun: tahunAnggaran,
          isActive: true, // Only fetch active sub-activities
          limit: 1000, // Get all for dropdown
        });
        setSubkegiatanList(data);
      } catch (error) {
        console.error('Error fetching subkegiatan:', error);
        setSubkegiatanList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubkegiatan();
  }, [tahunAnggaran]);

  // Update selectedSubkegiatan when subkegiatanId changes
  useEffect(() => {
    if (subkegiatanId) {
      const selected = subkegiatanList.find((s) => s.id === subkegiatanId);
      setSelectedSubkegiatan(selected || null);
    } else {
      setSelectedSubkegiatan(null);
    }
  }, [subkegiatanId, subkegiatanList]);

  // Calculate totals
  const totalPagu = selectedSubkegiatan?.totalPagu || 0;
  const totalRencana = useMemo(() => {
    return rakDetails.reduce((sum, row) => {
      const monthlyTotal = Object.values(row.monthly).reduce((s, v) => s + (v || 0), 0);
      return sum + monthlyTotal;
    }, 0);
  }, [rakDetails]);

  const isTotalMatch = Math.abs(totalRencana - totalPagu) < 1; // Allow 1 rupiah difference due to rounding

  // Handle adding account code
  const handleAddAccount = (account: ChartOfAccount) => {
    const newRow: RakMatrixData = {
      kode_rekening_id: account.id,
      kode: account.kodeRekening,
      uraian: account.namaRekening,
      jumlah_anggaran: 0,
      monthly: {
        januari: 0,
        februari: 0,
        maret: 0,
        april: 0,
        mei: 0,
        juni: 0,
        juli: 0,
        agustus: 0,
        september: 0,
        oktober: 0,
        november: 0,
        desember: 0,
      },
      semester_1: 0,
      semester_2: 0,
      triwulan_1: 0,
      triwulan_2: 0,
      triwulan_3: 0,
      triwulan_4: 0,
    };

    setRakDetails([...rakDetails, newRow]);
  };

  // Handle removing account code
  const handleRemoveAccount = (kodeRekeningId: string) => {
    setRakDetails(rakDetails.filter((row) => row.kode_rekening_id !== kodeRekeningId));
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (tahunAnggaran < 2020) {
      newErrors.tahunAnggaran = 'Tahun anggaran minimal 2020';
    }

    if (!subkegiatanId) {
      newErrors.subkegiatanId = 'Subkegiatan wajib dipilih';
    }

    if (rakDetails.length === 0) {
      newErrors.details = 'Tambahkan minimal 1 kode rekening';
    }

    if (rakDetails.length > 0 && !isTotalMatch) {
      newErrors.total = `Total rencana (${formatCurrency(totalRencana)}) harus sama dengan total pagu (${formatCurrency(totalPagu)})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await createRak.mutateAsync({
        subkegiatan_id: subkegiatanId,
        tahun_anggaran: tahunAnggaran,
        details: rakDetails.map((row) => ({
          kode_rekening_id: row.kode_rekening_id,
          jumlah_anggaran: row.jumlah_anggaran,
          januari: row.monthly.januari,
          februari: row.monthly.februari,
          maret: row.monthly.maret,
          april: row.monthly.april,
          mei: row.monthly.mei,
          juni: row.monthly.juni,
          juli: row.monthly.juli,
          agustus: row.monthly.agustus,
          september: row.monthly.september,
          oktober: row.monthly.oktober,
          november: row.monthly.november,
          desember: row.monthly.desember,
        })),
      });
      // Navigation handled by mutation hook
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal membuat RAK';

      // Handle specific error codes
      if (error.response?.status === 409) {
        setErrors({
          subkegiatanId: 'RAK untuk subkegiatan dan tahun ini sudah ada',
        });
      } else {
        setErrors({
          submit: message,
        });
      }
    }
  };

  // Prepare Subkegiatan options for dropdown
  const subkegiatanOptions = subkegiatanList.map((sub) => ({
    value: sub.id,
    label: `${sub.kodeSubKegiatan} - ${sub.namaSubKegiatan}`,
  }));

  // Get IDs of already-added accounts
  const excludeAccountIds = rakDetails.map((row) => row.kode_rekening_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/rak')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Buat RAK Baru</h1>
          <p className="text-muted-foreground mt-1">
            Buat Rencana Anggaran Kas dengan detail distribusi bulanan
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Cara Menggunakan Form</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Pilih tahun anggaran dan subkegiatan</li>
              <li>Tambahkan kode rekening yang akan digunakan</li>
              <li>Input distribusi bulanan untuk setiap kode rekening</li>
              <li>Pastikan total rencana sama dengan total pagu</li>
              <li>RAK akan dibuat dengan status <strong>DRAFT</strong></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Informasi Dasar */}
        <div className="bg-white dark:bg-gray-800 rounded-md border p-6">
          <h2 className="text-lg font-semibold mb-4">1. Informasi Dasar</h2>
          <div className="space-y-6">
            {/* Tahun Anggaran (Read-only from Header) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tahun Anggaran <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={tahunAnggaran}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tahun anggaran diambil dari pengaturan di pojok kanan atas
              </p>
            </div>

            {/* Subkegiatan */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Subkegiatan <span className="text-red-500">*</span>
              </label>
              <SimpleSelect
                value={subkegiatanId}
                onValueChange={(value) => {
                  setSubkegiatanId(value);
                  setRakDetails([]); // Clear details when changing subkegiatan
                  // Clear error
                  if (errors.subkegiatanId) {
                    const newErrors = { ...errors };
                    delete newErrors.subkegiatanId;
                    setErrors(newErrors);
                  }
                }}
                options={subkegiatanOptions}
                placeholder={
                  isLoading
                    ? 'Memuat data...'
                    : subkegiatanOptions.length === 0
                      ? 'Tidak ada subkegiatan untuk tahun ini'
                      : 'Pilih Subkegiatan'
                }
                disabled={isLoading || subkegiatanOptions.length === 0}
                className={errors.subkegiatanId ? 'border-red-500' : ''}
              />
              {errors.subkegiatanId && (
                <p className="text-red-500 text-sm mt-1">{errors.subkegiatanId}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Menampilkan subkegiatan untuk tahun {tahunAnggaran}
              </p>
            </div>

            {/* Total Pagu (Read-only) */}
            {selectedSubkegiatan && (
              <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4">
                <label className="block text-sm font-medium mb-2">Total Pagu</label>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalPagu)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Total rencana distribusi bulanan harus sama dengan total pagu ini
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Rincian Anggaran per Kode Rekening */}
        {selectedSubkegiatan && (
          <div className="bg-white dark:bg-gray-800 rounded-md border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">2. Rincian Anggaran per Kode Rekening</h2>
              <Button
                type="button"
                onClick={() => setShowAddAccountModal(true)}
                size="sm"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kode Rekening
              </Button>
            </div>

            {rakDetails.length === 0 ? (
              <div className="border-2 border-dashed rounded-md p-8 text-center">
                <Info className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">
                  Belum ada kode rekening. Klik tombol "Tambah Kode Rekening" di atas untuk memulai.
                </p>
                {errors.details && (
                  <p className="text-red-500 text-sm mt-3">{errors.details}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Action Buttons for Rows */}
                {rakDetails.length > 0 && (
                  <div className="bg-muted/50 rounded-md p-3 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {rakDetails.length} kode rekening ditambahkan
                    </p>
                    <div className="flex gap-2">
                      {rakDetails.map((row) => (
                        <Button
                          key={row.kode_rekening_id}
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAccount(row.kode_rekening_id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus {row.kode}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matrix Input */}
                <RakMatrixInput
                  data={rakDetails}
                  onChange={setRakDetails}
                  readonly={false}
                />

                {errors.details && (
                  <p className="text-red-500 text-sm">{errors.details}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Section 3: Validasi Total */}
        {selectedSubkegiatan && rakDetails.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-md border p-6">
            <h2 className="text-lg font-semibold mb-4">3. Validasi Total</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Pagu</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalPagu)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 rounded-md p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Rencana</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalRencana)}
                </p>
              </div>
              <div
                className={`rounded-md p-4 ${
                  isTotalMatch
                    ? 'bg-green-50 dark:bg-green-950'
                    : 'bg-red-50 dark:bg-red-950'
                }`}
              >
                <p className="text-sm text-muted-foreground mb-1">Status</p>
                <p
                  className={`text-2xl font-bold ${
                    isTotalMatch
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isTotalMatch ? '✓ Match' : '✗ Tidak Sesuai'}
                </p>
              </div>
            </div>
            {errors.total && <p className="text-red-500 text-sm mt-3">{errors.total}</p>}
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4">
            <p className="text-red-600 dark:text-red-400">{errors.submit}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 sticky bottom-0 bg-white dark:bg-gray-900 p-4 border-t shadow-lg">
          <Button type="submit" disabled={createRak.isPending || isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {createRak.isPending ? 'Membuat RAK...' : 'Simpan RAK'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/rak')}
            disabled={createRak.isPending}
          >
            Batal
          </Button>
        </div>
      </form>

      {/* Add Account Modal */}
      <AddAccountCodeModal
        isOpen={showAddAccountModal}
        onClose={() => setShowAddAccountModal(false)}
        onSelect={handleAddAccount}
        excludeIds={excludeAccountIds}
      />
    </div>
  );
}
