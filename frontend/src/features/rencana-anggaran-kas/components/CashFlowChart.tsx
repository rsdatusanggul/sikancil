import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent, Alert } from '@/components/ui';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { anggaranKasApi } from '../rencana-anggaran-kas.api';

interface CashFlowChartProps {
  tahun: number;
}

const BULAN_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'
];

export default function CashFlowChart({ tahun }: CashFlowChartProps) {
  const { data: cashFlowData, isLoading } = useQuery({
    queryKey: ['cash-flow-projection', tahun],
    queryFn: () => anggaranKasApi.getCashFlowProjection(tahun),
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatShort = (amount: number): string => {
    if (Math.abs(amount) >= 1000000000) {
      return (amount / 1000000000).toFixed(1) + 'M';
    }
    if (Math.abs(amount) >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'Jt';
    }
    if (Math.abs(amount) >= 1000) {
      return (amount / 1000).toFixed(0) + 'Rb';
    }
    return amount.toString();
  };

  interface CashFlowData {
    bulan: number;
    penerimaan: number;
    pengeluaran: number;
    saldoKumulatif: number;
  }

  // Find max value for scaling
  const maxValue = React.useMemo(() => {
    if (!cashFlowData) return 0;
    return Math.max(
      ...cashFlowData.map((d: CashFlowData) => Math.max(d.penerimaan, d.pengeluaran, Math.abs(d.saldoKumulatif)))
    );
  }, [cashFlowData]);

  // Check for negative cash flow months
  const negativeMonths = React.useMemo(() => {
    if (!cashFlowData) return [];
    return cashFlowData.filter((d: CashFlowData) => d.saldoKumulatif < 0);
  }, [cashFlowData]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">Memuat proyeksi cash flow...</div>
        </CardContent>
      </Card>
    );
  }

  if (!cashFlowData || cashFlowData.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            Tidak ada data proyeksi cash flow untuk tahun {tahun}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Proyeksi Cash Flow {tahun}</CardTitle>
          {negativeMonths.length > 0 && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{negativeMonths.length} bulan dengan cash flow negatif</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Alert for negative cash flow */}
        {negativeMonths.length > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <span className="ml-2">
              Perhatian: Cash flow negatif pada bulan{' '}
              {negativeMonths.map((m) => BULAN_NAMES[m.bulan - 1]).join(', ')}
            </span>
          </Alert>
        )}

        {/* Simple Bar Chart */}
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Penerimaan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Pengeluaran</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Saldo Kumulatif</span>
            </div>
          </div>

          {/* Chart */}
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {cashFlowData.map((data) => (
                <div key={data.bulan} className="mb-4">
                  <div className="flex items-center gap-3">
                    {/* Month Label */}
                    <div className="w-12 text-sm font-medium text-gray-700">
                      {BULAN_NAMES[data.bulan - 1]}
                    </div>

                    {/* Bars Container */}
                    <div className="flex-1 space-y-1">
                      {/* Penerimaan Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-green-500 h-full rounded-full flex items-center justify-end px-2"
                            style={{ width: `${(data.penerimaan / maxValue) * 100}%` }}
                          >
                            {data.penerimaan > 0 && (
                              <span className="text-xs text-white font-medium">
                                {formatShort(data.penerimaan)}
                              </span>
                            )}
                          </div>
                        </div>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      </div>

                      {/* Pengeluaran Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full flex items-center justify-end px-2"
                            style={{ width: `${(data.pengeluaran / maxValue) * 100}%` }}
                          >
                            {data.pengeluaran > 0 && (
                              <span className="text-xs text-white font-medium">
                                {formatShort(data.pengeluaran)}
                              </span>
                            )}
                          </div>
                        </div>
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      </div>

                      {/* Saldo Kumulatif Bar */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                          <div
                            className={`h-full rounded-full flex items-center justify-end px-2 ${
                              data.saldoKumulatif >= 0 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}
                            style={{
                              width: `${(Math.abs(data.saldoKumulatif) / maxValue) * 100}%`,
                            }}
                          >
                            {data.saldoKumulatif !== 0 && (
                              <span className="text-xs text-white font-medium">
                                {formatShort(data.saldoKumulatif)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="w-4"></div>
                      </div>
                    </div>

                    {/* Values */}
                    <div className="w-32 text-right text-sm">
                      <div className="text-green-600">+{formatShort(data.penerimaan)}</div>
                      <div className="text-red-600">-{formatShort(data.pengeluaran)}</div>
                      <div className={`font-bold ${data.saldoKumulatif >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {formatShort(data.saldoKumulatif)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Table */}
          <div className="mt-6 border-t pt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">Bulan</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Penerimaan</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Pengeluaran</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Saldo Bulanan</th>
                    <th className="text-right py-2 px-3 font-medium text-gray-700">Saldo Kumulatif</th>
                  </tr>
                </thead>
                <tbody>
                  {cashFlowData.map((data) => (
                    <tr key={data.bulan} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3">{data.namaBulan}</td>
                      <td className="text-right py-2 px-3 text-green-600">{formatCurrency(data.penerimaan)}</td>
                      <td className="text-right py-2 px-3 text-red-600">{formatCurrency(data.pengeluaran)}</td>
                      <td className={`text-right py-2 px-3 ${data.saldo >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(data.saldo)}
                      </td>
                      <td className={`text-right py-2 px-3 font-medium ${data.saldoKumulatif >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                        {formatCurrency(data.saldoKumulatif)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
