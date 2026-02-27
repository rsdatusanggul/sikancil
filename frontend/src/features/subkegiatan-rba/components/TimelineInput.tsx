interface TimelineInputProps {
  startMonth?: number;
  endMonth?: number;
  onStartChange: (value: number | undefined) => void;
  onEndChange: (value: number | undefined) => void;
  disabled?: boolean;
  errors?: {
    start?: string;
    end?: string;
  };
}

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export default function TimelineInput({
  startMonth,
  endMonth,
  onStartChange,
  onEndChange,
  disabled = false,
  errors = {},
}: TimelineInputProps) {
  const handleStartChange = (value: string) => {
    onStartChange(value ? Number(value) : undefined);
  };

  const handleEndChange = (value: string) => {
    onEndChange(value ? Number(value) : undefined);
  };

  // Validation: if startMonth is set, endMonth options should be >= startMonth
  const isEndMonthDisabled = (monthNum: number) => {
    return startMonth !== undefined && monthNum < startMonth;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Timeline Pelaksanaan{' '}
        <span className="text-gray-500 dark:text-gray-400 font-normal">(Opsional)</span>
      </label>
      <div className="flex gap-3 items-center">
        {/* Bulan Mulai */}
        <div className="flex-1">
          <select
            value={startMonth || ''}
            onChange={(e) => handleStartChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.start ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={disabled}
          >
            <option value="">Pilih Bulan Mulai</option>
            {MONTHS.map((month, idx) => (
              <option key={idx} value={idx + 1}>
                {month}
              </option>
            ))}
          </select>
          {errors.start && <p className="text-red-500 text-xs mt-1">{errors.start}</p>}
        </div>

        <span className="text-gray-500 dark:text-gray-400 font-medium">s/d</span>

        {/* Bulan Selesai */}
        <div className="flex-1">
          <select
            value={endMonth || ''}
            onChange={(e) => handleEndChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.end ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={disabled}
          >
            <option value="">Pilih Bulan Selesai</option>
            {MONTHS.map((month, idx) => {
              const monthNum = idx + 1;
              const isDisabled = isEndMonthDisabled(monthNum);
              return (
                <option key={idx} value={monthNum} disabled={isDisabled}>
                  {month}
                </option>
              );
            })}
          </select>
          {errors.end && <p className="text-red-500 text-xs mt-1">{errors.end}</p>}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Tentukan periode pelaksanaan output dalam bulan. Contoh: Januari s/d Desember
      </p>
    </div>
  );
}

export function formatMonthRange(start?: number, end?: number): string {
  const MONTHS_SHORT = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'Mei',
    'Jun',
    'Jul',
    'Ags',
    'Sep',
    'Okt',
    'Nov',
    'Des',
  ];

  if (!start && !end) return '-';
  if (start && !end) return MONTHS_SHORT[start - 1];
  if (!start && end) return `s/d ${MONTHS_SHORT[end - 1]}`;
  if (start && start === end) return MONTHS_SHORT[start - 1];
  if (start && end) return `${MONTHS_SHORT[start - 1]} - ${MONTHS_SHORT[end - 1]}`;
  return '-';
}
