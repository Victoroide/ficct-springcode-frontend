/**
 * AI Password Modal Component - Large Fullscreen Version
 * Provides password authentication interface for AI features
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface AIPasswordModalProps {
  isOpen: boolean;
  onAuthenticate: (password: string) => boolean;
  onClose: () => void;
  attempts: number;
  maxAttempts: number;
}

export const AIPasswordModal: React.FC<AIPasswordModalProps> = ({
  isOpen,
  onAuthenticate,
  onClose,
  attempts,
  maxAttempts
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShowPassword(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Por favor ingresa una contraseña');
      return;
    }

    const success = onAuthenticate(password);
    
    if (success) {
      setPassword('');
      setError('');
      onClose();
    } else {
      const remainingAttempts = maxAttempts - attempts - 1;
      if (remainingAttempts > 0) {
        setError(`Contraseña incorrecta. Intentos restantes: ${remainingAttempts}`);
      } else {
        setError('Demasiados intentos fallidos. Espera 5 minutos.');
      }
      setPassword('');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '40px 20px',
        overflow: 'auto'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
          width: '100%',
          maxWidth: '600px',
          overflow: 'hidden',
          position: 'relative',
          animation: 'modalFadeIn 0.3s ease-out',
          border: '1px solid #e5e7eb'
        }}
      >
        {/* Minimal Header */}
        <div 
          style={{
            padding: '48px 48px 32px',
            backgroundColor: '#fafbfc',
            borderBottom: '1px solid #e5e7eb',
            textAlign: 'center',
            position: 'relative'
          }}
        >
          <div 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              border: '1px solid #e5e7eb'
            }}
          >
            <svg 
              width="28" 
              height="28" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#6b7280" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h1 
            style={{
              margin: '0 0 12px 0',
              fontSize: '28px',
              fontWeight: '600',
              color: '#111827',
              letterSpacing: '-0.02em'
            }}
          >
            Autenticación Requerida
          </h1>
          <p 
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: '400',
              color: '#6b7280',
              lineHeight: '1.5'
            }}
          >
            Ingresa tu contraseña para acceder al asistente de IA
          </p>
        </div>
        
        {/* Form Section */}
        <form 
          onSubmit={handleSubmit}
          style={{
            padding: '40px 48px'
          }}
        >
          {/* Password Input */}
          <div style={{ marginBottom: '28px' }}>
            <label 
              htmlFor="ai-password-input"
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="ai-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                autoFocus
                autoComplete="off"
                style={{
                  width: '100%',
                  height: '48px',
                  padding: '0 48px 0 16px',
                  fontSize: '15px',
                  fontWeight: '400',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box',
                  backgroundColor: '#ffffff',
                  color: '#111827'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#9ca3af';
                  e.target.style.boxShadow = '0 0 0 3px rgba(156, 163, 175, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </>
                  ) : (
                    <>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div 
              style={{
                marginBottom: '24px',
                padding: '12px 16px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px'
              }}
            >
              <p 
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#dc2626',
                  lineHeight: '1.5'
                }}
              >
                {error}
              </p>
            </div>
          )}
          
          {/* Attempt Warning */}
          {attempts > 0 && attempts < maxAttempts && !error && (
            <div 
              style={{
                marginBottom: '24px',
                padding: '12px 16px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px'
              }}
            >
              <p 
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#92400e',
                  lineHeight: '1.5'
                }}
              >
                Intentos fallidos: {attempts} de {maxAttempts}
              </p>
            </div>
          )}
          
          {/* Action Buttons */}
          <div 
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '32px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: '#ffffff',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#d1d5db';
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              style={{
                flex: 1,
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: password.trim() ? '#374151' : '#d1d5db',
                border: 'none',
                borderRadius: '6px',
                cursor: password.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (password.trim()) {
                  e.currentTarget.style.backgroundColor = '#1f2937';
                }
              }}
              onMouseLeave={(e) => {
                if (password.trim()) {
                  e.currentTarget.style.backgroundColor = '#374151';
                }
              }}
            >
              Acceder
            </button>
          </div>
        </form>
        
        {/* Footer */}
        <div 
          style={{
            padding: '20px 48px',
            backgroundColor: '#fafbfc',
            borderTop: '1px solid #e5e7eb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <div>
              <p 
                style={{
                  margin: '0 0 6px 0',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#6b7280'
                }}
              >
                Información de seguridad
              </p>
              <ul 
                style={{
                  margin: 0,
                  padding: '0 0 0 18px',
                  fontSize: '13px',
                  color: '#9ca3af',
                  lineHeight: '1.6'
                }}
              >
                <li>La sesión expira después de 24 horas</li>
                <li>Máximo {maxAttempts} intentos antes del bloqueo temporal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
};
