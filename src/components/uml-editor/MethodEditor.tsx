/**
 * Method Editor Component
 * Handles inline editing of UML class methods
 */

import React, { useState, useRef, useEffect } from 'react';
import type { UMLMethod, UMLParameter } from './types';
import { useUMLEditorTheme } from './UMLEditorTheme';
import { getConditionalStyles } from './themeUtils';
import umlApiService from '@/services/umlApiService';
import { v4 as uuidv4 } from 'uuid';

interface MethodEditorProps {
  elementId: string;
  method: UMLMethod;
  onUpdate: (updated: UMLMethod) => void;
  onDelete: (id: string) => void;
  onError: (error: string) => void;
}

export const MethodEditor: React.FC<MethodEditorProps> = ({
  elementId,
  method,
  onUpdate,
  onDelete,
  onError
}) => {
  const theme = useUMLEditorTheme();
  // getConditionalStyles imported from themeUtils
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(method.name);
  const [returnType, setReturnType] = useState(method.returnType);
  const [visibility, setVisibility] = useState(method.visibility);
  const [parameters, setParameters] = useState<UMLParameter[]>(method.parameters);
  const [isStatic, setIsStatic] = useState(method.isStatic || false);
  const [isAbstract, setIsAbstract] = useState(method.isAbstract || false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  
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
      return 'Method name cannot be empty';
    }
    
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name.trim())) {
      return 'Invalid method name. Must be a valid Java identifier.';
    }
    
    return null;
  };
  
  // Add parameter
  const handleAddParameter = () => {
    const newParam: UMLParameter = {
      id: uuidv4(),
      name: 'param',
      type: 'String'
    };
    
    setParameters([...parameters, newParam]);
  };
  
  // Update parameter
  const handleUpdateParameter = (index: number, field: keyof UMLParameter, value: string) => {
    const updatedParams = [...parameters];
    updatedParams[index] = { 
      ...updatedParams[index], 
      [field]: value 
    };
    setParameters(updatedParams);
  };
  
  // Remove parameter
  const handleRemoveParameter = (index: number) => {
    const updatedParams = [...parameters];
    updatedParams.splice(index, 1);
    setParameters(updatedParams);
  };
  
  // Handle save
  const handleSave = async () => {
    const error = validateInput();
    if (error) {
      onError(error);
      return;
    }
    
    setIsLoading(true);
    
    const updatedMethod: UMLMethod = {
      ...method,
      name: name.trim(),
      returnType: returnType.trim(),
      visibility,
      parameters,
      isStatic,
      isAbstract
    };
    
    try {
      // Optimistic update
      onUpdate(updatedMethod);
      
      // Call API
      await umlApiService.updateMethod(elementId, updatedMethod);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating method:', error);
      onError('Failed to update method. Please try again.');
      
      // Revert optimistic update
      onUpdate(method);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    // Reset all fields
    setName(method.name);
    setReturnType(method.returnType);
    setVisibility(method.visibility);
    setParameters([...method.parameters]);
    setIsStatic(method.isStatic || false);
    setIsAbstract(method.isAbstract || false);
    setIsEditing(false);
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this method?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await umlApiService.deleteMethod(elementId, method.id);
      onDelete(method.id);
    } catch (error) {
      console.error('Error deleting method:', error);
      onError('Failed to delete method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
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

  // Render parameters for display mode
  const renderParametersString = () => {
    return parameters.map(param => `${param.name}: ${param.type}`).join(', ');
  };

  if (isEditing) {
    return (
      <div 
        className={getConditionalStyles({
          base: "method-item editing p-2 border rounded-md mb-2",
          light: "bg-gray-50 border-gray-300",
          dark: "bg-gray-700 border-gray-600"
        })}
        onKeyDown={handleKeyDown}
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
              placeholder="Method name"
              className={getConditionalStyles({
                base: "flex-1 px-2 py-1 text-sm border rounded",
                light: "bg-white border-gray-300 text-gray-900",
                dark: "bg-gray-800 border-gray-600 text-gray-100"
              })}
              disabled={isLoading}
            />
          </div>
          
          {/* Parameters Section */}
          <div className="border rounded p-2">
            <div className="flex justify-between items-center mb-2">
              <label className={getConditionalStyles({
                base: "text-xs font-medium",
                light: "text-gray-600",
                dark: "text-gray-400"
              })}>
                Parameters
              </label>
              <button
                onClick={handleAddParameter}
                className={getConditionalStyles({
                  base: "text-xs px-2 py-1 rounded",
                  light: "bg-blue-500 text-white hover:bg-blue-600",
                  dark: "bg-blue-600 text-white hover:bg-blue-700"
                })}
                disabled={isLoading}
              >
                + Add
              </button>
            </div>
            
            {parameters.length > 0 ? (
              <div className="space-y-2">
                {parameters.map((param, index) => (
                  <div key={param.id || index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={param.name}
                      onChange={(e) => handleUpdateParameter(index, 'name', e.target.value)}
                      placeholder="Name"
                      className={getConditionalStyles({
                        base: "w-1/2 px-2 py-1 text-xs border rounded",
                        light: "bg-white border-gray-300 text-gray-900",
                        dark: "bg-gray-800 border-gray-600 text-gray-100"
                      })}
                      disabled={isLoading}
                    />
                    <input
                      type="text"
                      value={param.type}
                      onChange={(e) => handleUpdateParameter(index, 'type', e.target.value)}
                      placeholder="Type"
                      className={getConditionalStyles({
                        base: "w-1/2 px-2 py-1 text-xs border rounded",
                        light: "bg-white border-gray-300 text-gray-900",
                        dark: "bg-gray-800 border-gray-600 text-gray-100"
                      })}
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => handleRemoveParameter(index)}
                      className={getConditionalStyles({
                        base: "text-xs p-1 rounded",
                        light: "bg-red-500 text-white hover:bg-red-600",
                        dark: "bg-red-600 text-white hover:bg-red-700"
                      })}
                      disabled={isLoading}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={getConditionalStyles({
                base: "text-xs italic text-center py-1",
                light: "text-gray-500",
                dark: "text-gray-400"
              })}>
                No parameters
              </div>
            )}
          </div>
          
          {/* Return Type */}
          <div className="flex items-center space-x-2">
            <label className={getConditionalStyles({
              base: "text-xs font-medium",
              light: "text-gray-600",
              dark: "text-gray-400"
            })}>
              Return:
            </label>
            <input
              type="text"
              value={returnType}
              onChange={(e) => setReturnType(e.target.value)}
              placeholder="void, String, int, etc."
              className={getConditionalStyles({
                base: "flex-1 px-2 py-1 text-sm border rounded",
                light: "bg-white border-gray-300 text-gray-900",
                dark: "bg-gray-800 border-gray-600 text-gray-100"
              })}
              disabled={isLoading}
            />
          </div>
          
          {/* Modifiers */}
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
                checked={isAbstract}
                onChange={(e) => setIsAbstract(e.target.checked)}
                className="rounded"
                disabled={isLoading}
              />
              <span className={getConditionalStyles({
                base: "text-xs",
                light: "text-gray-600",
                dark: "text-gray-400"
              })}>
                abstract
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
        base: "method-item flex items-center justify-between p-2 rounded hover:bg-opacity-80 cursor-pointer transition-colors",
        light: "hover:bg-gray-100",
        dark: "hover:bg-gray-700"
      })}
      onDoubleClick={handleDoubleClick}
      style={{ color: theme.elementColors.class.text }}
    >
      <div className="flex items-center space-x-1 flex-1 min-w-0">
        <span className="visibility-icon font-mono font-bold text-sm w-4 text-center">
          {getVisibilitySymbol(method.visibility)}
        </span>
        
        <span className="method-name font-medium">
          {method.name}
        </span>
        
        <span className="text-gray-400">(</span>
        <span className="method-params text-sm truncate" title={renderParametersString()}>
          {renderParametersString()}
        </span>
        <span className="text-gray-400">)</span>
        
        <span className="text-gray-400">:</span>
        
        <span className="method-return-type text-sm truncate">
          {method.returnType}
        </span>
        
        {(method.isStatic || method.isAbstract) && (
          <div className="flex space-x-1">
            {method.isStatic && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-blue-100 text-blue-800",
                dark: "bg-blue-900 text-blue-200"
              })}>
                static
              </span>
            )}
            {method.isAbstract && (
              <span className={getConditionalStyles({
                base: "text-xs px-1 rounded",
                light: "bg-purple-100 text-purple-800",
                dark: "bg-purple-900 text-purple-200"
              })}>
                abstract
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
          title="Edit method"
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
          title="Delete method"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default MethodEditor;
