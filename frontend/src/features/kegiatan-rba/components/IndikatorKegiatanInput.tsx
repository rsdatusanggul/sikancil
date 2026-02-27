import { Button } from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';
import type { IndikatorKegiatan } from '../types';

interface IndikatorKegiatanInputProps {
  value: IndikatorKegiatan[];
  onChange: (value: IndikatorKegiatan[]) => void;
  disabled?: boolean;
}

export default function IndikatorKegiatanInput({
  value,
  onChange,
  disabled = false,
}: IndikatorKegiatanInputProps) {
  const handleAdd = () => {
    onChange([...value, { nama: '', satuan: '', target: 0 }]);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleChange = (index: number, field: keyof IndikatorKegiatan, val: any) => {
    const updated = [...value];
    updated[index] = { ...updated[index], [field]: val };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Indikator Kegiatan
          <span className="text-gray-500 font-normal ml-2">(Opsional)</span>
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={handleAdd}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-1" />
          Tambah Indikator
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="text-sm text-gray-500 italic border border-dashed border-gray-300 rounded-md p-4 text-center">
          Belum ada indikator. Klik "Tambah Indikator" untuk menambahkan.
        </div>
      ) : (
        <div className="space-y-2">
          {value.map((item, idx) => (
            <div
              key={idx}
              className="flex gap-2 items-start p-3 border border-gray-200 rounded-md bg-gray-50"
            >
              <div className="flex-1 space-y-2">
                {/* Nama Indikator */}
                <div>
                  <input
                    type="text"
                    placeholder="Nama indikator (contoh: Jumlah tagihan terbayar)"
                    value={item.nama}
                    onChange={(e) => handleChange(idx, 'nama', e.target.value)}
                    disabled={disabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {/* Satuan & Target */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Satuan (contoh: tagihan, %, orang)"
                      value={item.satuan}
                      onChange={(e) => handleChange(idx, 'satuan', e.target.value)}
                      disabled={disabled}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      placeholder="Target"
                      value={item.target}
                      onChange={(e) => handleChange(idx, 'target', Number(e.target.value))}
                      disabled={disabled}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleRemove(idx)}
                disabled={disabled}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                title="Hapus indikator"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Indikator digunakan untuk mengukur capaian kegiatan. Contoh: "Jumlah tagihan terbayar - 12
        tagihan"
      </p>
    </div>
  );
}
