import { apiClient } from '@/lib/api-client';
import type {
  DPA,
  CreateDPADto,
  UpdateDPADto,
  GenerateDPAFromRBADto,
  QueryDPAParams,
  DPASummary,
  DPAHistory,
  PaginatedResponse,
} from './types';

const BASE_URL = '/dpa';

// List
export const getDPAList = async (
  params: QueryDPAParams
): Promise<PaginatedResponse<DPA>> => {
  const { data } = await apiClient.get(BASE_URL, { params });
  return data;
};

// Get active DPA for year
export const getActiveDPA = async (tahunAnggaran: number): Promise<DPA> => {
  const { data } = await apiClient.get(`${BASE_URL}/active/${tahunAnggaran}`);
  return data;
};

// Get by ID
export const getDPAById = async (id: string): Promise<DPA> => {
  const { data } = await apiClient.get(`${BASE_URL}/${id}`);
  return data;
};

// Get summary
export const getDPASummary = async (id: string): Promise<DPASummary> => {
  const { data } = await apiClient.get(`${BASE_URL}/${id}/summary`);
  return data;
};

// Get history
export const getDPAHistory = async (id: string): Promise<DPAHistory[]> => {
  const { data } = await apiClient.get(`${BASE_URL}/${id}/history`);
  return data;
};

// Create
export const createDPA = async (dto: CreateDPADto): Promise<DPA> => {
  const { data } = await apiClient.post(BASE_URL, dto);
  return data;
};

// Generate from RBA
export const generateDPAFromRBA = async (
  dto: GenerateDPAFromRBADto
): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/generate-from-rba`, dto);
  return data;
};

// Update
export const updateDPA = async (
  id: string,
  dto: UpdateDPADto
): Promise<DPA> => {
  const { data } = await apiClient.put(`${BASE_URL}/${id}`, dto);
  return data;
};

// Delete
export const deleteDPA = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};

// Workflow actions
export const submitDPA = async (id: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/submit`);
  return data;
};

export const approveDPA = async (
  id: string,
  catatan?: string
): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/approve`, {
    catatan,
  });
  return data;
};

export const rejectDPA = async (id: string, alasan: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/reject`, { alasan });
  return data;
};

export const activateDPA = async (id: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/activate`);
  return data;
};

export const recalculateDPATotals = async (id: string): Promise<DPA> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/recalculate`);
  return data;
};
