/**
 * AI Assistant Components Export Index
 * Central exports for all AI Assistant related components
 */

export { default as AIAssistant } from './AIAssistant';
export { default as QuickQuestions } from './QuickQuestions';
export { default as ResponseDisplay } from './ResponseDisplay';
export { default as LoadingIndicator, MiniLoadingIndicator } from './LoadingIndicator';
export { default as AnalysisPanel } from './AnalysisPanel';
export { default as HealthStatus } from './HealthStatus';

// Re-export types
export type {
  AIAssistantResponse,
  DiagramAnalysis,
  AIStatistics,
  AIHealthStatus,
  AIAssistantRequest,
  AIConversationEntry,
  AIAssistantState,
  QuickQuestion,
  AIAssistantContext,
  AIAssistantEventType,
  AIAssistantEvent,
  ResponseFormatOptions,
  AIAssistantError,
  AIAssistantErrorDetails
} from '@/types/aiAssistant';

// Re-export service
export { aiAssistantService } from '@/services/aiAssistantService';
