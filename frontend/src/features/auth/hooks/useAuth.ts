/**
 * Auth Hooks - Main authentication hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '../api';
import type { LoginCredentials, RegisterData } from '../types';

/**
 * Login mutation hook
 */
export const useLogin = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      // ✅ Update auth store (tokens are in httpOnly cookies)
      login(data.user, data.fiscalYear);

      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Navigate to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Login error:', error);
      // Error will be handled in the component
    },
  });
};

/**
 * Register mutation hook
 */
export const useRegister = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (data) => {
      // ✅ Update auth store (tokens are in httpOnly cookies)
      login(data.user);

      // Invalidate and refetch user profile
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Navigate to dashboard
      navigate('/dashboard');
    },
    onError: (error: any) => {
      console.error('Register error:', error);
      // Error will be handled in the component
    },
  });
};

/**
 * Get user profile query hook
 */
export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    enabled: isAuthenticated,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Logout mutation hook
 */
export const useLogout = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear auth store
      logout();

      // Clear all queries
      queryClient.clear();

      // Navigate to login
      navigate('/login');
    },
    onError: () => {
      // Even if API call fails, clear local state
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });
};

/**
 * Check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated;
};

/**
 * Get current user
 */
export const useCurrentUser = () => {
  const { user } = useAuthStore();
  return user;
};

/**
 * Check if user has specific role
 */
export const useHasRole = (roles: string | string[]) => {
  const { user } = useAuthStore();

  if (!user) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
};
