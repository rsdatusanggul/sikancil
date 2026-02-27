import React from 'react';
import { formatCurrency, formatPercentage } from '../utils';

interface DPARealisasiCardProps {
  title: string;
  pagu: number;
  realisasi: number;
  komitmen?: number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'yellow';
}

const DPARealisasiCard: React.FC<DPARealisasiCardProps> = ({
  title,
  pagu,
  realisasi,
  komitmen = 0,
  icon,
  color = 'blue',
}) => {
  const sisa = pagu - realisasi - komitmen;
  const persentaseRealisasi = pagu > 0 ? (realisasi / pagu) * 100 : 0;
  const persentaseKomitmen = pagu > 0 ? (komitmen / pagu) * 100 : 0;

  const colorClasses = {
    blue: 'border-blue-500 bg-blue-50',
    green: 'border-green-500 bg-green-50',
    purple: 'border-purple-500 bg-purple-50',
    yellow: 'border-yellow-500 bg-yellow-50',
  };

  const progressColorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
    yellow: 'bg-yellow-600',
  };

  return (
    <div
      className={`rounded-lg border-l-4 bg-white p-4 shadow-sm ${colorClasses[color]}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(pagu)}
            </span>
            <span className="text-sm text-gray-500">Pagu</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Realisasi</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(realisasi)}
            </span>
          </div>

          {komitmen > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Komitmen</span>
              <span className="font-semibold text-gray-700">
                {formatCurrency(komitmen)}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sisa</span>
            <span
              className={`font-semibold ${sisa >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {formatCurrency(sisa)}
            </span>
          </div>
        </div>

        <div className="pt-2">
          <div className="mb-1 flex justify-between text-xs text-gray-600">
            <span>Progress</span>
            <span className="font-medium">
              {formatPercentage(persentaseRealisasi)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="relative h-full">
              {/* Realisasi bar */}
              <div
                className={`absolute left-0 top-0 h-full transition-all ${progressColorClasses[color]}`}
                style={{ width: `${Math.min(persentaseRealisasi, 100)}%` }}
              />
              {/* Komitmen bar (striped) */}
              {komitmen > 0 && (
                <div
                  className="absolute top-0 h-full bg-gray-400 opacity-50"
                  style={{
                    left: `${Math.min(persentaseRealisasi, 100)}%`,
                    width: `${Math.min(persentaseKomitmen, 100 - persentaseRealisasi)}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DPARealisasiCard;
