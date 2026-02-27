import { apiClient } from '@/lib/api-client';
import type {
  ChartOfAccount,
  QueryChartOfAccountParams,
  PaginatedChartOfAccountsResponse
} from './types';

export const chartOfAccountApi = {
  // GET all chart of accounts with filtering
  getAll: async (params?: QueryChartOfAccountParams) => {
    const response = await apiClient.get<PaginatedChartOfAccountsResponse>('/chart-of-accounts', { params });
    return response.data;
  },

  // GET detail accounts only (for transactions/RAK)
  getDetailAccounts: async () => {
    const response = await apiClient.get<ChartOfAccount[]>('/chart-of-accounts/detail');
    return response.data;
  },

  // GET hierarchy tree
  getHierarchy: async () => {
    const response = await apiClient.get<any[]>('/chart-of-accounts/hierarchy');
    return response.data;
  },

  // GET by kodeRekening
  getByCode: async (kodeRekening: string) => {
    const response = await apiClient.get<ChartOfAccount>(`/chart-of-accounts/by-code/${kodeRekening}`);
    return response.data;
  },

  // GET by ID
  getById: async (id: string) => {
    const response = await apiClient.get<ChartOfAccount>(`/chart-of-accounts/${id}`);
    return response.data;
  },
};
