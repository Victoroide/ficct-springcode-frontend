import React from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  sidebarWidth?: string;
  sidebarPosition?: 'left' | 'right';
  className?: string;
}

/**
 * ResponsiveLayout Component
 * A responsive layout with optional sidebar that collapses on mobile
 */
export function ResponsiveLayout({
  children,
  sidebar,
  sidebarWidth = '300px',
  sidebarPosition = 'left',
  className = '',
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // On mobile, sidebar becomes a slide-in panel
  if (isMobile) {
    return (
      <div className={`relative ${className}`}>
        {/* Main content */}
        <div className="w-full">
          {children}
        </div>
        
        {/* Mobile sidebar toggle button */}
        {sidebar && (
          <button
            onClick={toggleSidebar}
            className="fixed bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {/* Mobile sidebar overlay */}
        {sidebar && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Mobile sidebar */}
        {sidebar && (
          <div
            className={`fixed top-0 ${
              sidebarPosition === 'left' ? 'left-0' : 'right-0'
            } h-full bg-white z-40 w-4/5 max-w-sm shadow-xl transform transition-transform duration-300 ${
              sidebarOpen ? 'translate-x-0' : sidebarPosition === 'left' ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-500"
              aria-label="Close sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-4 mt-12">
              {sidebar}
            </div>
          </div>
        )}
      </div>
    );
  }
  
  // Desktop layout with sidebar
  return (
    <div className={`flex ${className}`} style={{ minHeight: 'calc(100vh - 4rem)' }}>
      {/* Sidebar - left position */}
      {sidebar && sidebarPosition === 'left' && (
        <div className="flex-shrink-0" style={{ width: sidebarWidth }}>
          <div className="sticky top-16 p-4 h-full">
            {sidebar}
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-grow p-4">
        {children}
      </div>
      
      {/* Sidebar - right position */}
      {sidebar && sidebarPosition === 'right' && (
        <div className="flex-shrink-0" style={{ width: sidebarWidth }}>
          <div className="sticky top-16 p-4 h-full">
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}
