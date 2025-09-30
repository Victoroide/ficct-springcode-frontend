/**
 * UMLClassEditor.tsx - MODERNIZED VERSION
 * Comprehensive UML Class Editor Modal with modern UI/UX
 */

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
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

  // Helper function to prevent keyboard event propagation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

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
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit UML Class</h2>
            <p className="text-sm text-gray-500 mt-1">Configure class properties, attributes, and methods</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:rotate-90"
            aria-label="Close editor"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4 border-b">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'attributes', label: 'Attributes' },
            { id: 'methods', label: 'Methods' },
            { id: 'relationships', label: 'Relationships' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 font-medium rounded-t-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 -mb-px'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  Define the basic properties of your UML class including name, type, package, and abstraction level.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Class Name</label>
                  <input
                    type="text"
                    value={editingData.label || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, label: e.target.value }))}
                    onKeyDown={handleInputKeyDown}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter class name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Node Type</label>
                  <select
                    value={editingData.nodeType || 'class'}
                    onChange={(e) => setEditingData(prev => ({ ...prev, nodeType: e.target.value as UMLNodeType }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {nodeTypeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Package</label>
                  <input
                    type="text"
                    value={editingData.package || ''}
                    onChange={(e) => setEditingData(prev => ({ ...prev, package: e.target.value }))}
                    onKeyDown={handleInputKeyDown}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="com.example.package"
                  />
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={editingData.isAbstract || false}
                      onChange={(e) => setEditingData(prev => ({ ...prev, isAbstract: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Abstract Class</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Attributes Tab */}
          {activeTab === 'attributes' && (
            <div className="space-y-6">
              {/* Add New Attribute */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Attribute</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Attribute name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={handleInputKeyDown}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Type"
                    value={newAttribute.type}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value }))}
                    onKeyDown={handleInputKeyDown}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <select
                    value={newAttribute.visibility}
                    onChange={(e) => setNewAttribute(prev => ({ ...prev, visibility: e.target.value as UMLVisibility }))}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    onKeyDown={handleInputKeyDown}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center space-x-6 mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAttribute.isStatic}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, isStatic: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Static</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAttribute.isFinal || false}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, isFinal: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Final</span>
                  </label>
                  <button
                    onClick={addAttribute}
                    className="ml-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Attribute</span>
                  </button>
                </div>
              </div>

              {/* Existing Attributes */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attributes ({(editingData.attributes || []).length})</h3>
                <div className="space-y-2">
                  {(editingData.attributes || []).map((attr) => (
                    <div key={attr.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group">
                      <div className="flex-1">
                        <span className="font-mono text-sm text-gray-800">
                          {visibilityOptions.find(v => v.value === attr.visibility)?.symbol} {attr.name}: {attr.type}
                          {attr.defaultValue && ` = ${attr.defaultValue}`}
                          {attr.isStatic && ' (static)'}
                          {attr.isFinal && ' (final)'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeAttribute(attr.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Remove attribute"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(editingData.attributes || []).length === 0 && (
                    <div className="text-gray-400 text-center py-12 text-sm">
                      No attributes defined yet. Add your first attribute above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Methods Tab */}
          {activeTab === 'methods' && (
            <div className="space-y-6">
              {/* Add New Method */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Method name"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={handleInputKeyDown}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Return type"
                    value={newMethod.returnType}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, returnType: e.target.value }))}
                    onKeyDown={handleInputKeyDown}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <select
                    value={newMethod.visibility}
                    onChange={(e) => setNewMethod(prev => ({ ...prev, visibility: e.target.value as UMLVisibility }))}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all col-span-2"
                  >
                    {visibilityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.symbol} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-6 mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMethod.isStatic}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, isStatic: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Static</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMethod.isAbstract || false}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, isAbstract: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Abstract</span>
                  </label>
                  <button
                    onClick={addMethod}
                    className="ml-auto bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="font-medium">Add Method</span>
                  </button>
                </div>
              </div>

              {/* Existing Methods */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Methods ({(editingData.methods || []).length})</h3>
                <div className="space-y-2">
                  {(editingData.methods || []).map((method) => (
                    <div key={method.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-all group">
                      <div className="flex-1">
                        <span className="font-mono text-sm text-gray-800">
                          {visibilityOptions.find(v => v.value === method.visibility)?.symbol} {method.name}
                          ({method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}): {method.returnType}
                          {method.isStatic && ' (static)'}
                          {method.isAbstract && ' (abstract)'}
                        </span>
                      </div>
                      <button
                        onClick={() => removeMethod(method.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Remove method"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {(editingData.methods || []).length === 0 && (
                    <div className="text-gray-400 text-center py-12 text-sm">
                      No methods defined yet. Add your first method above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Relationships Tab */}
          {activeTab === 'relationships' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">UML Relationship Types</h3>
                <div className="grid grid-cols-2 gap-3 text-sm text-blue-800">
                  <div><strong>Association:</strong> General connection between classes</div>
                  <div><strong>Aggregation:</strong> "has-a" relationship (hollow diamond)</div>
                  <div><strong>Composition:</strong> Strong ownership (filled diamond)</div>
                  <div><strong>Inheritance:</strong> "is-a" relationship (hollow arrow)</div>
                  <div><strong>Implementation:</strong> Interface implementation</div>
                  <div><strong>Dependency:</strong> Uses relationship (dashed arrow)</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">JPA Code Generation</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>Association → @OneToOne</strong> with @JoinColumn</p>
                  <p><strong>Aggregation → @OneToMany</strong> with mappedBy</p>
                  <p><strong>Composition → @OneToMany</strong> with CASCADE.ALL + orphanRemoval</p>
                  <p><strong>Dependency → @ManyToOne</strong> with @JoinColumn</p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Managing Relationships</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 text-green-700 rounded-full font-semibold text-xs">1</span>
                    <div>
                      <p className="font-semibold text-gray-900">Create Relationships:</p>
                      <p className="text-gray-600 mt-1">Drag from connection handles between class nodes</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full font-semibold text-xs">2</span>
                    <div>
                      <p className="font-semibold text-gray-900">Edit Relationships:</p>
                      <p className="text-gray-600 mt-1">Select relationship arrow and use Properties Panel (Ctrl+P)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-purple-100 text-purple-700 rounded-full font-semibold text-xs">3</span>
                    <div>
                      <p className="font-semibold text-gray-900">Relationship Properties:</p>
                      <p className="text-gray-600 mt-1">Type, multiplicity, labels, and JPA annotations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-red-100 text-red-700 rounded-full font-semibold text-xs">4</span>
                    <div>
                      <p className="font-semibold text-gray-900">Delete Relationships:</p>
                      <p className="text-gray-600 mt-1">Select relationship and press Delete key</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Advanced Features</h3>
                <div className="text-sm text-blue-800 space-y-2">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    <span>Multiple connection points per class (top, center, bottom)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    <span>Real-time relationship updates in SpringBoot code generation</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    <span>JPA annotations automatically generated based on UML relationship type</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                    <span>Bidirectional relationship support with proper mappedBy configuration</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-sm text-gray-500 italic">
                  Tip: Use the Properties Panel (Ctrl+P) to edit selected relationships with full control over multiplicity and JPA mappings
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 flex items-center space-x-2 transition-all shadow-md hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span className="font-medium">Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UMLClassEditor;
