/**
 * UML Collaboration Service
 * Integrates WebSocket for real-time collaboration with diagram persistence
 */

import { AnonymousWebSocketService } from './anonymousWebSocketService';
import type { WebSocketConfig, WebSocketEventHandlers } from './anonymousWebSocketService';
import { diagramService } from './diagramService';
import type { DiagramData } from './diagramService';
import { anonymousSessionService } from './anonymousSessionService';
import { env } from '@/config/environment';

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
    console.log('🔧 UMLCollaborationService inicializado');
  }

  /**
   * Initialize collaboration for a diagram
   */
  async initializeDiagram(diagramId: string, events: CollaborationEvents = {}): Promise<DiagramData | null> {
    // 🔧 CRITICAL: Evitar re-inicialización si ya está inicializado para el mismo diagrama
    if (this.currentDiagramId === diagramId && this.wsService?.isConnected()) {
      if (import.meta.env.DEV) {
        console.log('⚙️ Ya está inicializado para diagrama:', diagramId);
      }
      return null; // Ya inicializado
    }
    
    if (import.meta.env.DEV) {
      console.log('🚀 Inicializando colaboración para diagrama:', diagramId);
    }
    
    this.currentDiagramId = diagramId;
    this.events = events;

    try {
      let diagram: DiagramData | null = null;

      // Si es un ID válido, intentar cargar el diagrama existente
      if (diagramId && diagramId !== 'new') {
        try {
          diagram = await diagramService.getDiagram(diagramId);
          console.log('📋 Diagrama existente cargado:', diagram);
        } catch (error) {
          console.warn('⚠️ No se pudo cargar diagrama existente, creando uno nuevo:', error);
          diagram = null;
        }
      }

      // Conectar WebSocket para colaboración en tiempo real
      await this.connectWebSocket(diagramId);

      return diagram;
    } catch (error) {
      console.error('❌ Error inicializando colaboración:', error);
      return null;
    }
  }

  /**
   * Connect WebSocket for real-time collaboration
   */
  private async connectWebSocket(diagramId: string): Promise<void> {
    // 🔧 CRITICAL: Solo desconectar si es un diagrama diferente
    if (this.wsService && this.currentDiagramId !== diagramId) {
      if (import.meta.env.DEV) {
        console.log('🔄 Cambiando de diagrama, desconectando WebSocket anterior');
      }
      this.wsService.disconnect();
    } else if (this.wsService?.isConnected()) {
      // Ya conectado al mismo diagrama
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket ya conectado para diagrama:', diagramId);
      }
      return;
    }

    const config: WebSocketConfig = {
      url: env.apiConfig.baseUrl,
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      heartbeatInterval: 30000,
      messageTimeout: 10000,
    };

    const handlers: WebSocketEventHandlers = {
      onConnect: () => {
        // Log solo en desarrollo
        if (import.meta.env.DEV) {
          console.log('✅ WebSocket conectado para diagrama:', diagramId);
        }
        this.events.onConnectionStatus?.(true);
      },
      onDisconnect: (reason: string) => {
        if (import.meta.env.DEV) {
          console.log('🔌 WebSocket desconectado:', reason);
        }
        this.events.onConnectionStatus?.(false);
      },
      onError: (error: Event) => {
        console.error('❌ Error WebSocket:', error);
        this.events.onConnectionStatus?.(false);
      },
      onUserJoin: (user) => {
        console.log('👋 Usuario conectado:', user);
        this.events.onUserJoined?.(user);
      },
      onUserLeave: (user) => {
        console.log('👋 Usuario desconectado:', user);
        this.events.onUserLeft?.(user);
      },
      onDiagramChange: (change) => {
        console.log('🔄 Cambio en diagrama recibido:', change);
        this.events.onDiagramUpdate?.(change);
      },
      onChatMessage: (message) => {
        console.log('💬 Mensaje de chat:', message);
        this.events.onChatMessage?.(message);
      },
    };

    this.wsService = new AnonymousWebSocketService(config, handlers);
    
    try {
      await this.wsService.connect(diagramId);
    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
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
    console.log('💾 Guardando diagrama...', diagramData);

    try {
      let result: DiagramData;

      if (this.currentDiagramId && this.currentDiagramId !== 'new') {
        // Actualizar diagrama existente
        result = await diagramService.updateDiagram(this.currentDiagramId, {
          title: diagramData.title,
          content: diagramData.content,
          layout_config: diagramData.layout_config,
        });
      } else {
        // Crear nuevo diagrama
        result = await diagramService.createDiagram({
          title: diagramData.title,
          content: diagramData.content,
          diagram_type: diagramData.diagram_type || 'CLASS',
          layout_config: diagramData.layout_config,
        });

        // Actualizar el ID actual
        this.currentDiagramId = result.id!;
        
        // Reconectar WebSocket al nuevo diagrama
        await this.connectWebSocket(this.currentDiagramId);
      }

      // Broadcast cambios via WebSocket
      this.broadcastDiagramChange(diagramData.content);

      console.log('✅ Diagrama guardado exitosamente:', result);
      return result;
    } catch (error) {
      console.error('❌ Error guardando diagrama:', error);
      throw error;
    }
  }

  /**
   * Broadcast diagram changes to other users
   */
  private broadcastDiagramChange(content: any): void {
    if (this.wsService && this.wsService.isConnected()) {
      this.wsService.sendDiagramChange('diagram_update', {
        content: content,
        timestamp: new Date().toISOString(),
      });
      console.log('📡 Cambios enviados a otros usuarios');
    }
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    if (this.wsService && this.wsService.isConnected()) {
      this.wsService.sendChatMessage(message);
      console.log('💬 Mensaje de chat enviado:', message);
    }
  }

  /**
   * Get connected users
   */
  getConnectedUsers() {
    return this.wsService?.getConnectedUsers() || [];
  }

  /**
   * Check connection status
   */
  isConnected(): boolean {
    return this.wsService?.isConnected() || false;
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
    console.log('🔌 Colaboración desconectada');
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
      console.log('💫 Handlers actualizados:', Object.keys(this.events));
    }
  }

  /**
   * 🔧 CRITICAL FIX: Send title update via WebSocket
   * @param diagramId ID del diagrama
   * @param title Nuevo título
   */
  async sendTitleUpdate(diagramId: string, title: string): Promise<void> {
    if (!this.wsService?.isConnected() || !this.currentDiagramId) {
      throw new Error('WebSocket no está conectado');
    }
    
    if (import.meta.env.DEV) {
      console.log('💬 Enviando actualización de título:', title);
    }
    
    // Enviar mensaje de cambio de título usando el método público disponible
    this.wsService.sendDiagramChange('title_changed', {
      title,
      diagramId,
      timestamp: Date.now()
    });
    
    return Promise.resolve();
  }
}

// Export singleton instance
export const umlCollaborationService = new UMLCollaborationService();
export default umlCollaborationService;
