/**
 * Relationship Creator Component
 * Handles creating relationships between UML elements
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { UMLClass, RelationshipType, MultiplicityType, Point } from './types';
import { useUMLEditorTheme } from './UMLEditorTheme';

const relationshipTypes: Array<{
  value: RelationshipType;
  label: string;
  description: string;
  icon: string;
}> = [
  { 
    value: 'ASSOCIATION', 
    label: 'Association', 
    description: 'Basic relationship between classes', 
    icon: '↔️' 
  },
  { 
    value: 'AGGREGATION', 
    label: 'Aggregation', 
    description: 'Represents "has-a" relationship', 
    icon: '◇' 
  },
  { 
    value: 'COMPOSITION', 
    label: 'Composition', 
    description: 'Strong ownership relationship', 
    icon: '◆' 
  },
  { 
    value: 'INHERITANCE', 
    label: 'Inheritance', 
    description: 'Extends from parent class', 
    icon: '▷' 
  },
  { 
    value: 'REALIZATION', 
    label: 'Realization', 
    description: 'Implements an interface', 
    icon: '- -▷' 
  },
  { 
    value: 'DEPENDENCY', 
    label: 'Dependency', 
    description: 'One class depends on another', 
    icon: '- ->' 
  },
  { 
    value: 'GENERALIZATION', 
    label: 'Generalization', 
    description: 'Specialized form of inheritance', 
    icon: '—▷' 
  }
];

const multiplicityOptions: Array<{
  value: MultiplicityType;
  label: string;
  description: string;
}> = [
  { value: '', label: 'None', description: 'No multiplicity specified' },
  { value: '1', label: '1', description: 'Exactly one' },
  { value: '0..1', label: '0..1', description: 'Zero or one' },
  { value: '0..', label: '0..*', description: 'Zero or many' },
  { value: '1..', label: '1..*', description: 'One or many' }
];

interface RelationshipTypeModalProps {
  onSelect: (type: RelationshipType) => void;
  onCancel: () => void;
  position: Point;
}

// Type selector modal component
const RelationshipTypeModal: React.FC<RelationshipTypeModalProps> = ({
  onSelect,
  onCancel,
  position
}) => {
  const theme = useUMLEditorTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);
  
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);
  
  return createPortal(
    <div
      className="relationship-type-selector"
      ref={modalRef}
      style={{
        top: position.y,
        left: position.x,
        backgroundColor: '#ffffff',
        color: '#1e293b',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }}
    >
      <h4 style={{ margin: '0 0 8px 0' }}>Select Relationship Type</h4>
      <div>
        {relationshipTypes.map(type => (
          <div
            key={type.value}
            className="relationship-type-option"
            onClick={() => onSelect(type.value)}
            style={{ cursor: 'pointer', padding: '4px 8px' }}
          >
            <span style={{ marginRight: '8px' }}>{type.icon}</span>
            <div>
              <div>{type.label}</div>
              <div style={{ fontSize: '0.8em', opacity: 0.8 }}>{type.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

interface RelationshipPropertiesModalProps {
  relationType: RelationshipType;
  onComplete: (properties: {
    name?: string;
    sourceMultiplicity: MultiplicityType;
    targetMultiplicity: MultiplicityType;
  }) => void;
  onCancel: () => void;
  position: Point;
}

// Properties modal for setting relationship details
const RelationshipPropertiesModal: React.FC<RelationshipPropertiesModalProps> = ({
  relationType,
  onComplete,
  onCancel,
  position
}) => {
  const theme = useUMLEditorTheme();
  const [name, setName] = useState<string>('');
  const [sourceMultiplicity, setSourceMultiplicity] = useState<MultiplicityType>('');
  const [targetMultiplicity, setTargetMultiplicity] = useState<MultiplicityType>('');
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Handle clicks outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onCancel();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);
  
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);
  
  // Get selected relationship type info
  const selectedType = relationshipTypes.find(t => t.value === relationType) || relationshipTypes[0];
  
  return createPortal(
    <div
      className="relationship-properties-modal"
      ref={modalRef}
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        backgroundColor: theme.theme === 'dark' ? '#1e293b' : '#ffffff',
        color: theme.theme === 'dark' ? '#f8fafc' : '#1e293b',
        border: `1px solid ${theme.theme === 'dark' ? '#334155' : '#e2e8f0'}`,
        borderRadius: '4px',
        padding: '16px',
        boxShadow: theme.theme === 'dark' 
          ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '300px',
        zIndex: 1000
      }}
    >
      <h4 style={{ margin: '0 0 16px 0' }}>
        {selectedType.icon} {selectedType.label} Properties
      </h4>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Relationship Name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}
          placeholder="Enter name (optional)"
        />
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Source Multiplicity
        </label>
        <select
          value={sourceMultiplicity}
          onChange={(e) => setSourceMultiplicity(e.target.value as MultiplicityType)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}
        >
          {multiplicityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '4px' }}>
          Target Multiplicity
        </label>
        <select
          value={targetMultiplicity}
          onChange={(e) => setTargetMultiplicity(e.target.value as MultiplicityType)}
          style={{
            width: '100%',
            padding: '8px',
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '4px'
          }}
        >
          {multiplicityOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.description}
            </option>
          ))}
        </select>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={() => onComplete({
            name: name.trim() || undefined,
            sourceMultiplicity,
            targetMultiplicity
          })}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Relationship
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: '#1e293b',
            border: '1px solid #e2e8f0',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>,
    document.body
  );
};

// Main RelationshipCreator component for handling relationship creation workflow
interface RelationshipCreatorProps {
  isActive: boolean;
  elements: UMLClass[];
  onRelationshipCreate: (relationship: {
    sourceClass: string;
    targetClass: string;
    relationshipType: RelationshipType;
    sourceMultiplicity?: MultiplicityType;
    targetMultiplicity?: MultiplicityType;
    name?: string;
  }) => void;
  zoom: number;
}

export const RelationshipCreator: React.FC<RelationshipCreatorProps> = ({
  isActive,
  elements,
  onRelationshipCreate,
  zoom = 1
}) => {
  const theme = useUMLEditorTheme();
  
  // Relationship creation state
  const [creationState, setCreationState] = useState<{
    state: 'idle' | 'selecting_source' | 'selecting_target' | 'selecting_type' | 'selecting_properties';
    sourceId?: string;
    targetId?: string;
    sourcePoint?: Point;
    targetPoint?: Point;
    relationType?: RelationshipType;
  }>({
    state: isActive ? 'selecting_source' : 'idle'
  });
  
  // Preview line for dragging
  const [previewLine, setPreviewLine] = useState<{
    visible: boolean;
    start: Point;
    end: Point;
  }>({
    visible: false,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 0 }
  });
  
  // Track mouse position
  const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 });
  
  // Modal position (for relationship type and properties modals)
  const [modalPosition, setModalPosition] = useState<Point>({ x: 0, y: 0 });
  
  // Find element by position (for hover detection)
  const getElementAtPoint = (point: Point): UMLClass | undefined => {
    return elements.find(element => {
      const { x, y } = element.position;
      const { width, height } = element.dimensions;
      
      return (
        point.x >= x &&
        point.x <= x + width &&
        point.y >= y &&
        point.y <= y + height
      );
    });
  };
  
  // Update creation state based on active status
  useEffect(() => {
    if (isActive && creationState.state === 'idle') {
      setCreationState({ state: 'selecting_source' });
    } else if (!isActive && creationState.state !== 'idle') {
      setCreationState({ state: 'idle' });
      setPreviewLine({ visible: false, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
    }
  }, [isActive, creationState.state]);
  
  // Mouse move handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Track mouse position for modals
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      // Handle relationship line preview
      if (creationState.state === 'selecting_target' && creationState.sourcePoint) {
        const currentPoint = {
          x: e.clientX / zoom,
          y: e.clientY / zoom
        };
        
        setPreviewLine({
          visible: true,
          start: creationState.sourcePoint,
          end: currentPoint
        });
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [creationState, zoom]);
  
  // Handle element click for source selection
  const handleElementClick = (elementId: string, position: Point) => {
    if (creationState.state === 'selecting_source') {
      // Source element selected
      setCreationState({
        state: 'selecting_target',
        sourceId: elementId,
        sourcePoint: position
      });
    } else if (
      creationState.state === 'selecting_target' && 
      creationState.sourceId &&
      creationState.sourceId !== elementId
    ) {
      // Target element selected
      setCreationState({
        state: 'selecting_type',
        sourceId: creationState.sourceId,
        targetId: elementId,
        sourcePoint: creationState.sourcePoint,
        targetPoint: position
      });
      
      // Hide preview line
      setPreviewLine({ visible: false, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
      
      // Position the modal near the target
      setModalPosition({
        x: Math.min(Math.max(position.x * zoom, 100), window.innerWidth - 300),
        y: Math.min(Math.max(position.y * zoom, 100), window.innerHeight - 300)
      });
    }
  };
  
  // Handle relationship type selection
  const handleTypeSelect = (type: RelationshipType) => {
    setCreationState({
      ...creationState,
      state: 'selecting_properties',
      relationType: type
    });
  };
  
  // Handle properties completion
  const handlePropertiesComplete = (properties: {
    name?: string;
    sourceMultiplicity: MultiplicityType;
    targetMultiplicity: MultiplicityType;
  }) => {
    if (
      creationState.state === 'selecting_properties' &&
      creationState.sourceId &&
      creationState.targetId &&
      creationState.relationType
    ) {
      // Create the relationship
      onRelationshipCreate({
        sourceClass: creationState.sourceId,
        targetClass: creationState.targetId,
        relationshipType: creationState.relationType,
        name: properties.name,
        sourceMultiplicity: properties.sourceMultiplicity,
        targetMultiplicity: properties.targetMultiplicity
      });
      
      // Reset to initial state
      setCreationState({ state: isActive ? 'selecting_source' : 'idle' });
    }
  };
  
  // Cancel relationship creation
  const handleCancel = () => {
    setCreationState({ state: isActive ? 'selecting_source' : 'idle' });
    setPreviewLine({ visible: false, start: { x: 0, y: 0 }, end: { x: 0, y: 0 } });
  };
  
  // Reset on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleCancel();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  // If not active, don't render anything
  if (creationState.state === 'idle') {
    return null;
  }
  
  return (
    <>
      {/* Preview line during target selection */}
      {previewLine.visible && (
        <svg 
          className="relationship-creation-line"
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1000
          }}
        >
          <line
            x1={previewLine.start.x * zoom}
            y1={previewLine.start.y * zoom}
            x2={previewLine.end.x * zoom}
            y2={previewLine.end.y * zoom}
            stroke='#3b82f6'
            strokeWidth={2}
            strokeDasharray="5,5"
          />
        </svg>
      )}
      
      {/* Type selection modal */}
      {creationState.state === 'selecting_type' && (
        <RelationshipTypeModal
          onSelect={handleTypeSelect}
          onCancel={handleCancel}
          position={modalPosition}
        />
      )}
      
      {/* Properties modal */}
      {creationState.state === 'selecting_properties' && creationState.relationType && (
        <RelationshipPropertiesModal
          relationType={creationState.relationType}
          onComplete={handlePropertiesComplete}
          onCancel={handleCancel}
          position={modalPosition}
        />
      )}
      
      {/* Instruction overlay */}
      <div 
        style={{
          position: 'absolute',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          color: '#1e293b',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1000
        }}
      >
        {creationState.state === 'selecting_source' ? (
          <div>Click on a source element to start a relationship</div>
        ) : creationState.state === 'selecting_target' ? (
          <div>Click on a target element to connect to</div>
        ) : null}
      </div>
    </>
  );
};

export default RelationshipCreator;
