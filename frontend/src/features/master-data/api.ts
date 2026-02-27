// Master Data API Client
// Handles all API requests for master data modules

import { apiClient } from '@/lib/api-client';
import type {
  ChartOfAccount,
  UnitKerja,
  Pegawai,
  Supplier,
  BankAccount,
  FiscalYear,
} from './types';

// Chart of Accounts API
export const chartOfAccountsApi = {
  async getAll(): Promise<ChartOfAccount[]> {
    const response = await apiClient.get<ChartOfAccount[]>('/chart-of-accounts');
    return response.data;
  },

  async getById(id: string): Promise<ChartOfAccount> {
    const response = await apiClient.get<ChartOfAccount>(`/chart-of-accounts/${id}`);
    return response.data;
  },

  async create(data: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const response = await apiClient.post<ChartOfAccount>('/chart-of-accounts', data);
    return response.data;
  },

  async update(id: string, data: Partial<ChartOfAccount>): Promise<ChartOfAccount> {
    const response = await apiClient.patch<ChartOfAccount>(`/chart-of-accounts/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/chart-of-accounts/${id}`);
  },
};

// Unit Kerja API
export const unitKerjaApi = {
  async getAll(): Promise<UnitKerja[]> {
    const response = await apiClient.get<UnitKerja[]>('/unit-kerja');
    return response.data;
  },

  async getById(id: string): Promise<UnitKerja> {
    const response = await apiClient.get<UnitKerja>(`/unit-kerja/${id}`);
    return response.data;
  },

  async create(data: Partial<UnitKerja>): Promise<UnitKerja> {
    const response = await apiClient.post<UnitKerja>('/unit-kerja', data);
    return response.data;
  },

  async update(id: string, data: Partial<UnitKerja>): Promise<UnitKerja> {
    const response = await apiClient.patch<UnitKerja>(`/unit-kerja/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/unit-kerja/${id}`);
  },
};

// Pegawai API
export const pegawaiApi = {
  async getAll(): Promise<Pegawai[]> {
    const response = await apiClient.get<Pegawai[]>('/pegawai');
    return response.data;
  },

  async getById(id: string): Promise<Pegawai> {
    const response = await apiClient.get<Pegawai>(`/pegawai/${id}`);
    return response.data;
  },

  async create(data: Partial<Pegawai>): Promise<Pegawai> {
    const response = await apiClient.post<Pegawai>('/pegawai', data);
    return response.data;
  },

  async update(id: string, data: Partial<Pegawai>): Promise<Pegawai> {
    const response = await apiClient.patch<Pegawai>(`/pegawai/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/pegawai/${id}`);
  },
};

// Supplier API
export const supplierApi = {
  async getAll(): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>('/supplier');
    return response.data;
  },

  async getById(id: string): Promise<Supplier> {
    const response = await apiClient.get<Supplier>(`/supplier/${id}`);
    return response.data;
  },

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.post<Supplier>('/supplier', data);
    return response.data;
  },

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.patch<Supplier>(`/supplier/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/supplier/${id}`);
  },
};

// Bank Account API
export const bankAccountApi = {
  async getAll(): Promise<BankAccount[]> {
    const response = await apiClient.get<BankAccount[]>('/bank-account');
    return response.data;
  },

  async getById(id: string): Promise<BankAccount> {
    const response = await apiClient.get<BankAccount>(`/bank-account/${id}`);
    return response.data;
  },

  async create(data: Partial<BankAccount>): Promise<BankAccount> {
    const response = await apiClient.post<BankAccount>('/bank-account', data);
    return response.data;
  },

  async update(id: string, data: Partial<BankAccount>): Promise<BankAccount> {
    const response = await apiClient.patch<BankAccount>(`/bank-account/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/bank-account/${id}`);
  },
};

// Fiscal Year API
export const fiscalYearApi = {
  async getAll(): Promise<FiscalYear[]> {
    const response = await apiClient.get<FiscalYear[]>('/fiscal-year');
    return response.data;
  },

  async getById(id: string): Promise<FiscalYear> {
    const response = await apiClient.get<FiscalYear>(`/fiscal-year/${id}`);
    return response.data;
  },

  async create(data: Partial<FiscalYear>): Promise<FiscalYear> {
    const response = await apiClient.post<FiscalYear>('/fiscal-year', data);
    return response.data;
  },

  async update(id: string, data: Partial<FiscalYear>): Promise<FiscalYear> {
    const response = await apiClient.patch<FiscalYear>(`/fiscal-year/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/fiscal-year/${id}`);
  },

  async getActiveFiscalYear(): Promise<FiscalYear | null> {
    const years = await this.getAll();
    return years.find(y => y.isActive && !y.isClosed) || null;
  },
};

// Combined stats API for dashboard
export const masterDataStatsApi = {
  async getAllStats() {
    try {
      const [coa, units, employees, suppliers, banks, fiscalYears] = await Promise.all([
        chartOfAccountsApi.getAll().catch(() => []),
        unitKerjaApi.getAll().catch(() => []),
        pegawaiApi.getAll().catch(() => []),
        supplierApi.getAll().catch(() => []),
        bankAccountApi.getAll().catch(() => []),
        fiscalYearApi.getAll().catch(() => []),
      ]);

      return {
        chartOfAccounts: coa.length,
        unitKerja: units.length,
        pegawai: employees.length,
        supplier: suppliers.length,
        bankAccount: banks.length,
        fiscalYear: fiscalYears.length,
        total: coa.length + units.length + employees.length + suppliers.length + banks.length + fiscalYears.length,
      };
    } catch (error) {
      console.error('Error fetching master data stats:', error);
      return {
        chartOfAccounts: 0,
        unitKerja: 0,
        pegawai: 0,
        supplier: 0,
        bankAccount: 0,
        fiscalYear: 0,
        total: 0,
      };
    }
  },
};
