// Roles & Permissions Management Component
// View and manage role-based access control

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rolesApi } from './api';
import type { Role } from './types';
import { getModuleDisplayName, getActionDisplayName } from './types';
import {
  Users,
  Shield,
  Lock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function RolesPermissions() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [activeTab, setActiveTab] = useState<'roles' | 'permissions'>('roles');

  // Fetch roles
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getAllRoles(),
  });

  // Fetch permission matrix
  const {
    data: permissionMatrix,
    isLoading: matrixLoading,
  } = useQuery({
    queryKey: ['permission-matrix'],
    queryFn: () => rolesApi.getPermissionMatrix(),
  });

  const handleRoleClick = (role: Role) => {
    setSelectedRole(role);
  };

  if (rolesLoading || matrixLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles & permissions...</p>
        </div>
      </div>
    );
  }

  if (rolesError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Roles</h3>
            <p className="text-red-700 mt-1">
              {rolesError instanceof Error ? rolesError.message : 'Failed to load roles'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and access control</p>
        </div>
        <Shield className="w-8 h-8 text-blue-600" />
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium">Role-Based Access Control (RBAC)</p>
            <p className="text-blue-700 mt-1">
              Sistem menggunakan 6 role standar dengan permission matrix yang telah ditentukan.
              Backend API untuk custom roles akan segera tersedia.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('roles')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'roles'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Roles Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'permissions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              <span>Permission Matrix</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles List */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg divide-y">
              <div className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900">System Roles</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {roles?.length || 0} roles available
                </p>
              </div>
              <div className="divide-y">
                {roles?.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleClick(role)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors
                      ${selectedRole?.id === role.id ? 'bg-blue-50' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {role.displayName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {role.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {role.userCount || 0} users
                          </span>
                          {role.isSystem && (
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                              System
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Role Details */}
          <div className="lg:col-span-2">
            {selectedRole ? (
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedRole.displayName}
                      </h3>
                      <p className="text-gray-600 mt-1">{selectedRole.description}</p>
                    </div>
                    {selectedRole.isSystem && (
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                        System Role
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-gray-600">Users with this role</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {selectedRole.userCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Role Type</p>
                      <p className="text-lg font-medium text-gray-900 mt-1">
                        {selectedRole.isSystem ? 'System' : 'Custom'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Permissions</h4>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      Permission details will be available once the backend API is implemented.
                      See the <strong>Permission Matrix</strong> tab for default permissions.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-12">
                <div className="text-center text-gray-500">
                  <Shield className="w-12 h-12 mx-auto text-gray-300" />
                  <p className="mt-4">Select a role to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Default Permission Matrix</h3>
            <p className="text-sm text-gray-600 mt-1">
              Overview of permissions assigned to each role
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modules & Permissions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {permissionMatrix?.map((matrix) => (
                  <tr key={matrix.role}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {matrix.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {matrix.permissions.length > 0 ? (
                          matrix.permissions.slice(0, 3).map((perm, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-sm text-gray-700">
                                <strong>{getModuleDisplayName(perm.module)}:</strong>{' '}
                                {perm.actions.map(getActionDisplayName).join(', ')}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No permissions set</span>
                        )}
                        {matrix.permissions.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{matrix.permissions.length - 3} more modules...
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
