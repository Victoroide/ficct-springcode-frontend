/**
 * Anonymous WebSocket Service for Real-time Collaboration
 * Handles WebSocket connections without authentication using session-based identification
 */

import { env } from '@/config/environment';
import { anonymousSessionService } from './anonymousSessionService';
import { v4 as uuidv4, v5 as uuidv5 } from 'uuid';

export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
}

export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onMessage?: (message: any) => void;
  onError?: (error: Event) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
  onUserJoin?: (user: AnonymousUser) => void;
  onUserLeave?: (user: AnonymousUser) => void;
  onDiagramChange?: (change: DiagramChange) => void;
  onChatMessage?: (message: ChatMessage) => void;
}

export interface AnonymousUser {
  sessionId: string;
  nickname: string;
  isConnected: boolean;
  lastSeen: Date;
}

export interface DiagramChange {
  type: 'node_add' | 'node_update' | 'node_delete' | 'edge_add' | 'edge_update' | 'edge_delete';
  data: any;
  sessionId: string;
  nickname: string;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  message: string;
  nickname: string;
  sessionId: string;
  timestamp: Date;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING', 
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

export class AnonymousWebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private handlers: WebSocketEventHandlers;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private heartbeatInterval: number;
  private messageTimeout: number;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private pendingMessages: Map<string, { resolve: Function; reject: Function; timeout: number }> = new Map();
  private diagramId: string | null = null;
  private connectedUsers: Map<string, AnonymousUser> = new Map();

  constructor(config: WebSocketConfig, handlers: WebSocketEventHandlers = {}) {
    this.config = config;
    this.handlers = handlers;
    this.maxReconnectAttempts = config.reconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 3000;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
    this.messageTimeout = config.messageTimeout || 10000;
  }

  /**
   * Connect to WebSocket server for anonymous collaboration
   * @param diagramId ID del diagrama a colaborar
   */
  async connect(diagramId: string): Promise<void> {
    // 🔧 CRITICAL: Evitar múltiples conexiones al mismo diagrama
    if ((this.connectionState === ConnectionState.CONNECTED || this.connectionState === ConnectionState.CONNECTING) && this.diagramId === diagramId) {
      if (import.meta.env.DEV) {
        console.log('✅ Ya conectado al diagrama:', diagramId);
      }
      return;
    }
    
    // Si hay una conexión activa a otro diagrama, desconectar primero
    if (this.ws && this.diagramId !== diagramId) {
      if (import.meta.env.DEV) {
        console.log('🔄 Cambiando de diagrama, desconectando:', this.diagramId, '→', diagramId);
      }
      this.disconnect();
    }

    this.diagramId = diagramId;
    this.connectionState = ConnectionState.CONNECTING;

    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL for anonymous access
        const wsUrl = this.buildWebSocketUrl(diagramId);
        
        // Create WebSocket connection
        this.ws = new WebSocket(wsUrl, this.config.protocols);

        // Set up event handlers
        this.ws.onopen = (event) => {
          if (import.meta.env.DEV) {
            console.log('✅ WebSocket connected successfully to ASGI server');
            console.log('🌐 WebSocket readyState:', this.ws?.readyState);
            console.log('📡 Connection event details:', event);
          }
          this.connectionState = ConnectionState.CONNECTED;
          this.reconnectAttempts = 0;
          this.startHeartbeat();

          // Send initial join message
          this.sendJoinMessage();

          this.handlers.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket DESCONECTADO - Código:', event.code, 'Razón:', event.reason);
          console.log('⚠️ ¿Era cierre limpio?', event.wasClean);
          this.connectionState = ConnectionState.DISCONNECTED;
          this.stopHeartbeat();
          this.handlers.onDisconnect?.(event.reason);

          // Solo reconectar si no fue un cierre limpio (código 1000)
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log('🔄 Programando reconexión...');
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ ERROR WebSocket:', error);
          console.log('🌐 Estado actual readyState:', this.ws?.readyState);
          this.connectionState = ConnectionState.ERROR;
          this.handlers.onError?.(error);
          reject(error);
        };

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.connectionState = ConnectionState.ERROR;
        reject(error);
      }
    });
  }

  /**
   * Asegura que un ID sea un UUID válido para el backend
   * 🔧 CRITICAL FIX: Garantiza IDs consistentes para evitar problemas de conexión
   */
  private ensureValidUUID(id: string): string {
    if (import.meta.env.DEV) {
      console.log('🔍 Validando UUID para WebSocket:', id);
    }
    
    // Casos especiales o valores inválidos
    if (!id || id === 'new' || id === 'undefined' || id === 'null') {
      const fallbackUUID = '00000000-0000-4000-a000-000000000001';
      if (import.meta.env.DEV) {
        console.warn('⚠️ WebSocket recibió un ID inválido:', id, '→ usando UUID fallback:', fallbackUUID);
      }
      return fallbackUUID;
    }
    
    // Verificar si ya es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket usando UUID válido:', id);
      }
      return id;
    }
    
    // Para IDs en formato 'local_*', usar un UUID fijo para consistencia
    if (id.startsWith('local_')) {
      const localFallbackUUID = '00000000-0000-4000-a000-000000000002';
      if (import.meta.env.DEV) {
        console.log('🔄 WebSocket con ID local:', id, '→ usando UUID consistente:', localFallbackUUID);
      }
      return localFallbackUUID;
    }
    
    // 🔧 CRITICAL: Usar deterministic UUID para obtener siempre el mismo ID dado un input
    // Esto garantiza que el mismo ID de diagrama siempre produce el mismo UUID
    try {
      const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // Namespace fijo para app
      const deterministicUUID = uuidv5(id, namespace); // uuidv5 es determinista
      
      if (import.meta.env.DEV) {
        console.log('🔄 Convertido ID no estándar a UUID determinístico:', id, '→', deterministicUUID);
      }
      
      return deterministicUUID;
    } catch (error) {
      // Si algo falla, caer en UUID fallback
      const emergencyUUID = '00000000-0000-4000-a000-000000000003';
      console.error('❌ Error generando UUID determinístico, usando fallback:', emergencyUUID, error);
      return emergencyUUID;
    }
  }
  
  private buildWebSocketUrl(diagramId: string): string {
    const session = anonymousSessionService.getOrCreateSession();
    
    // Convertir a UUID válido para Django
    const validUUID = this.ensureValidUUID(diagramId);
    
    // 🔧 CORRECCIÓN CRÍTICA: Conectar directamente al puerto ASGI 8001, NO nginx proxy
    // El servidor ASGI (WebSocket) corre en puerto 8001 independiente del nginx
    const wsUrl = `ws://localhost:8001/ws/diagram/${validUUID}/`;
    
    console.log('🔗 Connecting WebSocket directly to ASGI port 8001:', wsUrl);
    console.log('📋 Session ID:', session.sessionId);
    console.log('👤 Nickname:', session.nickname);
    
    return `${wsUrl}?session_id=${session.sessionId}&nickname=${encodeURIComponent(session.nickname)}`;
  }

  /**
   * Send initial join message
   */
  private sendJoinMessage(): void {
    const session = anonymousSessionService.getOrCreateSession();
    this.sendMessage({
      type: 'user_join',
      sessionId: session.sessionId,
      nickname: session.nickname,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'user_join':
          this.handleUserJoin(message);
          break;
        case 'user_leave':
          this.handleUserLeave(message);
          break;
        case 'diagram_change':
          this.handleDiagramChange(message);
          break;
        case 'chat_message':
          this.handleChatMessage(message);
          break;
        case 'users_list':
          this.handleUsersList(message);
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          this.handlers.onMessage?.(message);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  /**
   * Handle user join event
   */
  private handleUserJoin(message: any): void {
    const user: AnonymousUser = {
      sessionId: message.sessionId,
      nickname: message.nickname,
      isConnected: true,
      lastSeen: new Date()
    };

    this.connectedUsers.set(message.sessionId, user);
    this.handlers.onUserJoin?.(user);
  }

  /**
   * Handle user leave event
   */
  private handleUserLeave(message: any): void {
    const user = this.connectedUsers.get(message.sessionId);
    if (user) {
      user.isConnected = false;
      this.handlers.onUserLeave?.(user);
      this.connectedUsers.delete(message.sessionId);
    }
  }

  /**
   * Handle diagram change event
   */
  private handleDiagramChange(message: any): void {
    const change: DiagramChange = {
      type: message.changeType,
      data: message.data,
      sessionId: message.sessionId,
      nickname: message.nickname,
      timestamp: new Date(message.timestamp)
    };

    this.handlers.onDiagramChange?.(change);
  }

  /**
   * Handle chat message event
   */
  private handleChatMessage(message: any): void {
    const chatMessage: ChatMessage = {
      id: message.id,
      message: message.message,
      nickname: message.nickname,
      sessionId: message.sessionId,
      timestamp: new Date(message.timestamp)
    };

    this.handlers.onChatMessage?.(chatMessage);
  }

  /**
   * Handle users list update
   */
  private handleUsersList(message: any): void {
    this.connectedUsers.clear();
    message.users.forEach((user: any) => {
      this.connectedUsers.set(user.sessionId, {
        sessionId: user.sessionId,
        nickname: user.nickname,
        isConnected: true,
        lastSeen: new Date(user.lastSeen)
      });
    });
  }

  /**
   * Send a diagram change to other users
   */
  sendDiagramChange(changeType: string, data: any): void {
    const session = anonymousSessionService.getOrCreateSession();
    this.sendMessage({
      type: 'diagram_change',
      changeType,
      data,
      sessionId: session.sessionId,
      nickname: session.nickname,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send a chat message
   */
  sendChatMessage(message: string): void {
    const session = anonymousSessionService.getOrCreateSession();
    this.sendMessage({
      type: 'chat_message',
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message,
      sessionId: session.sessionId,
      nickname: session.nickname,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send message through WebSocket
   */
  private sendMessage(message: any): void {
    if (this.ws && this.connectionState === ConnectionState.CONNECTED) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
      }
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.connectionState === ConnectionState.CONNECTED) {
        this.sendMessage({ type: 'ping', timestamp: new Date().toISOString() });
      }
    }, this.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.connectionState = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;

    // Exponential backoff with jitter
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    const jitter = Math.random() * 1000;
    const finalDelay = delay + jitter;

    console.log(`🔄 Scheduling reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${finalDelay.toFixed(0)}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        this.handlers.onReconnect?.(this.reconnectAttempts);
        if (this.diagramId) {
          await this.connect(this.diagramId);
        }
      } catch (error) {
        console.error('❌ Reconnection attempt failed:', error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('🔴 Max reconnection attempts reached. Giving up.');
          this.handlers.onReconnectFailed?.();
        } else {
          this.scheduleReconnect();
        }
      }
    }, finalDelay);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    this.connectionState = ConnectionState.DISCONNECTED;
    this.connectedUsers.clear();
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get list of connected users
   */
  getConnectedUsers(): AnonymousUser[] {
    return Array.from(this.connectedUsers.values());
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED;
  }
}

export default AnonymousWebSocketService;
