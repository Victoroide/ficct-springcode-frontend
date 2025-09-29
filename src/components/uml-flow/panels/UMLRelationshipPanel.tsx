/**
 * UMLRelationshipPanel.tsx
 * Panel for editing UML relationships between elements
 */

import React from 'react';
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
    e.preventDefault();
    e.stopPropagation();
    onUpdateEdge(edge.id, {
      ...data,
      label: e.target.value
    });
  };

  return (
    <div className="uml-relationship-panel p-4">
      <h3 className="text-lg font-medium mb-4">Relationship Properties</h3>

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
          value={data.label || ''}
          onChange={handleLabelChange}
          placeholder="e.g., manages, owns, uses"
        />
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
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <h5 className="font-medium text-sm mb-1">Relationship Description:</h5>
        <p className="text-xs text-gray-600">
          {data.relationshipType === 'ASSOCIATION' && 'Simple relationship between classes'}
          {data.relationshipType === 'INHERITANCE' && 'Parent-child relationship (is-a)'}
          {data.relationshipType === 'REALIZATION' && 'Interface implementation'}
          {data.relationshipType === 'AGGREGATION' && 'Weak ownership (has-a)'}
          {data.relationshipType === 'COMPOSITION' && 'Strong ownership (part-of)'}
          {data.relationshipType === 'DEPENDENCY' && 'Uses or depends on'}
        </p>
      </div>
    </div>
  );
};

export default UMLRelationshipPanel;
