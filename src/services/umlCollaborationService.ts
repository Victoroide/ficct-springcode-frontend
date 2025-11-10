/**
 * UML Collaboration Service
 * Integrates WebSocket for real-time collaboration with diagram persistence
 * 
 * IMPLEMENTACIÓN DEL CONTRATO UNIVERSAL DE COLABORACIÓN
 * ========================================================
 * Este servicio sirve como intermediario entre la UI de React Flow y el servicio
 * WebSocket, implementando el contrato universal de colaboración para garantizar
 * la comunicación efectiva entre el frontend y el backend.
 *
 * PUNTOS DE VALIDACIÓN DEL CONTRATO:
 * 
 * 1. FORMATOS DE DATOS:
 *    - Diagrama: { nodes, edges, title }
 *    - Nodo UML: { id, data: { label, methods, attributes }, position, ... }
 *    - Edge UML: { id, source, target, type, data: { relationshipType } }
 * 
 * 2. TRANSMISIÓN DE CAMBIOS:
 *    - Cambios locales se envían como 'diagram_change'
 *    - Incluyen identificación de sesión para evitar ecos
 *    - Contienen timestamp para permitir deduplicación
 *
 * 3. PROCESAMIENTO DE RESPUESTAS API:
 *    - Extracción de estructura content.nodes y content.edges
 *    - Procesamiento de active_sessions para mostrar usuarios conectados
 */

import { AnonymousWebSocketService } from './anonymousWebSocketService';
import type { WebSocketConfig, WebSocketEventHandlers, DiagramChangeMessage } from './anonymousWebSocketService';
import { diagramService } from './diagramService';
import type { DiagramData } from './diagramService';
import { anonymousSessionService } from './anonymousSessionService';
import { env } from '@/config/environment';

/**
 * CONTRACT-COMPLIANT: Interfaces para el Universal Collaboration Contract
 */

/**
 * Estructura de nodo UML según el contrato
 */
export interface UMLNode {
  id: string;
  data: {
    label: string;
    methods?: any[];
    nodeType?: string;
    attributes?: any[];
    isAbstract?: boolean;
  };
  type?: string;
  width?: number;
  height?: number;
  position: { x: number, y: number };
  positionAbsolute?: { x: number, y: number };
  // Campos adicionales para compatibilidad
  [key: string]: any;
}

/**
 * Estructura de relación (edge) UML según el contrato
 */
export interface UMLEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: {
    relationshipType?: string;
    [key: string]: any;
  };
  // Campos adicionales para compatibilidad
  [key: string]: any;
}

/**
 * Estructura de contenido de diagrama según el contrato
 */
export interface DiagramContent {
  nodes: UMLNode[];
  edges: UMLEdge[];
  title?: string;
  // Campos adicionales para compatibilidad
  [key: string]: any;
}

/**
 * Estructura de mensajes de cambio de diagrama compliant con el contrato
 */
export interface DiagramChangeData {
  nodes?: UMLNode[];
  edges?: UMLEdge[];
  title?: string;
  from_session?: string;
  // Campos adicionales para compatibilidad
  [key: string]: any;
}

/**
 * Estructura de sesión activa según el contrato
 */
export interface ActiveSession {
  session_id: string;
  nickname: string;
  joined_at: string;
}

export interface CollaborationEvents {
  onDiagramUpdate?: (data: any) => void;
  onUserJoined?: (user: any) => void;
  onUserLeft?: (user: any) => void;
  onChatMessage?: (message: any) => void;
  onConnectionStatus?: (connected: boolean) => void;
}

export class UMLCollaborationService {
  private wsService: AnonymousWebSocketService | null = null;
  private currentDiagramId: string | null = null;
  private events: CollaborationEvents = {};

  constructor() {
  }
  
  // Método getWebSocketService movido al final de la clase

  /**
   * Initialize collaboration for a diagram
   */
  async initializeDiagram(diagramId: string, events: CollaborationEvents = {}): Promise<DiagramData | null> {
    // 🔧 CRITICAL: Evitar re-inicialización si ya está inicializado para el mismo diagrama
    if (this.currentDiagramId === diagramId && this.wsService?.isConnected()) {
      if (import.meta.env.DEV) {
      }
      return null; // Ya inicializado
    }
    
    if (import.meta.env.DEV) {
    }
    
    this.currentDiagramId = diagramId;
    this.events = events;

    try {
      let diagram: DiagramData | null = null;

      // Si es un ID válido, intentar cargar el diagrama existente
      if (diagramId && diagramId !== 'new') {
        try {
          diagram = await diagramService.getDiagram(diagramId);
          if (import.meta.env.DEV) {
          }
        } catch (error) {
          console.warn('⚠️ No se pudo cargar diagrama existente, creando uno nuevo:', error);
          diagram = null;
        }
      }

      // Conectar WebSocket para colaboración en tiempo real
      await this.connectWebSocket(diagramId);
      
      if (import.meta.env.DEV) {
      }
      
      return diagram;
    } catch (error) {
      console.error('Error inicializando colaboración:', error);
      return null;
    }
  }

  /**
   * Connect WebSocket for real-time collaboration
   * 🔧 CRITICAL FIX: Improved connection status synchronization
   */
  private async connectWebSocket(diagramId: string): Promise<void> {
    // 🔧 CRITICAL FIX: Solo desconectar si es un diagrama diferente
    if (this.wsService && this.currentDiagramId !== diagramId) {
      if (import.meta.env.DEV) {
      }
      this.wsService.disconnect();
      // CRITICAL FIX: Immediately notify disconnected state with delay to prevent race conditions
      setTimeout(() => this.events.onConnectionStatus?.(false), 0);
    } else if (this.wsService?.isConnected()) {
      // Ya conectado al mismo diagrama
      if (import.meta.env.DEV) {
      }
      // CRITICAL FIX: Notificar estado actual de la conexión con delay
      setTimeout(() => this.events.onConnectionStatus?.(true), 0);
      return;
    }

    const config: WebSocketConfig = {
      url: env.apiConfig.wsUrl,  // CRITICAL FIX: Usar URL específica para WebSocket (ASGI - puerto 8001)
      // CRITICAL FIX: Incrementar intentos de reconexión y reducir delay para mejor UX
      reconnectAttempts: 10,
      reconnectDelay: 2000,
      heartbeatInterval: 15000, // Más frecuente para detectar desconexiones más rápido
      messageTimeout: 8000,
    };

    const handlers: WebSocketEventHandlers = {
      onConnect: () => {
        // Log solo en desarrollo
        if (import.meta.env.DEV) {
        }
        // 🔧 CRITICAL FIX: Always notify connection status change immediately
        this.events.onConnectionStatus?.(true);
      },
      onDisconnect: (reason: string) => {
        if (import.meta.env.DEV) {
        }
        // 🔧 CRITICAL FIX: Always notify disconnection immediately
        this.events.onConnectionStatus?.(false);
      },
      onError: (error: Event) => {
        console.error('Error WebSocket:', error);
        // 🔧 CRITICAL FIX: Always notify error state as disconnected
        this.events.onConnectionStatus?.(false);
      },
      onUserJoin: (user) => {
        // CRITICAL FIX: Solo log detallado en desarrollo
        if (import.meta.env.DEV) {
        }
        // Notificar al callback registrado
        this.events.onUserJoined?.(user);
      },
      onUserLeave: (user) => {
        if (import.meta.env.DEV) {
        }
        this.events.onUserLeft?.(user);
      },
      onDiagramChange: (change) => {
        if (import.meta.env.DEV) {
        }
        // 🔧 CRITICAL FIX: Broadcast change with proper type mapping
        const mappedChange = {
          ...change,
          type: change.change_type || change.type || 'diagram_update'
        };
        this.events.onDiagramUpdate?.(mappedChange);
      },
      onChatMessage: (message) => {
        if (import.meta.env.DEV) {
        }
        this.events.onChatMessage?.(message);
      },
      // CRITICAL FIX: Añadir handlers para reconexión
      onReconnect: (attempt) => {
      },
      onReconnectFailed: () => {
        console.error('Reconexión fallida después de varios intentos');
        this.events.onConnectionStatus?.(false);
      }
    };

    this.wsService = new AnonymousWebSocketService(config, handlers);
    
    try {
      // 🔧 CRITICAL FIX: Don't notify false status here, let connection handlers manage it
      await this.wsService.connect(diagramId);
      // Connection success will be notified via the onConnect handler
    } catch (error) {
      console.error('Error conectando WebSocket:', error);
      // Only notify false on actual connection failure
      this.events.onConnectionStatus?.(false);
      throw error;
    }
  }

  /**
   * Save diagram changes
   */
  async saveDiagram(diagramData: {
    title: string;
    content: any;
    diagram_type?: 'CLASS' | 'SEQUENCE' | 'USE_CASE' | 'ACTIVITY';
    layout_config?: any;
  }): Promise<DiagramData> {

    try {
      // CRITICAL FIX: Guardar diagrama via API
      const result = await diagramService.createOrUpdateDiagram({
        title: diagramData.title,
        diagram_type: diagramData.diagram_type,
        content: {
          nodes: diagramData.content.nodes,
          edges: diagramData.content.edges,
        }
      });
      
      // Si estamos conectados, inicializar colaboración
      if (this.wsService && this.currentDiagramId) {
        await this.connectWebSocket(this.currentDiagramId);
      }

      return result;
    } catch (error) {
      console.error('Error saving diagram:', error);
      throw error;
    }
  }
  
  /**
   * CONTRACT-COMPLIANT: Broadcast diagram changes to other users with diagram_change message type
   * @param diagramData Datos completos o parciales del diagrama
   * @returns Promise que se resuelve cuando los mensajes se han enviado correctamente
   */
  public async broadcastDiagram(diagramData: Partial<DiagramContent>): Promise<void> {
    if (this.wsService && this.wsService.isConnected()) {
      // CONTRACT-COMPLIANT: Enviar diagrama en formato que cumpla con contrato
      this.wsService.sendDiagramChange('diagram_change', {
        nodes: diagramData.nodes,
        edges: diagramData.edges,
        title: diagramData.title
      });
      
      // También enviar formatos específicos para compatibilidad con clientes legacy
      if (diagramData.nodes) {
        this.broadcastDiagramChange('nodes_changed', {
          nodes: diagramData.nodes
        });
      }
      
      if (diagramData.edges) {
        this.broadcastDiagramChange('edges_changed', {
          edges: diagramData.edges
        });
      }
      
      if (import.meta.env.DEV) {
      }
      return Promise.resolve();
    }
    
    // Si no hay conexión, resolver la promesa igualmente
    return Promise.resolve();
  }
  sendChatMessage(message: string): void {
    if (this.wsService && this.wsService.isConnected()) {
      this.wsService.sendChatMessage(message);
    }
  }

  /**
   * Get connected users
   */
  getConnectedUsers() {
    return this.wsService?.getConnectedUsers() || [];
  }

  /**
   * 🔧 CRITICAL FIX: Robust connection status check
   * Check connection status with additional validation
   */
  isConnected(): boolean {
    // Multi-layer validation for connection status
    const hasService = !!this.wsService;
    const serviceConnected = this.wsService?.isConnected() || false;
    const hasDiagramId = !!this.currentDiagramId;
    
    const isConnected = hasService && serviceConnected && hasDiagramId;
    
    return isConnected;
  }
  
  /**
   * 🔧 CRITICAL FIX: Force connection status refresh
   * Esta función fuerza una actualización del estado de conexión en la UI
   */
  refreshConnectionStatus(): void {
    const isConnected = this.isConnected();
    // UNIVERSAL FIX: Reduced logging noise
    if (import.meta.env.DEV) {
    }
    // Use immediate callback to prevent timing issues
    this.events.onConnectionStatus?.(isConnected);
  }
  
  /**
   * Get WebSocket service instance (for debugging)
   */
  getWebSocketService(): AnonymousWebSocketService | null {
    return this.wsService;
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.wsService) {
      this.wsService.disconnect();
      this.wsService = null;
    }
    this.currentDiagramId = null;
    this.events = {};
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    return await diagramService.checkHealth();
  }

  /**
   * Get current diagram ID
   */
  getCurrentDiagramId(): string | null {
    return this.currentDiagramId;
  }
  
  /**
   * 🔧 CRITICAL FIX: Update event handlers
   * @param handlers Event handlers to update
   */
  updateHandlers(handlers: Partial<CollaborationEvents>): void {
    this.events = { ...this.events, ...handlers };
    if (import.meta.env.DEV) {
    }
  }

  /**
   * CONTRACT-COMPLIANT: Title update broadcasting with proper message format
   * @param diagramId ID del diagrama
   * @param title Nuevo título
   * @param senderId Optional sender session ID to prevent echo loops
   */
  async sendTitleUpdate(diagramId: string, title: string, senderId?: string): Promise<void> {
    if (!this.wsService?.isConnected() || !this.currentDiagramId) {
      if (import.meta.env.DEV) {
      }
      return Promise.resolve(); // Don't throw, just skip
    }
    
    if (import.meta.env.DEV) {
    }
    
    // Get current session for tracking
    const sessionInfo = anonymousSessionService.getOrCreateSession();
    const actualSenderId = senderId || sessionInfo.sessionId;
    
    // Format 1: CONTRACT-COMPLIANT title_changed event using broadcastDiagramChange
    const titleChangeData: DiagramChangeData = {
      title: title,
      from_session: actualSenderId
    };
    
    this.broadcastDiagramChange('title_changed', titleChangeData);
    
    // Format 2: CONTRACT-COMPLIANT diagram_change with title in proper structure
    this.broadcastDiagramChange('diagram_change', titleChangeData);
    
    return Promise.resolve();
  }
  
  /**
   * CONTRACT-COMPLIANT: Single message broadcast with proper format
   * @param changeType Type of message to send
   * @param data Message data compatible with contract
   */
  public broadcastDiagramChange(changeType: string, data: Partial<DiagramChangeData>): void {
    if (!this.wsService || !this.currentDiagramId) {
      return;
    }
    
    const sessionId = anonymousSessionService.getOrCreateSession().sessionId;
    
    // CONTRACT-COMPLIANCE: Format according to contract requirements
    const messageData: DiagramChangeData = {
      ...data,
      from_session: data.from_session || sessionId
    };
    
    // Send using the contract-compliant method
    this.wsService.sendDiagramChange(changeType, messageData);
  }
}

// Export singleton instance
export const umlCollaborationService = new UMLCollaborationService();
export default umlCollaborationService;
