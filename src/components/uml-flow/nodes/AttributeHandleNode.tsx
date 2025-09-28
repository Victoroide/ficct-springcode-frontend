/**
 * AttributeHandleNode.tsx
 * Handles para conectar atributos directamente en las clases UML
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';

export interface AttributeHandleData {
  classNodeId: string;
  attributeId: string;
  attributeName: string;
  attributeType: string;
  side: 'left' | 'right';
  parentY: number;
}

const AttributeHandleNode: React.FC<NodeProps<AttributeHandleData>> = ({ 
  id, 
  data,
  isConnectable 
}) => {
  // La posición del handle depende del lado
  const handlePosition = data.side === 'left' ? Position.Left : Position.Right;
  
  return (
    <div
      className="attribute-handle-node"
      style={{
        position: 'absolute',
        width: 16,
        height: 16,
        backgroundColor: 'transparent',
        // Ajustar la posición X según el lado (izquierda o derecha)
        left: data.side === 'left' ? -16 : 'auto',
        right: data.side === 'right' ? -16 : 'auto',
      }}
      data-testid={`attribute-handle-${data.attributeId}`}
      data-attribute-id={data.attributeId}
      data-class-id={data.classNodeId}
    >
      <Handle
        id={`${data.side}-${data.attributeId}`}
        type="source"
        position={handlePosition}
        className={`attribute-connection-handle ${data.side}-handle`}
        style={{
          width: 12,
          height: 12,
          background: 'rgba(59, 130, 246, 0.5)',
          border: '2px solid #3b82f6',
          borderRadius: '50%',
          cursor: 'crosshair'
        }}
        isConnectable={isConnectable}
      />
      
      <Handle
        id={`${data.side}-${data.attributeId}-target`}
        type="target"
        position={handlePosition}
        className={`attribute-connection-handle ${data.side}-target-handle`}
        style={{
          width: 12,
          height: 12,
          background: 'transparent',
          border: 'none',
          borderRadius: '50%'
        }}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(AttributeHandleNode);
