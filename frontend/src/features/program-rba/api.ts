import { apiClient } from '@/lib/api-client';
import type { ProgramRBA, CreateProgramRBADto, UpdateProgramRBADto } from './types';

interface ProgramRBAResponse {
  data: ProgramRBA[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProgramPaguInfo {
  programId: string;
  kodeProgram: string;
  namaProgram: string;
  tahun: number;
  paguAnggaran: number;
  paguTerpakai: number;
  sisaPagu: number;
  jumlahKegiatanAktif: number;
  persentasePenggunaan: number;
}

export const programRBAApi = {
  getAll: async (tahun?: number, showInactive = false) => {
    const params: any = {};
    if (tahun !== undefined) {
      params.tahun = tahun;
    }
    // Only set isActive filter if we want to show only active records (default behavior)
    if (!showInactive) {
      params.isActive = true;
    }
    const response = await apiClient.get<ProgramRBAResponse>('/program-rba', { params });
    // Backend returns { data: [...], total, page, ... }, we need only data array
    return response.data.data;
  },

  getAvailableYears: async (): Promise<number[]> => {
    const response = await apiClient.get<number[]>('/program-rba/years');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ProgramRBA>(`/program-rba/${id}`);
    return response.data;
  },

  create: async (data: CreateProgramRBADto) => {
    const response = await apiClient.post<ProgramRBA>('/program-rba', data);
    return response.data;
  },

  update: async (id: string, data: UpdateProgramRBADto) => {
    const response = await apiClient.patch<ProgramRBA>(`/program-rba/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/program-rba/${id}`);
  },

  getPaguInfo: async (id: string) => {
    const response = await apiClient.get<ProgramPaguInfo>(`/program-rba/${id}/pagu-info`);
    return response.data;
  },
};
