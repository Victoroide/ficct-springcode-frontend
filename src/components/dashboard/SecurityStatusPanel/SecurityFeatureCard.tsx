import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import { SecurityIcon } from '@/components/icons';
import type { SecurityFeature } from '@/types/user';

interface SecurityFeatureCardProps {
  feature: SecurityFeature;
  onEnableClick?: () => void;
  onLearnMoreClick?: () => void;
  isLoading?: boolean;
}

/**
 * SecurityFeatureCard Component
 * Card displaying a security feature with status and actions
 */
export function SecurityFeatureCard({
  feature,
  onEnableClick,
  onLearnMoreClick,
  isLoading = false
}: SecurityFeatureCardProps) {
  // Determine status for the badge
  const getStatusType = () => {
    if (feature.enabled) return 'enabled';
    return feature.severity === 'high' ? 'required' : 
           feature.severity === 'medium' ? 'warning' : 'disabled';
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="p-4">
        {/* Header with icon and status */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <SecurityIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-medium text-slate-800">{feature.display_name}</h3>
          </div>
          <FeatureStatusBadge status={getStatusType()} />
        </div>
        
        {/* Description */}
        <p className="text-xs text-slate-500 mb-3">
          {feature.recommendation || 'Esta característica mejora la seguridad de tu cuenta.'}
        </p>
        
        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {!feature.enabled && onEnableClick && (
            <Button
              size="sm"
              variant="default"
              className="text-xs h-8"
              onClick={onEnableClick}
              disabled={isLoading}
            >
              {isLoading ? 'Activando...' : 'Activar'}
            </Button>
          )}
          
          {onLearnMoreClick && (
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-8"
              onClick={onLearnMoreClick}
              disabled={isLoading}
            >
              Más información
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
