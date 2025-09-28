/**
 * TypeScript definitions for SpringBoot Code Generation Engine
 * Based on SpringBoot Generator API v1 specification
 */

import { UUID, GenerationType, FrameworkVersion, TemplateType } from './uml';

// Generation Request Status
export enum GenerationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Generation Action Types
export enum GenerationActionType {
  GENERATION_STARTED = 'GENERATION_STARTED',
  GENERATION_COMPLETED = 'GENERATION_COMPLETED',
  GENERATION_FAILED = 'GENERATION_FAILED',
  GENERATION_CANCELLED = 'GENERATION_CANCELLED',
  GENERATION_RETRIED = 'GENERATION_RETRIED',
  PROJECT_DOWNLOADED = 'PROJECT_DOWNLOADED',
  PROJECT_ARCHIVED = 'PROJECT_ARCHIVED',
  PROJECT_RESTORED = 'PROJECT_RESTORED'
}

// Template Category
export enum TemplateCategory {
  WEB_APPLICATION = 'WEB_APPLICATION',
  MICROSERVICE = 'MICROSERVICE',
  REST_API = 'REST_API',
  DATA_SERVICE = 'DATA_SERVICE',
  BATCH_PROCESSING = 'BATCH_PROCESSING',
  SECURITY = 'SECURITY',
  TESTING = 'TESTING',
  EDUCATIONAL = 'EDUCATIONAL',
  CUSTOM = 'CUSTOM'
}

// Template Status
export enum TemplateStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEPRECATED = 'DEPRECATED',
  ARCHIVED = 'ARCHIVED'
}

// Generation Configuration
export interface GenerationConfig {
  javaVersion: string; // '8', '11', '17', '21'
  springBootVersion: string; // '2.7.x', '3.0.x', '3.1.x'
  packageName: string;
  groupId: string;
  artifactId: string;
  projectName: string;
  projectDescription?: string;
  dependencies: string[];
  databaseType?: 'H2' | 'MySQL' | 'PostgreSQL' | 'Oracle' | 'MongoDB';
  buildTool?: 'Maven' | 'Gradle';
  packaging?: 'jar' | 'war';
  enableSecurity?: boolean;
  enableSwagger?: boolean;
  enableActuator?: boolean;
  enableTestContainers?: boolean;
  additionalProperties?: Record<string, any>;
}

// Generation Request
export interface GenerationRequest {
  id: UUID;
  project: UUID;
  diagram: UUID;
  generationType: GenerationType;
  generationConfig: GenerationConfig;
  selectedClasses: UUID[];
  templateOverrides: Record<string, any>;
  status: GenerationStatus;
  progress: number; // 0-100
  currentStep: string;
  estimatedTimeRemaining?: number; // seconds
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
  errorDetails?: Record<string, any>;
  generatedFiles: number;
  totalFiles: number;
  generatedProject?: UUID;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Generated Project
export interface GeneratedProject {
  id: UUID;
  generationRequest: UUID;
  name: string;
  description?: string;
  packageName: string;
  groupId: string;
  artifactId: string;
  springBootVersion: string;
  javaVersion: string;
  buildTool: 'Maven' | 'Gradle';
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  downloadUrl?: string;
  fileSize: number; // bytes
  fileCount: number;
  isArchived: boolean;
  expirationDate: string;
  downloadCount: number;
  lastDownloaded?: string;
  metadata: {
    dependencies: string[];
    features: string[];
    generatedClasses: number;
    generatedTests: number;
    codeQuality: {
      score: number;
      issues: Array<{
        type: 'warning' | 'error' | 'suggestion';
        message: string;
        file?: string;
        line?: number;
      }>;
    };
  };
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

// Generation Template
export interface GenerationTemplate {
  id: UUID;
  name: string;
  description: string;
  category: TemplateCategory;
  templateType: 'SYSTEM' | 'ORGANIZATION' | 'USER' | 'COMMUNITY';
  status: TemplateStatus;
  version: string;
  framework: FrameworkVersion;
  tags: string[];
  configuration: {
    requiredFields: Array<{
      name: string;
      type: string;
      required: boolean;
      defaultValue?: any;
      description?: string;
    }>;
    optionalFields: Array<{
      name: string;
      type: string;
      defaultValue?: any;
      description?: string;
    }>;
    dependencies: string[];
    features: string[];
  };
  templateContent: Record<string, string>; // file path -> template content
  usageCount: number;
  rating: number; // 1-5
  reviews: number;
  isPublic: boolean;
  isFeatured: boolean;
  author: {
    id: number;
    name: string;
    organization?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Generation History Entry
export interface GenerationHistoryEntry {
  id: UUID;
  generationRequest: UUID;
  actionType: GenerationActionType;
  performedBy: number;
  actionData: Record<string, any>;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  metadata: Record<string, any>;
}

// File Structure Node
export interface FileStructureNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileStructureNode[];
  extension?: string;
  mimeType?: string;
  isGenerated: boolean;
  lastModified?: string;
}

// Project File Structure
export interface ProjectFileStructure {
  projectId: UUID;
  rootDirectory: FileStructureNode;
  totalFiles: number;
  totalDirectories: number;
  totalSize: number;
  generatedAt: string;
}

// Generation Progress
export interface GenerationProgress {
  requestId: UUID;
  status: GenerationStatus;
  progress: number; // 0-100
  currentStep: string;
  completedSteps: string[];
  remainingSteps: string[];
  estimatedTimeRemaining?: number; // seconds
  startTime: string;
  elapsedTime: number; // seconds
  generatedFiles: number;
  totalFiles: number;
  currentFile?: string;
  errors: Array<{
    step: string;
    error: string;
    timestamp: string;
  }>;
  warnings: Array<{
    step: string;
    warning: string;
    timestamp: string;
  }>;
}

// Request Types

// Create Generation Request
export interface CreateGenerationRequestRequest {
  project: UUID;
  diagram: UUID;
  generationType: GenerationType;
  generationConfig: GenerationConfig;
  selectedClasses: UUID[];
  templateOverrides?: Record<string, any>;
}

// Update Generation Request
export interface UpdateGenerationRequestRequest {
  generationConfig?: Partial<GenerationConfig>;
  selectedClasses?: UUID[];
  templateOverrides?: Record<string, any>;
}

// Clone Generation Request
export interface CloneGenerationRequestRequest {
  name: string;
  project?: UUID;
  diagram?: UUID;
  generationConfig?: Partial<GenerationConfig>;
}

// Extend Project Expiration
export interface ExtendProjectExpirationRequest {
  days: number; // 1-365
}

// Template Test Render
export interface TemplateTestRenderRequest {
  testData: Record<string, any>;
}

// Template Search
export interface TemplateSearchRequest {
  query: string;
  category?: TemplateCategory[];
  framework?: FrameworkVersion[];
  tags?: string[];
  rating?: {
    min: number;
    max: number;
  };
  sortBy?: 'name' | 'created_at' | 'usage_count' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Statistics Types

// Generation Statistics
export interface GenerationStatistics {
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  averageGenerationTime: number; // seconds
  totalProjectsGenerated: number;
  totalFilesGenerated: number;
  popularTemplates: Array<{
    templateId: UUID;
    templateName: string;
    usageCount: number;
  }>;
  requestsByStatus: Record<GenerationStatus, number>;
  requestsByType: Record<GenerationType, number>;
  requestsByMonth: Array<{
    month: string;
    count: number;
  }>;
  averageProjectSize: number; // bytes
  mostUsedDependencies: Array<{
    name: string;
    count: number;
  }>;
}

// User Generation Activity
export interface UserGenerationActivity {
  userId: number;
  totalRequests: number;
  completedRequests: number;
  failedRequests: number;
  totalDownloads: number;
  favoriteTemplates: Array<{
    templateId: UUID;
    templateName: string;
    usageCount: number;
  }>;
  recentActivity: Array<{
    date: string;
    requestCount: number;
  }>;
}

// Filter Options

// Generation Request Filter Options
export interface GenerationRequestFilterOptions {
  status?: GenerationStatus[];
  generationType?: GenerationType[];
  createdBy?: number[];
  diagram?: UUID;
  project?: UUID;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Generated Project Filter Options
export interface GeneratedProjectFilterOptions {
  status?: ('ACTIVE' | 'ARCHIVED' | 'DELETED')[];
  generatedBy?: number[];
  generationRequest?: UUID;
  isArchived?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  minSize?: number;
  maxSize?: number;
}

// Template Filter Options
export interface TemplateFilterOptions {
  category?: TemplateCategory[];
  templateType?: ('SYSTEM' | 'ORGANIZATION' | 'USER' | 'COMMUNITY')[];
  status?: TemplateStatus[];
  framework?: FrameworkVersion[];
  tags?: string[];
  isPublic?: boolean;
  isFeatured?: boolean;
  rating?: {
    min: number;
    max: number;
  };
  search?: string;
}

// History Filter Options
export interface HistoryFilterOptions {
  actionType?: GenerationActionType[];
  performedBy?: number[];
  generationRequest?: UUID;
  dateFrom?: string;
  dateTo?: string;
}

// Timeline Options
export interface TimelineOptions {
  generationRequest?: UUID;
  days?: number;
  granularity?: 'hour' | 'day' | 'week' | 'month';
}

// Export Options
export interface ExportOptions {
  format: 'json' | 'csv' | 'excel' | 'pdf';
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  includeMetadata?: boolean;
}

// Code Generation State (for Redux)
export interface CodeGenerationState {
  requests: GenerationRequest[];
  projects: GeneratedProject[];
  templates: GenerationTemplate[];
  history: GenerationHistoryEntry[];
  currentRequest?: GenerationRequest;
  currentProject?: GeneratedProject;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  statistics: GenerationStatistics | null;
  filters: {
    requests: GenerationRequestFilterOptions;
    projects: GeneratedProjectFilterOptions;
    templates: TemplateFilterOptions;
    history: HistoryFilterOptions;
  };
}

// Template Validation Result
export interface TemplateValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
  suggestions: Array<{
    field: string;
    message: string;
    autoFix?: boolean;
  }>;
}

// Project Metadata
export interface ProjectMetadata {
  projectId: UUID;
  generationConfig: GenerationConfig;
  statistics: {
    linesOfCode: number;
    testCoverage: number;
    complexity: number;
    dependencies: number;
    endpoints: number;
    entities: number;
  };
  quality: {
    score: number;
    issues: Array<{
      type: 'bug' | 'vulnerability' | 'code_smell';
      severity: 'critical' | 'major' | 'minor' | 'info';
      message: string;
      file: string;
      line?: number;
    }>;
    suggestions: Array<{
      type: 'performance' | 'maintainability' | 'security';
      message: string;
      file?: string;
      autoApplicable: boolean;
    }>;
  };
  documentation: {
    readmeContent: string;
    apiDocumentation: string;
    setupInstructions: string;
    deploymentGuide: string;
  };
}
