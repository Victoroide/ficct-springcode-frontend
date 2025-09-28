/**
 * UMLEnumNode.tsx
 * Specialized UML node for representing Enumeration types
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { UMLNodeData, UMLEnumValue } from '../types';

const UMLEnumNode: React.FC<NodeProps<UMLNodeData>> = ({ data, isConnectable, selected }) => {
  const enumValues = data.enumValues || [];

  return (
    <div className={`uml-node enum-node ${selected ? 'selected' : ''}`}>
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="connection-handle top-handle"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="connection-handle bottom-handle"
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="connection-handle left-handle"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="connection-handle right-handle"
      />

      {/* Enum name header */}
      <div className="uml-node-header enum-header">
        <div className="uml-node-stereotype">&lt;&lt;enumeration&gt;&gt;</div>
        <div className="uml-node-title">{data.label || 'Enum'}</div>
      </div>

      {/* Enum values section */}
      <div className="uml-node-section enum-section">
        {enumValues.length > 0 ? (
          enumValues.map((enumValue) => (
            <div key={enumValue.id} className="uml-enum-constant">
              <span className="enum-name">{enumValue.name}</span>
              {enumValue.value && (
                <>
                  <span className="enum-separator"> = </span>
                  <span className="enum-value">{enumValue.value}</span>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="empty-section-message">No values</div>
        )}
      </div>
    </div>
  );
};

export default memo(UMLEnumNode);
