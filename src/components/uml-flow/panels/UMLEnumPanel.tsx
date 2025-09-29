/**
 * UMLEnumPanel.tsx
 * Panel for editing enum values in UML enum nodes
 */

import React, { useState } from 'react';
import { generateId } from '../types';
import type { UMLNodeData, UMLEnumValue } from '../types';

interface UMLEnumPanelProps {
  node: {
    id: string;
    data: UMLNodeData;
  };
  onUpdateNode: (nodeId: string, data: Partial<UMLNodeData>) => void;
  onClose: () => void;
}

const UMLEnumPanel: React.FC<UMLEnumPanelProps> = ({ node, onUpdateNode, onClose }) => {
  // State for adding new enum values
  const [newEnumValue, setNewEnumValue] = useState<Partial<UMLEnumValue>>({
    name: '',
    value: '',
  });

  // Update enum name (label)
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateNode(node.id, { label: e.target.value });
  };

  // Add a new enum value
  const handleAddEnumValue = () => {
    if (newEnumValue.name) {
      const enumValue: UMLEnumValue = {
        id: generateId(),
        name: newEnumValue.name || '',
        value: newEnumValue.value,
      };

      onUpdateNode(node.id, {
        enumValues: [...(node.data.enumValues || []), enumValue],
      });

      // Reset form
      setNewEnumValue({
        name: '',
        value: '',
      });
    }
  };

  // Remove an enum value
  const handleRemoveEnumValue = (enumValueId: string) => {
    onUpdateNode(node.id, {
      enumValues: (node.data.enumValues || []).filter(
        (value) => value.id !== enumValueId
      ),
    });
  };

  // Move enum value up in the list
  const handleMoveUp = (index: number) => {
    if (index > 0 && node.data.enumValues) {
      const newEnumValues = [...node.data.enumValues];
      [newEnumValues[index - 1], newEnumValues[index]] = [
        newEnumValues[index],
        newEnumValues[index - 1],
      ];
      onUpdateNode(node.id, { enumValues: newEnumValues });
    }
  };

  // Move enum value down in the list
  const handleMoveDown = (index: number) => {
    if (
      node.data.enumValues &&
      index < node.data.enumValues.length - 1
    ) {
      const newEnumValues = [...node.data.enumValues];
      [newEnumValues[index], newEnumValues[index + 1]] = [
        newEnumValues[index + 1],
        newEnumValues[index],
      ];
      onUpdateNode(node.id, { enumValues: newEnumValues });
    }
  };

  return (
    <div className="uml-enum-panel p-4 overflow-y-auto max-h-[calc(100vh-200px)]">
      <h3 className="text-lg font-medium mb-4">Enum Properties</h3>

      {/* Enum name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          type="text"
          className="w-full p-2 border rounded"
          value={node.data.label || ''}
          onChange={handleLabelChange}
        />
      </div>

      {/* Enum values section */}
      <div className="mb-6 border-t pt-3">
        <h4 className="font-medium mb-2">Enum Values</h4>

        {/* Existing enum values */}
        <div className="mb-3 space-y-2">
          {(node.data.enumValues || []).map((value, index) => (
            <div
              key={value.id}
              className="flex items-center justify-between bg-gray-50 p-2 rounded"
            >
              <div className="text-sm">
                <span className="font-mono">{value.name}</span>
                {value.value && (
                  <>
                    <span className="mx-1">=</span>
                    <span className="text-green-600">{value.value}</span>
                  </>
                )}
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className={`text-gray-500 px-1 ${
                    index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-700'
                  }`}
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === (node.data.enumValues?.length || 0) - 1}
                  className={`text-gray-500 px-1 ${
                    index === (node.data.enumValues?.length || 0) - 1
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:text-gray-700'
                  }`}
                >
                  ↓
                </button>
                <button
                  onClick={() => handleRemoveEnumValue(value.id)}
                  className="text-red-500 hover:text-red-700 text-sm ml-2"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add new enum value */}
        <div className="bg-gray-50 p-3 rounded">
          <h5 className="text-sm font-medium mb-2">Add Enum Value</h5>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              className="p-1 border rounded text-sm"
              placeholder="Name (e.g. RED)"
              value={newEnumValue.name || ''}
              onChange={(e) =>
                setNewEnumValue({ ...newEnumValue, name: e.target.value })
              }
            />

            <input
              type="text"
              className="p-1 border rounded text-sm"
              placeholder="Value (optional)"
              value={newEnumValue.value || ''}
              onChange={(e) =>
                setNewEnumValue({ ...newEnumValue, value: e.target.value })
              }
            />
          </div>

          <button
            onClick={handleAddEnumValue}
            className="w-full bg-blue-500 text-white p-1 rounded text-sm hover:bg-blue-600"
            disabled={!newEnumValue.name}
          >
            Add Value
          </button>
        </div>
      </div>
    </div>
  );
};

export default UMLEnumPanel;
