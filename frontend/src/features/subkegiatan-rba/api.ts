import { apiClient } from '@/lib/api-client';
import type {
  SubKegiatanRBA,
  CreateSubKegiatanRBADto,
  UpdateSubKegiatanRBADto,
  QuerySubKegiatanRBAParams,
} from './types';

export const subKegiatanRBAApi = {
  getAll: async (params?: QuerySubKegiatanRBAParams) => {
    const response = await apiClient.get<{
      data: SubKegiatanRBA[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/subkegiatan-rba', { params });
    // Return only the data array for compatibility with existing code
    return response.data.data;
  },

  getAvailableYears: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/subkegiatan-rba/years');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<SubKegiatanRBA>(`/subkegiatan-rba/${id}`);
    return response.data;
  },

  getByKegiatan: async (kegiatanId: string, tahun?: number) => {
    const params = tahun ? { kegiatanId, tahun } : { kegiatanId };
    const response = await apiClient.get<{
      data: SubKegiatanRBA[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>('/subkegiatan-rba', { params });
    // Return only the data array for compatibility with existing code
    return response.data.data;
  },

  create: async (data: CreateSubKegiatanRBADto) => {
    const response = await apiClient.post<SubKegiatanRBA>('/subkegiatan-rba', data);
    return response.data;
  },

  update: async (id: string, data: UpdateSubKegiatanRBADto) => {
    const response = await apiClient.patch<SubKegiatanRBA>(`/subkegiatan-rba/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/subkegiatan-rba/${id}`);
  },
};

// Legacy alias for backward compatibility during migration
export const outputRBAApi = subKegiatanRBAApi;
