export type UMLNodeType = 'class' | 'interface' | 'enum' | 'abstractClass';

export type UMLVisibilityType = 'public' | 'private' | 'protected' | 'package';

export enum UMLVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
  PACKAGE = 'package'
}

export type UMLRelationshipType = 
  'ASSOCIATION' | 
  'INHERITANCE' | 
  'IMPLEMENTATION' | 
  'DEPENDENCY' | 
  'AGGREGATION' | 
  'COMPOSITION';

export type EditorMode = 'select' | 'class' | 'interface' | 'enum' | 'relationship' | 'pan';

export interface UMLAttribute {
  id: string;
  name: string;
  type: string;
  visibility: UMLVisibilityType;
  isStatic?: boolean;
  isFinal?: boolean;
}

export interface UMLMethodParameter {
  id: string;
  name: string;
  type: string;
}

export interface UMLMethod {
  id: string;
  name: string;
  returnType: string;
  visibility: UMLVisibilityType;
  parameters: string; // Mantenemos string para compatibilidad
  parameterList?: UMLMethodParameter[]; // Nuevo campo para manejar parámetros estructurados
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface UMLEnumValue {
  id: string;
  name: string;
}

export interface UMLNodeData {
  label: string;
  nodeType: UMLNodeType;
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  isAbstract?: boolean;
  enumValues?: UMLEnumValue[];
}

export interface UMLEdgeData {
  relationshipType: UMLRelationshipType;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  label?: string;
}

// Utility function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};
