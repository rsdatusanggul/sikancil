# Roles & Permissions Module

Role-based access control (RBAC) management module for Si-Kancil.

## 📋 Overview

This module provides a centralized interface for managing user roles and their associated permissions. It displays the permission matrix and allows administrators to view role assignments.

## 🎯 Features

- **Role Overview**: View all system roles with user counts
- **Permission Matrix**: Visual representation of role-permission mappings
- **User Assignment**: See which users are assigned to each role
- **System Roles**: 6 predefined roles for BLUD operations

## 📁 File Structure

```
roles-permissions/
├── RolesPermissions.tsx    # Main component with tabs UI
├── api.ts                  # API client (mock implementation)
├── types.ts                # TypeScript interfaces & enums
├── index.ts                # Module exports
└── README.md               # This file
```

## 🔑 Roles

1. **Super Admin** - Full system access
2. **Admin** - Administrative access for user/settings management
3. **Kepala BLUD** - Head of BLUD with approval authority
4. **Bendahara** - Treasurer with financial transaction management
5. **Staff Keuangan** - Financial staff with limited access
6. **User** - Basic user with read-only access

## 🔐 Permission Modules

The system defines permissions across these modules:

- Dashboard
- Users & Roles
- Program RBA, Kegiatan RBA, Output RBA
- Anggaran Kas
- Pendapatan & Belanja
- SPP, SPM, SP2D
- BKU & Jurnal
- Laporan Keuangan
- Master Data
- Settings

## 📊 Permission Actions

Each module can have the following actions:
- `CREATE` - Create new records
- `READ` - View records
- `UPDATE` - Edit existing records
- `DELETE` - Remove records
- `APPROVE` - Approve transactions
- `REJECT` - Reject transactions
- `EXPORT` - Export data
- `PRINT` - Print reports

## 🔌 Backend Integration

**Current Status**: ⚠️ Mock Implementation

The backend does not yet have a dedicated `/roles` endpoint. Currently:
- Roles are defined as enums in the User entity
- Permission management is not yet implemented
- This module uses mock data from `DEFAULT_ROLE_PERMISSIONS`

**Future Backend API** (when implemented):
```
GET    /roles                      # Get all roles
GET    /roles/:id                  # Get role by ID
GET    /roles/permissions          # Get permission matrix
PATCH  /roles/:id/permissions      # Update role permissions
GET    /roles/:roleId/users        # Get users by role
```

## 📖 Usage

### In Routes
```tsx
import RolesPermissions from '@/features/roles-permissions';

{
  path: 'roles',
  element: (
    <ProtectedRoute requiredRoles={['super_admin', 'admin']}>
      <RolesPermissions />
    </ProtectedRoute>
  ),
}
```

### API Usage
```tsx
import { rolesApi } from '@/features/roles-permissions';

// Get all roles with user counts
const roles = await rolesApi.getAllRoles();

// Get permission matrix
const matrix = await rolesApi.getPermissionMatrix();

// Get users by role
const users = await rolesApi.getUsersByRole('bendahara');
```

## 🎨 UI Components

### Tabs
- **Roles Overview**: List of all roles with details
- **Permission Matrix**: Table showing role-permission mappings

### Features
- Role selection with detail view
- User count per role
- System role indicators
- Permission visualization

## ✅ Implementation Checklist

- [x] Types & interfaces defined
- [x] API client (mock implementation)
- [x] Main component with tabs
- [x] Role list view
- [x] Role detail view
- [x] Permission matrix view
- [x] Route added
- [x] Protected route (admin only)
- [ ] Backend API integration (pending)
- [ ] Edit role permissions (pending backend)
- [ ] Create custom roles (pending backend)

## 🚀 Next Steps

1. Wait for backend `/roles` API implementation
2. Implement actual role CRUD operations
3. Add permission assignment UI
4. Add role creation/editing forms
5. Implement permission checks in other modules
6. Add audit trail for role changes

## 📝 Notes

- This module currently works with the existing User role system
- All 6 roles are system roles and cannot be deleted
- Permission matrix is hardcoded in `types.ts`
- Once backend API is ready, update `api.ts` to use real endpoints

---

**Last Updated**: 2026-02-15
**Status**: ✅ Complete (Phase 1 - View Only)
**Backend**: ⏳ Pending
