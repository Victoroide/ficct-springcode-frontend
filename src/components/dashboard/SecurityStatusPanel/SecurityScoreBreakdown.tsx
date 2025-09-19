import React from 'react';
import { SecurityScore } from './SecurityScore';
import { ProgressIndicator } from './ProgressIndicator';
import { Card } from '@/components/ui/card';
import { FeatureStatusBadge } from './FeatureStatusBadge';
import type { SecurityFeature } from '@/types/user';

interface SecurityCategory {
  name: string;
  features: SecurityFeature[];
  weight: number;
  score: number;
  maxScore: number;
}

interface SecurityScoreBreakdownProps {
  score: number;
  maxScore?: number;
  categories?: SecurityCategory[];
  className?: string;
}

/**
 * SecurityScoreBreakdown Component
 * Shows a detailed breakdown of security score by categories
 */
export function SecurityScoreBreakdown({
  score,
  maxScore = 100,
  categories = [],
  className = ''
}: SecurityScoreBreakdownProps) {
  return (
    <Card className={`${className}`}>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center mb-6">
          <div className="flex-shrink-0 flex justify-center mb-4 sm:mb-0 sm:mr-6">
            <SecurityScore score={score} maxScore={maxScore} size="md" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-800 mb-2">
              Desglose de Puntuación de Seguridad
            </h3>
            <p className="text-sm text-slate-500">
              Tu puntuación de seguridad se calcula en base a múltiples factores.
              Mejora tu puntuación activando las funciones de seguridad recomendadas.
            </p>
          </div>
        </div>
        
        {/* Categories Breakdown */}
        <div className="space-y-6">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <CategoryBreakdown key={index} category={category} />
            ))
          ) : (
            <div className="py-4 text-center text-sm text-slate-500">
              No hay información de desglose de seguridad disponible.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

interface CategoryBreakdownProps {
  category: SecurityCategory;
}

/**
 * CategoryBreakdown Component
 * Shows the breakdown of a specific security category
 */
function CategoryBreakdown({ category }: CategoryBreakdownProps) {
  // Calculate percentage of completion
  const percentage = Math.min(Math.max((category.score / category.maxScore) * 100, 0), 100);
  
  // Get variant based on percentage
  const getVariant = () => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-sm font-medium text-slate-700">{category.name}</h4>
        <div className="text-sm text-slate-700">
          <span className="font-medium">{category.score}</span>
          <span className="text-slate-400">/</span>
          <span>{category.maxScore}</span>
        </div>
      </div>
      
      <ProgressIndicator 
        value={category.score} 
        maxValue={category.maxScore} 
        size="sm" 
        variant={getVariant()}
        className="mb-3"
      />
      
      {/* Features in this category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {category.features.map((feature, index) => (
          <div key={index} className="flex items-center justify-between bg-slate-50 rounded-md p-2">
            <span className="text-xs text-slate-700">{feature.display_name}</span>
            <FeatureStatusBadge 
              status={feature.enabled ? 'enabled' : 'disabled'} 
              showIcon={false} 
            />
          </div>
        ))}
      </div>
    </div>
  );
}
