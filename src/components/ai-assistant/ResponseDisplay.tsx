/**
 * Response Display Component
 * Formats and displays AI Assistant responses with markdown support
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import type { AIAssistantResponse, AIConversationEntry } from '@/types/aiAssistant';

interface ResponseDisplayProps {
  response: AIAssistantResponse;
  conversationEntry?: AIConversationEntry;
  onSuggestionClick?: (suggestion: string) => void;
  onFeatureClick?: (feature: string) => void;
  onFeedback?: (rating: 1 | 2 | 3 | 4 | 5) => void;
  showFeedback?: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  conversationEntry,
  onSuggestionClick,
  onFeatureClick,
  onFeedback,
  showFeedback = true
}) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showRelatedFeatures, setShowRelatedFeatures] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(
    conversationEntry?.user_rating || null
  );

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleRating = (rating: 1 | 2 | 3 | 4 | 5) => {
    setUserRating(rating);
    onFeedback?.(rating);
  };

  const formatAnswer = (answer: string) => {
    // Simple markdown-like formatting
    return answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="space-y-4">
      {/* Main Answer */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Respuesta de IA</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {new Date(response.timestamp).toLocaleTimeString()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(response.answer, 'answer')}
              className="h-6 w-6 p-0"
            >
              {copiedText === 'answer' ? (
                <Check className="w-3 h-3 text-green-600" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>

        <div 
          className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatAnswer(response.answer) }}
        />

        {response.context_type && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <Badge variant="outline" className="text-xs">
              Contexto: {response.context_type}
            </Badge>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {response.suggestions && response.suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex items-center gap-2 mb-3 -ml-2 h-auto p-2"
          >
            {showSuggestions ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm font-medium text-blue-800">
              Sugerencias relacionadas ({response.suggestions.length})
            </span>
          </Button>

          {showSuggestions && (
            <div className="space-y-2">
              {response.suggestions.map((suggestion, index) => (
                <Button
                  key={`suggestion-${index}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="w-full justify-start h-auto p-2 text-left bg-white hover:bg-blue-100 border border-blue-200"
                >
                  <span className="text-sm text-blue-700">{suggestion}</span>
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Features */}
      {response.related_features && response.related_features.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRelatedFeatures(!showRelatedFeatures)}
            className="flex items-center gap-2 mb-3 -ml-2 h-auto p-2"
          >
            {showRelatedFeatures ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm font-medium text-green-800">
              Funciones relacionadas ({response.related_features.length})
            </span>
          </Button>

          {showRelatedFeatures && (
            <div className="space-y-2">
              {response.related_features.map((feature, index) => (
                <Button
                  key={`feature-${index}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => onFeatureClick?.(feature)}
                  className="w-full justify-between h-auto p-2 text-left bg-white hover:bg-green-100 border border-green-200"
                >
                  <span className="text-sm text-green-700">{feature}</span>
                  <ExternalLink className="w-3 h-3 text-green-600" />
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feedback */}
      {showFeedback && (
        <>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">¿Te fue útil esta respuesta?</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRating(rating as any)}
                  className={`h-8 w-8 p-0 ${
                    userRating && rating <= userRating 
                      ? 'text-yellow-500 bg-yellow-50' 
                      : 'text-gray-400 hover:text-yellow-500'
                  }`}
                >
                  {rating <= 2 ? (
                    <ThumbsDown className={`w-4 h-4 ${rating === 1 ? 'transform rotate-180' : ''}`} />
                  ) : (
                    <ThumbsUp className="w-4 h-4" />
                  )}
                </Button>
              ))}
            </div>
          </div>
          
          {userRating && (
            <div className="text-xs text-gray-500 text-center">
              Gracias por tu valoración. Esto nos ayuda a mejorar.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResponseDisplay;
