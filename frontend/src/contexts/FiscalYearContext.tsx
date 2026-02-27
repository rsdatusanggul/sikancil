import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@/lib/api-client';
import { useCurrentUser } from '@/features/auth';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface FiscalYear {
  id: string;
  tahun: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
  isCurrent: boolean;
  keterangan?: string;
}

interface FiscalYearContextType {
  activeFiscalYear: FiscalYear | null;
  fiscalYears: FiscalYear[];
  setActiveFiscalYear: (fiscalYear: FiscalYear) => Promise<void>;
  isLoading: boolean;
  error: Error | null;
}

const FiscalYearContext = createContext<FiscalYearContextType | undefined>(undefined);

export function FiscalYearProvider({ children }: { children: ReactNode }) {
  const [activeFiscalYear, setActiveFiscalYearState] = useState<FiscalYear | null>(null);
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const { isAuthenticated, activeFiscalYearId, setActiveFiscalYearId } = useAuthStore();

  // Fetch all available fiscal years - only when authenticated
  const { data: fiscalYears = [], isLoading, error } = useQuery({
    queryKey: ['fiscal-years'],
    queryFn: async () => {
      // Request all fiscal years with a high limit to get all records
      const response = await apiClient.get<{ data: FiscalYear[] }>('/fiscal-year', {
        params: {
          limit: 1000, // Get all fiscal years
        },
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // Guard query - only run when authenticated
  });

  // Set active fiscal year from auth store
  useEffect(() => {
    if (currentUser && fiscalYears.length > 0 && activeFiscalYearId) {
      // Get fiscal year from auth store's activeFiscalYearId
      const fiscalYear = fiscalYears.find((fy) => fy.id === activeFiscalYearId);
      if (fiscalYear) {
        setActiveFiscalYearState(fiscalYear);
        return; // Exit early if fiscal year is found
      }
      
      // Fallback: set to current fiscal year if no match found
      const currentFiscalYear = fiscalYears.find((fy) => fy.isCurrent);
      if (currentFiscalYear) {
        setActiveFiscalYearState(currentFiscalYear);
      } else if (fiscalYears.length > 0) {
        // Last resort: set to the first available fiscal year
        setActiveFiscalYearState(fiscalYears[0]);
      }
    }
  }, [currentUser, fiscalYears, activeFiscalYearId]);

  // Mutation to update active fiscal year
  const setActiveFiscalYearMutation = useMutation({
    mutationFn: async (fiscalYear: FiscalYear) => {
      const response = await apiClient.patch('/users/me/fiscal-year', {
        fiscalYearId: fiscalYear.id,
      });
      return response.data;
    },
    onSuccess: (_, fiscalYear) => {
      setActiveFiscalYearState(fiscalYear);
      // Persist to auth store for page refresh
      setActiveFiscalYearId(fiscalYear.id);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    },
  });

  const setActiveFiscalYear = async (fiscalYear: FiscalYear) => {
    await setActiveFiscalYearMutation.mutateAsync(fiscalYear);
  };

  const value = {
    activeFiscalYear,
    fiscalYears,
    setActiveFiscalYear,
    isLoading,
    error: error as Error | null,
  };

  return <FiscalYearContext.Provider value={value}>{children}</FiscalYearContext.Provider>;
}

export function useFiscalYear() {
  const context = useContext(FiscalYearContext);
  if (context === undefined) {
    throw new Error('useFiscalYear must be used within a FiscalYearProvider');
  }
  return context;
}