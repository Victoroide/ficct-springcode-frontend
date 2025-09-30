/**
 * UMLEnumNode.tsx
 * Specialized UML node for representing Enumeration types
 */

import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import type { UMLNodeData, UMLEnumValue } from '../types';

interface UMLEnumNodeProps extends NodeProps<UMLNodeData> {
  onEdit?: (nodeData: UMLNodeData) => void;
  onUpdateLabel?: (nodeId: string, newLabel: string) => void;
}

const UMLEnumNode: React.FC<UMLEnumNodeProps> = ({ id, data, isConnectable, selected, onEdit, onUpdateLabel }) => {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(data.label || '');
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  const enumValues = data.enumValues || [];

  React.useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleDoubleClick = () => {
    if (onEdit) {
      onEdit(data);
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
    if (editedName.trim() && editedName !== data.label && onUpdateLabel) {
      onUpdateLabel(id, editedName.trim());
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
      className={`uml-node enum-node ${selected ? 'selected' : ''}`}
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

      {/* Enum name header */}
      <div className="uml-node-header enum-header">
        <div className="uml-node-stereotype">&lt;&lt;enumeration&gt;&gt;</div>
        {isEditingName ? (
          <input
            ref={inputRef}
            type="text"
            value={editedName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            className="uml-node-title-input"
            placeholder="Enter enum name"
          />
        ) : (
          <div 
            className="uml-node-title editable-title" 
            onClick={handleNameClick}
            title="Click to edit name"
          >
            {data.label || 'Enum'}
          </div>
        )}
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
