import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { BuktiBayar, BuktiBayarStatus } from './types';
import { format } from 'date-fns';

const BuktiBayarDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: bb, isLoading, error, refetch } = useQuery({
    queryKey: ['bukti-bayar', id],
    queryFn: () =>
      apiClient.get(`/payment-vouchers/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  const finalizeMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/payment-vouchers/${id}/finalize`).then((res) => res.data),
    onSuccess: () => refetch(),
  });

  const printMutation = useMutation({
    mutationFn: () =>
      apiClient.get(`/payment-vouchers/${id}/print`, { responseType: 'blob' }),
    onSuccess: (response) => {
      const blob = response as any;
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `BP_${bb?.voucherNumber.replace(/\//g, '-')}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    },
  });

  const handlePrint = () => {
    printMutation.mutate();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: BuktiBayarStatus) => {
    const statusConfig = {
      DRAFT: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      FINAL: { bg: 'bg-green-100', text: 'text-green-800', label: 'Final' },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;
    return (
      <span className={`inline-flex rounded-md px-3 py-1 text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !bb) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-red-400"
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
          <p className="mt-4 text-sm text-red-600">
            Gagal memuat data Bukti Bayar
          </p>
          <button
            onClick={() => navigate('/bukti-bayar')}
            className="mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Kembali ke Daftar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/bukti-bayar')}
            className="mb-4 flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Kembali ke Daftar Bukti Bayar
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {bb.voucherNumber}
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Tanggal: {format(new Date(bb.voucherDate), 'dd MMMM yyyy')}
              </p>
            </div>
            {getStatusBadge(bb.status)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informasi Program-Kegiatan */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Informasi Program-Kegiatan
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="w-32 font-medium text-gray-700">Program:</span>
                  <span className="text-gray-900">
                    {bb.programCode} - {bb.programName || '-'}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-32 font-medium text-gray-700">Kegiatan:</span>
                  <span className="text-gray-900">
                    {bb.kegiatanCode} - {bb.kegiatanName || '-'}
                  </span>
                </div>
                {bb.subKegiatanCode && (
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-700">Sub Kegiatan:</span>
                    <span className="text-gray-900">
                      {bb.subKegiatanCode} - {bb.subKegiatanName || '-'}
                    </span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-32 font-medium text-gray-700">Kode Rekening:</span>
                  <span className="text-gray-900">
                    <div>{bb.accountCode}</div>
                    <div className="text-gray-600">{bb.accountName}</div>
                  </span>
                </div>
              </div>
            </div>

            {/* Informasi Pembayaran */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Informasi Pembayaran
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex">
                  <span className="w-32 font-medium text-gray-700">Penerima:</span>
                  <span className="text-gray-900 font-medium">{bb.payeeName}</span>
                </div>
                {bb.payeeAddress && (
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-700">Alamat:</span>
                    <span className="text-gray-900">{bb.payeeAddress}</span>
                  </div>
                )}
                {bb.payeeNpwp && (
                  <div className="flex">
                    <span className="w-32 font-medium text-gray-700">NPWP:</span>
                    <span className="text-gray-900">{bb.payeeNpwp}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="w-32 font-medium text-gray-700">Tujuan:</span>
                  <span className="text-gray-900">{bb.paymentPurpose}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Jumlah Tagihan (Gross):</span>
                    <span className="font-bold text-gray-900">{formatRupiah(bb.grossAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Rincian Potongan */}
            {(bb.totalDeductions > 0 ||
              bb.pph21Amount > 0 ||
              bb.pph22Amount > 0 ||
              bb.pph23Amount > 0 ||
              bb.pph24Amount > 0 ||
              bb.ppnAmount > 0) && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Rincian Potongan
                </h2>
                <div className="space-y-2 text-sm">
                  {bb.pph21Amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>- Potongan PPh 21 ({bb.pph21Rate}%)</span>
                      <span>({formatRupiah(bb.pph21Amount)})</span>
                    </div>
                  )}
                  {bb.pph22Amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>- Potongan PPh 22 ({bb.pph22Rate}%)</span>
                      <span>({formatRupiah(bb.pph22Amount)})</span>
                    </div>
                  )}
                  {bb.pph23Amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>- Potongan PPh 23 ({bb.pph23Rate}%)</span>
                      <span>({formatRupiah(bb.pph23Amount)})</span>
                    </div>
                  )}
                  {bb.pph24Amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>- Potongan PPh 24 ({bb.pph24Rate}%)</span>
                      <span>({formatRupiah(bb.pph24Amount)})</span>
                    </div>
                  )}
                  {bb.ppnAmount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>- Potongan PPN ({bb.ppnRate}%)</span>
                      <span>({formatRupiah(bb.ppnAmount)})</span>
                    </div>
                  )}
                  {bb.otherDeductions > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>- {bb.otherDeductionsNote || 'Potongan Lainnya'}</span>
                      <span>({formatRupiah(bb.otherDeductions)})</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-semibold">
                    <span>Total Potongan:</span>
                    <span>{formatRupiah(bb.totalDeductions)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Jumlah Diterima */}
            <div className="rounded-lg bg-green-50 border-2 border-green-200 p-6 shadow">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-green-900">
                  JUMLAH DITERIMA (NET):
                </span>
                <span className="text-2xl font-bold text-green-900">
                  {formatRupiah(bb.netPayment)}
                </span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                Terbilang: <span className="italic">{bb.grossAmountText}</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Workflow */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Status & Workflow
              </h2>
              <div className="space-y-3">
                {/* Action Buttons based on status */}
                {bb.status === BuktiBayarStatus.DRAFT && (
                  <button
                    onClick={() => finalizeMutation.mutate()}
                    disabled={finalizeMutation.isPending}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {finalizeMutation.isPending ? 'Memproses...' : 'Finalisasi Bukti Bayar'}
                  </button>
                )}

                {/* Print button for FINAL status */}
                {bb.status === BuktiBayarStatus.FINAL && (
                  <button
                    onClick={handlePrint}
                    disabled={printMutation.isPending}
                    className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    {printMutation.isPending ? 'Mencetak...' : 'Cetak PDF'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuktiBayarDetail;