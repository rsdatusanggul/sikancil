import { DPAStatus } from './types';

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

// Get status color
export const getStatusColor = (status: DPAStatus): string => {
  const colors: Record<DPAStatus, string> = {
    [DPAStatus.DRAFT]: 'gray',
    [DPAStatus.SUBMITTED]: 'blue',
    [DPAStatus.APPROVED]: 'green',
    [DPAStatus.REJECTED]: 'red',
    [DPAStatus.ACTIVE]: 'purple',
    [DPAStatus.REVISED]: 'yellow',
  };
  return colors[status] || 'gray';
};

// Get status label
export const getStatusLabel = (status: DPAStatus): string => {
  const labels: Record<DPAStatus, string> = {
    [DPAStatus.DRAFT]: 'Draft',
    [DPAStatus.SUBMITTED]: 'Diajukan',
    [DPAStatus.APPROVED]: 'Disetujui',
    [DPAStatus.REJECTED]: 'Ditolak',
    [DPAStatus.ACTIVE]: 'Aktif',
    [DPAStatus.REVISED]: 'Direvisi',
  };
  return labels[status] || status;
};

// Check if DPA can be edited
export const canEditDPA = (status: DPAStatus): boolean => {
  return status === DPAStatus.DRAFT || status === DPAStatus.REJECTED;
};

// Check if DPA can be deleted
export const canDeleteDPA = (status: DPAStatus): boolean => {
  return status === DPAStatus.DRAFT;
};

// Check if DPA can be submitted
export const canSubmitDPA = (status: DPAStatus): boolean => {
  return status === DPAStatus.DRAFT;
};

// Check if DPA can be approved
export const canApproveDPA = (status: DPAStatus): boolean => {
  return status === DPAStatus.SUBMITTED;
};

// Check if DPA can be rejected
export const canRejectDPA = (status: DPAStatus): boolean => {
  return status === DPAStatus.SUBMITTED;
};

// Check if DPA can be activated
export const canActivateDPA = (status: DPAStatus): boolean => {
  return status === DPAStatus.APPROVED;
};

// Generate DPA number
export const generateDPANumber = (
  tahun: number,
  isDPPA: boolean,
  nomorUrut: number
): string => {
  const prefix = isDPPA ? 'DPPA' : 'DPA';
  const urut = String(nomorUrut).padStart(3, '0');
  return `${prefix}-${urut}/BLUD/${tahun}`;
};

// Get month names
export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

// Get month name by index (1-12)
export const getMonthName = (month: number): string => {
  return MONTH_NAMES[month - 1] || '';
};

// Calculate sisa (remaining budget)
export const calculateSisa = (
  pagu: number,
  realisasi: number,
  komitmen: number = 0
): number => {
  return pagu - realisasi - komitmen;
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};
