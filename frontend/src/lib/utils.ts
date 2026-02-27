import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Normalize Indonesian currency format to number
 * Converts "100.245.969.427,00" or "100.245.969.427" to 100245969427
 * Supports:
 * - Dot (.) as thousand separator
 * - Comma (,) as decimal separator
 * - Optional decimal places
 *
 * @param value - String in Indonesian currency format
 * @returns Number value
 *
 * @example
 * parseCurrencyInput("100.245.969.427,00") // 100245969427
 * parseCurrencyInput("100.245.969.427") // 100245969427
 * parseCurrencyInput("1.000.000") // 1000000
 * parseCurrencyInput("Rp 1.000.000") // 1000000
 */
export function parseCurrencyInput(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbol (Rp, IDR, etc.) and spaces
  let cleaned = value.replace(/[Rp\s]/gi, '').trim();

  // Remove thousand separators (dots)
  cleaned = cleaned.replace(/\./g, '');

  // Replace decimal separator (comma) with dot for parseFloat
  cleaned = cleaned.replace(/,/g, '.');

  // Parse to float and round to avoid floating point issues
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : Math.round(parsed);
}

/**
 * Format number as Indonesian currency input (without Rp symbol)
 * Useful for input fields
 *
 * @param value - Number to format
 * @param includeDecimals - Whether to include decimal places (default: false)
 * @returns Formatted string
 *
 * @example
 * formatCurrencyInput(100245969427) // "100.245.969.427"
 * formatCurrencyInput(100245969427.50, true) // "100.245.969.427,50"
 */
export function formatCurrencyInput(value: number, includeDecimals: boolean = false): string {
  if (isNaN(value) || value === null || value === undefined) {
    return '';
  }

  const formatter = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });

  return formatter.format(value);
}

export function formatDate(date: Date | string, format: string = 'dd/MM/yyyy'): string {
  // Simple date formatter, can be enhanced with date-fns
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', String(year));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
