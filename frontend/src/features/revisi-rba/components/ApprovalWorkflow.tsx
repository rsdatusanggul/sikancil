import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Alert, Badge } from '@/components/ui';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { revisiRBAApi } from '../api';
import type { RevisiRBA } from '../types';

interface ApprovalWorkflowProps {
  revisi: RevisiRBA;
  onClose: () => void;
}

const JENIS_REVISI_LABELS: Record<string, string> = {
  PERUBAHAN_PAGU: 'Perubahan Pagu',
  PERUBAHAN_VOLUME: 'Perubahan Volume',
  PERUBAHAN_WAKTU: 'Perubahan Waktu',
  PERGESERAN_ANGGARAN: 'Pergeseran Anggaran',
  LAIN_LAIN: 'Lain-lain',
};

export default function ApprovalWorkflow({ revisi, onClose }: ApprovalWorkflowProps) {
  const queryClient = useQueryClient();
  const [catatan, setCatatan] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const approveMutation = useMutation({
    mutationFn: ({ approved }: { approved: boolean }) =>
      revisiRBAApi.approve(revisi.id, {
        approved,
        catatan: catatan.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revisi-rba'] });
      queryClient.invalidateQueries({ queryKey: ['revisi-rba-pending'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Gagal memproses approval');
    },
  });

  const handleApprove = () => {
    if (window.confirm('Setujui revisi ini?')) {
      approveMutation.mutate({ approved: true });
    }
  };

  const handleReject = () => {
    if (!catatan.trim()) {
      setError('Catatan penolakan harus diisi');
      return;
    }
    if (window.confirm('Tolak revisi ini?')) {
      approveMutation.mutate({ approved: false });
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const isLoading = approveMutation.isPending;

  return (
    <Modal isOpen={true} onClose={onClose} title="Approval Revisi RBA">
      <div className="space-y-6">
        {error && <Alert variant="destructive">{error}</Alert>}

        {/* Revisi Info */}
        <div className="border rounded-md p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Detail Revisi</h3>
            <Badge variant="default">{JENIS_REVISI_LABELS[revisi.perubahanData.type]}</Badge>
          </div>

          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-gray-600">Tanggal Revisi:</div>
              <div className="col-span-2 font-medium">{formatDate(revisi.tanggalRevisi)}</div>
            </div>

            {revisi.rba && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-gray-600">RBA / Program:</div>
                <div className="col-span-2 font-medium">
                  [{revisi.rba.kodeProgram}] {revisi.rba.namaProgram}
                </div>
              </div>
            )}

            {revisi.perubahanData.kodeRekening && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-gray-600">Kode Rekening:</div>
                <div className="col-span-2 font-mono">{revisi.perubahanData.kodeRekening}</div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <div className="text-gray-600">Alasan:</div>
              <div className="col-span-2">{revisi.alasanRevisi}</div>
            </div>
          </div>
        </div>

        {/* Comparison Section */}
        <div className="border rounded-md p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Perbandingan Data
          </h3>

          {revisi.perubahanData.type === 'PERUBAHAN_PAGU' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-md">
                  <div className="text-xs text-gray-600 mb-1">Pagu Sebelum</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatCurrency(revisi.perubahanData.paguSebelum || 0)}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="text-xs text-gray-600 mb-1">Pagu Sesudah</div>
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(revisi.perubahanData.paguSesudah || 0)}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-md">
                <div className="text-xs text-gray-600 mb-1">Selisih</div>
                <div className="text-lg font-bold text-blue-600">
                  {revisi.perubahanData.selisih && revisi.perubahanData.selisih > 0 ? '+' : ''}
                  {formatCurrency(revisi.perubahanData.selisih || 0)}
                </div>
              </div>
            </div>
          )}

          {revisi.perubahanData.type === 'PERUBAHAN_VOLUME' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 rounded-md">
                <div className="text-xs text-gray-600 mb-1">Volume Sebelum</div>
                <div className="text-lg font-bold text-red-600">{revisi.perubahanData.volumeSebelum || 0}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-xs text-gray-600 mb-1">Volume Sesudah</div>
                <div className="text-lg font-bold text-green-600">{revisi.perubahanData.volumeSesudah || 0}</div>
              </div>
            </div>
          )}

          {revisi.perubahanData.type === 'PERUBAHAN_WAKTU' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-red-50 rounded-md">
                <div className="text-xs text-gray-600 mb-1">Waktu Sebelum</div>
                <div className="text-sm font-medium text-red-600">{revisi.perubahanData.waktuSebelum || '-'}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-md">
                <div className="text-xs text-gray-600 mb-1">Waktu Sesudah</div>
                <div className="text-sm font-medium text-green-600">{revisi.perubahanData.waktuSesudah || '-'}</div>
              </div>
            </div>
          )}

          {revisi.perubahanData.keteranganTambahan && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <div className="text-xs text-gray-600 mb-1">Keterangan Tambahan</div>
              <div className="text-sm">{revisi.perubahanData.keteranganTambahan}</div>
            </div>
          )}
        </div>

        {/* Approval Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Catatan Approval {revisi.status === 'PENDING' && <span className="text-red-500">(wajib jika tolak)</span>}
          </label>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tambahkan catatan approval..."
            disabled={isLoading}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            {isLoading ? 'Processing...' : 'Tolak'}
          </Button>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={isLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4" />
            {isLoading ? 'Processing...' : 'Setujui'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
