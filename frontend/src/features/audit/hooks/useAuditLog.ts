import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { auditApi } from '../services/auditApi';
import type { AuditFilter } from '../types/audit.types';

export const useAuditLogs = (filter: AuditFilter) =>
  useQuery({
    queryKey: ['audit-logs', filter],
    queryFn: () => auditApi.getLogs(filter),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });

export const useAuditStats = (dateFrom?: string, dateTo?: string) =>
  useQuery({
    queryKey: ['audit-stats', dateFrom, dateTo],
    queryFn: () => auditApi.getStats(dateFrom, dateTo),
    staleTime: 60_000,
  });

export const useAuditTimeline = (entityType: string, entityId: string) =>
  useQuery({
    queryKey: ['audit-timeline', entityType, entityId],
    queryFn: () => auditApi.getTimeline(entityType, entityId),
    enabled: !!entityType && !!entityId,
  });
