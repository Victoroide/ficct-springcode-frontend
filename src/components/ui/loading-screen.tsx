import React from 'react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * LoadingScreen Component
 * Displays a full-screen or container loading state with optional message
 */
export function LoadingScreen({ message = 'Cargando...', fullScreen = true }: LoadingScreenProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center bg-white bg-opacity-90 ${
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 z-10'
      }`}
    >
      <div className="relative">
        {/* Spinner */}
        <div className="w-16 h-16">
          <div className="absolute inset-0 animate-spin">
            <div className="h-full w-full border-4 border-t-blue-600 border-b-blue-300 border-l-transparent border-r-transparent rounded-full"></div>
          </div>
          <div className="absolute inset-0 animate-ping opacity-30">
            <div className="h-full w-full border-4 border-blue-500 rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Message */}
      {message && (
        <div className="mt-4 text-slate-700 font-medium">{message}</div>
      )}
    </div>
  );
}
