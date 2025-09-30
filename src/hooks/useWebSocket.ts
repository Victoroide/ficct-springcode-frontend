/**
 * useWebSocket Hook - Clean React Flow Collaboration Pattern
 * ========================================================
 * 
 * This hook implements the proven React Flow WebSocket collaboration pattern
 * following the memories of successful implementations. It provides:
 * 
 * - Single WebSocket connection per diagram
 * - Direct React Flow state integration
 * - Anonymous authentication (no JWT needed)
 * - Message deduplication and echo prevention
 * - Clean lifecycle management
 * 
 * USAGE:
 * const { sendMessage, isConnected, connectedUsers } = useWebSocket({
 *   diagramId: 'diagram-123',
 *   onNodesChange: (nodes) => setNodes(nodes),
 *   onEdgesChange: (edges) => setEdges(edges)
 * });
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { env } from '@/config/environment';
import type { Node, Edge } from 'reactflow';

interface WebSocketMessage {
  type: 'node_add' | 'node_update' | 'node_delete' | 'edge_add' | 'edge_update' | 'edge_delete' | 'diagram_change' | 'viewport_change' | 'cursor_move' | 'user_joined' | 'user_left' | 'title_changed' | 'chat_message' | 'typing_indicator' | 'user_presence';
  data: any;
  userId: string;
  sessionId: string;
  timestamp: number;
}

interface ConnectedUser {
  sessionId: string;
  nickname: string;
  joinedAt: string;
  lastSeen: Date;
}

interface UseWebSocketProps {
  diagramId: string;
  onNodesChange: (nodes: Node[]) => void;
  onEdgesChange: (edges: Edge[]) => void;
  onViewportChange?: (viewport: { x: number; y: number; zoom: number }) => void;
  onTitleChange?: (title: string) => void;
  onUserJoined?: (user: ConnectedUser) => void;
  onUserLeft?: (user: ConnectedUser) => void;
  onChatMessage?: (message: { id: string; content: string; sender: { id: string; nickname: string }; timestamp: Date; type: 'message' }) => void;
  onTypingIndicator?: (data: { isTyping: boolean; user: string }) => void;
  onUserPresence?: (data: { count: number; users: string[] }) => void;
}

export const useWebSocket = ({
  diagramId,
  onNodesChange,
  onEdgesChange,
  onViewportChange,
  onTitleChange,
  onUserJoined,
  onUserLeft,
  onChatMessage,
  onTypingIndicator,
  onUserPresence
}: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Message deduplication
  const receivedMessages = useRef(new Set<string>());
  const messageCleanupTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Get current session for echo prevention
  const currentSession = anonymousSessionService.getOrCreateSession();
  
  const connect = useCallback(() => {
    if (!diagramId || ws.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // Clean WebSocket URL - no authentication needed for anonymous mode
    const wsUrl = `${env.apiConfig.wsUrl}/ws/diagrams/${diagramId}/${currentSession.sessionId}/`;
    
    try {
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Send initial join message
        const joinMessage: WebSocketMessage = {
          type: 'user_joined',
          data: {
            nickname: currentSession.nickname,
            sessionId: currentSession.sessionId
          },
          userId: currentSession.sessionId,
          sessionId: currentSession.sessionId,
          timestamp: Date.now()
        };
        
        ws.current?.send(JSON.stringify(joinMessage));
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        setIsConnected(false);
        
        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000; // Exponential backoff
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
      
      ws.current.onerror = (error) => {
        // Silently log WebSocket errors - they're expected when backend is offline
        // This prevents showing error toasts to users when the WebSocket simply can't connect
        console.warn('WebSocket connection error (backend may be offline):', {
          diagramId,
          readyState: ws.current?.readyState,
          url: wsUrl
        });
        setIsConnected(false);
        
        // Prevent this error from propagating as an unhandled rejection
        // The onclose handler will manage reconnection attempts
      };
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [diagramId, currentSession.sessionId, currentSession.nickname]);
  
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    // TASK 3 FIX: Critical message deduplication and echo prevention
    const messageHash = `${message.type}_${message.sessionId}_${message.timestamp}`;
    
    // Skip if we've seen this message before
    if (receivedMessages.current.has(messageHash)) {
      return;
    }
    
    // Add to received messages
    receivedMessages.current.add(messageHash);
    
    // CRITICAL: Skip messages from ourselves (prevent state loops)
    if (message.sessionId === currentSession.sessionId) {
      return; // Don't process our own messages
    }
    
    // Handle different message types
    switch (message.type) {
      case 'node_add':
      case 'node_update':
      case 'node_delete':
        if (message.data.nodes) {
          onNodesChange(message.data.nodes);
        }
        break;
        
      case 'edge_add':
      case 'edge_update':
      case 'edge_delete':
        if (message.data.edges) {
          onEdgesChange(message.data.edges);
        }
        break;
        
      case 'diagram_change':
        if (message.data.nodes) {
          onNodesChange(message.data.nodes);
        }
        if (message.data.edges) {
          onEdgesChange(message.data.edges);
        }
        if (message.data.title && onTitleChange) {
          onTitleChange(message.data.title);
        }
        break;
        
      case 'title_changed':
        if (message.data.title && onTitleChange) {
          onTitleChange(message.data.title);
        }
        break;
        
      case 'viewport_change':
        if (message.data.viewport && onViewportChange) {
          onViewportChange(message.data.viewport);
        }
        break;
        
      case 'user_joined':
        if (message.data.nickname && onUserJoined) {
          const newUser: ConnectedUser = {
            sessionId: message.sessionId,
            nickname: message.data.nickname,
            joinedAt: new Date(message.timestamp).toISOString(),
            lastSeen: new Date()
          };
          
          setConnectedUsers(prev => {
            // Avoid duplicates
            if (prev.some(u => u.sessionId === newUser.sessionId)) {
              return prev;
            }
            return [...prev, newUser];
          });
          
          onUserJoined(newUser);
        }
        break;
        
      case 'user_left':
        if (onUserLeft) {
          const leftUser = connectedUsers.find(u => u.sessionId === message.sessionId);
          if (leftUser) {
            onUserLeft(leftUser);
          }
        }
        
        setConnectedUsers(prev => 
          prev.filter(u => u.sessionId !== message.sessionId)
        );
        break;
        
      case 'chat_message':
        if (message.data && onChatMessage) {
          const chatMessage = {
            id: message.data.id || `msg_${Date.now()}`,
            content: message.data.content || message.data.message || '',
            sender: {
              id: message.sessionId,
              nickname: message.data.user || message.data.nickname || 'Anonymous User'
            },
            timestamp: new Date(message.timestamp),
            type: 'message' as const
          };
          onChatMessage(chatMessage);
        }
        break;
        
      case 'typing_indicator':
        if (message.data && onTypingIndicator) {
          onTypingIndicator({
            isTyping: message.data.isTyping || false,
            user: message.data.user || message.data.nickname || 'Anonymous User'
          });
        }
        break;
        
      case 'user_presence':
        if (message.data && onUserPresence) {
          onUserPresence({
            count: message.data.count || 0,
            users: message.data.users || []
          });
        }
        break;
        
      default:
    }
  }, [currentSession.sessionId, onNodesChange, onEdgesChange, onTitleChange, onViewportChange, onUserJoined, onUserLeft, onChatMessage, onTypingIndicator, onUserPresence, connectedUsers]);
  
  const sendMessage = useCallback((type: WebSocketMessage['type'], data: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = {
        type,
        data,
        userId: currentSession.sessionId,
        sessionId: currentSession.sessionId,
        timestamp: Date.now()
      };
      
      ws.current.send(JSON.stringify(message));
      
      // Log outgoing messages in development
      if (import.meta.env.DEV) {
      }
    } else {
      console.warn('WebSocket not connected, cannot send message:', type);
    }
  }, [currentSession.sessionId]);
  
  // Initialize connection
  useEffect(() => {
    connect();
    
    // Setup message cleanup timer
    messageCleanupTimer.current = setInterval(() => {
      // Clean up old messages (keep only last 5 minutes)
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const messagesToKeep = new Set<string>();
      
      for (const messageHash of receivedMessages.current) {
        const parts = messageHash.split('_');
        const timestamp = parseInt(parts[parts.length - 1]);
        if (timestamp > fiveMinutesAgo) {
          messagesToKeep.add(messageHash);
        }
      }
      
      receivedMessages.current = messagesToKeep;
    }, 60000); // Clean every minute
    
    // Cleanup on unmount
    return () => {
      if (ws.current) {
        // Send leave message before disconnecting
        const leaveMessage: WebSocketMessage = {
          type: 'user_left',
          data: {
            sessionId: currentSession.sessionId
          },
          userId: currentSession.sessionId,
          sessionId: currentSession.sessionId,
          timestamp: Date.now()
        };
        
        if (ws.current.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify(leaveMessage));
        }
        
        ws.current.close(1000, 'Component unmounting');
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (messageCleanupTimer.current) {
        clearInterval(messageCleanupTimer.current);
      }
    };
  }, [connect, currentSession.sessionId]);
  
  return {
    isConnected,
    connectedUsers,
    sendMessage
  };
};
