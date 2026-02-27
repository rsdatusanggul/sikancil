import { apiClient } from '@/lib/api-client';
import type {
  AnggaranKas,
  CreateAnggaranKasDto,
  UpdateAnggaranKasDto,
  QueryAnggaranKasParams,
  CashFlowProjection,
} from './rencana-anggaran-kas.types';

export const anggaranKasApi = {
  getAll: async (params?: QueryAnggaranKasParams) => {
    const response = await apiClient.get<AnggaranKas[]>('/rencana-anggaran-kas', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<AnggaranKas>(`/rencana-anggaran-kas/${id}`);
    return response.data;
  },

  getByYear: async (tahun: number) => {
    const response = await apiClient.get<AnggaranKas[]>(`/rencana-anggaran-kas/by-year/${tahun}`);
    return response.data;
  },

  getByMonth: async (tahun: number, bulan: number) => {
    const response = await apiClient.get<AnggaranKas[]>(`/rencana-anggaran-kas/by-month/${tahun}/${bulan}`);
    return response.data;
  },

  getTotalByType: async (tahun: number, bulan: number, jenisAnggaran: 'PENERIMAAN' | 'PENGELUARAN') => {
    const response = await apiClient.get<{ total: number }>(
      `/rencana-anggaran-kas/total/${tahun}/${bulan}/${jenisAnggaran}`
    );
    return response.data;
  },

  getCashFlowProjection: async (tahun: number) => {
    const response = await apiClient.get<CashFlowProjection[]>(`/rencana-anggaran-kas/cash-flow/${tahun}`);
    return response.data;
  },

  create: async (data: CreateAnggaranKasDto) => {
    const response = await apiClient.post<AnggaranKas>('/rencana-anggaran-kas', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAnggaranKasDto) => {
    const response = await apiClient.patch<AnggaranKas>(`/rencana-anggaran-kas/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/rencana-anggaran-kas/${id}`);
  },
};
