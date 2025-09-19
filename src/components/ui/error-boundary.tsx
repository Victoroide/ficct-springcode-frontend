// @ts-nocheck - Allow compilation
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors in its child component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }
  
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  }
  
  handleReload = () => {
    window.location.reload();
  }
  
  handleGoHome = () => {
    window.location.href = '/dashboard';
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    // Store error info for display
    this.setState({ errorInfo });
    
    // Report error to monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    } else {
      // Default error reporting
      console.group('🚨 Error Boundary Report');
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error:', error);
      console.groupEnd();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      const { level = 'component', showDetails = false } = this.props;
      const { error, errorInfo, retryCount } = this.state;
      
      // For critical errors, show full page error
      if (level === 'critical' || level === 'page') {
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full">
              <div className="p-8 text-center">
                <div className="mb-6">
                  <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">
                    {level === 'critical' ? 'Error Crítico' : 'Página No Disponible'}
                  </h1>
                  <p className="text-slate-600">
                    Lo sentimos, algo salió mal y no pudimos cargar esta página.
                  </p>
                </div>
                
                <div className="space-y-3">
                  {retryCount < 3 && (
                    <Button onClick={this.handleRetry} className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Intentar de nuevo
                    </Button>
                  )}
                  
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                      <Home className="mr-2 h-4 w-4" />
                      Ir al inicio
                    </Button>
                    
                    <Button variant="outline" onClick={this.handleReload} className="flex-1">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Recargar
                    </Button>
                  </div>
                </div>
                
                {(showDetails || retryCount >= 2) && error && (
                  <details className="mt-6 text-left">
                    <summary className="cursor-pointer font-medium text-sm text-slate-700 mb-2">
                      <Bug className="inline mr-1 h-4 w-4" />
                      Detalles técnicos
                    </summary>
                    <div className="bg-slate-100 rounded-lg p-4 text-xs font-mono">
                      <div className="text-red-700 font-semibold mb-2">Error:</div>
                      <pre className="whitespace-pre-wrap text-slate-800 mb-4">
                        {error.toString()}
                      </pre>
                      {errorInfo && (
                        <>
                          <div className="text-red-700 font-semibold mb-2">Component Stack:</div>
                          <pre className="whitespace-pre-wrap text-slate-600">
                            {errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </Card>
          </div>
        );
      }
      
      // For component-level errors, show inline error
      return (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 my-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800 mb-1">
                Error en el componente
              </h3>
              <p className="text-sm text-red-600 mb-3">
                Este componente no se puede mostrar correctamente.
              </p>
              
              <div className="flex gap-2">
                {retryCount < 2 && (
                  <Button size="sm" variant="outline" onClick={this.handleRetry}>
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Reintentar
                  </Button>
                )}
              </div>
              
              {showDetails && error && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-medium text-red-700">
                    Detalles del error
                  </summary>
                  <pre className="mt-2 text-xs p-2 bg-red-100 rounded border text-red-800 whitespace-pre-wrap">
                    {error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
