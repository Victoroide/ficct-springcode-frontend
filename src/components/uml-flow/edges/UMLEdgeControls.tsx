/**
 * UMLEdgeControls.tsx
 * Component for editing UML relationship properties
 */

import React, { useState } from 'react';
import type { Edge } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RelationshipType } from '@/components/uml-editor/types';

interface UMLEdgeControlsProps {
  edge: Edge;
  onEdgeDataUpdate: (data: any) => void;
}

const relationshipTypes: { value: RelationshipType; label: string }[] = [
  { value: 'ASSOCIATION', label: 'Association' },
  { value: 'AGGREGATION', label: 'Aggregation' },
  { value: 'COMPOSITION', label: 'Composition' },
  { value: 'INHERITANCE', label: 'Inheritance' },
  { value: 'REALIZATION', label: 'Realization' },
  { value: 'DEPENDENCY', label: 'Dependency' },
  { value: 'GENERALIZATION', label: 'Generalization' },
];

const multiplicityOptions = [
  { value: '', label: 'None' },
  { value: '0..1', label: '0..1 (Optional)' },
  { value: '1', label: '1 (Exactly one)' },
  { value: '0..', label: '0..* (Zero or many)' },
  { value: '1..', label: '1..* (One or many)' },
];

const UMLEdgeControls: React.FC<UMLEdgeControlsProps> = ({ edge, onEdgeDataUpdate }) => {
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(
    (edge.data?.relationshipType as RelationshipType) || 'ASSOCIATION'
  );
  const [name, setName] = useState(edge.data?.label || '');
  const [sourceMultiplicity, setSourceMultiplicity] = useState(edge.data?.sourceMultiplicity || '');
  const [targetMultiplicity, setTargetMultiplicity] = useState(edge.data?.targetMultiplicity || '');

  const handleTypeChange = (value: RelationshipType) => {
    setRelationshipType(value);
    onEdgeDataUpdate({
      ...edge.data,
      relationshipType: value,
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    onEdgeDataUpdate({
      ...edge.data,
      label: newName,
    });
  };

  const handleSourceMultiplicityChange = (value: string) => {
    setSourceMultiplicity(value);
    onEdgeDataUpdate({
      ...edge.data,
      sourceMultiplicity: value,
    });
  };

  const handleTargetMultiplicityChange = (value: string) => {
    setTargetMultiplicity(value);
    onEdgeDataUpdate({
      ...edge.data,
      targetMultiplicity: value,
    });
  };

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-semibold mb-4">Relationship Properties</h3>
      
      <div className="space-y-2">
        <Label htmlFor="relationship-type">Relationship Type</Label>
        <Select 
          value={relationshipType} 
          onValueChange={(value) => handleTypeChange(value as RelationshipType)}
        >
          <SelectTrigger id="relationship-type" className="w-full">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {relationshipTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="relationship-name">Relationship Name (Label)</Label>
        <Input
          id="relationship-name"
          value={name}
          onChange={handleNameChange}
          placeholder="Enter name"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="source-multiplicity">Source Multiplicity</Label>
          <Select 
            value={sourceMultiplicity} 
            onValueChange={handleSourceMultiplicityChange}
          >
            <SelectTrigger id="source-multiplicity" className="w-full">
              <SelectValue placeholder="Select multiplicity" />
            </SelectTrigger>
            <SelectContent>
              {multiplicityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="target-multiplicity">Target Multiplicity</Label>
          <Select 
            value={targetMultiplicity} 
            onValueChange={handleTargetMultiplicityChange}
          >
            <SelectTrigger id="target-multiplicity" className="w-full">
              <SelectValue placeholder="Select multiplicity" />
            </SelectTrigger>
            <SelectContent>
              {multiplicityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pt-4 border-t border-slate-200 mt-4">
        <div className="bg-slate-50 p-3 rounded-md text-sm text-slate-600">
          <p className="font-medium mb-1">Relationship Information</p>
          <p className="mb-1">From: <span className="font-mono text-xs">{edge.source}</span></p>
          <p>To: <span className="font-mono text-xs">{edge.target}</span></p>
        </div>
      </div>
    </div>
  );
};

export default UMLEdgeControls;
