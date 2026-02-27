import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, FiscalYear } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  lastActivity: number | null;
  activeFiscalYearId: string | null;
  
  // ✅ REMOVED: accessToken, refreshToken - now in httpOnly cookies
  
  login: (user: User, fiscalYear?: FiscalYear) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  updateLastActivity: () => void;
  setActiveFiscalYearId: (id: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      lastActivity: null,
      activeFiscalYearId: null,

      login: (user: User, fiscalYear?: FiscalYear) => {
        // ✅ NO TOKEN STORAGE - tokens are in httpOnly cookies
        set({
          user,
          isAuthenticated: true,
          lastActivity: Date.now(),
          activeFiscalYearId: fiscalYear?.id || null,
        });
      },

      logout: () => {
        // ✅ NO TOKEN REMOVAL - backend clears cookies
        set({
          user: null,
          isAuthenticated: false,
          lastActivity: null,
          activeFiscalYearId: null,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },

      setActiveFiscalYearId: (id: string | null) => {
        set({ activeFiscalYearId: id });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        lastActivity: state.lastActivity,
        activeFiscalYearId: state.activeFiscalYearId,
        // ✅ REMOVED: accessToken, refreshToken from persistence
      }),
    }
  )
);

// ✅ Session timeout remains the same
export const initializeSessionTimeout = (callback: () => void) => {
  const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  const checkTimeout = () => {
    const { lastActivity, isAuthenticated } = useAuthStore.getState();

    if (!isAuthenticated || !lastActivity) {
      return;
    }

    const elapsed = Date.now() - lastActivity;
    if (elapsed >= TIMEOUT_DURATION) {
      callback();
    }
  };

  const intervalId = setInterval(checkTimeout, 60000); // Check every minute
  return () => clearInterval(intervalId);
};