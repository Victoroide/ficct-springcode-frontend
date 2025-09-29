/**
 * UML Editor Types
 * Core type definitions for UML diagrams and React Flow components
 */

import type { Node, Edge } from 'reactflow';

/**
 * UML Node types
 */
export type UMLNodeType = 'class' | 'interface' | 'enum' | 'abstractClass' | 'record';

/**
 * UML Node data interface
 */
export interface UMLNodeData {
  id?: string;
  label: string;
  nodeType?: UMLNodeType;
  position?: { x: number; y: number };
  attributes?: UMLAttribute[];
  methods?: UMLMethod[];
  enumValues?: UMLEnumValue[];
  isAbstract?: boolean;
  package?: string;
}

/**
 * UML Node Attribute
 */
export interface UMLAttribute {
  id: string;
  name: string;
  type: string;
  visibility: UMLVisibility;
  isStatic: boolean;
  isFinal?: boolean;
  defaultValue?: string;
}

/**
 * UML Node Method
 */
export interface UMLMethod {
  id: string;
  name: string;
  parameters: UMLParameter[];
  returnType: string;
  visibility: UMLVisibility;
  isStatic: boolean;
  isAbstract?: boolean;
}

/**
 * UML Method Parameter
 */
export interface UMLParameter {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
}

/**
 * UML Enum Value
 */
export interface UMLEnumValue {
  id: string;
  name: string;
  value?: string;
}

/**
 * UML Edge (Relationship) data
 */
export interface UMLEdgeData {
  relationshipType: UMLRelationshipType;
  sourceMultiplicity?: string;
  targetMultiplicity?: string;
  label?: string;
}

/**
 * UML Relationship types
 */
export type UMLRelationshipType = 'ASSOCIATION' | 'INHERITANCE' | 'IMPLEMENTATION' | 'DEPENDENCY' | 'AGGREGATION' | 'COMPOSITION' | 'REALIZATION';

/**
 * UML Visibility modifiers
 */
export type UMLVisibility = 'public' | 'private' | 'protected' | 'package';

/**
 * Editor modes for toolbar selection
 */
export type EditorMode = 'select' | 'pan' | 'connect' | 'create-class' | 'create-interface' | 'create-enum' | 'class' | 'interface' | 'enum';

/**
 * UML Node with typed data
 */
export type UMLNode = Node<UMLNodeData>;

/**
 * UML Edge with typed data
 */
export type UMLEdge = Edge<UMLEdgeData>;

/**
 * Generate a unique ID for UML elements
 */
export const generateId = (): string => {
  return `id-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};
