import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDPA } from './hooks';
import { CreateDPADto, JenisDokumenDPA } from './types';

const DPAForm: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateDPA();

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState<CreateDPADto>({
    nomorDPA: '',
    jenisDokumen: JenisDokumenDPA.DPA,
    tahun: currentYear,
    tahunAnggaran: currentYear,
    tanggalDokumen: new Date().toISOString().split('T')[0],
    tanggalBerlaku: `${currentYear}-01-01`,
    tanggalSelesai: `${currentYear}-12-31`,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nomorDPA.trim()) {
      newErrors.nomorDPA = 'Nomor DPA wajib diisi';
    }

    if (formData.jenisDokumen === JenisDokumenDPA.DPPA) {
      if (!formData.dpaSebelumnyaId) {
        newErrors.dpaSebelumnyaId = 'DPA sebelumnya wajib dipilih untuk DPPA';
      }
      if (!formData.alasanRevisi?.trim()) {
        newErrors.alasanRevisi = 'Alasan revisi wajib diisi untuk DPPA';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const dpa = await createMutation.mutateAsync(formData);
      alert('DPA berhasil dibuat!');
      navigate(`/dpa/${dpa.id}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Gagal membuat DPA');
    }
  };

  const handleChange = (
    field: keyof CreateDPADto,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Buat DPA Baru</h1>
          <p className="mt-2 text-sm text-gray-600">
            Buat dokumen pelaksanaan anggaran baru
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-6">
            {/* Jenis Dokumen */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Jenis Dokumen *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={JenisDokumenDPA.DPA}
                    checked={formData.jenisDokumen === JenisDokumenDPA.DPA}
                    onChange={(e) =>
                      handleChange(
                        'jenisDokumen',
                        e.target.value as JenisDokumenDPA
                      )
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">DPA</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value={JenisDokumenDPA.DPPA}
                    checked={formData.jenisDokumen === JenisDokumenDPA.DPPA}
                    onChange={(e) =>
                      handleChange(
                        'jenisDokumen',
                        e.target.value as JenisDokumenDPA
                      )
                    }
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    DPPA (Perubahan)
                  </span>
                </label>
              </div>
            </div>

            {/* Nomor DPA */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Nomor DPA *
              </label>
              <input
                type="text"
                value={formData.nomorDPA}
                onChange={(e) => handleChange('nomorDPA', e.target.value)}
                placeholder="DPA-001/BLUD/2026"
                className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                  errors.nomorDPA
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.nomorDPA && (
                <p className="mt-1 text-sm text-red-600">{errors.nomorDPA}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Tahun */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tahun Pembuatan *
                </label>
                <input
                  type="number"
                  value={formData.tahun}
                  onChange={(e) =>
                    handleChange('tahun', parseInt(e.target.value))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tahun Anggaran */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tahun Anggaran *
                </label>
                <input
                  type="number"
                  value={formData.tahunAnggaran}
                  onChange={(e) =>
                    handleChange('tahunAnggaran', parseInt(e.target.value))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {/* Tanggal Dokumen */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tanggal Dokumen
                </label>
                <input
                  type="date"
                  value={formData.tanggalDokumen || ''}
                  onChange={(e) =>
                    handleChange('tanggalDokumen', e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Berlaku */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tanggal Berlaku
                </label>
                <input
                  type="date"
                  value={formData.tanggalBerlaku || ''}
                  onChange={(e) =>
                    handleChange('tanggalBerlaku', e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Selesai */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={formData.tanggalSelesai || ''}
                  onChange={(e) =>
                    handleChange('tanggalSelesai', e.target.value)
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* DPPA Fields */}
            {formData.jenisDokumen === JenisDokumenDPA.DPPA && (
              <>
                {/* DPA Sebelumnya */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    DPA Sebelumnya * (untuk DPPA)
                  </label>
                  <select
                    value={formData.dpaSebelumnyaId || ''}
                    onChange={(e) =>
                      handleChange('dpaSebelumnyaId', e.target.value)
                    }
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.dpaSebelumnyaId
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                  >
                    <option value="">Pilih DPA Sebelumnya</option>
                    {/* TODO: Load from API */}
                  </select>
                  {errors.dpaSebelumnyaId && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dpaSebelumnyaId}
                    </p>
                  )}
                </div>

                {/* Nomor Revisi */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Nomor Revisi
                  </label>
                  <input
                    type="number"
                    value={formData.nomorRevisi || 0}
                    onChange={(e) =>
                      handleChange('nomorRevisi', parseInt(e.target.value))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Alasan Revisi */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Alasan Revisi * (untuk DPPA)
                  </label>
                  <textarea
                    value={formData.alasanRevisi || ''}
                    onChange={(e) => handleChange('alasanRevisi', e.target.value)}
                    rows={3}
                    className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.alasanRevisi
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Jelaskan alasan perubahan DPA..."
                  />
                  {errors.alasanRevisi && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.alasanRevisi}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Info Box */}
            <div className="rounded-md bg-blue-50 p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    DPA akan dibuat dengan status <strong>DRAFT</strong>. Anda
                    masih bisa mengedit data belanja, pendapatan, dan pembiayaan
                    setelah DPA dibuat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/dpa')}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan DPA'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DPAForm;
