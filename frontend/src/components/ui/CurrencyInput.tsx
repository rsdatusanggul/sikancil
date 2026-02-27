import React, { useState, useEffect } from 'react';
import { cn, parseCurrencyInput, formatCurrencyInput } from '@/lib/utils';

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  label?: string;
  error?: string;
  helperText?: string;
  value?: number;
  onChange?: (value: number) => void;
  includeDecimals?: boolean;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, label, error, helperText, value, onChange, includeDecimals = false, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // Update display value when prop value changes
    useEffect(() => {
      if (!isFocused && value !== undefined) {
        setDisplayValue(value ? formatCurrencyInput(value, includeDecimals) : '');
      }
    }, [value, isFocused, includeDecimals]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);

      // Parse and send numeric value to parent
      const numericValue = parseCurrencyInput(inputValue);
      onChange?.(numericValue);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);

      // Format on blur
      const numericValue = parseCurrencyInput(displayValue);
      setDisplayValue(numericValue ? formatCurrencyInput(numericValue, includeDecimals) : '');

      props.onBlur?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className={cn(
            "mb-1 block text-sm font-medium transition-colors duration-200",
            isFocused ? "text-primary" : "text-foreground"
          )}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <span className={cn(
            "absolute inset-y-0 left-0 flex items-center pl-3 text-sm transition-colors duration-200",
            isFocused ? "text-primary" : "text-gray-500 dark:text-gray-400"
          )}>
            Rp
          </span>
          <input
            type="text"
            inputMode="numeric"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-950 pl-10 pr-3 py-2 text-sm text-gray-950 dark:text-gray-50 text-right',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-all duration-200 hover:border-input/80 shadow-inner focus-visible:shadow-sm',
              error && 'border-destructive focus-visible:ring-destructive animate-shake',
              className
            )}
            ref={ref}
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={includeDecimals ? '0,00' : '0'}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-destructive animate-slide-in-from-top">{error}</p>}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
