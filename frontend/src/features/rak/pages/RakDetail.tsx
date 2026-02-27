import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useRak } from '../hooks/useRakQuery';
import { useSubmitRak, useApproveRak, useRejectRak, useExportRakPdf, useExportRakExcel, useDeleteRak } from '../hooks/useRakMutation';
import { RakStatusBadge } from '../components/RakDetail/RakStatusBadge';
import { RakMatrixInput } from '../components/RakMatrix/RakMatrixInput';
import { RakStatus } from '../types/rak.types';
import { formatCurrency, calculateAllPeriods } from '../utils/rakFormatters';
import { ArrowLeft, Send, Check, X, Download, Trash2 } from 'lucide-react';

export function RakDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useRak(id || '');
  const submitRak = useSubmitRak();
  const approveRak = useApproveRak();
  const rejectRak = useRejectRak();
  const exportPdf = useExportRakPdf();
  const exportExcel = useExportRakExcel();
  const deleteRak = useDeleteRak();

  if (!id) {
    return <div>ID RAK tidak ditemukan</div>;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Error loading RAK data</p>
      </div>
    );
  }

  // Convert details to matrix data
  const matrixData = (data.details || []).map((detail) => ({
    kode_rekening_id: detail.kode_rekening_id,
    kode: detail.kode_rekening.kode,
    uraian: detail.kode_rekening.uraian,
    jumlah_anggaran: detail.jumlah_anggaran,
    monthly: {
      januari: detail.januari,
      februari: detail.februari,
      maret: detail.maret,
      april: detail.april,
      mei: detail.mei,
      juni: detail.juni,
      juli: detail.juli,
      agustus: detail.agustus,
      september: detail.september,
      oktober: detail.oktober,
      november: detail.november,
      desember: detail.desember,
    },
    ...calculateAllPeriods(detail),
  }));

  const handleEdit = () => {
    navigate(`/rak/${id}/edit`);
  };

  const handleSubmit = () => {
    if (window.confirm('Apakah Anda yakin ingin submit RAK ini?')) {
      submitRak.mutate(id);
    }
  };

  const handleApprove = () => {
    const notes = prompt('Masukkan catatan approval (opsional):');
    approveRak.mutate({ id, notes: notes || undefined });
  };

  const handleReject = () => {
    const reason = prompt('Masukkan alasan penolakan:');
    if (reason && reason.trim()) {
      rejectRak.mutate({ id, reason });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus RAK ini? Tindakan ini tidak dapat dibatalkan.')) {
      deleteRak.mutate(id, {
        onSuccess: () => {
          navigate('/rak');
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/rak')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Detail RAK</h1>
          <p className="text-muted-foreground">
            {data.subkegiatan.kode} - {data.subkegiatan.uraian}
          </p>
        </div>
        <RakStatusBadge status={data.status} />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Tahun Anggaran</p>
          <p className="text-2xl font-bold">{data.tahun_anggaran}</p>
        </div>
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Total Pagu</p>
          <p className="text-2xl font-bold">{formatCurrency(data.total_pagu)}</p>
        </div>
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Revisi Ke</p>
          <p className="text-2xl font-bold">{data.revision_number}</p>
        </div>
        <div className="p-4 border rounded-md">
          <p className="text-sm text-muted-foreground">Status</p>
          <RakStatusBadge status={data.status} />
        </div>
      </div>

      {/* Timeline */}
      <div className="p-4 border rounded-md">
        <h3 className="font-semibold mb-3">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Dibuat:</p>
            <p>{new Date(data.created_at).toLocaleString('id-ID')}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Diupdate:</p>
            <p>{new Date(data.updated_at).toLocaleString('id-ID')}</p>
          </div>
          {data.submitted_at && (
            <>
              <div>
                <p className="text-muted-foreground">Disubmit:</p>
                <p>{new Date(data.submitted_at).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Disubmit Oleh:</p>
                <p>{data.submitted_by || '-'}</p>
              </div>
            </>
          )}
          {data.approved_at && (
            <>
              <div>
                <p className="text-muted-foreground">Disetujui:</p>
                <p>{new Date(data.approved_at).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Disetujui Oleh:</p>
                <p>{data.approved_by || '-'}</p>
              </div>
            </>
          )}
          {data.rejected_at && (
            <>
              <div>
                <p className="text-muted-foreground">Ditolak:</p>
                <p>{new Date(data.rejected_at).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Ditolak Oleh:</p>
                <p>{data.rejected_by || '-'}</p>
              </div>
            </>
          )}
        </div>
        {data.approval_notes && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
            <p className="text-sm font-medium">Catatan Approval:</p>
            <p className="text-sm">{data.approval_notes}</p>
          </div>
        )}
        {data.rejection_reason && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950 rounded-md">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Alasan Penolakan:</p>
            <p className="text-sm text-red-700 dark:text-red-300">{data.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Matrix */}
      <div className="p-4 border rounded-md">
        <h3 className="font-semibold mb-4">Rencana Pencairan Per Bulan</h3>
        <RakMatrixInput data={matrixData} onChange={() => {}} readonly={true} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {data.status === RakStatus.DRAFT && (
          <>
            <Button onClick={handleEdit}>
              <Send className="mr-2 h-4 w-4" />
              Edit RAK
            </Button>
            <Button onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Submit untuk Approval
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          </>
        )}
        {data.status === RakStatus.SUBMITTED && (
          <>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Setujui
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
            >
              <X className="mr-2 h-4 w-4" />
              Tolak
            </Button>
          </>
        )}
        <Button variant="outline" onClick={() => exportPdf.mutate(id)}>
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
        <Button variant="outline" onClick={() => exportExcel.mutate(id)}>
          <Download className="mr-2 h-4 w-4" />
          Export Excel
        </Button>
      </div>
    </div>
  );
}