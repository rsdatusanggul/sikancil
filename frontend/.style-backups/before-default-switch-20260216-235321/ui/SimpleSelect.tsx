import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export interface SimpleSelectOption {
  value: string;
  label: string;
}

export interface SimpleSelectProps extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'onChange'> {
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
  onValueChange?: (value: string) => void;
  options?: SimpleSelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

/**
 * SimpleSelect - Backward compatible wrapper around Radix UI Select
 *
 * This component provides a simpler API similar to native HTML select:
 * - Accepts `options` array OR children
 * - Supports both `onChange` (native-like) and `onValueChange` (Radix)
 * - Works with string values
 *
 * For more control, use the full Radix UI Select components directly.
 */
export const SimpleSelect = React.forwardRef<HTMLButtonElement, SimpleSelectProps>(
  (
    {
      value,
      onChange,
      onValueChange,
      options,
      placeholder = 'Pilih...',
      required,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const handleValueChange = (newValue: string) => {
      // Support both APIs
      if (onValueChange) {
        onValueChange(newValue);
      }
      if (onChange) {
        // Provide native-like event object for backward compatibility
        onChange({ target: { value: newValue } } as any);
      }
    };

    return (
      <Select value={value} onValueChange={handleValueChange} required={required} disabled={disabled}>
        <SelectTrigger ref={ref} {...props}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options
              ? options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              : children}
          </SelectGroup>
        </SelectContent>
      </Select>
    );
  }
);

SimpleSelect.displayName = 'SimpleSelect';
