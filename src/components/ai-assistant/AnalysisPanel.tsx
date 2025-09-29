/**
 * Analysis Panel Component
 * Displays diagram analysis results with visualizations
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Code,
  RefreshCw,
  TrendingUp,
  Award,
  AlertCircle
} from 'lucide-react';
import type { DiagramAnalysis } from '@/types/aiAssistant';

interface AnalysisPanelProps {
  analysis: DiagramAnalysis | null;
  onRefresh?: () => void;
  isLoading?: boolean;
  diagramId?: string;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  analysis,
  onRefresh,
  isLoading = false,
  diagramId
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!analysis) {
    return (
      <div className="p-6 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 mb-4">No hay análisis disponible</p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <BarChart3 className="w-4 h-4 mr-2" />
            )}
            Generar análisis
          </Button>
        )}
      </div>
    );
  }

  const getComplexityColor = (score: number) => {
    if (score < 30) return 'text-green-600 bg-green-100';
    if (score < 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getComplexityLabel = (score: number) => {
    if (score < 30) return 'Baja';
    if (score < 60) return 'Media';
    return 'Alta';
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Análisis del diagrama</h3>
        </div>
        {onRefresh && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* Complexity Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Complejidad</span>
          <Badge className={getComplexityColor(analysis.complexity_score)}>
            {getComplexityLabel(analysis.complexity_score)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <Progress value={analysis.complexity_score} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Simple</span>
            <span>{analysis.complexity_score}/100</span>
            <span>Complejo</span>
          </div>
        </div>
      </div>

      {/* SpringBoot Ready */}
      <div className={`border rounded-lg p-4 ${
        analysis.springboot_ready 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center gap-3">
          {analysis.springboot_ready ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          )}
          <div>
            <p className={`font-medium ${
              analysis.springboot_ready 
                ? 'text-green-800' 
                : 'text-yellow-800'
            }`}>
              {analysis.springboot_ready 
                ? 'Listo para generar código'
                : 'Requiere mejoras para código'}
            </p>
            <p className={`text-xs ${
              analysis.springboot_ready 
                ? 'text-green-700' 
                : 'text-yellow-700'
            }`}>
              {analysis.springboot_ready
                ? 'Tu diagrama cumple los requisitos para generar código SpringBoot'
                : 'Revisa las sugerencias para preparar el diagrama'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Completeness and Collaboration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Completitud:</span>
          <Badge 
            variant={analysis.completeness === 'high' ? 'default' : analysis.completeness === 'medium' ? 'outline' : 'destructive'}
            className={`${
              analysis.completeness === 'high' ? 'bg-green-100 text-green-800' :
              analysis.completeness === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}
          >
            {analysis.completeness === 'high' ? 'Alta' : analysis.completeness === 'medium' ? 'Media' : 'Baja'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Colaboración:</span>
          <Badge variant={analysis.collaboration_active ? 'default' : 'outline'}>
            {analysis.collaboration_active ? 'Activa' : 'Inactiva'}
          </Badge>
        </div>
      </div>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="space-y-2">
          <Button
            variant="ghost"
            onClick={() => setExpandedSection(expandedSection === 'recommendations' ? null : 'recommendations')}
            className="flex items-center gap-2 w-full justify-start"
          >
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="font-medium">Recomendaciones ({analysis.recommendations.length})</span>
          </Button>
          
          {(expandedSection === 'recommendations' || expandedSection === null) && (
            <div className="space-y-2 ml-6">
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <TrendingUp className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{recommendation}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      {!analysis.springboot_ready && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Próximos pasos</span>
          </div>
          <p className="text-xs text-blue-700 mb-3">
            Para generar código SpringBoot, revisa las recomendaciones del análisis.
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs">
              Ver guía
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Solicitar ayuda
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
