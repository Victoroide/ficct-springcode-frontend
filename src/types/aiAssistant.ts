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
