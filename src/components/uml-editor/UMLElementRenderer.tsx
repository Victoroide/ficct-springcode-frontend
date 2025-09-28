/**
 * UML Element Renderer Component
 * Renders UML class elements with proper styling and interactivity
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { UMLClass, UMLAttribute, UMLMethod } from './types';
import { useUMLEditorTheme, getElementColorsByType } from './UMLEditorTheme';
import { getConditionalStyles } from './themeUtils';
import ElementContextMenu from './ElementContextMenu';
import umlApiService from '@/services/umlApiService';

interface ResizeHandleProps {
  position: 'nw' | 'ne' | 'sw' | 'se';
  onResize: (dx: number, dy: number, position: string) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({ position, onResize }) => {
  const handleRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleEl = handleRef.current;
    if (!handleEl) return;
    
    let startX = 0;
    let startY = 0;
    
    const handleMouseDown = (e: MouseEvent) => {
      e.stopPropagation();
      startX = e.clientX;
      startY = e.clientY;
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      onResize(dx, dy, position);
      
      startX = e.clientX;
      startY = e.clientY;
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    handleEl.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      handleEl.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onResize, position]);
  
  return (
    <div 
      ref={handleRef}
      className={`resize-handle ${position}`} 
    />
  );
};

interface UMLElementRendererProps {
  element: UMLClass;
  isSelected: boolean;
  onSelect: (id: string, multiSelect?: boolean) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize?: (id: string, dimensions: { width: number; height: number }) => void;
  onUpdate?: (id: string, updates: Partial<UMLClass>) => void;
  onDoubleClick?: (id: string) => void;
  onRelationStart?: (sourceId: string, point: { x: number, y: number }) => void;
  onRelationEnd?: (targetId: string) => void;
  showConnectionPoints?: boolean;
  zoom: number;
}

export const UMLElementRenderer: React.FC<UMLElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onUpdate,
  onDoubleClick,
  onRelationStart,
  onRelationEnd,
  showConnectionPoints,
  zoom
}) => {
  const theme = useUMLEditorTheme();
  // getConditionalStyles imported from themeUtils
  const elementRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showResizeHandles, setShowResizeHandles] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(element.name);
  const [isLoading, setIsLoading] = useState(false);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0
  });
  
  // Close context menu
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ show: false, x: 0, y: 0 });
  }, []);
  
  // Effect for handling clicks outside to close context menu
  useEffect(() => {
    if (!contextMenu.show) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      setContextMenu(prev => ({ ...prev, show: false }));
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.show]);
  
  // Get colors based on element type
  const colors = getElementColorsByType(theme, element.classType);
  
  // Show resize handles on mouse over if selected
  const handleMouseEnter = () => {
    if (isSelected) {
      setShowResizeHandles(true);
    }
  };
  
  const handleMouseLeave = () => {
    if (!isDragging) {
      setShowResizeHandles(false);
    }
  };
  
  // Handle click to select element
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id, e.ctrlKey || e.metaKey);
  };
  
  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Select this element if not already selected
    if (!isSelected) {
      onSelect(element.id, e.ctrlKey || e.metaKey);
    }
    
    // Show context menu at cursor position
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY
    });
  };
  
  // Handle double click (for inline editing)
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDoubleClick) {
      onDoubleClick(element.id);
    }
  };
  
  // Handle header double click to start name editing
  const handleHeaderDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoading) {
      setIsEditingName(true);
    }
  };
  
  // Focus name input when editing starts
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);
  
  // Reset temp name when element name changes
  useEffect(() => {
    setTempName(element.name);
  }, [element.name]);
  
  // Handle name save
  const handleNameSave = async () => {
    const newName = tempName.trim();
    
    if (!newName) {
      setTempName(element.name);
      setIsEditingName(false);
      return;
    }
    
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(newName)) {
      alert('Invalid class name. Must be a valid Java identifier.');
      setTempName(element.name);
      setIsEditingName(false);
      return;
    }
    
    if (newName === element.name) {
      setIsEditingName(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (onUpdate) {
        await onUpdate(element.id, { name: newName });
      }
      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating element name:', error);
      setTempName(element.name);
      setIsEditingName(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle name cancel
  const handleNameCancel = () => {
    setTempName(element.name);
    setIsEditingName(false);
  };
  
  // Handle name input key events
  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSave();
    } else if (e.key === 'Escape') {
      handleNameCancel();
    }
  };
  
  // Handle drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    e.stopPropagation();
    
    const rect = elementRef.current!.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    setIsDragging(true);
    
    // Select this element if not already selected
    if (!isSelected) {
      onSelect(element.id, e.ctrlKey || e.metaKey);
    }
  };
  
  // Handle resize
  const handleResize = (dx: number, dy: number, position: string) => {
    if (!onResize) return;
    
    let { width, height } = element.dimensions;
    let { x, y } = element.position;
    
    // Apply zoom factor to delta
    dx = dx / zoom;
    dy = dy / zoom;
    
    switch (position) {
      case 'nw':
        width = Math.max(100, width - dx);
        height = Math.max(60, height - dy);
        x += element.dimensions.width - width;
        y += element.dimensions.height - height;
        break;
      case 'ne':
        width = Math.max(100, width + dx);
        height = Math.max(60, height - dy);
        y += element.dimensions.height - height;
        break;
      case 'sw':
        width = Math.max(100, width - dx);
        height = Math.max(60, height + dy);
        x += element.dimensions.width - width;
        break;
      case 'se':
        width = Math.max(100, width + dx);
        height = Math.max(60, height + dy);
        break;
      default:
        break;
    }
    
    // Update element position and dimensions
    onMove(element.id, { x, y });
    onResize(element.id, { width, height });
  };
  
  // Set up global mouse handlers for dragging
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - dragOffset.x) / zoom;
      const y = (e.clientY - dragOffset.y) / zoom;
      onMove(element.id, { x, y });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
      
      if (!elementRef.current?.matches(':hover')) {
        setShowResizeHandles(false);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, element.id, onMove, zoom]);
  
  // Handle relationship connection points
  const startRelationship = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRelationStart) {
      onRelationStart(element.id, {
        x: e.clientX,
        y: e.clientY
      });
    }
  };
  
  const endRelationship = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRelationEnd) {
      onRelationEnd(element.id);
    }
  };

  // Render visibility icon
  const renderVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return '+';
      case 'private': return '-';
      case 'protected': return '#';
      default: return '~';
    }
  };
  
  // Render attribute
  const renderAttribute = (attr: UMLAttribute) => (
    <div key={attr.id} className="attribute-item">
      <div className="item-content">
        <span className="visibility-icon font-mono font-bold text-sm w-4 text-center">
          {renderVisibilityIcon(attr.visibility)}
        </span>
        
        <span className="attribute-name font-medium truncate">
          {attr.name}
        </span>
        
        <span className="text-gray-400">:</span>
        
        <span className="attribute-type text-sm truncate">
          {attr.type}
        </span>
        
        {attr.defaultValue && (
          <>
            <span className="text-gray-400">=</span>
            <span className="attribute-default text-sm italic truncate">
              {attr.defaultValue}
            </span>
          </>
        )}
        
        {(attr.isStatic || attr.isFinal) && (
          <div className="flex space-x-1">
            {attr.isStatic && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-blue-100 text-blue-800",
              })}>
                static
              </span>
            )}
            {attr.isFinal && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-purple-100 text-purple-800",
              })}>
                final
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="item-actions flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          title="Edit attribute"
        >
          ✏️
        </button>
        
        <button
          title="Delete attribute"
        >
          🗑️
        </button>
      </div>
    </div>
  );
  
  // Render method
  const renderMethod = (method: UMLMethod) => (
    <div key={method.id} className="method-item">
      <div className="item-content">
        <span className="visibility-icon font-mono font-bold text-sm w-4 text-center">
          {renderVisibilityIcon(method.visibility)}
        </span>
        
        <span className="method-name font-medium">
          {method.name}
        </span>
        
        <span className="text-gray-400">(</span>
        <span className="method-params text-sm truncate">
          {method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}
        </span>
        <span className="text-gray-400">)</span>
        
        <span className="text-gray-400">:</span>
        
        <span className="method-return-type text-sm truncate">
          {method.returnType}
        </span>
        
        {(method.isStatic || method.isAbstract) && (
          <div className="flex space-x-1">
            {method.isStatic && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-blue-100 text-blue-800",
              })}>
                static
              </span>
            )}
            {method.isAbstract && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-purple-100 text-purple-800",
              })}>
                abstract
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="item-actions flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          title="Edit method"
        >
          ✏️
        </button>
        
        <button
          title="Delete method"
        >
          🗑️
        </button>
      </div>
    </div>
  );
  
  return (
    <div 
      ref={elementRef}
      className={`uml-element ${element.classType} ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${element.position.x}px`,
        top: `${element.position.y}px`,
        width: `${element.dimensions.width}px`,
        height: `${element.dimensions.height}px`,
        borderColor: colors.border,
        backgroundColor: colors.background,
        color: colors.text,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDown={handleMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onContextMenu={handleContextMenu}
    >
      <div 
        className="element-header" 
        style={{ 
          borderColor: colors.border,
          backgroundColor: colors.header,
          color: colors.text
        }}
        onDoubleClick={handleHeaderDoubleClick}
      >
        {element.classType === 'INTERFACE' && <em>«interface»</em>}
        {element.classType === 'ABSTRACTCLASS' && <em>«abstract»</em>}
        {element.classType === 'ENUM' && <em>«enum»</em>}
        {element.classType === 'RECORD' && <em>«record»</em>}
        
        {isEditingName ? (
          <div className="flex items-center justify-center space-x-1 mt-1">
            <input
              ref={nameInputRef}
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={handleNameSave}
              className={getConditionalStyles({
                base: "text-center px-2 py-1 text-sm border rounded font-bold bg-transparent",
                light: "border-gray-400 text-gray-900",
              })}
              style={{
                backgroundColor: colors.header,
                color: colors.text,
                minWidth: '120px',
                maxWidth: `${element.dimensions.width - 20}px`
              }}
              disabled={isLoading}
            />
            <button
              onClick={handleNameSave}
              className={getConditionalStyles({
                base: "px-1 py-1 text-xs rounded",
                light: "bg-green-500 text-white hover:bg-green-600",
              })}
              disabled={isLoading}
              title="Save"
            >
              ✓
            </button>
            <button
              onClick={handleNameCancel}
              className={getConditionalStyles({
                base: "px-1 py-1 text-xs rounded",
                light: "bg-gray-500 text-white hover:bg-gray-600",
              })}
              disabled={isLoading}
              title="Cancel"
            >
              ✕
            </button>
          </div>
        ) : (
          <div 
            className={`font-bold cursor-pointer ${isLoading ? 'opacity-50' : 'hover:opacity-80'}`}
            title="Double-click to edit name"
          >
            {element.name}
          </div>
        )}
      </div>
      
      <div className="element-section" style={{ borderColor: colors.border }}>
        <div className="section-title" style={{ backgroundColor: colors.header }}>
          Attributes
        </div>
        {element.attributes?.map(renderAttribute)}
        {element.attributes?.length === 0 && (
          <div className="attribute-item" style={{ fontStyle: 'italic', opacity: 0.7 }}>No attributes</div>
        )}
      </div>
      
      <div className="element-section" style={{ borderColor: colors.border }}>
        <div className="section-title" style={{ backgroundColor: colors.header }}>
          Methods
        </div>
        {element.methods?.map(renderMethod)}
        {element.methods?.length === 0 && (
          <div className="method-item" style={{ fontStyle: 'italic', opacity: 0.7 }}>No methods</div>
        )}
      </div>
      
      {/* Context Menu */}
      <ElementContextMenu
        show={contextMenu.show}
        position={{
          x: contextMenu.x,
          y: contextMenu.y
        }}
        element={element}
        onNameEdit={() => setIsEditingName(true)}
        onAttributeAdd={() => {
          if (onUpdate) {
            onUpdate(element.id, { 
              attributes: [...(element.attributes || []), {
                id: Math.random().toString(36).substr(2, 9),
                name: 'newAttribute',
                type: 'String',
                visibility: 'private'
              }]
            });
          }
        }}
        onMethodAdd={() => {
          if (onUpdate) {
            onUpdate(element.id, { 
              methods: [...(element.methods || []), {
                id: Math.random().toString(36).substr(2, 9),
                name: 'newMethod',
                returnType: 'void',
                visibility: 'public',
                parameters: []
              }]
            });
          }
        }}
        onRelationshipStart={() => {
          if (onRelationStart) {
            onRelationStart(element.id, {
              x: element.position.x + element.dimensions.width / 2,
              y: element.position.y + element.dimensions.height / 2
            });
          }
        }}
        onDelete={() => {
          if (onUpdate) {
            try {
              umlApiService.deleteElement(element.id);
            } catch (error) {
              console.error('Error deleting element:', error);
            }
          }
        }}
        onClose={handleCloseContextMenu}
      />
      
      {/* Resize handles (only shown when selected and hovered) */}
      {isSelected && showResizeHandles && onResize && (
        <>
          <ResizeHandle position="nw" onResize={handleResize} />
          <ResizeHandle position="ne" onResize={handleResize} />
          <ResizeHandle position="sw" onResize={handleResize} />
          <ResizeHandle position="se" onResize={handleResize} />
        </>
      )}
      
      {/* Connection points for relationships */}
      {showConnectionPoints && (
        <>
          <div 
            className="element-connection-point"
            style={{ top: '50%', left: 0 }}
            onMouseDown={startRelationship}
            onMouseUp={endRelationship}
          />
          <div 
            className="element-connection-point"
            style={{ top: '50%', left: '100%' }}
            onMouseDown={startRelationship}
            onMouseUp={endRelationship}
          />
          <div 
            className="element-connection-point"
            style={{ top: 0, left: '50%' }}
            onMouseDown={startRelationship}
            onMouseUp={endRelationship}
          />
          <div 
            className="element-connection-point"
            style={{ top: '100%', left: '50%' }}
            onMouseDown={startRelationship}
            onMouseUp={endRelationship}
          />
        </>
      )}
    </div>
  );
};

export default UMLElementRenderer;
