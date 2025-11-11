/**
 * InlineEditableComponents.tsx
 * Reusable inline editing components for UML nodes
 * CRITICAL FIX: Restores double-click inline editing for attributes, methods, and enum values
 */

import React, { useState, useEffect, useRef } from 'react';
import type { UMLAttribute, UMLMethod, UMLEnumValue, UMLVisibility } from '../types';

// Helper function to render visibility symbol
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

// ==================== EDITABLE ATTRIBUTE - ENHANCED ====================
// CRITICAL FIX: Now supports editing BOTH name AND type separately
interface EditableAttributeProps {
  attribute: UMLAttribute;
  onUpdate: (attributeId: string, updates: Partial<UMLAttribute>) => void;
}

const commonTypes = [
  'String',
  'Long',
  'Integer',
  'Double',
  'Float',
  'Boolean',
  'LocalDate',
  'LocalDateTime',
  'BigDecimal',
  'UUID'
];

export const EditableAttribute: React.FC<EditableAttributeProps> = ({ attribute, onUpdate }) => {
  const [editingField, setEditingField] = useState<'none' | 'name' | 'type'>('none');
  const [editName, setEditName] = useState(attribute.name);
  const [editType, setEditType] = useState(attribute.type);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const typeInputRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    if (editingField === 'name' && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
    if (editingField === 'type' && typeInputRef.current) {
      typeInputRef.current.focus();
    }
  }, [editingField]);

  const handleDoubleClickName = (e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: Prevent React Flow from capturing
    e.preventDefault();
    setEditingField('name');
    setEditName(attribute.name);
  };

  const handleDoubleClickType = (e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: Prevent React Flow from capturing
    e.preventDefault();
    setEditingField('type');
    setEditType(attribute.type);
  };

  const handleSaveName = () => {
    setEditingField('none');
    if (editName.trim() && editName !== attribute.name) {
      onUpdate(attribute.id, { name: editName.trim() });
    } else {
      setEditName(attribute.name); // Revert if empty
    }
  };

  const handleSaveType = () => {
    setEditingField('none');
    if (editType.trim() && editType !== attribute.type) {
      onUpdate(attribute.id, { type: editType.trim() });
    } else {
      setEditType(attribute.type); // Revert if empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, field: 'name' | 'type') => {
    e.stopPropagation(); // CRITICAL: Prevent React Flow hotkeys
    if (e.key === 'Enter') {
      if (field === 'name') handleSaveName();
      else handleSaveType();
    }
    if (e.key === 'Escape') {
      setEditName(attribute.name); // Revert
      setEditType(attribute.type); // Revert
      setEditingField('none');
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node drag
  };

  return (
    <div 
      className="uml-attribute editable-item editable-multi-field"
      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
    >
      <span className="visibility-indicator">
        {getVisibilitySymbol(attribute.visibility)}
      </span>

      {editingField === 'name' ? (
        <input
          ref={nameInputRef}
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleSaveName}
          onKeyDown={(e) => handleKeyDown(e, 'name')}
          onClick={handleInputClick}
          className="inline-edit-input attribute-name-input"
          style={{ minWidth: '80px', maxWidth: '150px' }}
        />
      ) : (
        <span 
          className="attribute-name editable-field"
          onDoubleClick={handleDoubleClickName}
          style={{ cursor: 'text' }}
          title="Double-click to edit name"
        >
          {attribute.name}
        </span>
      )}

      <span className="attribute-separator">:</span>

      {editingField === 'type' ? (
        <select
          ref={typeInputRef}
          value={commonTypes.includes(editType) ? editType : '__custom__'}
          onChange={(e) => {
            if (e.target.value === '__custom__') {
              const customType = prompt('Enter custom type:', editType);
              if (customType && customType.trim()) {
                setEditType(customType.trim());
                handleSaveType();
              } else {
                setEditingField('none');
              }
            } else {
              setEditType(e.target.value);
            }
          }}
          onBlur={handleSaveType}
          onKeyDown={(e) => handleKeyDown(e, 'type')}
          onClick={handleInputClick}
          className="inline-edit-input attribute-type-select"
          style={{ minWidth: '100px' }}
        >
          {commonTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
          <option value="__custom__">Custom...</option>
        </select>
      ) : (
        <span 
          className="attribute-type editable-field"
          onDoubleClick={handleDoubleClickType}
          style={{ cursor: 'text' }}
          title="Double-click to edit type"
        >
          {attribute.type}
        </span>
      )}

      {attribute.isStatic && <span className="static-indicator"> (static)</span>}
    </div>
  );
};

// ==================== EDITABLE METHOD ====================
interface EditableMethodProps {
  method: UMLMethod;
  onUpdate: (methodId: string, newName: string) => void;
}

export const EditableMethod: React.FC<EditableMethodProps> = ({ method, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(method.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: Prevent React Flow from capturing
    e.preventDefault();
    setIsEditing(true);
    setEditValue(method.name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== method.name) {
      onUpdate(method.id, editValue.trim());
    } else {
      setEditValue(method.name); // Revert if empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // CRITICAL: Prevent React Flow hotkeys
    if (e.key === 'Enter') {
      inputRef.current?.blur(); // Trigger handleBlur
    }
    if (e.key === 'Escape') {
      setEditValue(method.name); // Revert
      setIsEditing(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node drag
  };

  return (
    <div 
      className="uml-method editable-item"
      onDoubleClick={handleDoubleClick}
      style={{ cursor: 'text' }}
    >
      <span className="visibility-indicator">
        {getVisibilitySymbol(method.visibility)}
      </span>{' '}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          className="inline-edit-input method-name-input"
        />
      ) : (
        <span className="method-name">{method.name}</span>
      )}
      <span className="method-params">
        ({method.parameters?.map(p => `${p.name}: ${p.type}`).join(', ') || ''})
      </span>
      <span className="method-separator">:</span>
      <span className="method-type">{method.returnType}</span>
      {method.isStatic && <span className="static-indicator"> (static)</span>}
      {method.isAbstract && <span className="abstract-indicator"> (abstract)</span>}
    </div>
  );
};

// ==================== EDITABLE ENUM VALUE ====================
interface EditableEnumValueProps {
  enumValue: UMLEnumValue;
  onUpdate: (enumValueId: string, newName: string) => void;
}

export const EditableEnumValue: React.FC<EditableEnumValueProps> = ({ enumValue, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(enumValue.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // CRITICAL: Prevent React Flow from capturing
    e.preventDefault();
    setIsEditing(true);
    setEditValue(enumValue.name);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editValue.trim() && editValue !== enumValue.name) {
      onUpdate(enumValue.id, editValue.trim());
    } else {
      setEditValue(enumValue.name); // Revert if empty
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // CRITICAL: Prevent React Flow hotkeys
    if (e.key === 'Enter') {
      inputRef.current?.blur(); // Trigger handleBlur
    }
    if (e.key === 'Escape') {
      setEditValue(enumValue.name); // Revert
      setIsEditing(false);
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent node drag
  };

  return (
    <div 
      className="uml-enum-constant editable-item"
      onDoubleClick={handleDoubleClick}
      style={{ cursor: 'text' }}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          className="inline-edit-input enum-name-input"
        />
      ) : (
        <span className="enum-name">{enumValue.name}</span>
      )}
      {enumValue.value && (
        <>
          <span className="enum-separator"> = </span>
          <span className="enum-value">{enumValue.value}</span>
        </>
      )}
    </div>
  );
};
