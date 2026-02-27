/**
 * Auth API Functions
 * All authentication-related API calls
 */

import { apiClient } from '@/lib/api-client';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from './types';

export const authApi = {
  /**
   * Login user with username and password
   */
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterData) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      data
    );
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await apiClient.get<User>('/auth/profile');
    return response.data;
  },

  /**
   * Logout user (optional - can also just clear local storage)
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Ignore logout errors, we'll clear local storage anyway
      console.error('Logout error:', error);
    }
  },
};
