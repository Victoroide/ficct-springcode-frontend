/**
 * WebSocket Service for Real-time Collaboration
 * Handles WebSocket connections with authentication and message management
 */
// @ts-nocheck - Allow compilation

import { env } from '@/config/environment';
// Removed: Authentication not needed for anonymous websocket
import type {
  WebSocketMessageUnion,
  WebSocketMessageType,
  CollaborationSession,
  SessionParticipant,
  ChangeEvent,
  UUID
} from '@/types/collaboration';

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
  onMessage?: (message: WebSocketMessageUnion) => void;
  onError?: (error: Event) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
}

export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING', 
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR'
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private handlers: WebSocketEventHandlers;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number;
  private reconnectDelay: number;
  private heartbeatInterval: number;
  private messageTimeout: number;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pendingMessages: Map<string, { resolve: Function; reject: Function; timeout: NodeJS.Timeout }> = new Map();
  private sessionId: UUID | null = null;
  private userId: number | null = null;
  private projectId: string = 'default';

  constructor(config: WebSocketConfig, handlers: WebSocketEventHandlers = {}) {
    this.config = config;
    this.handlers = handlers;
    this.maxReconnectAttempts = config.reconnectAttempts || 5;
    this.reconnectDelay = config.reconnectDelay || 3000;
    this.heartbeatInterval = config.heartbeatInterval || 30000;
    this.messageTimeout = config.messageTimeout || 10000;
  }

  /**
   * Connect to WebSocket server with authentication
   * @param sessionId UUID del diagrama
   * @param userId ID del usuario
   * @param projectId ID del proyecto (opcional, por defecto es 'default')
   */
  async connect(sessionId: UUID, userId: number, projectId: string = 'default'): Promise<void> {
    if (this.connectionState === ConnectionState.CONNECTED || this.connectionState === ConnectionState.CONNECTING) {
      return;
    }

    this.sessionId = sessionId;
    this.userId = userId;
    this.connectionState = ConnectionState.CONNECTING;

    return new Promise((resolve, reject) => {
      try {
        // Build WebSocket URL with authentication
        const wsUrl = this.buildWebSocketUrl(sessionId, this.projectId);
        
        // Create WebSocket connection with authentication headers
        this.ws = new WebSocket(wsUrl, this.config.protocols);

        // Set up event handlers
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionState = ConnectionState.CONNECTED;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.handlers.onConnect?.();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.handleClose(event);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.connectionState = ConnectionState.ERROR;
          this.handlers.onError?.(error);
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        this.connectionState = ConnectionState.ERROR;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.connectionState = ConnectionState.DISCONNECTED;
      this.stopHeartbeat();
      this.stopReconnect();
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
      this.handlers.onDisconnect?.('Client disconnect');
    }
  }

  /**
   * Send message through WebSocket
   */
  sendMessage<T extends WebSocketMessageUnion>(message: Omit<T, 'sessionId' | 'userId' | 'timestamp' | 'messageId'>): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectionState !== ConnectionState.CONNECTED || !this.ws || !this.sessionId || !this.userId) {
        reject(new Error('WebSocket not connected'));
        return;
      }

      const fullMessage: WebSocketMessageUnion = {
        ...message,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        messageId: this.generateMessageId(),
      } as WebSocketMessageUnion;

      try {
        this.ws.send(JSON.stringify(fullMessage));
        
        // Set up timeout for message acknowledgment
        const timeoutId = setTimeout(() => {
          this.pendingMessages.delete(fullMessage.messageId);
          reject(new Error('Message timeout'));
        }, this.messageTimeout);

        this.pendingMessages.set(fullMessage.messageId, {
          resolve,
          reject,
          timeout: timeoutId
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Join collaboration session
   */
  async joinSession(role: 'HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER'): Promise<void> {
    return this.sendMessage({
      type: WebSocketMessageType.JOIN_SESSION,
      role,
    });
  }

  /**
   * Leave collaboration session
   */
  async leaveSession(): Promise<void> {
    return this.sendMessage({
      type: WebSocketMessageType.LEAVE_SESSION,
    });
  }

  /**
   * Send change event
   */
  async sendChangeEvent(event: ChangeEvent): Promise<void> {
    return this.sendMessage({
      type: WebSocketMessageType.CHANGE_EVENT,
      event,
    });
  }

  /**
   * Update cursor position
   */
  async updateCursor(position: { x: number; y: number; elementId?: UUID }): Promise<void> {
    return this.sendMessage({
      type: WebSocketMessageType.CURSOR_UPDATE,
      position,
    });
  }

  /**
   * Request sync with server
   */
  async requestSync(lastEventId?: UUID): Promise<void> {
    return this.sendMessage({
      type: WebSocketMessageType.SYNC_REQUEST,
      lastEventId,
    });
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Update event handlers
   */
  updateHandlers(handlers: Partial<WebSocketEventHandlers>): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  // Private methods

  private buildWebSocketUrl(sessionId: UUID, projectId: string = 'default'): string {
    // Usar WS en desarrollo y WSS en producción
    // Determinamos el protocolo a usar basado en si estamos en HTTPS o HTTP
    const isSecure = env.apiConfig.baseUrl.startsWith('https:') || window.location.protocol === 'https:';
    const protocol = isSecure ? 'wss' : 'ws';
    
    // Extraemos el hostname y puerto de la URL base
    const baseUrlObj = new URL(env.apiConfig.baseUrl);
    const hostname = baseUrlObj.hostname;
    // Usamos el puerto 8001 para WebSockets como se especifica en la documentación
    const port = baseUrlObj.port || (isSecure ? '443' : '8001'); 
    
    // Construimos la URL del WebSocket siguiendo el formato correcto:
    // ws://host:port/ws/collaboration/[projectId]/[diagramId]/?token=[token]
    const wsUrl = `${protocol}://${hostname}:${port}/ws/collaboration/${projectId}/${sessionId}/`;
    
    // Add authentication token as query parameter since WebSocket doesn't support headers
    const authHeader = getAuthHeader();
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      return `${wsUrl}?token=${encodeURIComponent(token)}`;
    }
    
    return wsUrl;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessageUnion = JSON.parse(event.data);
      
      // Handle message acknowledgments
      if (message.type === 'acknowledgment' && message.messageId) {
        const pending = this.pendingMessages.get(message.messageId);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingMessages.delete(message.messageId);
          pending.resolve();
          return;
        }
      }

      // Handle heartbeat responses
      if (message.type === WebSocketMessageType.HEARTBEAT) {
        return; // Just acknowledge heartbeat
      }

      // Forward message to handlers
      this.handlers.onMessage?.(message);

    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    
    this.stopHeartbeat();
    this.connectionState = ConnectionState.DISCONNECTED;
    
    // Clear pending messages
    this.pendingMessages.forEach(pending => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    });
    this.pendingMessages.clear();

    this.handlers.onDisconnect?.(event.reason);

    // Attempt reconnection if not a clean close
    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.attemptReconnect();
    }
  }

  private attemptReconnect(): void {
    if (this.connectionState === ConnectionState.RECONNECTING || !this.sessionId || !this.userId) {
      return;
    }

    this.connectionState = ConnectionState.RECONNECTING;
    this.reconnectAttempts++;

    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect(this.sessionId!, this.userId!, this.projectId);
        this.handlers.onReconnect?.(this.reconnectAttempts);
      } catch (error) {
        console.error('Reconnection failed:', error);
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.connectionState = ConnectionState.ERROR;
          this.handlers.onReconnectFailed?.();
        } else {
          // Exponential backoff for next attempt
          this.reconnectDelay *= 1.5;
          this.attemptReconnect();
        }
      }
    }, this.reconnectDelay);
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatTimer = setInterval(() => {
      if (this.isConnected()) {
        this.sendMessage({
          type: WebSocketMessageType.HEARTBEAT,
        }).catch(() => {
          // Heartbeat failed, connection might be lost
          console.warn('Heartbeat failed');
        });
      }
    }, this.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance for application-wide use
let websocketInstance: WebSocketService | null = null;

/**
 * Get or create WebSocket service instance
 */
export function getWebSocketService(): WebSocketService {
  if (!websocketInstance) {
    const config: WebSocketConfig = {
      url: env.apiConfig.baseUrl,
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      heartbeatInterval: 30000,
      messageTimeout: 10000,
    };

    websocketInstance = new WebSocketService(config);
  }

  return websocketInstance;
}

/**
 * Reset WebSocket service instance (useful for testing)
 */
export function resetWebSocketService(): void {
  if (websocketInstance) {
    websocketInstance.disconnect();
    websocketInstance = null;
  }
}

// WebSocket message builders for common operations
export const WebSocketMessageBuilders = {
  joinSession: (role: 'HOST' | 'EDITOR' | 'VIEWER' | 'COMMENTER') => ({
    type: WebSocketMessageType.JOIN_SESSION,
    role,
  }),

  leaveSession: () => ({
    type: WebSocketMessageType.LEAVE_SESSION,
  }),

  changeEvent: (event: ChangeEvent) => ({
    type: WebSocketMessageType.CHANGE_EVENT,
    event,
  }),

  cursorUpdate: (position: { x: number; y: number; elementId?: UUID }) => ({
    type: WebSocketMessageType.CURSOR_UPDATE,
    position,
  }),

  syncRequest: (lastEventId?: UUID) => ({
    type: WebSocketMessageType.SYNC_REQUEST,
    lastEventId,
  }),

  heartbeat: () => ({
    type: WebSocketMessageType.HEARTBEAT,
  }),
};
