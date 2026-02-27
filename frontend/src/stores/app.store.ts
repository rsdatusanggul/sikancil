import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  currentFiscalYear: number;
  toggleSidebar: () => void;
  setFiscalYear: (year: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  currentFiscalYear: new Date().getFullYear(),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setFiscalYear: (year) => set({ currentFiscalYear: year }),
}));
