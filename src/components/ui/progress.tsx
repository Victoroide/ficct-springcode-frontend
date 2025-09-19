import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, className, ...props }) => {
  const percentage = Math.min(100, (value / max) * 100);
  return (
    <div className={cn('w-full bg-gray-200 rounded-full h-2', className)} {...props}>
      <div
        className="h-full bg-blue-600 rounded-full"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};
