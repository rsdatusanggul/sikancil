import { NumberInputWithControls } from '@/components/ui';

interface VolumeTargetInputProps {
  volume: number;
  satuan: string;
  onVolumeChange: (value: number) => void;
  onSatuanChange: (value: string) => void;
  disabled?: boolean;
  errors?: {
    volume?: string;
    satuan?: string;
  };
}

const SATUAN_PRESETS = ['Orang', 'Pasien', 'Kunjungan', 'Kegiatan', 'Dokumen', 'Layanan', 'Unit'];

export default function VolumeTargetInput({
  volume,
  satuan,
  onVolumeChange,
  onSatuanChange,
  disabled = false,
  errors = {},
}: VolumeTargetInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Volume Target <span className="text-red-500">*</span>
      </label>
      <div className="flex gap-3">
        {/* Volume */}
        <div className="flex-1">
          <NumberInputWithControls
            value={volume}
            onChange={onVolumeChange}
            min={0}
            step={1}
            error={!!errors.volume}
            disabled={disabled}
            placeholder="Jumlah target"
            className="w-full"
          />
          {errors.volume && <p className="text-red-500 text-xs mt-1">{errors.volume}</p>}
        </div>

        {/* Satuan */}
        <div className="flex-1">
          <input
            type="text"
            list="satuan-presets"
            value={satuan}
            onChange={(e) => onSatuanChange(e.target.value)}
            placeholder="Satuan"
            maxLength={50}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 ${
              errors.satuan ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            }`}
            disabled={disabled}
          />
          <datalist id="satuan-presets">
            {SATUAN_PRESETS.map((preset) => (
              <option key={preset} value={preset} />
            ))}
          </datalist>
          {errors.satuan && <p className="text-red-500 text-xs mt-1">{errors.satuan}</p>}
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Contoh: Volume 1000, Satuan "Orang" atau "Pasien"
      </p>
    </div>
  );
}