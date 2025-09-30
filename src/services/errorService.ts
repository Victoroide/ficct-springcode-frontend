import { toast } from '@/components/ui/toast-service';

export const logErrorWithContext = (
  error: any, 
  component: string, 
  operation: string,
  context?: Record<string, any>
) => {
  const errorDetails = {
    timestamp: new Date().toISOString(),
    component,
    operation,
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    code: error?.code || error?.status,
    context: {
      ...context,
      url: window.location.href,
      userAgent: navigator.userAgent
    }
  };

  
  return errorDetails;
};

export const formatUserFriendlyError = (error: any): string => {
  if (error?.message?.includes('expired')) {
    return 'Su sesión ha expirado. Por favor inicie sesión nuevamente.';
  }
  
  if (error?.status === 401 || error?.message?.includes('Authentication')) {
    return 'Error de autenticación. Por favor verifique sus credenciales.';
  }
  
  if (error?.status === 403) {
    return 'No tiene permisos para realizar esta acción.';
  }
  
  if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network')) {
    return 'Error de conexión. Por favor verifique su conexión a internet.';
  }
  
  if (error?.status >= 500) {
    return 'Error del servidor. Por favor intente más tarde.';
  }
  
  return error?.message || error?.data?.message || 'Ha ocurrido un error. Por favor intente nuevamente.';
};

export const createErrorAttachment = (error: any, context: Record<string, any> = {}) => {
  const errorData = {
    error: {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      code: error?.code,
    },
    context: {
      ...context,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    },
    state: {
        auth: localStorage.getItem('springcode_auth_token') ? 'token_present' : 'no_token',
    }
  };
  
  return JSON.stringify(errorData, null, 2);
};

export const handleAuthError = (error: any, dispatch: any, logout: () => any) => {
  logErrorWithContext(error, 'Authentication', 'handleAuthError');
  
  if (
    error?.status === 401 || 
    error?.message?.includes('expired') || 
    error?.message?.includes('Authentication') ||
    error?.message?.includes('token')
  ) {
    dispatch(logout());
    return 'Por favor inicie sesión nuevamente.';
  }
  
  return formatUserFriendlyError(error);
};

export const setupGlobalErrorHandlers = () => {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    
    // Ignore WebSocket connection errors - they're handled gracefully by useWebSocket
    // These are expected when the backend is offline and shouldn't show error toasts
    const errorMessage = error?.message || String(error);
    if (
      errorMessage.includes('WebSocket') || 
      errorMessage.includes('ws://') ||
      errorMessage.includes('connection') && errorMessage.includes('closed')
    ) {
      console.info('WebSocket connection issue detected (backend may be offline) - ignoring toast notification');
      event.preventDefault(); // Prevent default unhandled rejection behavior
      return;
    }
    
    logErrorWithContext(
      error, 
      'Global', 
      'unhandledRejection',
      { promiseRejection: true }
    );
    
    // Show toast notification for unexpected errors
    toast({
      title: 'Error inesperado',
      description: formatUserFriendlyError(error),
      variant: 'error',
    });
  });

  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Ignore WebSocket-related errors
    const errorMessage = error?.message || event.message || '';
    if (
      errorMessage.includes('WebSocket') || 
      errorMessage.includes('ws://') ||
      (errorMessage.includes('connection') && errorMessage.includes('closed'))
    ) {
      console.info('WebSocket error detected - ignoring toast notification');
      event.preventDefault();
      return;
    }
    
    logErrorWithContext(
      error, 
      'Global', 
      'uncaughtException',
      { 
        fileName: event.filename,
        lineNo: event.lineno,
        colNo: event.colno
      }
    );
    
    event.preventDefault();
    
    // Show toast notification for unexpected errors
    toast({
      title: 'Error inesperado',
      description: 'Ha ocurrido un error en la aplicación.',
      variant: 'error',
    });
  });
};

export const retryWithBackoff = async<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 300,
  maxDelay = 5000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    const nextDelay = Math.min(delay * 2, maxDelay);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryWithBackoff(fn, retries - 1, nextDelay, maxDelay);
  }
};
