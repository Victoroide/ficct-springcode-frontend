/**
 * UMLInterfaceNode.tsx
 * Enhanced UML Interface Node with proper structure and styling
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { UMLVisibility } from '../types';
import type { UMLNodeData } from '../types';

// Helper function to render visibility symbol
const getVisibilitySymbol = (visibility: UMLVisibility): string => {
  switch (visibility) {
    case UMLVisibility.PUBLIC:
      return '+';
    case UMLVisibility.PRIVATE:
      return '-';
    case UMLVisibility.PROTECTED:
      return '#';
    case UMLVisibility.PACKAGE:
      return '~';
    default:
      return '+';
  }
};

const UMLInterfaceNode: React.FC<NodeProps<UMLNodeData>> = ({ data, isConnectable, selected }) => {
  const methods = data.methods || [];

  return (
    <div className={`uml-node interface-node ${selected ? 'selected' : ''}`}>
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

      {/* Interface name header */}
      <div className="uml-node-header">
        <div className="uml-node-stereotype">&lt;&lt;interface&gt;&gt;</div>
        <div className="uml-node-title">{data.label || 'Interface'}</div>
      </div>

      {/* Methods section */}
      <div className="uml-node-section">
        {methods.length > 0 ? (
          methods.map((method) => (
            <div key={method.id} className="uml-method">
              <span className="visibility-indicator">
                {getVisibilitySymbol(method.visibility)}
              </span>{' '}
              <span className="method-name">{method.name}</span>
              <span className="method-params">
                (
                {method.parameters
                  .map((param) => `${param.name}: ${param.type}`)
                  .join(', ')}
                )
              </span>
              <span className="method-separator">:</span>
              <span className="method-type">{method.returnType}</span>
            </div>
          ))
        ) : (
          <div className="empty-section-message">No methods</div>
        )}
      </div>
    </div>
  );
};

export default memo(UMLInterfaceNode);
