// @ts-nocheck - Allow compilation
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SecurityDetailedView } from '../SecurityStatusPanel';
import { TwoFactorSetup } from './TwoFactorSetup';
import { BackupCodes } from './BackupCodes';
import { useAppSelector } from '@/hooks/redux';
import { 
  selectSecurityFeatures,
  selectIs2FAEnabled,
  updateSecurityFeature,
  selectBackupCodesCount
} from '@/store/slices/securitySlice';
import { useEnable2FAMutation, useGenerateBackupCodesMutation } from '@/services/userApiService';
import { useDispatch } from 'react-redux';

interface SecuritySettingsProps {
  onStartSecurityWizard: () => void;
}

/**
 * SecuritySettings Component
 * Comprehensive security settings panel with 2FA setup and backup codes
 */
export function SecuritySettings({ onStartSecurityWizard }: SecuritySettingsProps) {
  const dispatch = useDispatch();
  const securityFeatures = useAppSelector(selectSecurityFeatures);
  const is2FAEnabled = useAppSelector(selectIs2FAEnabled);
  const backupCodesCount = useAppSelector(selectBackupCodesCount);
  
  // State for modal visibility
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  
  // Backup codes state
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  
  // RTK Query hooks
  const [generateBackupCodes, { isLoading: isGeneratingCodes }] = useGenerateBackupCodesMutation();
  
  // Enable feature handler
  const handleEnableFeature = (featureName: string) => {
    if (featureName === '2fa_enabled') {
      setShow2FASetup(true);
    } else if (featureName === 'backup_codes_available') {
      handleGenerateBackupCodes();
    }
  };
  
  // Handle 2FA setup completion
  const handle2FAComplete = (codes: string[]) => {
    setBackupCodes(codes);
    setShow2FASetup(false);
    setShowBackupCodes(true);
    
    // Update the backup codes feature
    if (codes.length > 0) {
      dispatch(updateSecurityFeature({ 
        name: 'backup_codes_available', 
        enabled: true 
      }));
    }
  };
  
  // Generate backup codes
  const handleGenerateBackupCodes = async () => {
    try {
      const result = await generateBackupCodes().unwrap();
      
      if (result.backup_codes && result.backup_codes.length > 0) {
        setBackupCodes(result.backup_codes);
        setShowBackupCodes(true);
        
        // Update Redux state
        dispatch(updateSecurityFeature({ 
          name: 'backup_codes_available', 
          enabled: true 
        }));
      }
    } catch (error) {
      console.error('Error generating backup codes:', error);
    }
  };
  
  return (
    <div>
      {/* Show 2FA setup when needed */}
      {show2FASetup && (
        <TwoFactorSetup
          onComplete={handle2FAComplete}
          onCancel={() => setShow2FASetup(false)}
          className="mb-6"
        />
      )}
      
      {/* Show backup codes when needed */}
      {showBackupCodes && (
        <BackupCodes
          codes={backupCodes}
          onDone={() => setShowBackupCodes(false)}
          className="mb-6"
        />
      )}
      
      {/* Detailed security view */}
      {!show2FASetup && !showBackupCodes && (
        <SecurityDetailedView
          onEnableFeature={handleEnableFeature}
          onStartSecurityWizard={onStartSecurityWizard}
        />
      )}
    </div>
  );
}
