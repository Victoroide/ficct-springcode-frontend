/**
 * Tipos específicos para relaciones entre atributos
 * y manejo de relaciones a nivel de atributos
 */

// Tipo para puntos de control en las relaciones
export interface Point {
  x: number;
  y: number;
}

export interface AttributeRelationship {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  sourceAttributeId: string; // ID del atributo origen
  targetAttributeId: string; // ID del atributo destino
  relationshipType: RelationshipType;
  sourceMultiplicity: Multiplicity;
  targetMultiplicity: Multiplicity;
  label?: string;
  // Propiedades visuales para personalización
  style?: {
    strokeColor?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  };
  // Puntos de control para curvas personalizadas
  controlPoints?: Point[];
  // Posición específica de los handles (izquierda/derecha)
  sourcePosition?: 'left' | 'right';
  targetPosition?: 'left' | 'right';
}

export type RelationshipType = 
  | 'ASSOCIATION' 
  | 'INHERITANCE' 
  | 'REALIZATION' 
  | 'AGGREGATION' 
  | 'COMPOSITION' 
  | 'DEPENDENCY';

export type Multiplicity = '1' | '0..1' | '0..*' | '1..*' | '*' | '';

export interface AttributeField {
  id: string;
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected' | 'package';
  isStatic: boolean;
  isFinal: boolean;
  defaultValue?: string;
  annotations?: string[];
  // Propiedades para relaciones
  isRelationshipField?: boolean;
  relatedClassName?: string;
  mappedBy?: string; // Para @OneToMany, @OneToOne
  joinColumn?: string; // Para @ManyToOne, @OneToOne
}

export interface RelationshipCreationMode {
  isActive: boolean;
  sourceNodeId?: string;
  sourceAttributeId?: string;
  relationshipType?: RelationshipType;
}
