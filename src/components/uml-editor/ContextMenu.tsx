/**
 * Context Menu Component for UML Editor
 * Provides context-specific actions based on right-click target
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getConditionalStyles } from './themeUtils';
import type { UMLClass, UMLRelationship } from './types';
import type { MenuItem, ContextMenuType, ContextMenuProps } from './ContextMenuTypes';

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  // getConditionalStyles imported from themeUtils
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ x, y });
  
  // Adjust menu position if it would go off screen
  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;
      
      // Adjust X position if menu would go off right edge
      if (x + menuRect.width > windowWidth) {
        adjustedX = windowWidth - menuRect.width - 10;
      }
      
      // Adjust Y position if menu would go off bottom edge
      if (y + menuRect.height > windowHeight) {
        adjustedY = windowHeight - menuRect.height - 10;
      }
      
      setMenuPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);
  
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  return createPortal(
    <div 
      ref={menuRef}
      className={getConditionalStyles({
        base: "context-menu fixed rounded-md overflow-hidden shadow-lg z-50 min-w-[180px]",
        light: "bg-white border border-gray-200"
      })}
      style={{
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`,
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {/* Si es solo un divisor, mostramos solo la línea */}
          {item.divider && !item.label ? (
            <div className={getConditionalStyles({
              base: "context-menu-divider h-px my-1",
              light: "bg-gray-200"
            })} />
          ) : (
            // Si es un elemento normal del menú con label y action
            <div 
              className={getConditionalStyles({
                base: `context-menu-item ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} py-2 px-4 text-sm flex items-center transition-colors`,
                light: item.danger 
                  ? 'hover:bg-red-100 hover:text-red-800 text-red-700' 
                  : 'hover:bg-blue-100 hover:text-blue-800 text-gray-700'
              })}
              onClick={() => {
                if (!item.disabled && item.action) {
                  item.action();
                  onClose();
                }
              }}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </div>
          )}
          {/* Mostrar un divisor después del elemento si tiene la propiedad divider y no es solo un divisor */}
          {item.divider && item.label && (
            <div className={getConditionalStyles({
              base: "context-menu-divider h-px my-1",
              light: "bg-gray-200"
            })} />
          )}
        </React.Fragment>
      ))}
    </div>,
    document.body
  );
};

// Helper functions to create context menus for different targets
export const createCanvasContextMenu = (
  event: React.MouseEvent,
  position: { x: number; y: number },
  callbacks: {
    createClass: (pos: { x: number; y: number }) => void;
    createInterface: (pos: { x: number; y: number }) => void;
    createAbstract: (pos: { x: number; y: number }) => void;
    createEnum: (pos: { x: number; y: number }) => void;
    createRecord: (pos: { x: number; y: number }) => void;
    paste: () => void;
    selectAll: () => void;
  },
  canPaste: boolean = false
): { x: number; y: number; items: MenuItem[] } => {
  return {
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: 'Create Class',
        icon: '📆',
        action: () => callbacks.createClass(position)
      },
      {
        label: 'Create Interface',
        icon: '🔌',
        action: () => callbacks.createInterface(position)
      },
      {
        label: 'Create Abstract Class',
        icon: '📋',
        action: () => callbacks.createAbstract(position)
      },
      {
        label: 'Create Enum',
        icon: '📑',
        action: () => callbacks.createEnum(position)
      },
      {
        label: 'Create Record',
        icon: '📄',
        action: () => callbacks.createRecord(position)
      },
      { divider: true, label: 'Divider' },
      {
        label: 'Paste',
        icon: '📋',
        action: callbacks.paste,
        disabled: !canPaste
      },
      {
        label: 'Select All',
        icon: '🔲',
        action: callbacks.selectAll
      }
    ]
  };
};

export const createElementContextMenu = (
  event: React.MouseEvent,
  element: UMLClass,
  callbacks: {
    editElement: (id: string) => void;
    copyElement: (id: string) => void;
    deleteElement: (id: string) => void;
    addAttribute: (id: string) => void;
    addMethod: (id: string) => void;
    startRelationship: (id: string) => void;
  }
): { x: number; y: number; items: MenuItem[] } => {
  return {
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: 'Edit',
        icon: '✏️',
        action: () => callbacks.editElement(element.id)
      },
      {
        label: 'Copy',
        icon: '📋',
        action: () => callbacks.copyElement(element.id)
      },
      { divider: true, label: 'Divider' },
      {
        label: 'Add Attribute',
        icon: '➕',
        action: () => callbacks.addAttribute(element.id)
      },
      {
        label: 'Add Method',
        icon: '➕',
        action: () => callbacks.addMethod(element.id)
      },
      { divider: true, label: 'Divider' },
      {
        label: 'Create Relationship',
        icon: '↔️',
        action: () => callbacks.startRelationship(element.id)
      },
      { divider: true, label: 'Divider' },
      {
        label: 'Delete',
        icon: '🗑️',
        action: () => callbacks.deleteElement(element.id),
        danger: true
      }
    ]
  };
};

export const createRelationshipContextMenu = (
  event: React.MouseEvent,
  relationship: UMLRelationship,
  callbacks: {
    editRelationship: (id: string) => void;
    deleteRelationship: (id: string) => void;
    changeType: (id: string) => void;
  }
): { x: number; y: number; items: MenuItem[] } => {
  return {
    x: event.clientX,
    y: event.clientY,
    items: [
      {
        label: 'Edit',
        icon: '✏️',
        action: () => callbacks.editRelationship(relationship.id)
      },
      {
        label: 'Change Type',
        icon: '🔄',
        action: () => callbacks.changeType(relationship.id)
      },
      { divider: true, label: 'Divider' },
      {
        label: 'Delete',
        icon: '🗑️',
        action: () => callbacks.deleteRelationship(relationship.id),
        danger: true
      }
    ]
  };
};

export default ContextMenu;
