/**
 * UMLNodePanel.simple.tsx
 * Simplified version of the UML Node Panel component
 */

import React, { useState } from 'react';
import { 
  generateId, 
  type UMLVisibility,
  type UMLNodeData, 
  type UMLAttribute, 
  type UMLMethod, 
  type UMLNodeType, 
  type UMLParameter 
} from '../types';

interface UMLNodePanelProps {
  node: {
    id: string;
    data: UMLNodeData;
  };
  onUpdateNode: (nodeId: string, data: Partial<UMLNodeData>) => void;
  onClose: () => void;
}

const UMLNodePanel: React.FC<UMLNodePanelProps> = ({ node, onUpdateNode, onClose }) => {
  // State for new attribute
  const [newAttribute, setNewAttribute] = useState<Omit<UMLAttribute, 'id'>>({
    name: '',
    type: 'String',
    visibility: 'private',
    isStatic: false,
    isFinal: false
  });

  // State for new method
  const [newMethod, setNewMethod] = useState<Omit<UMLMethod, 'id'>>({
    name: '',
    returnType: 'void',
    visibility: 'public',
    isStatic: false,
    isAbstract: false,
    parameters: []
  });

  // State for new parameter
  const [newParameter, setNewParameter] = useState<Omit<UMLParameter, 'id'>>({
    name: '',
    type: 'String'
  });

  // Handle node name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNode(node.id, { label: e.target.value });
  };

  // Toggle node type
  const toggleNodeType = (type: UMLNodeType) => {
    onUpdateNode(node.id, { nodeType: type });
  };

  // Toggle abstract status
  const toggleAbstract = () => {
    onUpdateNode(node.id, { isAbstract: !node.data.isAbstract });
  };

  // Add a new attribute
  const handleAddAttribute = () => {
    if (!newAttribute.name.trim()) return;
    
    onUpdateNode(node.id, {
      attributes: [
        ...(node.data.attributes || []),
        {
          id: generateId(),
          ...newAttribute
        }
      ]
    });
    
    // Reset form
    setNewAttribute({
      name: '',
      type: 'String',
      visibility: 'private',
      isStatic: false,
      isFinal: false
    });
  };

  // Remove an attribute
  const handleRemoveAttribute = (id: string) => {
    onUpdateNode(node.id, {
      attributes: (node.data.attributes || []).filter(attr => attr.id !== id)
    });
  };

  // Add a new method
  const handleAddMethod = () => {
    if (!newMethod.name.trim()) return;
    
    onUpdateNode(node.id, {
      methods: [
        ...(node.data.methods || []),
        {
          id: generateId(),
          ...newMethod,
          parameters: []
        }
      ]
    });
    
    // Reset form
    setNewMethod({
      name: '',
      returnType: 'void',
      visibility: 'public',
      isStatic: false,
      isAbstract: false,
      parameters: []
    });
  };

  // Remove a method
  const handleRemoveMethod = (id: string) => {
    onUpdateNode(node.id, {
      methods: (node.data.methods || []).filter(method => method.id !== id)
    });
  };

  // Available visibility options
  const visibilityOptions = [
    { value: 'public', label: 'Public (+)' },
    { value: 'private', label: 'Private (-)' },
    { value: 'protected', label: 'Protected (#)' },
    { value: 'package', label: 'Package (~)' },
  ];

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto p-4 z-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Edit {node.data.nodeType || 'Node'}</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {/* Node Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={node.data.label || ''}
          onChange={handleNameChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Enter node name"
        />
      </div>

      {/* Node Type */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {['class', 'interface', 'enum', 'abstractClass'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleNodeType(type as UMLNodeType)}
              className={`px-3 py-1.5 text-xs rounded-md ${
                node.data.nodeType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Abstract Toggle */}
      {(node.data.nodeType === 'class' || node.data.nodeType === 'abstractClass') && (
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="is-abstract"
            checked={node.data.isAbstract || false}
            onChange={toggleAbstract}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="is-abstract" className="ml-2 block text-sm text-gray-700">
            Abstract
          </label>
        </div>
      )}

      {/* Attributes Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Attributes</h3>
        <div className="space-y-2 mb-2">
          {(node.data.attributes || []).map((attr) => (
            <div key={attr.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm">
                {attr.visibility} {attr.name}: {attr.type}
                {attr.isStatic && ' (static)'}
                {attr.isFinal && ' (final)'}
              </span>
              <button
                onClick={() => handleRemoveAttribute(attr.id)}
                className="text-red-500 hover:text-red-700 text-sm"
                aria-label={`Remove attribute ${attr.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex space-x-2 mb-2">
          <select
            value={newAttribute.visibility}
            onChange={(e) => setNewAttribute({...newAttribute, visibility: e.target.value as UMLVisibility})}
            className="w-20 text-xs border rounded"
          >
            {visibilityOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={newAttribute.name}
            onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
            className="flex-1 text-sm border rounded px-2 py-1"
            placeholder="attributeName"
          />
          <span>:</span>
          <input
            type="text"
            value={newAttribute.type}
            onChange={(e) => setNewAttribute({...newAttribute, type: e.target.value})}
            className="w-20 text-sm border rounded px-2 py-1"
            placeholder="Type"
          />
          <button
            onClick={handleAddAttribute}
            disabled={!newAttribute.name || !newAttribute.type}
            className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
            aria-label="Add attribute"
          >
            +
          </button>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={newAttribute.isStatic}
              onChange={(e) => setNewAttribute({...newAttribute, isStatic: e.target.checked})}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-1">Static</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={newAttribute.isFinal}
              onChange={(e) => setNewAttribute({...newAttribute, isFinal: e.target.checked})}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-1">Final</span>
          </label>
        </div>
      </div>

      {/* Methods Section */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Methods</h3>
        <div className="space-y-2 mb-2">
          {(node.data.methods || []).map((method) => (
            <div key={method.id} className="bg-gray-50 p-2 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm">
                  {method.visibility} {method.name}({method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}): {method.returnType}
                  {method.isStatic && ' (static)'}
                  {method.isAbstract && ' (abstract)'}
                </span>
                <button
                  onClick={() => handleRemoveMethod(method.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  aria-label={`Remove method ${method.name}`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-2">
          <div className="flex space-x-2">
            <select
              value={newMethod.visibility}
              onChange={(e) => setNewMethod({...newMethod, visibility: e.target.value as UMLVisibility})}
              className="w-20 text-xs border rounded"
            >
              {visibilityOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newMethod.name}
              onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
              className="flex-1 text-sm border rounded px-2 py-1"
              placeholder="methodName"
            />
            <span>:</span>
            <input
              type="text"
              value={newMethod.returnType}
              onChange={(e) => setNewMethod({...newMethod, returnType: e.target.value})}
              className="w-16 text-sm border rounded px-2 py-1"
              placeholder="void"
            />
            <button
              onClick={handleAddMethod}
              disabled={!newMethod.name}
              className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300"
              aria-label="Add method"
            >
              +
            </button>
          </div>

          {/* Method Options */}
          <div className="flex items-center space-x-4 text-xs pl-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={newMethod.isStatic}
                onChange={(e) => setNewMethod({...newMethod, isStatic: e.target.checked})}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-1">Static</span>
            </label>
            {(node.data.nodeType === 'abstractClass' || node.data.nodeType === 'interface') && (
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={newMethod.isAbstract}
                  onChange={(e) => setNewMethod({...newMethod, isAbstract: e.target.checked})}
                  className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-1">Abstract</span>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UMLNodePanel;
