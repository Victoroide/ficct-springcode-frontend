import React, { useState, useEffect } from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import { Card, CardContent } from '@/components/ui/card'
import { TwoFactorInput } from '@/components/auth/TwoFactorInput'
import { LogoIcon, EmailIcon, EyeIcon, LockIcon, CheckIcon, ShieldIcon } from '@/components/icons'
import { useLoginMutation, useVerify2FAMutation } from '@/store/api/authApi'
import { logErrorWithContext, formatUserFriendlyError } from '@/services/errorService'
import ErrorDebugger from '@/components/auth/ErrorDebugger'
import { env } from '@/config/environment'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { loginStart, loginSuccess, verify2FASuccess, loginFailure } from '@/store/slices/authSlice'
import { normalizeTokensResponse } from '@/utils/authUtils'

interface LoginPageProps {
  onNavigateToRegister?: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)
  const [emailValid, setEmailValid] = useState(false)
  const [twoFactorData, setTwoFactorData] = useState<{user_id?: number, session_id?: string, email?: string} | null>(null)
  
  const dispatch = useAppDispatch()
  const { requires2FA, isLoading, error } = useAppSelector((state) => state.auth)
  
  useEffect(() => {
  }, [requires2FA])
  
  const [login] = useLoginMutation()
  const [verify2FA] = useVerify2FAMutation()

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setEmail(value)
    
    const isValid = value.includes('@') && 
      (value.endsWith('.com') || value.endsWith('.org') || value.endsWith('.net'))
    setEmailValid(isValid)
  }

  const handleDirectLogin = async (email: string, password: string) => {
    try {
      dispatch(loginStart())
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          corporate_email: email,
          password: password
        })
      })
      
      const result = await response.json()
      
      if (!response.ok && !result.requires_2fa) {
        throw new Error(result.message || result.error || 'Error de autenticación')
      }
      
      
      if (result.requires_2fa) {
        
        setTwoFactorData({
          user_id: result.user_id,
          email: result.corporate_email,
          session_id: result.session_id
        })
        
        dispatch(loginSuccess(result))
        
      } else {
        dispatch(loginSuccess(result))
      }
    } catch (err: any) {
      const errorDetails = logErrorWithContext(err, 'LoginPage', 'handleDirectLogin', { email })
      
      // User-friendly error message
      const errorMessage = formatUserFriendlyError(err)
      dispatch(loginFailure(errorMessage))
      
      
      throw err
    }
  }

  const handle2FASubmit = async (code: string) => {
    try {
      if (!twoFactorData || !twoFactorData.user_id) {
        throw new Error('Datos insuficientes para verificación 2FA. Por favor, intente iniciar sesión nuevamente.')
      }
      
      
      const verificationPayload: any = {
        code: code,
        token: code,
        user_id: twoFactorData.user_id,
        email: twoFactorData.email || email
      }
      
      if (twoFactorData.session_id) {
        verificationPayload.session_id = twoFactorData.session_id
      }
      
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/2fa/verify/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verificationPayload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        if (errorData.code && Array.isArray(errorData.code) && errorData.code.includes("This field is required.")) {
          throw new Error('El código de verificación es requerido. Por favor, intente nuevamente.');
        }
        
        if (errorData.detail === "Authentication credentials were not provided.") {
          
          const alternativeResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/2fa/verify/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              code: code,
              token: code,
              verification_code: code,
              user_id: twoFactorData?.user_id,
              email: twoFactorData?.email || email
            })
          })
          
          if (!alternativeResponse.ok) {
            const altErrorData = await alternativeResponse.json()
            throw new Error(altErrorData.detail || altErrorData.message || 'Error al verificar el código 2FA')
          }
          
          const alternativeResult = await alternativeResponse.json()
          
          if ((alternativeResult.tokens && (alternativeResult.tokens.access || alternativeResult.tokens.access_token)) ||
              alternativeResult.access_token) {
            
            dispatch(verify2FASuccess(alternativeResult))
            return alternativeResult
          } else {
            throw new Error('Error en la verificación: No se recibieron tokens de acceso')
          }
        }
        
        throw new Error(errorData.detail || errorData.message || 'Error al verificar el código 2FA')
      }
      
      const result = await response.json()
      
      // Verificar si la respuesta tiene tokens (en cualquiera de los formatos)
      if ((result.tokens && (result.tokens.access || result.tokens.access_token)) ||
          result.access_token) {
        dispatch(verify2FASuccess(result))
      } else {
        throw new Error('Error en la verificación: No se recibieron tokens de acceso')
      }
    } catch (err: any) {
      const errorDetails = logErrorWithContext(
        err, 
        'LoginPage', 
        'handle2FASubmit', 
        { errorResponse: err?.data }
      )
      
      // User-friendly error message
      const errorMessage = formatUserFriendlyError(err)
      dispatch(loginFailure(errorMessage))
      
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-16 w-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
          <LogoIcon />
        </div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
          SpringCode Generator
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Acceso seguro a la plataforma corporativa
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow-sm rounded-lg border border-slate-200 sm:px-10">
          <CardContent className="p-0">
            {!requires2FA && (
              <LoginForm 
                onSubmit={handleDirectLogin}
                isLoading={isLoading}
                error={error}
              />
            )}

            {requires2FA ? (
              <div className="mt-6 bg-blue-50 rounded-md p-4 border border-blue-200">
                <div className="flex items-center mb-3">
                  <div className="flex-shrink-0 text-blue-600">
                    <LockIcon />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-slate-900">
                      Autenticación de dos factores
                    </h3>
                    <p className="text-sm text-slate-600">
                      Ingrese el código de 6 dígitos de su aplicación autenticadora
                    </p>
                  </div>
                </div>
                
                {env.isDevelopment() && (
                  <div className="mb-3 text-xs bg-blue-100 p-2 rounded">
                    Estado 2FA: {requires2FA ? 'Activo' : 'Inactivo'}
                  </div>
                )}
                
                <TwoFactorInput
                  onComplete={handle2FASubmit}
                  isLoading={isLoading}
                  error={error || undefined}
                />
                
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors duration-200"
                  >
                    Reenviar código de verificación
                  </button>
                </div>
              </div>
            ) : (
              env.isDevelopment() && (
                <div className="hidden text-xs">requires2FA: {String(requires2FA)}</div>
              )
            )}

            {error && !requires2FA && (
              <div className="mt-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="text-sm text-red-700">
                    {error}
                  </div>
                </div>
                
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center mb-4">
                <p className="text-sm text-slate-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    onClick={onNavigateToRegister}
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
                  >
                    Registrarse aquí
                  </button>
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-slate-500">
                  Versión Corporativa • Seguridad SOC 2 Tipo II
                </p>
                <div className="flex justify-center items-center mt-2 space-x-4">
                  <div className="flex items-center text-xs text-slate-400">
                    <ShieldIcon className="mr-1" />
                    Cifrado AES-256
                  </div>
                  <div className="flex items-center text-xs text-slate-400">
                    <CheckIcon className="h-3 w-3 mr-1" />
                    ISO 27001
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
