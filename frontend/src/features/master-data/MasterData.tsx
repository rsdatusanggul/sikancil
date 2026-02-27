// Master Data Hub Component
// Central dashboard for all master data modules

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { masterDataStatsApi } from './api';
import { MASTER_DATA_MODULES } from './types';
import {
  Database,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  FileText,
  CheckCircle2,
} from 'lucide-react';

export default function MasterData() {
  const navigate = useNavigate();

  // Fetch stats for all master data modules
  const {
    data: stats,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['master-data-stats'],
    queryFn: () => masterDataStatsApi.getAllStats(),
  });

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const getModuleCount = (moduleId: string): number => {
    if (!stats) return 0;

    const countMap: Record<string, number> = {
      'chart-of-accounts': stats.chartOfAccounts,
      'unit-kerja': stats.unitKerja,
      'pegawai': stats.pegawai,
      'supplier': stats.supplier,
      'bank-account': stats.bankAccount,
      'fiscal-year': stats.fiscalYear,
    };

    return countMap[moduleId] || 0;
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string; hover: string }> = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        hover: 'hover:bg-blue-100',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        hover: 'hover:bg-purple-100',
      },
      green: {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        hover: 'hover:bg-green-100',
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        hover: 'hover:bg-orange-100',
      },
      teal: {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        border: 'border-teal-200',
        hover: 'hover:bg-teal-100',
      },
      red: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        hover: 'hover:bg-red-100',
      },
    };

    return colorMap[color] || colorMap.blue;
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
            <p className="text-gray-600 mt-1">Kelola data master sistem</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error Loading Master Data</h3>
              <p className="text-red-700 mt-1">
                {error instanceof Error ? error.message : 'Failed to load master data statistics'}
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data</h1>
          <p className="text-gray-600 mt-1">Kelola data master sistem keuangan BLUD</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh data"
          >
            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          <Database className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Statistics Overview */}
      {!isLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Records</p>
                <p className="text-3xl font-bold mt-1">{stats.total.toLocaleString()}</p>
              </div>
              <Database className="w-12 h-12 text-blue-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Active Modules</p>
                <p className="text-3xl font-bold mt-1">{MASTER_DATA_MODULES.length}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-200 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Categories</p>
                <p className="text-3xl font-bold mt-1">6</p>
              </div>
              <FileText className="w-12 h-12 text-purple-200 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Master Data Modules Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Modul Master Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MASTER_DATA_MODULES.map((module) => {
            const colors = getColorClasses(module.color);
            const count = getModuleCount(module.id);

            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.path)}
                className={`
                  ${colors.bg} ${colors.border} border rounded-lg p-6 text-left
                  transition-all duration-200 ${colors.hover} hover:shadow-md
                  group
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`font-semibold ${colors.text} text-lg`}>
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{module.description}</p>

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        {isLoading ? (
                          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                        ) : (
                          <div>
                            <p className="text-2xl font-bold text-gray-900">
                              {count.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">records</p>
                          </div>
                        )}
                      </div>
                      <ArrowRight
                        className={`w-5 h-5 ${colors.text} opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all`}
                      />
                    </div>
                  </div>
                </div>

                {/* Module indicator */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Backend: <span className="font-mono font-medium">/{module.backendModule}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Tentang Master Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-700 mb-1">Bagan Akun (COA)</p>
            <p>Struktur akun keuangan 5 level untuk klasifikasi transaksi</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Unit Kerja</p>
            <p>Struktur organisasi dan unit kerja dalam BLUD</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Pegawai</p>
            <p>Data pegawai untuk pembayaran gaji dan honorarium</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Supplier</p>
            <p>Data vendor untuk transaksi belanja barang/jasa</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Rekening Bank</p>
            <p>Daftar rekening bank untuk manajemen kas</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 mb-1">Tahun Anggaran</p>
            <p>Periode tahun anggaran untuk perencanaan dan pelaporan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
