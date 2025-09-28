/**
 * TypeScript definitions for UML Diagram Designer and Code Generation
 * Based on SpringBoot Generator API v1 specification
 */

// Base types and enums
export type UUID = string;

// UML Class Types
export enum UMLClassType {
  CLASS = 'CLASS',
  ABSTRACTCLASS = 'ABSTRACTCLASS',
  INTERFACE = 'INTERFACE',
  ENUM = 'ENUM',
  RECORD = 'RECORD'
}

// UML Relationship Types
export enum UMLRelationshipType {
  ASSOCIATION = 'ASSOCIATION',
  AGGREGATION = 'AGGREGATION',
  COMPOSITION = 'COMPOSITION',
  INHERITANCE = 'INHERITANCE',
  REALIZATION = 'REALIZATION',
  DEPENDENCY = 'DEPENDENCY',
  GENERALIZATION = 'GENERALIZATION'
}

// Visibility Types
export enum Visibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PROTECTED = 'protected'
}

// Multiplicity Types
export enum Multiplicity {
  ZERO_OR_ONE = '0..1',
  ONE = '1',
  ZERO_OR_MANY = '0..*',
  ONE_OR_MANY = '1..*',
  MANY = '*'
}

// Generation Types
export enum GenerationType {
  FULL_PROJECT = 'FULL_PROJECT',
  ENTITIES_ONLY = 'ENTITIES_ONLY',
  REPOSITORIES_ONLY = 'REPOSITORIES_ONLY',
  SERVICES_ONLY = 'SERVICES_ONLY',
  CONTROLLERS_ONLY = 'CONTROLLERS_ONLY',
  CUSTOM = 'CUSTOM'
}

// Framework Versions
export enum FrameworkVersion {
  SPRING_BOOT_2 = 'SPRING_BOOT_2',
  SPRING_BOOT_3 = 'SPRING_BOOT_3'
}

// Template Types
export enum TemplateType {
  ENTITY = 'ENTITY',
  REPOSITORY = 'REPOSITORY',
  SERVICE = 'SERVICE',
  CONTROLLER = 'CONTROLLER',
  CONFIG = 'CONFIG',
  MAIN_CLASS = 'MAIN_CLASS'
}

// Session Status
export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED'
}

// Participant Roles
export enum ParticipantRole {
  HOST = 'HOST',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
  COMMENTER = 'COMMENTER'
}

// Project Status
export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  DELETED = 'DELETED',
  SUSPENDED = 'SUSPENDED'
}

// Project Visibility
export enum ProjectVisibility {
  PRIVATE = 'PRIVATE',
  TEAM = 'TEAM',
  ORGANIZATION = 'ORGANIZATION',
  PUBLIC = 'PUBLIC'
}

// UML Attribute Definition
export interface UMLAttribute {
  id?: UUID;
  name: string;
  type: string;
  visibility: Visibility;
  defaultValue?: string;
  isStatic?: boolean;
  isFinal?: boolean;
  description?: string;
}

// UML Method Parameter
export interface UMLMethodParameter {
  name: string;
  type: string;
  defaultValue?: string;
  description?: string;
}

// UML Method Definition
export interface UMLMethod {
  id?: UUID;
  name: string;
  returnType: string;
  visibility: Visibility;
  parameters: UMLMethodParameter[];
  isStatic?: boolean;
  isAbstract?: boolean;
  isFinal?: boolean;
  description?: string;
}

// UML Element (Class, Interface, Enum, etc.)
export interface UMLElement {
  id: UUID;
  diagram: UUID;
  classType: UMLClassType;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  attributes: UMLAttribute[];
  methods: UMLMethod[];
  description?: string;
  packageName?: string;
  stereotypes?: string[];
  isAbstract?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  lastModifiedBy: number;
}

// UML Relationship
export interface UMLRelationship {
  id: UUID;
  diagram: UUID;
  sourceClass: UUID;
  targetClass: UUID;
  relationshipType: UMLRelationshipType;
  name?: string;
  sourceMultiplicity?: Multiplicity;
  targetMultiplicity?: Multiplicity;
  sourceRole?: string;
  targetRole?: string;
  description?: string;
  connectionPath?: Array<{ x: number; y: number }>;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

// UML Diagram
export interface UMLDiagram {
  id: UUID;
  project: UUID;
  name: string;
  description?: string;
  diagramType: string;
  canvas: {
    width: number;
    height: number;
    zoom: number;
    offsetX: number;
    offsetY: number;
  };
  elements: UMLElement[];
  relationships: UMLRelationship[];
  metadata: Record<string, any>;
  version: number;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  lastModifiedBy: number;
}

// Project Member
export interface ProjectMember {
  id: number;
  user: number;
  role: 'VIEWER' | 'EDITOR' | 'DEVELOPER' | 'MAINTAINER' | 'ADMIN' | 'OWNER';
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED';
  joinedAt: string;
  invitedBy: number;
  permissions: Record<string, boolean>;
}

// Project
export interface Project {
  id: UUID;
  name: string;
  description?: string;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  owner: number;
  members: ProjectMember[];
  settings: Record<string, any>;
  statistics: {
    totalDiagrams: number;
    totalElements: number;
    totalCollaborators: number;
    lastActivity: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Request/Response Types for API calls

// UML Element Creation Request
export interface UMLElementCreateRequest {
  diagram: UUID;
  classType: UMLClassType;
  name: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  description?: string;
  packageName?: string;
}

// UML Element Update Request
export interface UMLElementUpdateRequest {
  name?: string;
  description?: string;
  packageName?: string;
}

// UML Element Move Request
export interface UMLElementMoveRequest {
  x: number;
  y: number;
  snapToGrid?: boolean;
}

// UML Element Resize Request
export interface UMLElementResizeRequest {
  width: number;
  height: number;
  maintainAspectRatio?: boolean;
}

// Add Attribute Request
export interface AddAttributeRequest {
  name: string;
  type: string;
  visibility: Visibility;
  defaultValue?: string;
}

// Add Method Request
export interface AddMethodRequest {
  name: string;
  returnType: string;
  visibility: Visibility;
  parameters: UMLMethodParameter[];
}

// UML Relationship Creation Request
export interface UMLRelationshipCreateRequest {
  diagram: UUID;
  sourceClass: UUID;
  targetClass: UUID;
  relationshipType: UMLRelationshipType;
  name?: string;
  sourceMultiplicity?: Multiplicity;
  targetMultiplicity?: Multiplicity;
}

// UML Diagram Creation Request
export interface UMLDiagramCreateRequest {
  project: UUID;
  name: string;
  description?: string;
  diagramType?: string;
}

// UML Diagram Update Request
export interface UMLDiagramUpdateRequest {
  name?: string;
  description?: string;
  canvas?: {
    width?: number;
    height?: number;
    zoom?: number;
    offsetX?: number;
    offsetY?: number;
  };
}

// Clone Diagram Request
export interface CloneDiagramRequest {
  name: string;
  project?: UUID;
  description?: string;
}

// Create Version Request
export interface CreateVersionRequest {
  comment: string;
  description?: string;
}

// Diagram Statistics Response
export interface DiagramStatistics {
  elementCount: number;
  relationshipCount: number;
  complexity: number;
  completeness: number;
  validationScore: number;
  lastModified: string;
  collaboratorCount: number;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    type: string;
    message: string;
    elementId?: UUID;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    type: string;
    message: string;
    elementId?: UUID;
  }>;
  score: number;
}

// Export Data Response
export interface ExportDataResponse {
  format: 'plantuml' | 'json' | 'xml';
  content: string;
  metadata: Record<string, any>;
}

// API Response Wrappers
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface APIResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, any>;
  timestamp: string;
}
