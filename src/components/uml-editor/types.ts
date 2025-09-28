/**
 * UML Editor Type Definitions
 */

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface UMLParameter {
  id: string;
  name: string;
  type: string;
}

export interface UMLAttribute {
  id: string;
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
  defaultValue?: string;
  isStatic?: boolean;
  isFinal?: boolean;
}

export interface UMLMethod {
  id: string;
  name: string;
  returnType: string;
  visibility: 'public' | 'private' | 'protected';
  parameters: UMLParameter[];
  isStatic?: boolean;
  isAbstract?: boolean;
}

export interface UMLClass {
  id: string;
  name: string;
  classType: 'CLASS' | 'ABSTRACTCLASS' | 'INTERFACE' | 'ENUM' | 'RECORD';
  position: Point;
  dimensions: Dimensions;
  attributes: UMLAttribute[];
  methods: UMLMethod[];
}

export type RelationshipType = 
  'ASSOCIATION' | 
  'AGGREGATION' | 
  'COMPOSITION' | 
  'INHERITANCE' | 
  'REALIZATION' | 
  'DEPENDENCY' | 
  'GENERALIZATION';

export type MultiplicityType = '0..1' | '1' | '0..' | '1..' | '';

export interface UMLRelationship {
  id: string;
  sourceClass: string; // UUID
  targetClass: string; // UUID
  relationshipType: RelationshipType;
  sourceMultiplicity?: MultiplicityType;
  targetMultiplicity?: MultiplicityType;
  name?: string;
  connectionPath: Point[];
}

export interface UMLEditorThemeProps {
  theme: 'light' | 'dark';
  canvasBackground: string;
  gridColor: string;
  elementColors: {
    class: { background: string; border: string; text: string; header: string; };
    interface: { background: string; border: string; text: string; header: string; };
    abstract: { background: string; border: string; text: string; header: string; };
    enum: { background: string; border: string; text: string; header: string; };
    record: { background: string; border: string; text: string; header: string; };
  };
  relationshipColors: {
    association: string;
    inheritance: string;
    composition: string;
    aggregation: string;
    dependency: string;
    realization: string;
    generalization: string;
  };
  selectionColor: string;
  hoverColor: string;
}
