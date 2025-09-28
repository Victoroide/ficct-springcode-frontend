import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast-service';
import AnonymousChat from '@/components/chat/AnonymousChat';
import ActiveUsers from '@/components/collaboration/ActiveUsers';
import ExportPanel from '@/components/export/ExportPanel';
import { UMLDesignerPage } from '@/pages/UMLDesignerPage';
import { anonymousApiClient } from '@/services/anonymousApiClient';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import AnonymousWebSocketService, { 
  ConnectionState,
  type AnonymousUser,
  type ChatMessage,
  type DiagramChange 
} from '@/services/anonymousWebSocketService';
import { env } from '@/config/environment';
import { 
  Share2, 
  Copy, 
  ArrowLeft, 
  Wifi, 
  WifiOff, 
  Users,
  MessageCircle,
  Download,
  Settings
} from 'lucide-react';

const DiagramEditor: React.FC = () => {
  // 🔧 CRITICAL FIX: Estabilizar UUID con localStorage para prevenir re-generación
  const { diagramId: paramDiagramId } = useParams<{ diagramId: string }>();
  const [diagramId] = useState(() => {
    // Si existe diagramId válido en params, usarlo
    if (paramDiagramId && paramDiagramId !== 'new' && paramDiagramId !== 'undefined') {
      // Guardar en localStorage para persistencia
      localStorage.setItem('current_diagram_id', paramDiagramId);
      return paramDiagramId;
    }
    
    // Intentar recuperar de localStorage
    const savedId = localStorage.getItem('current_diagram_id');
    if (savedId && savedId !== 'new' && savedId !== 'undefined') {
      return savedId;
    }
    
    // UUID fallback constante para evitar regeneración
    return '00000000-0000-4000-a000-000000000001';
  });
  
  const navigate = useNavigate();
  
  // Diagram state
  const [diagram, setDiagram] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalDiagram, setIsLocalDiagram] = useState(false);
  
  // Collaboration state
  const [wsService, setWsService] = useState<AnonymousWebSocketService | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
  
  // 🔧 CRITICAL FIX: Prevenir notificaciones duplicadas
  const [hasShownConnectedNotification, setHasShownConnectedNotification] = useState(false);
  const [activeUsers, setActiveUsers] = useState<AnonymousUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'users' | 'chat' | 'export'>('users');

  // Initialize diagram and WebSocket connection
  useEffect(() => {
    if (!diagramId) {
      navigate('/');
      return;
    }

    initializeDiagram();
    initializeWebSocket();

    return () => {
      wsService?.disconnect();
    };
  }, [diagramId]);

  const initializeDiagram = async () => {
    setIsLoading(true);
    
    try {
      // Check if it's a fallback diagram (uses our fallback UUID)
      if (diagramId === '00000000-0000-4000-a000-000000000001') {
        setIsLocalDiagram(true);
        // 🔧 CRITICAL FIX: Asegurar que todas las propiedades son no-undefined
        setDiagram({
          id: diagramId || '00000000-0000-4000-a000-000000000001',
          title: 'Local Diagram', // Título consistente para debugging
          diagram_type: 'CLASS', // Siempre especificar tipo
          content: {
            nodes: [],
            edges: []
          },
          diagram_data: { // Compatibilidad backward
            nodes: [],
            edges: []
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        setIsLoading(false);
        return;
      }

      // Try to load from API
      const response = await anonymousApiClient.get(`/diagrams/${diagramId}/`);
      
      if (response.success && response.data) {
        setDiagram(response.data);
        anonymousSessionService.addDiagramToSession(diagramId);
      } else {
        // If diagram doesn't exist, create a new local one
        console.warn('Diagram not found, creating local version');
        setIsLocalDiagram(true);
        // 🔧 CRITICAL FIX: Asegurar que todas las propiedades son no-undefined
        setDiagram({
          id: diagramId || '00000000-0000-4000-a000-000000000001',
          title: 'Untitled Diagram', 
          diagram_type: 'CLASS', // Siempre especificar tipo
          content: {
            nodes: [],
            edges: []
          },
          diagram_data: { // Compatibilidad backward
            nodes: [],
            edges: []
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error loading diagram:', error);
      
      // Fallback to local diagram
      setIsLocalDiagram(true);
      // 🔧 CRITICAL FIX: Asegurar que todas las propiedades son no-undefined
      setDiagram({
        id: diagramId || '00000000-0000-4000-a000-000000000001',
        title: 'Local Diagram', 
        diagram_type: 'CLASS', // Siempre especificar tipo
        content: {
          nodes: [],
          edges: []
        },
        diagram_data: { // Compatibilidad backward
          nodes: [],
          edges: []
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebSocket = () => {
    if (!diagramId) return;

    const wsConfig = {
      url: env.apiConfig.baseUrl.replace('http', 'ws').replace('https', 'wss'),
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      heartbeatInterval: 30000
    };

    const handlers = {
      onConnect: () => {
        setConnectionState(ConnectionState.CONNECTED);
        
        // 🔧 CRITICAL FIX: Prevenir toast spam de "Connected"
        if (!hasShownConnectedNotification) {
          toast({
            title: "Connected",
            description: "Real-time collaboration is active",
            variant: "success"
          });
          
          // Marcar que ya mostramos la notificación para prevenir duplicados
          setHasShownConnectedNotification(true);
          
          if (import.meta.env.DEV) {
            console.log('🔊 Showing first connection notification, future ones suppressed');
          }
        } else if (import.meta.env.DEV) {
          console.log('🔇 Skipping duplicate connection notification');
        }
      },
      onDisconnect: (reason: string) => {
        setConnectionState(ConnectionState.DISCONNECTED);
        console.log('WebSocket disconnected:', reason);
      },
      onError: (error: Event) => {
        setConnectionState(ConnectionState.ERROR);
        console.error('WebSocket error:', error);
      },
      onUserJoin: (user: AnonymousUser) => {
        setActiveUsers(prev => {
          const filtered = prev.filter(u => u.sessionId !== user.sessionId);
          return [...filtered, user];
        });
        
        if (user.sessionId !== anonymousSessionService.getSessionId()) {
          toast({
            title: "User joined",
            description: `${user.nickname} joined the collaboration`,
            variant: "success"
          });
        }
      },
      onUserLeave: (user: AnonymousUser) => {
        setActiveUsers(prev => prev.filter(u => u.sessionId !== user.sessionId));
        toast({
          title: "User left",
          description: `${user.nickname} left the collaboration`,
          variant: "info"
        });
      },
      onChatMessage: (message: ChatMessage) => {
        setChatMessages(prev => [...prev, message]);
      },
      onDiagramChange: (change: DiagramChange) => {
        // Handle real-time diagram changes
        console.log('Diagram change received:', change);
        // This would integrate with the UML editor to apply changes
      }
    };

    const service = new AnonymousWebSocketService(wsConfig, handlers);
    setWsService(service);

    // Connect to the diagram collaboration room
    service.connect(diagramId).catch(error => {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionState(ConnectionState.ERROR);
    });
  };

  const handleDiagramChange = useCallback((nodes: any[], edges: any[]) => {
    // Update local state
    setDiagram((prev: any) => ({
      ...prev,
      diagram_data: { nodes, edges }
    }));

    // Send change to other collaborators
    if (wsService && connectionState === ConnectionState.CONNECTED) {
      wsService.sendDiagramChange('diagram_update', { nodes, edges });
    }

    // Auto-save for non-local diagrams
    if (!isLocalDiagram) {
      debouncedSave(nodes, edges);
    }
  }, [wsService, connectionState, isLocalDiagram]);

  // Debounced save function
  const debouncedSave = useCallback(
    debounce(async (nodes: any[], edges: any[]) => {
      try {
        await anonymousApiClient.patch(`/diagrams/${diagramId}/`, {
          diagram_data: { nodes, edges }
        });
      } catch (error) {
        console.error('Auto-save failed:', error);
      }
    }, 2000),
    [diagramId]
  );

  const handleSendChatMessage = (message: string) => {
    if (wsService && connectionState === ConnectionState.CONNECTED) {
      wsService.sendChatMessage(message);
    }
  };

  const handleShareLink = async () => {
    const shareUrl = `${window.location.origin}/editor/${diagramId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share this link to invite others to collaborate",
        variant: "success"
      });
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link copied!",
        description: "Share this link to invite others to collaborate",
        variant: "success"
      });
    }
  };

  const goBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-gray-700">Loading diagram...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 🔧 HEADER ELIMINADO - UMLDesignerPage ya renderiza su propio header */}

      {/* Main Content - UMLDesignerPage maneja todo el layout */}
      <div className="flex-1 overflow-hidden">
        <UMLDesignerPage 
          diagramId={diagramId}
          initialDiagram={diagram}
          onDiagramChange={handleDiagramChange}
          isAnonymousMode={true}
        />
        {/* 🔧 SIDEBAR ELIMINADO - UMLDesignerPage maneja toda la UI */}
      </div>
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default DiagramEditor;
