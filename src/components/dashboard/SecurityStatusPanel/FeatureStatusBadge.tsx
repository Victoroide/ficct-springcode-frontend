import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckIcon } from '@/components/icons';

type FeatureStatus = 'enabled' | 'disabled' | 'warning' | 'required';

interface FeatureStatusBadgeProps {
  status: FeatureStatus;
  label?: string;
  showIcon?: boolean;
}

/**
 * FeatureStatusBadge Component
 * Shows the status of a security feature with appropriate styling
 */
export function FeatureStatusBadge({ 
  status, 
  label, 
  showIcon = true 
}: FeatureStatusBadgeProps) {
  // Define status variants
  const statusConfig = {
    enabled: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <CheckIcon className="h-3 w-3" />,
      defaultLabel: 'Activado'
    },
    disabled: {
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />,
      defaultLabel: 'Desactivado'
    },
    warning: {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <span className="h-2 w-2 rounded-full bg-amber-500 inline-block" />,
      defaultLabel: 'Recomendado'
    },
    required: {
      color: 'bg-red-100 text-red-800 border-red-200',
      icon: <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />,
      defaultLabel: 'Requerido'
    }
  };
  
  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;
  
  return (
    <Badge 
      variant="outline" 
      className={`${config.color} font-medium text-xs py-1`}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {displayLabel}
    </Badge>
  );
}
