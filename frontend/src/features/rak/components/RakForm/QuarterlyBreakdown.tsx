import React from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MonthlyBreakdown, type QuarterlyBreakdown, ExpandedState } from '../../types/rak.types';
import { formatCurrency } from '../../utils/rakFormatters';

interface QuarterlyBreakdownProps {
  detail: MonthlyBreakdown & QuarterlyBreakdown;
  jumlahAnggaran: number;
  onUpdate: (detail: MonthlyBreakdown & QuarterlyBreakdown) => void;
  readonly?: boolean;
}

export function QuarterlyBreakdown({
  detail,
  jumlahAnggaran,
  onUpdate,
  readonly = false,
}: QuarterlyBreakdownProps) {
  const [expanded, setExpanded] = React.useState<ExpandedState>({
    tw1: false,
    tw2: false,
    tw3: false,
    tw4: false,
  });

  /**
   * Handle quarter input change - auto-distribute to months
   */
  const handleQuarterChange = (quarter: keyof QuarterlyBreakdown, value: number) => {
    const months: Array<keyof MonthlyBreakdown> = [];
    
    if (quarter === 'triwulan_1') {
      months.push('januari', 'februari', 'maret');
    } else if (quarter === 'triwulan_2') {
      months.push('april', 'mei', 'juni');
    } else if (quarter === 'triwulan_3') {
      months.push('juli', 'agustus', 'september');
    } else if (quarter === 'triwulan_4') {
      months.push('oktober', 'november', 'desember');
    }

    const perMonth = Math.floor(value / 3);
    const remainder = value - perMonth * 3;

    const updated = { ...detail };
    months.forEach((month, idx) => {
      updated[month] = perMonth + (idx === 0 ? remainder : 0);
    });

    // Recalculate quarters from updated months
    updated.triwulan_1 = updated.januari + updated.februari + updated.maret;
    updated.triwulan_2 = updated.april + updated.mei + updated.juni;
    updated.triwulan_3 = updated.juli + updated.agustus + updated.september;
    updated.triwulan_4 = updated.oktober + updated.november + updated.desember;

    onUpdate(updated);
  };

  /**
   * Handle month input change - auto-sum to quarter
   */
  const handleMonthChange = (month: keyof MonthlyBreakdown, value: number) => {
    const updated = { ...detail };
    updated[month] = value;

    // Recalculate quarters
    updated.triwulan_1 = updated.januari + updated.februari + updated.maret;
    updated.triwulan_2 = updated.april + updated.mei + updated.juni;
    updated.triwulan_3 = updated.juli + updated.agustus + updated.september;
    updated.triwulan_4 = updated.oktober + updated.november + updated.desember;

    onUpdate(updated);
  };

  /**
   * Auto-distribute quarter value equally to 3 months
   */
  const handleAutoDistribute = (quarter: keyof QuarterlyBreakdown) => {
    const value = detail[quarter];
    if (!value) return;
    handleQuarterChange(quarter, value);
  };

  /**
   * Toggle expand/collapse for quarter
   */
  const toggleExpand = (quarterKey: keyof ExpandedState) => {
    setExpanded((prev) => ({
      ...prev,
      [quarterKey]: !prev[quarterKey],
    }));
  };

  const totalQuarterly = detail.triwulan_1 + detail.triwulan_2 + detail.triwulan_3 + detail.triwulan_4;
  const isBalanced = Math.abs(totalQuarterly - jumlahAnggaran) < 1;
  const difference = Math.abs(totalQuarterly - jumlahAnggaran);

  return (
    <div className="space-y-3">
      {/* Triwulan 1 */}
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleExpand('tw1')}
            className="text-gray-500 hover:text-gray-700 p-1"
            disabled={readonly}
          >
            {expanded.tw1 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>

          <span className="font-medium flex-1 text-sm">Triwulan 1 (Jan-Mar)</span>

          <Input
            type="number"
            value={detail.triwulan_1 || 0}
            onChange={(e) => handleQuarterChange('triwulan_1', parseFloat(e.target.value) || 0)}
            className="w-40 text-right h-8"
            disabled={readonly}
            placeholder="0"
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAutoDistribute('triwulan_1')}
            title="Auto-distribute merata ke 3 bulan"
            disabled={readonly}
            className="h-8 px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>

        {expanded.tw1 && (
          <div className="ml-8 mt-3 space-y-2 animate-in slide-in-from-top-2">
            {['januari', 'februari', 'maret'].map((month) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600 capitalize">{month}</span>
                <Input
                  type="number"
                  value={detail[month as keyof MonthlyBreakdown] || 0}
                  onChange={(e) => handleMonthChange(month as keyof MonthlyBreakdown, parseFloat(e.target.value) || 0)}
                  className="w-40 text-right h-8"
                  disabled={readonly}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triwulan 2 */}
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleExpand('tw2')}
            className="text-gray-500 hover:text-gray-700 p-1"
            disabled={readonly}
          >
            {expanded.tw2 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>

          <span className="font-medium flex-1 text-sm">Triwulan 2 (Apr-Jun)</span>

          <Input
            type="number"
            value={detail.triwulan_2 || 0}
            onChange={(e) => handleQuarterChange('triwulan_2', parseFloat(e.target.value) || 0)}
            className="w-40 text-right h-8"
            disabled={readonly}
            placeholder="0"
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAutoDistribute('triwulan_2')}
            title="Auto-distribute merata ke 3 bulan"
            disabled={readonly}
            className="h-8 px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>

        {expanded.tw2 && (
          <div className="ml-8 mt-3 space-y-2 animate-in slide-in-from-top-2">
            {['april', 'mei', 'juni'].map((month) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600 capitalize">{month}</span>
                <Input
                  type="number"
                  value={detail[month as keyof MonthlyBreakdown] || 0}
                  onChange={(e) => handleMonthChange(month as keyof MonthlyBreakdown, parseFloat(e.target.value) || 0)}
                  className="w-40 text-right h-8"
                  disabled={readonly}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triwulan 3 */}
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleExpand('tw3')}
            className="text-gray-500 hover:text-gray-700 p-1"
            disabled={readonly}
          >
            {expanded.tw3 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>

          <span className="font-medium flex-1 text-sm">Triwulan 3 (Jul-Sep)</span>

          <Input
            type="number"
            value={detail.triwulan_3 || 0}
            onChange={(e) => handleQuarterChange('triwulan_3', parseFloat(e.target.value) || 0)}
            className="w-40 text-right h-8"
            disabled={readonly}
            placeholder="0"
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAutoDistribute('triwulan_3')}
            title="Auto-distribute merata ke 3 bulan"
            disabled={readonly}
            className="h-8 px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>

        {expanded.tw3 && (
          <div className="ml-8 mt-3 space-y-2 animate-in slide-in-from-top-2">
            {['juli', 'agustus', 'september'].map((month) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600 capitalize">{month}</span>
                <Input
                  type="number"
                  value={detail[month as keyof MonthlyBreakdown] || 0}
                  onChange={(e) => handleMonthChange(month as keyof MonthlyBreakdown, parseFloat(e.target.value) || 0)}
                  className="w-40 text-right h-8"
                  disabled={readonly}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Triwulan 4 */}
      <div className="border rounded-lg p-3 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleExpand('tw4')}
            className="text-gray-500 hover:text-gray-700 p-1"
            disabled={readonly}
          >
            {expanded.tw4 ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>

          <span className="font-medium flex-1 text-sm">Triwulan 4 (Oct-Dec)</span>

          <Input
            type="number"
            value={detail.triwulan_4 || 0}
            onChange={(e) => handleQuarterChange('triwulan_4', parseFloat(e.target.value) || 0)}
            className="w-40 text-right h-8"
            disabled={readonly}
            placeholder="0"
          />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleAutoDistribute('triwulan_4')}
            title="Auto-distribute merata ke 3 bulan"
            disabled={readonly}
            className="h-8 px-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </Button>
        </div>

        {expanded.tw4 && (
          <div className="ml-8 mt-3 space-y-2 animate-in slide-in-from-top-2">
            {['oktober', 'november', 'desember'].map((month) => (
              <div key={month} className="flex items-center gap-3">
                <span className="w-24 text-sm text-gray-600 capitalize">{month}</span>
                <Input
                  type="number"
                  value={detail[month as keyof MonthlyBreakdown] || 0}
                  onChange={(e) => handleMonthChange(month as keyof MonthlyBreakdown, parseFloat(e.target.value) || 0)}
                  className="w-40 text-right h-8"
                  disabled={readonly}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation Section */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Triwulan:</span>
            <span className={`font-semibold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalQuarterly)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Jumlah Anggaran:</span>
            <span className="font-semibold">{formatCurrency(jumlahAnggaran)}</span>
          </div>
          {isBalanced ? (
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Seimbang
            </p>
          ) : (
            <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Selisih: {formatCurrency(difference)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}