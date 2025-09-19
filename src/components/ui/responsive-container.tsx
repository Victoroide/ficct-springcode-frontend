import React from 'react';
import { useIsMobile, useIsTablet, useIsDesktop } from '@/hooks/useMediaQuery';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

/**
 * ResponsiveContainer Component
 * Applies different class names based on screen size
 */
export function ResponsiveContainer({
  children,
  className = '',
  mobileClassName = '',
  tabletClassName = '',
  desktopClassName = '',
}: ResponsiveContainerProps) {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  
  let responsiveClass = className;
  
  if (isMobile && mobileClassName) {
    responsiveClass = `${responsiveClass} ${mobileClassName}`;
  } else if (isTablet && tabletClassName) {
    responsiveClass = `${responsiveClass} ${tabletClassName}`;
  } else if (isDesktop && desktopClassName) {
    responsiveClass = `${responsiveClass} ${desktopClassName}`;
  }
  
  return (
    <div className={responsiveClass}>
      {children}
    </div>
  );
}

/**
 * MobileOnly Component
 * Only renders children on mobile screens
 */
export function MobileOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const isMobile = useIsMobile();
  return isMobile ? <>{children}</> : <>{fallback}</>;
}

/**
 * TabletOnly Component
 * Only renders children on tablet screens
 */
export function TabletOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const isTablet = useIsTablet();
  return isTablet ? <>{children}</> : <>{fallback}</>;
}

/**
 * DesktopOnly Component
 * Only renders children on desktop screens
 */
export function DesktopOnly({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const isDesktop = useIsDesktop();
  return isDesktop ? <>{children}</> : <>{fallback}</>;
}

/**
 * NotMobile Component
 * Only renders children on non-mobile screens (tablet and desktop)
 */
export function NotMobile({ children, fallback = null }: { children: React.ReactNode, fallback?: React.ReactNode }) {
  const isMobile = useIsMobile();
  return !isMobile ? <>{children}</> : <>{fallback}</>;
}
