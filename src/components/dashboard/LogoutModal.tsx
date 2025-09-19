import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { logout } from '@/store/slices/authSlice'
import { useRevokeAllSessionsMutation, useGetActiveSessionsQuery } from '@/services/userApiService'
import { useLogoutMutation } from '@/store/api/authApi'
import { toast } from '@/components/ui/toast-service'
import { Loader2, Shield, LogOut, AlertTriangle, Clock } from 'lucide-react'

interface LogoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated, lastAuthenticated, tokens } = useAppSelector((state) => state.auth)
  const [logoutMutation, { isLoading: isLoggingOutAPI }] = useLogoutMutation()
  const [revokeAllSessions, { isLoading: isRevokingAll }] = useRevokeAllSessionsMutation()
  const { data: sessions, isLoading: isLoadingSessions } = useGetActiveSessionsQuery()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false)
  const [password, setPassword] = useState('')

  if (!isOpen) return null

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      if (tokens?.refresh_token) {
        await logoutMutation({ refresh_token: tokens.refresh_token }).unwrap()
      }
      
      dispatch(logout())
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión correctamente.',
        variant: 'success',
      })
      
      onClose()
    } catch (error) {
      
      dispatch(logout())
      
      toast({
        title: 'Sesión cerrada',
        description: 'Has cerrado sesión (sin conexión con el servidor).',
        variant: 'success',
      })
      
      onClose()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleRevokeAllSessions = async () => {
    if (!password.trim()) {
      toast({
        title: 'Error',
        description: 'La contraseña es requerida para revocar todas las sesiones.',
        variant: 'error',
      })
      return
    }
    
    try {
      await revokeAllSessions({ 
        password: password.trim(),
        keep_current: false
      }).unwrap()
      
      toast({
        title: 'Sesiones revocadas',
        description: 'Se han cerrado todas las sesiones activas en todos los dispositivos.',
        variant: 'success',
      })
      
      setShowRevokeAllModal(false)
      handleLogout()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron revocar las sesiones. Verifica tu contraseña.',
        variant: 'error',
      })
    }
  }
  
  const formatLastActivity = (date: string) => {
    try {
      return new Date(date).toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'No disponible'
    }
  }
  
  const getSessionDuration = () => {
    if (!lastAuthenticated) return 'No disponible'
    
    const now = new Date()
    const loginTime = new Date(lastAuthenticated)
    const diffMinutes = Math.floor((now.getTime() - loginTime.getTime()) / (1000 * 60))
    
    if (diffMinutes < 60) return `${diffMinutes} minutos`
    const hours = Math.floor(diffMinutes / 60)
    return `${hours} horas`
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              Confirmar Cierre de Sesión
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cerrar la sesión actual?
            </DialogDescription>
          </DialogHeader>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <h4 className="font-medium text-amber-800 mb-1">Protección de Datos</h4>
                <p className="text-amber-700">
                  Tu sesión se cerrará de forma segura. Todos los cambios no guardados se perderán. 
                  Los datos del proyecto se mantendrán protegidos según las políticas de seguridad corporativa.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-md p-4 mb-6">
            <h4 className="text-sm font-medium text-slate-900 mb-3">Resumen de Sesión</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Usuario:</span>
                <span className="font-medium">{user?.full_name || 'No disponible'}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="font-medium">{user?.corporate_email || 'No disponible'}</span>
              </div>
              <div className="flex justify-between">
                <span>Rol:</span>
                <span className="font-medium">{user?.role || 'No disponible'}</span>
              </div>
              <div className="flex justify-between">
                <span>Duración de sesión:</span>
                <span className="font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getSessionDuration()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Sesiones activas:</span>
                <span className="font-medium">
                  {isLoadingSessions ? '...' : sessions?.length || 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estado de guardado:</span>
                <span className="font-medium text-green-600">✓ Sincronizado</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowRevokeAllModal(true)}
              className="w-full text-left p-3 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-red-500 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-slate-900">Cerrar todas las sesiones</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Cierra sesión en todos los dispositivos ({sessions?.length || 1} activas)
                    </p>
                  </div>
                </div>
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={onClose} 
              className="flex-1"
              disabled={isLoggingOut}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={handleLogout} 
              className="flex-1"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cerrando...
                </>
              ) : (
                'Cerrar Sesión'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showRevokeAllModal} onOpenChange={setShowRevokeAllModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Revocar Todas las Sesiones
            </DialogTitle>
            <DialogDescription>
              Esta acción cerrará todas tus sesiones activas en otros dispositivos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Esto cerrará la sesión en todos los dispositivos. Introduce tu contraseña para confirmar.
            </p>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introduce tu contraseña"
                disabled={isRevokingAll}
              />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => setShowRevokeAllModal(false)}
                className="flex-1"
                disabled={isRevokingAll}
              >
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={handleRevokeAllSessions}
                className="flex-1"
                disabled={isRevokingAll || !password.trim()}
              >
                {isRevokingAll ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Revocando...
                  </>
                ) : (
                  'Revocar Todas'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
