export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'TOKEN_REFRESH'
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'EXPORT'
  | 'APPROVE' | 'REJECT' | 'SUBMIT' | 'REVISE' | 'CANCEL' | 'VERIFY'
  | 'UNAUTHORIZED' | 'FORBIDDEN' | 'PASSWORD_CHANGE' | 'LOCK_ACCOUNT';

export type AuditStatus = 'SUCCESS' | 'FAILED';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userNip: string;
  userRole: string;
  unitKerja: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  entityLabel: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changedFields?: string[];
  reason?: string;
  status: AuditStatus;
  errorMessage?: string;
  ipAddress: string;
  userAgent: string;
  browserName: string;
  osName: string;
  timestamp: string;
}

export interface AuditLogMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AuditLogResponse {
  data: AuditLog[];
  meta: AuditLogMeta;
}

export interface AuditStats {
  totalActivities: number;
  failedActivities: number;
  uniqueUsers: number;
  todayActivities: number;
  actionBreakdown: { action: AuditAction; count: number }[];
}

export interface AuditFilter {
  userId?: string;
  actions?: AuditAction[];
  entityTypes?: string[];
  status?: AuditStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}
