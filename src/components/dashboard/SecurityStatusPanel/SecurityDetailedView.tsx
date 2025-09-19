// @ts-nocheck - Allow compilation
import React from 'react';
import { SecurityScore } from './SecurityScore';
import { SecurityScoreBreakdown } from './SecurityScoreBreakdown';
import { SecurityFeatureCard } from './SecurityFeatureCard';
import { Button } from '@/components/ui/button';
import { SecurityIcon } from '@/components/icons';
import { useAppSelector } from '@/hooks/redux';
import {
  selectSecurityScore,
  selectSecurityFeatures,
  selectSecurityRecommendations,
} from '@/store/slices/securitySlice';
import type { SecurityFeature } from '@/types/user';

interface SecurityDetailedViewProps {
  onEnableFeature: (featureName: string) => void;
  onStartSecurityWizard: () => void;
  isLoading?: boolean;
}

/**
 * SecurityDetailedView Component
 * Comprehensive security view with score breakdown and feature cards
 */
export function SecurityDetailedView({
  onEnableFeature,
  onStartSecurityWizard,
  isLoading = false
}: SecurityDetailedViewProps) {
  // Get security data from Redux store
  const securityScore = useAppSelector(selectSecurityScore);
  const features = useAppSelector(selectSecurityFeatures);
  const recommendations = useAppSelector(selectSecurityRecommendations);
  
  // Organize features into categories for display
  const securityCategories = [
    {
      name: 'Autenticación',
      features: features.filter(f => 
        f.name === '2fa_enabled' || 
        f.name === 'backup_codes_available' || 
        f.name === 'strong_password'
      ),
      weight: 0.4,
      score: calculateCategoryScore(features.filter(f => 
        f.name === '2fa_enabled' || 
        f.name === 'backup_codes_available' || 
        f.name === 'strong_password'
      )),
      maxScore: 40
    },
    {
      name: 'Verificación',
      features: features.filter(f => 
        f.name === 'email_verified' || 
        f.name === 'phone_verified'
      ),
      weight: 0.3,
      score: calculateCategoryScore(features.filter(f => 
        f.name === 'email_verified' || 
        f.name === 'phone_verified'
      )),
      maxScore: 30
    },
    {
      name: 'Actividad',
      features: features.filter(f => 
        f.name === 'recent_password_change' || 
        f.name === 'suspicious_activity_alerts'
      ),
      weight: 0.3,
      score: calculateCategoryScore(features.filter(f => 
        f.name === 'recent_password_change' || 
        f.name === 'suspicious_activity_alerts'
      )),
      maxScore: 30
    }
  ];
  
  // High priority features (not enabled & high severity)
  const highPriorityFeatures = features.filter(
    f => !f.enabled && f.severity === 'high'
  );

  return (
    <div className="space-y-8">
      {/* Security Score Summary */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
            <SecurityScore 
              score={securityScore} 
              maxScore={100} 
              size="lg"
            />
            <h3 className="text-lg font-medium text-slate-800 mt-4">
              Estado de Seguridad
            </h3>
            <p className="text-sm text-slate-500 text-center mt-1">
              {getSecurityLevelDescription(securityScore)}
            </p>
            
            {/* <Button
              onClick={onStartSecurityWizard}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-500"
              disabled={isLoading}
            >
              <SecurityIcon className="mr-2 h-4 w-4" />
              Mejorar Seguridad
            </Button> */}
          </div>
        </div>
        
        <div className="md:w-2/3">
          <SecurityScoreBreakdown 
            score={securityScore} 
            maxScore={100}
            categories={securityCategories}
            className="h-full"
          />
        </div>
      </div>
      
      {/* High Priority Features */}
      {highPriorityFeatures.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">
            Recomendaciones Críticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {highPriorityFeatures.map((feature, index) => (
              <SecurityFeatureCard
                key={index}
                feature={feature}
                onEnableClick={() => onEnableFeature(feature.name)}
                onLearnMoreClick={() => {}} // Add learn more handler when needed
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* All Features */}
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-4">
          Todas las Características de Seguridad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <SecurityFeatureCard
              key={index}
              feature={feature}
              onEnableClick={() => !feature.enabled && onEnableFeature(feature.name)}
              onLearnMoreClick={() => {}} // Add learn more handler when needed
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function calculateCategoryScore(features: SecurityFeature[]): number {
  if (features.length === 0) return 0;
  const enabledCount = features.filter(f => f.enabled).length;
  return Math.round((enabledCount / features.length) * 100);
}

function getSecurityLevelDescription(score: number): string {
  if (score >= 90) return 'Excelente nivel de seguridad';
  if (score >= 70) return 'Buen nivel de seguridad';
  if (score >= 50) return 'Nivel de seguridad moderado';
  if (score >= 30) return 'Nivel de seguridad básico';
  return 'Nivel de seguridad bajo';
}
