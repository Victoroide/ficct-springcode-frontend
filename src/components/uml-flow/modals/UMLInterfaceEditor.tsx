import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save } from 'lucide-react';
import type { UMLNodeData, UMLMethod, UMLParameter, UMLVisibility } from '../types';
import { generateId } from '../types';

interface UMLInterfaceEditorProps {
  isOpen: boolean;
  nodeData: UMLNodeData;
  onClose: () => void;
  onSave: (updatedData: UMLNodeData) => void;
}

type TabType = 'basic' | 'methods';

const UMLInterfaceEditor: React.FC<UMLInterfaceEditorProps> = ({ isOpen, nodeData, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [editingData, setEditingData] = useState<UMLNodeData>(nodeData);
  
  const [newMethod, setNewMethod] = useState<Omit<UMLMethod, 'id'>>({
    name: '',
    returnType: 'void',
    visibility: 'public',
    isStatic: false,
    isAbstract: true,
    parameters: []
  });

  const [newParameter, setNewParameter] = useState<Omit<UMLParameter, 'id'>>({
    name: '',
    type: 'String',
    defaultValue: ''
  });

  const [editingMethodId, setEditingMethodId] = useState<string | null>(null);

  useEffect(() => {
    setEditingData(nodeData);
  }, [nodeData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(editingData);
    onClose();
  };

  const addMethod = () => {
    if (!newMethod.name.trim()) return;
    
    const method: UMLMethod = {
      id: generateId(),
      ...newMethod,
      isAbstract: true
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
      isAbstract: true,
      parameters: []
    });
  };

  const removeMethod = (id: string) => {
    setEditingData(prev => ({
      ...prev,
      methods: (prev.methods || []).filter(method => method.id !== id)
    }));
  };

  const addParameterToMethod = (methodId: string) => {
    if (!newParameter.name.trim()) return;

    const parameter: UMLParameter = {
      id: generateId(),
      ...newParameter
    };

    setEditingData(prev => ({
      ...prev,
      methods: (prev.methods || []).map(method => 
        method.id === methodId 
          ? { ...method, parameters: [...method.parameters, parameter] }
          : method
      )
    }));

    setNewParameter({
      name: '',
      type: 'String',
      defaultValue: ''
    });
  };

  const removeParameterFromMethod = (methodId: string, parameterId: string) => {
    setEditingData(prev => ({
      ...prev,
      methods: (prev.methods || []).map(method =>
        method.id === methodId
          ? { ...method, parameters: method.parameters.filter(p => p.id !== parameterId) }
          : method
      )
    }));
  };

  const visibilityOptions: { value: UMLVisibility; label: string; symbol: string }[] = [
    { value: 'public', label: 'Public', symbol: '+' }
  ];

  // Helper function to protect all keyboard events in inputs
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    // Stop ALL keyboard events from reaching React Flow
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
            <h2 className="text-2xl font-bold text-gray-900">Interface Editor</h2>
            <p className="text-sm text-gray-500 mt-0.5">Define method signatures for your interface</p>
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
            { id: 'basic', label: 'Basic Info' },
            { id: 'methods', label: 'Methods' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interface Name</label>
                <input
                  type="text"
                  value={editingData.label || ''}
                  onChange={(e) => setEditingData(prev => ({ ...prev, label: e.target.value }))}
                  onKeyDown={handleInputKeyDown}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., IPaymentProcessor"
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
                  placeholder="com.example.services"
                />
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-5 rounded-2xl border border-blue-100">
                <h3 className="font-semibold text-blue-900 mb-3">Interface Characteristics</h3>
                <ul className="text-sm text-blue-700 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>All methods are public and abstract by default</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Interfaces cannot have attributes in pure UML 2.5</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Define method signatures without implementations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <span>Can extend other interfaces via Inheritance relationship</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'methods' && (
            <div className="space-y-6">
              {/* Add Method Form */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-2xl border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-blue-600" />
                  Add Method Signature
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Method Name</label>
                    <input
                      type="text"
                      placeholder="e.g., processPayment"
                      value={newMethod.name}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, name: e.target.value }))}
                      onKeyDown={handleInputKeyDown}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Return Type</label>
                    <input
                      type="text"
                      placeholder="e.g., boolean"
                      value={newMethod.returnType}
                      onChange={(e) => setNewMethod(prev => ({ ...prev, returnType: e.target.value }))}
                      onKeyDown={handleInputKeyDown}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <button
                  onClick={addMethod}
                  className="mt-4 w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-600/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Method
                </button>
              </div>

              {/* Methods List */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Method Signatures</h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {(editingData.methods || []).length} methods
                  </span>
                </div>
                <div className="space-y-3">
                  {(editingData.methods || []).map((method) => (
                    <div key={method.id} className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 font-mono text-sm">
                          <span className="text-emerald-600 font-semibold">+</span>{' '}
                          <span className="font-semibold text-gray-900">{method.name}</span>
                          <span className="text-gray-500">(</span>
                          <span className="text-blue-600">{method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')}</span>
                          <span className="text-gray-500">)</span>
                          <span className="text-gray-500">: </span>
                          <span className="text-purple-600">{method.returnType}</span>
                        </div>
                        <button
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Remove method"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Parameters Section */}
                      <div className="border-t border-gray-100 pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Parameters</h4>
                          <button
                            onClick={() => setEditingMethodId(editingMethodId === method.id ? null : method.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            {editingMethodId === method.id ? '✓ Done' : '+ Edit'}
                          </button>
                        </div>

                        {editingMethodId === method.id && (
                          <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                placeholder="Parameter name"
                                value={newParameter.name}
                                onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                                onKeyDown={handleInputKeyDown}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="Type"
                                value={newParameter.type}
                                onChange={(e) => setNewParameter(prev => ({ ...prev, type: e.target.value }))}
                                onKeyDown={handleInputKeyDown}
                                className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={() => addParameterToMethod(method.id)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors font-medium"
                              >
                                Add
                              </button>
                            </div>

                            <div className="space-y-2">
                              {method.parameters.map((param) => (
                                <div key={param.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200">
                                  <span className="text-sm font-mono text-gray-700">
                                    <span className="font-semibold">{param.name}</span>
                                    <span className="text-gray-400">: </span>
                                    <span className="text-blue-600">{param.type}</span>
                                  </span>
                                  <button
                                    onClick={() => removeParameterFromMethod(method.id, param.id)}
                                    className="text-red-500 hover:text-red-700 text-xs font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                              {method.parameters.length === 0 && (
                                <div className="text-center text-gray-400 text-sm py-2">
                                  No parameters yet
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(editingData.methods || []).length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <p className="text-sm">No method signatures defined yet</p>
                      <p className="text-xs mt-1">Add your first method above</p>
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
            Save Interface
          </button>
        </div>
      </div>
    </div>
  );
};

export default UMLInterfaceEditor;
