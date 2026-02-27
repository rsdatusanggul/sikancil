import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import type { RakMatrixData, MonthlyBreakdown } from '../../types/rak.types';
import { formatCurrency, MONTH_NAMES, MONTH_KEYS, calculateMonthlyTotal } from '../../utils/rakFormatters';
import { Calculator, Copy } from 'lucide-react';

interface RakMatrixInputProps {
  data: RakMatrixData[];
  onChange: (data: RakMatrixData[]) => void;
  readonly?: boolean;
}

export function RakMatrixInput({
  data,
  onChange,
  readonly = false,
}: RakMatrixInputProps) {
  const [selectedRow, setSelectedRow] = useState<number | null>(null);

  // Handle monthly input change
  const handleMonthChange = useCallback(
    (rowIndex: number, month: keyof MonthlyBreakdown, value: string) => {
      const numValue = parseFloat(value) || 0;
      const updatedData = [...data];
      updatedData[rowIndex].monthly[month] = numValue;
      
      // Recalculate total
      const newTotal = calculateMonthlyTotal(updatedData[rowIndex].monthly);
      updatedData[rowIndex].jumlah_anggaran = newTotal;
      
      // Recalculate periods
      const periods = updatedData[rowIndex];
      periods.semester_1 = MONTH_KEYS.slice(0, 6).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.semester_2 = MONTH_KEYS.slice(6, 12).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_1 = MONTH_KEYS.slice(0, 3).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_2 = MONTH_KEYS.slice(3, 6).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_3 = MONTH_KEYS.slice(6, 9).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_4 = MONTH_KEYS.slice(9, 12).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      
      onChange(updatedData);
    },
    [data, onChange],
  );

  // Auto-distribute equally
  const handleAutoDistribute = useCallback(
    (rowIndex: number) => {
      const row = data[rowIndex];
      const monthlyValue = Math.floor(row.jumlah_anggaran / 12);
      const remainder = row.jumlah_anggaran - monthlyValue * 12;

      const updatedData = [...data];
      MONTH_KEYS.forEach((month, idx) => {
        updatedData[rowIndex].monthly[month] =
          monthlyValue + (idx === 0 ? remainder : 0);
      });

      // Recalculate periods
      const periods = updatedData[rowIndex];
      periods.semester_1 = MONTH_KEYS.slice(0, 6).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.semester_2 = MONTH_KEYS.slice(6, 12).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_1 = MONTH_KEYS.slice(0, 3).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_2 = MONTH_KEYS.slice(3, 6).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_3 = MONTH_KEYS.slice(6, 9).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );
      periods.triwulan_4 = MONTH_KEYS.slice(9, 12).reduce(
        (sum, m) => sum + (periods.monthly[m] || 0),
        0,
      );

      onChange(updatedData);
    },
    [data, onChange],
  );

  // Copy from previous month
  const handleCopyPrevious = useCallback(
    (rowIndex: number, monthIndex: number) => {
      if (monthIndex === 0) return;

      const updatedData = [...data];
      const currentMonth = MONTH_KEYS[monthIndex];
      const previousMonth = MONTH_KEYS[monthIndex - 1];

      updatedData[rowIndex].monthly[currentMonth] =
        updatedData[rowIndex].monthly[previousMonth];
      
      // Recalculate total
      updatedData[rowIndex].jumlah_anggaran = calculateMonthlyTotal(updatedData[rowIndex].monthly);

      onChange(updatedData);
    },
    [data, onChange],
  );

  // Calculate totals
  const totalPagu = data.reduce((sum, row) => sum + row.jumlah_anggaran, 0);
  const totalRencana = data.reduce(
    (sum, row) => sum + calculateMonthlyTotal(row.monthly),
    0,
  );

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-950">
            <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
              <TableHead className="w-[100px] sticky left-0 bg-background hover:bg-background dark:bg-background dark:hover:bg-background text-base dark:text-gray-300">
                Kode
              </TableHead>
              <TableHead className="min-w-[200px] sticky left-[100px] bg-background hover:bg-background dark:bg-background dark:hover:bg-background text-base dark:text-gray-300">
                Uraian
              </TableHead>
              <TableHead className="text-right min-w-[120px] text-base dark:text-gray-300">
                Jumlah Anggaran
              </TableHead>
              {MONTH_NAMES.map((month) => (
                <TableHead key={month} className="text-right min-w-[100px] text-base dark:text-gray-300">
                  {month}
                </TableHead>
              ))}
              <TableHead className="text-right min-w-[120px] text-base dark:text-gray-300">
                Smt 1
              </TableHead>
              <TableHead className="text-right min-w-[120px] text-base dark:text-gray-300">
                Smt 2
              </TableHead>
              {!readonly && (
                <TableHead className="w-[80px] text-base dark:text-gray-300">Aksi</TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow
                key={row.kode_rekening_id}
                className={selectedRow === rowIndex ? 'bg-muted' : ''}
                onMouseEnter={() => setSelectedRow(rowIndex)}
                onMouseLeave={() => setSelectedRow(null)}
              >
                <TableCell className="font-medium sticky left-0 bg-background">
                  {row.kode}
                </TableCell>
                <TableCell className="sticky left-[100px] bg-background">
                  {row.uraian}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(row.jumlah_anggaran)}
                </TableCell>

                {MONTH_KEYS.map((month, monthIndex) => (
                  <TableCell key={month} className="p-1">
                    {readonly ? (
                      <div className="text-right text-sm">
                        {formatCurrency(row.monthly[month])}
                      </div>
                    ) : (
                      <div className="relative group">
                        <Input
                          type="number"
                          value={row.monthly[month] || 0}
                          onChange={(e) =>
                            handleMonthChange(rowIndex, month, e.target.value)
                          }
                          className="text-right h-8 text-sm"
                          step="0.01"
                          min="0"
                        />
                        {monthIndex > 0 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                            onClick={() =>
                              handleCopyPrevious(rowIndex, monthIndex)
                            }
                            title="Copy from previous month"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                ))}

                <TableCell className="text-right bg-blue-50 dark:bg-blue-950 font-semibold text-sm">
                  {formatCurrency(row.semester_1)}
                </TableCell>
                <TableCell className="text-right bg-green-50 dark:bg-green-950 font-semibold text-sm">
                  {formatCurrency(row.semester_2)}
                </TableCell>

                {!readonly && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAutoDistribute(rowIndex)}
                      title="Auto-distribute equally"
                      className="h-8"
                    >
                      <Calculator className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pagu:</p>
            <p className="text-2xl font-bold text-gray-950 dark:text-gray-50">
              {formatCurrency(totalPagu)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Rencana:</p>
            <p className="text-2xl font-bold text-gray-950 dark:text-gray-50">
              {formatCurrency(totalRencana)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Selisih:</p>
            <p className={`text-2xl font-bold ${
              totalRencana === totalPagu
                ? 'text-green-600 dark:text-green-400'
                : totalRencana > totalPagu
                ? 'text-red-600 dark:text-red-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {formatCurrency(totalRencana - totalPagu)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}