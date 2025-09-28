/**
 * UMLNodeEditor.tsx
 * Component for editing properties of a UML node
 */

import React, { useState, useCallback } from 'react';
import type { Node } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { UMLAttribute, UMLMethod, UMLParameter } from '@/components/uml-editor/types';

interface UMLNodeEditorProps {
  node: Node;
  onNodeDataUpdate: (nodeId: string, data: any) => void;
}

const UMLNodeEditor: React.FC<UMLNodeEditorProps> = ({ node, onNodeDataUpdate }) => {
  // General state
  const [nodeName, setNodeName] = useState(node.data.name || node.data.label || '');

  // Attribute state
  const [attributes, setAttributes] = useState<UMLAttribute[]>(node.data.attributes || []);
  const [newAttribute, setNewAttribute] = useState<Partial<UMLAttribute>>({
    name: '',
    type: 'String',
    visibility: 'private'
  });

  // Method state
  const [methods, setMethods] = useState<UMLMethod[]>(node.data.methods || []);
  const [newMethod, setNewMethod] = useState<Partial<UMLMethod>>({
    name: '',
    returnType: 'void',
    visibility: 'public',
    parameters: []
  });
  const [newParameter, setNewParameter] = useState<Partial<UMLParameter>>({
    name: '',
    type: 'String'
  });

  // Save node name
  const handleSaveName = useCallback(() => {
    if (!nodeName.trim()) return;
    
    onNodeDataUpdate(node.id, {
      ...node.data,
      name: nodeName,
      label: nodeName
    });
  }, [node, nodeName, onNodeDataUpdate]);

  // Add new attribute
  const handleAddAttribute = useCallback(() => {
    if (!newAttribute.name?.trim()) return;

    const attribute: UMLAttribute = {
      id: `attr_${Date.now()}`,
      name: newAttribute.name,
      type: newAttribute.type || 'String',
      visibility: newAttribute.visibility as 'public' | 'private' | 'protected' || 'private',
      isStatic: newAttribute.isStatic || false,
      isFinal: newAttribute.isFinal || false,
      defaultValue: newAttribute.defaultValue || ''
    };

    const updatedAttributes = [...attributes, attribute];
    setAttributes(updatedAttributes);
    onNodeDataUpdate(node.id, {
      ...node.data,
      attributes: updatedAttributes
    });

    // Reset form
    setNewAttribute({
      name: '',
      type: 'String',
      visibility: 'private'
    });
  }, [attributes, newAttribute, node, onNodeDataUpdate]);

  // Delete attribute
  const handleDeleteAttribute = useCallback((attributeId: string) => {
    const updatedAttributes = attributes.filter(attr => attr.id !== attributeId);
    setAttributes(updatedAttributes);
    onNodeDataUpdate(node.id, {
      ...node.data,
      attributes: updatedAttributes
    });
  }, [attributes, node, onNodeDataUpdate]);

  // Add parameter to new method
  const handleAddParameter = useCallback(() => {
    if (!newParameter.name?.trim()) return;

    const parameter: UMLParameter = {
      id: `param_${Date.now()}`,
      name: newParameter.name,
      type: newParameter.type || 'String'
    };

    setNewMethod(prev => ({
      ...prev,
      parameters: [...(prev.parameters || []), parameter]
    }));

    // Reset parameter form
    setNewParameter({
      name: '',
      type: 'String'
    });
  }, [newParameter]);

  // Remove parameter from new method
  const handleRemoveParameter = useCallback((paramId: string) => {
    setNewMethod(prev => ({
      ...prev,
      parameters: (prev.parameters || []).filter(p => p.id !== paramId)
    }));
  }, []);

  // Add new method
  const handleAddMethod = useCallback(() => {
    if (!newMethod.name?.trim()) return;

    const method: UMLMethod = {
      id: `method_${Date.now()}`,
      name: newMethod.name,
      returnType: newMethod.returnType || 'void',
      visibility: newMethod.visibility as 'public' | 'private' | 'protected' || 'public',
      parameters: newMethod.parameters || [],
      isStatic: newMethod.isStatic || false,
      isAbstract: newMethod.isAbstract || false
    };

    const updatedMethods = [...methods, method];
    setMethods(updatedMethods);
    onNodeDataUpdate(node.id, {
      ...node.data,
      methods: updatedMethods
    });

    // Reset form
    setNewMethod({
      name: '',
      returnType: 'void',
      visibility: 'public',
      parameters: []
    });
  }, [methods, newMethod, node, onNodeDataUpdate]);

  // Delete method
  const handleDeleteMethod = useCallback((methodId: string) => {
    const updatedMethods = methods.filter(method => method.id !== methodId);
    setMethods(updatedMethods);
    onNodeDataUpdate(node.id, {
      ...node.data,
      methods: updatedMethods
    });
  }, [methods, node, onNodeDataUpdate]);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">{node.type === 'classNode' ? 'Class' : node.type === 'interfaceNode' ? 'Interface' : node.type === 'abstractNode' ? 'Abstract Class' : node.type === 'enumNode' ? 'Enumeration' : 'Record'}</h3>
      
      {/* General properties */}
      <div className="mb-4 pb-4 border-b border-slate-200">
        <div className="space-y-2">
          <Label htmlFor="node-name">Name</Label>
          <div className="flex space-x-2">
            <Input
              id="node-name"
              value={nodeName}
              onChange={(e) => setNodeName(e.target.value)}
              placeholder="Class name"
              className="flex-1"
            />
            <Button onClick={handleSaveName}>Save</Button>
          </div>
        </div>
      </div>
      
      {/* Tabs for attributes and methods */}
      <Tabs defaultValue="attributes" className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attributes">
            {node.type === 'enumNode' ? 'Constants' : node.type === 'recordNode' ? 'Components' : 'Attributes'}
          </TabsTrigger>
          <TabsTrigger value="methods">Methods</TabsTrigger>
        </TabsList>
        
        {/* Attributes tab */}
        <TabsContent value="attributes" className="pt-4">
          <div className="space-y-4">
            {/* Existing attributes */}
            {attributes.length > 0 ? (
              <div className="space-y-2">
                {attributes.map((attribute) => (
                  <div 
                    key={attribute.id} 
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-md hover:bg-slate-100"
                  >
                    <div className="flex-1">
                      <span className={`mr-1 ${attribute.visibility === 'private' ? 'text-red-600' : attribute.visibility === 'protected' ? 'text-amber-600' : 'text-green-600'}`}>
                        {attribute.visibility === 'private' ? '-' : attribute.visibility === 'protected' ? '#' : '+'}
                      </span>
                      <span className="font-medium">{attribute.name}</span>
                      <span className="mx-1">:</span>
                      <span className="text-slate-600">{attribute.type}</span>
                      {attribute.defaultValue && (
                        <span className="ml-2 text-slate-500">= {attribute.defaultValue}</span>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() => handleDeleteAttribute(attribute.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 italic bg-slate-50 rounded-md">
                No {node.type === 'enumNode' ? 'constants' : node.type === 'recordNode' ? 'components' : 'attributes'} added yet
              </div>
            )}
            
            {/* Add new attribute */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium mb-2">
                Add {node.type === 'enumNode' ? 'Constant' : node.type === 'recordNode' ? 'Component' : 'Attribute'}
              </h4>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <Label htmlFor="attr-name" className="text-xs">Name</Label>
                  <Input
                    id="attr-name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                    placeholder="attributeName"
                    size="sm"
                  />
                </div>
                <div>
                  <Label htmlFor="attr-type" className="text-xs">Type</Label>
                  <Input
                    id="attr-type"
                    value={newAttribute.type}
                    onChange={(e) => setNewAttribute({ ...newAttribute, type: e.target.value })}
                    placeholder="String"
                    size="sm"
                  />
                </div>
              </div>
              
              {node.type !== 'enumNode' && node.type !== 'recordNode' && (
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <Label htmlFor="attr-visibility" className="text-xs">Visibility</Label>
                    <select
                      id="attr-visibility"
                      value={newAttribute.visibility}
                      onChange={(e) => setNewAttribute({ 
                        ...newAttribute, 
                        visibility: e.target.value as 'public' | 'private' | 'protected' 
                      })}
                      className="w-full h-9 rounded-md border border-slate-300 p-2 text-sm"
                    >
                      <option value="private">private (-)</option>
                      <option value="protected">protected (#)</option>
                      <option value="public">public (+)</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="attr-default" className="text-xs">Default Value</Label>
                    <Input
                      id="attr-default"
                      value={newAttribute.defaultValue || ''}
                      onChange={(e) => setNewAttribute({ ...newAttribute, defaultValue: e.target.value })}
                      placeholder="Optional"
                      size="sm"
                    />
                  </div>
                </div>
              )}
              
              {node.type !== 'enumNode' && node.type !== 'recordNode' && (
                <div className="flex items-center space-x-4 mb-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="attr-static"
                      checked={!!newAttribute.isStatic}
                      onChange={(e) => setNewAttribute({ ...newAttribute, isStatic: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <Label htmlFor="attr-static" className="text-xs ml-1">Static</Label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="attr-final"
                      checked={!!newAttribute.isFinal}
                      onChange={(e) => setNewAttribute({ ...newAttribute, isFinal: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <Label htmlFor="attr-final" className="text-xs ml-1">Final</Label>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleAddAttribute} 
                size="sm" 
                className="w-full mt-2"
                disabled={!newAttribute.name?.trim()}
              >
                Add {node.type === 'enumNode' ? 'Constant' : node.type === 'recordNode' ? 'Component' : 'Attribute'}
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Methods tab */}
        <TabsContent value="methods" className="pt-4">
          <div className="space-y-4">
            {/* Existing methods */}
            {methods.length > 0 ? (
              <div className="space-y-2">
                {methods.map((method) => (
                  <div 
                    key={method.id} 
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-md hover:bg-slate-100"
                  >
                    <div className="flex-1">
                      <span className={`mr-1 ${method.visibility === 'private' ? 'text-red-600' : method.visibility === 'protected' ? 'text-amber-600' : 'text-green-600'}`}>
                        {method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : '+'}
                      </span>
                      <span className="font-medium">{method.name}</span>
                      <span className="text-slate-600">
                        ({method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')})
                      </span>
                      <span className="mx-1">:</span>
                      <span className="text-slate-600">{method.returnType}</span>
                      {method.isAbstract && <span className="ml-2 text-purple-600 italic">abstract</span>}
                      {method.isStatic && <span className="ml-2 text-blue-600">static</span>}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      onClick={() => handleDeleteMethod(method.id)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 italic bg-slate-50 rounded-md">
                No methods added yet
              </div>
            )}
            
            {/* Add new method */}
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-sm font-medium mb-2">Add Method</h4>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <Label htmlFor="method-name" className="text-xs">Name</Label>
                  <Input
                    id="method-name"
                    value={newMethod.name}
                    onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    placeholder="methodName"
                    size="sm"
                  />
                </div>
                <div>
                  <Label htmlFor="method-return" className="text-xs">Return Type</Label>
                  <Input
                    id="method-return"
                    value={newMethod.returnType}
                    onChange={(e) => setNewMethod({ ...newMethod, returnType: e.target.value })}
                    placeholder="void"
                    size="sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <Label htmlFor="method-visibility" className="text-xs">Visibility</Label>
                  <select
                    id="method-visibility"
                    value={newMethod.visibility}
                    onChange={(e) => setNewMethod({ 
                      ...newMethod, 
                      visibility: e.target.value as 'public' | 'private' | 'protected' 
                    })}
                    className="w-full h-9 rounded-md border border-slate-300 p-2 text-sm"
                  >
                    <option value="public">public (+)</option>
                    <option value="protected">protected (#)</option>
                    <option value="private">private (-)</option>
                  </select>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="method-static"
                      checked={!!newMethod.isStatic}
                      onChange={(e) => setNewMethod({ ...newMethod, isStatic: e.target.checked })}
                      className="rounded border-slate-300"
                    />
                    <Label htmlFor="method-static" className="text-xs ml-1">Static</Label>
                  </div>
                  {(node.type === 'abstractNode' || node.type === 'interfaceNode') && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="method-abstract"
                        checked={!!newMethod.isAbstract}
                        onChange={(e) => setNewMethod({ ...newMethod, isAbstract: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      <Label htmlFor="method-abstract" className="text-xs ml-1">Abstract</Label>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Parameters */}
              <div className="mt-3">
                <Label className="text-xs font-medium">Parameters</Label>
                {newMethod.parameters && newMethod.parameters.length > 0 ? (
                  <div className="space-y-1 my-2">
                    {newMethod.parameters.map((param) => (
                      <div 
                        key={param.id} 
                        className="flex items-center justify-between py-1 px-2 bg-slate-100 rounded"
                      >
                        <div>
                          <span className="font-medium">{param.name}</span>
                          <span className="mx-1">:</span>
                          <span className="text-slate-600">{param.type}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-6 w-6 p-0 text-red-600"
                          onClick={() => handleRemoveParameter(param.id)}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs italic text-slate-500 my-2 text-center bg-slate-50 py-2 rounded">
                    No parameters added yet
                  </div>
                )}
                
                {/* Add parameter form */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Input
                      value={newParameter.name}
                      onChange={(e) => setNewParameter({ ...newParameter, name: e.target.value })}
                      placeholder="Parameter name"
                      size="sm"
                    />
                  </div>
                  <div className="flex space-x-1">
                    <Input
                      value={newParameter.type}
                      onChange={(e) => setNewParameter({ ...newParameter, type: e.target.value })}
                      placeholder="Type"
                      size="sm"
                      className="flex-1"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddParameter}
                      disabled={!newParameter.name?.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleAddMethod} 
                className="w-full mt-4"
                disabled={!newMethod.name?.trim()}
              >
                Add Method
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UMLNodeEditor;
