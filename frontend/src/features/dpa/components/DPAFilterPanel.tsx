import React, { useState } from 'react';
import { DPAStatus, JenisDokumenDPA } from '../types';

interface DPAFilterPanelProps {
  onFilterChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
}

export interface FilterState {
  tahunAnggaran?: number;
  status?: DPAStatus;
  jenisDokumen?: JenisDokumenDPA;
  search?: string;
}

const DPAFilterPanel: React.FC<DPAFilterPanelProps> = ({
  onFilterChange,
  initialFilters = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = {
      ...filters,
      [key]: value || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterState = {};
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== ''
  ).length;

  return (
    <div className="mb-4 rounded-lg border border-gray-200 bg-white">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="font-medium text-gray-700">Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {activeFilterCount}
            </span>
          )}
        </div>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Cari Nomor DPA
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="DPA-001/BLUD/2026"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Tahun Anggaran */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tahun Anggaran
              </label>
              <select
                value={filters.tahunAnggaran || ''}
                onChange={(e) =>
                  handleFilterChange(
                    'tahunAnggaran',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Semua Tahun</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) =>
                  handleFilterChange('status', e.target.value || undefined)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                <option value={DPAStatus.DRAFT}>Draft</option>
                <option value={DPAStatus.SUBMITTED}>Diajukan</option>
                <option value={DPAStatus.APPROVED}>Disetujui</option>
                <option value={DPAStatus.REJECTED}>Ditolak</option>
                <option value={DPAStatus.ACTIVE}>Aktif</option>
                <option value={DPAStatus.REVISED}>Direvisi</option>
              </select>
            </div>

            {/* Jenis Dokumen */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Jenis Dokumen
              </label>
              <select
                value={filters.jenisDokumen || ''}
                onChange={(e) =>
                  handleFilterChange('jenisDokumen', e.target.value || undefined)
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Semua Jenis</option>
                <option value={JenisDokumenDPA.DPA}>DPA</option>
                <option value={JenisDokumenDPA.DPPA}>DPPA</option>
              </select>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReset}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DPAFilterPanel;
