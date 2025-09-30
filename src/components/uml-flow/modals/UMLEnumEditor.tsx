import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, MoveUp, MoveDown } from 'lucide-react';
import type { UMLNodeData, UMLEnumValue, UMLAttribute, UMLMethod, UMLVisibility } from '../types';
import { generateId } from '../types';

interface UMLEnumEditorProps {
  isOpen: boolean;
  nodeData: UMLNodeData;
  onClose: () => void;
  onSave: (updatedData: UMLNodeData) => void;
}

type TabType = 'basic' | 'values' | 'attributes' | 'methods';

const UMLEnumEditor: React.FC<UMLEnumEditorProps> = ({ isOpen, nodeData, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [editingData, setEditingData] = useState<UMLNodeData>(nodeData);
  
  const [newEnumValue, setNewEnumValue] = useState<Omit<UMLEnumValue, 'id'>>({
    name: '',
    value: ''
  });

  const [newAttribute, setNewAttribute] = useState<Omit<UMLAttribute, 'id'>>({
    name: '',
    type: 'String',
    visibility: 'private',
    isStatic: false,
    isFinal: false,
    defaultValue: ''
  });

  const [newMethod, setNewMethod] = useState<Omit<UMLMethod, 'id'>>({
    name: '',
    returnType: 'void',
    visibility: 'public',
    isStatic: false,
    isAbstract: false,
    parameters: []
  });

  useEffect(() => {
    setEditingData(nodeData);
  }, [nodeData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editingData);
    onClose();
  };

  const addEnumValue = () => {
    if (!newEnumValue.name.trim()) return;
    
    const enumValue: UMLEnumValue = {
      id: generateId(),
      ...newEnumValue
    };

    setEditingData(prev => ({
      ...prev,
      enumValues: [...(prev.enumValues || []), enumValue]
    }));

    setNewEnumValue({
      name: '',
      value: ''
    });
  };

  const removeEnumValue = (id: string) => {
    setEditingData(prev => ({
      ...prev,
      enumValues: (prev.enumValues || []).filter(value => value.id !== id)
    }));
  };

  const moveEnumValueUp = (index: number) => {
    if (index === 0 || !editingData.enumValues) return;
    
    const newValues = [...editingData.enumValues];
    [newValues[index - 1], newValues[index]] = [newValues[index], newValues[index - 1]];
    
    setEditingData(prev => ({
      ...prev,
      enumValues: newValues
    }));
  };

  const moveEnumValueDown = (index: number) => {
    if (!editingData.enumValues || index === editingData.enumValues.length - 1) return;
    
    const newValues = [...editingData.enumValues];
    [newValues[index], newValues[index + 1]] = [newValues[index + 1], newValues[index]];
    
    setEditingData(prev => ({
      ...prev,
      enumValues: newValues
    }));
  };

  const addAttribute = () => {
    if (!newAttribute.name.trim()) return;
    
    const attribute: UMLAttribute = {
      id: generateId(),
      ...newAttribute
    };

    setEditingData(prev => ({
      ...prev,
      attributes: [...(prev.attributes || []), attribute]
    }));

    setNewAttribute({
      name: '',
      type: 'String',
      visibility: 'private',
      isStatic: false,
      isFinal: false,
      defaultValue: ''
    });
  };

  const removeAttribute = (id: string) => {
    setEditingData(prev => ({
      ...prev,
      attributes: (prev.attributes || []).filter(attr => attr.id !== id)
    }));
  };

  const addMethod = () => {
    if (!newMethod.name.trim()) return;
    
    const method: UMLMethod = {
      id: generateId(),
      ...newMethod
    };

    setEditingData(prev => ({
      ...prev,
      methods: [...(prev.methods || []), method]
    }));

    setNewMethod({
      name: '',
      returnType: 'void',
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: []
    });
  };

  const removeMethod = (id: string) => {
    setEditingData(prev => ({
      ...prev,
      methods: (prev.methods || []).filter(method => method.id !== id)
    }));
  };

  const visibilityOptions: { value: UMLVisibility; label: string; symbol: string }[] = [
    { value: 'public', label: 'Public', symbol: '+' },
    { value: 'private', label: 'Private', symbol: '-' },
    { value: 'protected', label: 'Protected', symbol: '#' },
    { value: 'package', label: 'Package', symbol: '~' }
  ];

  // Helper function to protect all keyboard events in inputs
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        e.stopPropagation();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[88vh] flex flex-col animate-in zoom-in-95 duration-300">
        {/* Modern Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Enum Editor</h2>
            <p className="text-sm text-gray-500 mt-0.5">Define enumeration values and optional members</p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors group"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>

        {/* Modern Tabs */}
        <div className="flex gap-1 px-6 pt-4">
          {[
            { id: 'basic', label: 'Basic' },
            { id: 'values', label: 'Values' },
            { id: 'attributes', label: 'Attributes' },
            { id: 'methods', label: 'Methods' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          {activeTab === 'basic' && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enumeration Name</label>
                <input
                  type="text"
                  value={editingData.label || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, label: e.target.value }))}
                  onKeyDown={handleInputKeyDown}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., OrderStatus"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Package</label>
                <input
                  type="text"
                  value={editingData.package || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, package: e.target.value }))}
                  onKeyDown={handleInputKeyDown}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="com.example.enums"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="font-medium text-blue-900 mb-2">Java Enum Characteristics</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Enum values are constants representing fixed set of values</li>
                  <li>In Java, enums can have attributes and methods</li>
                  <li>Each enum value can have associated data via constructor</li>
                  <li>Values tab is required, attributes and methods are optional</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'values' && (
            <div className="space-y-6">
              {/* Add Value Form */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Add Enum Value
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Constant Name</label>
                    <input
                      type="text"
                      placeholder="e.g., PENDING, ACTIVE"
                      value={newEnumValue.name}
                      onChange={(e) => setNewEnumValue(prev => ({ ...prev, name: e.target.value.toUpperCase() }))}
                      onKeyDown={handleInputKeyDown}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Value (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., 0, #FF5733"
                      value={newEnumValue.value || ''}
                      onChange={(e) => setNewEnumValue(prev => ({ ...prev, value: e.target.value }))}
                      onKeyDown={handleInputKeyDown}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={addEnumValue}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Value
                </button>
              </div>

              {/* Values List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Enum Values</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {(editingData.enumValues || []).length} values
                  </span>
                </div>
                <div className="space-y-2">
                  {(editingData.enumValues || []).map((enumValue, index) => (
                    <div key={enumValue.id} className="flex items-center justify-between bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex-1 font-mono text-sm">
                        <span className="font-bold text-blue-700">{enumValue.name}</span>
                        {enumValue.value && (
                          <span className="text-gray-500 ml-2">= <span className="text-purple-600">{enumValue.value}</span></span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveEnumValueUp(index)}
                          disabled={index === 0}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <MoveUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveEnumValueDown(index)}
                          disabled={index === (editingData.enumValues || []).length - 1}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <MoveDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeEnumValue(enumValue.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {(editingData.enumValues || []).length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-sm">No enum values defined yet</p>
                      <p className="text-xs mt-1">Add your first constant above</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm text-blue-800">
                  In Java, enums can have attributes to store data associated with each constant. These are optional.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Add New Attribute</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Attribute name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Type"
                    value={newAttribute.type}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value }))}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="p-2 border rounded-md"
                  />
                  <select
                    value={newAttribute.visibility}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, visibility: e.target.value as UMLVisibility }))}
                    className="p-2 border rounded-md"
                  >
                    {visibilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.symbol} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={newAttribute.isFinal || false}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, isFinal: e.target.checked }))}
                    />
                    <span className="text-sm">Final</span>
                  </label>
                  <button
                    onClick={addAttribute}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Attributes ({(editingData.attributes || []).length})</h3>
                <div className="space-y-2">
                  {(editingData.attributes || []).map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between bg-white p-3 border rounded-md">
                      <div className="flex-1">
                        <span className="font-mono text-sm">
                          {visibilityOptions.find(v => v.value === attr.visibility)?.symbol} {attr.name}: {attr.type}
                          {attr.isFinal && ' (final)'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttribute(attr.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(editingData.attributes || []).length === 0 && (
                    <div className="text-gray-500 text-center py-8">
                      No attributes defined
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'methods' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
                <p className="text-sm text-blue-800">
                  Enums can have methods in Java. Common use cases include getters for attributes, business logic, or utility methods.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Add New Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Method name"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Return type"
                    value={newMethod.returnType}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, returnType: e.target.value }))}
                    onKeyDown={(e) => e.stopPropagation()}
                    className="p-2 border rounded-md"
                  />
                  <select
                    value={newMethod.visibility}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, visibility: e.target.value as UMLVisibility }))}
                    className="p-2 border rounded-md"
                  >
                    {visibilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.symbol} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <button
                    onClick={addMethod}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Methods ({(editingData.methods || []).length})</h3>
                <div className="space-y-2">
                  {(editingData.methods || []).map((method) => (
                    <div key={method.id} className="flex items-center justify-between bg-white p-3 border rounded-md">
                      <div className="flex-1">
                        <span className="font-mono text-sm">
                          {visibilityOptions.find(v => v.value === method.visibility)?.symbol} {method.name}
                          ({method.parameters?.map(p => `${p.name}: ${p.type}`).join(', ') || ''}): {method.returnType}
                        </span>
                      </div>
                      <button
                        onClick={() => removeMethod(method.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(editingData.methods || []).length === 0 && (
                    <div className="text-gray-500 text-center py-8">
                      No methods defined
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modern Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 font-medium shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40"
          >
            <Save className="w-4 h-4" />
            Save Enum
          </button>
        </div>
      </div>
    </div>
  );
};

export default UMLEnumEditor;
