// Roles & Permissions API Client
// Note: Since backend doesn't have separate roles endpoint yet,
// this module works with the user roles system

import { apiClient } from '@/lib/api-client';
import type { Role, Permission, RolePermissionMatrix, UserRole } from './types';
import { DEFAULT_ROLE_PERMISSIONS, getRoleDisplayName } from './types';

const BASE_URL = '/users'; // Using users endpoint for now

export const rolesApi = {
  /**
   * Get all roles with their permissions
   * Note: This is a mock implementation until backend has roles endpoint
   */
  async getAllRoles(): Promise<Role[]> {
    // For now, return static role data based on UserRole enum
    // In future, this should call backend API: GET /roles

    const roles: Role[] = [
      {
        id: 'super_admin',
        name: 'super_admin' as UserRole,
        displayName: getRoleDisplayName('super_admin' as UserRole),
        description: 'Full system access with all permissions',
        permissions: [],
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'admin',
        name: 'admin' as UserRole,
        displayName: getRoleDisplayName('admin' as UserRole),
        description: 'Administrative access to manage users and settings',
        permissions: [],
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'kepala_blud',
        name: 'kepala_blud' as UserRole,
        displayName: getRoleDisplayName('kepala_blud' as UserRole),
        description: 'Head of BLUD with approval authority',
        permissions: [],
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'bendahara',
        name: 'bendahara' as UserRole,
        displayName: getRoleDisplayName('bendahara' as UserRole),
        description: 'Treasurer with financial transaction management',
        permissions: [],
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'staff_keuangan',
        name: 'staff_keuangan' as UserRole,
        displayName: getRoleDisplayName('staff_keuangan' as UserRole),
        description: 'Financial staff with limited access',
        permissions: [],
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'user',
        name: 'user' as UserRole,
        displayName: getRoleDisplayName('user' as UserRole),
        description: 'Basic user with read-only access',
        permissions: [],
        isSystem: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Get user counts for each role
    try {
      const usersResponse = await apiClient.get<any[]>(BASE_URL);
      const users = usersResponse.data;

      roles.forEach(role => {
        role.userCount = users.filter(u => u.role === role.name).length;
      });
    } catch (error) {
      console.warn('Failed to fetch user counts:', error);
    }

    return roles;
  },

  /**
   * Get role by ID
   */
  async getRoleById(id: string): Promise<Role> {
    const roles = await this.getAllRoles();
    const role = roles.find(r => r.id === id);
    if (!role) {
      throw new Error(`Role ${id} not found`);
    }
    return role;
  },

  /**
   * Get permission matrix for all roles
   */
  async getPermissionMatrix(): Promise<RolePermissionMatrix[]> {
    // For now, return default permission matrix
    // In future, this should call backend API: GET /roles/permissions
    return DEFAULT_ROLE_PERMISSIONS;
  },

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<any[]> {
    try {
      const response = await apiClient.get<any[]>(BASE_URL);
      return response.data.filter(u => u.role === role);
    } catch (error) {
      console.error('Failed to fetch users by role:', error);
      return [];
    }
  },

  /**
   * Get all permissions
   * Note: Mock implementation
   */
  async getAllPermissions(): Promise<Permission[]> {
    // This should eventually call backend: GET /permissions
    return [];
  },

  /**
   * Update role permissions
   * Note: Not implemented in backend yet
   */
  async updateRolePermissions(
    _roleId: string,
    _permissionIds: string[]
  ): Promise<Role> {
    throw new Error('Role permission updates not yet implemented in backend');
    // Future implementation:
    // const response = await apiClient.patch<Role>(`/roles/${roleId}/permissions`, {
    //   permissionIds,
    // });
    // return response.data;
  },
};
