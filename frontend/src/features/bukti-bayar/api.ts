import { apiClient } from '@/lib/api-client';
import type {
  BuktiBayar,
  CreateBuktiBayarDto,
  UpdateBuktiBayarDto,
  QueryBuktiBayarParams,
  ApproveTechnicalDto,
  ApproveTreasurerDto,
  ApproveFinalDto,
  RejectBuktiBayarDto,
  TaxPreview,
  BudgetCheck,
  PaginatedResponse,
  BuktiBayarSummary,
  KodeRekeningSearchResult,
} from './types';

const BASE_URL = '/payment-vouchers';

// List
export const getBuktiBayarList = async (
  params: QueryBuktiBayarParams
): Promise<PaginatedResponse<BuktiBayar>> => {
  const { data } = await apiClient.get(BASE_URL, { params });
  return data;
};

// Get summary stats
export const getBuktiBayarSummary = async (
  fiscalYear?: number,
  month?: number
): Promise<BuktiBayarSummary> => {
  const { data } = await apiClient.get(`${BASE_URL}/summary`, {
    params: { fiscalYear, month },
  });
  return data;
};

// Get by ID
export const getBuktiBayarById = async (id: string): Promise<BuktiBayar> => {
  const { data } = await apiClient.get(`${BASE_URL}/${id}`);
  return data;
};

// Create
export const createBuktiBayar = async (
  dto: CreateBuktiBayarDto
): Promise<BuktiBayar> => {
  const { data } = await apiClient.post(BASE_URL, dto);
  return data;
};

// Update
export const updateBuktiBayar = async (
  id: string,
  dto: UpdateBuktiBayarDto
): Promise<BuktiBayar> => {
  const { data } = await apiClient.put(`${BASE_URL}/${id}`, dto);
  return data;
};

// Delete
export const deleteBuktiBayar = async (id: string): Promise<void> => {
  await apiClient.delete(`${BASE_URL}/${id}`);
};

// Workflow actions
export const submitBuktiBayar = async (id: string): Promise<BuktiBayar> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/submit`);
  return data;
};

export const approveBuktiBayarTechnical = async (
  id: string,
  dto: ApproveTechnicalDto
): Promise<BuktiBayar> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/approve-technical`, dto);
  return data;
};

export const approveBuktiBayarTreasurer = async (
  id: string,
  dto: ApproveTreasurerDto
): Promise<BuktiBayar> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/approve-treasurer`, dto);
  return data;
};

export const approveBuktiBayarFinal = async (
  id: string,
  dto: ApproveFinalDto
): Promise<BuktiBayar> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/approve-final`, dto);
  return data;
};

export const rejectBuktiBayar = async (
  id: string,
  dto: RejectBuktiBayarDto
): Promise<BuktiBayar> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/reject`, dto);
  return data;
};

// Create SPP from approved Bukti Bayar
export const createSppFromBuktiBayar = async (id: string): Promise<any> => {
  const { data } = await apiClient.post(`${BASE_URL}/${id}/create-spp`);
  return data;
};

// Print PDF
export const printBuktiBayar = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(`${BASE_URL}/${id}/print`, {
    responseType: 'blob',
  });
  return response.data;
};

// Tax preview
export const getTaxPreview = async (
  accountCode: string,
  grossAmount: number,
  vendorNpwp?: string
): Promise<TaxPreview> => {
  const { data } = await apiClient.get(`${BASE_URL}/tax-preview`, {
    params: { accountCode, grossAmount, vendorNpwp },
  });
  return data;
};

// Budget check
export const getBudgetCheck = async (
  kegiatanId: string,
  accountCode: string,
  fiscalYear: number,
  month: number
): Promise<BudgetCheck> => {
  const { data } = await apiClient.get(`${BASE_URL}/budget-check`, {
    params: { kegiatanId, accountCode, fiscalYear, month },
  });
  return data;
};

// Search kode rekening (autocomplete)
export const searchKodeRekening = async (
  query: string
): Promise<KodeRekeningSearchResult[]> => {
  const { data } = await apiClient.get(`${BASE_URL}/search-kode-rekening`, {
    params: { q: query },
  });
  return data;
};
