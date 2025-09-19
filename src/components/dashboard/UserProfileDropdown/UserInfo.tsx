import React from 'react';
import { ShieldIcon } from '@/components/icons';

interface UserInfoProps {
  fullName: string | null;
  role: string | null;
  roleDisplay: string | null;
  isActive: boolean;
  is2FAEnabled?: boolean;
}

/**
 * UserInfo Component
 * Displays user name, role and security indicators
 */
export function UserInfo({ fullName, role, roleDisplay, isActive, is2FAEnabled }: UserInfoProps) {
  return (
    <div className="flex flex-col">
      {/* User name */}
      <div className="text-sm font-medium text-slate-900">
        {fullName || 'Usuario'}
      </div>
      
      {/* Role and status indicators */}
      <div className="flex items-center space-x-2 mt-0.5">
        {/* Role label */}
        <span className="text-xs text-slate-500">
          {roleDisplay || role || 'Usuario'}
        </span>
        
        {/* Status indicator */}
        <div className="flex items-center">
          <div className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-amber-500'}`}></div>
          <span className="ml-1 text-xs text-slate-500">{isActive ? 'Activo' : 'Inactivo'}</span>
        </div>
        
        {/* 2FA indicator */}
        {is2FAEnabled && (
          <div className="flex items-center text-blue-600">
            <ShieldIcon className="h-3 w-3" />
            <span className="ml-1 text-xs">2FA</span>
          </div>
        )}
      </div>
    </div>
  );
}
