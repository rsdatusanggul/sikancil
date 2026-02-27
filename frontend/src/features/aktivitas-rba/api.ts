import { apiClient } from '@/lib/api-client';
import type {
  AktivitasRBA,
  CreateAktivitasRBADto,
  UpdateAktivitasRBADto,
  QueryAktivitasRBAParams,
  KodeBelanja,
  CreateKodeBelanjaDto,
  UpdateKodeBelanjaDto,
} from './types';

export const aktivitasRBAApi = {
  getAll: async (params?: QueryAktivitasRBAParams) => {
    const response = await apiClient.get<{
      data: AktivitasRBA[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/sub-output-rba', { params });
    return response.data.data;
  },

  getAvailableYears: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/sub-output-rba/years');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<AktivitasRBA>(`/sub-output-rba/${id}`);
    return response.data;
  },

  getBySubKegiatan: async (subKegiatanId: string, tahun?: number) => {
    const params = tahun ? { subKegiatanId, tahun } : { subKegiatanId };
    const response = await apiClient.get<{
      data: AktivitasRBA[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/sub-output-rba', { params });
    return response.data.data;
  },

  create: async (data: CreateAktivitasRBADto) => {
    const response = await apiClient.post<AktivitasRBA>('/sub-output-rba', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAktivitasRBADto) => {
    const response = await apiClient.patch<AktivitasRBA>(`/sub-output-rba/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/sub-output-rba/${id}`);
  },
};

export const kodeBelanjaApi = {
  getAll: async (subOutputId: string) => {
    const response = await apiClient.get<KodeBelanja[]>('/anggaran-belanja-rba', {
      params: { subOutputId },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<KodeBelanja>(`/anggaran-belanja-rba/${id}`);
    return response.data;
  },

  create: async (data: CreateKodeBelanjaDto) => {
    const response = await apiClient.post<KodeBelanja>('/anggaran-belanja-rba', data);
    return response.data;
  },

  update: async (id: string, data: UpdateKodeBelanjaDto) => {
    const response = await apiClient.patch<KodeBelanja>(`/anggaran-belanja-rba/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/anggaran-belanja-rba/${id}`);
  },
};