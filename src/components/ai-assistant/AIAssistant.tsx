/**
 * AI Assistant Main Component
 * Complete AI Assistant implementation with expandable interface and context awareness
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed Tabs import - using custom tab implementation
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
// Removed Dialog imports - using completely custom modal
import {
  Brain,
  MessageCircle,
  Send,
  X,
  Maximize2,
  Minimize2,
  BarChart3,
  Settings,
  HelpCircle,
  Sparkles,
  AlertCircle
} from 'lucide-react';

// Import AI Assistant components
import QuickQuestions from './QuickQuestions';
import ResponseDisplay from './ResponseDisplay';
import LoadingIndicator, { MiniLoadingIndicator } from './LoadingIndicator';
import AnalysisPanel from './AnalysisPanel';
import HealthStatus from './HealthStatus';

// Import services and types
import { aiAssistantService } from '@/services/aiAssistantService';
import type { 
  AIAssistantState, 
  AIAssistantResponse, 
  DiagramAnalysis,
  AIAssistantContext,
  AIConversationEntry,
  AIHealthStatus,
  AIAssistantErrorDetails
} from '@/types/aiAssistant';

interface AIAssistantProps {
  // Context from parent diagram editor
  diagramId?: string;
  diagramNodes?: any[];
  diagramEdges?: any[];
  currentAction?: string;
  hasUnsavedChanges?: boolean;
  isCollaborating?: boolean;
  onFeatureNavigation?: (feature: string) => void;
  className?: string;
  // Controlled state from parent
  isOpen?: boolean;
  onToggle?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({
  diagramId,
  diagramNodes = [],
  diagramEdges = [],
  currentAction,
  hasUnsavedChanges = false,
  isCollaborating = false,
  onFeatureNavigation,
  className = '',
  isOpen: externalIsOpen,
  onToggle
}) => {
  // Main state
  const [state, setState] = useState<AIAssistantState>({
    isOpen: externalIsOpen ?? false,
    isLoading: false,
    currentQuestion: '',
    currentResponse: null,
    analysisData: null,
    contextMode: 'general',
    quickSuggestions: [],
    conversationHistory: [],
    error: null,
    isConnected: true
  });

  // Sync external state
  useEffect(() => {
    if (externalIsOpen !== undefined) {
      setState(prev => ({ ...prev, isOpen: externalIsOpen }));
    }
  }, [externalIsOpen]);

  // UI state
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'health'>('chat');
  const [healthStatus, setHealthStatus] = useState<AIHealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Refs
  const questionInputRef = useRef<HTMLInputElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { toast } = useToast();

  // Context detection
  const context: AIAssistantContext = useMemo(() => ({
    diagramNodes,
    diagramEdges,
    currentAction,
    hasUnsavedChanges,
    isCollaborating,
    errorMessages: [], // Could be populated from parent component
    lastUserAction: null // Could be tracked from parent component
  }), [diagramNodes, diagramEdges, currentAction, hasUnsavedChanges, isCollaborating]);

  // Auto-detect context mode
  useEffect(() => {
    const hasContent = diagramNodes.length > 0 || diagramEdges.length > 0;
    const newMode = hasContent && diagramId ? 'diagram' : 'general';
    
    if (newMode !== state.contextMode) {
      setState(prev => ({ 
        ...prev, 
        contextMode: newMode,
        quickSuggestions: aiAssistantService.getContextualSuggestions(context)
      }));
    }
  }, [diagramNodes.length, diagramEdges.length, diagramId, context, state.contextMode]);

  // Update quick suggestions when context changes
  useEffect(() => {
    const suggestions = aiAssistantService.getContextualSuggestions(context);
    setState(prev => ({ ...prev, quickSuggestions: suggestions }));
  }, [context]);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (conversationEndRef.current && state.conversationHistory.length > 0) {
      conversationEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.conversationHistory.length]);

  useEffect(() => {
    checkHealth();
  }, []);

  // Debounced input handling
  const handleQuestionChange = useCallback((value: string) => {
    console.log('Input changed:', value);
    setState(prev => ({ ...prev, currentQuestion: value }));
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Debounce quick suggestions update
    debounceTimeoutRef.current = setTimeout(() => {
      // Could update quick suggestions based on current input
      // This is where you might want to add intelligent suggestion logic
    }, 300);
  }, [setState]);

  const askQuestion = async (question: string) => {
    if (!question.trim() || state.isLoading) return;

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      currentQuestion: question.trim()
    }));

    try {
      let response: AIAssistantResponse;

      if (state.contextMode === 'diagram' && diagramId) {
        response = await aiAssistantService.askAboutDiagram(
          question,
          diagramId,
          { nodes: diagramNodes, edges: diagramEdges }
        );
      } else {
        response = await aiAssistantService.askQuestion(
          question,
          state.contextMode,
          context
        );
      }

      const conversationEntry: AIConversationEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        question,
        response,
        context_mode: state.contextMode
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        currentResponse: response,
        currentQuestion: '',
        conversationHistory: [...prev.conversationHistory, conversationEntry],
        quickSuggestions: response.suggestions.slice(0, 3) // Update with response suggestions
      }));

    } catch (error: any) {
      console.error('AI Assistant error:', error);
      
      const errorDetails = error as AIAssistantErrorDetails;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorDetails.message || 'Ha ocurrido un error inesperado'
      }));

      toast({
        title: 'Error en el asistente',
        description: errorDetails.message,
        variant: 'destructive'
      });
    }
  };

  const requestAnalysis = async () => {
    if (!diagramId || state.isLoading) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = await aiAssistantService.getAnalysis(
        diagramId,
        { nodes: diagramNodes, edges: diagramEdges }
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        analysisData: analysis
      }));

      // Switch to analysis tab
      setActiveTab('analysis');

    } catch (error: any) {
      console.error('Analysis error:', error);
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Error al generar análisis'
      }));

      toast({
        title: 'Error en el análisis',
        description: 'No se pudo generar el análisis del diagrama',
        variant: 'destructive'
      });
    }
  };

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const health = await aiAssistantService.getHealth();
      setHealthStatus(health);
      setState(prev => ({ ...prev, isConnected: health.status !== 'error' }));
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus(null);
      setState(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleQuestionClick = (question: string) => {
    askQuestion(question);
  };

  const handleSuggestionClick = (suggestion: string) => {
    askQuestion(suggestion);
  };

  const handleFeatureClick = (feature: string) => {
    onFeatureNavigation?.(feature);
    toast({
      title: 'Navegando a función',
      description: `Abriendo: ${feature}`,
      variant: 'default'
    });
  };

  const handleFeedback = async (conversationId: string, rating: 1 | 2 | 3 | 4 | 5) => {
    try {
      await aiAssistantService.submitFeedback(conversationId, rating);
      
      setState(prev => ({
        ...prev,
        conversationHistory: prev.conversationHistory.map(entry => 
          entry.id === conversationId 
            ? { ...entry, user_rating: rating }
            : entry
        )
      }));

      toast({
        title: 'Gracias por tu valoración',
        description: 'Tu feedback nos ayuda a mejorar el asistente',
        variant: 'default'
      });
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  const toggleOpen = () => {
    if (onToggle) {
      onToggle();
    } else {
      setState(prev => ({ ...prev, isOpen: !prev.isOpen }));
    }
    
    if (!state.isOpen && questionInputRef.current) {
      setTimeout(() => questionInputRef.current?.focus(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askQuestion(state.currentQuestion);
    }
  };

  // Floating Action Button
  const FloatingButton = (
    <Button
      onClick={toggleOpen}
      className={`
        fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg 
        bg-blue-600 hover:bg-blue-700 text-white z-30
        transition-all duration-200 hover:scale-105
        ${className}
      `}
      size="lg"
    >
      <div className="relative">
        <Brain className="w-6 h-6" />
        {!state.isConnected && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
        )}
        {state.conversationHistory.length > 0 && (
          <Badge 
            className="absolute -top-2 -right-2 w-5 h-5 text-xs p-0 flex items-center justify-center bg-green-500"
          >
            {state.conversationHistory.length}
          </Badge>
        )}
      </div>
    </Button>
  );

  // Main Content
  const MainContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Asistente IA</h2>
            <p className="text-xs text-gray-600">
              {state.contextMode === 'diagram' ? 'Ayuda contextual del diagrama' : 'Asistente general'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <HealthStatus 
            health={healthStatus} 
            onRefresh={checkHealth}
            isLoading={isCheckingHealth}
            compact
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={toggleOpen}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Custom Tab List - Force Light Mode */}
          <div className="grid w-full grid-cols-3 m-4 mb-0 bg-gray-100 border border-gray-200 rounded-md p-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                activeTab === 'chat' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="w-3 h-3" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                activeTab === 'analysis' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              Análisis
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`flex items-center justify-center gap-1 px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                activeTab === 'health' 
                  ? 'bg-white text-blue-700 shadow-sm' 
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Settings className="w-3 h-3" />
              Estado
            </button>
          </div>

          <div className="flex-1 overflow-hidden p-4 pt-2">
            {activeTab === 'chat' && (
              <div className="h-full flex flex-col space-y-0">
              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Context Mode Indicator */}
                <div className="flex items-center gap-2">
                  <Badge variant={state.contextMode === 'diagram' ? 'default' : 'outline'}>
                    {state.contextMode === 'diagram' ? 'Modo Diagrama' : 'Modo General'}
                  </Badge>
                  {diagramNodes.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {diagramNodes.length} clases, {diagramEdges.length} relaciones
                    </span>
                  )}
                </div>

                {/* Quick Questions */}
                <QuickQuestions
                  questions={state.quickSuggestions}
                  onQuestionClick={handleQuestionClick}
                  isLoading={state.isLoading}
                  contextMode={state.contextMode}
                />

                <Separator />

                {/* Conversation History */}
                <ScrollArea className="flex-1">
                  <div className="space-y-4">
                    {state.conversationHistory.length === 0 && !state.isLoading && (
                      <div className="text-center py-8 text-gray-500">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">¡Hola! ¿En qué puedo ayudarte hoy?</p>
                        <p className="text-xs mt-1">Escribe tu pregunta personalizada o selecciona una sugerencia</p>
                      </div>
                    )}

                    {state.conversationHistory.map((entry) => (
                      <div key={entry.id} className="space-y-3">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <HelpCircle className="w-3 h-3 text-gray-600" />
                            <span className="text-xs font-medium text-gray-700">Tú</span>
                            <span className="text-xs text-gray-500">
                              {entry.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{entry.question}</p>
                        </div>
                        
                        <ResponseDisplay
                          response={entry.response}
                          conversationEntry={entry}
                          onSuggestionClick={handleSuggestionClick}
                          onFeatureClick={handleFeatureClick}
                          onFeedback={(rating) => handleFeedback(entry.id, rating)}
                        />
                      </div>
                    ))}

                    {state.isLoading && (
                      <LoadingIndicator 
                        variant={state.contextMode === 'diagram' ? 'analyzing' : 'thinking'}
                      />
                    )}

                    {state.error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm font-medium text-red-800">Error</span>
                        </div>
                        <p className="text-sm text-red-700 mt-1">{state.error}</p>
                      </div>
                    )}

                    <div ref={conversationEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {/* Input Area */}
              <div className="border-t pt-4 space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-800 font-medium mb-1">✨ Pregunta personalizada</p>
                  <p className="text-xs text-blue-700">
                    Escribe cualquier pregunta sobre UML, diagramas, SpringBoot o desarrollo de software
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      ref={questionInputRef}
                      placeholder={
                        state.contextMode === 'diagram' 
                          ? "Ej: ¿Cómo puedo mejorar las relaciones en mi diagrama?" 
                          : "Ej: ¿Cuáles son las mejores prácticas en diagramas UML?"
                      }
                      value={state.currentQuestion}
                      onChange={(e) => {
                        console.log('🎯 Input onChange triggered:', e.target.value);
                        console.log('🎯 Current loading state:', state.isLoading);
                        handleQuestionChange(e.target.value);
                      }}
                      onKeyPress={handleKeyPress}
                      disabled={false}
                      className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Button 
                    onClick={() => askQuestion(state.currentQuestion)}
                    disabled={!state.currentQuestion.trim() || state.isLoading}
                    size="sm"
                  >
                    {state.isLoading ? (
                      <MiniLoadingIndicator className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                {state.contextMode === 'diagram' && diagramId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={requestAnalysis}
                    disabled={state.isLoading}
                    className="w-full"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analizar diagrama
                  </Button>
                )}
              </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="h-full">
                <AnalysisPanel
                  analysis={state.analysisData}
                  onRefresh={requestAnalysis}
                  isLoading={state.isLoading}
                  diagramId={diagramId}
                />
              </div>
            )}

            {activeTab === 'health' && (
              <div className="h-full">
                <HealthStatus
                  health={healthStatus}
                  onRefresh={checkHealth}
                  isLoading={isCheckingHealth}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating Action Button - Only show if not controlled externally */}
      {!state.isOpen && !onToggle && FloatingButton}

      {/* Modal/Dialog - Completely custom without any overlay */}
      {state.isOpen && (
        <div 
          className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none"
        >
          <div
            className={`
              ${isMaximized 
                ? 'w-full h-full max-w-none max-h-none' 
                : 'w-full max-w-lg h-[80vh] max-h-[600px]'
              }
              bg-white border border-gray-200 shadow-2xl rounded-lg
              p-0 overflow-hidden pointer-events-auto
              animate-in fade-in-0 zoom-in-95 duration-200
            `}
          >
            {MainContent}
          </div>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
