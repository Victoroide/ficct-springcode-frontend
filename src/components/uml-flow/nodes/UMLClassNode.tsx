/**
 * UMLClassNode.tsx
 * Enhanced UML Class Node with proper structure and styling
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

const UMLClassNode: React.FC<NodeProps<UMLNodeData>> = ({ data, isConnectable, selected }) => {
  const attributes = data.attributes || [];
  const methods = data.methods || [];

  return (
    <div className={`uml-node class-node ${selected ? 'selected' : ''}`}>
      {/* Connection handles - Multiple points on each side */}
      {/* Top handles */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        isConnectable={isConnectable}
        className="connection-handle top-handle"
        style={{ left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        isConnectable={isConnectable}
        className="connection-handle top-handle source-handle"
        style={{ left: '50%', top: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-left"
        isConnectable={isConnectable}
        className="connection-handle top-handle"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-left-source"
        isConnectable={isConnectable}
        className="connection-handle top-handle source-handle"
        style={{ left: '25%', top: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top-right"
        isConnectable={isConnectable}
        className="connection-handle top-handle"
        style={{ left: '75%' }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-right-source"
        isConnectable={isConnectable}
        className="connection-handle top-handle source-handle"
        style={{ left: '75%', top: '-4px' }}
      />

      {/* Bottom handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        isConnectable={isConnectable}
        className="connection-handle bottom-handle"
        style={{ left: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        isConnectable={isConnectable}
        className="connection-handle bottom-handle source-handle"
        style={{ left: '50%', bottom: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-left"
        isConnectable={isConnectable}
        className="connection-handle bottom-handle"
        style={{ left: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-left-source"
        isConnectable={isConnectable}
        className="connection-handle bottom-handle source-handle"
        style={{ left: '25%', bottom: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom-right"
        isConnectable={isConnectable}
        className="connection-handle bottom-handle"
        style={{ left: '75%' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-right-source"
        isConnectable={isConnectable}
        className="connection-handle bottom-handle source-handle"
        style={{ left: '75%', bottom: '-4px' }}
      />

      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="connection-handle left-handle"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={isConnectable}
        className="connection-handle left-handle source-handle"
        style={{ top: '50%', left: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-top"
        isConnectable={isConnectable}
        className="connection-handle left-handle"
        style={{ top: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-top-source"
        isConnectable={isConnectable}
        className="connection-handle left-handle source-handle"
        style={{ top: '25%', left: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-bottom"
        isConnectable={isConnectable}
        className="connection-handle left-handle"
        style={{ top: '75%' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-bottom-source"
        isConnectable={isConnectable}
        className="connection-handle left-handle source-handle"
        style={{ top: '75%', left: '-4px' }}
      />

      {/* Right handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="connection-handle right-handle"
        style={{ top: '50%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className="connection-handle right-handle source-handle"
        style={{ top: '50%', right: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-top"
        isConnectable={isConnectable}
        className="connection-handle right-handle"
        style={{ top: '25%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-top-source"
        isConnectable={isConnectable}
        className="connection-handle right-handle source-handle"
        style={{ top: '25%', right: '-4px' }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-bottom"
        isConnectable={isConnectable}
        className="connection-handle right-handle"
        style={{ top: '75%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-bottom-source"
        isConnectable={isConnectable}
        className="connection-handle right-handle source-handle"
        style={{ top: '75%', right: '-4px' }}
      />

      {/* Class name header */}
      <div className="uml-node-header">
        {data.isAbstract && <div className="uml-node-stereotype">&lt;&lt;abstract&gt;&gt;</div>}
        <div className="uml-node-title">{data.label || 'Class'}</div>
      </div>

      {/* Attributes section */}
      <div className="uml-node-section">
        {attributes.length > 0 ? (
          attributes.map((attr) => (
            <div key={attr.id} className="uml-attribute">
              <span className="visibility-indicator">
                {getVisibilitySymbol(attr.visibility)}
              </span>{' '}
              <span className="attribute-name">{attr.name}</span>
              <span className="attribute-separator">:</span>
              <span className="attribute-type">{attr.type}</span>
              {attr.isStatic && <span className="static-indicator">static</span>}
              {attr.isFinal && <span className="final-indicator">final</span>}
              {attr.defaultValue && (
                <>
                  <span className="attribute-separator">=</span>
                  <span className="attribute-default">{attr.defaultValue}</span>
                </>
              )}
            </div>
          ))
        ) : (
          <div className="empty-section-message">No attributes</div>
        )}
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

export default memo(UMLClassNode);
