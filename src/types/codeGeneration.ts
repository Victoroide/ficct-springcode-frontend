/**
 * Types for SpringBoot code generation functionality
 */

import type { UMLNodeData, UMLRelationshipType } from '../components/uml-flow/types';

// Supported programming languages
export enum ProgrammingLanguage {
  JAVA = 'java',
  KOTLIN = 'kotlin',
}

// SpringBoot project configuration
export interface SpringBootProjectConfig {
  name: string;
  description: string;
  groupId: string;
  artifactId: string;
  version: string;
  javaVersion: '8' | '11' | '17' | '21';
  packaging: 'jar' | 'war';
  dependencies: SpringBootDependency[];
  language: ProgrammingLanguage;
  generateSampleData: boolean;
}

// SpringBoot dependencies
export interface SpringBootDependency {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
}

// Available dependencies for SpringBoot
export const AVAILABLE_DEPENDENCIES: SpringBootDependency[] = [
  {
    id: 'web',
    name: 'Spring Web',
    description: 'Build web applications using Spring MVC with embedded Tomcat.',
    category: 'Web',
    required: true,
  },
  {
    id: 'data-jpa',
    name: 'Spring Data JPA',
    description: 'Persist data in SQL stores with Java Persistence API using Spring Data and Hibernate.',
    category: 'SQL',
    required: true,
  },
  {
    id: 'security',
    name: 'Spring Security',
    description: 'Highly customizable authentication and access-control framework.',
    category: 'Security',
    required: false,
  },
  {
    id: 'devtools',
    name: 'Spring Boot DevTools',
    description: 'Provides fast application restarts, LiveReload, and configurations for enhanced development experience.',
    category: 'Developer Tools',
    required: false,
  },
  {
    id: 'validation',
    name: 'Validation',
    description: 'Bean Validation with Hibernate validator.',
    category: 'I/O',
    required: false,
  },
  {
    id: 'actuator',
    name: 'Spring Boot Actuator',
    description: 'Monitoring, metrics, and management endpoints for your application.',
    category: 'Ops',
    required: false,
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL Driver',
    description: 'PostgreSQL JDBC driver.',
    category: 'SQL',
    required: false,
  },
  {
    id: 'mysql',
    name: 'MySQL Driver',
    description: 'MySQL JDBC driver.',
    category: 'SQL',
    required: false,
  },
  {
    id: 'h2',
    name: 'H2 Database',
    description: 'H2 database (with embedded support).',
    category: 'SQL',
    required: false,
  },
  {
    id: 'lombok',
    name: 'Lombok',
    description: 'Java annotation library which helps to reduce boilerplate code.',
    category: 'Developer Tools',
    required: false,
  },
  {
    id: 'openapi',
    name: 'OpenAPI',
    description: 'Generate OpenAPI 3 documentation for your REST API.',
    category: 'Web',
    required: false,
  }
];

// Code generation result
export interface CodeGenerationResult {
  success: boolean;
  errorMessage?: string;
  files: GeneratedFile[];
  projectStructure: ProjectStructure;
  downloadUrl?: string;
}

// Generated file
export interface GeneratedFile {
  path: string;
  content: string;
  language: ProgrammingLanguage | 'xml' | 'properties' | 'yml' | 'md' | 'other';
}

// Project structure
export interface ProjectStructure {
  rootDir: string;
  sourceDir: string;
  testDir: string;
  resourcesDir: string;
  directories: ProjectDirectory[];
}

// Project directory
export interface ProjectDirectory {
  path: string;
  name: string;
  files: string[];
  subdirectories?: ProjectDirectory[];
}

// Java class types for code generation
export enum JavaClassType {
  ENTITY = 'entity',
  DTO = 'dto',
  REPOSITORY = 'repository',
  SERVICE = 'service',
  CONTROLLER = 'controller',
  EXCEPTION = 'exception',
  UTIL = 'util',
  CONFIG = 'config',
  ENUM = 'enum'
}

// Class descriptor for code generation
export interface JavaClassDescriptor {
  name: string;
  packageName: string;
  type: JavaClassType;
  fields: JavaFieldDescriptor[];
  methods: JavaMethodDescriptor[];
  imports: string[];
  annotations: string[];
  extends?: string;
  implements?: string[];
  isAbstract: boolean;
  visibility: 'public' | 'protected' | 'private' | 'package';
  documentation?: string;
}

// Field descriptor
export interface JavaFieldDescriptor {
  name: string;
  type: string;
  visibility: 'public' | 'protected' | 'private';
  isStatic: boolean;
  isFinal: boolean;
  annotations: string[];
  defaultValue?: string;
  documentation?: string;
  relation?: {
    type: UMLRelationshipType;
    targetClass: string;
    multiplicity?: string;
  };
}

// Method descriptor
export interface JavaMethodDescriptor {
  name: string;
  returnType: string;
  visibility: 'public' | 'protected' | 'private';
  isStatic: boolean;
  isAbstract: boolean;
  parameters: JavaParameterDescriptor[];
  annotations: string[];
  throws?: string[];
  body?: string;
  documentation?: string;
}

// Parameter descriptor
export interface JavaParameterDescriptor {
  name: string;
  type: string;
  annotations: string[];
  defaultValue?: string;
}

// UML to Java code mappings
export interface UMLToJavaMapping {
  nodes: Map<string, JavaClassDescriptor>;
  relationships: Map<string, {
    source: string;
    target: string;
    type: UMLRelationshipType;
    sourceMultiplicity?: string;
    targetMultiplicity?: string;
  }>;
}

// Mapping from UML node type to Java class type
export const UML_TO_JAVA_TYPE_MAPPING = {
  [JavaClassType.ENTITY]: 'class',
  [JavaClassType.DTO]: 'class',
  [JavaClassType.REPOSITORY]: 'interface',
  [JavaClassType.SERVICE]: 'class',
  [JavaClassType.CONTROLLER]: 'class',
  [JavaClassType.EXCEPTION]: 'class',
  [JavaClassType.UTIL]: 'class',
  [JavaClassType.CONFIG]: 'class',
  [JavaClassType.ENUM]: 'enum'
};

// Function to convert primitive type names
export function mapPrimitiveType(umlType: string): string {
  const typeMap: Record<string, string> = {
    'int': 'Integer',
    'integer': 'Integer',
    'long': 'Long',
    'double': 'Double',
    'float': 'Float',
    'boolean': 'Boolean',
    'char': 'Character',
    'byte': 'Byte',
    'short': 'Short',
    'string': 'String',
    'date': 'java.util.Date',
    'localdate': 'java.time.LocalDate',
    'localdatetime': 'java.time.LocalDateTime',
    'bigdecimal': 'java.math.BigDecimal',
    'biginteger': 'java.math.BigInteger',
    'uuid': 'java.util.UUID',
  };
  
  const lowercaseType = umlType.toLowerCase();
  return typeMap[lowercaseType] || umlType;
}
