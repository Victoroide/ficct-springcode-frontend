import React from 'react';

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  additionalData?: Record<string, unknown>;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  fallbackAction?: () => void;
  retryable?: boolean;
  maxRetries?: number;
}

export class EnhancedErrorService {
  private static instance: EnhancedErrorService;
  private errorQueue: Array<{ error: Error; context: ErrorContext }> = [];
  private retryAttempts: Map<string, number> = new Map();

  private constructor() {
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): EnhancedErrorService {
    if (!EnhancedErrorService.instance) {
      EnhancedErrorService.instance = new EnhancedErrorService();
    }
    return EnhancedErrorService.instance;
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('error', (event) => {
      this.handleError(
        new Error(event.message),
        {
          component: 'Global',
          action: 'Runtime Error',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        },
        { logToConsole: true, reportToService: true }
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          component: 'Global',
          action: 'Promise Rejection',
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          additionalData: { reason: event.reason }
        },
        { logToConsole: true, reportToService: true }
      );
    });
  }

  public handleError(
    error: Error | unknown,
    context: Partial<ErrorContext>,
    options: ErrorHandlerOptions = {}
  ): void {
    const defaultOptions: ErrorHandlerOptions = {
      showToast: true,
      logToConsole: true,
      reportToService: false,
      retryable: false,
      maxRetries: 3
    };

    const finalOptions = { ...defaultOptions, ...options };
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    
    const fullContext: ErrorContext = {
      component: 'Unknown',
      action: 'Unknown',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
      ...context
    };

    if (finalOptions.logToConsole) {
      console.error('[Enhanced Error Service]', {
        error: errorInstance,
        context: fullContext,
        stack: errorInstance.stack
      });
    }

    if (finalOptions.showToast) {
      this.showErrorToast(errorInstance, fullContext);
    }

    if (finalOptions.reportToService) {
      this.reportError(errorInstance, fullContext);
    }

    if (finalOptions.retryable) {
      this.handleRetryableError(errorInstance, fullContext, finalOptions);
    }

    if (finalOptions.fallbackAction) {
      try {
        finalOptions.fallbackAction();
      } catch (fallbackError) {
        console.error('Fallback action failed:', fallbackError);
      }
    }
  }

  private showErrorToast(error: Error, context: ErrorContext): void {
    const message = this.getUserFriendlyMessage(error, context);
    
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('show-error-toast', {
        detail: { message, error, context }
      });
      window.dispatchEvent(event);
    }
  }

  private getUserFriendlyMessage(error: Error, context: ErrorContext): string {
    if (error.message.includes('Network Error') || error.message.includes('fetch')) {
      return 'Error de conexión. Por favor, verifica tu conexión a internet.';
    }
    
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
    }
    
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'No tienes permisos para realizar esta acción.';
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'El recurso solicitado no fue encontrado.';
    }
    
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'Error interno del servidor. Por favor, intenta más tarde.';
    }

    if (context.component.includes('UML')) {
      return 'Error en el diseñador UML. Por favor, guarda tu trabajo e intenta nuevamente.';
    }
    
    if (context.component.includes('Generation') || context.component.includes('Code')) {
      return 'Error en la generación de código. Por favor, revisa tu configuración.';
    }
    
    if (context.component.includes('Collaboration')) {
      return 'Error en la colaboración en tiempo real. Reconectando...';
    }

    return 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.';
  }

  private reportError(error: Error, context: ErrorContext): void {
    this.errorQueue.push({ error, context });
    
    if (this.errorQueue.length >= 5) {
      this.flushErrorQueue();
    } else {
      setTimeout(() => this.flushErrorQueue(), 10000);
    }
  }

  private async flushErrorQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    try {
      const response = await fetch('/api/v1/errors/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          errors: errors.map(({ error, context }) => ({
            message: error.message,
            stack: error.stack,
            context
          }))
        })
      });

      if (!response.ok) {
        console.warn('Failed to report errors to service');
      }
    } catch (reportError) {
      console.warn('Error reporting failed:', reportError);
      this.errorQueue.unshift(...errors);
    }
  }

  private handleRetryableError(
    error: Error, 
    context: ErrorContext, 
    options: ErrorHandlerOptions
  ): void {
    const retryKey = `${context.component}-${context.action}`;
    const currentAttempts = this.retryAttempts.get(retryKey) || 0;
    
    if (currentAttempts < (options.maxRetries || 3)) {
      this.retryAttempts.set(retryKey, currentAttempts + 1);
      
      const delay = Math.pow(2, currentAttempts) * 1000;
      setTimeout(() => {
        if (options.fallbackAction) {
          options.fallbackAction();
        }
      }, delay);
    } else {
      this.retryAttempts.delete(retryKey);
      console.error(`Max retry attempts reached for ${retryKey}`);
    }
  }

  public clearRetryAttempts(component: string, action: string): void {
    const retryKey = `${component}-${action}`;
    this.retryAttempts.delete(retryKey);
  }

  public getErrorStats(): { total: number; byComponent: Record<string, number> } {
    const stats = { total: 0, byComponent: {} };
    
    this.errorQueue.forEach(({ context }) => {
      stats.total++;
      stats.byComponent[context.component] = (stats.byComponent[context.component] || 0) + 1;
    });
    
    return stats;
  }
}

export const enhancedErrorService = EnhancedErrorService.getInstance();

export function useErrorHandler(component: string) {
  const handleError = React.useCallback((
    error: Error | unknown,
    action: string,
    options?: ErrorHandlerOptions
  ) => {
    enhancedErrorService.handleError(error, { component, action }, options);
  }, [component]);

  const clearRetries = React.useCallback((action: string) => {
    enhancedErrorService.clearRetryAttempts(component, action);
  }, [component]);

  return { handleError, clearRetries };
}
