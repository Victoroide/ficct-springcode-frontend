/**
 * UML Relationship Renderer Component
 * Renders relationships between UML elements with proper styling
 */

import React, { useState, useEffect, useRef } from 'react';
import { UMLRelationship, UMLClass, Point, RelationshipType } from './types';
import { useUMLEditorTheme, getRelationshipColor } from './UMLEditorTheme';

// Define relationship end markers by type
const getRelationshipEndMarker = (
  type: RelationshipType, 
  color: string,
  id: string
): JSX.Element => {
  // Define a unique ID for each marker
  const markerId = `marker-${type.toLowerCase()}-${id}`;
  
  switch (type) {
    case 'INHERITANCE':
      return (
        <marker
          id={markerId}
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 6 L 0 12 z"
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="1"
          />
        </marker>
      );
      
    case 'REALIZATION':
    case 'GENERALIZATION':
      return (
        <marker
          id={markerId}
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 6 L 0 12 z"
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </marker>
      );
      
    case 'AGGREGATION':
      return (
        <marker
          id={markerId}
          viewBox="0 0 12 12"
          refX="12"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 6 L 4 0 L 8 6 L 4 12 z"
            fill="#FFFFFF"
            stroke={color}
            strokeWidth="1"
          />
        </marker>
      );
      
    case 'COMPOSITION':
      return (
        <marker
          id={markerId}
          viewBox="0 0 12 12"
          refX="12"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 6 L 4 0 L 8 6 L 4 12 z"
            fill={color}
            stroke={color}
            strokeWidth="1"
          />
        </marker>
      );
      
    case 'DEPENDENCY':
      return (
        <marker
          id={markerId}
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <path
            d="M 0 0 L 10 6 L 0 12"
            fill="none"
            stroke={color}
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        </marker>
      );
      
    case 'ASSOCIATION':
    default:
      // No marker for standard association
      return (
        <marker
          id={markerId}
          viewBox="0 0 12 12"
          refX="10"
          refY="6"
          markerWidth="12"
          markerHeight="12"
          orient="auto-start-reverse"
        >
          <path
            d="M 10 6 L 0 6"
            stroke={color}
            strokeWidth="1"
          />
        </marker>
      );
  }
};

interface UMLRelationshipRendererProps {
  relationship: UMLRelationship;
  sourceElement: UMLClass | undefined;
  targetElement: UMLClass | undefined;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  zoom?: number;
}

export const UMLRelationshipRenderer: React.FC<UMLRelationshipRendererProps> = ({
  relationship,
  sourceElement,
  targetElement,
  isSelected = false,
  onSelect,
  zoom = 1
}) => {
  const theme = useUMLEditorTheme();
  const svgRef = useRef<SVGSVGElement>(null);
  const [connectionPath, setConnectionPath] = useState<string>("");
  const [midPoint, setMidPoint] = useState<Point>({ x: 0, y: 0 });
  
  // Get appropriate color based on relationship type
  const color = getRelationshipColor(theme, relationship.relationshipType);
  
  // Generate unique marker ID
  const markerId = `marker-${relationship.relationshipType.toLowerCase()}-${relationship.id}`;
  
  // Calculate connection path between elements
  useEffect(() => {
    if (!sourceElement || !targetElement) return;
    
    // Get element centers
    const sourceCenter: Point = {
      x: sourceElement.position.x + sourceElement.dimensions.width / 2,
      y: sourceElement.position.y + sourceElement.dimensions.height / 2
    };
    
    const targetCenter: Point = {
      x: targetElement.position.x + targetElement.dimensions.width / 2,
      y: targetElement.position.y + targetElement.dimensions.height / 2
    };
    
    // Find connection points on element borders
    let sourceX, sourceY, targetX, targetY;
    
    // Calculate angle between centers
    const angle = Math.atan2(
      targetCenter.y - sourceCenter.y,
      targetCenter.x - sourceCenter.x
    );
    
    // Source connection point
    const sourceCos = Math.cos(angle);
    const sourceSin = Math.sin(angle);
    
    if (Math.abs(sourceCos) > Math.abs(sourceSin)) {
      // Connect to right or left side
      sourceX = sourceCenter.x + (sourceElement.dimensions.width / 2) * Math.sign(sourceCos);
      sourceY = sourceCenter.y + (sourceElement.dimensions.width / 2) * (sourceSin / Math.abs(sourceCos));
    } else {
      // Connect to top or bottom side
      sourceX = sourceCenter.x + (sourceElement.dimensions.height / 2) * (sourceCos / Math.abs(sourceSin));
      sourceY = sourceCenter.y + (sourceElement.dimensions.height / 2) * Math.sign(sourceSin);
    }
    
    // Target connection point (reverse angle)
    const targetCos = Math.cos(angle + Math.PI);
    const targetSin = Math.sin(angle + Math.PI);
    
    if (Math.abs(targetCos) > Math.abs(targetSin)) {
      // Connect to right or left side
      targetX = targetCenter.x + (targetElement.dimensions.width / 2) * Math.sign(targetCos);
      targetY = targetCenter.y + (targetElement.dimensions.width / 2) * (targetSin / Math.abs(targetCos));
    } else {
      // Connect to top or bottom side
      targetX = targetCenter.x + (targetElement.dimensions.height / 2) * (targetCos / Math.abs(targetSin));
      targetY = targetCenter.y + (targetElement.dimensions.height / 2) * Math.sign(targetSin);
    }
    
    // Create path
    let path: string;
    let mid: Point;
    
    // Use connection path if available, otherwise create straight line
    if (relationship.connectionPath && relationship.connectionPath.length > 0) {
      const points = relationship.connectionPath;
      path = `M ${sourceX} ${sourceY} `;
      
      // Add each point in the path
      points.forEach(point => {
        path += `L ${point.x} ${point.y} `;
      });
      
      path += `L ${targetX} ${targetY}`;
      
      // Calculate mid point (for label)
      const midIndex = Math.floor(points.length / 2);
      if (points.length > 0) {
        mid = points[midIndex];
      } else {
        // If no points, use midpoint between source and target
        mid = {
          x: (sourceX + targetX) / 2,
          y: (sourceY + targetY) / 2
        };
      }
    } else {
      // Simple straight line if no path defined
      path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
      
      // Midpoint for label
      mid = {
        x: (sourceX + targetX) / 2,
        y: (sourceY + targetY) / 2
      };
    }
    
    setConnectionPath(path);
    setMidPoint(mid);
  }, [
    sourceElement?.position,
    sourceElement?.dimensions,
    targetElement?.position,
    targetElement?.dimensions,
    relationship.connectionPath
  ]);
  
  // Handle click to select relationship
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(relationship.id);
    }
  };
  
  // If source or target element is missing, don't render
  if (!sourceElement || !targetElement || !connectionPath) {
    return null;
  }
  
  // Determine line style based on relationship type
  const getStrokeDashArray = () => {
    switch (relationship.relationshipType) {
      case 'DEPENDENCY':
      case 'REALIZATION':
        return '5,5';
      default:
        return 'none';
    }
  };
  
  // Calculate SVG bounds to ensure it covers the whole relationship
  const minX = Math.min(sourceElement.position.x, targetElement.position.x) - 50;
  const minY = Math.min(sourceElement.position.y, targetElement.position.y) - 50;
  const maxX = Math.max(
    sourceElement.position.x + sourceElement.dimensions.width,
    targetElement.position.x + targetElement.dimensions.width
  ) + 50;
  const maxY = Math.max(
    sourceElement.position.y + sourceElement.dimensions.height,
    targetElement.position.y + targetElement.dimensions.height
  ) + 50;
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  return (
    <svg
      ref={svgRef}
      className={`relationship ${isSelected ? 'selected' : ''} ${relationship.relationshipType.toLowerCase()}`}
      style={{
        position: 'absolute',
        top: minY,
        left: minX,
        width,
        height,
        pointerEvents: 'none',
        overflow: 'visible'
      }}
      onClick={handleClick}
    >
      <defs>
        {getRelationshipEndMarker(relationship.relationshipType, color, relationship.id)}
      </defs>
      
      <path
        d={connectionPath}
        stroke={color}
        strokeWidth={isSelected ? 2 : 1.5}
        fill="none"
        style={{ 
          strokeDasharray: getStrokeDashArray(),
          pointerEvents: 'stroke' 
        }}
        markerEnd={relationship.relationshipType !== 'ASSOCIATION' ? `url(#${markerId})` : undefined}
      />
      
      {/* Multiplicity labels */}
      {relationship.sourceMultiplicity && (
        <text
          x={sourceElement.position.x}
          y={sourceElement.position.y}
          fill={color}
          fontSize={12 * zoom}
          className="relationship-label"
          textAnchor="middle"
        >
          {relationship.sourceMultiplicity}
        </text>
      )}
      
      {relationship.targetMultiplicity && (
        <text
          x={targetElement.position.x}
          y={targetElement.position.y}
          fill={color}
          fontSize={12 * zoom}
          className="relationship-label"
          textAnchor="middle"
        >
          {relationship.targetMultiplicity}
        </text>
      )}
      
      {/* Relationship name */}
      {relationship.name && (
        <text
          x={midPoint.x - minX}
          y={midPoint.y - minY - 10}
          fill={color}
          fontSize={12 * zoom}
          className="relationship-label"
          textAnchor="middle"
          dy="-0.5em"
          style={{
            backgroundColor: theme.canvasBackground,
            padding: '2px'
          }}
        >
          {relationship.name}
        </text>
      )}
      
      {/* Invisible wider path for easier selection */}
      <path
        d={connectionPath}
        stroke="transparent"
        strokeWidth={10}
        fill="none"
        onClick={handleClick}
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
      />
    </svg>
  );
};

export default UMLRelationshipRenderer;
