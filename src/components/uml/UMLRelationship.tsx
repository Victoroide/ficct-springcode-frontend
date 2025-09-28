// @ts-nocheck
import React from 'react';

interface UMLRelationshipProps {
  relationship: any;
  sourceElement: any;
  targetElement: any;
  zoom: number;
}

export function UMLRelationship({ 
  relationship, 
  sourceElement, 
  targetElement, 
  zoom 
}: UMLRelationshipProps) {
  if (!sourceElement || !targetElement) return null;

  const getConnectionPoints = (source: any, target: any) => {
    const sourceCenterX = source.positionX + source.width / 2;
    const sourceCenterY = source.positionY + source.height / 2;
    const targetCenterX = target.positionX + target.width / 2;
    const targetCenterY = target.positionY + target.height / 2;

    const sourceRight = source.positionX + source.width;
    const sourceBottom = source.positionY + source.height;
    const targetRight = target.positionX + target.width;
    const targetBottom = target.positionY + target.height;

    let sourcePoint = { x: sourceCenterX, y: sourceCenterY };
    let targetPoint = { x: targetCenterX, y: targetCenterY };

    if (targetCenterX > sourceRight) {
      sourcePoint = { x: sourceRight, y: sourceCenterY };
      targetPoint = { x: target.positionX, y: targetCenterY };
    } else if (sourceCenterX > targetRight) {
      sourcePoint = { x: source.positionX, y: sourceCenterY };
      targetPoint = { x: targetRight, y: targetCenterY };
    } else if (targetCenterY > sourceBottom) {
      sourcePoint = { x: sourceCenterX, y: sourceBottom };
      targetPoint = { x: targetCenterX, y: target.positionY };
    } else if (sourceCenterY > targetBottom) {
      sourcePoint = { x: sourceCenterX, y: source.positionY };
      targetPoint = { x: targetCenterX, y: targetBottom };
    }

    return { sourcePoint, targetPoint };
  };

  const { sourcePoint, targetPoint } = getConnectionPoints(sourceElement, targetElement);

  const getLineStyle = (relType: string) => {
    switch (relType) {
      case 'INHERITANCE':
        return { stroke: '#3b82f6', strokeWidth: 2, markerEnd: 'url(#inheritance-arrow)' };
      case 'IMPLEMENTATION':
        return { stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5,5', markerEnd: 'url(#implementation-arrow)' };
      case 'ASSOCIATION':
        return { stroke: '#6b7280', strokeWidth: 1.5, markerEnd: 'url(#association-arrow)' };
      case 'AGGREGATION':
        return { stroke: '#f59e0b', strokeWidth: 1.5, markerEnd: 'url(#aggregation-diamond)' };
      case 'COMPOSITION':
        return { stroke: '#ef4444', strokeWidth: 2, markerEnd: 'url(#composition-diamond)' };
      case 'DEPENDENCY':
        return { stroke: '#8b5cf6', strokeWidth: 1, strokeDasharray: '3,3', markerEnd: 'url(#dependency-arrow)' };
      default:
        return { stroke: '#6b7280', strokeWidth: 1 };
    }
  };

  const lineStyle = getLineStyle(relationship.relationshipType);

  const midX = (sourcePoint.x + targetPoint.x) / 2;
  const midY = (sourcePoint.y + targetPoint.y) / 2;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ 
        width: '100%', 
        height: '100%',
        transform: `scale(${zoom})`,
        transformOrigin: '0 0'
      }}
    >
      <defs>
        <marker
          id="inheritance-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
        </marker>
        
        <marker
          id="implementation-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="none" stroke="#10b981" strokeWidth="1" />
        </marker>
        
        <marker
          id="association-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
        </marker>
        
        <marker
          id="aggregation-diamond"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,4 L6,0 L12,4 L6,8 z" fill="white" stroke="#f59e0b" strokeWidth="1" />
        </marker>
        
        <marker
          id="composition-diamond"
          markerWidth="12"
          markerHeight="8"
          refX="11"
          refY="4"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,4 L6,0 L12,4 L6,8 z" fill="#ef4444" />
        </marker>
        
        <marker
          id="dependency-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#8b5cf6" />
        </marker>
      </defs>

      <g>
        <line
          x1={sourcePoint.x}
          y1={sourcePoint.y}
          x2={targetPoint.x}
          y2={targetPoint.y}
          {...lineStyle}
        />
        
        {relationship.label && (
          <text
            x={midX}
            y={midY - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#374151"
            className="select-none"
          >
            {relationship.label}
          </text>
        )}
        
        {relationship.sourceMultiplicity && (
          <text
            x={sourcePoint.x + (targetPoint.x > sourcePoint.x ? -15 : 15)}
            y={sourcePoint.y - 5}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
            className="select-none"
          >
            {relationship.sourceMultiplicity}
          </text>
        )}
        
        {relationship.targetMultiplicity && (
          <text
            x={targetPoint.x + (sourcePoint.x > targetPoint.x ? -15 : 15)}
            y={targetPoint.y - 5}
            textAnchor="middle"
            fontSize="9"
            fill="#6b7280"
            className="select-none"
          >
            {relationship.targetMultiplicity}
          </text>
        )}
      </g>
    </svg>
  );
}
