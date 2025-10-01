/**
 * UMLInterfaceNode.tsx
 * Enhanced UML Interface Node with proper structure and styling
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { UMLVisibility } from '../types';
import type { UMLNodeData } from '../types';

const getVisibilitySymbol = (visibility: UMLVisibility): string => {
  switch (visibility) {
    case 'public':
      return '+';
    case 'private':
      return '-';
    case 'protected':
      return '#';
    case 'package':
      return '~';
    default:
      return '+';
  }
};

interface UMLInterfaceNodeProps extends NodeProps<UMLNodeData> {
  onEdit?: (nodeData: UMLNodeData) => void;
  onUpdateLabel?: (nodeId: string, newLabel: string) => void;
}

const UMLInterfaceNode: React.FC<UMLInterfaceNodeProps> = ({ id, data, isConnectable, selected, onEdit, onUpdateLabel }) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(data.label || '');
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const methods = data.methods || [];

  React.useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleDoubleClick = () => {
    // CRITICAL FIX: Use data.onEdit (passed from parent) instead of prop
    const editHandler = (data as any).onEdit || onEdit;
    if (editHandler) {
      editHandler(data);
    }
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingName(true);
    setEditedName(data.label || '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditingName(false);
    const updateHandler = (data as any).onUpdateLabel || onUpdateLabel;
    if (editedName.trim() && editedName !== data.label && updateHandler) {
      updateHandler(id, editedName.trim());
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditingName(false);
      setEditedName(data.label || '');
    }
  };

  return (
    <div 
      className={`uml-node interface-node ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
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

      {/* Interface name header */}
      <div className="uml-node-header">
        <div className="uml-node-stereotype">&lt;&lt;interface&gt;&gt;</div>
        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="uml-node-title-input"
            placeholder="Enter interface name"
          />
        ) : (
          <div 
            className="uml-node-title editable-title" 
            onClick={handleNameClick}
            title="Click to edit name"
          >
            {data.label || 'Interface'}
          </div>
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
