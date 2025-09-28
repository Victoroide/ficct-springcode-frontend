import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { removeNotification } from '@/store/slices/uiSlice'
import { cn } from '@/lib/utils'
// Theme styles removed

/**
 * Enhanced Toast Container with Portal rendering for proper z-index handling
 * Includes improved positioning, stacking, and animations
 */
export const ToastContainer: React.FC = () => {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector((state) => (state as any).ui?.notifications || [])
  
  // Create a portal container for proper stacking context
  const portalTarget = document.body
  
  if (!notifications || notifications.length === 0) return null
  
  // Use createPortal to ensure toasts are rendered at the document root
  return createPortal(
    <div 
      className="fixed top-0 right-0 z-[100] p-4 md:p-6 flex flex-col items-end pointer-events-none"
      style={{
        maxHeight: '100vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
      }}
    >
      <div className="space-y-3 w-full sm:w-auto max-w-[420px]">
        {notifications.map((notification: any) => (
          <Toast
            key={notification.id}
            notification={notification}
            onClose={() => dispatch(removeNotification(notification.id))}
          />
        ))}
      </div>
    </div>,
    portalTarget
  )
}

interface ToastProps {
  notification: {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message: string
    duration?: number
  }
  onClose: () => void
}

/**
 * Enhanced Toast component with animations and improved styling
 */
const Toast: React.FC<ToastProps> = ({ notification, onClose }) => {
  // Helper function for styles (light theme only)
  const getConditionalStyles = (styles: any) => {
    return styles.light || '';
  }

  const getIconColor = () => {
    switch (notification.type) {
      case 'success': 
        return 'text-green-500'
      case 'error': 
        return 'text-red-500'
      case 'warning': 
        return 'text-amber-500'
      default: 
        return 'text-blue-500'
    }
  }

  const getIcon = () => {
    const iconClass = cn("h-6 w-6", getIconColor())
    
    switch (notification.type) {
      case 'success':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        )
      case 'error':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L10 8.586l1.293-1.293a1 1 0 011.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707z" clipRule="evenodd"/>
          </svg>
        )
      case 'warning':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        )
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        )
    }
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success': 
        return 'bg-green-50 border-green-200'
      case 'error': 
        return 'bg-red-50 border-red-200'
      case 'warning': 
        return 'bg-yellow-50 border-yellow-200'
      default: 
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (notification.type) {
      case 'success': 
        return 'text-green-800'
      case 'error': 
        return 'text-red-800'
      case 'warning': 
        return 'text-yellow-800'
      default: 
        return 'text-blue-800'
    }
  }

  // Auto-close toast after duration (default 5 seconds)
  useEffect(() => {
    const duration = notification.duration || 5000
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [onClose, notification.duration])

  return (
    <div 
      className={cn(
        "w-full border rounded-lg shadow-lg p-4 pointer-events-auto",
        "animate-toast-enter opacity-100 translate-y-0",
        "transition-all duration-300 ease-in-out",
        getBackgroundColor()
      )}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1 pt-0.5">
          <p className={cn("text-sm font-semibold", getTextColor())}>
            {notification.title}
          </p>
          <p className={cn("mt-1 text-sm", getTextColor().replace('800', '700'))}>
            {notification.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={onClose}
            type="button"
            className={cn(
              "bg-transparent rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
"text-gray-400 hover:text-gray-600 focus:ring-blue-500"
            )}
          >
            <span className="sr-only">Cerrar</span>
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Toast function for programmatic toast creation
export const toast = (props: {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}) => {
  // This is a simplified implementation
  // In a real application, you'd dispatch to a toast store
  console.log('Toast:', props);
};
