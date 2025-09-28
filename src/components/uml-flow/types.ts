/**
 * UML Flow Editor - Type definitions
 */

// Usar una declaración de tipo para evitar las importaciones
// Ya que Node y Edge son tipos genéricos, podemos definirlos aquí
import type { ReactFlowJsonObject } from 'reactflow';

// Definir Node y Edge localmente basándonos en los tipos genéricos de ReactFlow
type NodeData = any;
type EdgeData = any;

type NodeType = {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: NodeData;
  [key: string]: any;
};

type EdgeType = {
  id: string;
  source: string;
  target: string;
  type?: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  data?: EdgeData;
  [key: string]: any;
};

// UML Node Types
export enum UMLNodeType {
  CLASS = 'class',
  INTERFACE = 'interface',
  ABSTRACT_CLASS = 'abstractClass',
  ENUM = 'enum',
  RECORD = 'record'
}

// UML Relationship Types
export enum UMLRelationshipType {
  ASSOCIATION = 'association',
  AGGREGATION = 'aggregation',
  COMPOSITION = 'composition',
  INHERITANCE = 'inheritance',
  IMPLEMENTATION = 'implementation',
  DEPENDENCY = 'dependency'
}

// UML Visibility Types
export enum UMLVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected',
  PACKAGE = 'package'
}

// UML Multiplicity Types
export enum UMLMultiplicity {
  ZERO_OR_ONE = '0..1',
  ONE = '1',
  ZERO_OR_MANY = '0..*',
  ONE_OR_MANY = '1..*',
  MANY = '*',
  CUSTOM = 'custom'
}

// UML Attribute
export interface UMLAttribute {
  id: string;
  name: string;
  type: string;
  visibility: UMLVisibility;
  isStatic: boolean;
  isFinal: boolean;
  defaultValue?: string;
}

// UML Method Parameter
export interface UMLMethodParameter {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
}

// UML Method
export interface UMLMethod {
  id: string;
  name: string;
  returnType: string;
  parameters: UMLMethodParameter[];
  visibility: UMLVisibility;
  isStatic: boolean;
  isAbstract: boolean;
}

// UML Enum Value
export interface UMLEnumValue {
  id: string;
  name: string;
  value?: string;
}

// UML Node Data
export interface UMLNodeData {
  label: string;
  nodeType: UMLNodeType;
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  enumValues?: UMLEnumValue[];
  isAbstract?: boolean;
  implementsInterfaces?: string[];
  extendsClass?: string;
}

// Extended Node type for React Flow with UML data
export type UMLNode = NodeType & { data: UMLNodeData };

// UML Edge Data
export interface UMLEdgeData {
  relationshipType: UMLRelationshipType;
  sourceMultiplicity?: UMLMultiplicity;
  targetMultiplicity?: UMLMultiplicity;
  sourceLabel?: string;
  targetLabel?: string;
  customSourceMultiplicity?: string;
  customTargetMultiplicity?: string;
}

// Extended Edge type for React Flow with UML data
export type UMLEdge = EdgeType & { data: UMLEdgeData };

// Editor Mode
export type EditorMode = 'select' | 'pan' | 'connect' | 'class' | 'interface' | 'abstractClass' | 'enum' | 'record';

// Generate unique ID
export const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
