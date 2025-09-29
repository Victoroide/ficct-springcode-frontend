/**
 * ResponsivePropertiesPanel.tsx
 * Modern responsive properties panel for UML elements
 */

import React, { useState, useEffect } from 'react';
import { X, Settings, Link, Palette, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { UMLNode, UMLEdge, UMLNodeData, UMLEdgeData } from '../types';

interface ResponsivePropertiesPanelProps {
  selectedNode?: UMLNode | null;
  selectedEdge?: UMLEdge | null;
  onUpdateNode?: (nodeId: string, updates: Partial<UMLNodeData>) => void;
  onUpdateEdge?: (edgeId: string, updates: Partial<UMLEdgeData>) => void;
  onClose: () => void;
  isOpen: boolean;
}

type PanelTab = 'properties' | 'styling' | 'relationships' | 'advanced';

const ResponsivePropertiesPanel: React.FC<ResponsivePropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  onUpdateNode,
  onUpdateEdge,
  onClose,
  isOpen
}) => {
  const [activeTab, setActiveTab] = useState<PanelTab>('properties');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const selectedElement = selectedNode || selectedEdge;
  const isNode = !!selectedNode;
  const isEdge = !!selectedEdge;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const tabs = [
    { id: 'properties' as PanelTab, label: 'Properties', icon: Info },
    { id: 'styling' as PanelTab, label: 'Styling', icon: Palette },
    ...(isNode ? [{ id: 'relationships' as PanelTab, label: 'Relations', icon: Link }] : []),
    { id: 'advanced' as PanelTab, label: 'Advanced', icon: Settings }
  ];

  const updateNodeProperty = (property: string, value: any) => {
    if (selectedNode && onUpdateNode) {
      onUpdateNode(selectedNode.id, { [property]: value });
    }
  };

  const updateEdgeProperty = (property: string, value: any) => {
    if (selectedEdge && onUpdateEdge) {
      // CRITICAL FIX: Prevent event propagation that might cause deletion
      onUpdateEdge(selectedEdge.id, { [property]: value });
    }
  };

  // CRITICAL FIX: Prevent deletion events from propagating
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, property: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateEdgeProperty(property, e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, property: string) => {
    e.preventDefault();
    e.stopPropagation();
    updateEdgeProperty(property, e.target.value);
  };

  if (!isOpen || !selectedElement) return null;

  // Mobile: Modal overlay
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
        <div className="bg-white w-full max-h-[70vh] rounded-t-lg shadow-xl">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">
              {isNode ? 'Node Properties' : 'Edge Properties'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Tabs */}
          <div className="flex overflow-x-auto border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Mobile Content */}
          <div className="p-4 overflow-y-auto max-h-96">
            {renderTabContent()}
          </div>
        </div>
      </div>
    );
  }

  // Desktop/Tablet: Sidebar
  return (
    <div className={`fixed right-0 top-0 h-full bg-white shadow-xl border-l z-40 transition-transform duration-300 ${
      isOpen ? 'transform translate-x-0' : 'transform translate-x-full'
    }`} style={{ width: '320px' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">
            {isNode ? 'Node Properties' : 'Edge Properties'}
          </h3>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Tabs */}
          <div className="border-b">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-2 px-4 py-3 text-left ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 120px)' }}>
            {renderTabContent()}
          </div>
        </>
      )}
    </div>
  );

  function renderTabContent() {
    switch (activeTab) {
      case 'properties':
        return renderPropertiesTab();
      case 'styling':
        return renderStylingTab();
      case 'relationships':
        return renderRelationshipsTab();
      case 'advanced':
        return renderAdvancedTab();
      default:
        return null;
    }
  }

  function renderPropertiesTab() {
    if (isNode && selectedNode) {
      const nodeData = selectedNode.data;
      
      return (
        <div className="space-y-4">
          {/* Basic Properties */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={nodeData.label || ''}
              onChange={(e) => updateNodeProperty('label', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Type</label>
            <select
              value={nodeData.nodeType || 'class'}
              onChange={(e) => updateNodeProperty('nodeType', e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="class">Class</option>
              <option value="interface">Interface</option>
              <option value="enum">Enumeration</option>
              <option value="abstractClass">Abstract Class</option>
            </select>
          </div>

          {nodeData.nodeType !== 'enum' && (
            <>
              {/* Attributes */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Attributes ({(nodeData.attributes || []).length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(nodeData.attributes || []).map((attr, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <span className="font-mono">
                        {attr.visibility === 'private' ? '-' : '+'} {attr.name}: {attr.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Methods */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Methods ({(nodeData.methods || []).length})
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(nodeData.methods || []).map((method, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                      <span className="font-mono">
                        {method.visibility === 'private' ? '-' : '+'} {method.name}(): {method.returnType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {nodeData.nodeType === 'enum' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Values ({(nodeData.enumValues || []).length})
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {(nodeData.enumValues || []).map((enumVal, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                    <span className="font-mono">{enumVal.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (isEdge && selectedEdge) {
      const edgeData = selectedEdge.data;
      
      return (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Relationship Type</label>
            <select
              value={edgeData?.relationshipType || 'ASSOCIATION'}
              onChange={(e) => handleSelectChange(e, 'relationshipType')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="ASSOCIATION">Association</option>
              <option value="AGGREGATION">Aggregation</option>
              <option value="COMPOSITION">Composition</option>
              <option value="INHERITANCE">Inheritance</option>
              <option value="IMPLEMENTATION">Implementation</option>
              <option value="DEPENDENCY">Dependency</option>
              <option value="REALIZATION">Realization</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Label</label>
            <input
              type="text"
              value={edgeData?.label || ''}
              onChange={(e) => handleInputChange(e, 'label')}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="Relationship label"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-2">Source Multiplicity</label>
              <input
                type="text"
                value={edgeData?.sourceMultiplicity || ''}
                onChange={(e) => handleInputChange(e, 'sourceMultiplicity')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Multiplicity</label>
              <input
                type="text"
                value={edgeData?.targetMultiplicity || ''}
                onChange={(e) => handleInputChange(e, 'targetMultiplicity')}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="*"
              />
            </div>
          </div>
        </div>
      );
    }

    return <div className="text-gray-500">No element selected</div>;
  }

  function renderStylingTab() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Background Color</label>
          <div className="flex space-x-2">
            <input
              type="color"
              className="w-12 h-8 border rounded cursor-pointer"
              defaultValue="#ffffff"
            />
            <input
              type="text"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Border Color</label>
          <div className="flex space-x-2">
            <input
              type="color"
              className="w-12 h-8 border rounded cursor-pointer"
              defaultValue="#000000"
            />
            <input
              type="text"
              className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="#000000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Border Width</label>
          <input
            type="range"
            min="1"
            max="5"
            defaultValue="1"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <select className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500">
            <option value="12">12px</option>
            <option value="14" selected>14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
          </select>
        </div>
      </div>
    );
  }

  function renderRelationshipsTab() {
    if (!isNode) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Incoming Relationships</h4>
          <div className="text-sm text-gray-500">
            No incoming relationships found
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Outgoing Relationships</h4>
          <div className="text-sm text-gray-500">
            No outgoing relationships found
          </div>
        </div>

        <button className="w-full p-2 border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-300 hover:text-blue-600 rounded-md">
          Add New Relationship
        </button>
      </div>
    );
  }

  function renderAdvancedTab() {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Package</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="com.example.package"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Stereotypes</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="<<entity>>, <<service>>"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Documentation</label>
          <textarea
            rows={4}
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Add documentation for this element..."
          />
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Abstract</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">Final</span>
          </label>
        </div>
      </div>
    );
  }
};

export default ResponsivePropertiesPanel;
