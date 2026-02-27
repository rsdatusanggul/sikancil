import { Badge } from '@/components/ui/Badge';
import { RakStatus } from '../../types/rak.types';
import {
  FileEdit,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

interface RakStatusBadgeProps {
  status: RakStatus;
  className?: string;
}

const STATUS_CONFIG = {
  [RakStatus.DRAFT]: {
    label: 'Draft',
    variant: 'secondary' as const,
    icon: FileEdit,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
  [RakStatus.SUBMITTED]: {
    label: 'Diajukan',
    variant: 'default' as const,
    icon: Send,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  [RakStatus.APPROVED]: {
    label: 'Disetujui',
    variant: 'success' as const,
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  [RakStatus.REJECTED]: {
    label: 'Ditolak',
    variant: 'danger' as const,
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
  [RakStatus.REVISED]: {
    label: 'Direvisi',
    variant: 'warning' as const,
    icon: RefreshCw,
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  },
};

export function RakStatusBadge({ status, className }: RakStatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
}