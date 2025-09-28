import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { Send, MessageCircle, Users } from 'lucide-react';
import type { ChatMessage } from '@/services/anonymousWebSocketService';

interface AnonymousChatProps {
  diagramId: string;
  onSendMessage: (message: string) => void;
  messages: ChatMessage[];
  isConnected: boolean;
  connectedUsersCount: number;
}

const AnonymousChat: React.FC<AnonymousChatProps> = ({
  diagramId,
  onSendMessage,
  messages,
  isConnected,
  connectedUsersCount
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = anonymousSessionService.getOrCreateSession();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputMessage.trim() && isConnected) {
      onSendMessage(inputMessage.trim());
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(timestamp);
  };

  const isOwnMessage = (message: ChatMessage) => {
    return message.sessionId === session.sessionId;
  };

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Chat</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{connectedUsersCount}</span>
            </Badge>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-4 pb-2" style={{ height: '300px' }}>
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage(message) ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 ${
                        isOwnMessage(message)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {!isOwnMessage(message) && (
                        <div className="text-xs font-semibold mb-1 opacity-75">
                          {message.nickname}
                        </div>
                      )}
                      <div className="text-sm whitespace-pre-wrap">
                        {message.message}
                      </div>
                      <div className={`text-xs mt-1 ${
                        isOwnMessage(message) ? 'text-blue-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                disabled={!isConnected}
                className="flex-1"
                maxLength={500}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || !isConnected}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {!isConnected && (
              <div className="text-xs text-red-500 mt-1 flex items-center">
                <div className="w-1 h-1 bg-red-500 rounded-full mr-2 animate-pulse" />
                Reconnecting to chat...
              </div>
            )}
            
            <div className="text-xs text-gray-500 mt-1">
              Chatting as <span className="font-medium">{session.nickname}</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AnonymousChat;
