/**
 * UMLDesignerPageClean.tsx
 * CLEAN WEBSOCKET IMPLEMENTATION - Replaces Broken Multi-Service Architecture
 * ========================================================================
 * 
 * This replaces the complex umlCollaborationService + anonymousWebSocketService
 * with the proven single useWebSocket hook pattern that eliminates:
 * - getAuthHeader authentication errors
 * - Multiple WebSocket connection conflicts
 * - Complex service initialization loops
 * - Message broadcast duplications
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Save, ChevronLeft, Edit, Check, Users, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/components/ui/toast-service';

import UMLFlowEditorWithAI from '@/components/uml-flow/UMLFlowEditorWithAI';
import { useWebSocket } from '@/hooks/useWebSocket';
import { diagramService } from '@/services/diagramService';
import type { DiagramData } from '@/services/diagramService';
import { anonymousSessionService } from '@/services/anonymousSessionService';

interface UMLDesignerPageCleanProps {
  diagramId?: string;
  initialDiagram?: any;
  onDiagramChange?: (nodes: any[], edges: any[]) => void;
  isAnonymousMode?: boolean;
}

export function UMLDesignerPageClean({ 
  diagramId: propDiagramId, 
  initialDiagram, 
  onDiagramChange,
  isAnonymousMode = false 
}: UMLDesignerPageCleanProps = {}) {
  
  const { diagramId: paramDiagramId } = useParams();
  const navigate = useNavigate();
  
  // Stable diagram ID resolution
  const stableDiagramId = useMemo(() => {
    if (propDiagramId && propDiagramId !== 'new' && propDiagramId !== 'undefined') {
      return propDiagramId;
    }
    
    if (paramDiagramId && paramDiagramId !== 'new' && paramDiagramId !== 'undefined') {
      return paramDiagramId;
    }
    
    const savedId = localStorage.getItem('current_diagram_id');
    if (savedId && savedId !== 'new' && savedId !== 'undefined') {
      return savedId;
    }
    
    return '00000000-0000-4000-a000-000000000001';
  }, [propDiagramId, paramDiagramId]);
  
  const diagramId = stableDiagramId;
  const isNewDiagram = diagramId === 'new';

  // Diagram state
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [diagramLoading, setDiagramLoading] = useState(true);
  const [diagramLoadError, setDiagramLoadError] = useState<string | null>(null);
  
  // React Flow state - directly managed by component
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  
  // Title editing state with conflict prevention
  const [diagramName, setDiagramName] = useState('Nuevo Diagrama');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isReceivingTitleUpdate, setIsReceivingTitleUpdate] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const localTitleRef = useRef<string>('Nuevo Diagrama');
  
  // Session info
  const session = useMemo(() => anonymousSessionService.getOrCreateSession(), []);
  
  // Chat state - TASK 1 FIX: Add missing chat state variables
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [connectedUserCount, setConnectedUserCount] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  
  // ================================================================================
  // CLEAN WEBSOCKET IMPLEMENTATION - Replaces ALL broken services
  // ================================================================================
  const { isConnected, connectedUsers, sendMessage } = useWebSocket({
    diagramId,
    
    // Direct React Flow state integration
    onNodesChange: useCallback((newNodes) => {
      if (!isReceivingTitleUpdate) {
        // TASK 4 FIX: Remove performance-killing logs - only essential logging
        setNodes(newNodes);
        
        // Call parent callback if provided
        if (onDiagramChange) {
          onDiagramChange(newNodes, edges);
        }
      }
    }, [isReceivingTitleUpdate, edges, onDiagramChange]),
    
    onEdgesChange: useCallback((newEdges) => {
      if (!isReceivingTitleUpdate) {
        // TASK 4 FIX: Remove performance-killing logs - only essential logging
        setEdges(newEdges);
        
        // Call parent callback if provided
        if (onDiagramChange) {
          onDiagramChange(nodes, newEdges);
        }
      }
    }, [isReceivingTitleUpdate, nodes, onDiagramChange]),
    
    onTitleChange: useCallback((newTitle) => {
      if (!isEditingName) {
        // TASK 4 FIX: Remove performance-killing logs - only essential logging
        setIsReceivingTitleUpdate(true);
        setDiagramName(newTitle);
        localTitleRef.current = newTitle;
        setTimeout(() => setIsReceivingTitleUpdate(false), 200);
      }
    }, [isEditingName]),
    
    onUserJoined: useCallback((user) => {
      // TASK 5 FIX: Single toast notification - no duplicate spam
      toast({
        title: "Usuario conectado",
        description: `${user.nickname} se ha unido al diagrama`,
        variant: "success"
      });
    }, []),
    
    onUserLeft: useCallback((user) => {
      // TASK 5 FIX: Single toast notification - no duplicate spam  
      toast({
        title: "Usuario desconectado", 
        description: `${user.nickname} ha salido del diagrama`,
        variant: "warning"
      });
    }, []),
    
    // Chat message handlers - CHAT DISPLAY FIX: Prevent duplicate messages from own user
    onChatMessage: useCallback((message) => {
      // Only add message if it's NOT from current user (prevent duplicates)
      if (message.sender.id !== session.sessionId) {
        setChatMessages(prev => [...prev, message]);
      }
    }, [session.sessionId]),
    
    onTypingIndicator: useCallback((data) => {
      // Handle typing indicator
    }, []),
    
    onUserPresence: useCallback((data) => {
      // TASK 2 FIX: Update user count display
      setConnectedUserCount(data.count);
      setOnlineUsers(data.users.map((user, index) => ({
        id: `user-${index}`,
        nickname: user,
        isOnline: true
      })));
    }, [])
  });

  // Chat functions that use WebSocket - CHAT DISPLAY FIX: Show sender's own messages
  const handleSendChatMessage = useCallback((message: string) => {
    const chatMessage = {
      id: Date.now().toString(),
      content: message,
      sender: { 
        id: session.sessionId, 
        nickname: session.nickname 
      },
      timestamp: new Date(),
      type: 'message' as const
    };
    
    // 1. IMMEDIATELY add to local chat (so sender sees it)
    setChatMessages(prev => [...prev, chatMessage]);
    
    // 2. Send via WebSocket to other users
    if (isConnected) {
      sendMessage('chat_message', {
        content: message,
        user: session.nickname,
        timestamp: Date.now()
      });
    }
  }, [isConnected, sendMessage, session.nickname, session.sessionId]);

  const handleSendTypingIndicator = useCallback((isTyping: boolean) => {
    if (isConnected) {
      sendMessage('typing_indicator', {
        isTyping,
        user: session.nickname
      });
    }
  }, [isConnected, sendMessage, session.nickname]);

  // Load diagram on mount
  useEffect(() => {
    if (!diagramId || diagramId === 'new') {
      setDiagramLoading(false);
      return;
    }

    const loadDiagram = async () => {
      try {
        setDiagramLoading(true);
        setDiagramLoadError(null);
        const loadedDiagram = await diagramService.getDiagram(diagramId);
        
        setDiagram(loadedDiagram);
        
        // Extract nodes and edges from diagram content
        if (loadedDiagram?.content) {
          if (Array.isArray(loadedDiagram.content.nodes)) {
            setNodes(loadedDiagram.content.nodes);
          }
          
          if (Array.isArray(loadedDiagram.content.edges)) {
            setEdges(loadedDiagram.content.edges);
          }
        }
        
        // Set diagram title
        if (loadedDiagram?.title) {
          setDiagramName(loadedDiagram.title);
          localTitleRef.current = loadedDiagram.title;
        }
        
        setDiagramLoading(false);
      } catch (error) {
        console.error('Error loading diagram:', error);
        
        // Try localStorage fallback
        const localData = localStorage.getItem(`diagram_${diagramId}`);
        if (localData) {
          try {
            const localDiagram = JSON.parse(localData);
            
            setNodes(localDiagram.nodes || []);
            setEdges(localDiagram.edges || []);
            
            if (localDiagram.title) {
              setDiagramName(localDiagram.title);
              localTitleRef.current = localDiagram.title;
            }
            
            setDiagramLoading(false);
          } catch (parseError) {
            console.error('Error parsing local diagram:', parseError);
            setDiagramLoadError('No se pudo cargar el diagrama');
            setDiagramLoading(false);
          }
        } else {
          setDiagramLoadError('No se pudo cargar el diagrama');
          setDiagramLoading(false);
        }
      }
    };

    loadDiagram();
  }, [diagramId]);

  // ================================================================================
  // CLEAN REACT FLOW INTEGRATION - Direct state management with WebSocket broadcast
  // ================================================================================
  const handleNodesChange = useCallback((newNodes) => {
    // TASK 4 FIX: Remove performance-killing console logs
    setNodes(newNodes);
    
    // Broadcast to other users via WebSocket
    if (isConnected) {
      sendMessage('node_update', { nodes: newNodes });
    }
    
    // Call parent callback if provided
    if (onDiagramChange) {
      onDiagramChange(newNodes, edges);
    }
    
    // Save to localStorage for offline support
    if (diagramId && diagramId !== 'new') {
      localStorage.setItem(`diagram_${diagramId}`, JSON.stringify({
        nodes: newNodes,
        edges: edges,
        title: diagramName,
        updated_at: new Date().toISOString()
      }));
    }
  }, [isConnected, sendMessage, edges, onDiagramChange, diagramId, diagramName]);

  const handleEdgesChange = useCallback((newEdges) => {
    // TASK 4 FIX: Remove performance-killing console logs
    setEdges(newEdges);
    
    // Broadcast to other users via WebSocket
    if (isConnected) {
      sendMessage('edge_update', { edges: newEdges });
    }
    
    // Call parent callback if provided
    if (onDiagramChange) {
      onDiagramChange(nodes, newEdges);
    }
    
    // Save to localStorage for offline support
    if (diagramId && diagramId !== 'new') {
      localStorage.setItem(`diagram_${diagramId}`, JSON.stringify({
        nodes: nodes,
        edges: newEdges,
        title: diagramName,
        updated_at: new Date().toISOString()
      }));
    }
  }, [isConnected, sendMessage, nodes, onDiagramChange, diagramId, diagramName]);

  // Save diagram to API
  const handleSave = useCallback(async () => {
    if (!diagramId || nodes.length === 0) return;
    
    try {
      const diagramData = {
        title: diagramName,
        content: {
          nodes: nodes,
          edges: edges
        },
        diagram_type: 'CLASS' as const
      };
      const result = await diagramService.updateDiagram(diagramId, diagramData);
      
      toast({
        title: "Diagrama guardado",
        description: `El diagrama "${diagramName}" se ha guardado correctamente.`,
        variant: "success"
      });
      
      if (isNewDiagram && result.id) {
        navigate(`/editor/${result.id}`, { replace: true });
      }
      
    } catch (error: any) {
      console.error('Error saving diagram:', error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar el diagrama. Inténtalo de nuevo.",
        variant: "error"
      });
    }
  }, [diagramId, diagramName, nodes, edges, navigate, isNewDiagram]);

  // ================================================================================
  // TITLE EDITING with WebSocket broadcast and conflict prevention
  // ================================================================================
  const startEditingName = useCallback(() => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, []);
  
  const finishEditingName = useCallback(() => {
    const finalTitle = nameInputRef.current?.value || diagramName;
    const titleChanged = finalTitle !== diagramName && finalTitle.trim() !== '';
    
    setIsEditingName(false);
    
    if (titleChanged) {
      setDiagramName(finalTitle);
      localTitleRef.current = finalTitle;
      
      // Update database
      if (diagramId && diagramId !== 'new') {
        diagramService.updateDiagram(diagramId, { title: finalTitle })
          .then(() => console.log('Title updated in database:', finalTitle))
          .catch(error => console.error('Error saving title:', error));
      }
      
      // Broadcast title change via WebSocket
      if (isConnected) {
        sendMessage('title_changed', { title: finalTitle });
      }
    }
  }, [diagramName, diagramId, isConnected, sendMessage]);

  // Loading state
  if (diagramLoading && !isNewDiagram) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando diagrama...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (diagramLoadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p className="font-bold">Error</p>
            <p>{diagramLoadError}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Volver a inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={nameInputRef}
                    defaultValue={diagramName}
                    className="h-8 text-lg font-semibold"
                    onBlur={finishEditingName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditingName();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        if (nameInputRef.current) {
                          nameInputRef.current.value = diagramName;
                        }
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={finishEditingName}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 
                    className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                    onClick={startEditingName}
                  >
                    {diagramName}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditingName}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Clean WebSocket Connection Status */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Sin conexión
                </Badge>
              )}
              

              
              <span className="text-sm text-slate-500">
                Session: {session.sessionId.substring(0, 8)}
              </span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={nodes.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Main Content - React Flow Editor */}
      <div className="flex-1">
        <UMLFlowEditorWithAI
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          diagramId={diagramId}
          onSave={handleSave}
          isCollaborating={isConnected}
          hasUnsavedChanges={true}
          onStartCollaboration={() => {}}
          onStopCollaboration={() => {}}
        />
      </div>
    </div>
  );
}
