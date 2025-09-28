/**
 * UMLRecordNode.tsx
 * Record node implementation for React Flow UML editor
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { UMLClass } from '@/components/uml-editor/types';

const UMLRecordNode: React.FC<NodeProps> = ({ data, isConnectable, selected }) => {
  const nodeData = data as UMLClass;

  return (
    <div
      className={`uml-node record-node ${selected ? 'selected' : ''}`}
      data-testid="uml-record-node"
    >
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

      {/* Record header */}
      <div className="uml-node-header record-header">
        <div className="uml-node-stereotype">&lt;&lt;record&gt;&gt;</div>
        <div className="uml-node-title">{nodeData.name}</div>
      </div>

      {/* Components section (attributes in record are components) */}
      <div className="uml-node-section record-components-section">
        {nodeData.attributes && nodeData.attributes.length > 0 ? (
          nodeData.attributes.map((attribute) => (
            <div key={attribute.id} className="uml-record-component">
              <span className="component-name">{attribute.name}</span>
              <span className="component-separator">:</span>
              <span className="component-type">{attribute.type}</span>
            </div>
          ))
        ) : (
          <div className="empty-section-message">No components</div>
        )}
      </div>

      {/* Methods section */}
      <div className="uml-node-section methods-section">
        {nodeData.methods && nodeData.methods.length > 0 ? (
          nodeData.methods.map((method) => (
            <div key={method.id} className="uml-method">
              <span className="method-name">{method.name}</span>
              <span className="method-params">
                ({method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})
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

export default memo(UMLRecordNode);
