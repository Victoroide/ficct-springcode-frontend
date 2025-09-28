/**
 * UMLNodePanel.tsx
 * Panel for editing UML node properties (class, interface, etc.)
 */

import React, { useState } from 'react';
import { UMLVisibility, UMLNodeType, generateId } from '../types';
import type { UMLNodeData, UMLAttribute, UMLMethod, UMLMethodParameter } from '../types';

interface UMLNodePanelProps {
  node: {
    id: string;
    data: UMLNodeData;
  };
  onNodeDataUpdate: (nodeId: string, data: Partial<UMLNodeData>) => void;
}

const UMLNodePanel: React.FC<UMLNodePanelProps> = ({ node, onNodeDataUpdate }) => {
  // State for adding new attributes and methods
  const [newAttribute, setNewAttribute] = useState<Partial<UMLAttribute>>({
    name: '',
    type: 'String',
    visibility: UMLVisibility.PRIVATE,
    isStatic: false,
    isFinal: false
  });
  
  const [newMethod, setNewMethod] = useState<Partial<UMLMethod>>({
    name: '',
    returnType: 'void',
    visibility: UMLVisibility.PUBLIC,
    isStatic: false,
    isAbstract: false,
    parameters: []
  });
  
  const [newParameter, setNewParameter] = useState({
    name: '',
    type: 'String'
  });

  // Update node label (name)
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNodeDataUpdate(node.id, { label: e.target.value });
  };

  // Handle abstract checkbox
  const handleAbstractChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNodeDataUpdate(node.id, { isAbstract: e.target.checked });
  };

  // Add a new attribute
  const handleAddAttribute = () => {
    if (newAttribute.name && newAttribute.type) {
      const attribute: UMLAttribute = {
        id: generateId(),
        name: newAttribute.name || '',
        type: newAttribute.type || 'String',
        visibility: newAttribute.visibility || UMLVisibility.PRIVATE,
        isStatic: !!newAttribute.isStatic,
        isFinal: !!newAttribute.isFinal,
        defaultValue: newAttribute.defaultValue
      };
      
      onNodeDataUpdate(node.id, {
        attributes: [...(node.data.attributes || []), attribute]
      });
      
      // Reset form
      setNewAttribute({
        name: '',
        type: 'String',
        visibility: UMLVisibility.PRIVATE,
        isStatic: false,
        isFinal: false
      });
    }
  };

  // Remove an attribute
  const handleRemoveAttribute = (attributeId: string) => {
    onNodeDataUpdate(node.id, {
      attributes: (node.data.attributes || []).filter(attr => attr.id !== attributeId)
    });
  };

  // Add a parameter to the new method
  const handleAddParameter = () => {
    if (newParameter.name && newParameter.type) {
      const parameter: UMLMethodParameter = {
        id: generateId(),
        name: newParameter.name,
        type: newParameter.type
      };
      
      setNewMethod({
        ...newMethod,
        parameters: [...(newMethod.parameters || []), parameter]
      });
      
      // Reset form
      setNewParameter({
        name: '',
        type: 'String'
      });
    }
  };

  // Remove a parameter from the new method
  const handleRemoveParameter = (parameterId: string) => {
    setNewMethod({
      ...newMethod,
      parameters: (newMethod.parameters || []).filter(param => param.id !== parameterId)
    });
  };

  // Add a new method
  const handleAddMethod = () => {
    if (newMethod.name) {
      const method: UMLMethod = {
        id: generateId(),
        name: newMethod.name || '',
        returnType: newMethod.returnType || 'void',
        visibility: newMethod.visibility || UMLVisibility.PUBLIC,
        isStatic: !!newMethod.isStatic,
        isAbstract: !!newMethod.isAbstract,
        parameters: newMethod.parameters || []
      };
      
      onNodeDataUpdate(node.id, {
        methods: [...(node.data.methods || []), method]
      });
      
      // Reset form
      setNewMethod({
        name: '',
        returnType: 'void',
        visibility: UMLVisibility.PUBLIC,
        isStatic: false,
        isAbstract: false,
        parameters: []
      });
    }
  };

  // Remove a method
  const handleRemoveMethod = (methodId: string) => {
    onNodeDataUpdate(node.id, {
      methods: (node.data.methods || []).filter(method => method.id !== methodId)
    });
  };

  return (
    <div className="uml-node-panel p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      <h3 className="text-lg font-medium mb-4">Class Properties</h3>

      {/* Class/Node name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={node.data.label || ''}
          onChange={handleLabelChange}
        />
      </div>

      {/* Abstract checkbox */}
      {node.data.nodeType === UMLNodeType.CLASS && (
        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            id="isAbstract"
            className="mr-2"
            checked={!!node.data.isAbstract}
            onChange={handleAbstractChange}
          />
          <label htmlFor="isAbstract" className="text-sm font-medium">
            Is Abstract
          </label>
        </div>
      )}

      {/* Attributes section */}
      <div className="mb-6 border-t pt-3">
        <h4 className="font-medium mb-2">Attributes</h4>
        
        {/* Existing attributes */}
        <div className="mb-3 space-y-2">
          {(node.data.attributes || []).map(attr => (
            <div key={attr.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="text-sm">
                <span className="font-mono">{attr.visibility === UMLVisibility.PRIVATE ? '-' : 
                  attr.visibility === UMLVisibility.PUBLIC ? '+' : 
                  attr.visibility === UMLVisibility.PROTECTED ? '#' : '~'}</span>
                {' '}{attr.name}: {attr.type}
                {attr.isStatic && <span className="ml-1 text-blue-600">static</span>}
                {attr.isFinal && <span className="ml-1 text-purple-600">final</span>}
              </div>
              <button 
                onClick={() => handleRemoveAttribute(attr.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add new attribute */}
        <div className="bg-gray-50 p-3 rounded">
          <h5 className="text-sm font-medium mb-2">Add Attribute</h5>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              className="p-1 border rounded text-sm"
              placeholder="Name"
              value={newAttribute.name || ''}
              onChange={(e) => setNewAttribute({...newAttribute, name: e.target.value})}
            />
            
            <input
              type="text"
              className="p-1 border rounded text-sm"
              placeholder="Type"
              value={newAttribute.type || ''}
              onChange={(e) => setNewAttribute({...newAttribute, type: e.target.value})}
            />
          </div>
          
          <div className="flex items-center mb-2">
            <select
              className="p-1 border rounded text-sm mr-2"
              value={newAttribute.visibility || UMLVisibility.PRIVATE}
              onChange={(e) => setNewAttribute({...newAttribute, visibility: e.target.value as UMLVisibility})}
            >
              <option value={UMLVisibility.PRIVATE}>Private (-)</option>
              <option value={UMLVisibility.PUBLIC}>Public (+)</option>
              <option value={UMLVisibility.PROTECTED}>Protected (#)</option>
              <option value={UMLVisibility.PACKAGE}>Package (~)</option>
            </select>
            
            <input
              type="text"
              className="p-1 border rounded text-sm flex-grow"
              placeholder="Default value (optional)"
              value={newAttribute.defaultValue || ''}
              onChange={(e) => setNewAttribute({...newAttribute, defaultValue: e.target.value})}
            />
          </div>
          
          <div className="flex items-center mb-2">
            <label className="flex items-center mr-4 text-sm">
              <input
                type="checkbox"
                className="mr-1"
                checked={!!newAttribute.isStatic}
                onChange={(e) => setNewAttribute({...newAttribute, isStatic: e.target.checked})}
              />
              Static
            </label>
            
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                className="mr-1"
                checked={!!newAttribute.isFinal}
                onChange={(e) => setNewAttribute({...newAttribute, isFinal: e.target.checked})}
              />
              Final
            </label>
          </div>
          
          <button
            onClick={handleAddAttribute}
            className="w-full bg-blue-500 text-white p-1 rounded text-sm hover:bg-blue-600"
            disabled={!newAttribute.name || !newAttribute.type}
          >
            Add Attribute
          </button>
        </div>
      </div>

      {/* Methods section */}
      <div className="mb-6 border-t pt-3">
        <h4 className="font-medium mb-2">Methods</h4>
        
        {/* Existing methods */}
        <div className="mb-3 space-y-2">
          {(node.data.methods || []).map(method => (
            <div key={method.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="text-sm">
                <span className="font-mono">{method.visibility === UMLVisibility.PRIVATE ? '-' : 
                  method.visibility === UMLVisibility.PUBLIC ? '+' : 
                  method.visibility === UMLVisibility.PROTECTED ? '#' : '~'}</span>
                {' '}{method.name}(
                {method.parameters.map((p, i) => 
                  `${p.name}: ${p.type}${i < method.parameters.length - 1 ? ', ' : ''}`
                )}
                ): {method.returnType}
                {method.isStatic && <span className="ml-1 text-blue-600">static</span>}
                {method.isAbstract && <span className="ml-1 text-purple-600">abstract</span>}
              </div>
              <button 
                onClick={() => handleRemoveMethod(method.id)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Add new method */}
        <div className="bg-gray-50 p-3 rounded">
          <h5 className="text-sm font-medium mb-2">Add Method</h5>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              className="p-1 border rounded text-sm"
              placeholder="Name"
              value={newMethod.name || ''}
              onChange={(e) => setNewMethod({...newMethod, name: e.target.value})}
            />
            
            <input
              type="text"
              className="p-1 border rounded text-sm"
              placeholder="Return Type"
              value={newMethod.returnType || ''}
              onChange={(e) => setNewMethod({...newMethod, returnType: e.target.value})}
            />
          </div>
          
          <div className="flex items-center mb-2">
            <select
              className="p-1 border rounded text-sm"
              value={newMethod.visibility || UMLVisibility.PUBLIC}
              onChange={(e) => setNewMethod({...newMethod, visibility: e.target.value as UMLVisibility})}
            >
              <option value={UMLVisibility.PUBLIC}>Public (+)</option>
              <option value={UMLVisibility.PRIVATE}>Private (-)</option>
              <option value={UMLVisibility.PROTECTED}>Protected (#)</option>
              <option value={UMLVisibility.PACKAGE}>Package (~)</option>
            </select>
          </div>
          
          <div className="flex items-center mb-2">
            <label className="flex items-center mr-4 text-sm">
              <input
                type="checkbox"
                className="mr-1"
                checked={!!newMethod.isStatic}
                onChange={(e) => setNewMethod({...newMethod, isStatic: e.target.checked})}
              />
              Static
            </label>
            
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                className="mr-1"
                checked={!!newMethod.isAbstract}
                onChange={(e) => setNewMethod({...newMethod, isAbstract: e.target.checked})}
              />
              Abstract
            </label>
          </div>
          
          {/* Parameters section */}
          <div className="mb-2">
            <h6 className="text-xs font-medium mb-1">Parameters</h6>
            
            {/* Existing parameters */}
            <div className="mb-2 space-y-1">
              {(newMethod.parameters || []).map(param => (
                <div key={param.id} className="flex items-center justify-between bg-gray-100 p-1 rounded text-xs">
                  <div>{param.name}: {param.type}</div>
                  <button 
                    onClick={() => handleRemoveParameter(param.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
            
            {/* Add parameter */}
            <div className="flex mb-2">
              <input
                type="text"
                className="p-1 border rounded text-sm mr-1 w-2/5"
                placeholder="Param name"
                value={newParameter.name}
                onChange={(e) => setNewParameter({...newParameter, name: e.target.value})}
              />
              
              <input
                type="text"
                className="p-1 border rounded text-sm mr-1 w-2/5"
                placeholder="Type"
                value={newParameter.type}
                onChange={(e) => setNewParameter({...newParameter, type: e.target.value})}
              />
              
              <button
                onClick={handleAddParameter}
                className="bg-gray-300 p-1 rounded text-xs flex-grow hover:bg-gray-400"
                disabled={!newParameter.name || !newParameter.type}
              >
                Add
              </button>
            </div>
          </div>
          
          <button
            onClick={handleAddMethod}
            className="w-full bg-blue-500 text-white p-1 rounded text-sm hover:bg-blue-600"
            disabled={!newMethod.name}
          >
            Add Method
          </button>
        </div>
      </div>
    </div>
  );
};

export default UMLNodePanel;
