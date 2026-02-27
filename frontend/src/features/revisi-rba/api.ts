import { apiClient } from '@/lib/api-client';
import type {
  RevisiRBA,
  CreateRevisiRBADto,
  UpdateRevisiRBADto,
  ApproveRevisiDto,
  QueryRevisiRBAParams,
} from './types';

export const revisiRBAApi = {
  getAll: async (params?: QueryRevisiRBAParams) => {
    const response = await apiClient.get<RevisiRBA[]>('/revisi-rba', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<RevisiRBA>(`/revisi-rba/${id}`);
    return response.data;
  },

  getByRBA: async (rbaId: string) => {
    const response = await apiClient.get<RevisiRBA[]>(`/revisi-rba/by-rba/${rbaId}`);
    return response.data;
  },

  getPending: async () => {
    const response = await apiClient.get<RevisiRBA[]>('/revisi-rba/pending');
    return response.data;
  },

  create: async (data: CreateRevisiRBADto) => {
    const response = await apiClient.post<RevisiRBA>('/revisi-rba', data);
    return response.data;
  },

  update: async (id: string, data: UpdateRevisiRBADto) => {
    const response = await apiClient.patch<RevisiRBA>(`/revisi-rba/${id}`, data);
    return response.data;
  },

  approve: async (id: string, data: ApproveRevisiDto) => {
    const response = await apiClient.post<RevisiRBA>(`/revisi-rba/${id}/approve`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/revisi-rba/${id}`);
  },
};
