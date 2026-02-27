import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';
import type {
  QueryDPAParams,
  CreateDPADto,
  UpdateDPADto,
  GenerateDPAFromRBADto,
} from './types';

// Query keys
export const dpaKeys = {
  all: ['dpa'] as const,
  lists: () => [...dpaKeys.all, 'list'] as const,
  list: (params: QueryDPAParams) => [...dpaKeys.lists(), params] as const,
  details: () => [...dpaKeys.all, 'detail'] as const,
  detail: (id: string) => [...dpaKeys.details(), id] as const,
  summary: (id: string) => [...dpaKeys.all, 'summary', id] as const,
  history: (id: string) => [...dpaKeys.all, 'history', id] as const,
  active: (tahunAnggaran: number) =>
    [...dpaKeys.all, 'active', tahunAnggaran] as const,
};

// List
export const useDPAList = (params: QueryDPAParams) => {
  return useQuery({
    queryKey: dpaKeys.list(params),
    queryFn: () => api.getDPAList(params),
  });
};

// Active DPA
export const useActiveDPA = (tahunAnggaran: number, enabled = true) => {
  return useQuery({
    queryKey: dpaKeys.active(tahunAnggaran),
    queryFn: () => api.getActiveDPA(tahunAnggaran),
    enabled: !!tahunAnggaran && enabled,
  });
};

// Detail
export const useDPA = (id: string) => {
  return useQuery({
    queryKey: dpaKeys.detail(id),
    queryFn: () => api.getDPAById(id),
    enabled: !!id,
  });
};

// Summary
export const useDPASummary = (id: string) => {
  return useQuery({
    queryKey: dpaKeys.summary(id),
    queryFn: () => api.getDPASummary(id),
    enabled: !!id,
  });
};

// History
export const useDPAHistory = (id: string) => {
  return useQuery({
    queryKey: dpaKeys.history(id),
    queryFn: () => api.getDPAHistory(id),
    enabled: !!id,
  });
};

// Create
export const useCreateDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateDPADto) => api.createDPA(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Generate from RBA
export const useGenerateDPAFromRBA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: GenerateDPAFromRBADto) => api.generateDPAFromRBA(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Update
export const useUpdateDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateDPADto }) =>
      api.updateDPA(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Delete
export const useDeleteDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.deleteDPA(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

// Workflow mutations
export const useSubmitDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.submitDPA(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

export const useApproveDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan?: string }) =>
      api.approveDPA(id, catatan),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

export const useRejectDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, alasan }: { id: string; alasan: string }) =>
      api.rejectDPA(id, alasan),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};

export const useActivateDPA = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.activateDPA(id),
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: dpaKeys.active(data.tahunAnggaran),
      });
    },
  });
};

export const useRecalculateDPATotals = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.recalculateDPATotals(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: dpaKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.summary(id) });
      queryClient.invalidateQueries({ queryKey: dpaKeys.lists() });
    },
  });
};
