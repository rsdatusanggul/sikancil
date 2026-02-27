import React from 'react';
import { Clock } from 'lucide-react';
import { useAuditTimeline } from '../hooks/useAuditLog';
import { ACTION_CONFIG, formatTimestamp } from '../utils/audit.utils';

interface Props {
  entityType: string;
  entityId: string;
}

export const AuditTimeline: React.FC<Props> = ({ entityType, entityId }) => {
  const { data: logs, isLoading } = useAuditTimeline(entityType, entityId);

  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!logs?.length) {
    return (
      <p className="text-sm text-slate-400 italic text-center py-4">
        Belum ada riwayat aktivitas
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {logs.map((log, idx) => {
        const cfg    = ACTION_CONFIG[log.action] ?? { label: log.action, icon: '•', color: 'bg-gray-100', textColor: 'text-gray-600' };
        const isLast = idx === logs.length - 1;

        return (
          <div key={log.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-base ${cfg.color} flex-shrink-0`}>
                {cfg.icon}
              </div>
              {!isLast && <div className="w-px flex-1 bg-slate-200 my-1" />}
            </div>

            {/* Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${cfg.textColor}`}>{cfg.label}</span>
                <span className="text-slate-400 text-xs">oleh</span>
                <span className="text-sm font-medium text-slate-700">{log.userName}</span>
                <span className="text-xs text-slate-400 ml-auto flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(log.timestamp)}
                </span>
              </div>
              {log.reason && (
                <p className="text-xs text-slate-500 mt-1 italic">"{log.reason}"</p>
              )}
              {log.status === 'FAILED' && log.errorMessage && (
                <p className="text-xs text-red-500 mt-1">⚠ {log.errorMessage}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
