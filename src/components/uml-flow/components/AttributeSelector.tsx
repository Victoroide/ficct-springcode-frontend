/**
 * AttributeSelector - Componente para seleccionar atributos al crear relaciones
 */

import React, { useState } from 'react';
import type { UMLNodeData } from '../types';
import type { RelationshipType, AttributeRelationship } from '../types/relationships';

interface AttributeSelectorProps {
  sourceNode: { id: string; data: UMLNodeData };
  targetNode: { id: string; data: UMLNodeData };
  onCreateRelationship: (relationship: Omit<AttributeRelationship, 'id'>) => void;
  onCancel: () => void;
}

const AttributeSelector: React.FC<AttributeSelectorProps> = ({
  sourceNode,
  targetNode,
  onCreateRelationship,
  onCancel
}) => {
  const [sourceAttributeId, setSourceAttributeId] = useState<string>('');
  const [targetAttributeId, setTargetAttributeId] = useState<string>('');
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('ASSOCIATION');
  const [sourceMultiplicity, setSourceMultiplicity] = useState<string>('');
  const [targetMultiplicity, setTargetMultiplicity] = useState<string>('');
  const [label, setLabel] = useState<string>('');

  // Usar properties en lugar de fields (según el tipo UMLNodeData actual)
  const sourceAttributes = (sourceNode.data as any).properties || [];
  const targetAttributes = (targetNode.data as any).properties || [];

  const handleCreateRelationship = () => {
    if (!sourceAttributeId || !targetAttributeId) {
      alert('Debes seleccionar atributos en ambas clases');
      return;
    }

    const relationship: Omit<AttributeRelationship, 'id'> = {
      sourceNodeId: sourceNode.id,
      targetNodeId: targetNode.id,
      sourceAttributeId,
      targetAttributeId,
      relationshipType,
      sourceMultiplicity: sourceMultiplicity as any,
      targetMultiplicity: targetMultiplicity as any,
      label
    };

    onCreateRelationship(relationship);
  };

  const getAttributeDisplayName = (field: any) => {
    const visibility = field.visibility === 'public' ? '+' :
                      field.visibility === 'private' ? '-' :
                      field.visibility === 'protected' ? '#' : '~';
    return `${visibility} ${field.name}: ${field.type}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Crear Relación entre Atributos</h3>
        
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Clase Origen */}
          <div>
            <h4 className="font-medium mb-2 text-blue-600">
              Clase Origen: {sourceNode.data.label}
            </h4>
            <label className="block text-sm font-medium mb-1">Atributo:</label>
            <select
              className="w-full p-2 border rounded"
              value={sourceAttributeId}
              onChange={(e) => setSourceAttributeId(e.target.value)}
            >
              <option value="">Seleccionar atributo...</option>
              {sourceAttributes.map((field) => (
                <option key={field.id} value={field.id}>
                  {getAttributeDisplayName(field)}
                </option>
              ))}
            </select>
          </div>

          {/* Clase Destino */}
          <div>
            <h4 className="font-medium mb-2 text-green-600">
              Clase Destino: {targetNode.data.label}
            </h4>
            <label className="block text-sm font-medium mb-1">Atributo:</label>
            <select
              className="w-full p-2 border rounded"
              value={targetAttributeId}
              onChange={(e) => setTargetAttributeId(e.target.value)}
            >
              <option value="">Seleccionar atributo...</option>
              {targetAttributes.map((field) => (
                <option key={field.id} value={field.id}>
                  {getAttributeDisplayName(field)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tipo de Relación */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tipo de Relación:</label>
          <select
            className="w-full p-2 border rounded"
            value={relationshipType}
            onChange={(e) => setRelationshipType(e.target.value as RelationshipType)}
          >
            <option value="ASSOCIATION">Association (Asociación)</option>
            <option value="AGGREGATION">Aggregation (Agregación)</option>
            <option value="COMPOSITION">Composition (Composición)</option>
            <option value="INHERITANCE">Inheritance (Herencia)</option>
            <option value="REALIZATION">Realization (Implementación)</option>
            <option value="DEPENDENCY">Dependency (Dependencia)</option>
          </select>
        </div>

        {/* Multiplicidades */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Multiplicidad Origen:</label>
            <select
              className="w-full p-2 border rounded"
              value={sourceMultiplicity}
              onChange={(e) => setSourceMultiplicity(e.target.value)}
            >
              <option value="">Sin especificar</option>
              <option value="1">1 (Uno)</option>
              <option value="0..1">0..1 (Cero o Uno)</option>
              <option value="0..*">0..* (Cero o Muchos)</option>
              <option value="1..*">1..* (Uno o Muchos)</option>
              <option value="*">* (Muchos)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Multiplicidad Destino:</label>
            <select
              className="w-full p-2 border rounded"
              value={targetMultiplicity}
              onChange={(e) => setTargetMultiplicity(e.target.value)}
            >
              <option value="">Sin especificar</option>
              <option value="1">1 (Uno)</option>
              <option value="0..1">0..1 (Cero o Uno)</option>
              <option value="0..*">0..* (Cero o Muchos)</option>
              <option value="1..*">1..* (Uno o Muchos)</option>
              <option value="*">* (Muchos)</option>
            </select>
          </div>
        </div>

        {/* Etiqueta */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Etiqueta (opcional):</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="ej: manages, owns, uses..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>

        {/* Vista previa de la relación */}
        <div className="mb-6 p-3 bg-gray-50 rounded">
          <h5 className="font-medium mb-2">Vista previa:</h5>
          <div className="text-sm">
            {sourceAttributeId && targetAttributeId && (
              <p>
                <span className="text-blue-600">{sourceNode.data.label}</span>
                <span className="text-gray-500">.{sourceAttributes.find(f => f.id === sourceAttributeId)?.name}</span>
                <span className="mx-2">--[{relationshipType}]--</span>
                <span className="text-green-600">{targetNode.data.label}</span>
                <span className="text-gray-500">.{targetAttributes.find(f => f.id === targetAttributeId)?.name}</span>
              </p>
            )}
            {sourceMultiplicity && <span className="text-xs bg-blue-100 px-1 rounded">Origen: {sourceMultiplicity}</span>}
            {targetMultiplicity && <span className="text-xs bg-green-100 px-1 rounded ml-2">Destino: {targetMultiplicity}</span>}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border rounded hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateRelationship}
            disabled={!sourceAttributeId || !targetAttributeId}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
          >
            Crear Relación
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttributeSelector;
