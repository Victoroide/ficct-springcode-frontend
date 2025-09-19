import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAppDispatch } from '@/hooks/redux'
import { useRevokeSessionsMutation } from '@/store/api/authApi'
import { addNotification } from '@/store/slices/uiSlice'

interface RevokeSessionsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const RevokeSessionsModal: React.FC<RevokeSessionsModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('')
  const [keepCurrent, setKeepCurrent] = useState(true)
  const dispatch = useAppDispatch()
  
  const [revokeSessionsMutation, { isLoading }] = useRevokeSessionsMutation()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'La contraseña es requerida'
      }))
      return
    }

    try {
      const result = await revokeSessionsMutation({
        password,
        keep_current: keepCurrent
      }).unwrap()

      dispatch(addNotification({
        type: 'success',
        title: 'Sesiones revocadas',
        message: `Se cerraron ${result.sessions_revoked} sesiones exitosamente`
      }))

      setPassword('')
      onClose()
    } catch (error: any) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error al revocar sesiones',
        message: error?.data?.message || 'No se pudieron cerrar las sesiones'
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-6">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Revocar Todas las Sesiones</h3>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Security Warning */}
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <div className="text-sm">
                <h4 className="font-medium text-red-800 mb-1">Acción de Seguridad</h4>
                <p className="text-red-700">
                  Esta acción cerrará todas las sesiones activas en todos los dispositivos. 
                  Será necesario volver a iniciar sesión en cada dispositivo.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password Input */}
            <div>
              <Label htmlFor="revoke-password" className="block text-sm font-medium text-slate-700 mb-2">
                Confirma tu contraseña
              </Label>
              <Input
                id="revoke-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                required
                disabled={isLoading}
              />
            </div>

            {/* Keep Current Session Option */}
            <div className="flex items-center space-x-2">
              <input
                id="keep-current"
                type="checkbox"
                checked={keepCurrent}
                onChange={(e) => setKeepCurrent(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                disabled={isLoading}
              />
              <Label htmlFor="keep-current" className="text-sm text-slate-700">
                Mantener esta sesión activa
              </Label>
            </div>

            {/* Info about what will happen */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div className="text-sm text-blue-700">
                  {keepCurrent 
                    ? "Se cerrarán todas las sesiones excepto la actual."
                    : "Se cerrarán TODAS las sesiones, incluyendo la actual. Tendrás que volver a iniciar sesión."
                  }
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button"
                variant="outline"
                onClick={onClose} 
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                variant="destructive"
                className="flex-1"
                disabled={isLoading || !password}
              >
                {isLoading ? 'Revocando...' : 'Revocar Sesiones'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
