import { apiClient } from '@/lib/api-client';
import type {
  RakSubkegiatan,
  CreateRakPayload,
  UpdateRakPayload,
  RakQueryParams,
  RakListResponse,
} from '../types/rak.types';

export const rakApi = {
  // GET all RAK
  getAll: async (params: RakQueryParams): Promise<RakListResponse> => {
    const response = await apiClient.get<RakListResponse>('/rak', { params });
    return response.data;
  },

  // GET available years
  getAvailableYears: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/rak/years');
    return response.data;
  },

  // GET RAK by ID
  getById: async (id: string): Promise<RakSubkegiatan> => {
    const response = await apiClient.get<RakSubkegiatan>(`/rak/${id}`);
    return response.data;
  },

  // GET RAK details
  getDetails: async (id: string) => {
    const response = await apiClient.get(`/rak/${id}/details`);
    return response.data;
  },

  // GET by Subkegiatan & Tahun
  getBySubkegiatanAndTahun: async (
    subkegiatanId: string,
    tahun: number,
  ): Promise<RakSubkegiatan> => {
    const response = await apiClient.get<RakSubkegiatan>(
      `/rak/subkegiatan/${subkegiatanId}/tahun/${tahun}`,
    );
    return response.data;
  },

  // CREATE RAK
  create: async (payload: CreateRakPayload): Promise<RakSubkegiatan> => {
    const response = await apiClient.post<RakSubkegiatan>('/rak', payload);
    return response.data;
  },

  // UPDATE RAK
  update: async (
    id: string,
    payload: UpdateRakPayload,
  ): Promise<RakSubkegiatan> => {
    const response = await apiClient.patch<RakSubkegiatan>(`/rak/${id}`, payload);
    return response.data;
  },

  // SUBMIT for approval
  submit: async (id: string): Promise<RakSubkegiatan> => {
    const response = await apiClient.post<RakSubkegiatan>(`/rak/${id}/submit`);
    return response.data;
  },

  // APPROVE
  approve: async (
    id: string,
    notes?: string,
  ): Promise<RakSubkegiatan> => {
    const response = await apiClient.post<RakSubkegiatan>(`/rak/${id}/approve`, {
      approval_notes: notes,
    });
    return response.data;
  },

  // REJECT
  reject: async (
    id: string,
    reason: string,
  ): Promise<RakSubkegiatan> => {
    const response = await apiClient.post<RakSubkegiatan>(`/rak/${id}/reject`, {
      rejection_reason: reason,
    });
    return response.data;
  },

  // EXPORT PDF
  exportPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/rak/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // EXPORT Excel
  exportExcel: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/rak/${id}/export/excel`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // DELETE (soft delete)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/rak/${id}`);
  },
};
