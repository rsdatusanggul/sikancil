import React from 'react';
import type { AuditFilter } from '../types/audit.types';
import { ACTION_CONFIG, ACTION_GROUPS, ENTITY_LABELS } from '../utils/audit.utils';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

interface Props {
  filter: AuditFilter;
  onFilter: (f: Partial<AuditFilter>) => void;
}

export const AuditFilterPanel: React.FC<Props> = ({ filter, onFilter }) => {
  const toggleAction = (action: string) => {
    const current = filter.actions ?? [];
    const updated = current.includes(action as any)
      ? current.filter(a => a !== action)
      : [...current, action as any];
    onFilter({ actions: updated.length ? updated : undefined });
  };

  const toggleEntity = (entity: string) => {
    const current = filter.entityTypes ?? [];
    const updated = current.includes(entity)
      ? current.filter(e => e !== entity)
      : [...current, entity];
    onFilter({ entityTypes: updated.length ? updated : undefined });
  };

  return (
    <Card elevation="flat">
      <CardContent className="p-5 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Rentang Tanggal */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Rentang Tanggal
            </Label>
            <Input
              type="date"
              value={filter.dateFrom ?? ''}
              onChange={e => onFilter({ dateFrom: e.target.value || undefined })}
              className="h-9 text-sm"
            />
            <Input
              type="date"
              value={filter.dateTo ?? ''}
              onChange={e => onFilter({ dateTo: e.target.value || undefined })}
              className="h-9 text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Status
            </Label>
            <RadioGroup
              value={filter.status ?? 'ALL'}
              onValueChange={val => onFilter({ status: val === 'ALL' ? undefined : val as 'SUCCESS' | 'FAILED' })}
              className="gap-2"
            >
              {([
                { value: 'ALL',     label: 'Semua' },
                { value: 'SUCCESS', label: '✅ Berhasil' },
                { value: 'FAILED',  label: '❌ Gagal' },
              ] as const).map(item => (
                <div key={item.value} className="flex items-center gap-2">
                  <RadioGroupItem value={item.value} id={`status-${item.value}`} />
                  <Label
                    htmlFor={`status-${item.value}`}
                    className="text-sm text-foreground font-normal cursor-pointer"
                  >
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Jenis Aksi */}
          <div className="md:col-span-2 space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Jenis Aksi
            </Label>
            <div className="space-y-3">
              {Object.entries(ACTION_GROUPS).map(([group, actions]) => (
                <div key={group}>
                  <p className="text-xs text-muted-foreground mb-1.5">{group}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {actions.map(action => {
                      const cfg = ACTION_CONFIG[action];
                      const isActive = filter.actions?.includes(action);
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => toggleAction(action)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all',
                            isActive
                              ? `${cfg.color} ${cfg.textColor} border-current`
                              : 'bg-background text-muted-foreground border-border hover:border-foreground/40'
                          )}
                        >
                          {cfg.icon} {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Separator />

        {/* Modul / Entitas */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Modul
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(ENTITY_LABELS).map(([key, label]) => {
              const isActive = filter.entityTypes?.includes(key);
              return (
                <Button
                  key={key}
                  type="button"
                  size="sm"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => toggleEntity(key)}
                  className="h-7 px-3 text-xs rounded-full"
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
