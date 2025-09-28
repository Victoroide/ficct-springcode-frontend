/**
 * UMLRelationshipEdge.tsx
 * Custom edge component for UML relationships in React Flow
 */

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, getStraightPath } from 'reactflow';
import type { EdgeProps } from 'reactflow';

export type RelationshipType = 
  | 'ASSOCIATION' 
  | 'INHERITANCE' 
  | 'REALIZATION' 
  | 'AGGREGATION' 
  | 'COMPOSITION' 
  | 'DEPENDENCY';

export type Multiplicity = '1' | '0..1' | '0..*' | '1..*' | '*' | '';

export interface UMLEdgeData {
  relationshipType: RelationshipType;
  sourceMultiplicity: Multiplicity;
  targetMultiplicity: Multiplicity;
  label?: string;
}

const UMLRelationshipEdge: React.FC<EdgeProps<UMLEdgeData>> = ({
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
  const edgeData = data || {
    relationshipType: 'ASSOCIATION' as RelationshipType,
    sourceMultiplicity: '' as Multiplicity,
    targetMultiplicity: '' as Multiplicity,
    label: ''
  };

  const { relationshipType, sourceMultiplicity, targetMultiplicity, label: edgeLabel } = edgeData;

  // Calculate path - use straight path for better UML representation
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  // Define markers for different relationship types
  const renderMarkers = () => (
    <defs>
      {/* Inheritance - empty triangle */}
      <marker
        id={`inheritance-${id}`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0,5 L 5,0 L 10,5 L 5,10 z" fill="white" stroke="black" strokeWidth="1" />
      </marker>

      {/* Realization - empty triangle with dashed line */}
      <marker
        id={`realization-${id}`}
        viewBox="0 0 10 10"
        refX="9"
        refY="5"
        markerWidth="6"
        markerHeight="6"
        orient="auto"
      >
        <path d="M 0,5 L 5,0 L 10,5 L 5,10 z" fill="white" stroke="black" strokeWidth="1" />
      </marker>

      {/* Aggregation - empty diamond */}
      <marker
        id={`aggregation-${id}`}
        viewBox="0 0 12 8"
        refX="10"
        refY="4"
        markerWidth="6"
        markerHeight="4"
        orient="auto"
      >
        <path d="M 0,4 L 3,0 L 12,4 L 3,8 z" fill="white" stroke="black" strokeWidth="1" />
      </marker>

      {/* Composition - filled diamond */}
      <marker
        id={`composition-${id}`}
        viewBox="0 0 12 8"
        refX="10"
        refY="4"
        markerWidth="6"
        markerHeight="4"
        orient="auto"
      >
        <path d="M 0,4 L 3,0 L 12,4 L 3,8 z" fill="black" stroke="black" strokeWidth="1" />
      </marker>

      {/* Dependency - simple arrow */}
      <marker
        id={`dependency-${id}`}
        viewBox="0 0 10 6"
        refX="9"
        refY="3"
        markerWidth="5"
        markerHeight="3"
        orient="auto"
      >
        <path d="M 0,0 L 10,3 L 0,6" fill="none" stroke="black" strokeWidth="1" />
      </marker>

      {/* Association - simple arrow */}
      <marker
        id={`association-${id}`}
        viewBox="0 0 10 6"
        refX="9"
        refY="3"
        markerWidth="5"
        markerHeight="3"
        orient="auto"
      >
        <path d="M 0,0 L 10,3 L 0,6" fill="none" stroke="black" strokeWidth="1" />
      </marker>
    </defs>
  );

  // Get edge styles
  const getEdgeStyles = () => {
    const baseStyle = {
      stroke: selected ? '#3b82f6' : '#374151',
      strokeWidth: selected ? 2 : 1.5,
      ...style
    };

    if (relationshipType === 'REALIZATION' || relationshipType === 'DEPENDENCY') {
      return {
        ...baseStyle,
        strokeDasharray: '5,5',
      };
    }

    return baseStyle;
  };

  // Get marker end
  const getMarkerEnd = () => {
    return `url(#${relationshipType.toLowerCase()}-${id})`;
  };

  return (
    <>
      {renderMarkers()}
      
      <BaseEdge 
        id={id}
        path={edgePath} 
        style={getEdgeStyles()}
        markerEnd={getMarkerEnd()}
      />
      
      {/* Edge Label */}
      {edgeLabel && (
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
            {edgeLabel}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Source Multiplicity */}
      {sourceMultiplicity && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${sourceX + (targetX - sourceX) * 0.1}px, ${sourceY + (targetY - sourceY) * 0.1 - 15}px)`,
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
            {sourceMultiplicity}
          </div>
        </EdgeLabelRenderer>
      )}
      
      {/* Target Multiplicity */}
      {targetMultiplicity && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${targetX + (sourceX - targetX) * 0.1}px, ${targetY + (sourceY - targetY) * 0.1 - 15}px)`,
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
            {targetMultiplicity}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};

export default memo(UMLRelationshipEdge);
