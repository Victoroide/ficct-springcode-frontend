/**
 * AttributeRelationshipContext.tsx
 * Contexto para manejar la creación de relaciones entre atributos
 */

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { RelationshipType } from '../types/relationships';

interface AttributeRelationshipContextType {
  // Modo de creación de relaciones entre atributos
  isCreatingAttributeRelationship: boolean;
  sourceNodeId: string | null;
  sourceAttributeId: string | null;
  sourceSide: 'left' | 'right' | null;
  relationshipType: RelationshipType | null;
  
  // Funciones de control
  startAttributeRelationship: (
    nodeId: string, 
    attributeId: string, 
    side: 'left' | 'right',
    relType: RelationshipType
  ) => void;
  cancelAttributeRelationship: () => void;
  completeAttributeRelationship: (
    targetNodeId: string, 
    targetAttributeId: string, 
    targetSide: 'left' | 'right'
  ) => {
    sourceNodeId: string;
    sourceAttributeId: string;
    targetNodeId: string;
    targetAttributeId: string;
    relationshipType: RelationshipType;
    sourceSide: 'left' | 'right';
    targetSide: 'left' | 'right';
  } | null;
}

// Crear el contexto
const AttributeRelationshipContext = createContext<AttributeRelationshipContextType | null>(null);

// Provider component
export const AttributeRelationshipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCreatingAttributeRelationship, setIsCreatingAttributeRelationship] = useState(false);
  const [sourceNodeId, setSourceNodeId] = useState<string | null>(null);
  const [sourceAttributeId, setSourceAttributeId] = useState<string | null>(null);
  const [sourceSide, setSourceSide] = useState<'left' | 'right' | null>(null);
  const [relationshipType, setRelationshipType] = useState<RelationshipType | null>(null);
  
  // Iniciar creación de una relación desde un atributo
  const startAttributeRelationship = useCallback((
    nodeId: string, 
    attributeId: string, 
    side: 'left' | 'right',
    relType: RelationshipType
  ) => {
    setIsCreatingAttributeRelationship(true);
    setSourceNodeId(nodeId);
    setSourceAttributeId(attributeId);
    setSourceSide(side);
    setRelationshipType(relType);
  }, []);
  
  // Cancelar la creación de una relación
  const cancelAttributeRelationship = useCallback(() => {
    setIsCreatingAttributeRelationship(false);
    setSourceNodeId(null);
    setSourceAttributeId(null);
    setSourceSide(null);
    setRelationshipType(null);
  }, []);
  
  // Completar la creación de una relación
  const completeAttributeRelationship = useCallback((
    targetNodeId: string,
    targetAttributeId: string,
    targetSide: 'left' | 'right'
  ) => {
    if (!isCreatingAttributeRelationship || !sourceNodeId || !sourceAttributeId || !relationshipType || !sourceSide) {
      return null;
    }
    
    // Crear objeto con la información de la relación
    const relationshipData = {
      sourceNodeId,
      sourceAttributeId,
      targetNodeId,
      targetAttributeId,
      relationshipType,
      sourceSide,
      targetSide
    };
    
    // Limpiar el estado
    cancelAttributeRelationship();
    
    return relationshipData;
  }, [isCreatingAttributeRelationship, sourceNodeId, sourceAttributeId, relationshipType, sourceSide, cancelAttributeRelationship]);
  
  // Proveer el contexto
  const value = {
    isCreatingAttributeRelationship,
    sourceNodeId,
    sourceAttributeId,
    sourceSide,
    relationshipType,
    startAttributeRelationship,
    cancelAttributeRelationship,
    completeAttributeRelationship
  };
  
  return (
    <AttributeRelationshipContext.Provider value={value}>
      {children}
    </AttributeRelationshipContext.Provider>
  );
};

// Hook para usar el contexto
export const useAttributeRelationship = () => {
  const context = useContext(AttributeRelationshipContext);
  if (!context) {
    throw new Error('useAttributeRelationship must be used within an AttributeRelationshipProvider');
  }
  return context;
};

export default AttributeRelationshipContext;
