import { useQuery } from '@tanstack/react-query';
import { chartOfAccountApi } from './api';
import type { QueryChartOfAccountParams } from './types';

export const useChartOfAccounts = (params?: QueryChartOfAccountParams) => {
  return useQuery({
    queryKey: ['chart-of-accounts', params],
    queryFn: () => chartOfAccountApi.getAll(params),
  });
};

export const useDetailAccounts = () => {
  return useQuery({
    queryKey: ['chart-of-accounts', 'detail'],
    queryFn: () => chartOfAccountApi.getDetailAccounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes - COA doesn't change frequently
  });
};

export const useAccountHierarchy = () => {
  return useQuery({
    queryKey: ['chart-of-accounts', 'hierarchy'],
    queryFn: () => chartOfAccountApi.getHierarchy(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
