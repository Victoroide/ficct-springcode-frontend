/**
 * Attribute Editor Component
 * Handles inline editing of UML class attributes
 */

import React, { useState, useRef, useEffect } from 'react';
import type { UMLAttribute, UMLClass } from './types';
import { useUMLEditorTheme } from './UMLEditorTheme';
import { getConditionalStyles } from './themeUtils';
import umlApiService from '@/services/umlApiService';

interface AttributeEditorProps {
  elementId: string;
  attribute: UMLAttribute;
  onUpdate: (updated: UMLAttribute) => void;
  onDelete: (id: string) => void;
  onError: (error: string) => void;
}

export const AttributeEditor: React.FC<AttributeEditorProps> = ({
  elementId,
  attribute,
  onUpdate,
  onDelete,
  onError
}) => {
  const theme = useUMLEditorTheme();
  // getConditionalStyles imported from themeUtils
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(attribute.name);
  const [type, setType] = useState(attribute.type);
  const [visibility, setVisibility] = useState(attribute.visibility);
  const [defaultValue, setDefaultValue] = useState(attribute.defaultValue || '');
  const [isStatic, setIsStatic] = useState(attribute.isStatic || false);
  const [isFinal, setIsFinal] = useState(attribute.isFinal || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const typeInputRef = useRef<HTMLInputElement>(null);
  
  // Start editing on double click
  const handleDoubleClick = () => {
    if (isLoading) return;
    setIsEditing(true);
  };
  
  // Focus name input when editing starts
  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);
  
  // Validation function
  const validateInput = (): string | null => {
    if (!name.trim()) {
      return 'Attribute name cannot be empty';
    }
    
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name.trim())) {
      return 'Invalid attribute name. Must be a valid Java identifier.';
    }
    
    if (!type.trim()) {
      return 'Attribute type cannot be empty';
    }
    
    return null;
  };
  
  // Handle save
  const handleSave = async () => {
    const error = validateInput();
    if (error) {
      onError(error);
      return;
    }
    
    setIsLoading(true);
    
    const updatedAttribute: UMLAttribute = {
      ...attribute,
      name: name.trim(),
      type: type.trim(),
      visibility,
      defaultValue: defaultValue.trim() || undefined,
      isStatic,
      isFinal
    };
    
    try {
      // Optimistic update
      onUpdate(updatedAttribute);
      
      // Call API
      await umlApiService.updateAttribute(elementId, updatedAttribute);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating attribute:', error);
      onError('Failed to update attribute. Please try again.');
      
      // Revert optimistic update
      onUpdate(attribute);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset all fields
    setName(attribute.name);
    setType(attribute.type);
    setVisibility(attribute.visibility);
    setDefaultValue(attribute.defaultValue || '');
    setIsStatic(attribute.isStatic || false);
    setIsFinal(attribute.isFinal || false);
    setIsEditing(false);
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this attribute?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await umlApiService.deleteAttribute(elementId, attribute.id);
      onDelete(attribute.id);
    } catch (error) {
      console.error('Error deleting attribute:', error);
      onError('Failed to delete attribute. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.target === typeInputRef.current) {
        handleSave();
      } else {
        // Move to next field
        typeInputRef.current?.focus();
      }
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  // Render visibility symbol
  const getVisibilitySymbol = (vis: string) => {
    switch (vis) {
      case 'public': return '+';
      case 'private': return '-';
      case 'protected': return '#';
      default: return '~';
    }
  };

  if (isEditing) {
    return (
      <div 
        className={getConditionalStyles({
          base: "attribute-item editing p-2 border rounded-md",
          light: "bg-gray-50 border-gray-300",
          dark: "bg-gray-700 border-gray-600"
        })}
      >
        <div className="space-y-2">
          {/* Visibility and Name Row */}
          <div className="flex items-center space-x-2">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className={getConditionalStyles({
                base: "w-16 px-2 py-1 text-sm border rounded",
                light: "bg-white border-gray-300 text-gray-900",
                dark: "bg-gray-800 border-gray-600 text-gray-100"
              })}
              disabled={isLoading}
            >
              <option value="public">+ Public</option>
              <option value="private">- Private</option>
              <option value="protected"># Protected</option>
            </select>
            
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Attribute name"
              className={getConditionalStyles({
                base: "flex-1 px-2 py-1 text-sm border rounded",
                light: "bg-white border-gray-300 text-gray-900",
                dark: "bg-gray-800 border-gray-600 text-gray-100"
              })}
              disabled={isLoading}
            />
          </div>
          
          {/* Type and Default Value Row */}
          <div className="flex items-center space-x-2">
            <label className={getConditionalStyles({
              base: "text-xs font-medium",
              light: "text-gray-600",
              dark: "text-gray-400"
            })}>
              Type:
            </label>
            <input
              ref={typeInputRef}
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="String, int, etc."
              className={getConditionalStyles({
                base: "flex-1 px-2 py-1 text-sm border rounded",
                light: "bg-white border-gray-300 text-gray-900",
                dark: "bg-gray-800 border-gray-600 text-gray-100"
              })}
              disabled={isLoading}
            />
          </div>
          
          {/* Default Value Row */}
          <div className="flex items-center space-x-2">
            <label className={getConditionalStyles({
              base: "text-xs font-medium",
              light: "text-gray-600",
              dark: "text-gray-400"
            })}>
              Default:
            </label>
            <input
              type="text"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Default value (optional)"
              className={getConditionalStyles({
                base: "flex-1 px-2 py-1 text-sm border rounded",
                light: "bg-white border-gray-300 text-gray-900",
                dark: "bg-gray-800 border-gray-600 text-gray-100"
              })}
              disabled={isLoading}
            />
          </div>
          
          {/* Modifiers Row */}
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={isStatic}
                onChange={(e) => setIsStatic(e.target.checked)}
                className="rounded"
                disabled={isLoading}
              />
              <span className={getConditionalStyles({
                base: "text-xs",
                light: "text-gray-600",
                dark: "text-gray-400"
              })}>
                static
              </span>
            </label>
            
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={isFinal}
                onChange={(e) => setIsFinal(e.target.checked)}
                className="rounded"
                disabled={isLoading}
              />
              <span className={getConditionalStyles({
                base: "text-xs",
                light: "text-gray-600",
                dark: "text-gray-400"
              })}>
                final
              </span>
            </label>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2 border-t">
            <button
              onClick={handleSave}
              disabled={isLoading}
              className={getConditionalStyles({
                base: "px-3 py-1 text-xs rounded font-medium transition-colors",
                light: "bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-400",
                dark: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-600"
              })}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={handleCancel}
              disabled={isLoading}
              className={getConditionalStyles({
                base: "px-3 py-1 text-xs rounded font-medium transition-colors",
                light: "bg-gray-500 hover:bg-gray-600 text-white",
                dark: "bg-gray-600 hover:bg-gray-700 text-white"
              })}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display mode
  return (
    <div 
      className={getConditionalStyles({
        base: "attribute-item flex items-center justify-between p-2 rounded hover:bg-opacity-80 cursor-pointer transition-colors",
        light: "hover:bg-gray-100",
        dark: "hover:bg-gray-700"
      })}
      onDoubleClick={handleDoubleClick}
      style={{ color: theme.elementColors.class.text }}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <span className="visibility-icon font-mono font-bold text-sm w-4 text-center">
          {getVisibilitySymbol(attribute.visibility)}
        </span>
        
        <span className="attribute-name font-medium truncate">
          {attribute.name}
        </span>
        
        <span className="text-gray-400">:</span>
        
        <span className="attribute-type text-sm truncate">
          {attribute.type}
        </span>
        
        {attribute.defaultValue && (
          <>
            <span className="text-gray-400">=</span>
            <span className="attribute-default text-sm italic truncate">
              {attribute.defaultValue}
            </span>
          </>
        )}
        
        {(attribute.isStatic || attribute.isFinal) && (
          <div className="flex space-x-1">
            {attribute.isStatic && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-blue-100 text-blue-800",
                dark: "bg-blue-900 text-blue-200"
              })}>
                static
              </span>
            )}
            {attribute.isFinal && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-purple-100 text-purple-800",
                dark: "bg-purple-900 text-purple-200"
              })}>
                final
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="item-actions flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDoubleClick();
          }}
          disabled={isLoading}
          className={getConditionalStyles({
            base: "p-1 rounded text-xs hover:bg-opacity-20 transition-colors",
            light: "hover:bg-gray-300",
            dark: "hover:bg-gray-600"
          })}
          title="Edit attribute"
        >
          ✏️
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={isLoading}
          className={getConditionalStyles({
            base: "p-1 rounded text-xs hover:bg-opacity-20 transition-colors",
            light: "hover:bg-red-300 text-red-600",
            dark: "hover:bg-red-600 text-red-400"
          })}
          title="Delete attribute"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default AttributeEditor;
