// User API Client
// Handles all API requests for user management

import { apiClient } from '@/lib/api-client';
import type { User, CreateUserDto, UpdateUserDto } from './types';

const BASE_URL = '/users';

export const usersApi = {
  /**
   * Get all users
   */
  async getAll(): Promise<User[]> {
    const response = await apiClient.get<User[]>(BASE_URL);
    return response.data;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    const response = await apiClient.get<User>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create new user
   */
  async create(data: CreateUserDto): Promise<User> {
    const response = await apiClient.post<User>(BASE_URL, data);
    return response.data;
  },

  /**
   * Update existing user
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await apiClient.patch<User>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  /**
   * Activate user
   */
  async activate(id: string): Promise<User> {
    const response = await apiClient.patch<User>(`${BASE_URL}/${id}`, {
      status: 'active',
    });
    return response.data;
  },

  /**
   * Deactivate user
   */
  async deactivate(id: string): Promise<User> {
    const response = await apiClient.patch<User>(`${BASE_URL}/${id}`, {
      status: 'inactive',
    });
    return response.data;
  },

  /**
   * Suspend user
   */
  async suspend(id: string): Promise<User> {
    const response = await apiClient.patch<User>(`${BASE_URL}/${id}`, {
      status: 'suspended',
    });
    return response.data;
  },
};
