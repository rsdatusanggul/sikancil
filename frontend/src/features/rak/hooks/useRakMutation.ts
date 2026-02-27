import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { rakApi } from '../services/rakApi';
import { rakKeys } from './useRakQuery';
import type { CreateRakPayload, UpdateRakPayload } from '../types/rak.types';

// Check if toast is available, otherwise create a simple fallback
const toast = {
  title: (props: any) => {
    console.log('Toast:', props);
  },
  destructive: (props: any) => {
    console.error('Toast Error:', props);
  },
};

// CREATE RAK
export function useCreateRak() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateRakPayload) => rakApi.create(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast.title({
        title: 'Berhasil',
        description: 'RAK berhasil dibuat',
      });
      navigate(`/rak/${data.id}`);
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal membuat RAK',
      });
    },
  });
}

// UPDATE RAK
export function useUpdateRak(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRakPayload) => rakApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast.title({
        title: 'Berhasil',
        description: 'RAK berhasil diupdate',
      });
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal update RAK',
      });
    },
  });
}

// SUBMIT RAK
export function useSubmitRak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rakApi.submit(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast.title({
        title: 'Berhasil',
        description: 'RAK berhasil disubmit untuk approval',
      });
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal submit RAK',
      });
    },
  });
}

// APPROVE RAK
export function useApproveRak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      rakApi.approve(id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast.title({
        title: 'Berhasil',
        description: 'RAK berhasil diapprove',
      });
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal approve RAK',
      });
    },
  });
}

// REJECT RAK
export function useRejectRak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rakApi.reject(id, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: rakKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast.title({
        title: 'RAK Ditolak',
        description: 'RAK telah ditolak',
      });
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal reject RAK',
      });
    },
  });
}

// EXPORT PDF
export function useExportRakPdf() {
  return useMutation({
    mutationFn: rakApi.exportPdf,
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RAK_${id}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.title({
        title: 'Berhasil',
        description: 'RAK berhasil diexport ke PDF',
      });
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal export PDF',
      });
    },
  });
}

// EXPORT Excel
export function useExportRakExcel() {
  return useMutation({
    mutationFn: rakApi.exportExcel,
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RAK_${id}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.title({
        title: 'Berhasil',
        description: 'RAK berhasil diexport ke Excel',
      });
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal export Excel',
      });
    },
  });
}

// DELETE RAK
export function useDeleteRak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rakApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rakKeys.lists() });
      toast.title({
        title: 'Berhasil',
        description: 'RAK berhasil dihapus',
      });
    },
    onError: (error: any) => {
      toast.destructive({
        title: 'Gagal',
        description: error.response?.data?.message || 'Gagal hapus RAK',
      });
    },
  });
}