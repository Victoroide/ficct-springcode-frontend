import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { UserProfileDropdown } from './UserProfileDropdown';
import { ProfileModal } from './UserProfile';
import { SecuritySettings, TwoFactorSetup, BackupCodes, SecurityWizard } from './Security';
import { MobileNavigation } from './MobileNavigation';
import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { selectUserProfile } from '@/store/slices/userSlice';
import { 
  selectSecurityWizardActive,
  startSecurityWizard,
  endSecurityWizard
} from '@/store/slices/securitySlice';
import { useGetUserQuery } from '@/store/api/authApi';
import { useGetActiveSessionsQuery } from '@/services/userApiService';
import { extractUserData } from '@/utils/apiUtils';
import { LogoutModal } from './LogoutModal';
import { toast } from '@/components/ui/toast-service';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { ErrorBoundary, LoadingState } from '@/components/ui';

export function DashboardLayout() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const userProfile = useAppSelector(selectUserProfile);
  const securityWizardActive = useAppSelector(selectSecurityWizardActive);
  
  const { 
    data: userResponse,
    refetch: refetchUserProfile,
    isLoading: isLoadingProfile,
    error: profileError
  } = useGetUserQuery();
  
  const userData = extractUserData(userResponse);
  
  const { 
    refetch: refetchSessions,
    isLoading: isLoadingSessions
  } = useGetActiveSessionsQuery();
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false);
  const [isBackupCodesOpen, setIsBackupCodesOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  useEffect(() => {
    refetchUserProfile();
    refetchSessions();
  }, []);
  
  useEffect(() => {
    if (profileError) {
      toast({
        title: 'Error',
        description: 'No se pudo cargar el perfil de usuario.',
        variant: 'error',
      });
    }
  }, [profileError]);
  
  const handleOpenProfileModal = () => {
    setIsProfileModalOpen(true);
  };
  
  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
  };
  
  const handleOpenLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };
  
  const handleCloseLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };
  
  const handleNavigateToSettings = () => {
    navigate('/dashboard/settings');
  };
  
  const handleNavigateToSecurity = () => {
    navigate('/dashboard/security');
  };
  
  const handleOpen2FASetup = () => {
    setIs2FASetupOpen(true);
  };
  
  const handleClose2FASetup = () => {
    setIs2FASetupOpen(false);
  };
  
  const handleComplete2FASetup = (codes: string[]) => {
    setIs2FASetupOpen(false);
    setBackupCodes(codes);
    setIsBackupCodesOpen(true);
    
    refetchSecurityScore();
    refetchUserProfile();
  };
  
  const handleOpenBackupCodes = () => {
    setIsBackupCodesOpen(true);
  };
  
  const handleCloseBackupCodes = () => {
    setIsBackupCodesOpen(false);
    setBackupCodes([]);
  };
  
  const handleStartSecurityWizard = () => {
    dispatch(startSecurityWizard());
  };
  
  const handleEndSecurityWizard = () => {
    dispatch(endSecurityWizard());
    
    refetchUserProfile();
  };
  
  const isMobile = useIsMobile();
  
  const isLoading = isLoadingProfile || isLoadingSessions;
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">SpringCode</span>
            </div>
            
            <div className="ml-4 flex items-center">
              <UserProfileDropdown 
                onOpenProfileModal={handleOpenProfileModal}
                onOpenSettingsPage={handleNavigateToSettings}
                onOpenSecuritySettings={handleNavigateToSecurity}
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${isMobile ? 'pb-16' : ''}`}>
        <LoadingState isLoading={isLoading} isOverlay={true}>
          {securityWizardActive && (
            <ErrorBoundary>
              <div className="mb-6">
                <SecurityWizard 
                  onEnable2FA={handleOpen2FASetup}
                  onGenerateBackupCodes={handleOpenBackupCodes}
                  onComplete={handleEndSecurityWizard}
                />
              </div>
            </ErrorBoundary>
          )}
          
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </LoadingState>
      </main>
      
      <MobileNavigation />
      
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
      />
      
      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={handleCloseLogoutModal}
      />
      
      {is2FASetupOpen && (
        <TwoFactorSetup 
          onComplete={handleComplete2FASetup}
          onCancel={handleClose2FASetup}
        />
      )}
      
      {isBackupCodesOpen && (
        <BackupCodes 
          codes={backupCodes}
          onDone={handleCloseBackupCodes}
        />
      )}
    </div>
  );
}
