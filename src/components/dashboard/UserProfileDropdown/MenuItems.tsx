import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserIcon, 
  SettingsIcon, 
  SecurityIcon,
  LogoutIcon 
} from '@/components/icons';

interface MenuItemsProps {
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenSecurity: () => void;
  onLogout: () => void;
  isLoading?: boolean;
  closeDropdown?: () => void;
}

/**
 * MenuItems Component
 * Displays the dropdown menu items for user profile actions
 */
export function MenuItems({ 
  onOpenProfile, 
  onOpenSettings, 
  onOpenSecurity, 
  onLogout,
  isLoading = false,
  closeDropdown
}: MenuItemsProps) {
  const navigate = useNavigate();
  
  // Handle menu item click with loading state
  const handleItemClick = (handler: () => void) => {
    if (isLoading) return; // Prevent actions while loading
    handler();
  };

  return (
    <div className="py-1">
      <MenuItem 
        icon={<UserIcon className="h-4 w-4" />}
        label="Mi Perfil" 
        onClick={() => handleItemClick(onOpenProfile)}
        disabled={isLoading}
      />
      
      <MenuItem 
        icon={<SettingsIcon className="h-4 w-4" />}
        label="Configuración" 
        onClick={() => handleItemClick(onOpenSettings)}
        disabled={isLoading}
      />
      
      <MenuItem 
        icon={<SecurityIcon className="h-4 w-4" />}
        label="Seguridad y Privacidad" 
        onClick={() => handleItemClick(onOpenSecurity)}
        disabled={isLoading}
      />
      
      <div className="my-1 h-px bg-slate-200"></div>
      
      <MenuItem 
        icon={<LogoutIcon className="h-4 w-4" />}
        label={isLoading ? "Cerrando sesión..." : "Cerrar Sesión"} 
        onClick={() => handleItemClick(onLogout)}
        variant="danger"
        disabled={isLoading}
      />
    </div>
  );
}

// Individual menu item component
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

function MenuItem({ icon, label, onClick, variant = 'default', disabled = false }: MenuItemProps) {
  const textColor = variant === 'danger' 
    ? 'text-red-600 hover:text-red-700 group-hover:text-red-700' 
    : 'text-slate-700 group-hover:text-blue-600';
    
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50';

  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm group transition-colors duration-150 ${disabledClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${textColor} ${disabled ? 'opacity-50' : ''}`}>
          {icon}
        </span>
        <span className={`${textColor} ${disabled ? 'opacity-50' : ''}`}>{label}</span>
      </div>
    </button>
  );
}
