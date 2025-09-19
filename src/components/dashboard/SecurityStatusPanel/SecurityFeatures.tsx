import React from 'react';
import { CheckIcon, SecurityIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { SecurityFeature } from '@/types/user';

interface SecurityFeaturesProps {
  features: SecurityFeature[];
  onEnableFeature: (featureName: string) => void;
  isLoading?: boolean;
}

/**
 * SecurityFeatures Component
 * Displays the status of security features with enable buttons
 */
export function SecurityFeatures({ features, onEnableFeature, isLoading = false }: SecurityFeaturesProps) {
  // Filter features by status
  const enabledFeatures = features.filter(feature => feature.enabled);
  const disabledFeatures = features.filter(feature => !feature.enabled);
  
  return (
    <div className="space-y-4">
      {/* Enabled features */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Características Activas</h4>
        {enabledFeatures.length > 0 ? (
          <ul className="space-y-2">
            {enabledFeatures.map(feature => (
              <FeatureItem 
                key={feature.name} 
                feature={feature}
                isEnabled={true}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 italic">Sin características activas</p>
        )}
      </div>
      
      {/* Disabled features */}
      <div>
        <h4 className="text-sm font-medium text-slate-700 mb-2">Pendiente de Activación</h4>
        {disabledFeatures.length > 0 ? (
          <ul className="space-y-2">
            {disabledFeatures.map(feature => (
              <FeatureItem 
                key={feature.name} 
                feature={feature}
                isEnabled={false}
                onEnableFeature={onEnableFeature}
                isLoading={isLoading}
              />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500 italic">Todas las características están activas</p>
        )}
      </div>
    </div>
  );
}

interface FeatureItemProps {
  feature: SecurityFeature;
  isEnabled: boolean;
  onEnableFeature?: (featureName: string) => void;
  isLoading?: boolean;
}

/**
 * FeatureItem Component
 * Individual security feature item with status and action
 */
function FeatureItem({ feature, isEnabled, onEnableFeature, isLoading }: FeatureItemProps) {
  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
      case 'medium':
        return isEnabled ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800';
      case 'low':
      default:
        return isEnabled ? 'bg-slate-100 text-slate-800' : 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <li className="flex items-center justify-between p-2.5 rounded-md bg-white border border-slate-200 shadow-sm">
      <div className="flex items-start gap-2">
        {/* Status icon */}
        <div className={`flex-shrink-0 mt-0.5 ${isEnabled ? 'text-green-500' : 'text-slate-400'}`}>
          {isEnabled ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <SecurityIcon className="h-4 w-4" />
          )}
        </div>
        
        {/* Feature name and description */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-800">
              {feature.display_name}
            </span>
            <Badge className={getSeverityColor(feature.severity)}>
              {feature.severity === 'high' ? 'Crítica' : 
               feature.severity === 'medium' ? 'Recomendada' : 'Opcional'}
            </Badge>
          </div>
          
          {feature.recommendation && !isEnabled && (
            <p className="text-xs text-slate-500 mt-0.5">{feature.recommendation}</p>
          )}
        </div>
      </div>
      
      {/* Action button for disabled features */}
      {!isEnabled && onEnableFeature && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onEnableFeature(feature.name)}
          disabled={isLoading}
          className="ml-2 text-xs h-8 px-3"
        >
          {isLoading ? 'Activando...' : 'Activar'}
        </Button>
      )}
    </li>
  );
}
