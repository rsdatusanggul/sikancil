import React, { useState, useCallback } from 'react';
import {
  Search, Filter, RefreshCw,
  Shield, AlertTriangle, Users, Activity, Clock,
  ChevronLeft, ChevronRight, Eye,
} from 'lucide-react';
import { useAuditLogs, useAuditStats } from '../hooks/useAuditLog';
import type { AuditFilter, AuditLog } from '../types/audit.types';
import { ACTION_CONFIG, ENTITY_LABELS, formatTimestamp, timeAgo } from '../utils/audit.utils';
import { AuditDetailDrawer } from '../components/AuditDetailDrawer';
import { AuditFilterPanel } from '../components/AuditFilterPanel';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/Table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const INITIAL_FILTER: AuditFilter = {
  page: 1,
  limit: 50,
};

export const ActivityLogPage: React.FC = () => {
  const [filter, setFilter]           = useState<AuditFilter>(INITIAL_FILTER);
  const [showFilter, setShowFilter]   = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const { data, isLoading, isFetching, refetch } = useAuditLogs(filter);
  const { data: stats } = useAuditStats();

  const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim();
      setFilter(f => ({ ...f, search: val || undefined, page: 1 }));
    }
  }, []);

  const handleFilter = useCallback((newFilter: Partial<AuditFilter>) => {
    setFilter(f => ({ ...f, ...newFilter, page: 1 }));
  }, []);

  const handlePage = (page: number) => setFilter(f => ({ ...f, page }));

  const activeFilterCount = Object.entries(filter).filter(([k, v]) => {
    if (k === 'page' || k === 'limit') return false;
    if (Array.isArray(v)) return v.length > 0;
    return v !== undefined && v !== '';
  }).length;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">Log Aktivitas</h1>
              <p className="text-sm text-muted-foreground">
                Riwayat seluruh aktivitas pengguna di sistem Si-Kancil
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="w-5 h-5 text-primary" />}
              bg="bg-primary/10"
              label="Total Aktivitas"
              value={stats.totalActivities.toLocaleString('id-ID')}
            />
            <StatCard
              icon={<Clock className="w-5 h-5 text-emerald-600" />}
              bg="bg-emerald-50"
              label="Hari Ini"
              value={stats.todayActivities.toLocaleString('id-ID')}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-blue-600" />}
              bg="bg-blue-50"
              label="Pengguna Aktif"
              value={stats.uniqueUsers.toLocaleString('id-ID')}
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5 text-destructive" />}
              bg="bg-destructive/10"
              label="Aktivitas Gagal"
              value={stats.failedActivities.toLocaleString('id-ID')}
              alert={stats.failedActivities > 0}
            />
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari nama pengguna, dokumen... (Enter)"
              className="pl-10"
              defaultValue={filter.search}
              onKeyDown={handleSearch}
            />
          </div>

          <Button
            type="button"
            variant={showFilter || activeFilterCount > 0 ? 'default' : 'outline'}
            onClick={() => setShowFilter(!showFilter)}
          >
            <Filter className="w-4 h-4" />
            Filter
            {activeFilterCount > 0 && (
              <Badge className="bg-background text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center p-0 ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setFilter(INITIAL_FILTER)}
            >
              Reset Filter
            </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <AuditFilterPanel filter={filter} onFilter={handleFilter} />
        )}

        {/* Table */}
        <Card elevation="flat" className="overflow-hidden">
          {/* Table Header Info */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <span className="text-sm text-muted-foreground">
              {isLoading ? 'Memuat...' : (
                <>
                  Menampilkan <strong>{data?.data.length ?? 0}</strong> dari{' '}
                  <strong>{data?.meta.total.toLocaleString('id-ID') ?? 0}</strong> aktivitas
                </>
              )}
            </span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Baris per halaman:</span>
              <Select
                value={String(filter.limit)}
                onValueChange={val => setFilter(f => ({ ...f, limit: Number(val), page: 1 }))}
              >
                <SelectTrigger className="h-8 w-[70px] text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[25, 50, 100, 200].map(n => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader className="bg-gray-100 dark:bg-gray-950">
              <TableRow className="hover:bg-gray-100 dark:hover:bg-gray-950">
                <TableHead className="text-base dark:text-gray-300">Waktu</TableHead>
                <TableHead className="text-base dark:text-gray-300">Pengguna</TableHead>
                <TableHead className="text-base dark:text-gray-300">Aksi</TableHead>
                <TableHead className="text-base dark:text-gray-300">Modul / Dokumen</TableHead>
                <TableHead className="text-base dark:text-gray-300">IP / Browser</TableHead>
                <TableHead className="text-base dark:text-gray-300">Status</TableHead>
                <TableHead className="text-base text-center dark:text-gray-300">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i} className="hover:bg-transparent">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow className="hover:bg-transparent bg-background">
                  <TableCell colSpan={7} className="py-12 text-center text-gray-600 dark:text-gray-400 text-sm">
                    Tidak ada aktivitas ditemukan
                  </TableCell>
                </TableRow>
              ) : data?.data.map(log => (
                <AuditTableRow
                  key={log.id}
                  log={log}
                  onSelect={() => setSelectedLog(log)}
                />
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data?.meta && data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-950">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Halaman {data.meta.page} dari {data.meta.totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePage(data.meta.page - 1)}
                  disabled={!data.meta.hasPrev}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                {Array.from({ length: Math.min(5, data.meta.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(data.meta.page - 2 + i, data.meta.totalPages));
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === data.meta.page ? 'default' : 'ghost'}
                      size="icon"
                      onClick={() => handlePage(pageNum)}
                      className="h-8 w-8 text-sm"
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handlePage(data.meta.page + 1)}
                  disabled={!data.meta.hasNext}
                  className="h-8 w-8"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Detail Drawer */}
      {selectedLog && (
        <AuditDetailDrawer
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

// ============================================================
// Sub-components
// ============================================================

const StatCard: React.FC<{
  icon: React.ReactNode;
  bg: string;
  label: string;
  value: string;
  alert?: boolean;
}> = ({ icon, bg, label, value, alert }) => (
  <Card elevation="flat" className={alert ? 'border-destructive/30' : ''}>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg}`}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className={`text-xl font-bold ${alert ? 'text-destructive' : 'text-foreground'}`}>
            {value}
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
);

const AuditTableRow: React.FC<{
  log: AuditLog;
  onSelect: () => void;
}> = ({ log, onSelect }) => {
  const actionCfg = ACTION_CONFIG[log.action] ?? {
    label: log.action, color: 'bg-gray-100', textColor: 'text-gray-600', icon: '•',
  };

  return (
    <TableRow className="group">
      {/* Waktu */}
      <TableCell className="py-3 whitespace-nowrap">
        <div className="text-foreground font-mono text-xs">
          {formatTimestamp(log.timestamp).split(', ')[1] ?? formatTimestamp(log.timestamp)}
        </div>
        <div className="text-muted-foreground text-xs mt-0.5">
          {formatTimestamp(log.timestamp).split(', ')[0]}
        </div>
        <div className="text-muted-foreground text-xs italic">{timeAgo(log.timestamp)}</div>
      </TableCell>

      {/* Pengguna */}
      <TableCell className="py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {log.userName?.charAt(0)?.toUpperCase() ?? '?'}
            </span>
          </div>
          <div>
            <div className="font-medium text-foreground text-xs leading-tight">
              {log.userName ?? 'System'}
            </div>
            <div className="text-muted-foreground text-xs">{log.userRole}</div>
          </div>
        </div>
      </TableCell>

      {/* Aksi */}
      <TableCell className="py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${actionCfg.color} ${actionCfg.textColor}`}>
          <span>{actionCfg.icon}</span>
          {actionCfg.label}
        </span>
      </TableCell>

      {/* Modul / Dokumen */}
      <TableCell className="py-3">
        {log.entityType ? (
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {ENTITY_LABELS[log.entityType] ?? log.entityType}
            </span>
            {log.entityLabel && (
              <div className="text-foreground text-xs mt-0.5 font-medium">{log.entityLabel}</div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        )}
      </TableCell>

      {/* IP / Browser */}
      <TableCell className="py-3">
        <div className="font-mono text-xs text-foreground">{log.ipAddress}</div>
        <div className="text-xs text-muted-foreground mt-0.5">
          {log.browserName} · {log.osName}
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3">
        <Badge
          variant={log.status === 'SUCCESS' ? 'success' : 'danger'}
          className="gap-1 text-xs"
        >
          <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'SUCCESS' ? 'bg-white' : 'bg-white'}`} />
          {log.status === 'SUCCESS' ? 'Berhasil' : 'Gagal'}
        </Badge>
      </TableCell>

      {/* Detail */}
      <TableCell className="py-3 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSelect}
          title="Lihat detail"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
