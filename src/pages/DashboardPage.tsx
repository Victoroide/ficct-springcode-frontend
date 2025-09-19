import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { LogoIcon } from '@/components/icons'
import { SecurityStatusCard } from '@/components/user/SecurityStatusCard'
import { SecurityPanel } from '@/components/dashboard/SecurityStatusPanel/SecurityPanel'
import { LogoutModal } from '@/components/dashboard/LogoutModal'
import { RevokeSessionsModal } from '@/components/dashboard/RevokeSessionsModal'
import { TwoFactorSetupModal } from '@/components/dashboard/Modals/TwoFactorSetupModal'
import { BackupCodesModal } from '@/components/dashboard/Modals/BackupCodesModal'
import { SecurityWizardModal } from '@/components/dashboard/Modals/SecurityWizardModal'
import { ProfileModal } from '@/components/dashboard/UserProfile/ProfileModal'
import { SettingsModal } from '@/components/dashboard/Modals/SettingsModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { setModal } from '@/store/slices/uiSlice'
import { selectUserProfile } from '@/store/slices/userSlice'

export const DashboardPage: React.FC = () => {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [show2FASetup, setShow2FASetup] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showSecurityWizard, setShowSecurityWizard] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  
  const dispatch = useAppDispatch()
  const userProfile = useAppSelector(selectUserProfile)
  const authState = useAppSelector((state) => state.auth) as any
  const [autoSaveLabel, setAutoSaveLabel] = useState('—')
  const { modals } = useAppSelector((state) => (state as any).ui || { modals: { logout: false, revokeAllSessions: false } })

  const getUserInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleLogoutClick = () => {
    setUserDropdownOpen(false)
    dispatch(setModal({ modal: 'logout', open: true }))
  }

  const handleProfileClick = () => {
    setUserDropdownOpen(false)
    setShowProfileModal(true)
  }

  const handleSettingsClick = () => {
    setUserDropdownOpen(false)
    setShowSettingsModal(true)
  }

  const handleSecurityClick = () => {
    setUserDropdownOpen(false)
    setShowSecurityWizard(true)
  }

  const handleOpen2FASetup = () => {
    setShow2FASetup(true)
  }

  const handleOpenBackupCodes = () => {
    setShowBackupCodes(true)
  }

  const handleStartSecurityWizard = () => {
    setShowSecurityWizard(true)
  }

  const handle2FAComplete = (codes: string[]) => {
    setBackupCodes(codes)
    setShow2FASetup(false)
    setShowBackupCodes(true)
  }

  const lastActivityLabel = useMemo(() => {
    if (!userProfile?.last_login) return 'N/A'
    const diffMs = Date.now() - new Date(userProfile.last_login).getTime()
    const diffMinutes = Math.round(diffMs / 60000)
    if (diffMinutes < 60) return `hace ${diffMinutes} min`
    const diffHours = Math.round(diffMinutes / 60)
    if (diffHours < 24) return `hace ${diffHours} h`
    const diffDays = Math.round(diffHours / 24)
    return `hace ${diffDays} d`
  }, [userProfile?.last_login])

  const sessionDurationLabel = useMemo(() => {
    if (!authState?.lastAuthenticated) return '—'
    const diffMs = Date.now() - new Date(authState.lastAuthenticated).getTime()
    const diffMinutes = Math.round(diffMs / 60000)
    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60
    return `${hours}h ${minutes.toString().padStart(2,'0')}m`
  }, [authState?.lastAuthenticated])

  const ipAddress = userProfile?.last_login_ip || '—'
  const projectLabel = userProfile?.department || userProfile?.company_domain || '—'
  const deviceTrusted = userProfile?.email_verified || false

  useEffect(() => {
    const update = () => {
      if (!authState?.lastAuthenticated) {
        setAutoSaveLabel('—')
        return
      }
      const diffMs = Date.now() - new Date(authState.lastAuthenticated).getTime()
      const diffSeconds = Math.round(diffMs / 1000)
      setAutoSaveLabel(`hace ${diffSeconds}s`)
    }
    update()
    const id = setInterval(update, 5000)
    return () => clearInterval(id)
  }, [authState?.lastAuthenticated])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center mr-3">
                <LogoIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">SpringCode Generator</h1>
            </div>

            <div className="flex items-center space-x-6">
              
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-md px-3 py-1">
                <div className="relative">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <div className="absolute -inset-1 bg-green-400 rounded-full animate-pulse opacity-30"></div>
                </div>
                <span className="text-sm font-medium text-green-700">Guardado automático</span>
                <span className="text-xs text-green-600">{autoSaveLabel}</span>
              </div>

              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Departamento: {projectLabel}</span>
              </div>
            </div>

            <div className="relative">
              <button 
                type="button" 
                className="group flex items-center space-x-3 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              >
                <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {userProfile ? getUserInitials(userProfile.full_name) : 'US'}
                  </span>
                </div>
                
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-slate-900">{userProfile?.full_name}</div>
                  <div className="text-xs text-slate-500">{userProfile?.role_display || userProfile?.role}</div>
                </div>
                
                <svg className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50">
                  <div className="px-4 py-3 border-b border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-white">
                          {userProfile ? getUserInitials(userProfile.full_name) : 'US'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{userProfile?.full_name}</div>
                        <div className="text-sm text-slate-500">{userProfile?.corporate_email}</div>
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {userProfile?.role_display || userProfile?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h4 className="text-xs font-medium text-slate-900 uppercase tracking-wide mb-2">Información de Sesión</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Última actividad:</span>
                        <span className="text-slate-900 font-medium">{lastActivityLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tiempo de sesión:</span>
                        <span className="text-slate-900 font-medium">{sessionDurationLabel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">IP de acceso:</span>
                        <span className="text-slate-900 font-medium font-mono text-xs">{ipAddress}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Dispositivo confiable:</span>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          <span className={deviceTrusted ? 'text-green-700 text-xs font-medium' : 'text-red-700 text-xs font-medium'}>{deviceTrusted ? 'Verificado' : 'No verificado'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="py-2">
                    <button onClick={handleProfileClick} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150">
                      <svg className="h-4 w-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Mi Perfil
                    </button>
                    <button onClick={handleSettingsClick} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150">
                      <svg className="h-4 w-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                      Configuración
                    </button>
                    <button onClick={handleSecurityClick} className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition-colors duration-150">
                      <svg className="h-4 w-4 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                      </svg>
                      Seguridad y Privacidad
                    </button>
                    <div className="border-t border-slate-200 my-2"></div>
                    <button 
                      onClick={handleLogoutClick}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150 group"
                    >
                      <svg className="h-4 w-4 mr-3 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card className="shadow-sm p-6">
          <CardContent className="p-0">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Panel Principal</h2>
            <p className="text-slate-600">Bienvenido al generador de código SpringBoot desde diagramas UML.</p>
            
            <div className="mb-8">
              <SecurityPanel 
                onOpen2FASetup={handleOpen2FASetup}
                onOpenBackupCodes={handleOpenBackupCodes}
                onStartSecurityWizard={handleStartSecurityWizard}
              />
            </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Proyectos Recientes</h3>
                <p className="text-sm text-slate-600">Accede a tus últimos proyectos de generación de código.</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Diagramas UML</h3>
                <p className="text-sm text-slate-600">Diseña y edita tus diagramas de manera colaborativa.</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Generador de Código</h3>
                <p className="text-sm text-slate-600">Genera código SpringBoot automáticamente.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <LogoutModal 
        isOpen={modals.logout}
        onClose={() => dispatch(setModal({ modal: 'logout', open: false }))}
      />
      
      <RevokeSessionsModal 
        isOpen={modals.revokeAllSessions}
        onClose={() => dispatch(setModal({ modal: 'revokeAllSessions', open: false }))}
      />

      <TwoFactorSetupModal
        isOpen={show2FASetup}
        onClose={() => setShow2FASetup(false)}
        onComplete={handle2FAComplete}
      />

      <BackupCodesModal
        isOpen={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        existingCodes={backupCodes}
      />

      <SecurityWizardModal
        isOpen={showSecurityWizard}
        onClose={() => setShowSecurityWizard(false)}
        onEnable2FA={handleOpen2FASetup}
        onGenerateBackupCodes={handleOpenBackupCodes}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {userDropdownOpen && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setUserDropdownOpen(false)}
        />
      )}
    </div>
  )
}
