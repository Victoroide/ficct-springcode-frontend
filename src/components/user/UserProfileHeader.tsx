// @ts-nocheck
/**
 * User Profile Header
 * Displays user information in the header with profile dropdown
 */
import React, { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { selectUserFullName, selectUserRole, selectIs2FAEnabled, selectSecurityScore } from '@/store/slices/userSlice';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { 
  UserCircle, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  ShieldAlert,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

/**
 * UserProfileHeader - Displays user information and provides access to user-related features
 */
export function UserProfileHeader() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // User data from Redux store
  const fullName = useAppSelector(selectUserFullName) || 'User';
  const { role, roleDisplay } = useAppSelector(selectUserRole);
  const is2FAEnabled = useAppSelector(selectIs2FAEnabled);
  const securityScore = useAppSelector(selectSecurityScore);
  
  // Get user initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Handle logout action
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  // Determine security badge color based on 2FA status and security score
  const getSecurityBadgeVariant = () => {
    if (is2FAEnabled && securityScore >= 80) return 'success';
    if (is2FAEnabled || securityScore >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <div className="flex items-center gap-2">
      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="max-h-80 overflow-y-auto">
            {!is2FAEnabled && (
              <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
                <div className="font-medium">Enable 2FA</div>
                <div className="text-sm text-muted-foreground">Enhance your account security by enabling two-factor authentication</div>
              </DropdownMenuItem>
            )}
            {securityScore < 80 && (
              <DropdownMenuItem className="flex flex-col items-start cursor-pointer">
                <div className="font-medium">Security Recommendations</div>
                <div className="text-sm text-muted-foreground">Review security recommendations to improve your security score</div>
              </DropdownMenuItem>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Profile Dropdown */}
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <Avatar className="h-8 w-8 border border-primary/10">
              <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium">{fullName}</div>
              <div className="text-xs text-muted-foreground flex items-center">
                {roleDisplay || role}
                <Badge variant={getSecurityBadgeVariant() as any} className="ml-2 h-4 px-1">
                  {is2FAEnabled ? '2FA' : securityScore}
                </Badge>
              </div>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/profile')}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/security')}>
            {is2FAEnabled ? (
              <ShieldCheck className="mr-2 h-4 w-4 text-green-600" />
            ) : (
              <ShieldAlert className="mr-2 h-4 w-4 text-amber-600" />
            )}
            <span>Security</span>
            {!is2FAEnabled && <Badge variant="outline" className="ml-auto">Recommended</Badge>}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
