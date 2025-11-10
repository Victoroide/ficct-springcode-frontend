import React from 'react'

// Re-export toast from the main toast component
export { toast } from './toast'

// Hook for using toast (simplified version)
export const useToast = () => {
  return {
    toast: (props: any) => {
      // This is a simplified implementation
      // The actual toast is imported from './toast' above
    }
  }
}
