import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { Badge } from '@/components/ui/badge';
import { Home, User, Shield, Settings, Bell } from 'lucide-react';

interface NavLink {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow';
}

interface MobileNavigationProps {
  className?: string;
}

export function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const securityScore = useAppSelector(state => state.security?.securityScore || 85);
  const securityFeatures = useAppSelector(state => state.security?.features || []);
  const userProfile = useAppSelector(state => state.user?.profile);
  
  const securityIssues = securityFeatures.filter(f => !f.enabled && f.severity === 'high').length;
  const securityNeedsAttention = securityScore < 70 || securityIssues > 0;
  
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);
  
  const navLinks: NavLink[] = [
    {
      label: 'Inicio',
      path: '/dashboard',
      icon: <Home className="w-5 h-5" />
    },
    {
      label: 'Perfil',
      path: '/dashboard/profile',
      icon: <User className="w-5 h-5" />,
      badge: userProfile?.profile_completion < 80 ? 1 : undefined,
      badgeColor: 'blue'
    },
    {
      label: 'Seguridad',
      path: '/dashboard/security',
      icon: <Shield className="w-5 h-5" />,
      badge: securityNeedsAttention ? securityIssues || 1 : undefined,
      badgeColor: 'red'
    },
    {
      label: 'Config',
      path: '/dashboard/settings',
      icon: <Settings className="w-5 h-5" />
    },
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path ||
      (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <div className="block md:hidden">
      <div 
        className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-lg transition-transform duration-300 z-50 ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        } ${className}`}
      >
        <div className="pb-safe">
          <div className="flex items-center justify-around px-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative flex flex-col items-center py-2 px-3 min-w-0 flex-1 transition-colors duration-200 ${
                  isActive(link.path)
                    ? 'text-blue-600'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  {link.icon}
                  
                  {link.badge && (
                    <Badge 
                      className={`absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center min-w-[16px] ${
                        link.badgeColor === 'red' ? 'bg-red-500 hover:bg-red-600' :
                        link.badgeColor === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                        link.badgeColor === 'green' ? 'bg-green-500 hover:bg-green-600' :
                        'bg-yellow-500 hover:bg-yellow-600'
                      }`}
                    >
                      {link.badge > 9 ? '9+' : link.badge}
                    </Badge>
                  )}
                </div>
                
                <span className="text-xs mt-1 truncate max-w-full">{link.label}</span>
                
                {isActive(link.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="h-16" />
    </div>
  );
}
