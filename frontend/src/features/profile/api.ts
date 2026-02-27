/**
 * Profile API Functions
 * All profile-related API calls
 */

import { apiClient } from '@/lib/api-client';
import type { UserProfile, UpdateProfileDto, ChangePasswordDto } from './types';

export const profileApi = {
  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/auth/profile');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateProfileDto): Promise<UserProfile> => {
    const response = await apiClient.patch<UserProfile>('/auth/profile', data);
    return response.data;
  },

  /**
   * Change user password
   */
  changePassword: async (data: ChangePasswordDto): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },
};