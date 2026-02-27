import { useQuery } from '@tanstack/react-query';
import { rakApi } from '../services/rakApi';
import type { RakQueryParams } from '../types/rak.types';

// Query Keys
export const rakKeys = {
  all: ['rak'] as const,
  lists: () => [...rakKeys.all, 'list'] as const,
  list: (params: RakQueryParams) => [...rakKeys.lists(), params] as const,
  details: () => [...rakKeys.all, 'detail'] as const,
  detail: (id: string) => [...rakKeys.details(), id] as const,
};

// GET all RAK
export function useRakList(params: RakQueryParams) {
  return useQuery({
    queryKey: rakKeys.list(params),
    queryFn: () => rakApi.getAll(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// GET RAK by ID
export function useRak(id: string) {
  return useQuery({
    queryKey: rakKeys.detail(id),
    queryFn: () => rakApi.getById(id),
    enabled: !!id,
  });
}

// GET RAK details
export function useRakDetails(id: string) {
  return useQuery({
    queryKey: [...rakKeys.detail(id), 'details'],
    queryFn: () => rakApi.getDetails(id),
    enabled: !!id,
  });
}

// GET by Subkegiatan & Tahun
export function useRakBySubkegiatanAndTahun(subkegiatanId: string, tahun: number) {
  return useQuery({
    queryKey: [...rakKeys.all, 'subkegiatan', subkegiatanId, 'tahun', tahun],
    queryFn: () => rakApi.getBySubkegiatanAndTahun(subkegiatanId, tahun),
    enabled: !!subkegiatanId && !!tahun,
  });
}