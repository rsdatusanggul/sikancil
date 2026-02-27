import React from 'react';
import { User, Clock, Monitor, FileText } from 'lucide-react';
import type { AuditLog } from '../types/audit.types';
import { ACTION_CONFIG, ENTITY_LABELS, formatTimestamp } from '../utils/audit.utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/ui/Alert';
import { Separator } from '@/components/ui/separator';

interface Props {
  log: AuditLog;
  onClose: () => void;
}

export const AuditDetailDrawer: React.FC<Props> = ({ log, onClose }) => {
  const actionCfg = ACTION_CONFIG[log.action] ?? {
    label: log.action, icon: '•', color: 'bg-gray-100', textColor: 'text-gray-600',
  };

  return (
    <Sheet open onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent side="right" className="flex flex-col p-0">
        {/* Header */}
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${actionCfg.color} ${actionCfg.textColor}`}>
              {actionCfg.icon} {actionCfg.label}
            </span>
          </SheetTitle>
          <SheetCloseButton />
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Banner */}
          {log.status === 'FAILED' && (
            <Alert variant="danger" title="Aktivitas Gagal">
              {log.errorMessage || 'Tidak ada pesan error'}
            </Alert>
          )}

          {/* Pengguna */}
          <Section icon={<User className="w-4 h-4" />} title="Pengguna">
            <InfoRow label="Nama"       value={log.userName || '—'} />
            <InfoRow label="NIP"        value={log.userNip || '—'} />
            <InfoRow label="Role"       value={log.userRole || '—'} />
            <InfoRow label="Unit Kerja" value={log.unitKerja || '—'} />
          </Section>

          <Separator />

          {/* Waktu */}
          <Section icon={<Clock className="w-4 h-4" />} title="Waktu">
            <InfoRow label="Timestamp" value={formatTimestamp(log.timestamp)} mono />
            <InfoRow label="Log ID"    value={log.id} mono small />
          </Section>

          {/* Dokumen */}
          {log.entityType && (
            <>
              <Separator />
              <Section icon={<FileText className="w-4 h-4" />} title="Dokumen Terkait">
                <InfoRow label="Modul"   value={ENTITY_LABELS[log.entityType] ?? log.entityType} />
                <InfoRow label="Dokumen" value={log.entityLabel || '—'} />
                <InfoRow label="ID"      value={log.entityId || '—'} mono small />
                {log.reason && <InfoRow label="Alasan" value={log.reason} />}
              </Section>
            </>
          )}

          {/* Perubahan */}
          {(log.oldValue || log.newValue) && (
            <>
              <Separator />
              <Section icon={<FileText className="w-4 h-4" />} title="Perubahan Data">
                {log.changedFields && log.changedFields.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1.5">Field yang berubah:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {log.changedFields.map(f => (
                        <Badge key={f} variant="warning" className="text-xs">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {log.oldValue && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Sebelum</p>
                      <pre className="text-xs bg-red-50 text-red-800 p-3 rounded-lg overflow-auto max-h-40 font-mono">
                        {JSON.stringify(log.oldValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.newValue && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1.5">Sesudah</p>
                      <pre className="text-xs bg-emerald-50 text-emerald-800 p-3 rounded-lg overflow-auto max-h-40 font-mono">
                        {JSON.stringify(log.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </Section>
            </>
          )}

          <Separator />

          {/* Teknis */}
          <Section icon={<Monitor className="w-4 h-4" />} title="Informasi Teknis">
            <InfoRow label="IP Address"  value={log.ipAddress || '—'} mono />
            <InfoRow label="Browser"     value={log.browserName || '—'} />
            <InfoRow label="Sistem Ops." value={log.osName || '—'} />
          </Section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// ============================================================
// Sub-components
// ============================================================

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <span className="text-muted-foreground">{icon}</span>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="bg-muted/40 rounded-xl p-4 space-y-2.5">
      {children}
    </div>
  </div>
);

const InfoRow: React.FC<{
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}> = ({ label, value, mono, small }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="text-xs text-muted-foreground shrink-0">{label}</span>
    <span className={`text-right break-all ${mono ? 'font-mono' : ''} ${small ? 'text-xs text-muted-foreground' : 'text-sm text-foreground font-medium'}`}>
      {value}
    </span>
  </div>
);
