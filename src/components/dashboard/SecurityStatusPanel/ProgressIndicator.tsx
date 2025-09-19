import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ProgressIndicatorProps {
  value: number;
  maxValue?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

/**
 * ProgressIndicator Component
 * Shows a progress bar with optional label and variants
 */
export function ProgressIndicator({
  value,
  maxValue = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className = ''
}: ProgressIndicatorProps) {
  // Calculate percentage
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  // Define size classes
  const sizeClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  }[size];
  
  // Define variant classes
  const variantClasses = {
    default: 'bg-blue-600',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500'
  }[variant];
  
  // Get color based on percentage if variant is default
  const getColorClass = () => {
    if (variant !== 'default') return variantClasses;
    
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  return (
    <div className={className}>
      <Progress 
        value={percentage} 
        className={`${sizeClasses} ${getColorClass()}`}
      />
      
      {showLabel && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500">{label || `${value}/${maxValue}`}</span>
          <span className="text-xs font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
    </div>
  );
}
