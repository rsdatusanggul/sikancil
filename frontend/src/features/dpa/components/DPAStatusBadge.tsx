import React from 'react';
import { DPAStatus } from '../types';
import { getStatusColor, getStatusLabel } from '../utils';

interface DPAStatusBadgeProps {
  status: DPAStatus;
  size?: 'sm' | 'md' | 'lg';
}

const DPAStatusBadge: React.FC<DPAStatusBadgeProps> = ({
  status,
  size = 'md',
}) => {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const colorClasses: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300 font-semibold',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${sizeClasses[size]} ${colorClasses[color]}`}
    >
      {label}
    </span>
  );
};

export default DPAStatusBadge;
