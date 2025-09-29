/**
 * Responsive AI Assistant Component
 * Mobile-first AI Assistant with adaptive layouts for different screen sizes
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  Brain, 
  X, 
  ChevronUp,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';
import AIAssistant from './AIAssistant';
import { cn } from '@/lib/utils';

interface ResponsiveAIAssistantProps {
  diagramId?: string;
  diagramNodes?: any[];
  diagramEdges?: any[];
  currentAction?: string;
  hasUnsavedChanges?: boolean;
  isCollaborating?: boolean;
  onFeatureNavigation?: (feature: string) => void;
  className?: string;
}

type DeviceType = 'mobile' | 'tablet' | 'desktop';
type ViewMode = 'fab' | 'bottom-sheet' | 'modal';

const ResponsiveAIAssistant: React.FC<ResponsiveAIAssistantProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [viewMode, setViewMode] = useState<ViewMode>('modal');
  const [isDragging, setIsDragging] = useState(false);

  // Detect device type based on screen size
  useEffect(() => {
    const detectDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
        setViewMode('bottom-sheet');
      } else if (width < 1024) {
        setDeviceType('tablet');
        setViewMode('bottom-sheet');
      } else {
        setDeviceType('desktop');
        setViewMode('modal');
      }
    };

    // Initial detection
    detectDeviceType();

    // Listen for resize events
    window.addEventListener('resize', detectDeviceType);
    return () => window.removeEventListener('resize', detectDeviceType);
  }, []);

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to close on all devices
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
      
      // Ctrl/Cmd + H to toggle (desktop/tablet only)
      if ((event.ctrlKey || event.metaKey) && event.key === 'h' && deviceType !== 'mobile') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, deviceType]);

  // Touch gesture handling for mobile
  const handleTouchStart = (event: React.TouchEvent) => {
    if (deviceType === 'mobile' && isOpen) {
      setIsDragging(true);
    }
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (isDragging && deviceType === 'mobile') {
      const touch = event.touches[0];
      const threshold = window.innerHeight * 0.3;
      
      if (touch.clientY > threshold) {
        setIsOpen(false);
        setIsDragging(false);
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const FloatingActionButton = () => (
    <Button
      onClick={() => setIsOpen(true)}
      className={cn(
        "fixed shadow-lg z-40 transition-all duration-200 hover:scale-105",
        "bg-blue-600 hover:bg-blue-700 text-white",
        // Responsive positioning
        deviceType === 'mobile' 
          ? "bottom-4 right-4 w-12 h-12 rounded-full" 
          : deviceType === 'tablet'
          ? "bottom-6 right-6 w-14 h-14 rounded-full"
          : "bottom-6 right-6 w-14 h-14 rounded-full",
        props.className
      )}
    >
      <div className="relative flex items-center justify-center">
        <Brain className={deviceType === 'mobile' ? 'w-5 h-5' : 'w-6 h-6'} />
        
        {/* Connection indicator */}
        <div className={cn(
          "absolute -top-1 -right-1 w-3 h-3 rounded-full",
          "bg-green-500 border-2 border-white"
        )} />
      </div>
    </Button>
  );

  // Mobile: Full-screen sheet
  const MobileView = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        side="bottom" 
        className="h-[90vh] rounded-t-xl p-0 overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <SheetHeader className="p-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              Asistente IA
            </SheetTitle>
            
            {/* Drag indicator */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-1 bg-gray-300 rounded-full mb-2" />
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <ChevronUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </SheetHeader>
        
        <div className="h-full overflow-hidden">
          <AIAssistant
            {...props}
            className="w-full h-full"
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  // Tablet: Bottom sheet overlay
  const TabletView = () => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent 
        side="bottom" 
        className="h-[70vh] max-h-[600px] rounded-t-xl p-0"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Tablet className="w-5 h-5 text-blue-600" />
            Asistente IA - Modo Tablet
          </SheetTitle>
        </SheetHeader>
        
        <div className="h-full overflow-hidden">
          <AIAssistant
            {...props}
            className="w-full h-full"
          />
        </div>
      </SheetContent>
    </Sheet>
  );

  // Desktop: Modal dialog
  const DesktopView = () => (
    <div className={isOpen ? 'block' : 'hidden'}>
      <AIAssistant
        {...props}
        className={cn(
          "fixed bottom-20 right-6 z-40",
          "w-96 h-[600px] max-h-[80vh]",
          "bg-white rounded-lg shadow-2xl border",
          "transition-all duration-300 ease-out",
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}
      />
    </div>
  );

  // Device-specific status indicator
  const DeviceIndicator = () => (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
        {deviceType === 'mobile' && <Smartphone className="w-3 h-3" />}
        {deviceType === 'tablet' && <Tablet className="w-3 h-3" />}
        {deviceType === 'desktop' && <Monitor className="w-3 h-3" />}
        <span className="capitalize">{deviceType}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Action Button - shown when closed */}
      {!isOpen && <FloatingActionButton />}
      
      {/* Device-specific views */}
      {deviceType === 'mobile' && <MobileView />}
      {deviceType === 'tablet' && <TabletView />}
      {deviceType === 'desktop' && <DesktopView />}
      
      {/* Debug device indicator (remove in production) */}
      {import.meta.env.DEV && <DeviceIndicator />}
    </>
  );
};

export default ResponsiveAIAssistant;
