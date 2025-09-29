/**
 * AnonymousWebSocketService.ts
 * Servicio de WebSocket para colaboración anónima en diagramas UML
 * Maneja la comunicación en tiempo real sin requerir autenticación
 * 
 * IMPLEMENTACIÓN DEL CONTRATO UNIVERSAL DE COLABORACIÓN
 * ========================================================
 * Este servicio implementa el Universal Collaboration Contract que define
 * el formato estándar para la comunicación entre frontend y backend para
 * la colaboración en tiempo real en diagramas UML.
 * 
 * Puntos clave de implementación:
 * 1. Identificación de sesiones mediante session_id
 * 2. Deduplicación de mensajes con hash tracking
 * 3. Prevención de eco (ignorar mensajes propios)
 * 4. Manejo de desconexiones y reconexiones
 * 5. Formatos estándar para mensajes diagram_change, user_join, etc.
 * 
 * Ver COLLABORATION_CONTRACT.md para más detalles sobre la implementación.
 */

import { anonymousSessionService } from './anonymousSessionService';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/environment';

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  url: string;
  protocols?: string[];
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
}

/**
 * WebSocket event handlers with strict typing according to Universal Collaboration Contract
 */
export interface WebSocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onReconnect?: (attempt: number) => void;
  onReconnectFailed?: () => void;
  onUserJoin?: (user: RemoteUser) => void;
  onUserLeave?: (user: RemoteUser) => void;
  onDiagramChange?: (change: DiagramChangeMessage) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onTypingIndicator?: (indicator: TypingIndicatorMessage) => void;
  onUsersList?: (users: RemoteUser[]) => void;
  onCursorUpdate?: (cursor: CursorUpdateData) => void;
}

/**
 * Connected user information - aligns with contract's active_sessions format
 */
export interface RemoteUser {
  session_id: string; // Using snake_case to match contract
  nickname: string;
  joined_at: string;
  isConnected?: boolean; // Additional fields for UI
  lastSeen?: Date;    // Additional fields for UI
}

/**
 * Base interface for all WebSocket messages according to contract
 */
export interface WebSocketMessageBase {
  type: string;
  session_id: string;
  timestamp: string | number;
  // Campos adicionales permitidos para flexibilidad
  [key: string]: any;
}

/**
 * Diagram Change Message structure according to contract
 */
export interface DiagramChangeMessage extends WebSocketMessageBase {
  type: 'diagram_change';
  data: {
    nodes?: any[];
    edges?: any[];
    title?: string;
  };
  from_session: string;
}

/**
 * User Event Message structure according to contract
 */
export interface UserEventMessage extends WebSocketMessageBase {
  type: 'user_joined' | 'user_left';
  nickname: string;
  user_count: number;
}

/**
 * Ping/Pong Message structure according to contract
 */
export interface HeartbeatMessage extends WebSocketMessageBase {
  type: 'ping' | 'pong';
}

/**
 * Cursor position update data according to contract
 */
export interface CursorUpdateData {
  sessionId: string;
  position: { x: number, y: number };
  timestamp: number;
}

/**
 * Typing Indicator Message structure according to contract
 */
export interface TypingIndicatorMessage extends WebSocketMessageBase {
  type: 'typing_indicator';
  isTyping: boolean;
  user: string;
}

/**
 * Combined WebSocket Message type - UNIFIED: Supports both diagram and chat
 */
export type WebSocketMessage = DiagramChangeMessage | UserEventMessage | HeartbeatMessage | ChatMessage | TypingIndicatorMessage | any;

/**
 * Connected user information - legacy format
 */
export interface AnonymousUser {
  sessionId: string;
  nickname: string;
  isConnected: boolean;
  lastSeen: Date;
}

/**
 * Chat message structure según contrato de colaboración
 */
export interface ChatMessage extends WebSocketMessageBase {
  type: 'chat_message';
  id: string;
  message?: string;
  content?: string;
  sender: string;
  sender_id?: string; // Equivalente a session_id en el contrato
  sessionId?: string; // Campo legacy
  nickname?: string;
}

/**
 * WebSocket connection states
 */
export enum ConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  RECONNECTING = 'RECONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}

/**
 * Anonymous WebSocket Service for real-time collaboration
 * UNIVERSAL FIX: Added message deduplication system
 */
export class AnonymousWebSocketService {
  private ws: WebSocket | null = null;
  private connectionState: ConnectionState = ConnectionState.DISCONNECTED;
  private config: WebSocketConfig;
  private handlers: WebSocketEventHandlers;
  private diagramId: string | null = null;
  private sessionId: string | null = null;
  private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: number;
  private messageTimeout: number;
  private reconnectTimer: any = null;
  private connectedUsers: Map<string, AnonymousUser> = new Map();

  // Message deduplication system
  private receivedMessages = new Set<string>();
  private MESSAGE_DEDUP_WINDOW = 5000; // 5 seconds
  
  // Message handler system with type-based routing according to contract
  private messageHandlers: Array<{type: string, callback: (data: WebSocketMessage) => void}> = [];
  
  /**
   * CONTRACT-COMPLIANT: Register a message handler for specific message types
   * @param type Message type to handle, or 'all' to receive all messages
   * @param callback Function to call when message is received
   */
  setMessageHandler(type: string, callback: (data: WebSocketMessage) => void): void {
    // Remove any existing handler for this type
    this.messageHandlers = this.messageHandlers.filter(h => h.type !== type);
    // Add the new handler
    this.messageHandlers.push({ type, callback });
  }
  
  /**
   * Process message with registered handlers
   * CONTRACT-VALIDATION: Ensures all messages are properly typed and routed
   */
  private processWithHandlers(message: WebSocketMessage): void {
    // Call handlers that match message type OR registered for 'all' messages
    this.messageHandlers.forEach(handler => {
      if (handler.type === message.type || handler.type === 'all') {
        handler.callback(message);
      }
    });
  }
  
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
   * 🔧 EMERGENCY FIX: Robust connection management for multi-user support
   */
  async connect(diagramId: string): Promise<void> {
    // Ensure diagram ID is a valid UUID
    const validDiagramId = this.ensureValidUUID(diagramId);
    
    // 🔧 EMERGENCY FIX: Prevent connection duplication but allow reconnection
    // if we're already connected to this diagram and the connection is healthy
    if (this.ws && 
        this.ws.readyState === WebSocket.OPEN && 
        this.connectionState === ConnectionState.CONNECTED && 
        this.diagramId === validDiagramId) {
      if (import.meta.env.DEV) {
        console.log('✅ WebSocket already connected to diagram:', validDiagramId);
      }
      
      // Emit connection event again to ensure UI is in sync
      this.handlers.onConnect?.();
      
      return;
    }
    
    // Always disconnect previous connections before creating a new one
    // This prevents potential ghost connections
    if (this.ws) {
      if (import.meta.env.DEV) {
        console.log('🔄 Creating fresh connection, closing previous WebSocket');
      }
      this.disconnect();
    }

    this.diagramId = diagramId;
    this.connectionState = ConnectionState.CONNECTING;
    this.sessionId = anonymousSessionService.getOrCreateSession().sessionId;

    return new Promise((resolve, reject) => {
      try {
        // 🔧 CRITICAL FIX: Build correct WebSocket URL for backend routing
        const wsUrl = this.buildWebSocketUrl(diagramId);
        
        if (import.meta.env.DEV) {
          console.log('🔗 Connecting to WebSocket URL:', wsUrl);
          console.log('📋 Session ID:', this.sessionId);
          console.log('🎯 Diagram ID:', diagramId);
        }
        
        // Create WebSocket connection
        this.ws = new WebSocket(wsUrl, this.config.protocols);

        // Set up event handlers
        this.ws.onopen = (event) => {
          if (import.meta.env.DEV) {
            console.log('✅ WebSocket connected successfully to ASGI server');
            console.log('🌐 WebSocket readyState:', this.ws?.readyState);
            console.log('📟 Connection event details:', event);
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
          if (import.meta.env.DEV) {
            console.log('🔌 WebSocket DESCONECTADO - Código:', event.code, 'Razón:', event.reason);
            console.log('⚠️ ¿Era cierre limpio?', event.wasClean);
          }
          
          this.connectionState = ConnectionState.DISCONNECTED;
          this.stopHeartbeat();
          
          // 🔧 CRITICAL FIX: Always notify disconnect to update UI status
          this.handlers.onDisconnect?.(event.reason || 'Connection closed');

          // Solo reconectar si no fue un cierre limpio y no manual (código 1000 o 1001)
          if (event.code !== 1000 && event.code !== 1001 && this.reconnectAttempts < this.maxReconnectAttempts) {
            if (import.meta.env.DEV) {
              console.log('🔄 Programando reconexión...');
            }
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ ERROR WebSocket:', error);
          if (import.meta.env.DEV) {
            console.log('🌐 Estado actual readyState:', this.ws?.readyState);
            console.log('🔧 URL que falló:', this.buildWebSocketUrl(diagramId));
          }
          
          this.connectionState = ConnectionState.ERROR;
          
          // 🔧 CRITICAL FIX: Always notify error to update UI status
          this.handlers.onError?.(error);
          this.handlers.onDisconnect?.('WebSocket error');
          
          reject(new Error(`WebSocket connection failed: ${error}`));
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
    
    // Validar que sea un UUID válido
    // CRITICAL FIX: Evitar errores con IDs no-UUID que generan errores en backend
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!id || typeof id !== 'string' || !uuidPattern.test(id)) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ ID no es un UUID válido:', id);
        console.log('🔧 Generando nuevo UUID para compatibilidad...');
      }
      
      // Generar un UUID v4 aleatorio para evitar errores en backend
      return uuidv4();
    }
    
    return id;
  }
  
  /**
   * CRITICAL COLLABORATION FIX: Build correct WebSocket URL for backend routing
   * Ensures consistent URLs compatible with Django WebSocket backend and proper session grouping
   * @param diagramId Diagram ID
   * @returns WebSocket URL
   */
  private buildWebSocketUrl(diagramId: string): string {
    // Get the current anonymous session
    const session = anonymousSessionService.getOrCreateSession();
    
    // Handle case where diagramId might be undefined or null
    const validDiagramId = diagramId || 'default';
    
    // Usar la URL WebSocket configurada en las variables de entorno
    let wsUrl = env.apiConfig.wsUrl;
    
    // Si env URL es HTTP-based, convertir a WebSocket protocol
    if (wsUrl.startsWith('http://')) {
      wsUrl = wsUrl.replace('http://', 'ws://');
    } else if (wsUrl.startsWith('https://')) {
      wsUrl = wsUrl.replace('https://', 'wss://');
    }
    
    // Registrar la URL que se está utilizando
    console.log('🔗 Usando URL WebSocket:', wsUrl);
    
    // CRITICAL COLLABORATION FIX:
    // 1. Correct path from '/ws/collaboration/diagrams/' to '/ws/diagrams/'
    // 2. All sessions join the SAME diagram group by diagram ID
    // 3. But maintain unique session ID for individual identification
    const fullUrl = `${wsUrl}/ws/diagrams/${validDiagramId}/${session.sessionId}/`;
    
    if (import.meta.env.DEV) {
      console.log('🔌 WebSocket full URL:', fullUrl);
      console.log('🔑 Session ID:', session.sessionId);
      console.log('🏷️ Nickname:', session.nickname);
      console.log('📊 Diagram ID:', validDiagramId);
    }
    
    return fullUrl;
  }
  /**
   * Send a join message to notify server about this user
   * CONTRACT-COMPLIANT: Format matches the "WebSocket Message Formats Backend Expects"
   */
  private sendJoinMessage(): void {
    const session = anonymousSessionService.getOrCreateSession();
    
    this.send({
      type: 'user_join',  // Contract-specified message type
      session_id: session.sessionId,
      timestamp: Date.now(),
      // Campos adicionales incluidos como data para evitar errores TypeScript
      data: {
        nickname: session.nickname,
        diagram_id: this.diagramId
      }
    });
  }
  
  /**
   * CONTRACT-COMPLIANT: Handle incoming messages with deduplication and cross-session support
   * Implements the contract requirement: "If `from_session` equals own session, message should not be sent"
   */
  private handleMessage(event: MessageEvent): void {
    try {
      // Basic validation
      if (!event.data) {
        return;
      }
      
      const message = JSON.parse(event.data);
      
      // Skip invalid messages
      if (!message || !message.type) {
        return;
      }
      
      // CONTRACT-VALIDATION: Standardize field access according to contract
      const messageType = message.type;
      
      // Contract specifies: from_session for sender identification
      // Fall back to other fields for backward compatibility
      const senderId = message.from_session || message.sender_id || message.session_id || 'unknown';
      
      // Standardize timestamp format
      const timestamp = message.timestamp || Date.now().toString();
      const messageHash = `${messageType}_${senderId}_${timestamp}`;
      
      // CONTRACT-VALIDATION: Prevent duplicate message processing
      if (this.receivedMessages.has(messageHash)) {
        // Silently skip duplicates
        return;
      }
      
      // Track this message
      this.receivedMessages.add(messageHash);
      
      // Auto-cleanup after deduplication window
      setTimeout(() => {
        this.receivedMessages.delete(messageHash);
      }, this.MESSAGE_DEDUP_WINDOW);
      
      // CONTRACT-COMPLIANCE: "Frontend Must Ensure: WebSocket messages with from_session matching own session are ignored"
      if (senderId === this.sessionId) {
        return;
      }
      
      // Log only important events - reduced to improve console readability
      if (import.meta.env.DEV && (messageType === 'diagram_change' || messageType === 'user_joined')) {
        console.log(`WebSocket: ${messageType} from ${senderId.substring(0, 8)}`);
      }
      
      // CONTRACT-VALIDATION: Process message using registered handlers
      this.processWithHandlers(message);
      
          // Handle ping messages immediately
      if (message.type === 'ping') {
        this.send({ type: 'pong' });
        return;
      }
      
      // CRITICAL FIX: También procesar con el switch tradicional para compatibilidad
      // con componentes existentes que usen los handlers
      switch (message.type) {
        case 'user_join':
          this.handleUserJoin(message.data);
          break;
        case 'diagram_change':
        case 'diagram_update':
        case 'diagram_state':
        case 'title_changed':
          // Forward to client handlers
          if (this.handlers.onDiagramChange) {
            this.handlers.onDiagramChange(message);
          }
          break;
          
        case 'chat_message':
          if (message.data && this.handlers.onChatMessage) {
            // CONTRACT-COMPLIANT: Format chat message according to contract
            this.handlers.onChatMessage({
              type: 'chat_message',
              id: message.data.id || `msg_${Date.now()}`,
              content: message.data.content || '',
              session_id: message.session_id || this.sessionId || '',
              sender_id: message.sender_id || message.session_id || 'unknown',
              sender: message.sender_id || message.session_id || 'unknown',
              timestamp: message.data.timestamp || Date.now()
            });
          }
          break;

        case 'typing_indicator':
          if (this.handlers.onTypingIndicator) {
            this.handlers.onTypingIndicator({
              type: 'typing_indicator',
              isTyping: message.data?.isTyping || false,
              user: message.data?.user || message.sender_id || 'unknown',
              session_id: message.session_id || this.sessionId || '',
              timestamp: message.timestamp || Date.now()
            });
          }
          break;
          
        case 'users_list':
          if (message.data?.users && this.handlers.onUsersList) {
            this.handlers.onUsersList(message.data.users);
          }
          break;
          
        case 'cursor_update':
          // Update remote cursor if handler provided
          if (message.data?.position && this.handlers.onCursorUpdate) {
            this.handlers.onCursorUpdate({
              sessionId: message.session_id || message.sender_id || 'unknown',
              position: message.data.position,
              timestamp: message.data.timestamp || Date.now()
            });
          }
          break;
          
        default:
          console.log(`Message processed: ${message.type}`);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }
  
  /**
   * Handle user join event
   */
  private handleUserJoin(data: any): void {
    if (!data?.session_id) return;
    
    // Crear objeto de usuario según el formato de contrato
    const remoteUser: RemoteUser = {
      session_id: data.session_id,
      nickname: data.nickname || 'Anonymous',
      joined_at: new Date().toISOString(),
      isConnected: true,
      lastSeen: new Date()
    };
    
    // También mantener formato legacy para backwards compatibility
    const legacyUser: AnonymousUser = {
      sessionId: data.session_id,
      nickname: data.nickname || 'Anonymous',
      isConnected: true,
      lastSeen: new Date()
    };
    
    this.connectedUsers.set(legacyUser.sessionId, legacyUser);
    
    // Notificar con el formato esperado por el contrato
    this.handlers.onUserJoin?.(remoteUser);
  }

  /**
   * Handle user leave event
   */
  private handleUserLeave(data: any): void {
    if (!data?.session_id) return;
    
    const userSessionId = data.session_id;
    const legacyUser = this.connectedUsers.get(userSessionId);
    
    if (legacyUser) {
      // Remove user from connected users
      this.connectedUsers.delete(userSessionId);
      
      // Crear usuario en formato de contrato
      const remoteUser: RemoteUser = {
        session_id: legacyUser.sessionId,
        nickname: legacyUser.nickname,
        joined_at: new Date(legacyUser.lastSeen || Date.now()).toISOString()
      };
      
      // Notify listeners con el formato de contrato
      this.handlers.onUserLeave?.(remoteUser);
    }
  }
  
  /**
   * CONTRACT-COMPLIANT: Send a message through the WebSocket connection
   * Standardizes message format according to contract specifications
   */
  send(message: Partial<WebSocketMessageBase>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      if (import.meta.env.DEV) {
        console.log('Cannot send message, WebSocket not connected');
      }
      return;
    }
    
    // Ensure we have a session ID for tracking
    if (!this.sessionId) {
      this.sessionId = anonymousSessionService.getOrCreateSession().sessionId;
    }
    
    // CONTRACT-COMPLIANCE: Prepare message with required fields according to contract
    const finalMessage: WebSocketMessageBase = {
      ...message as any, // Type cast needed for partial
      // Use snake_case for field names as specified in contract
      type: message.type || 'unknown',
      session_id: this.sessionId, // Always include session_id
      timestamp: message.timestamp || Date.now() // Numeric timestamp
    };
    
    // Send the message
    try {
      this.ws.send(JSON.stringify(finalMessage));
      if (import.meta.env.DEV) {
        console.log(`Sent message: ${message.type}`);
      }
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }
  
  /**
   * CONTRACT-COMPLIANT: Send diagram changes to server
   * Implements the "WebSocket Message Generation Requirements" from contract
   */
  sendDiagramChange(changeType: string, messageData: Partial<DiagramChangeMessage>): void {
    if (!this.ws || !this.diagramId) {
      if (import.meta.env.DEV) {
        console.log('Cannot send changes, WebSocket not connected or no active diagram');
      }
      return;
    }
  
    // CONTRACT-COMPLIANCE: Format matches "Send diagram_change" requirement
    // Asegurar que el tipo de mensaje sea 'diagram_change' para cumplir con el contrato
    const finalChangeType = changeType === 'diagram_change' ? changeType : 'diagram_change';
  
    // Crear mensaje estandarizado para el contrato
    const message: Partial<DiagramChangeMessage> = {
      type: finalChangeType as 'diagram_change',
      data: messageData.data || {},  // Datos recibidos o empty object
      from_session: this.sessionId,   // Contract-specified field for sender identification
      session_id: this.sessionId,     // Requerido por WebSocketMessageBase
      timestamp: Date.now()           // Use numeric timestamp as specified in contract
    };
    
    // Añadir diagram_id como campo adicional permitido
    const finalMessage = {
      ...message,
      diagram_id: this.diagramId      // Campo adicional permitido por [key: string]: any
    };
  
    // Send using the contract-compliant send method
    this.send(finalMessage);
    
    if (import.meta.env.DEV) {
      console.log('Diagram change sent with data structure:', message.data);
    }
  }

  /**
   * Handle chat message
   */
  /**
   * CONTRACT-COMPLIANT: Handle chat message formatting according to contract
   */
  private handleChatMessage(data: any): void {
    if (!data) return;
    
    // Format the chat message according to contract requirements
    const chatMessage: ChatMessage = {
      type: 'chat_message',
      id: data.id || `msg_${Date.now()}`,
      content: data.content || '',
      message: data.message || data.content || '',
      session_id: this.sessionId || '', // Required by WebSocketMessageBase
      sender_id: data.sender_id || data.session_id || data.sessionId || 'unknown',
      sessionId: data.sessionId || data.session_id || 'unknown', // Legacy support
      nickname: data.nickname || 'Anonymous',
      sender: data.sender || data.sender_id || data.session_id || 'unknown',
      timestamp: data.timestamp || Date.now()
    };
    
    this.handlers.onChatMessage?.(chatMessage);
  }

  /**
   * Handle users list update
   */
  private handleUsersList(data: any[]): void {
    if (!Array.isArray(data)) return;
    
    // Clear current users
    this.connectedUsers.clear();
    
    // Add all users from the list
    data.forEach(user => {
      this.connectedUsers.set(user.sessionId, {
        sessionId: user.sessionId,
        nickname: user.nickname,
        isConnected: true,
        lastSeen: new Date(user.lastSeen)
      });
    });
  }

  /**
   * CONTRACT-COMPLIANT: Send a chat message
   */
  sendChatMessage(message: string): void {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionInfo = anonymousSessionService.getOrCreateSession();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const chatMessage: Partial<ChatMessage> = {
        type: 'chat_message',
        id: messageId,
        content: message,
        session_id: sessionInfo.sessionId,
        sender_id: sessionInfo.sessionId,
        sender: sessionInfo.sessionId,
        nickname: sessionInfo.nickname,
        timestamp: Date.now()
      };
      
      this.send(chatMessage);
    } else if (import.meta.env.DEV) {
      console.warn('Cannot send message, WebSocket not connected');
    }
  }

  /**
   * CONTRACT-COMPLIANT: Send typing indicator
   */
  sendTypingIndicator(isTyping: boolean): void {
    const sessionInfo = anonymousSessionService.getOrCreateSession();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const typingMessage: Partial<TypingIndicatorMessage> = {
        type: 'typing_indicator',
        isTyping,
        user: sessionInfo.nickname,
        session_id: sessionInfo.sessionId,
        timestamp: Date.now()
      };
      
      this.send(typingMessage);
    }
  }

  // Schedule reconnection attempt with exponential backoff
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    
    if (import.meta.env.DEV) {
      console.log(`Scheduling reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);
    }
    
    // Calcular backoff exponencial (pero no más de 30 segundos)
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );
    
    this.reconnectTimer = setTimeout(async () => {
      if (this.diagramId) {
        if (import.meta.env.DEV) {
          console.log(`🔄 Intentando reconexión ${this.reconnectAttempts}...`);
        }
        
        try {
          await this.connect(this.diagramId);
          this.handlers.onReconnect?.(this.reconnectAttempts);
        } catch (error) {
          console.error('Error durante reconexión:', error);
          
          // Si aún quedan intentos, programar otro
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            // Try again with backoff
            this.scheduleReconnect();
          } else {
            console.error(`Failed all ${this.maxReconnectAttempts} reconnection attempts`);
            this.handlers.onReconnectFailed?.();
          }
        }
      }
    }, delay);
  }

  /**
   * Disconnect WebSocket connection
   * 🔧 EMERGENCY FIX: Enhanced reliable disconnection
   */
  disconnect(): void {
    if (this.ws) {
      // Prevent any more message handlers from firing
      this.ws.onmessage = null;
      this.ws.onerror = null;
      
      // Intentar un cierre limpio
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, "Cierre manual");
        }
      } catch (e) {
        console.error('Error cerrando WebSocket:', e);
      } finally {
        // Always ensure we clean up the WebSocket object
        this.ws = null;
      }
    }
    
    // Limpiar temporizadores inmediatamente
    this.stopHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Garantizar estado actualizado
    this.connectionState = ConnectionState.DISCONNECTED;
    
    // Always notify disconnect
    this.handlers.onDisconnect?.('Manual disconnect');
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionState === ConnectionState.CONNECTED && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing heartbeat
    
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping' });
      }
    }, this.heartbeatInterval);
  }
  
  /**
   * Stop heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * Get connected users
   */
  getConnectedUsers(): AnonymousUser[] {
    return Array.from(this.connectedUsers.values());
  }
  
  /**
   * CONTRACT-COMPLIANT: Enviar posición del cursor según el contrato
   * @param position Posición del cursor en el diagrama
   */
  async updateCursor(position: { x: number, y: number }): Promise<void> {
    if (!this.isConnected()) return;
    
    // Format according to contract requirements for cursor position updates
    this.send({
      type: 'cursor_update',
      session_id: this.sessionId || '',
      timestamp: Date.now(),
      position: position, // Directly include position at top level for contract compliance
      // Include data structure for backward compatibility
      data: {
        position,
        timestamp: Date.now()
      }
    });
  }
  
  /**
   * 🔧 FIX: Enviar eventos de cambio en formato estandarizado
   * @param changeEvent Evento de cambio para el diagrama
   */
  async sendChangeEvent(changeEvent: any): Promise<void> {
    if (!this.isConnected()) {
      throw new Error('No se puede enviar evento: WebSocket no está conectado');
    }
    
    // Usar formato estandarizado para cambios de diagrama
    this.send({
      type: 'change_event',
      data: {
        event: changeEvent,
        timestamp: Date.now()
      }
    });
  }
}

export default AnonymousWebSocketService;
