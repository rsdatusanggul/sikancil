// Roles & Permissions Module Types
// Role-based access control (RBAC) management

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  KEPALA_BLUD = 'kepala_blud',
  BENDAHARA = 'bendahara',
  STAFF_KEUANGAN = 'staff_keuangan',
  USER = 'user',
}

export enum PermissionModule {
  DASHBOARD = 'dashboard',
  USERS = 'users',
  ROLES = 'roles',
  PROGRAM_RBA = 'program_rba',
  KEGIATAN_RBA = 'kegiatan_rba',
  OUTPUT_RBA = 'output_rba',
  ANGGARAN_KAS = 'anggaran_kas',
  PENDAPATAN = 'pendapatan',
  BELANJA = 'belanja',
  SPP = 'spp',
  SPM = 'spm',
  SP2D = 'sp2d',
  BKU = 'bku',
  JURNAL = 'jurnal',
  LAPORAN = 'laporan',
  MASTER_DATA = 'master_data',
  SETTINGS = 'settings',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  APPROVE = 'approve',
  REJECT = 'reject',
  EXPORT = 'export',
  PRINT = 'print',
}

export interface Permission {
  id: string;
  module: PermissionModule;
  action: PermissionAction;
  name: string;
  description?: string;
}

export interface RolePermission {
  roleId: string;
  permissionId: string;
  granted: boolean;
}

export interface Role {
  id: string;
  name: UserRole;
  displayName: string;
  description?: string;
  permissions: Permission[];
  userCount?: number;
  isSystem?: boolean; // System roles cannot be deleted
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RolePermissionMatrix {
  role: UserRole;
  displayName: string;
  permissions: {
    module: PermissionModule;
    actions: PermissionAction[];
  }[];
}

// Helper function to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const names: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: 'Super Admin',
    [UserRole.ADMIN]: 'Admin',
    [UserRole.KEPALA_BLUD]: 'Kepala BLUD',
    [UserRole.BENDAHARA]: 'Bendahara',
    [UserRole.STAFF_KEUANGAN]: 'Staff Keuangan',
    [UserRole.USER]: 'User',
  };
  return names[role] || role;
}

// Helper function to get module display name
export function getModuleDisplayName(module: PermissionModule): string {
  const names: Record<PermissionModule, string> = {
    [PermissionModule.DASHBOARD]: 'Dashboard',
    [PermissionModule.USERS]: 'Manajemen User',
    [PermissionModule.ROLES]: 'Manajemen Role',
    [PermissionModule.PROGRAM_RBA]: 'Program RBA',
    [PermissionModule.KEGIATAN_RBA]: 'Kegiatan RBA',
    [PermissionModule.OUTPUT_RBA]: 'Output RBA',
    [PermissionModule.ANGGARAN_KAS]: 'Anggaran Kas',
    [PermissionModule.PENDAPATAN]: 'Pendapatan',
    [PermissionModule.BELANJA]: 'Belanja',
    [PermissionModule.SPP]: 'SPP',
    [PermissionModule.SPM]: 'SPM',
    [PermissionModule.SP2D]: 'SP2D',
    [PermissionModule.BKU]: 'BKU',
    [PermissionModule.JURNAL]: 'Jurnal',
    [PermissionModule.LAPORAN]: 'Laporan Keuangan',
    [PermissionModule.MASTER_DATA]: 'Master Data',
    [PermissionModule.SETTINGS]: 'Pengaturan',
  };
  return names[module] || module;
}

// Helper function to get action display name
export function getActionDisplayName(action: PermissionAction): string {
  const names: Record<PermissionAction, string> = {
    [PermissionAction.CREATE]: 'Tambah',
    [PermissionAction.READ]: 'Lihat',
    [PermissionAction.UPDATE]: 'Ubah',
    [PermissionAction.DELETE]: 'Hapus',
    [PermissionAction.APPROVE]: 'Setujui',
    [PermissionAction.REJECT]: 'Tolak',
    [PermissionAction.EXPORT]: 'Export',
    [PermissionAction.PRINT]: 'Cetak',
  };
  return names[action] || action;
}

// Default permission matrix for each role
export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix[] = [
  {
    role: UserRole.SUPER_ADMIN,
    displayName: 'Super Admin',
    permissions: [
      { module: PermissionModule.DASHBOARD, actions: [PermissionAction.READ] },
      {
        module: PermissionModule.USERS,
        actions: [
          PermissionAction.CREATE,
          PermissionAction.READ,
          PermissionAction.UPDATE,
          PermissionAction.DELETE,
        ],
      },
      {
        module: PermissionModule.ROLES,
        actions: [
          PermissionAction.CREATE,
          PermissionAction.READ,
          PermissionAction.UPDATE,
          PermissionAction.DELETE,
        ],
      },
      // All other modules - full access
    ],
  },
  {
    role: UserRole.KEPALA_BLUD,
    displayName: 'Kepala BLUD',
    permissions: [
      { module: PermissionModule.DASHBOARD, actions: [PermissionAction.READ] },
      {
        module: PermissionModule.LAPORAN,
        actions: [PermissionAction.READ, PermissionAction.EXPORT, PermissionAction.PRINT],
      },
      {
        module: PermissionModule.SPP,
        actions: [PermissionAction.APPROVE, PermissionAction.REJECT],
      },
      {
        module: PermissionModule.SPM,
        actions: [PermissionAction.APPROVE, PermissionAction.REJECT],
      },
    ],
  },
  {
    role: UserRole.BENDAHARA,
    displayName: 'Bendahara',
    permissions: [
      { module: PermissionModule.DASHBOARD, actions: [PermissionAction.READ] },
      {
        module: PermissionModule.SPP,
        actions: [
          PermissionAction.CREATE,
          PermissionAction.READ,
          PermissionAction.UPDATE,
          PermissionAction.DELETE,
        ],
      },
      {
        module: PermissionModule.BKU,
        actions: [
          PermissionAction.CREATE,
          PermissionAction.READ,
          PermissionAction.UPDATE,
        ],
      },
      {
        module: PermissionModule.PENDAPATAN,
        actions: [
          PermissionAction.CREATE,
          PermissionAction.READ,
          PermissionAction.UPDATE,
        ],
      },
    ],
  },
  {
    role: UserRole.STAFF_KEUANGAN,
    displayName: 'Staff Keuangan',
    permissions: [
      { module: PermissionModule.DASHBOARD, actions: [PermissionAction.READ] },
      {
        module: PermissionModule.PROGRAM_RBA,
        actions: [
          PermissionAction.CREATE,
          PermissionAction.READ,
          PermissionAction.UPDATE,
        ],
      },
      {
        module: PermissionModule.JURNAL,
        actions: [PermissionAction.CREATE, PermissionAction.READ],
      },
    ],
  },
];
