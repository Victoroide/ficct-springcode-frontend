/**
 * UMLSidebar.tsx
 * Sidebar component for the UML Flow Editor
 */

import React from 'react';

interface UMLSidebarProps {
  children: React.ReactNode;
  width?: number;
}

const UMLSidebar: React.FC<UMLSidebarProps> = ({ children, width = 320 }) => {
  return (
    <div 
      className="bg-white border-l border-slate-200 overflow-y-auto" 
      style={{ width: `${width}px` }}
    >
      {children}
    </div>
  );
};

export default UMLSidebar;
