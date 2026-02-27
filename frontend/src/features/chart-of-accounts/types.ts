export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export interface ChartOfAccount {
  id: string;
  kodeRekening: string;
  namaRekening: string;
  jenisAkun: AccountType;
  level: number; // 1-5
  parentKode: string | null;
  isActive: boolean;
  isHeader: boolean; // True if header account (not for posting)
  deskripsi: string | null;
  normalBalance: 'DEBIT' | 'CREDIT';
  isBudgetControl: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryChartOfAccountParams {
  search?: string;
  jenisAkun?: AccountType;
  level?: number;
  isActive?: boolean;
  isHeader?: boolean;
  parentKode?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedChartOfAccountsResponse {
  data: ChartOfAccount[];
  meta: PaginationMeta;
}
