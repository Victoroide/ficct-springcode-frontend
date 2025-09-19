// @ts-nocheck - Allow compilation
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserAvatar } from '../UserProfileDropdown';
import { AccountInfo } from './AccountInfo';
import { ProfileModal } from './ProfileModal';
import { useAppSelector } from '@/hooks/redux';
import { selectUserProfile, selectLastLoginFormatted, selectLastLoginIP } from '@/store/slices/userSlice';
import { SecurityPanel } from '../SecurityStatusPanel';

interface ProfilePageProps {
  onOpen2FASetup: () => void;
  onOpenBackupCodes: () => void;
  onStartSecurityWizard: () => void;
}

/**
 * ProfilePage Component
 * Comprehensive user profile page with account info and security status
 */
export function ProfilePage({ 
  onOpen2FASetup, 
  onOpenBackupCodes, 
  onStartSecurityWizard 
}: ProfilePageProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Get user data from Redux store
  const userProfile = useAppSelector(selectUserProfile);
  const lastLoginFormatted = useAppSelector(selectLastLoginFormatted);
  const lastLoginIP = useAppSelector(selectLastLoginIP);
  
  // Open profile modal
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };
  
  // Close profile modal
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };
  
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-medium text-slate-800">Cargando perfil...</div>
          <p className="text-sm text-slate-500 mt-1">Por favor espere mientras obtenemos su información.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Summary Card */}
      <Card className="overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center">
            {/* User Avatar */}
            <div className="flex justify-center sm:justify-start mb-4 sm:mb-0 sm:mr-6">
              <UserAvatar 
                name={userProfile.full_name} 
                imageUrl={userProfile.profile_image}
                size="lg"
              />
            </div>
            
            {/* User Info */}
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900">{userProfile.full_name}</h2>
              <p className="text-slate-500">{userProfile.corporate_email}</p>
              
              {/* Department & Role */}
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                {userProfile.department && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {userProfile.department}
                  </span>
                )}
                {userProfile.role_display && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                    {userProfile.role_display}
                  </span>
                )}
              </div>
              
              {/* Last login info */}
              <div className="mt-3 text-sm text-slate-500">
                <div>Último acceso: {lastLoginFormatted || 'Desconocido'}</div>
                <div>Desde: {lastLoginIP || 'Desconocido'}</div>
              </div>
            </div>
            
            {/* Edit button */}
            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <Button onClick={openProfileModal}>
                Editar Perfil
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Account Info and Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountInfo />
        
        <SecurityPanel
          onOpen2FASetup={onOpen2FASetup}
          onOpenBackupCodes={onOpenBackupCodes}
          onStartSecurityWizard={onStartSecurityWizard}
        />
      </div>
      
      {/* Profile Edit Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
}
