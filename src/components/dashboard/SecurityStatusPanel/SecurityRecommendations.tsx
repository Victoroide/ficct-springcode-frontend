import React from 'react';

interface SecurityRecommendationsProps {
  recommendations: string[];
}

/**
 * SecurityRecommendations Component
 * Displays actionable security tips and recommendations
 */
export function SecurityRecommendations({ recommendations }: SecurityRecommendationsProps) {
  if (!recommendations.length) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-slate-700 mb-2">Recomendaciones</h4>
      <ul className="space-y-1.5">
        {recommendations.map((recommendation, index) => (
          <li key={index} className="flex items-start">
            <span className="text-amber-500 mr-2">•</span>
            <span className="text-xs text-slate-600">{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
