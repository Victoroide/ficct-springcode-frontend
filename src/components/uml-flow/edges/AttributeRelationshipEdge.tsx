/**
 * AttributeRelationshipEdge - Edge mejorado para relaciones entre atributos
 * Permite conectar directamente atributos específicos de clases UML
 */

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';
import type { AttributeRelationship, Point } from '../types/relationships';
import { toast } from '@/components/ui/toast-service';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface AttributeRelationshipEdgeProps extends EdgeProps {
  data?: AttributeRelationship;
}

const AttributeRelationshipEdge: React.FC<AttributeRelationshipEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  if (!data) return null;

  const [isDraggingControl, setIsDraggingControl] = useState(false);
  const [dragControlIndex, setDragControlIndex] = useState<number | null>(null);
  const [controlPoints, setControlPoints] = useState<Point[]>(data?.controlPoints || []);
  
  // Relación activa
  const [relationshipType, setRelationshipType] = useState<string>(data.relationshipType || 'ASSOCIATION');
  
  // Referencias para guardar posiciones durante el arrastre
  const dragStartPos = useRef<Point | null>(null);
  
  // Efecto para actualizar los puntos de control cuando cambian en data
  useEffect(() => {
    if (data?.controlPoints && data.controlPoints.length > 0) {
      setControlPoints(data.controlPoints);
    } else if (controlPoints.length === 0) {
      // Inicializar con dos puntos de control por defecto
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;
      
      // Desplazamos ligeramente los puntos para crear una curva
      const offset = 40;
      const point1 = { x: midX - offset, y: midY - offset };
      const point2 = { x: midX + offset, y: midY + offset };
      
      setControlPoints([point1, point2]);
    }
  }, [data?.controlPoints]);
  
  // Actualizar los puntos de control en la vista cuando se arrastran
  const handleControlPointDrag = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setIsDraggingControl(true);
    setDragControlIndex(index);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingControl || dragControlIndex === null || !dragStartPos.current) return;
      
      const dx = moveEvent.clientX - dragStartPos.current.x;
      const dy = moveEvent.clientY - dragStartPos.current.y;
      
      const newControlPoints = [...controlPoints];
      newControlPoints[dragControlIndex] = {
        x: newControlPoints[dragControlIndex].x + dx,
        y: newControlPoints[dragControlIndex].y + dy
      };
      
      setControlPoints(newControlPoints);
      dragStartPos.current = { x: moveEvent.clientX, y: moveEvent.clientY };
    };
    
    const handleMouseUp = () => {
      setIsDraggingControl(false);
      setDragControlIndex(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Notificar cambio de puntos de control
      if (data) {
        // Aquí debería ir una función para actualizar los puntos en el estado global
        console.log('Updated control points:', controlPoints);
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [isDraggingControl, dragControlIndex, controlPoints, data]);
  
  // Añadir un nuevo punto de control entre dos existentes
  const handleAddControlPoint = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newControlPoints = [...controlPoints];
    
    // Calcular el punto medio entre los dos puntos existentes
    const point1 = index === 0 
      ? { x: sourceX, y: sourceY }
      : newControlPoints[index - 1];
      
    const point2 = index === newControlPoints.length 
      ? { x: targetX, y: targetY }
      : newControlPoints[index];
    
    const midPoint = {
      x: (point1.x + point2.x) / 2,
      y: (point1.y + point2.y) / 2
    };
    
    // Insertar el nuevo punto en la posición correcta
    newControlPoints.splice(index, 0, midPoint);
    setControlPoints(newControlPoints);
    
    if (data) {
      // Aquí debería ir una función para actualizar los puntos en el estado global
      console.log('Added control point:', newControlPoints);
    }
  }, [controlPoints, sourceX, sourceY, targetX, targetY, data]);
  
  // Generar el path basado en los puntos de control
  const getCustomBezierPath = () => {
    if (controlPoints.length === 0) {
      // Si no hay puntos de control, usar un path directo
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 20,
      });
    }
    
    // Crear un path personalizado con los puntos de control
    const pathArray = [`M${sourceX},${sourceY}`];
    
    if (controlPoints.length === 1) {
      // Si solo hay un punto de control, usar una curva cuadrática
      const { x, y } = controlPoints[0];
      pathArray.push(`Q${x},${y} ${targetX},${targetY}`);
    } else if (controlPoints.length >= 2) {
      // Si hay múltiples puntos, usar curvas cúbicas encadenadas
      let i = 0;
      while (i < controlPoints.length - 1) {
        const p1 = controlPoints[i];
        const p2 = controlPoints[i + 1];
        
        if (i === 0) {
          // Primera curva desde el origen
          pathArray.push(`C${p1.x},${p1.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`);
        } else {
          // Curvas intermedias
        }
        i += 2;
      }
      
      // Última curva hasta el destino
      const lastControlPoint = controlPoints[controlPoints.length - 1] || { x: targetX, y: targetY };
      pathArray.push(`S${lastControlPoint.x},${lastControlPoint.y} ${targetX},${targetY}`);
    }
    
    // Unir en un path único
    const pathString = pathArray.join(' ');
    
    // Calcular posición para la etiqueta (punto medio de la curva)
    const midIndex = Math.floor(controlPoints.length / 2);
    const labelPoint = controlPoints[midIndex] || { 
      x: (sourceX + targetX) / 2, 
      y: (sourceY + targetY) / 2 
    };
    
    // Convertir a string para evitar errores de tipo
    return [pathString, String(labelPoint.x), String(labelPoint.y)];
  };
  
  // Obtener el path y posición de la etiqueta
  const [edgePath, labelX, labelY] = getCustomBezierPath().map(String);
  // Definir markers para diferentes tipos de relación
  const renderMarkers = () => (
    <defs>
      <marker
        id={`${data.relationshipType.toLowerCase()}-${id}`}
        viewBox="0 0 12 8"
        refX="10"
        refY="4"
        markerWidth="6"
        markerHeight="4"
        orient="auto"
      >
        {data.relationshipType === 'INHERITANCE' && (
          <path d="M 0,4 L 6,0 L 12,4 L 6,8 z" fill="white" stroke="black" strokeWidth="1" />
        )}
        {data.relationshipType === 'REALIZATION' && (
          <path d="M 0,4 L 6,0 L 12,4 L 6,8 z" fill="white" stroke="black" strokeWidth="1" strokeDasharray="2,2" />
        )}
        {data.relationshipType === 'AGGREGATION' && (
          <path d="M 0,4 L 3,0 L 12,4 L 3,8 z" fill="white" stroke="black" strokeWidth="1" />
        )}
        {data.relationshipType === 'COMPOSITION' && (
          <path d="M 0,4 L 3,0 L 12,4 L 3,8 z" fill="black" stroke="black" strokeWidth="1" />
        )}
        {(data.relationshipType === 'DEPENDENCY' || data.relationshipType === 'ASSOCIATION') && (
          <path d="M 0,0 L 12,4 L 0,8" fill="none" stroke="black" strokeWidth="1" />
        )}
      </marker>
    </defs>
  );

  // Estilos de la línea según el tipo de relación
  const getEdgeStyles = () => {
    const baseStyle = {
      stroke: selected ? '#3b82f6' : (data.style?.strokeColor || '#374151'),
      strokeWidth: selected ? 3 : (data.style?.strokeWidth || 2),
      ...style
    };

    if (data.relationshipType === 'REALIZATION' || data.relationshipType === 'DEPENDENCY') {
      return {
        ...baseStyle,
        strokeDasharray: data.style?.strokeDasharray || '8,4',
      };
    }

    return baseStyle;
  };

  // Handle para mostrar el menú contextual
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
    setIsEditing(true);
  }, []);

  // Cambiar el tipo de relación
  const changeRelationshipType = useCallback((type: string) => {
    setRelationshipType(type);
    setShowMenu(false);
    
    // Notificar al sistema el cambio de tipo
    // Aquí debería ir una función para actualizar el edge en el estado global
    toast({
      title: 'Relación actualizada',
      description: `Tipo cambiado a ${type}`,
      variant: 'success'
    });
  }, []);

  // Handle para hacer la línea editable
  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
    // Mostrar el panel de edición o un tooltip con opciones
    toast({
      title: 'Editor de relación',
      description: 'Click derecho para cambiar tipo, doble clic para modificar la forma',
      variant: 'info'
    });
  }, []);

  return (
    <>
      {renderMarkers()}
      
      {/* Path base de la relación */}
      <BaseEdge 
        id={id}
        path={edgePath} 
        style={getEdgeStyles()}
        markerEnd={`url(#${data.relationshipType.toLowerCase()}-${id})`}
      />
      
      {/* Área clickeable invisible para manejar double-click y right-click */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={12}
        onClick={() => handleDoubleClick()}
        onContextMenu={handleContextMenu}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Menú contextual para cambiar el tipo de relación */}
      {showMenu && (
        <foreignObject
          width={200}
          height={280}
          x={menuPosition.x - 100}
          y={menuPosition.y - 140}
          style={{ overflow: 'visible', pointerEvents: 'auto' }}
        >
          <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel>Tipo de relación</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeRelationshipType('ASSOCIATION')}>
                Asociación
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeRelationshipType('AGGREGATION')}>
                Agregación (uno a muchos)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeRelationshipType('COMPOSITION')}>
                Composición (uno a muchos, estricto)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeRelationshipType('DEPENDENCY')}>
                Dependencia (muchos a uno)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeRelationshipType('INHERITANCE')}>
                Herencia
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeRelationshipType('REALIZATION')}>
                Realización
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </foreignObject>
      )}
      
      {/* Puntos de control existentes - editables cuando está seleccionado */}
      {selected && controlPoints.map((point, index) => (
        <g key={`control-point-${index}`}>
          {/* Punto de control */}
          <circle
            cx={point.x}
            cy={point.y}
            r="5"
            fill="#3b82f6"
            stroke="white"
            strokeWidth="2"
            className="cursor-move"
            style={{ pointerEvents: 'all' }}
            onMouseDown={(e) => handleControlPointDrag(e, index)}
          />
          
          {/* Botón para añadir punto antes del actual */}
          {index > 0 && (
            <circle
              cx={(controlPoints[index-1].x + point.x) / 2}
              cy={(controlPoints[index-1].y + point.y) / 2}
              r="3"
              fill="#22c55e"
              stroke="white"
              strokeWidth="1"
              className="cursor-pointer hover:r-4"
              style={{ pointerEvents: 'all' }}
              onClick={(e) => handleAddControlPoint(e, index)}
            />
          )}
          
          {/* Para el último punto, también permitir añadir después */}
          {index === controlPoints.length - 1 && (
            <circle
              cx={(point.x + targetX) / 2}
              cy={(point.y + targetY) / 2}
              r="3"
              fill="#22c55e"
              stroke="white"
              strokeWidth="1"
              className="cursor-pointer"
              style={{ pointerEvents: 'all' }}
              onClick={(e) => handleAddControlPoint(e, index + 1)}
            />
          )}
        </g>
      ))}
      
      {/* Botón para añadir el primer punto de control si no hay ninguno */}
      {selected && controlPoints.length === 0 && (
        <circle
          cx={(sourceX + targetX) / 2}
          cy={(sourceY + targetY) / 2}
          r="4"
          fill="#22c55e"
          stroke="white"
          strokeWidth="1"
          className="cursor-pointer"
          style={{ pointerEvents: 'all' }}
          onClick={(e) => handleAddControlPoint(e, 0)}
        />
      )}

      {/* Label del edge */}
      {data.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: '#ffffff',
              padding: '2px 6px',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 500,
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
              pointerEvents: 'all',
              color: '#374151',
            }}
            className="nodrag nopan"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Multiplicidad origen */}
      {data.sourceMultiplicity && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + (controlPoints[0]?.x - sourceX || (targetX - sourceX) * 0.15)}px, ${sourceY + (controlPoints[0]?.y - sourceY || (targetY - sourceY) * 0.15) - 15}px)`,
              background: '#ffffff',
              padding: '1px 4px',
              borderRadius: 2,
              fontSize: 10,
              fontWeight: 600,
              color: '#1f2937',
              border: '1px solid #d1d5db',
            }}
            className="nodrag nopan"
          >
            {data.sourceMultiplicity}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Multiplicidad destino */}
      {data.targetMultiplicity && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX + (controlPoints[controlPoints.length-1]?.x - targetX || (sourceX - targetX) * 0.15)}px, ${targetY + (controlPoints[controlPoints.length-1]?.y - targetY || (sourceY - targetY) * 0.15) - 15}px)`,
              background: '#ffffff',
              padding: '1px 4px',
              borderRadius: 2,
              fontSize: 10,
              fontWeight: 600,
              color: '#1f2937',
              border: '1px solid #d1d5db',
            }}
            className="nodrag nopan"
          >
            {data.targetMultiplicity}
          </div>
        </EdgeLabelRenderer>
      )}

      {/* Información adicional cuando está seleccionado */}
      {selected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${Number(labelY) + 40}px)`,
              background: '#1f2937',
              color: 'white',
              padding: '4px 8px',
              borderRadius: 4,
              fontSize: 10,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {data.relationshipType} • {data.sourceAttributeId && data.targetAttributeId ? 'Attribute Relationship' : 'Class Relationship'}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(AttributeRelationshipEdge);
