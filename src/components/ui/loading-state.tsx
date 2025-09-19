import React from 'react';

interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  isOverlay?: boolean;
  className?: string;
}

/**
 * LoadingState Component
 * Displays a loading indicator with optional text while content is loading
 */
export function LoadingState({ 
  isLoading, 
  children, 
  text = 'Cargando...', 
  size = 'md',
  isOverlay = false,
  className = '' 
}: LoadingStateProps) {
  // Size classes for spinner
  const spinnerSizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };
  
  // Size classes for text
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  if (!isLoading) {
    return <>{children}</>;
  }
  
  if (isOverlay) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
          <div className="flex flex-col items-center">
            <div className={`animate-spin rounded-full border-t-2 border-blue-600 ${spinnerSizes[size]}`} />
            {text && <div className={`mt-2 text-blue-600 ${textSizes[size]}`}>{text}</div>}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <div className={`animate-spin rounded-full border-t-2 border-blue-600 ${spinnerSizes[size]}`} />
      {text && <div className={`mt-2 text-slate-600 ${textSizes[size]}`}>{text}</div>}
    </div>
  );
}
