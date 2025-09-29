/**
 * AnonymousChat.tsx
 * Real-time collaborative chat panel for UML diagram editing
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Users, Minimize2, Maximize2 } from 'lucide-react';
import './AnonymousChat.css';

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    nickname: string;
  };
  timestamp: Date;
  type: 'message' | 'system';
}

export interface ChatUser {
  id: string;
  nickname: string;
  isOnline: boolean;
}

interface AnonymousChatProps {
  diagramId: string;
  currentUser: ChatUser;
  onlineUsers: ChatUser[];
  messages: ChatMessage[];
  isConnected: boolean;
  onSendMessage: (message: string) => void;
  onTyping?: (isTyping: boolean) => void;
  className?: string;
}

const AnonymousChat: React.FC<AnonymousChatProps> = ({
  diagramId,
  currentUser,
  onlineUsers,
  messages,
  isConnected,
  onSendMessage,
  onTyping,
  className = ''
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle typing indicators
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    // Trigger typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 1000);
  }, [isTyping, onTyping]);

  // Send message
  const handleSendMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !isConnected) return;

    onSendMessage(messageInput.trim());
    setMessageInput('');
    
    // Clear typing indicator
    if (isTyping) {
      setIsTyping(false);
      onTyping?.(false);
    }
    
    // Focus back to input
    inputRef.current?.focus();
  }, [messageInput, isConnected, onSendMessage, isTyping, onTyping]);

  // Format timestamp
  const formatTime = (timestamp: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(timestamp));
  };

  // Get user color based on ID
  const getUserColor = (userId: string): string => {
    const colors = [
      '#3B82F6', // Blue
      '#10B981', // Green  
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#06B6D4', // Cyan
      '#EC4899', // Pink
      '#84CC16'  // Lime
    ];
    
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  if (isCollapsed) {
    return (
      <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 flex items-center gap-2"
          title="Open Chat"
        >
          <MessageCircle className="h-5 w-5" />
          {messages.length > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] h-5 flex items-center justify-center">
              {messages.length}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col ${className}`}>
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          <span className="font-medium text-sm">Chat</span>
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <Users className="h-3 w-3" />
            <span>{onlineUsers.length}</span>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="hover:bg-blue-700 p-1 rounded transition-colors"
            title="Minimize Chat"
          >
            <Minimize2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Online Users */}
      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
          <Users className="h-3 w-3" />
          <span>Online</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {onlineUsers.map((user) => (
            <span
              key={user.id}
              className="inline-flex items-center gap-1 bg-white px-2 py-1 rounded text-xs border"
              style={{ borderLeftColor: getUserColor(user.id), borderLeftWidth: '3px' }}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${user.isOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              {user.nickname}
              {user.id === currentUser.id && ' (you)'}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet.</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender.id === currentUser.id;
            
            return (
              <div
                key={message.id}
                className={
                  message.type === 'system' 
                    ? 'text-center text-xs text-gray-500 italic'
                    : `message-container ${isOwnMessage ? 'message-own' : 'message-other'}`
                }
              >
                {message.type === 'system' ? (
                  <span>{message.content}</span>
                ) : (
                  <div className={`message-bubble ${isOwnMessage ? 'message-bubble-own' : 'message-bubble-other'}`}>
                    {!isOwnMessage && (
                      <div className="message-username">
                        {message.sender.nickname}
                      </div>
                    )}
                    <div className="message-text">{message.content}</div>
                    <div className="message-timestamp">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={handleInputChange}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            disabled={!isConnected}
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || !isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-md transition-colors"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        
        {/* Character count */}
        {messageInput.length > 400 && (
          <div className="text-xs text-gray-500 mt-1 text-right">
            {messageInput.length}/500
          </div>
        )}
      </form>
    </div>
  );
};

export default AnonymousChat;
