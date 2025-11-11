/**
 * EditableAttributeRow.tsx
 * CRITICAL FIX: Adds edit mode for existing attributes in modal
 * Allows editing name, type, visibility, and modifiers
 */

import React, { useState } from 'react';
import { Trash2, Edit2, Save, X } from 'lucide-react';
import type { UMLAttribute, UMLVisibility } from '../types';

interface EditableAttributeRowProps {
  attribute: UMLAttribute;
  onUpdate: (updated: UMLAttribute) => void;
  onDelete: (id: string) => void;
  visibilityOptions: { value: UMLVisibility; label: string; symbol: string }[];
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
  'UUID',
  'List',
  'Set',
  'Map'
];

export const EditableAttributeRow: React.FC<EditableAttributeRowProps> = ({ 
  attribute, 
  onUpdate, 
  onDelete,
  visibilityOptions 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UMLAttribute>(attribute);
  const [useCustomType, setUseCustomType] = useState(!commonTypes.includes(attribute.type));

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Attribute name is required');
      return;
    }
    if (!formData.type.trim()) {
      alert('Attribute type is required');
      return;
    }
    onUpdate(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(attribute); // Reset to original
    setUseCustomType(!commonTypes.includes(attribute.type));
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

  if (isEditing) {
    return (
      <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-xl space-y-3 animate-in fade-in duration-200">
        <div className="grid grid-cols-2 gap-3">
          {/* Attribute Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              onKeyDown={handleKeyDown}
              placeholder="attributeName"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Type *</label>
            {useCustomType ? (
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                onKeyDown={handleKeyDown}
                placeholder="CustomType"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <select
                value={formData.type}
                onChange={(e) => {
                  if (e.target.value === '__custom__') {
                    setUseCustomType(true);
                    setFormData({...formData, type: ''});
                  } else {
                    setFormData({...formData, type: e.target.value});
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {commonTypes.map(type => (
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

          {/* Default Value */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Default Value</label>
            <input
              type="text"
              value={formData.defaultValue || ''}
              onChange={(e) => setFormData({...formData, defaultValue: e.target.value})}
              onKeyDown={handleKeyDown}
              placeholder="Optional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                checked={formData.isFinal || false}
                onChange={(e) => setFormData({...formData, isFinal: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Final</span>
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
          {visibilityOptions.find(v => v.value === formData.visibility)?.symbol} {formData.name}: {formData.type}
          {formData.defaultValue && ` = ${formData.defaultValue}`}
          {formData.isStatic && ' (static)'}
          {formData.isFinal && ' (final)'}
        </span>
      </div>
      
      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
        <button
          onClick={() => setIsEditing(true)}
          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-all"
          aria-label="Edit attribute"
          title="Edit attribute"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(attribute.id)}
          className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all"
          aria-label="Delete attribute"
          title="Delete attribute"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
