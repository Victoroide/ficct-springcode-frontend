// @ts-nocheck
import React, { forwardRef, useRef, useEffect, useState, useCallback } from 'react';
import { UMLElement } from './UMLElement';
import { UMLRelationship } from './UMLRelationship';
import { CollaborativeCursor } from '../collaboration/CollaborativeCursor';

interface UMLCanvasProps {
  elements: any[];
  relationships: any[];
  selectedElement: any;
  selectedTool: string;
  zoomLevel: number;
  showGrid: boolean;
  onElementSelect: (element: any) => void;
  onElementUpdate: (elementId: string, updates: any) => void;
  onAddElement: (type: string, position: { x: number; y: number }) => void;
  isCollaborating: boolean;
  collaborationSession: any;
}

export const UMLCanvas = forwardRef<HTMLDivElement, UMLCanvasProps>(({
  elements,
  relationships,
  selectedElement,
  selectedTool,
  zoomLevel,
  showGrid,
  onElementSelect,
  onElementUpdate,
  onAddElement,
  isCollaborating,
  collaborationSession
}, ref) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [collaboratorCursors, setCollaboratorCursors] = useState([]);

  const zoom = zoomLevel / 100;

  const handleMouseDown = useCallback((e) => {
    if (selectedTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      return;
    }

    if (selectedTool !== 'pointer') {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
        const y = (e.clientY - rect.top - canvasOffset.y) / zoom;
        
        const elementType = selectedTool.toUpperCase();
        onAddElement(elementType, { x, y });
      }
    }
  }, [selectedTool, canvasOffset, zoom, onAddElement]);

  const handleMouseMove = useCallback((e) => {
    if (isPanning) {
      const deltaX = e.movementX;
      const deltaY = e.movementY;
      setCanvasOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      return;
    }

    if (draggedElement) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left - canvasOffset.x) / zoom - dragOffset.x;
        const y = (e.clientY - rect.top - canvasOffset.y) / zoom - dragOffset.y;
        
        onElementUpdate(draggedElement.id, { positionX: x, positionY: y });
      }
    }

    if (isCollaborating) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (e.clientX - rect.left) / zoom;
        const y = (e.clientY - rect.top) / zoom;
        
        // Send cursor position to other collaborators
        // This would be handled by the WebSocket service
      }
    }
  }, [isPanning, draggedElement, canvasOffset, zoom, dragOffset, onElementUpdate, isCollaborating]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  const handleElementMouseDown = useCallback((element, e) => {
    if (selectedTool !== 'pointer') return;
    
    e.stopPropagation();
    onElementSelect(element);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const elementRect = e.currentTarget.getBoundingClientRect();
      const offsetX = (e.clientX - elementRect.left) / zoom;
      const offsetY = (e.clientY - elementRect.top) / zoom;
      
      setDraggedElement(element);
      setDragOffset({ x: offsetX, y: offsetY });
    }
  }, [selectedTool, onElementSelect, zoom]);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Zoom functionality would be handled by parent component
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

  const gridSize = 20 * zoom;
  const gridPattern = showGrid ? (
    <defs>
      <pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
        <path
          d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-slate-300"
        />
      </pattern>
    </defs>
  ) : null;

  const canvasStyle = {
    transform: `scale(${zoom}) translate(${canvasOffset.x / zoom}px, ${canvasOffset.y / zoom}px)`,
    transformOrigin: '0 0',
    cursor: selectedTool === 'pan' ? 'grab' : 
           selectedTool === 'pointer' ? 'default' : 'crosshair'
  };

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full overflow-hidden relative bg-white select-none"
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      >
        {gridPattern}
        {showGrid && (
          <rect
            width="100%"
            height="100%"
            fill="url(#grid)"
          />
        )}
      </svg>

      <div
        className="absolute inset-0"
        style={canvasStyle}
      >
        {relationships.map(relationship => (
          <UMLRelationship
            key={relationship.id}
            relationship={relationship}
            sourceElement={elements.find(e => e.id === relationship.sourceClass)}
            targetElement={elements.find(e => e.id === relationship.targetClass)}
            zoom={zoom}
          />
        ))}

        {elements.map(element => (
          <UMLElement
            key={element.id}
            element={element}
            isSelected={selectedElement?.id === element.id}
            onMouseDown={(e) => handleElementMouseDown(element, e)}
            onDoubleClick={() => onElementSelect(element)}
            zoom={zoom}
          />
        ))}

        {isCollaborating && collaboratorCursors.map(cursor => (
          <CollaborativeCursor
            key={cursor.userId}
            cursor={cursor}
            zoom={zoom}
          />
        ))}
      </div>

      {selectedTool !== 'pointer' && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-lg">
          <p className="text-sm text-slate-600">
            Haz clic para agregar: <span className="font-medium text-slate-900">{selectedTool}</span>
          </p>
        </div>
      )}
    </div>
  );
});
