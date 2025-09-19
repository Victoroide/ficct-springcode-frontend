import React, { useState } from 'react';
import { env } from '@/config/environment';
import { createErrorAttachment } from '@/services/errorService';

interface ErrorDebuggerProps {
  error: any;
  context?: Record<string, any>;
}

export function ErrorDebugger({ error, context = {} }: ErrorDebuggerProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  const isDevelopment = env.isDevelopment();
  const errorAttachment = isDevelopment ? createErrorAttachment(error, context) : null;
  
  const copyErrorToClipboard = () => {
    if (errorAttachment) {
      navigator.clipboard.writeText(errorAttachment);
    }
  };
  
  if (!error) return null;
  
  if (!isDevelopment) {
    return (
      <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-600 text-sm">{error.message || 'Ha ocurrido un error. Por favor intente nuevamente.'}</p>
      </div>
    );
  }
  
  return (
    <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50">
      <div className="flex items-center justify-between">
        <h3 className="text-red-700 font-medium">Error</h3>
        <button 
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-red-600 hover:text-red-800"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      
      <p className="text-red-600 text-sm mt-1">{error.message || 'An unknown error occurred'}</p>
      
      {showDetails && (
        <div className="mt-3">
          <div className="text-xs font-mono bg-white p-3 rounded border border-red-100 max-h-60 overflow-auto">
            <pre>{errorAttachment}</pre>
          </div>
          
          <div className="mt-2 flex justify-end">
            <button
              onClick={copyErrorToClipboard}
              className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded"
            >
              Copy Error Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ErrorDebugger;
