/**
 * EditableMethodRow.tsx
 * CRITICAL FIX: Adds edit mode for existing methods in modal
 * Allows editing name, return type, visibility, and modifiers
 */

import React, { useState } from 'react';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import type { UMLMethod, UMLVisibility } from '../types';

interface EditableMethodRowProps {
  method: UMLMethod;
  onUpdate: (updated: UMLMethod) => void;
  onDelete: (id: string) => void;
  visibilityOptions: { value: UMLVisibility; label: string; symbol: string }[];
}

const commonReturnTypes = [
  'void',
  'String',
  'Long',
  'Integer',
  'Double',
  'Float',
  'Boolean',
  'LocalDate',
  'LocalDateTime',
  'BigDecimal',
  'UUID',
  'List',
  'Set',
  'Map',
  'Optional'
];

export const EditableMethodRow: React.FC<EditableMethodRowProps> = ({ 
  method, 
  onUpdate, 
  onDelete,
  visibilityOptions 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UMLMethod>(method);
  const [useCustomReturnType, setUseCustomReturnType] = useState(!commonReturnTypes.includes(method.returnType));

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Method name is required');
      return;
    }
    if (!formData.returnType.trim()) {
      alert('Return type is required');
      return;
    }
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(method); // Reset to original
    setUseCustomReturnType(!commonReturnTypes.includes(method.returnType));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const formatParameters = (params: typeof method.parameters) => {
    if (!params || params.length === 0) return '()';
    return `(${params.map(p => `${p.name}: ${p.type}`).join(', ')})`;
  };

  if (isEditing) {
    return (
      <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
        <div className="grid grid-cols-2 gap-3">
          {/* Method Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              onKeyDown={handleKeyDown}
              placeholder="methodName"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Return Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Return Type *</label>
            {useCustomReturnType ? (
              <input
                type="text"
                value={formData.returnType}
                onChange={(e) => setFormData({...formData, returnType: e.target.value})}
                onKeyDown={handleKeyDown}
                placeholder="CustomType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <select
                value={formData.returnType}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setUseCustomReturnType(true);
                    setFormData({...formData, returnType: ''});
                  } else {
                    setFormData({...formData, returnType: e.target.value});
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {commonReturnTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
                <option value="__custom__">Custom Type...</option>
              </select>
            )}
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({...formData, visibility: e.target.value as UMLVisibility})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {visibilityOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.symbol} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Parameters Info (Read-only for now) */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Parameters</label>
            <input
              type="text"
              value={formatParameters(formData.parameters)}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              title="Edit parameters in the full method editor"
            />
          </div>
        </div>

        {/* Modifiers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isStatic}
                onChange={(e) => setFormData({...formData, isStatic: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Static</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAbstract || false}
                onChange={(e) => setFormData({...formData, isAbstract: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Abstract</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span className="font-medium">Save</span>
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center space-x-2 transition-all"
            >
              <X className="w-4 h-4" />
              <span className="font-medium">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Display Mode
  return (
    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group">
      <div className="flex-1">
        <span className="font-mono text-sm text-gray-800">
          {visibilityOptions.find(v => v.value === formData.visibility)?.symbol} {formData.name}{formatParameters(formData.parameters)}: {formData.returnType}
          {formData.isStatic && ' (static)'}
          {formData.isAbstract && ' (abstract)'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all"
          aria-label="Edit method"
          title="Edit method"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(method.id)}
          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all"
          aria-label="Delete method"
          title="Delete method"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
