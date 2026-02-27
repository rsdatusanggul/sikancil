import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

export interface LoadingOverlayProps {
  isLoading: boolean;
  label?: string;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  label = 'Loading...',
  className,
  spinnerSize = 'lg',
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-background/80 backdrop-blur-sm',
        'animate-fade-in',
        className
      )}
    >
      <div className="animate-scale-in">
        <LoadingSpinner size={spinnerSize} label={label} />
      </div>
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';

export { LoadingOverlay };
