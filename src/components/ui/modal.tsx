import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal Component with improved rendering and z-index management
 * Implements overflow prevention on body when modal is open
 */
const Modal = ({ isOpen, onClose, children, className = '' }: ModalProps) => {
  useEffect(() => {
    // Prevent scrolling on body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ zIndex: 9999 }}
      data-testid="modal-container"
    >
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={onClose}
        data-testid="modal-backdrop"
      />
      <div 
        className={`relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
