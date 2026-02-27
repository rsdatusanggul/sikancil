import React, { useState } from 'react';
import { DPA } from '../types';
import {
  canSubmitDPA,
  canApproveDPA,
  canRejectDPA,
  canActivateDPA,
  canEditDPA,
  canDeleteDPA,
} from '../utils';
import {
  useSubmitDPA,
  useApproveDPA,
  useRejectDPA,
  useActivateDPA,
  useDeleteDPA,
} from '../hooks';

interface DPAWorkflowActionsProps {
  dpa: DPA;
  onSuccess?: () => void;
  userRole?: string; // 'PPKD' | 'ADMIN' | etc
}

const DPAWorkflowActions: React.FC<DPAWorkflowActionsProps> = ({
  dpa,
  onSuccess,
  userRole = 'ADMIN',
}) => {
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const submitMutation = useSubmitDPA();
  const approveMutation = useApproveDPA();
  const rejectMutation = useRejectDPA();
  const activateMutation = useActivateDPA();
  const deleteMutation = useDeleteDPA();

  const handleSubmit = async () => {
    if (!canSubmitDPA(dpa.status)) return;

    if (confirm('Ajukan DPA untuk persetujuan?')) {
      try {
        await submitMutation.mutateAsync(dpa.id);
        alert('DPA berhasil diajukan!');
        onSuccess?.();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Gagal mengajukan DPA');
      }
    }
  };

  const handleActivate = async () => {
    if (!canActivateDPA(dpa.status)) return;

    if (confirm('Aktifkan DPA ini? DPA yang aktif sebelumnya akan direvisi.')) {
      try {
        await activateMutation.mutateAsync(dpa.id);
        alert('DPA berhasil diaktifkan!');
        onSuccess?.();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Gagal mengaktifkan DPA');
      }
    }
  };

  const handleDelete = async () => {
    if (!canDeleteDPA(dpa.status)) return;

    if (confirm('Hapus DPA ini? Tindakan ini tidak dapat dibatalkan.')) {
      try {
        await deleteMutation.mutateAsync(dpa.id);
        alert('DPA berhasil dihapus!');
        onSuccess?.();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Gagal menghapus DPA');
      }
    }
  };

  const isPPKD = userRole === 'PPKD' || userRole === 'ADMIN';

  return (
    <div className="flex flex-wrap gap-2">
      {/* Submit */}
      {canSubmitDPA(dpa.status) && (
        <button
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {submitMutation.isPending ? 'Mengajukan...' : 'Ajukan untuk Persetujuan'}
        </button>
      )}

      {/* Approve (PPKD only) */}
      {canApproveDPA(dpa.status) && isPPKD && (
        <button
          onClick={() => setShowApproveModal(true)}
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Setujui
        </button>
      )}

      {/* Reject (PPKD only) */}
      {canRejectDPA(dpa.status) && isPPKD && (
        <button
          onClick={() => setShowRejectModal(true)}
          className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Tolak
        </button>
      )}

      {/* Activate */}
      {canActivateDPA(dpa.status) && (
        <button
          onClick={handleActivate}
          disabled={activateMutation.isPending}
          className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {activateMutation.isPending ? 'Mengaktifkan...' : 'Aktifkan DPA'}
        </button>
      )}

      {/* Edit */}
      {canEditDPA(dpa.status) && (
        <a
          href={`/dpa/${dpa.id}/edit`}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Edit
        </a>
      )}

      {/* Delete */}
      {canDeleteDPA(dpa.status) && (
        <button
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
          className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
        </button>
      )}

      {/* Approve Modal (simplified - akan diperbaiki dengan modal component) */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Setujui DPA</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Catatan (opsional)
              </label>
              <textarea
                id="approve-notes"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const notes = (
                    document.getElementById('approve-notes') as HTMLTextAreaElement
                  )?.value;
                  try {
                    await approveMutation.mutateAsync({
                      id: dpa.id,
                      catatan: notes,
                    });
                    alert('DPA berhasil disetujui!');
                    setShowApproveModal(false);
                    onSuccess?.();
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'Gagal menyetujui DPA');
                  }
                }}
                disabled={approveMutation.isPending}
                className="rounded-md bg-green-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {approveMutation.isPending ? 'Menyetujui...' : 'Setujui'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal (simplified) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold">Tolak DPA</h3>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium">
                Alasan Penolakan *
              </label>
              <textarea
                id="reject-reason"
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const reason = (
                    document.getElementById('reject-reason') as HTMLTextAreaElement
                  )?.value;
                  if (!reason) {
                    alert('Alasan penolakan wajib diisi');
                    return;
                  }
                  try {
                    await rejectMutation.mutateAsync({
                      id: dpa.id,
                      alasan: reason,
                    });
                    alert('DPA berhasil ditolak');
                    setShowRejectModal(false);
                    onSuccess?.();
                  } catch (error: any) {
                    alert(error.response?.data?.message || 'Gagal menolak DPA');
                  }
                }}
                disabled={rejectMutation.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {rejectMutation.isPending ? 'Menolak...' : 'Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DPAWorkflowActions;
