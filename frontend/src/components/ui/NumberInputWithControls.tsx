import * as React from 'react';
import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';

export interface NumberInputWithControlsProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: boolean;
}

const NumberInputWithControls = React.forwardRef<
  HTMLInputElement,
  NumberInputWithControlsProps
>(
  (
    {
      className,
      value,
      onChange,
      min = -Infinity,
      max = Infinity,
      step = 1,
      error,
      disabled,
      ...props
    },
    ref
  ) => {
    const handleDecrement = () => {
      const newValue = value - step;
      const clampedValue = Math.max(min, newValue);
      onChange(clampedValue);
    };

    const handleIncrement = () => {
      const newValue = value + step;
      const clampedValue = Math.min(max, newValue);
      onChange(clampedValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Allow empty input for editing
      if (inputValue === '') {
        onChange(0);
        return;
      }

      const numValue = parseFloat(inputValue);
      if (!isNaN(numValue)) {
        const clampedValue = Math.min(max, Math.max(min, numValue));
        onChange(clampedValue);
      }
    };

    const isAtMin = value <= min;
    const isAtMax = value >= max;

    return (
      <div className="flex">
        <input
          ref={ref}
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            'flex-1 h-10 rounded-l-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'transition-all duration-200 hover:border-input/80',
            'text-right',
            error && 'border-destructive focus-visible:ring-destructive animate-shake',
            // Hide native number input spinner buttons
            '[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            '[&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0',
            '[appearance:textfield]',
            className
          )}
          {...props}
        />
        <div className="flex flex-col border-y border-r border-input rounded-r-md">
          <button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || isAtMax}
            className={cn(
              'flex-1 flex items-center justify-center px-2',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'border-b border-input',
              'min-h-[20px]',
              'transition-colors duration-200'
            )}
            tabIndex={-1}
            aria-label="Increment value"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || isAtMin}
            className={cn(
              'flex-1 flex items-center justify-center px-2',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'min-h-[20px]',
              'transition-colors duration-200'
            )}
            tabIndex={-1}
            aria-label="Decrement value"
          >
            <Minus className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }
);

NumberInputWithControls.displayName = 'NumberInputWithControls';

export { NumberInputWithControls };