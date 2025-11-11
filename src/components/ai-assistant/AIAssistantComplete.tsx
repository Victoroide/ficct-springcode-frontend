/**
 * AI Assistant Complete - ALL FIXES APPLIED
 * Issue 1: Light mode theme
 * Issue 2: Scrollable chat
 * Issue 3: Markdown rendering
 * Issue 4: Improved FAB
 * Issue 5: Command response display
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { mergeNodesByID, mergeEdgesByID } from '@/utils/diagramDataCleaner';
import { 
  processAIResponse, 
  handleProcessingError,
  type ProcessingStats 
} from '@/utils/aiResponseProcessor';
import ElementPreviewCard from './ElementPreviewCard';
import ImageUploadModal from './ImageUploadModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  MessageCircle,
  Wand2,
  Mic,
  MicOff,
  History,
  Clock,
  CheckCircle,
  XCircle,
  Lightbulb,
  AlertCircle,
  Info,
  Image as ImageIcon
} from 'lucide-react';

import { aiAssistantService } from '@/services/aiAssistantService';
import {
  setCommandProcessing,
  setVoiceRecording,
  setCurrentCommand,
  setRecommendations,
  addToCommandHistory,
  clearRecommendations,
  updateRateLimitInfo
} from '@/store/slices/uiSlice';

import type { UMLNode, UMLEdge } from '@/components/uml-flow/types';
import type { VoiceRecognitionState } from '@/types/aiAssistant';

// Speech Recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface CommandResponse {
  action?: string;
  elements?: any[];
  confidence?: number;
  interpretation?: string;
  success?: boolean;
  message?: string;
  elements_generated?: any[];
}

interface PreviewElement {
  element: any;
  preview: boolean;
  accepted: boolean;
}

interface AIAssistantCompleteProps {
  diagramId?: string;
  diagramNodes?: UMLNode[];
  diagramEdges?: UMLEdge[];
  isOpen?: boolean;
  onToggle?: () => void;
  onElementsGenerated?: (elements: { nodes: UMLNode[]; edges: UMLEdge[] }) => void;
  className?: string;
}


const AIAssistantComplete: React.FC<AIAssistantCompleteProps> = ({
  diagramId,
  diagramNodes = [],
  diagramEdges = [],
  isOpen: externalIsOpen,
  onToggle,
  onElementsGenerated,
  className = ''
}) => {
  const dispatch = useDispatch();
  const { toast } = useToast();

  const {
    isProcessing,
    isRecording,
    currentCommand,
    recommendations,
    commandHistory,
    rateLimitInfo
  } = useSelector((state: any) => state.ui.commandProcessing);

  const [isOpen, setIsOpen] = useState(externalIsOpen ?? false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'commands'>('chat');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatConversation, setChatConversation] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [lastCommandResponse, setLastCommandResponse] = useState<CommandResponse | null>(null);
  const [previewElements, setPreviewElements] = useState<PreviewElement[]>([]);
  const [isApplyingElements, setIsApplyingElements] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceRecognitionState>({
    isSupported: false,
    isListening: false,
    transcript: '',
    confidence: 0
  });
  const [showHistory, setShowHistory] = useState(false);
  const [isMicrophoneSupported, setIsMicrophoneSupported] = useState(false);
  const [commandSuggestions, setCommandSuggestions] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Image upload states
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Check API availability on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        const response = await fetch(`${aiAssistantService['baseUrl']}/health/`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        setApiStatus(response.ok ? 'online' : 'offline');
      } catch (error) {
        setApiStatus('offline');
      }
    };
    checkApiHealth();
  }, []);

  useEffect(() => {
    if (externalIsOpen !== undefined) setIsOpen(externalIsOpen);
  }, [externalIsOpen]);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onToggle?.();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        handleToggle();
      }
      if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        if (!isOpen) setIsOpen(true);
        setActiveTab('commands');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatConversation, isChatLoading]);

  const handleSendChatQuestion = async () => {
    if (!chatQuestion.trim() || isChatLoading) return;
    const userMessage = { role: 'user' as const, content: chatQuestion };
    setChatConversation(prev => [...prev, userMessage]);
    setChatQuestion('');
    setIsChatLoading(true);
    try {
      const response = diagramId
        ? await aiAssistantService.askAboutDiagram(chatQuestion, diagramId)
        : await aiAssistantService.askQuestion(chatQuestion);
      const assistantMessage = {
        role: 'assistant' as const,
        content: response.answer || 'No se pudo obtener una respuesta.'
      };
      setChatConversation(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      const errorMessage = {
        role: 'assistant' as const,
        content: `Error: ${error.message || 'No se pudo conectar.'}`
      };
      setChatConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const processNLCommand = async () => {
    const commandToProcess = currentCommand.trim();
    if (!commandToProcess) {
      toast({ title: 'Comando requerido', description: 'Ingrese un comando.', variant: 'destructive' });
      return;
    }
    if (rateLimitInfo.remaining <= 0) {
      toast({ title: 'Límite alcanzado', description: 'Ha alcanzado el límite.', variant: 'destructive' });
      return;
    }
    dispatch(setCommandProcessing(true));
    dispatch(clearRecommendations());
    setLastCommandResponse(null);
    setPreviewElements([]);
    
    const startTime = Date.now();
    try {
      // STEP 1: Get AI response
      const response: any = await aiAssistantService.processCommand(
        commandToProcess, 
        diagramId, 
        { nodes: diagramNodes, edges: diagramEdges }
      );
      
      setLastCommandResponse(response);

      // STEP 2: Apply defensive processing pipeline
      const { result, stats } = processAIResponse(
        response,
        { nodes: diagramNodes, edges: diagramEdges }
      );

      if (!result) {
        // Validation failed
        throw new Error('AI response validation failed. ' + stats.warnings.join(', '));
      }

      // STEP 3: Extract elements for preview
      const elements = response.elements || response.elements_generated || [];
      
      // Set preview elements for user review
      if (elements.length > 0) {
        setPreviewElements(elements.map((el: any) => ({
          element: el,
          preview: true,
          accepted: false
        })));
        
        // Show detailed feedback to user
        const feedbackParts: string[] = [];
        feedbackParts.push(`${elements.length} elemento(s) generado(s)`);
        
        if (stats.duplicatesRemoved > 0) {
          feedbackParts.push(`${stats.duplicatesRemoved} duplicado(s) evitado(s)`);
        }
        
        if (stats.warnings.length > 0) {
          feedbackParts.push(`${stats.warnings.length} advertencia(s)`);
        }
        
        toast({ 
          title: 'Elementos generados', 
          description: feedbackParts.join(' • ') + '. Revisa y aplica los cambios.', 
          variant: 'default' 
        });

        } else {
        toast({ 
          title: 'Sin elementos', 
          description: 'La IA no generó elementos. Intenta reformular el comando.', 
          variant: 'default' 
        });
      }
      
      dispatch(addToCommandHistory({ 
        command: commandToProcess, 
        success: elements.length > 0, 
        elementsGenerated: elements.length, 
        processingTime: Date.now() - startTime 
      }));
      dispatch(setCurrentCommand(''));
      
    } catch (error: any) {
      // STEP 4: Handle errors with recovery strategies
      const processingError = handleProcessingError(error);
      
      const userFriendlyMsg = processingError.message;
      
      setLastCommandResponse({ 
        success: false, 
        message: userFriendlyMsg, 
        interpretation: userFriendlyMsg,
        elements: []
      });
      
      dispatch(addToCommandHistory({ 
        command: commandToProcess, 
        success: false, 
        elementsGenerated: 0, 
        processingTime: Date.now() - startTime, 
        errorMessage: userFriendlyMsg 
      }));
      
      toast({ 
        title: 'Error al procesar comando', 
        description: userFriendlyMsg + (processingError.recoverable ? ' Puedes intentar de nuevo.' : ''), 
        variant: 'destructive' 
      });
      
      console.error('[AI Assistant] Processing error:', processingError);
    } finally {
      dispatch(setCommandProcessing(false));
    }
  };

  // Calculate non-overlapping position for new elements
  const calculateNonOverlappingPosition = (suggestedPos: { x: number; y: number }, existingNodes: UMLNode[]) => {
    let { x, y } = suggestedPos;
    const GRID_SIZE = 250;
    const MIN_DISTANCE = 200;
    
    const hasOverlap = (testX: number, testY: number) => {
      return existingNodes.some(node => {
        const dx = Math.abs(node.position.x - testX);
        const dy = Math.abs(node.position.y - testY);
        return dx < MIN_DISTANCE && dy < MIN_DISTANCE;
      });
    };
    
    while (hasOverlap(x, y)) {
      x += GRID_SIZE;
      if (x > 1200) {
        x = 100;
        y += GRID_SIZE;
      }
    }
    
    return { x, y };
  };

  // Apply accepted elements to diagram with defensive processing
  const applyElementsToCanvas = async () => {
    if (previewElements.length === 0) return;
    
    setIsApplyingElements(true);
    try {
      // Build response object from preview elements
      const mockResponse = {
        elements: previewElements.map(p => p.element)
      };
      
      // Apply defensive processing pipeline
      const { result, stats } = processAIResponse(
        mockResponse,
        { nodes: diagramNodes, edges: diagramEdges }
      );
      
      if (!result) {
        console.error('[APPLY] CRITICAL: Validation failed!');
        console.error('[APPLY] Stats warnings:', stats.warnings);
        throw new Error('Element validation failed: ' + stats.warnings.join(', '));
      }
      
      // Apply to canvas
      if (onElementsGenerated) {
        onElementsGenerated({ 
          nodes: result.nodes, 
          edges: result.edges 
        });
        
        } else {
        console.error('[APPLY] CRITICAL: onElementsGenerated callback is missing!');
      }
      
      // Show detailed feedback
      const feedbackParts: string[] = [];
      if (stats.nodesAdded > 0) feedbackParts.push(`${stats.nodesAdded} clase(s)`);
      if (stats.nodesUpdated > 0) feedbackParts.push(`${stats.nodesUpdated} actualizada(s)`);
      if (stats.edgesAdded > 0) feedbackParts.push(`${stats.edgesAdded} relación(es)`);
      if (stats.duplicatesRemoved > 0) feedbackParts.push(`${stats.duplicatesRemoved} duplicado(s) evitado(s)`);
      
      toast({ 
        title: 'Elementos aplicados', 
        description: feedbackParts.join(' • '), 
        variant: 'default' 
      });
      
      // Clear preview after successful application
      setPreviewElements([]);
      
    } catch (error: any) {
      console.error('[AI Assistant] Error applying elements:', error);
      toast({ 
        title: 'Error al aplicar elementos', 
        description: error.message || 'No se pudieron aplicar los elementos al diagrama.', 
        variant: 'destructive' 
      });
    } finally {
      setIsApplyingElements(false);
    }
  };

  // LEGACY: Keep original logic as fallback (not used with defensive pipeline)
  const applyElementsToCanvasLegacy = async () => {
    if (previewElements.length === 0) return;
    
    setIsApplyingElements(true);
    try {
      const newNodes: UMLNode[] = [];
      const newEdges: UMLEdge[] = [];
      
      previewElements.forEach((preview) => {
        const rec = preview.element;
        
        // Handle node elements (new format)
        if (rec.type === 'node' && rec.data) {
          const nodeData = rec.data;
          const suggestedPosition = nodeData.position || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
          const adjustedPosition = calculateNonOverlappingPosition(suggestedPosition, [...diagramNodes, ...newNodes]);
          
          newNodes.push({
            id: nodeData.id || `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: nodeData.type || 'class',
            position: adjustedPosition,
            data: {
              label: nodeData.data?.label || 'Unnamed',
              nodeType: (nodeData.data?.nodeType || 'class') as any,
              attributes: nodeData.data?.attributes || [],
              methods: nodeData.data?.methods || [],
              isAbstract: nodeData.data?.isAbstract || false
            }
          });
        }
        // Handle legacy format
        else if (rec.element_type === 'class') {
          const suggestedPosition = rec.position || { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 };
          const adjustedPosition = calculateNonOverlappingPosition(suggestedPosition, [...diagramNodes, ...newNodes]);
          
          newNodes.push({
            id: `class-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: 'class',
            position: adjustedPosition,
            data: {
              label: rec.element_data?.name || 'Unnamed',
              nodeType: 'class' as any,
              attributes: rec.element_data?.attributes || [],
              methods: rec.element_data?.methods || [],
              isAbstract: rec.element_data?.isAbstract || false
            }
          });
        }
        // Handle edge elements (relationships)
        else if (rec.type === 'edge' || rec.element_type === 'relationship') {
          // NEW FORMAT: Backend sends IDs directly
          if (rec.type === 'edge' && rec.data) {
            const edgeData = rec.data;
            const allNodes = [...diagramNodes, ...newNodes];
            
            // Check if source and target exist by ID
            const sourceExists = allNodes.some(n => n.id === edgeData.source);
            const targetExists = allNodes.some(n => n.id === edgeData.target);
            
            if (sourceExists && targetExists) {
              newEdges.push({
                id: edgeData.id || `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                source: edgeData.source,
                target: edgeData.target,
                type: 'umlRelationship',
                data: {
                  relationshipType: (edgeData.data?.relationshipType || 'ASSOCIATION') as any,
                  sourceMultiplicity: edgeData.data?.sourceMultiplicity || '1',
                  targetMultiplicity: edgeData.data?.targetMultiplicity || '1',
                  label: edgeData.data?.label || ''
                }
              });
            } else {
              console.warn('Edge source or target node not found:', edgeData.source, edgeData.target);
            }
          }
          // LEGACY FORMAT: Backend sends node names, need to find by label
          else {
            const sourceName = rec.element_data?.source || rec.source;
            const targetName = rec.element_data?.target || rec.target;
            
            const sourceNode = [...diagramNodes, ...newNodes].find(n => 
              n.data?.label?.toLowerCase() === sourceName?.toLowerCase()
            );
            const targetNode = [...diagramNodes, ...newNodes].find(n => 
              n.data?.label?.toLowerCase() === targetName?.toLowerCase()
            );
            
            if (sourceNode && targetNode) {
              newEdges.push({
                id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                source: sourceNode.id,
                target: targetNode.id,
                type: 'umlRelationship',
                data: {
                  relationshipType: (rec.element_data?.type || rec.data?.relationshipType || 'ASSOCIATION') as any,
                  sourceMultiplicity: rec.element_data?.sourceMultiplicity || rec.data?.sourceMultiplicity || '1',
                  targetMultiplicity: rec.element_data?.targetMultiplicity || rec.data?.targetMultiplicity || '1',
                  label: rec.element_data?.label || rec.data?.label || ''
                }
              });
            } else {
              console.warn('Edge source or target node not found by name:', sourceName, targetName);
            }
          }
        }
      });
      
      if (newNodes.length > 0 || newEdges.length > 0) {
        if (onElementsGenerated) {
          // Merge instead of append to prevent duplicates
          const mergedNodes = mergeNodesByID(diagramNodes, newNodes);
          const mergedEdges = mergeEdgesByID(diagramEdges, newEdges);
          
          onElementsGenerated({ nodes: mergedNodes, edges: mergedEdges });
        }
        
        toast({ 
          title: 'Elementos aplicados', 
          description: `Se agregaron ${newNodes.length} nodo(s) y ${newEdges.length} relación(es) al diagrama.`, 
          variant: 'default' 
        });
        
        // Clear preview elements after successful application
        setPreviewElements([]);
      }
    } catch (error: any) {
      console.error('Error applying elements:', error);
      toast({ 
        title: 'Error al aplicar elementos', 
        description: error.message || 'No se pudieron aplicar los elementos al diagrama.', 
        variant: 'destructive' 
      });
    } finally {
      setIsApplyingElements(false);
    }
  };

  // Reject preview elements
  const rejectElements = () => {
    setPreviewElements([]);
    toast({ 
      title: 'Elementos rechazados', 
      description: 'Los elementos generados han sido descartados.', 
      variant: 'default' 
    });
  };

  // Handle image upload and processing with defensive pipeline
  const handleImageProcessed = async (base64Image: string) => {
    setIsProcessingImage(true);
    const startTime = Date.now();
    
    try {
      const sessionId = localStorage.getItem('diagram_session') || 'anonymous';
      const response = await aiAssistantService.processImageToDiagram(base64Image, sessionId);
      
      const processingTime = Date.now() - startTime;
      
      if (response.success && response.data) {
        const { nodes, edges } = response.data;
        
        // Build response object for defensive processor
        const mockResponse = {
          elements: [
            ...nodes.map((n: any) => ({ type: 'node', data: n })),
            ...edges.map((e: any) => ({ type: 'edge', data: e }))
          ]
        };
        
        // Apply defensive processing pipeline
        const { result, stats } = processAIResponse(
          mockResponse,
          { nodes: diagramNodes, edges: diagramEdges }
        );
        
        if (!result) {
          throw new Error('Image recognition validation failed');
        }
        
        // Apply to canvas
        if (result.nodes.length > 0 || result.edges.length > 0) {
          if (onElementsGenerated) {
            onElementsGenerated({ 
              nodes: result.nodes, 
              edges: result.edges 
            });
          }
          
          // Show detailed feedback
          const feedbackParts: string[] = [];
          if (stats.nodesAdded > 0) feedbackParts.push(`${stats.nodesAdded} clase(s)`);
          if (stats.edgesAdded > 0) feedbackParts.push(`${stats.edgesAdded} relación(es)`);
          if (stats.duplicatesRemoved > 0) feedbackParts.push(`${stats.duplicatesRemoved} duplicado(s) evitado(s)`);
          feedbackParts.push(`Tiempo: ${(processingTime / 1000).toFixed(1)}s`);
          
          toast({ 
            title: 'Diagrama extraído exitosamente', 
            description: feedbackParts.join(' • '), 
            variant: 'default' 
          });
          
          } else {
          toast({ 
            title: 'No se detectaron elementos', 
            description: 'No se encontraron elementos UML en la imagen. Intenta con una imagen más clara.', 
            variant: 'destructive' 
          });
        }
      } else {
        throw new Error(response.message || 'No se pudo procesar la imagen');
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Error al procesar la imagen';
      toast({ 
        title: 'Error al procesar imagen', 
        description: errorMsg, 
        variant: 'destructive' 
      });
    } finally {
      setIsProcessingImage(false);
      setIsImageModalOpen(false);
    }
  };

  // Request microphone permissions
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately, we just needed permission
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      toast({
        title: 'Permiso de micrófono denegado',
        description: 'Permite el acceso al micrófono para usar el reconocimiento de voz.',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Speech-to-Text for Chat
  const handleToggleVoiceChat = async () => {
    if (voiceState.isListening) {
      stopVoiceRecognition();
    } else {
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        startVoiceRecognition('chat');
      }
    }
  };

  // Speech-to-Text for Commands
  const handleToggleVoiceCommand = async () => {
    if (voiceState.isListening) {
      stopVoiceRecognition();
    } else {
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        startVoiceRecognition('command');
      }
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    // Check if we're on HTTPS or localhost
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition && isSecureContext) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setVoiceState(prev => ({ ...prev, isListening: true, transcript: '' }));
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        setVoiceState(prev => ({ ...prev, transcript, confidence }));
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setVoiceState(prev => ({ ...prev, isListening: false }));
        // Silently fail - don't show error toasts
      };

      recognition.onend = () => {
        setVoiceState(prev => ({ ...prev, isListening: false }));
      };

      recognitionRef.current = recognition;
      setVoiceState(prev => ({ ...prev, isSupported: true }));
      setIsMicrophoneSupported(true);
    } else {
      setVoiceState(prev => ({ ...prev, isSupported: false }));
      setIsMicrophoneSupported(false);
    }
  }, []);

  const startVoiceRecognition = (mode: 'chat' | 'command') => {
    if (recognitionRef.current && voiceState.isSupported) {
      recognitionRef.current.mode = mode; // Store mode
      recognitionRef.current.start();
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // Auto-fill input when transcript is ready
  useEffect(() => {
    if (voiceState.transcript && !voiceState.isListening) {
      const mode = recognitionRef.current?.mode;
      if (mode === 'chat') {
        setChatQuestion(voiceState.transcript);
        chatInputRef.current?.focus();
      } else if (mode === 'command') {
        dispatch(setCurrentCommand(voiceState.transcript));
        commandInputRef.current?.focus();
      }
      // Reset transcript after using it
      setVoiceState(prev => ({ ...prev, transcript: '' }));
    }
  }, [voiceState.transcript, voiceState.isListening, dispatch]);

  const getRateLimitColor = () => {
    if (rateLimitInfo.remaining > 20) return 'text-green-600';
    if (rateLimitInfo.remaining > 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // No floating FAB - controlled by toolbar button
  if (!isOpen) {
    return null;
  }

  return (
    <div className={`fixed ${isMaximized ? 'inset-4' : 'top-20 right-6 w-[480px] h-[640px]'} z-50 ${className}`}>
      <Card className="h-full flex flex-col shadow-2xl bg-white border-gray-200">
        <CardHeader className="pb-3 border-b border-gray-200 flex-shrink-0 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-600" />
              <span className="text-base font-semibold text-gray-900">Asistente IA</span>
              {diagramNodes.length > 0 && (<Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">{diagramNodes.length} nodos</Badge>)}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => setIsMaximized(!isMaximized)} className="text-gray-600 hover:text-gray-900">{isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}</Button>
              <Button variant="ghost" size="sm" onClick={handleToggle} className="text-gray-600 hover:text-gray-900"><X className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-white relative">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col h-full">
            <TabsList className="w-full grid grid-cols-2 flex-shrink-0 mx-4 mt-4">
              <TabsTrigger value="chat" className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />Chat IA</TabsTrigger>
              <TabsTrigger value="commands" className="flex items-center gap-1"><Wand2 className="w-4 h-4" />Comandos</TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="flex-1 flex flex-col h-full overflow-hidden relative">
              <div 
                ref={chatScrollRef} 
                className="flex-1 overflow-y-auto space-y-3 px-4 py-3"
                style={{ 
                  maxHeight: isMaximized ? 'calc(100vh - 280px)' : '420px',
                  paddingBottom: '0.75rem'
                }}
              >
                {chatConversation.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <Sparkles className="w-16 h-16 mb-4 text-blue-400" />
                    <p className="text-sm font-medium text-gray-700">¿Necesitas ayuda con UML?</p>
                    <p className="text-xs text-gray-500 mt-2">Pregunta lo que necesites sobre diagramas UML</p>
                  </div>
                ) : (
                  <>
                    {chatConversation.map((msg, idx) => (
                      <div key={idx} className={`p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-50 ml-auto max-w-[85%] border border-blue-100' : 'bg-gray-50 mr-auto max-w-[85%] border border-gray-200'}`}>
                        <p className="text-xs font-semibold mb-1 text-gray-700">{msg.role === 'user' ? 'Tú' : 'Asistente IA'}</p>
                        <div className="text-sm text-gray-800 markdown-content">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4 text-gray-900" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3 text-gray-900" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-semibold mb-2 mt-2 text-gray-900" {...props} />,
                              h4: ({node, ...props}) => <h4 className="text-sm font-semibold mb-1 mt-2 text-gray-900" {...props} />,
                              p: ({node, ...props}) => <p className="my-2 leading-relaxed" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-gray-900" {...props} />,
                              em: ({node, ...props}) => <em className="italic text-gray-700" {...props} />,
                              code: ({node, inline, className, children, ...props}: any) => {
                                // Detectar si es inline o bloque
                                const isInline = inline === true || !className?.includes('language-');
                                
                                if (isInline) {
                                  return <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs text-gray-900 font-mono" {...props}>{children}</code>;
                                }
                                
                                // Código de bloque
                                return (
                                  <pre className="bg-gray-50 border border-gray-200 rounded p-3 overflow-x-auto my-3">
                                    <code className="text-sm text-gray-900 font-mono" {...props}>{children}</code>
                                  </pre>
                                );
                              },
                              pre: ({node, children, ...props}) => {
                                // Si ya renderizamos el pre en code, solo devolvemos los children
                                return <>{children}</>;
                              },
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                              li: ({node, ...props}) => <li className="my-1" {...props} />,
                              a: ({node, ...props}) => <a className="text-blue-600 underline hover:text-blue-800" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-2" {...props} />,
                              table: ({node, ...props}) => <table className="w-full border-collapse my-2" {...props} />,
                              thead: ({node, ...props}) => <thead className="bg-gray-100" {...props} />,
                              tbody: ({node, ...props}) => <tbody {...props} />,
                              tr: ({node, ...props}) => <tr className="border-b border-gray-200" {...props} />,
                              th: ({node, ...props}) => <th className="border border-gray-300 px-3 py-2 text-left font-semibold" {...props} />,
                              td: ({node, ...props}) => <td className="border border-gray-300 px-3 py-2" {...props} />,
                            }}
                          >{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (<div className="bg-gray-50 p-3 rounded-lg border border-gray-200"><p className="text-sm text-gray-500">Pensando...</p></div>)}
                  </>
                )}
              </div>
            </TabsContent>
            
            {/* Chat Input - Fixed at bottom */}
            {activeTab === 'chat' && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
                <div className="flex gap-2 items-center">
                  <Input 
                    ref={chatInputRef} 
                    placeholder={voiceState.isListening ? 'Escuchando...' : 'Pregunta sobre UML...'} 
                    value={chatQuestion} 
                    onChange={(e) => setChatQuestion(e.target.value)} 
                    onKeyPress={(e) => { 
                      if (e.key === 'Enter' && !e.shiftKey) { 
                        e.preventDefault(); 
                        handleSendChatQuestion(); 
                      }
                    }} 
                    disabled={isChatLoading || voiceState.isListening} 
                    className="flex-1 bg-white border-gray-300" 
                  />
                  <Button
                    onClick={() => setIsImageModalOpen(true)}
                    disabled={isChatLoading || isProcessingImage}
                    variant="outline"
                    size="sm"
                    className="px-3 bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    title="Subir imagen de diagrama UML"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  {isMicrophoneSupported && (
                    <Button
                      onClick={handleToggleVoiceChat}
                      disabled={isChatLoading}
                      variant="outline"
                      size="sm"
                      className={`px-3 ${
                        voiceState.isListening 
                          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 animate-pulse' 
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={voiceState.isListening ? 'Detener grabación' : 'Iniciar grabación de voz'}
                    >
                      {voiceState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button 
                    onClick={handleSendChatQuestion} 
                    disabled={!chatQuestion.trim() || isChatLoading} 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3"
                  >
                    {isChatLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
            <TabsContent value="commands" className="flex-1 flex flex-col overflow-hidden relative">
              <div 
                className="flex-1 overflow-y-auto px-4 py-3" 
                style={{ 
                  maxHeight: isMaximized ? 'calc(100vh - 280px)' : '420px',
                  paddingBottom: '0.75rem'
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={apiStatus === 'online' ? 'bg-green-50 text-green-700 border-green-200' : apiStatus === 'offline' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-50 text-gray-700'}>
                        <div className={`w-2 h-2 rounded-full mr-1 ${apiStatus === 'online' ? 'bg-green-500' : apiStatus === 'offline' ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                        {apiStatus === 'online' ? 'API Online' : apiStatus === 'offline' ? 'API Offline' : 'Verificando...'}
                      </Badge>
                    </div>
                  </div>
                  
                  {apiStatus === 'offline' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs text-yellow-800">
                      <AlertCircle className="w-4 h-4 inline mr-1" />
                      <strong>El backend no está disponible.</strong> Asegúrate de que el servidor Django esté corriendo en <code className="bg-yellow-100 px-1 rounded">http://localhost:8000</code>
                    </div>
                  )}
                  
                  {/* Command Response Display */}
                  {lastCommandResponse && (
                    <div className={`border rounded-lg p-3 ${lastCommandResponse.success === false ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                      <div className="flex items-start gap-2 mb-3">
                        {lastCommandResponse.success === false ? (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        ) : (
                          <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {lastCommandResponse.success === false ? 'Error' : 'Respuesta del Asistente'}
                            </h4>
                            {lastCommandResponse.confidence !== undefined && lastCommandResponse.success !== false && (
                              <Badge className={`text-xs ${getConfidenceColor(lastCommandResponse.confidence)}`}>
                                {Math.round(lastCommandResponse.confidence * 100)}% confianza
                              </Badge>
                            )}
                          </div>
                          {lastCommandResponse.action && lastCommandResponse.success !== false && (
                            <Badge variant="outline" className="text-xs bg-white text-gray-700 mb-2">
                              Acción: {lastCommandResponse.action}
                            </Badge>
                          )}
                          {lastCommandResponse.interpretation && (
                            <p className={`text-sm leading-relaxed ${lastCommandResponse.success === false ? 'text-red-800' : 'text-gray-800'}`}>
                              {lastCommandResponse.interpretation}
                            </p>
                          )}
                          {lastCommandResponse.message && lastCommandResponse.success === false && (
                            <p className="text-sm text-red-800 leading-relaxed mt-1">
                              {lastCommandResponse.message}
                            </p>
                          )}
                          {lastCommandResponse.elements?.length === 0 && lastCommandResponse.success !== false && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800 mt-2 flex items-start gap-1">
                              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span>No se generaron elementos. Intenta ser más específico en tu comando.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Element Previews */}
                  {previewElements.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                          Elementos Generados ({previewElements.length})
                        </h4>
                        <div className="flex gap-2">
                          <Button 
                            onClick={rejectElements} 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rechazar
                          </Button>
                          <Button 
                            onClick={applyElementsToCanvas} 
                            disabled={isApplyingElements}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {isApplyingElements ? 'Aplicando...' : 'Aplicar al Diagrama'}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {previewElements.map((preview, idx) => (
                          <ElementPreviewCard key={idx} element={preview.element} index={idx} />
                        ))}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-xs text-blue-800">
                          <Lightbulb className="w-3 h-3 inline mr-1" />
                          Revisa los elementos generados antes de aplicarlos. Puedes rechazarlos y probar con un comando diferente.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {showHistory && commandHistory.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-medium text-gray-600">Historial de Comandos</span>
                      {commandHistory.slice(0, 5).map((entry: any) => (
                        <div key={entry.id} className="flex items-center gap-2 text-xs p-2 rounded bg-gray-50 border border-gray-200">
                          {entry.success ? <CheckCircle className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                          <span className="flex-1 truncate text-gray-700">{entry.command}</span>
                          <span className="text-gray-500">{entry.elementsGenerated || 0} elementos</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            {/* Commands Input - Fixed at bottom */}
            {activeTab === 'commands' && (
              <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3" style={{ position: 'sticky', bottom: 0, zIndex: 10 }}>
                <div className="flex gap-2 items-center">
                  <Input 
                    ref={commandInputRef} 
                    placeholder={voiceState.isListening ? 'Escuchando...' : 'Ej: Crea clase User con id y nombre'} 
                    value={currentCommand} 
                    onChange={(e) => dispatch(setCurrentCommand(e.target.value))} 
                    onKeyPress={(e) => { 
                      if (e.key === 'Enter') { 
                        e.preventDefault(); 
                        processNLCommand(); 
                      }
                    }} 
                    disabled={isProcessing || voiceState.isListening} 
                    className="flex-1 bg-white border-gray-300" 
                  />
                  <Button
                    onClick={() => setIsImageModalOpen(true)}
                    disabled={isProcessing || isProcessingImage}
                    variant="outline"
                    size="sm"
                    className="px-3 bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                    title="Subir imagen de diagrama UML"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  {isMicrophoneSupported && (
                    <Button
                      onClick={handleToggleVoiceCommand}
                      disabled={isProcessing}
                      variant="outline"
                      size="sm"
                      className={`px-3 ${
                        voiceState.isListening 
                          ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 animate-pulse' 
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                      title={voiceState.isListening ? 'Detener grabación' : 'Iniciar grabación de voz'}
                    >
                      {voiceState.isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </Button>
                  )}
                  <Button 
                    onClick={processNLCommand} 
                    disabled={!currentCommand.trim() || isProcessing} 
                    size="sm" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3"
                  >
                    {isProcessing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> : <Wand2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Image Upload Modal */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onImageProcessed={handleImageProcessed}
        isProcessing={isProcessingImage}
      />
    </div>
  );
};

export default AIAssistantComplete;
