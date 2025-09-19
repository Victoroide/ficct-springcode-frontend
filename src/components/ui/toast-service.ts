import { store } from '@/store';
import { addNotification } from '@/store/slices/uiSlice';

export interface ToastOptions {
  title?: string;
  description: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/**
 * Toast service for displaying notifications
 * Uses Redux store to manage notifications state
 */
export const toast = (options: ToastOptions) => {
  // Map variant to notification type
  const type = options.variant || 'info';
  
  // Add notification to store
  store.dispatch(
    addNotification({
      type,
      title: options.title || getDefaultTitle(type),
      message: options.description,
      duration: options.duration || 5000,
    })
  );
};

// Helper function to get default title based on type
function getDefaultTitle(type: string): string {
  switch (type) {
    case 'success':
      return '¡Operación exitosa!';
    case 'error':
      return 'Error';
    case 'warning':
      return 'Advertencia';
    default:
      return 'Información';
  }
}
