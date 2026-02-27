import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDPA, useDPASummary } from './hooks';
import DPAStatusBadge from './components/DPAStatusBadge';
import DPARealisasiCard from './components/DPARealisasiCard';
import DPAWorkflowActions from './components/DPAWorkflowActions';
import { formatCurrency } from './utils';
import { format } from 'date-fns';

const DPADetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<string>('ringkasan');

  const { data: dpa, isLoading, error, refetch } = useDPA(id!);
  const { data: summary } = useDPASummary(id!);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !dpa) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="mt-4 text-red-600">Gagal memuat data DPA</p>
          <button
            onClick={() => refetch()}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Coba lagi
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'ringkasan', label: 'Ringkasan' },
    { id: 'belanja', label: 'Belanja' },
    { id: 'pendapatan', label: 'Pendapatan' },
    { id: 'pembiayaan', label: 'Pembiayaan' },
    { id: 'history', label: 'Riwayat' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-4 flex text-sm text-gray-500">
          <a href="/dpa" className="hover:text-gray-700">
            DPA/DPPA
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{dpa.nomorDPA}</span>
        </nav>

        {/* Header Card */}
        <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {dpa.nomorDPA}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {dpa.jenisDokumen} Tahun Anggaran {dpa.tahunAnggaran}
                </p>
              </div>
              <DPAStatusBadge status={dpa.status} size="lg" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">Tanggal Dokumen</p>
                <p className="mt-1 font-medium text-gray-900">
                  {dpa.tanggalDokumen
                    ? format(new Date(dpa.tanggalDokumen), 'dd/MM/yyyy')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Berlaku</p>
                <p className="mt-1 font-medium text-gray-900">
                  {dpa.tanggalBerlaku
                    ? format(new Date(dpa.tanggalBerlaku), 'dd/MM/yyyy')
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tanggal Selesai</p>
                <p className="mt-1 font-medium text-gray-900">
                  {dpa.tanggalSelesai
                    ? format(new Date(dpa.tanggalSelesai), 'dd/MM/yyyy')
                    : '-'}
                </p>
              </div>
              {dpa.nomorSK && (
                <div>
                  <p className="text-sm text-gray-500">Nomor SK</p>
                  <p className="mt-1 font-medium text-gray-900">{dpa.nomorSK}</p>
                </div>
              )}
            </div>

            {dpa.alasanRevisi && (
              <div className="mt-4 rounded-md bg-yellow-50 p-4">
                <p className="text-sm font-medium text-yellow-800">
                  Alasan Revisi:
                </p>
                <p className="mt-1 text-sm text-yellow-700">{dpa.alasanRevisi}</p>
              </div>
            )}

            {dpa.catatanPersetujuan && (
              <div className="mt-4 rounded-md bg-green-50 p-4">
                <p className="text-sm font-medium text-green-800">
                  Catatan Persetujuan:
                </p>
                <p className="mt-1 text-sm text-green-700">
                  {dpa.catatanPersetujuan}
                </p>
              </div>
            )}

            <div className="mt-6">
              <DPAWorkflowActions dpa={dpa} onSuccess={() => refetch()} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="rounded-lg bg-white p-6 shadow">
          {activeTab === 'ringkasan' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Ringkasan Anggaran
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <DPARealisasiCard
                  title="Belanja"
                  pagu={dpa.totalPaguBelanja}
                  realisasi={dpa.totalRealisasiBelanja}
                  color="blue"
                />
                <DPARealisasiCard
                  title="Pendapatan"
                  pagu={dpa.totalPaguPendapatan}
                  realisasi={dpa.totalRealisasiPendapatan}
                  color="green"
                />
                <DPARealisasiCard
                  title="Pembiayaan"
                  pagu={dpa.totalPaguPembiayaan}
                  realisasi={dpa.totalRealisasiPembiayaan}
                  color="purple"
                />
              </div>

              {summary && (
                <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                      Detail Belanja
                    </h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Pagu</dt>
                        <dd className="font-medium text-gray-900">
                          {formatCurrency(summary.totalBelanja.pagu)}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Realisasi</dt>
                        <dd className="font-medium text-gray-900">
                          {formatCurrency(summary.totalBelanja.realisasi)}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Komitmen</dt>
                        <dd className="font-medium text-gray-900">
                          {formatCurrency(summary.totalBelanja.komitmen)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-sm">
                        <dt className="font-medium text-gray-700">Sisa</dt>
                        <dd
                          className={`font-semibold ${
                            summary.totalBelanja.sisa >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(summary.totalBelanja.sisa)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-lg border border-gray-200 p-4">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                      Detail Pendapatan
                    </h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Pagu</dt>
                        <dd className="font-medium text-gray-900">
                          {formatCurrency(summary.totalPendapatan.pagu)}
                        </dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt className="text-gray-600">Realisasi</dt>
                        <dd className="font-medium text-gray-900">
                          {formatCurrency(summary.totalPendapatan.realisasi)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-t pt-2 text-sm">
                        <dt className="font-medium text-gray-700">Sisa</dt>
                        <dd
                          className={`font-semibold ${
                            summary.totalPendapatan.sisa >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {formatCurrency(summary.totalPendapatan.sisa)}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'belanja' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Rincian Belanja
              </h2>
              {dpa.belanja && dpa.belanja.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Kode Rekening
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Uraian
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Pagu
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Realisasi
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Sisa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {dpa.belanja.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                            {item.kodeRekening}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.namaRekening}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.pagu)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.realisasi)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.sisa)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Belum ada data rincian belanja
                </p>
              )}
            </div>
          )}

          {activeTab === 'pendapatan' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Rincian Pendapatan
              </h2>
              {dpa.pendapatan && dpa.pendapatan.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Kode Rekening
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Uraian
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Pagu
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Realisasi
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Sisa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {dpa.pendapatan.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                            {item.kodeRekening}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.namaRekening}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.pagu)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.realisasi)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.sisa)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Belum ada data rincian pendapatan
                </p>
              )}
            </div>
          )}

          {activeTab === 'pembiayaan' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Rincian Pembiayaan
              </h2>
              {dpa.pembiayaan && dpa.pembiayaan.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Kode Rekening
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                          Uraian
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                          Jenis
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Pagu
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                          Realisasi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {dpa.pembiayaan.map((item) => (
                        <tr key={item.id}>
                          <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                            {item.kodeRekening}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.namaRekening}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-center text-sm">
                            <span
                              className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                item.jenisPembiayaan === 'PENERIMAAN'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {item.jenisPembiayaan}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.pagu)}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900">
                            {formatCurrency(item.realisasi)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  Belum ada data rincian pembiayaan
                </p>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Riwayat Perubahan
              </h2>
              <p className="text-center text-gray-500">
                Fitur riwayat akan segera hadir
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DPADetail;
