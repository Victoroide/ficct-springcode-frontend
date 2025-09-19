import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TwoFactorInput } from '@/components/auth/TwoFactorInput'
import { useRegisterMutation, useVerifyEmailMutation, useSetup2FAMutation } from '@/store/api/registrationApi'
import { useAppDispatch } from '@/hooks/redux'
import { addNotification } from '@/store/slices/uiSlice'

interface SecuritySetupStepProps {
  data: {
    fullName: string
    email: string
    password: string
    passwordConfirm: string
    company: string
    department: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'ANALYST' | ''
    teamSize: string
    experience: string
    useCases: string[]
  }
  onPrev: () => void
  onComplete: () => void
}

export const SecuritySetupStep: React.FC<SecuritySetupStepProps> = ({ data, onPrev, onComplete }) => {
  const [currentPhase, setCurrentPhase] = useState<'register' | 'verify-email' | 'setup-2fa' | 'complete'>('register')
  const [verificationToken, setVerificationToken] = useState('')
  
  const dispatch = useAppDispatch()
  const [register, { isLoading: isRegistering }] = useRegisterMutation()
  const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyEmailMutation()
  const [setup2FA, { isLoading: isSettingUp2FA }] = useSetup2FAMutation()

  const handleRegister = async () => {
    try {
      const result = await register({
        corporate_email: data.email,
        password: data.password,
        password_confirm: data.passwordConfirm,
        full_name: data.fullName,
        role: data.role as any,
        department: data.department || 'Desarrollo de Software'
      }).unwrap()

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          title: 'Registro exitoso',
          message: 'Se ha enviado un email de verificación a su cuenta'
        }))
        
        if (result.verification_required) {
          setCurrentPhase('verify-email')
        } else {
          setCurrentPhase('setup-2fa')
        }
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error en el registro',
        message: error?.data?.message || 'No se pudo completar el registro'
      }))
    }
  }

  const handleVerifyEmail = async () => {
    if (!verificationToken) {
      dispatch(addNotification({
        type: 'error',
        title: 'Token requerido',
        message: 'Ingrese el token de verificación recibido por email'
      }))
      return
    }

    try {
      const result = await verifyEmail({
        email: data.email,
        verification_token: verificationToken
      }).unwrap()

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          title: 'Email verificado',
          message: 'Su email ha sido verificado correctamente'
        }))
        setCurrentPhase('setup-2fa')
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error de verificación',
        message: error?.data?.message || 'Token de verificación inválido'
      }))
    }
  }

  const handleSetup2FA = async (code: string) => {
    try {
      const result = await setup2FA({
        email: data.email,
        qr_secret: code
      }).unwrap()

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          title: '2FA configurado',
          message: 'La autenticación de dos factores ha sido configurada exitosamente'
        }))
        setCurrentPhase('complete')
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error en 2FA',
        message: error?.data?.message || 'No se pudo configurar la autenticación de dos factores'
      }))
    }
  }

  const renderCurrentPhase = () => {
    switch (currentPhase) {
      case 'register':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Finalizar Registro</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Procederemos a crear su cuenta con la información proporcionada. 
                Este proceso incluye verificación de email y configuración de 2FA.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Resumen de Información</h4>
              <div className="space-y-2 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Nombre:</span>
                  <span className="font-medium text-slate-900">{data.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span className="font-medium text-slate-900">{data.email}</span>
                </div>
                <div className="flex justify-between">
                  <span>Empresa:</span>
                  <span className="font-medium text-slate-900">{data.company}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rol:</span>
                  <span className="font-medium text-slate-900">{data.role}</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleRegister}
              disabled={isRegistering}
              className="w-full"
            >
              {isRegistering ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </div>
        )

      case 'verify-email':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Verificar Email</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Se ha enviado un token de verificación a <strong>{data.email}</strong>. 
                Ingrese el código recibido para continuar.
              </p>
            </div>

            <div className="mb-6">
              <input
                type="text"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="Ingrese el token de verificación"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <Button 
              onClick={handleVerifyEmail}
              disabled={isVerifyingEmail || !verificationToken}
              className="w-full"
            >
              {isVerifyingEmail ? 'Verificando...' : 'Verificar Email'}
            </Button>
          </div>
        )

      case 'setup-2fa':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Configurar 2FA</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Configure la autenticación de dos factores para mayor seguridad. 
                Escanee el código QR con su aplicación autenticadora favorita.
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="mb-6">
              <div className="mx-auto w-32 h-32 bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <svg className="h-8 w-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                  </svg>
                  <span className="text-xs text-slate-500">Código QR</span>
                </div>
              </div>
              <p className="text-sm text-slate-500">
                Escanee con Google Authenticator, Authy u otra app 2FA
              </p>
            </div>

            <div className="mb-6">
              <TwoFactorInput
                onComplete={handleSetup2FA}
                isLoading={isSettingUp2FA}
              />
            </div>

            <p className="text-xs text-slate-500">
              Ingrese el código de 6 dígitos mostrado en su aplicación autenticadora
            </p>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto h-16 w-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">¡Registro Completado!</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                Su cuenta ha sido creada exitosamente. Será redirigido al panel de login 
                para acceder a SpringCode Generator.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <span className="text-sm font-medium text-green-800">
                  Todas las configuraciones completadas
                </span>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Configuración de Seguridad</h2>
        <p className="text-slate-600">Configure la seguridad de su cuenta</p>
      </div>

      <Card>
        <CardContent className="p-8">
          {renderCurrentPhase()}
        </CardContent>
      </Card>

      {currentPhase === 'register' && (
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="px-6"
          >
            <svg className="h-4 w-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
            </svg>
            Anterior
          </Button>
        </div>
      )}

      {/* Next Step Info */}
      {currentPhase === 'register' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">Proceso de Seguridad</h4>
              <p className="text-blue-700">
                Su cuenta será protegida con verificación de email y autenticación de dos factores (2FA) 
                obligatoria según las políticas corporativas de seguridad.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
