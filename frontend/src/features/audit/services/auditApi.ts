import { apiClient } from '@/lib/api-client';
import type { AuditFilter, AuditLog, AuditLogResponse, AuditStats } from '../types/audit.types';

export const auditApi = {
  getLogs: (filter: AuditFilter): Promise<AuditLogResponse> => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        if (Array.isArray(v)) v.forEach(item => params.append(k, item));
        else params.set(k, String(v));
      }
    });
    return apiClient.get(`/audit/logs?${params}`).then(r => r.data);
  },

  getOne: (id: string): Promise<AuditLog> =>
    apiClient.get(`/audit/logs/${id}`).then(r => r.data),

  getTimeline: (entityType: string, entityId: string): Promise<AuditLog[]> =>
    apiClient.get(`/audit/timeline/${entityType}/${entityId}`).then(r => r.data),

  getStats: (dateFrom?: string, dateTo?: string): Promise<AuditStats> => {
    const params = new URLSearchParams();
    if (dateFrom) params.set('dateFrom', dateFrom);
    if (dateTo)   params.set('dateTo', dateTo);
    return apiClient.get(`/audit/stats?${params}`).then(r => r.data);
  },
};
