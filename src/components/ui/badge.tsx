import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, ...props }) => {
  const variantClasses: Record<BadgeProps['variant'], string> = {
    default: 'bg-blue-500 text-white',
    outline: 'border border-gray-300 text-gray-700',
    success: 'bg-green-500 text-white',
    warning: 'bg-amber-500 text-white',
    destructive: 'bg-red-500 text-white',
  };

  return (
    <span
      className={cn('inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold', variantClasses[variant], className)}
      {...props}
    />
  );
};
