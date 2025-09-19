import React from 'react';
import { Button } from '@/components/ui/button';
import { SecurityIcon, ShieldIcon } from '@/components/icons';

interface SecurityActionsProps {
  onImproveSecurityClick: () => void;
  onEnable2FAClick: () => void;
  onGenerateBackupCodesClick: () => void;
  is2FAEnabled: boolean;
  hasBackupCodes: boolean;
  isLoading?: boolean;
}

/**
 * SecurityActions Component
 * Provides quick action buttons for security features
 */
export function SecurityActions({ 
  onImproveSecurityClick, 
  onEnable2FAClick, 
  onGenerateBackupCodesClick,
  is2FAEnabled,
  hasBackupCodes,
  isLoading = false
}: SecurityActionsProps) {
  return (
    <div className="flex flex-col space-y-3">
      {/* Primary action button */}
      {/* <Button 
        onClick={onImproveSecurityClick}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
        disabled={isLoading}
      >
        <SecurityIcon className="mr-2 h-4 w-4" />
        Mejorar Seguridad
      </Button> */}
      
      {/* Secondary action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {/* <Button
          variant={is2FAEnabled ? "outline" : "secondary"}
          onClick={onEnable2FAClick}
          disabled={isLoading}
          className={is2FAEnabled ? "text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700" : ""}
        >
          <ShieldIcon className={`mr-2 h-4 w-4 ${is2FAEnabled ? "text-green-500" : ""}`} />
          {is2FAEnabled ? "2FA Activo" : "Activar 2FA"}
        </Button>
        
        <Button
          variant={hasBackupCodes ? "outline" : "secondary"}
          onClick={onGenerateBackupCodesClick}
          disabled={isLoading}
          className={hasBackupCodes ? "text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700" : ""}
        >
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          {hasBackupCodes ? "Ver Códigos" : "Generar Códigos"}
        </Button> */}
      </div>
    </div>
  );
}
