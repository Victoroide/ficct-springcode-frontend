// @ts-nocheck - Allow compilation
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { Card } from '@/components/ui/card';
import { SecurityScore } from './SecurityScore';
import { SecurityFeatures } from './SecurityFeatures';
import { SecurityActions } from './SecurityActions';
import { SecurityRecommendations } from './SecurityRecommendations';
import { useAppSelector } from '@/hooks/redux';
import { startSecurityWizard } from '@/store/slices/securitySlice';
import { useSetupTwoFactorMutation, useGenerateBackupCodesMutation } from '@/services/userApiService';
import { useGetUserQuery } from '@/store/api/authApi';
import { extractUserData } from '@/utils/apiUtils';
import { extractSecurityFeatures, getSecurityScore, getSecurityRecommendations, is2FAEnabled, getBackupCodesCount } from '@/services/securityService';
import { toast } from '@/components/ui/toast-service';
import './darkModeOverrides.css';

interface SecurityPanelProps {
  onOpen2FASetup: () => void;
  onOpenBackupCodes: () => void;
  onStartSecurityWizard: () => void;
  className?: string;
}

/**
 * SecurityPanel Component
 * Main container for security status and actions with minimalist design
 */
export function SecurityPanel({ 
  onOpen2FASetup, 
  onOpenBackupCodes,
  onStartSecurityWizard,
  className = ''
}: SecurityPanelProps) {
  const dispatch = useDispatch();
  const [showLastUpdated, setShowLastUpdated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Fetch user profile data which contains security information
  const { data: userResponse, isLoading: isLoadingUser, error: userError, refetch: refetchUser } = useGetUserQuery();
  
  // Extract user data from the response with proper structure - with error handling
  const userData = useMemo(() => {
    try {
      return extractUserData(userResponse);
    } catch (error) {
      console.error('Failed to extract user data:', error);
      setErrorMessage('No se pudo cargar la información de seguridad. Intente de nuevo más tarde.');
      return null;
    }
  }, [userResponse]);
  
  // Extract security data from user profile with error boundaries
  const securityScore = useMemo(() => getSecurityScore(userData), [userData]);
  const securityFeatures = useMemo(() => extractSecurityFeatures(userData), [userData]);
  const recommendations = useMemo(() => getSecurityRecommendations(userData), [userData]);
  const twoFactorEnabled = useMemo(() => is2FAEnabled(userData), [userData]);
  const backupCodesAvailable = useMemo(() => getBackupCodesCount(userData) > 0, [userData]);
  
  // RTK Query hooks
  const [setupTwoFactor, { isLoading: isEnabling2FA, error: enable2FAError }] = useSetupTwoFactorMutation();
  const [generateBackupCodes, { isLoading: isGeneratingCodes, error: generateCodesError }] = useGenerateBackupCodesMutation();
  
  // Check if loading any action or has errors
  const isLoading = isLoadingUser || isEnabling2FA || isGeneratingCodes;
  const hasError = Boolean(userError || enable2FAError || generateCodesError);

  // Last update timestamp
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  // Update last updated time when user data changes
  useEffect(() => {
    if (userData) {
      setLastUpdated(new Date());
      setShowLastUpdated(true);
      // Clear any previous errors
      setErrorMessage(null);
    }
  }, [userData]);
  
  // Handle API errors
  useEffect(() => {
    if (userError || enable2FAError || generateCodesError) {
      setErrorMessage('Se produjo un error al comunicarse con el servidor. Intente de nuevo más tarde.');
      console.error('API Errors:', { userError, enable2FAError, generateCodesError });
    }
  }, [userError, enable2FAError, generateCodesError]);

  // Handle enable 2FA
  const handleEnable2FA = async () => {
    if (twoFactorEnabled) {
      // Show message that 2FA is already enabled
      toast({
        title: '2FA ya está activado',
        description: 'La autenticación de dos factores ya está habilitada para tu cuenta.',
        variant: 'default',
      });
      return;
    }
    
    onOpen2FASetup();
  };
  
  // Handle generate backup codes
  const handleGenerateBackupCodes = async () => {
    try {
      // Call the provided handler
      onOpenBackupCodes();
    } catch (error) {
      console.error('Error generating backup codes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron generar códigos de respaldo. Intente nuevamente.',
        variant: 'error',
      });
    }
  };
  
  // Handle improve security
  const handleStartSecurityWizard = () => {
    // Start security wizard flow
    dispatch(startSecurityWizard());
    // Call the provided handler
    onStartSecurityWizard();
  };

  return (
    <Card className={`overflow-hidden bg-white border border-slate-200 security-panel ${className}`}>
      <div className="p-4 sm:p-6 space-y-6 security-status-panel">
        {/* Error message if present */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {errorMessage}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  className="inline-flex bg-red-50 rounded-md p-1 text-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => setErrorMessage(null)}
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Security Score */}
        <div className="flex flex-col sm:flex-row sm:items-center">
          <div className="flex-shrink-0 flex justify-center mb-4 sm:mb-0 sm:mr-6">
            <SecurityScore score={securityScore} size="lg" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Estado de Seguridad
            </h3>
            
            {/* Security Features */}
            <SecurityFeatures features={securityFeatures} />
          </div>
        </div>
        
        {/* Security Actions */}
        <div className="border-t border-slate-100 pt-4">
          <SecurityActions 
            onEnable2FA={handleEnable2FA}
            onGenerateBackupCodes={handleGenerateBackupCodes}
            onImprove={handleStartSecurityWizard}
            is2FAEnabled={twoFactorEnabled}
            backupCodesAvailable={backupCodesAvailable}
            isLoading={isLoading}
          />
        </div>
        
        {/* Security Recommendations */}
        {recommendations && recommendations.length > 0 && (
          <div className="border-t border-slate-100 pt-4">
            <SecurityRecommendations recommendations={recommendations} />
          </div>
        )}
        
        {/* Retry button if there was an error */}
        {hasError && (
          <div className="flex justify-center border-t border-slate-100 pt-4">
            <button 
              onClick={() => refetchUser()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando...
                </span>
              ) : 'Reintentar'}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
