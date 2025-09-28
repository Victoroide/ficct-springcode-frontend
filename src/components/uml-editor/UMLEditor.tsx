/**
 * UML Editor Component
 * Complete UML diagram editor with theme integration and responsive design
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { UMLClass, UMLRelationship, Point } from './types';
import { useUMLEditorTheme } from './UMLEditorTheme';
import { getConditionalStyles } from './themeUtils';
import UMLElementRenderer from './UMLElementRenderer';
import UMLRelationshipRenderer from './UMLRelationshipRenderer';
import RelationshipCreator from './RelationshipCreator';
import AttributeEditor from './AttributeEditor';
import MethodEditor from './MethodEditor';
import ContextMenu, {
  createCanvasContextMenu,
  createElementContextMenu,
  createRelationshipContextMenu
} from './ContextMenu';
// ThemeSwitcher removed
import umlApiService from '@/services/umlApiService';
import './styles.css';

// Toolbar icons (would use actual icon library in real project)
const ToolbarButton: React.FC<{
  icon: string;
  label: string;
  active?: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, active, onClick, disabled }) => {
  // getConditionalStyles imported from themeUtils
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={getConditionalStyles({
        base: `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all ${
          active ? 'ring-2 ring-blue-500' : ''
        }`,
        light: active 
          ? 'bg-blue-100 text-blue-900 border-blue-300' 
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      })}
      style={{ border: '1px solid' }}
      title={label}
    >
      <span className="mr-2">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  );
};

interface UMLEditorProps {
  diagramId: string;
  className?: string;
}

export const UMLEditor: React.FC<UMLEditorProps> = ({ 
  diagramId, 
  className = '' 
}) => {
  const theme = useUMLEditorTheme();
  // getConditionalStyles imported from themeUtils
  
  // State
  const [elements, setElements] = useState<UMLClass[]>([]);
  const [relationships, setRelationships] = useState<UMLRelationship[]>([]);
  const [selectedElementIds, setSelectedElementIds] = useState<string[]>([]);
  const [selectedRelationshipIds, setSelectedRelationshipIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true);
  
  // Tool State
  const [activeTool, setActiveTool] = useState<
    'select' | 'class' | 'interface' | 'abstract' | 'enum' | 'record' | 'relationship'
  >('select');
  
  // Canvas ref
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load diagram data
  useEffect(() => {
    const loadDiagram = async () => {
      if (!diagramId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const [elementsData, relationshipsData] = await Promise.all([
          umlApiService.getDiagramElements(diagramId),
          umlApiService.getDiagramRelationships(diagramId)
        ]);
        
        setElements(elementsData);
        setRelationships(relationshipsData);
      } catch (err) {
        console.error('Error loading diagram:', err);
        setError('Failed to load diagram. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDiagram();
  }, [diagramId]);
  
  // Canvas context menu state
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    x: number;
    y: number;
    items: Array<{
      label: string;
      icon?: string;
      action?: () => void;
      divider?: boolean;
      danger?: boolean;
      disabled?: boolean;
    }>;
  }>({ show: false, x: 0, y: 0, items: [] });

  // Handle context menu close
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, show: false }));
  }, []);

  // Handle canvas right click for context menu
  const handleCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (e.target !== canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    const menu = createCanvasContextMenu(
      e,
      { x, y },
      {
        createClass: (pos) => handleCreateElement('CLASS', pos),
        createInterface: (pos) => handleCreateElement('INTERFACE', pos),
        createAbstract: (pos) => handleCreateElement('ABSTRACTCLASS', pos),
        createEnum: (pos) => handleCreateElement('ENUM', pos),
        createRecord: (pos) => handleCreateElement('RECORD', pos),
        paste: () => console.log('Paste not implemented'),
        selectAll: () => {
          setSelectedElementIds(elements.map(el => el.id));
        }
      }
    );
    
    setContextMenu({
      show: true,
      x: menu.x,
      y: menu.y,
      items: menu.items
    });
  }, [elements, pan, zoom]);

  // Handle canvas click
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    
    // Clear selections unless holding Ctrl/Cmd
    if (!e.ctrlKey && !e.metaKey) {
      setSelectedElementIds([]);
      setSelectedRelationshipIds([]);
    }
    
    // Handle element creation
    if (activeTool !== 'select' && activeTool !== 'relationship') {
      handleCreateElement(activeTool.toUpperCase() as any, { x, y });
    }
  }, [activeTool, pan, zoom]);
  
  // Create element
  const handleCreateElement = async (
    type: UMLClass['classType'], 
    position: Point
  ) => {
    setIsLoading(true);
    setError(null);
    
    const newElement: Partial<UMLClass> = {
      name: `New${type}`,
      classType: type,
      position,
      dimensions: { width: 200, height: 120 },
      attributes: [],
      methods: []
    };
    
    try {
      const created = await umlApiService.createElement({
        ...newElement,
        diagramId
      } as any);
      
      setElements(prev => [...prev, created]);
      setSelectedElementIds([created.id]);
      
      // Switch back to select tool
      setActiveTool('select');
    } catch (err) {
      console.error('Error creating element:', err);
      setError('Failed to create element. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update element
  const handleUpdateElement = async (id: string, updates: Partial<UMLClass>) => {
    try {
      // Optimistic update
      setElements(prev => prev.map(el => 
        el.id === id ? { ...el, ...updates } : el
      ));
      
      await umlApiService.updateElement(id, updates);
    } catch (err) {
      console.error('Error updating element:', err);
      setError('Failed to update element.');
      
      // Revert optimistic update by reloading
      try {
        const elementsData = await umlApiService.getDiagramElements(diagramId);
        setElements(elementsData);
      } catch (revertErr) {
        console.error('Error reverting element update:', revertErr);
      }
    }
  };
  
  // Move element
  const handleMoveElement = async (id: string, position: Point) => {
    try {
      // Optimistic update
      setElements(prev => prev.map(el => 
        el.id === id ? { ...el, position } : el
      ));
      
      await umlApiService.moveElement(id, position);
    } catch (err) {
      console.error('Error moving element:', err);
      setError('Failed to move element.');
    }
  };
  
  // Resize element
  const handleResizeElement = async (id: string, dimensions: { width: number; height: number }) => {
    try {
      // Optimistic update
      setElements(prev => prev.map(el => 
        el.id === id ? { ...el, dimensions } : el
      ));
      
      await umlApiService.resizeElement(id, dimensions);
    } catch (err) {
      console.error('Error resizing element:', err);
      setError('Failed to resize element.');
    }
  };
  
  // Delete elements
  const handleDeleteElements = async () => {
    if (selectedElementIds.length === 0 && selectedRelationshipIds.length === 0) {
      return;
    }
    
    if (!confirm('Are you sure you want to delete the selected items?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Delete relationships first
      for (const relId of selectedRelationshipIds) {
        await umlApiService.deleteRelationship(relId);
      }
      
      // Delete elements
      for (const elemId of selectedElementIds) {
        await umlApiService.deleteElement(elemId);
      }
      
      // Update state
      setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
      setRelationships(prev => prev.filter(rel => !selectedRelationshipIds.includes(rel.id)));
      
      // Clear selections
      setSelectedElementIds([]);
      setSelectedRelationshipIds([]);
    } catch (err) {
      console.error('Error deleting items:', err);
      setError('Failed to delete some items.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create relationship
  const handleCreateRelationship = async (relationshipData: any) => {
    try {
      const created = await umlApiService.createRelationship({
        ...relationshipData,
        diagramId
      });
      
      setRelationships(prev => [...prev, created]);
    } catch (err) {
      console.error('Error creating relationship:', err);
      setError('Failed to create relationship.');
    }
  };
  
  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev * 0.9, 0.1));
  const handleResetZoom = () => setZoom(1);
  
  // Handle error clearing
  const clearError = () => setError(null);
  
  // Get selected element for properties panel
  const selectedElement = selectedElementIds.length === 1 
    ? elements.find(el => el.id === selectedElementIds[0])
    : null;

  return (
    <div 
      ref={containerRef}
      className={`uml-editor ${className}`}
      style={{ backgroundColor: theme.canvasBackground }}
      onContextMenu={handleCanvasContextMenu}
    >
      {/* Toolbar */}
      <div className={getConditionalStyles({
        base: "uml-editor-toolbar flex flex-wrap items-center p-2 border-b shadow-sm",
        light: "bg-white border-gray-200"
      })}>
        {/* Tool Selection */}
        <div className="tool-group flex space-x-1 pr-4 border-r mr-4">
          <ToolbarButton
            icon="🎯"
            label="Select"
            active={activeTool === 'select'}
            onClick={() => setActiveTool('select')}
          />
          <ToolbarButton
            icon="📦"
            label="Class"
            active={activeTool === 'class'}
            onClick={() => setActiveTool('class')}
          />
          <ToolbarButton
            icon="🔌"
            label="Interface"
            active={activeTool === 'interface'}
            onClick={() => setActiveTool('interface')}
          />
          <ToolbarButton
            icon="📋"
            label="Abstract"
            active={activeTool === 'abstract'}
            onClick={() => setActiveTool('abstract')}
          />
          <ToolbarButton
            icon="📑"
            label="Enum"
            active={activeTool === 'enum'}
            onClick={() => setActiveTool('enum')}
          />
          <ToolbarButton
            icon="📄"
            label="Record"
            active={activeTool === 'record'}
            onClick={() => setActiveTool('record')}
          />
        </div>
        
        {/* Relationship Tools */}
        <div className="tool-group flex space-x-1 pr-4 border-r mr-4">
          <ToolbarButton
            icon="↔️"
            label="Relationship"
            active={activeTool === 'relationship'}
            onClick={() => setActiveTool('relationship')}
          />
        </div>
        
        {/* View Controls */}
        <div className="tool-group flex space-x-1 pr-4 border-r mr-4">
          <ToolbarButton
            icon="🔍+"
            label="Zoom In"
            onClick={handleZoomIn}
          />
          <ToolbarButton
            icon="🔍-"
            label="Zoom Out"
            onClick={handleZoomOut}
          />
          <ToolbarButton
            icon="🔄"
            label="Reset Zoom"
            onClick={handleResetZoom}
          />
          <ToolbarButton
            icon="⊞"
            label="Grid"
            active={showGrid}
            onClick={() => setShowGrid(!showGrid)}
          />
        </div>
        
        {/* Actions */}
        <div className="tool-group flex space-x-1">
          <ToolbarButton
            icon="🗑️"
            label="Delete"
            onClick={handleDeleteElements}
            disabled={selectedElementIds.length === 0 && selectedRelationshipIds.length === 0}
          />
          <ToolbarButton
            icon="⚙️"
            label="Properties"
            active={showPropertiesPanel}
            onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
          />
        </div>
        
        {/* Theme Switcher */}
        <div className="ml-auto flex items-center space-x-2">
          {/* ThemeSwitcher removed */}
          
          {/* Zoom indicator */}
          <div className={getConditionalStyles({
            base: "text-sm px-2 py-1 rounded",
            light: "bg-gray-100 text-gray-700"
          })}>
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
      
      {/* Error Banner */}
      {error && (
        <div className={getConditionalStyles({
          base: "error-message flex items-center justify-between p-3 border-b",
          light: "bg-red-50 text-red-800 border-red-200"
        })}>
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
          <button
            onClick={clearError}
            className={getConditionalStyles({
              base: "ml-4 px-2 py-1 rounded text-sm",
              light: "bg-red-100 hover:bg-red-200 text-red-700"
            })}
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas */}
        <div className="flex-1 relative">
          <div
            ref={canvasRef}
            className={`uml-editor-canvas h-full overflow-auto ${showGrid ? 'show-grid' : ''}`}
            style={{
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              backgroundPosition: `${pan.x}px ${pan.y}px`
            }}
            onClick={handleCanvasClick}
          >
            {/* Loading overlay */}
            {isLoading && (
              <div className="loading-overlay">
                <div className="loading-spinner" />
                <div>Loading...</div>
              </div>
            )}
            
            {/* Transform container for zoom/pan */}
            <div
              style={{
                transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                transformOrigin: '0 0',
                minWidth: '2000px',
                minHeight: '2000px',
                position: 'relative'
              }}
            >
              {/* Relationships */}
              {relationships.map(relationship => (
                <UMLRelationshipRenderer
                  key={relationship.id}
                  relationship={relationship}
                  sourceElement={elements.find(el => el.id === relationship.sourceClass)}
                  targetElement={elements.find(el => el.id === relationship.targetClass)}
                  isSelected={selectedRelationshipIds.includes(relationship.id)}
                  onSelect={(id) => setSelectedRelationshipIds([id])}
                  zoom={zoom}
                />
              ))}
              
              {/* Elements */}
              {elements.map(element => (
                <UMLElementRenderer
                  key={element.id}
                  element={element}
                  isSelected={selectedElementIds.includes(element.id)}
                  onSelect={(id, multiSelect) => {
                    if (multiSelect) {
                      setSelectedElementIds(prev =>
                        prev.includes(id) 
                          ? prev.filter(i => i !== id) 
                          : [...prev, id]
                      );
                    } else {
                      setSelectedElementIds([id]);
                    }
                  }}
                  onMove={handleMoveElement}
                  onResize={handleResizeElement}
                  onUpdate={handleUpdateElement}
                  showConnectionPoints={activeTool === 'relationship'}
                  zoom={zoom}
                />
              ))}
            </div>
            
            {/* Relationship Creator */}
            <RelationshipCreator
              isActive={activeTool === 'relationship'}
              elements={elements}
              onRelationshipCreate={handleCreateRelationship}
              zoom={zoom}
            />
          </div>
        </div>
        
        {/* Properties Panel */}
        {showPropertiesPanel && (
          <div className={getConditionalStyles({
            base: "properties-panel w-80 border-l overflow-y-auto",
            light: "bg-white border-gray-200"
          })}>
            {selectedElement ? (
              <ElementPropertiesPanel
                element={selectedElement}
                onUpdate={(updates) => handleUpdateElement(selectedElement.id, updates)}
                onError={setError}
              />
            ) : selectedElementIds.length > 1 ? (
              <div className="p-4">
                <h3 className={getConditionalStyles({
                  base: "font-semibold mb-2",
                  light: "text-gray-900",
                })}>
                  Multiple Elements Selected
                </h3>
                <p className={getConditionalStyles({
                  base: "text-sm",
                  light: "text-gray-600",
                })}>
                  {selectedElementIds.length} elements selected
                </p>
              </div>
            ) : (
              <div className="p-4">
                <h3 className={getConditionalStyles({
                  base: "font-semibold mb-2",
                  light: "text-gray-900",
                })}>
                  No Selection
                </h3>
                <p className={getConditionalStyles({
                  base: "text-sm",
                  light: "text-gray-600",
                })}>
                  Select an element to edit its properties
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Element Properties Panel Component
interface ElementPropertiesPanelProps {
  element: UMLClass;
  onUpdate: (updates: Partial<UMLClass>) => void;
  onError: (error: string) => void;
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  element,
  onUpdate,
  onError
}) => {
  // getConditionalStyles imported from themeUtils
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(element.name);
  const [classType, setClassType] = useState(element.classType);
  
  // Handle name editing
  const handleNameSave = () => {
    if (!name.trim()) {
      onError('Element name cannot be empty');
      setName(element.name);
      return;
    }
    
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name.trim())) {
      onError('Invalid element name. Must be a valid Java identifier.');
      setName(element.name);
      return;
    }
    
    onUpdate({ name: name.trim() });
    setIsEditingName(false);
  };
  
  const handleNameCancel = () => {
    setName(element.name);
    setIsEditingName(false);
  };
  
  // Handle type change
  const handleTypeChange = (newType: UMLClass['classType']) => {
    setClassType(newType);
    onUpdate({ classType: newType });
  };
  
  // Add new attribute
  const handleAddAttribute = async () => {
    try {
      const newAttribute = await umlApiService.addAttribute(element.id, {
        name: 'newAttribute',
        type: 'String',
        visibility: 'private'
      });
      
      onUpdate({
        attributes: [...element.attributes, newAttribute]
      });
    } catch (err) {
      console.error('Error adding attribute:', err);
      onError('Failed to add attribute.');
    }
  };
  
  return (
    <div className="properties-section">
      <div className="p-4 border-b">
        <h3 className={getConditionalStyles({
          base: "font-semibold mb-4",
          light: "text-gray-900"
        })}>
          Element Properties
        </h3>
        
        {/* Name Field */}
        <div className="mb-4">
          <label className={getConditionalStyles({
            base: "block text-sm font-medium mb-1",
            light: "text-gray-700",
          })}>
            Name
          </label>
          {isEditingName ? (
            <div className="flex space-x-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave();
                  if (e.key === 'Escape') handleNameCancel();
                }}
                className={getConditionalStyles({
                  base: "flex-1 px-3 py-2 border rounded-md text-sm",
                  light: "bg-white border-gray-300 text-gray-900"
                })}
                autoFocus
              />
              <button
                onClick={handleNameSave}
                className="px-2 py-2 bg-blue-500 text-white rounded text-sm"
              >
                ✓
              </button>
              <button
                onClick={handleNameCancel}
                className="px-2 py-2 bg-gray-500 text-white rounded text-sm"
              >
                ✕
              </button>
            </div>
          ) : (
            <div
              className={getConditionalStyles({
                base: "px-3 py-2 border rounded-md cursor-pointer",
                light: "bg-gray-50 border-gray-300 hover:bg-gray-100"
              })}
              onClick={() => setIsEditingName(true)}
            >
              {element.name}
            </div>
          )}
        </div>
        
        {/* Type Field */}
        <div className="mb-4">
          <label className={getConditionalStyles({
            base: "block text-sm font-medium mb-1",
            light: "text-gray-700",
          })}>
            Type
          </label>
          <select
            value={classType}
            onChange={(e) => handleTypeChange(e.target.value as UMLClass['classType'])}
            className={getConditionalStyles({
              base: "w-full px-3 py-2 border rounded-md text-sm",
              light: "bg-white border-gray-300 text-gray-900"
            })}
          >
            <option value="CLASS">Class</option>
            <option value="INTERFACE">Interface</option>
            <option value="ABSTRACTCLASS">Abstract Class</option>
            <option value="ENUM">Enum</option>
            <option value="RECORD">Record</option>
          </select>
        </div>
        
        {/* Position */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <label className={getConditionalStyles({
              base: "block text-sm font-medium mb-1",
              light: "text-gray-700",
              })}>
              Position X
            </label>
            <input
              type="number"
              value={Math.round(element.position.x)}
              onChange={(e) => onUpdate({
                position: { ...element.position, x: Number(e.target.value) }
              })}
              className={getConditionalStyles({
                base: "w-full px-3 py-2 border rounded-md text-sm",
                light: "bg-white border-gray-300 text-gray-900",
              })}
            />
          </div>
          <div>
            <label className={getConditionalStyles({
              base: "block text-sm font-medium mb-1",
              light: "text-gray-700",
              })}>
              Position Y
            </label>
            <input
              type="number"
              value={Math.round(element.position.y)}
              onChange={(e) => onUpdate({
                position: { ...element.position, y: Number(e.target.value) }
              })}
              className={getConditionalStyles({
                base: "w-full px-3 py-2 border rounded-md text-sm",
                light: "bg-white border-gray-300 text-gray-900",
              })}
            />
          </div>
        </div>
      </div>
      
      {/* Attributes Section */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h4 className={getConditionalStyles({
            base: "font-medium",
            light: "text-gray-900"
          })}>
            Attributes
          </h4>
          <button
            onClick={handleAddAttribute}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            + Add
          </button>
        </div>
        
        <div className="space-y-2">
          {element.attributes?.map(attribute => (
            <AttributeEditor
              key={attribute.id}
              elementId={element.id}
              attribute={attribute}
              onUpdate={(updated) => {
                const updatedAttrs = element.attributes.map(attr => 
                  attr.id === updated.id ? updated : attr
                );
                onUpdate({ attributes: updatedAttrs });
              }}
              onDelete={(attrId) => {
                const updatedAttrs = element.attributes.filter(
                  attr => attr.id !== attrId
                );
                onUpdate({ attributes: updatedAttrs });
              }}
              onError={onError}
            />
          ))}
          
          {(!element.attributes || element.attributes.length === 0) && (
            <div className={getConditionalStyles({
              base: "text-sm italic py-4 text-center",
              light: "text-gray-500"
            })}>
              No attributes. Click "Add" to create one.
            </div>
          )}
        </div>
      </div>
      
      {/* Methods Section */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h4 className={getConditionalStyles({
            base: "font-medium",
            light: "text-gray-900"
          })}>
            Methods
          </h4>
          <button
            onClick={async () => {
              try {
                const newMethod = await umlApiService.addMethod(element.id, {
                  name: 'newMethod',
                  returnType: 'void',
                  visibility: 'public',
                  parameters: []
                });
                
                onUpdate({ 
                  methods: [...(element.methods || []), newMethod] 
                });
              } catch (err) {
                console.error('Error adding method:', err);
                onError('Failed to add method.');
              }
            }}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            + Add
          </button>
        </div>
        
        <div className="space-y-2">
          {element.methods?.map(method => (
            <MethodEditor
              key={method.id}
              elementId={element.id}
              method={method}
              onUpdate={(updated) => {
                const updatedMethods = element.methods.map(m => 
                  m.id === updated.id ? updated : m
                );
                onUpdate({ methods: updatedMethods });
              }}
              onDelete={(methodId) => {
                const updatedMethods = element.methods.filter(
                  m => m.id !== methodId
                );
                onUpdate({ methods: updatedMethods });
              }}
              onError={onError}
            />
          ))}
          
          {(!element.methods || element.methods.length === 0) && (
            <div className={getConditionalStyles({
              base: "text-sm italic py-4 text-center",
              light: "text-gray-500"
            })}>
              No methods. Click "Add" to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UMLEditor;
