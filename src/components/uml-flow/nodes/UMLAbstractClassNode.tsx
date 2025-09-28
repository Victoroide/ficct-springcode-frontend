/**
 * UMLAbstractClassNode.tsx
 * Abstract Class node implementation for React Flow UML editor
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { UMLClass } from '@/components/uml-editor/types';

const UMLAbstractClassNode: React.FC<NodeProps> = ({ data, isConnectable, selected }) => {
  const nodeData = data as UMLClass;

  return (
    <div
      className={`uml-node abstract-class-node ${selected ? 'selected' : ''}`}
      data-testid="uml-abstract-class-node"
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

      {/* Abstract class header */}
      <div className="uml-node-header abstract-header">
        <div className="uml-node-stereotype">&lt;&lt;abstract&gt;&gt;</div>
        <div className="uml-node-title italic">{nodeData.name}</div>
      </div>

      {/* Attributes section */}
      <div className="uml-node-section attributes-section">
        {nodeData.attributes && nodeData.attributes.length > 0 ? (
          nodeData.attributes.map((attribute) => (
            <div key={attribute.id} className="uml-attribute">
              <span className={`visibility-indicator ${attribute.visibility}`}>
                {attribute.visibility === 'private' ? '-' : 
                 attribute.visibility === 'protected' ? '#' : 
                 attribute.visibility === 'public' ? '+' : ''}
              </span>
              <span className="attribute-name">{attribute.name}</span>
              <span className="attribute-separator">:</span>
              <span className="attribute-type">{attribute.type}</span>
              {attribute.isStatic && <span className="static-indicator">static</span>}
            </div>
          ))
        ) : (
          <div className="empty-section-message">No attributes</div>
        )}
      </div>

      {/* Methods section */}
      <div className="uml-node-section methods-section">
        {nodeData.methods && nodeData.methods.length > 0 ? (
          nodeData.methods.map((method) => (
            <div key={method.id} className={`uml-method ${method.isAbstract ? 'abstract' : ''}`}>
              <span className={`visibility-indicator ${method.visibility}`}>
                {method.visibility === 'private' ? '-' : 
                 method.visibility === 'protected' ? '#' : 
                 method.visibility === 'public' ? '+' : ''}
              </span>
              <span className="method-name">{method.name}</span>
              <span className="method-params">
                ({method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})
              </span>
              <span className="method-separator">:</span>
              <span className="method-type">{method.returnType}</span>
              {method.isStatic && <span className="static-indicator">static</span>}
              {method.isAbstract && <span className="abstract-indicator">abstract</span>}
            </div>
          ))
        ) : (
          <div className="empty-section-message">No methods</div>
        )}
      </div>
    </div>
  );
};

export default memo(UMLAbstractClassNode);
