/**
 * useChatWebSocket Hook - Dedicated Chat WebSocket Connection
 * ==========================================================
 * 
 * This hook handles ONLY chat functionality with a dedicated WebSocket
 * connection to the backend's AnonymousDiagramChatConsumer.
 * 
 * This is separate from the diagram WebSocket to match the backend architecture.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { env } from '@/config/environment';

interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    nickname: string;
  };
  timestamp: Date;
  type: 'message' | 'system';
}

interface UseChatWebSocketProps {
  diagramId: string;
  onChatMessage?: (message: ChatMessage) => void;
  onUserJoined?: (user: { id: string; nickname: string }) => void;
  onUserLeft?: (user: { id: string; nickname: string }) => void;
  onUserCount?: (count: number) => void;
}

export const useChatWebSocket = ({
  diagramId,
  onChatMessage,
  onUserJoined,
  onUserLeft,
  onUserCount
}: UseChatWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<string[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Get current session for chat
  const currentSession = anonymousSessionService.getOrCreateSession();
  
  const connect = useCallback(() => {
    if (!diagramId || ws.current?.readyState === WebSocket.OPEN) {
      return;
    }
    
    // Chat WebSocket URL - matches backend routing
    const chatWsUrl = `${env.apiConfig.wsUrl}/ws/diagram/${diagramId}/chat/`;
    
    try {
      ws.current = new WebSocket(chatWsUrl);
      
      ws.current.onopen = () => {
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
        
        // Send join message for chat
        const joinMessage = {
          type: 'user_joined',
          nickname: currentSession.nickname,
          session_id: currentSession.sessionId,
          timestamp: Date.now()
        };
        
        ws.current?.send(JSON.stringify(joinMessage));
      };
      
      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleChatMessage(message);
        } catch (error) {
          console.error('Error parsing chat message:', error);
        }
      };
      
      ws.current.onclose = (event) => {
        setIsConnected(false);
        
        // Attempt reconnection if not intentionally closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttemptsRef.current) * 1000;
          reconnectAttemptsRef.current++;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
      
      ws.current.onerror = (error) => {
        console.error('Chat WebSocket error (backend may be offline):', error);
        setIsConnected(false);
      };
      
    } catch (error) {
      console.error('Failed to create chat WebSocket connection:', error);
    }
  }, [diagramId, currentSession.sessionId, currentSession.nickname]);
  
  const handleChatMessage = useCallback((message: any) => {
    // Don't process our own messages to prevent duplicates
    if (message.session_id === currentSession.sessionId) {
      return;
    }
    
    switch (message.type) {
      case 'chat_message':
        if (onChatMessage) {
          const chatMessage: ChatMessage = {
            id: message.id || `msg_${Date.now()}`,
            content: message.content || message.message || '',
            sender: {
              id: message.session_id || message.sender_id || 'unknown',
              nickname: message.nickname || message.user || 'Anonymous User'
            },
            timestamp: new Date(message.timestamp || Date.now()),
            type: 'message'
          };
          onChatMessage(chatMessage);
        }
        break;
        
      case 'user_joined':
        if (onUserJoined) {
          onUserJoined({
            id: message.session_id,
            nickname: message.nickname || 'Anonymous User'
          });
        }
        setConnectedUsers(prev => {
          if (!prev.includes(message.nickname)) {
            return [...prev, message.nickname];
          }
          return prev;
        });
        break;
        
      case 'user_left':
        if (onUserLeft) {
          onUserLeft({
            id: message.session_id,
            nickname: message.nickname || 'Anonymous User'
          });
        }
        setConnectedUsers(prev => prev.filter(user => user !== message.nickname));
        break;
        
      case 'user_count':
        if (onUserCount) {
          onUserCount(message.count || 0);
        }
        break;
    }
  }, [currentSession.sessionId, onChatMessage, onUserJoined, onUserLeft, onUserCount]);
  
  const sendChatMessage = useCallback((content: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat_message',
        content,
        nickname: currentSession.nickname,
        session_id: currentSession.sessionId,
        timestamp: Date.now()
      };
      
      ws.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('Chat WebSocket not connected, cannot send message');
      return false;
    }
  }, [currentSession.sessionId, currentSession.nickname]);
  
  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      const message = {
        type: 'typing_indicator',
        isTyping,
        nickname: currentSession.nickname,
        session_id: currentSession.sessionId,
        timestamp: Date.now()
      };
      
      ws.current.send(JSON.stringify(message));
    }
  }, [currentSession.sessionId, currentSession.nickname]);
  
  // Initialize connection
  useEffect(() => {
    connect();
    
    return () => {
      if (ws.current) {
        // Send leave message before disconnecting
        if (ws.current.readyState === WebSocket.OPEN) {
          const leaveMessage = {
            type: 'user_left',
            session_id: currentSession.sessionId,
            nickname: currentSession.nickname,
            timestamp: Date.now()
          };
          ws.current.send(JSON.stringify(leaveMessage));
        }
        
        ws.current.close(1000, 'Component unmounting');
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, currentSession.sessionId, currentSession.nickname]);
  
  return {
    isConnected,
    connectedUsers,
    sendChatMessage,
    sendTypingIndicator
  };
};