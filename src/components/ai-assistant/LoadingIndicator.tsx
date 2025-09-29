/**
 * Loading Indicator Component
 * AI thinking animation for the AI Assistant
 */

import React from 'react';
import { Loader2, Brain, Sparkles } from 'lucide-react';

interface LoadingIndicatorProps {
  message?: string;
  variant?: 'thinking' | 'processing' | 'analyzing';
  size?: 'sm' | 'md' | 'lg';
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  variant = 'thinking',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const messages = {
    thinking: message || 'Analizando tu pregunta...',
    processing: message || 'Procesando información...',
    analyzing: message || 'Analizando diagrama...'
  };

  const icons = {
    thinking: Brain,
    processing: Loader2,
    analyzing: Sparkles
  };

  const IconComponent = icons[variant];

  return (
    <div className="flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        {/* Animated Icon */}
        <div className="relative">
          <IconComponent 
            className={`${sizeClasses[size]} text-blue-600 ${
              variant === 'processing' ? 'animate-spin' : 'animate-pulse'
            }`} 
          />
          
          {/* Pulsing Ring Effect */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping" />
        </div>

        {/* Loading Message */}
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            {messages[variant]}
          </p>
          
          {/* Typing Dots Animation */}
          <div className="flex justify-center gap-1 mt-2">
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{
            animation: 'loading-progress 2s ease-in-out infinite'
          }} />
        </div>
      </div>

    </div>
  );
};

// Minimal loading spinner for inline use
export const MiniLoadingIndicator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`inline-flex items-center gap-2 ${className}`}>
    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
    <span className="text-xs text-gray-600">Cargando...</span>
  </div>
);

export default LoadingIndicator;
