/**
 * Quick Questions Component
 * Displays contextual quick question buttons for the AI Assistant
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  BookOpen, 
  Code, 
  AlertCircle, 
  Lightbulb,
  ChevronRight
} from 'lucide-react';
import type { QuickQuestion } from '@/types/aiAssistant';

interface QuickQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
  isLoading?: boolean;
  contextMode: 'general' | 'diagram';
}

const CATEGORY_ICONS = {
  getting_started: HelpCircle,
  diagram_design: BookOpen,
  code_generation: Code,
  troubleshooting: AlertCircle,
  best_practices: Lightbulb
};

const CATEGORY_COLORS = {
  getting_started: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  diagram_design: 'bg-green-100 text-green-800 hover:bg-green-200',
  code_generation: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  troubleshooting: 'bg-red-100 text-red-800 hover:bg-red-200',
  best_practices: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
};

const categorizeQuestion = (question: string): QuickQuestion['category'] => {
  const lower = question.toLowerCase();
  
  if (lower.includes('empiezo') || lower.includes('crear') || lower.includes('comenzar')) {
    return 'getting_started';
  }
  if (lower.includes('genero') || lower.includes('código') || lower.includes('springboot')) {
    return 'code_generation';
  }
  if (lower.includes('error') || lower.includes('problema') || lower.includes('soluciono')) {
    return 'troubleshooting';
  }
  if (lower.includes('mejor') || lower.includes('optimizo') || lower.includes('práctica')) {
    return 'best_practices';
  }
  return 'diagram_design';
};

const QuickQuestions: React.FC<QuickQuestionsProps> = ({
  questions,
  onQuestionClick,
  isLoading = false,
  contextMode
}) => {
  if (questions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No hay sugerencias disponibles</p>
        <p className="text-xs mt-1">Escribe una pregunta para comenzar</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          {contextMode === 'diagram' ? 'Preguntas sobre tu diagrama' : 'Preguntas frecuentes'}
        </h4>
        <Badge variant="outline" className="text-xs">
          {questions.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {questions.map((question, index) => {
          const category = categorizeQuestion(question);
          const IconComponent = CATEGORY_ICONS[category];
          
          return (
            <Button
              key={`${question}-${index}`}
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={() => onQuestionClick(question)}
              className={`
                w-full justify-start text-left h-auto p-3 
                border border-gray-200 rounded-lg 
                hover:border-gray-300 hover:shadow-sm 
                transition-all duration-200
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className="flex items-start gap-3 w-full">
                <div className={`
                  flex-shrink-0 p-1.5 rounded-full
                  ${CATEGORY_COLORS[category]}
                `}>
                  <IconComponent className="w-3 h-3" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                    {question}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {category.replace('_', ' ')}
                  </p>
                </div>
                
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </Button>
          );
        })}
      </div>

      {contextMode === 'diagram' && questions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-blue-800 font-medium">
              Sugerencia inteligente
            </p>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Estas preguntas están basadas en el estado actual de tu diagrama
          </p>
        </div>
      )}
    </div>
  );
};

export default QuickQuestions;
