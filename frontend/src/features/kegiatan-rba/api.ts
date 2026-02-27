import { apiClient } from '@/lib/api-client';
import type {
  KegiatanRBA,
  CreateKegiatanRBADto,
  UpdateKegiatanRBADto,
  QueryKegiatanRBAParams,
  PaginatedKegiatanRBAResponse,
} from './types';

export const kegiatanRBAApi = {
  getAll: async (params?: QueryKegiatanRBAParams) => {
    const response = await apiClient.get<PaginatedKegiatanRBAResponse>('/kegiatan-rba', { params });
    return response.data;
  },

  getAvailableYears: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/kegiatan-rba/years');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<KegiatanRBA>(`/kegiatan-rba/${id}`);
    return response.data;
  },

  getByProgram: async (programId: string) => {
    const response = await apiClient.get<KegiatanRBA[]>(`/kegiatan-rba/by-program/${programId}`);
    return response.data;
  },

  create: async (data: CreateKegiatanRBADto) => {
    const response = await apiClient.post<KegiatanRBA>('/kegiatan-rba', data);
    return response.data;
  },

  update: async (id: string, data: UpdateKegiatanRBADto) => {
    const response = await apiClient.patch<KegiatanRBA>(`/kegiatan-rba/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/kegiatan-rba/${id}`);
  },

  getPaguInfo: async (id: string) => {
    const response = await apiClient.get<{
      kegiatanId: string;
      kodeKegiatan: string;
      namaKegiatan: string;
      tahun: number;
      paguAnggaran: number;
      paguTerpakai: number;
      sisaPagu: number;
      jumlahSubKegiatanAktif: number;
      persentasePenggunaan: number;
    }>(`/kegiatan-rba/${id}/pagu-info`);
    return response.data;
  },
};
