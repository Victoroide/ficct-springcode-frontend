import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/dateUtils';
import { useAppSelector } from '@/hooks/redux';
import { selectUserProfile } from '@/store/slices/userSlice';

interface AccountInfoProps {
  className?: string;
}

/**
 * AccountInfo Component
 * Displays user account information like creation date, role, and account status
 */
export function AccountInfo({ className = '' }: AccountInfoProps) {
  const userProfile = useAppSelector(selectUserProfile);
  
  if (!userProfile) {
    return null;
  }
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-slate-800 mb-4">Información de Cuenta</h3>
        
        <div className="space-y-4">
          {/* Role Information */}
          <InfoItem 
            label="Rol" 
            value={userProfile.role_display || userProfile.role || 'Usuario'}
          >
            <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
              {userProfile.role}
            </Badge>
          </InfoItem>
          
          {/* Employee ID */}
          {userProfile.employee_id && (
            <InfoItem 
              label="ID de Empleado" 
              value={userProfile.employee_id}
            />
          )}
          
          {/* Account Created */}
          <InfoItem 
            label="Cuenta Creada" 
            value={formatDate(userProfile.created_at)}
          >
            <Badge className="ml-2 bg-slate-100 text-slate-800 border-slate-200">
              {userProfile.account_age_days} días
            </Badge>
          </InfoItem>
          
          {/* Company Domain */}
          <InfoItem 
            label="Dominio Corporativo" 
            value={userProfile.company_domain}
          />
          
          {/* Account Status */}
          <InfoItem label="Estado de Cuenta">
            <div className="flex items-center">
              <span className={`h-2 w-2 rounded-full ${userProfile.is_active ? 'bg-green-500' : 'bg-amber-500'} mr-2`}></span>
              <span>{userProfile.is_active ? 'Activa' : 'Inactiva'}</span>
              {userProfile.is_staff && (
                <Badge className="ml-2 bg-slate-100 text-slate-800 border-slate-200">
                  Staff
                </Badge>
              )}
            </div>
          </InfoItem>
          
          {/* Last Password Change */}
          {userProfile.password_changed_at && (
            <InfoItem 
              label="Último Cambio de Contraseña" 
              value={formatDate(userProfile.password_changed_at)}
            >
              {userProfile.password_expires_in_days !== undefined && (
                <Badge 
                  className={`ml-2 ${
                    userProfile.password_expires_in_days < 10 
                      ? 'bg-red-100 text-red-800 border-red-200' 
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {userProfile.password_expires_in_days} días restantes
                </Badge>
              )}
            </InfoItem>
          )}
        </div>
      </div>
    </Card>
  );
}

interface InfoItemProps {
  label: string;
  value?: string;
  children?: React.ReactNode;
}

/**
 * InfoItem Component
 * Individual information item with label and value
 */
function InfoItem({ label, value, children }: InfoItemProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-1.5">
      <span className="text-sm font-medium text-slate-700 sm:w-1/3">{label}</span>
      <div className="text-sm text-slate-800 sm:w-2/3 flex items-center">
        {value && <span>{value}</span>}
        {children}
      </div>
    </div>
  );
}
