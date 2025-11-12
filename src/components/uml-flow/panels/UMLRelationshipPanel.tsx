/**
 * UMLRelationshipPanel.tsx
 * Panel for editing UML relationships between elements
 */

import React, { useState, useEffect } from 'react';
import type { UMLRelationshipType, UMLEdgeData } from '../types';
import type { Multiplicity } from '../edges/UMLRelationshipEdge';

interface UMLRelationshipPanelProps {
  edge: {
    id: string;
    data?: UMLEdgeData;
  };
  onUpdateEdge: (edgeId: string, data: Partial<UMLEdgeData>) => void;
  onClose: () => void;
}

const UMLRelationshipPanel: React.FC<UMLRelationshipPanelProps> = ({ 
  edge,
  onUpdateEdge,
  onClose 
}) => {
  // Default data if none exists
  const data: UMLEdgeData = edge.data || {
    relationshipType: 'ASSOCIATION',
    sourceMultiplicity: '',
    targetMultiplicity: '',
    label: ''
  };

  // Local state for label input to avoid re-render issues
  const [labelValue, setLabelValue] = useState(data.label || '');

  // CRITICAL UX FIX: Sync label state when edge data changes
  // This ensures modal displays fresh data when user re-opens it
  useEffect(() => {
    setLabelValue(edge.data?.label || '');
  }, [edge.data?.label, edge.id]);

  const handleRelationshipTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const type = e.target.value as UMLRelationshipType;
    onUpdateEdge(edge.id, {
      ...data,
      relationshipType: type
    });
  };

  const handleSourceMultiplicityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const multiplicity = e.target.value as Multiplicity;
    onUpdateEdge(edge.id, {
      ...data,
      sourceMultiplicity: multiplicity
    });
  };

  const handleTargetMultiplicityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const multiplicity = e.target.value as Multiplicity;
    onUpdateEdge(edge.id, {
      ...data,
      targetMultiplicity: multiplicity
    });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only update local state, don't trigger edge update on every keystroke
    setLabelValue(e.target.value);
  };

  const handleLabelBlur = () => {
    // Save to edge when input loses focus
    if (labelValue !== data.label) {
      onUpdateEdge(edge.id, {
        ...data,
        label: labelValue
      });
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent event propagation to avoid React Flow shortcuts
    e.stopPropagation();
    
    if (e.key === 'Enter') {
      // Save on Enter
      e.preventDefault();
      if (labelValue !== data.label) {
        onUpdateEdge(edge.id, {
          ...data,
          label: labelValue
        });
      }
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      // Reset on Escape
      e.preventDefault();
      setLabelValue(data.label || '');
      (e.target as HTMLInputElement).blur();
    }
    // Delete and Backspace work normally within the input because stopPropagation prevents them from reaching React Flow
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg overflow-y-auto p-4 z-50 border-l-2 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Relationship Properties</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
          aria-label="Close panel"
        >
          <span className="text-2xl">&times;</span>
        </button>
      </div>

      {/* Relationship type */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Relationship Type
        </label>
        <select 
          className="w-full p-2 border rounded" 
          value={data.relationshipType}
          onChange={handleRelationshipTypeChange}
        >
          <option value="ASSOCIATION">Association</option>
          <option value="INHERITANCE">Inheritance (extends)</option>
          <option value="REALIZATION">Realization (implements)</option>
          <option value="AGGREGATION">Aggregation</option>
          <option value="COMPOSITION">Composition</option>
          <option value="DEPENDENCY">Dependency</option>
        </select>
      </div>

      {/* Relationship Label */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Relationship Label
        </label>
        <input 
          type="text" 
          className="w-full p-2 border rounded"
          value={labelValue}
          onChange={handleLabelChange}
          onBlur={handleLabelBlur}
          onKeyDown={handleLabelKeyDown}
          placeholder="e.g., manages, owns, uses"
        />
        <p className="text-xs text-gray-500 mt-1">
          Press Enter to save, Esc to cancel
        </p>
      </div>

      {/* Source Multiplicity */}
      <div className="mb-4 border-t pt-3">
        <h4 className="font-medium mb-2">Source End</h4>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Multiplicity
          </label>
          <select 
            className="w-full p-2 border rounded" 
            value={data.sourceMultiplicity}
            onChange={handleSourceMultiplicityChange}
          >
            <option value="">None</option>
            <option value="1">1 (One)</option>
            <option value="0..1">0..1 (Zero or One)</option>
            <option value="0..*">0..* (Zero or Many)</option>
            <option value="1..*">1..* (One or Many)</option>
            <option value="*">* (Many)</option>
          </select>
        </div>
      </div>

      {/* Target Multiplicity */}
      <div className="mb-4 border-t pt-3">
        <h4 className="font-medium mb-2">Target End</h4>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">
            Multiplicity
          </label>
          <select 
            className="w-full p-2 border rounded" 
            value={data.targetMultiplicity}
            onChange={handleTargetMultiplicityChange}
          >
            <option value="">None</option>
            <option value="1">1 (One)</option>
            <option value="0..1">0..1 (Zero or One)</option>
            <option value="0..*">0..* (Zero or Many)</option>
            <option value="1..*">1..* (One or Many)</option>
            <option value="*">* (Many)</option>
          </select>
        </div>
      </div>

      {/* Relationship Description */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <h5 className="font-medium text-sm mb-2 text-blue-900">Description</h5>
        <p className="text-xs text-blue-800">
          {data.relationshipType === 'ASSOCIATION' && 'Simple relationship between classes'}
          {data.relationshipType === 'INHERITANCE' && 'Parent-child relationship (is-a)'}
          {data.relationshipType === 'REALIZATION' && 'Interface implementation'}
          {data.relationshipType === 'AGGREGATION' && 'Weak ownership (has-a)'}
          {data.relationshipType === 'COMPOSITION' && 'Strong ownership (part-of)'}
          {data.relationshipType === 'DEPENDENCY' && 'Uses or depends on'}
        </p>
      </div>

      {/* JPA Code Generation Info */}
      <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
        <h5 className="font-medium text-sm mb-2 text-green-900">JPA Annotation</h5>
        <code className="text-xs text-green-800 font-mono block">
          {data.relationshipType === 'ASSOCIATION' && '@OneToOne with @JoinColumn'}
          {data.relationshipType === 'INHERITANCE' && '@Inheritance strategy'}
          {data.relationshipType === 'REALIZATION' && 'Interface (no JPA annotation)'}
          {data.relationshipType === 'AGGREGATION' && '@OneToMany with mappedBy'}
          {data.relationshipType === 'COMPOSITION' && '@OneToMany with CASCADE.ALL'}
          {data.relationshipType === 'DEPENDENCY' && '@ManyToOne with @JoinColumn'}
        </code>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <h5 className="font-medium text-sm mb-2 text-amber-900">Quick Tips</h5>
        <ul className="text-xs text-amber-800 space-y-1">
          <li>• Select edge to edit properties</li>
          <li>• Press Delete to remove relationship</li>
          <li>• Multiplicity affects JPA annotations</li>
          <li>• Use label for role names</li>
        </ul>
      </div>
    </div>
  );
};

export default UMLRelationshipPanel;
