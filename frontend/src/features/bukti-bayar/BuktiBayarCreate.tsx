import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateBuktiBayarDto, TaxPreview, BudgetCheck, KodeRekeningSearchResult, SubkegiatanDropdownItem } from './types';
import { useNavigate } from 'react-router-dom';

const BuktiBayarCreate: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateBuktiBayarDto>({
    voucherDate: new Date().toISOString().split('T')[0],
    fiscalYear: new Date().getFullYear(),
    programId: '',
    programCode: '',
    kegiatanId: '',
    kegiatanCode: '',
    accountCode: '',
    accountName: '',
    grossAmount: 0,
    paymentPurpose: '',
  });

  const [taxPreview, setTaxPreview] = useState<TaxPreview | null>(null);
  const [budgetCheck, setBudgetCheck] = useState<BudgetCheck | null>(null);
  
  // Kode rekening autocomplete
  const [kodeRekeningQuery, setKodeRekeningQuery] = useState('');
  const [showKodeRekeningSuggestions, setShowKodeRekeningSuggestions] = useState(false);

  // Subkegiatan dropdown
  const [subkegiatanQuery, setSubkegiatanQuery] = useState('');
  const [showSubkegiatanDropdown, setShowSubkegiatanDropdown] = useState(false);

  // Fetch subkegiatan for dropdown
  const { data: subkegiatanList = [] } = useQuery({
    queryKey: ['subkegiatan-dropdown', formData.fiscalYear, subkegiatanQuery],
    queryFn: () =>
      apiClient
        .get('/payment-vouchers/subkegiatan', {
          params: { 
            tahun: formData.fiscalYear,
            search: subkegiatanQuery.length >= 2 ? subkegiatanQuery : undefined 
          },
        })
        .then((res) => res.data),
    enabled: !!formData.fiscalYear,
  });

  // Search kode rekening
  const { data: kodeRekeningSuggestions = [] } = useQuery({
    queryKey: ['kode-rekening-search', kodeRekeningQuery],
    queryFn: () =>
      apiClient
        .get('/payment-vouchers/search-kode-rekening', {
          params: { q: kodeRekeningQuery },
        })
        .then((res) => res.data),
    enabled: kodeRekeningQuery.length >= 2, // Start searching after 2 characters
  });

  // Fetch tax preview when account code and gross amount change
  const { data: taxData } = useQuery({
    queryKey: ['tax-preview', formData.accountCode, formData.grossAmount, formData.vendorNpwp],
    queryFn: () =>
      apiClient.get('/payment-vouchers/tax-preview', {
        params: {
          accountCode: formData.accountCode,
          grossAmount: formData.grossAmount,
          vendorNpwp: formData.vendorNpwp,
        },
      }).then((res) => res.data),
    enabled: !!(formData.accountCode && formData.grossAmount > 0),
  });

  useEffect(() => {
    if (taxData) setTaxPreview(taxData);
  }, [taxData]);

  // Extract month from voucherDate for budget check
  const voucherMonth = formData.voucherDate ? new Date(formData.voucherDate).getMonth() + 1 : 0;

  // Fetch budget check when subkegiatan, account code, fiscal year, and month change
  const { data: budgetData } = useQuery({
    queryKey: ['budget-check', formData.subKegiatanId, formData.accountCode, formData.fiscalYear, voucherMonth],
    queryFn: () =>
      apiClient.get('/payment-vouchers/budget-check', {
        params: {
          kegiatanId: formData.kegiatanId,
          subKegiatanId: formData.subKegiatanId,
          accountCode: formData.accountCode,
          fiscalYear: formData.fiscalYear,
          voucherMonth: voucherMonth,
        },
      }).then((res) => res.data),
    enabled: !!(formData.subKegiatanId && formData.accountCode && formData.fiscalYear && voucherMonth),
  });

  useEffect(() => {
    if (budgetData) setBudgetCheck(budgetData);
  }, [budgetData]);

  const createMutation = useMutation({
    mutationFn: (data: CreateBuktiBayarDto) =>
      apiClient.post('/payment-vouchers', data).then((res) => res.data),
    onSuccess: (data: any) => {
      navigate(`/bukti-bayar/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate budget
    if (budgetCheck && !budgetCheck.canProceed) {
      alert('Tidak cukup anggaran! Silakan cek kembali sisa pagu dan RAK.');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleKodeRekeningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData({ ...formData, accountCode: value });
    setKodeRekeningQuery(value);
    setShowKodeRekeningSuggestions(true);
  };

  const handleKodeRekeningSelect = (item: KodeRekeningSearchResult) => {
    setFormData({ 
      ...formData, 
      accountCode: item.kodeRekening,
      accountName: item.namaRekening 
    });
    setKodeRekeningQuery(item.kodeRekening);
    setShowKodeRekeningSuggestions(false);
  };

  const handleSubkegiatanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSubkegiatanQuery(value);
    setShowSubkegiatanDropdown(true);
  };

  const handleSubkegiatanSelect = (item: SubkegiatanDropdownItem) => {
    setFormData({ 
      ...formData, 
      subKegiatanId: item.id,
      subKegiatanCode: item.kodeSubKegiatan,
      subKegiatanName: item.namaSubKegiatan,
      kegiatanId: item.kegiatanId,
      kegiatanCode: item.kodeKegiatan,
      kegiatanName: item.namaKegiatan,
      programId: item.programId,
      programCode: item.kodeProgram,
      programName: item.namaProgram,
    });
    setSubkegiatanQuery(`${item.kodeSubKegiatan} - ${item.namaSubKegiatan}`);
    setShowSubkegiatanDropdown(false);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectedSubkegiatan = subkegiatanList.find((s: SubkegiatanDropdownItem) => s.id === formData.subKegiatanId);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
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
          <h1 className="text-3xl font-bold text-gray-900">
            Buat Bukti Bayar Baru
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Isi formulir di bawah untuk membuat bukti pembayaran baru
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Informasi Umum */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Informasi Umum
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tahun Anggaran *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.fiscalYear}
                    onChange={(e) =>
                      setFormData({ ...formData, fiscalYear: parseInt(e.target.value) })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Bukti Bayar *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.voucherDate}
                    onChange={(e) =>
                      setFormData({ ...formData, voucherDate: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Subkegiatan Dropdown */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Pilih Subkegiatan
              </h2>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700">
                  Subkegiatan *
                </label>
                <input
                  type="text"
                  required
                  value={subkegiatanQuery}
                  onChange={handleSubkegiatanChange}
                  onFocus={() => setShowSubkegiatanDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSubkegiatanDropdown(false), 200)}
                  className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Ketik kode atau nama subkegiatan..."
                />
                
                {/* Dropdown */}
                {showSubkegiatanDropdown && subkegiatanList && subkegiatanList.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-96 overflow-auto">
                    {subkegiatanList.map((item: SubkegiatanDropdownItem) => (
                      <div
                        key={item.id}
                        className="cursor-pointer px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-0"
                        onClick={() => handleSubkegiatanSelect(item)}
                      >
                        <div className="font-medium text-sm text-gray-900">
                          {item.kodeSubKegiatan} - {item.namaSubKegiatan}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {item.kodeKegiatan} - {item.namaKegiatan}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.kodeProgram} - {item.namaProgram} | Tahun: {item.tahun}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="mt-1 text-xs text-gray-500">
                  Ketik kode atau nama subkegiatan untuk mencari (min. 2 karakter)
                </p>
              </div>

              {/* Display selected subkegiatan info */}
              {selectedSubkegiatan && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Informasi Terpilih:</h3>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Subkegiatan:</span>{' '}
                      <span className="text-gray-900">
                        {formData.subKegiatanCode} - {formData.subKegiatanName}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Kegiatan:</span>{' '}
                      <span className="text-gray-900">
                        {formData.kegiatanCode} - {formData.kegiatanName}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Program:</span>{' '}
                      <span className="text-gray-900">
                        {formData.programCode} - {formData.programName}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informasi Pembayaran */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Informasi Pembayaran
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Penerima Uang *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.payeeName}
                    onChange={(e) =>
                      setFormData({ ...formData, payeeName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Nama perusahaan atau perorangan"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Alamat Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.vendorAddress || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, vendorAddress: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    NPWP Vendor
                  </label>
                  <input
                    type="text"
                    value={formData.vendorNpwp || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, vendorNpwp: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Contoh: 01.234.567.8-901.000"
                  />
                </div>

                <div className="sm:col-span-2 relative">
                  <label className="block text-sm font-medium text-gray-700">
                    Kode Rekening *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountCode}
                    onChange={handleKodeRekeningChange}
                    onFocus={() => setShowKodeRekeningSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowKodeRekeningSuggestions(false), 200)}
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Ketik untuk mencari kode rekening..."
                  />
                  
                  {/* Autocomplete dropdown */}
                  {showKodeRekeningSuggestions && kodeRekeningSuggestions && kodeRekeningSuggestions.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200 max-h-60 overflow-auto">
                      {kodeRekeningSuggestions.map((item: KodeRekeningSearchResult) => (
                        <div
                          key={item.id}
                          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                          onClick={() => handleKodeRekeningSelect(item)}
                        >
                          <div className="font-medium text-sm text-gray-900">
                            {item.kodeRekening}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.namaRekening}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <p className="mt-1 text-xs text-gray-500">
                    Ketik nama atau kode rekening untuk mencari (min. 2 karakter)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jumlah Tagihan (Gross) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.grossAmount || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, grossAmount: parseFloat(e.target.value) || 0 })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tujuan Pembayaran *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.paymentPurpose}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentPurpose: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Jelaskan tujuan pembayaran"
                  />
                </div>
              </div>
            </div>

            {/* Tax Preview */}
            {taxPreview && (
              <div className="rounded-lg bg-blue-50 p-6 shadow">
                <h2 className="mb-4 text-lg font-semibold text-blue-900">
                  Preview Perhitungan Pajak
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Jumlah Tagihan (Gross)</span>
                    <span className="font-medium">{formatRupiah(formData.grossAmount)}</span>
                  </div>
                  {taxPreview.pph21Amount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>- Potongan PPh 21 ({taxPreview.pph21Rate}%)</span>
                      <span>({formatRupiah(taxPreview.pph21Amount)})</span>
                    </div>
                  )}
                  {taxPreview.pph22Amount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>- Potongan PPh 22 ({taxPreview.pph22Rate}%)</span>
                      <span>({formatRupiah(taxPreview.pph22Amount)})</span>
                    </div>
                  )}
                  {taxPreview.pph23Amount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>- Potongan PPh 23 ({taxPreview.pph23Rate}%)</span>
                      <span>({formatRupiah(taxPreview.pph23Amount)})</span>
                    </div>
                  )}
                  {taxPreview.pph24Amount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>- Potongan PPh 24 ({taxPreview.pph24Rate}%)</span>
                      <span>({formatRupiah(taxPreview.pph24Amount)})</span>
                    </div>
                  )}
                  {taxPreview.ppnAmount > 0 && (
                    <div className="flex justify-between text-sm text-red-600">
                      <span>- Potongan PPN ({taxPreview.ppnRate}%)</span>
                      <span>({formatRupiah(taxPreview.ppnAmount)})</span>
                    </div>
                  )}
                  <div className="border-t border-blue-300 pt-2 flex justify-between font-semibold text-blue-900">
                    <span>Total Potongan</span>
                    <span>{formatRupiah(taxPreview.totalDeductions)}</span>
                  </div>
                  <div className="rounded bg-blue-100 p-3 flex justify-between font-semibold text-blue-900">
                    <span>Jumlah Diterima (Net)</span>
                    <span className="text-lg">{formatRupiah(taxPreview.netPayment)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Budget Check */}
            {budgetCheck && (
              <div className={`rounded-lg p-6 shadow ${
                budgetCheck.canProceed ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <h2 className={`mb-4 text-lg font-semibold ${
                  budgetCheck.canProceed ? 'text-green-900' : 'text-red-900'
                }`}>
                  Cek Ketersediaan Anggaran
                </h2>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">Sisa Pagu</span>
                      <span className={budgetCheck.canProceed ? 'text-green-600' : 'text-red-600'}>
                        {formatRupiah(budgetCheck.availablePagu)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          budgetCheck.canProceed ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{
                          width: `${Math.min((formData.grossAmount / budgetCheck.availablePagu) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  {budgetCheck.remainingRak > 0 && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Sisa RAK Bulan Ini</span>
                        <span className={budgetCheck.canProceed ? 'text-green-600' : 'text-red-600'}>
                          {formatRupiah(budgetCheck.remainingRak)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            budgetCheck.canProceed ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{
                            width: `${Math.min((formData.grossAmount / budgetCheck.remainingRak) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {budgetCheck.warning && (
                    <p className="text-sm text-yellow-600">
                      ⚠️ {budgetCheck.warning}
                    </p>
                  )}

                  {!budgetCheck.canProceed && (
                    <p className="text-sm text-red-600 font-medium">
                      ❌ Tidak cukup anggaran untuk pembayaran ini!
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/bukti-bayar')}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || (budgetCheck !== null && !budgetCheck.canProceed)}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createMutation.isPending ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuktiBayarCreate;