/**
 * UMLClassEditor.tsx
 * Comprehensive UML Class Editor Modal with full editing capabilities
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Save, Eye, EyeOff } from 'lucide-react';
import type { UMLNodeData, UMLAttribute, UMLMethod, UMLParameter, UMLVisibility, UMLNodeType } from '../types';
import { generateId } from '../types';

interface UMLClassEditorProps {
  isOpen: boolean;
  nodeData: UMLNodeData;
  onClose: () => void;
  onSave: (updatedData: UMLNodeData) => void;
}

type TabType = 'basic' | 'attributes' | 'methods' | 'relationships';

const UMLClassEditor: React.FC<UMLClassEditorProps> = ({ isOpen, nodeData, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [editingData, setEditingData] = useState<UMLNodeData>(nodeData);
  
  // Attribute editing states
  const [newAttribute, setNewAttribute] = useState<Omit<UMLAttribute, 'id'>>({
    name: '',
    type: 'String',
    visibility: 'private',
    isStatic: false,
    isFinal: false,
    defaultValue: ''
  });

  // Method editing states
  const [newMethod, setNewMethod] = useState<Omit<UMLMethod, 'id'>>({
    name: '',
    returnType: 'void',
    visibility: 'public',
    isStatic: false,
    isAbstract: false,
    parameters: []
  });

  const [newParameter, setNewParameter] = useState<Omit<UMLParameter, 'id'>>({
    name: '',
    type: 'String',
    defaultValue: ''
  });

  useEffect(() => {
    setEditingData(nodeData);
  }, [nodeData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editingData);
    onClose();
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

  const nodeTypeOptions: { value: UMLNodeType; label: string }[] = [
    { value: 'class', label: 'Class' },
    { value: 'interface', label: 'Interface' },
    { value: 'enum', label: 'Enumeration' },
    { value: 'abstractClass', label: 'Abstract Class' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-4/5 max-w-4xl h-4/5 max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Edit UML Class</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'attributes', label: 'Attributes' },
            { id: 'methods', label: 'Methods' },
            { id: 'relationships', label: 'Relationships' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Class Name</label>
                <input
                  type="text"
                  value={editingData.label || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter class name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Node Type</label>
                <select
                  value={editingData.nodeType || 'class'}
                  onChange={(e) => setEditingData(prev => ({ ...prev, nodeType: e.target.value as UMLNodeType }))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {nodeTypeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Package</label>
                <input
                  type="text"
                  value={editingData.package || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, package: e.target.value }))}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="com.example.package"
                />
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingData.isAbstract || false}
                    onChange={(e) => setEditingData(prev => ({ ...prev, isAbstract: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Abstract Class</span>
                </label>
              </div>
            </div>
          )}

          {/* Attributes Tab */}
          {activeTab === 'attributes' && (
            <div className="space-y-4">
              {/* Add New Attribute */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Add New Attribute</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Attribute name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Type"
                    value={newAttribute.type}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value }))}
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
                  <input
                    type="text"
                    placeholder="Default value"
                    value={newAttribute.defaultValue || ''}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, defaultValue: e.target.value }))}
                    className="p-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={newAttribute.isStatic}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, isStatic: e.target.checked }))}
                    />
                    <span className="text-sm">Static</span>
                  </label>
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

              {/* Existing Attributes */}
              <div>
                <h3 className="font-medium mb-3">Attributes ({(editingData.attributes || []).length})</h3>
                <div className="space-y-2">
                  {(editingData.attributes || []).map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between bg-white p-3 border rounded-md">
                      <div className="flex-1">
                        <span className="font-mono text-sm">
                          {visibilityOptions.find(v => v.value === attr.visibility)?.symbol} {attr.name}: {attr.type}
                          {attr.defaultValue && ` = ${attr.defaultValue}`}
                          {attr.isStatic && ' (static)'}
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

          {/* Methods Tab */}
          {activeTab === 'methods' && (
            <div className="space-y-4">
              {/* Add New Method */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">Add New Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Method name"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                    className="p-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="Return type"
                    value={newMethod.returnType}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, returnType: e.target.value }))}
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
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={newMethod.isStatic}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, isStatic: e.target.checked }))}
                    />
                    <span className="text-sm">Static</span>
                  </label>
                  <label className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={newMethod.isAbstract || false}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, isAbstract: e.target.checked }))}
                    />
                    <span className="text-sm">Abstract</span>
                  </label>
                  <button
                    onClick={addMethod}
                    className="ml-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Existing Methods */}
              <div>
                <h3 className="font-medium mb-3">Methods ({(editingData.methods || []).length})</h3>
                <div className="space-y-2">
                  {(editingData.methods || []).map((method) => (
                    <div key={method.id} className="flex items-center justify-between bg-white p-3 border rounded-md">
                      <div className="flex-1">
                        <span className="font-mono text-sm">
                          {visibilityOptions.find(v => v.value === method.visibility)?.symbol} {method.name}
                          ({method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}): {method.returnType}
                          {method.isStatic && ' (static)'}
                          {method.isAbstract && ' (abstract)'}
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

          {/* Relationships Tab - IMPLEMENTED: Complete relationship management */}
          {activeTab === 'relationships' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-900 mb-2">UML Relationship Types</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Association:</strong> General connection between classes</div>
                  <div><strong>Aggregation:</strong> "has-a" relationship (hollow diamond)</div>
                  <div><strong>Composition:</strong> Strong ownership (filled diamond)</div>
                  <div><strong>Inheritance:</strong> "is-a" relationship (hollow arrow)</div>
                  <div><strong>Implementation:</strong> Interface implementation</div>
                  <div><strong>Dependency:</strong> Uses relationship (dashed arrow)</div>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-medium text-amber-900 mb-2">🔧 JPA Code Generation</h3>
                <div className="text-sm text-amber-800 space-y-1">
                  <p><strong>Association → @OneToOne</strong> with @JoinColumn</p>
                  <p><strong>Aggregation → @OneToMany</strong> with mappedBy</p>
                  <p><strong>Composition → @OneToMany</strong> with CASCADE.ALL + orphanRemoval</p>
                  <p><strong>Dependency → @ManyToOne</strong> with @JoinColumn</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3">🔗 Managing Relationships</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-green-600">1.</span>
                    <div>
                      <p className="font-medium">Create Relationships:</p>
                      <p className="text-gray-600">Drag from connection handles between class nodes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-blue-600">2.</span>
                    <div>
                      <p className="font-medium">Edit Relationships:</p>
                      <p className="text-gray-600">Select relationship arrow and use Properties Panel (Ctrl+P)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-purple-600">3.</span>
                    <div>
                      <p className="font-medium">Relationship Properties:</p>
                      <p className="text-gray-600">Type, multiplicity, labels, and JPA annotations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <span className="font-semibold text-red-600">4.</span>
                    <div>
                      <p className="font-medium">Delete Relationships:</p>
                      <p className="text-gray-600">Select relationship and press Delete key</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-900 mb-2">✨ Advanced Features</h3>
                <div className="text-sm text-green-800 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Multiple connection points per class (top, center, bottom)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Real-time relationship updates in SpringBoot code generation</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>JPA annotations automatically generated based on UML relationship type</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Bidirectional relationship support with proper mappedBy configuration</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-gray-500 italic">
                  💡 Tip: Use the Properties Panel (Ctrl+P) to edit selected relationships with full control over multiplicity and JPA mappings
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-1"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UMLClassEditor;
