/**
 * AI Assistant Types and Interfaces
 * TypeScript definitions for the AI Assistant functionality
 */

export interface AIAssistantResponse {
  answer: string;
  suggestions: string[];
  related_features: string[];
  context_type: string;
  timestamp: string;
}

export interface DiagramAnalysis {
  complexity_score: number;
  completeness: 'low' | 'medium' | 'high';
  springboot_ready: boolean;
  collaboration_active: boolean;
  recommendations: string[];
}

export interface AIStatistics {
  total_diagrams: number;
  diagrams_today: number;
  system_status: string;
}

export interface AIHealthStatus {
  status: string;
  service: string;
  timestamp: string;
  error?: string;
}

export interface AIAssistantRequest {
  question: string;
  diagram_id?: string | null;
  context_type?: 'general' | 'diagram' | 'code-generation';
}

export interface AIConversationEntry {
  id: string;
  timestamp: Date;
  question: string;
  response: AIAssistantResponse;
  context_mode: 'general' | 'diagram';
  user_rating?: 1 | 2 | 3 | 4 | 5;
}

export interface AIAssistantState {
  isOpen: boolean;
  isLoading: boolean;
  currentQuestion: string;
  currentResponse: AIAssistantResponse | null;
  analysisData: DiagramAnalysis | null;
  contextMode: 'general' | 'diagram';
  quickSuggestions: string[];
  conversationHistory: AIConversationEntry[];
  error: string | null;
  isConnected: boolean;
}

export interface QuickQuestion {
  id: string;
  text: string;
  category: 'getting_started' | 'diagram_design' | 'code_generation' | 'troubleshooting' | 'best_practices';
  contextRelevant: boolean;
  icon?: string;
}

export interface AIAssistantContext {
  diagramNodes: any[];
  diagramEdges: any[];
  currentAction: string | null;
  hasUnsavedChanges: boolean;
  isCollaborating: boolean;
  errorMessages: string[];
  lastUserAction: {
    type: string;
    timestamp: Date;
    details?: any;
  } | null;
  voiceRecognitionState?: VoiceRecognitionState;
  commandHistory?: CommandHistoryEntry[];
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
  };
}

export type AIAssistantEventType = 
  | 'question_asked'
  | 'response_received' 
  | 'context_changed'
  | 'analysis_requested'
  | 'feedback_provided'
  | 'error_occurred';

export interface AIAssistantEvent {
  type: AIAssistantEventType;
  payload: any;
  timestamp: Date;
}

// Response formatting options
export interface ResponseFormatOptions {
  includeCodeExamples: boolean;
  includeRelatedFeatures: boolean;
  includeSuggestions: boolean;
  enableMarkdown: boolean;
  maxLength?: number;
}

// Error types for AI Assistant
export type AIAssistantError = 
  | 'network_error'
  | 'rate_limit_exceeded'
  | 'invalid_request'
  | 'service_unavailable'
  | 'parsing_error'
  | 'timeout_error';

export interface AIAssistantErrorDetails {
  type: AIAssistantError;
  message: string;
  code?: string;
  retryable: boolean;
  retryAfter?: number; // seconds
}

// Natural Language Command Processing Types
export interface NaturalLanguageCommandRequest {
  command: string;
  diagram_id?: string | null;
  current_diagram_data?: {
    nodes: any[];
    edges: any[];
  } | null;
}

export interface NaturalLanguageCommandResponse {
  success: boolean;
  message: string;
  elements_generated: UMLElementRecommendation[];
  command_interpretation: string;
  suggestions: string[];
  rate_limit_info: {
    remaining: number;
    reset_time: number;
  };
  metadata?: {
    model_used: string;
    response_time: number;
    cost_estimate: number;
  };
}

export interface UMLElementRecommendation {
  id: string;
  element_type: 'class' | 'interface' | 'enum' | 'relationship' | 'attribute' | 'method';
  element_data: any;
  position: {
    x: number;
    y: number;
  };
  confidence_score: number;
  explanation: string;
  dependencies?: string[]; // IDs of other elements this depends on
}

// Voice Recognition Types
export interface VoiceRecognitionState {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  confidence: number;
  error?: string;
}

export interface VoiceCommand {
  text: string;
  confidence: number;
  timestamp: Date;
  processed: boolean;
}

// Command History Types
export interface CommandHistoryEntry {
  id: string;
  command: string;
  timestamp: Date;
  success: boolean;
  elementsGenerated: number;
  processingTime: number;
  errorMessage?: string;
}

// Preview Types
export interface ElementPreview {
  id: string;
  type: 'node' | 'edge';
  data: any;
  style?: any;
  isValid: boolean;
  conflicts?: string[];
}

// Integration Types
export interface DiagramUpdateEvent {
  type: 'nodes_added' | 'edges_added' | 'nodes_updated' | 'edges_updated';
  elements: any[];
  source: 'manual' | 'ai_generated' | 'collaboration';
  timestamp: Date;
}
