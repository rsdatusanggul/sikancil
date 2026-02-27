import type { MonthlyBreakdown } from '../types/rak.types';

export const MONTH_KEYS: (keyof MonthlyBreakdown)[] = [
  'januari',
  'februari',
  'maret',
  'april',
  'mei',
  'juni',
  'juli',
  'agustus',
  'september',
  'oktober',
  'november',
  'desember',
];

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

export function formatCurrency(value: number | string): string {
  // Handle string values from PostgreSQL decimal fields
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  // Check if valid number
  if (isNaN(numValue) || numValue === null || numValue === undefined) {
    return 'Rp0';
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
}

export function calculateMonthlyTotal(monthly: MonthlyBreakdown): number {
  return MONTH_KEYS.reduce((sum, month) => {
    const value = monthly[month];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (numValue || 0);
  }, 0);
}

export function calculateSemester1(monthly: MonthlyBreakdown): number {
  return MONTH_KEYS.slice(0, 6).reduce((sum, month) => {
    const value = monthly[month];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (numValue || 0);
  }, 0);
}

export function calculateSemester2(monthly: MonthlyBreakdown): number {
  return MONTH_KEYS.slice(6, 12).reduce((sum, month) => {
    const value = monthly[month];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (numValue || 0);
  }, 0);
}

export function calculateTriwulan1(monthly: MonthlyBreakdown): number {
  return MONTH_KEYS.slice(0, 3).reduce((sum, month) => {
    const value = monthly[month];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (numValue || 0);
  }, 0);
}

export function calculateTriwulan2(monthly: MonthlyBreakdown): number {
  return MONTH_KEYS.slice(3, 6).reduce((sum, month) => {
    const value = monthly[month];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (numValue || 0);
  }, 0);
}

export function calculateTriwulan3(monthly: MonthlyBreakdown): number {
  return MONTH_KEYS.slice(6, 9).reduce((sum, month) => {
    const value = monthly[month];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (numValue || 0);
  }, 0);
}

export function calculateTriwulan4(monthly: MonthlyBreakdown): number {
  return MONTH_KEYS.slice(9, 12).reduce((sum, month) => {
    const value = monthly[month];
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return sum + (numValue || 0);
  }, 0);
}

export function calculateAllPeriods(monthly: MonthlyBreakdown) {
  return {
    total: calculateMonthlyTotal(monthly),
    semester_1: calculateSemester1(monthly),
    semester_2: calculateSemester2(monthly),
    triwulan_1: calculateTriwulan1(monthly),
    triwulan_2: calculateTriwulan2(monthly),
    triwulan_3: calculateTriwulan3(monthly),
    triwulan_4: calculateTriwulan4(monthly),
  };
}