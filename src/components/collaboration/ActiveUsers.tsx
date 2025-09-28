import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { anonymousSessionService } from '@/services/anonymousSessionService';
import { Users, UserPlus, Crown, Clock } from 'lucide-react';
import type { AnonymousUser } from '@/services/anonymousWebSocketService';

interface ActiveUsersProps {
  users: AnonymousUser[];
  isConnected: boolean;
  onShareLink?: () => void;
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({
  users,
  isConnected,
  onShareLink
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const session = anonymousSessionService.getOrCreateSession();

  const getInitials = (nickname: string): string => {
    return nickname
      .split(/(?=[A-Z])|(?=\d)/)
      .filter(part => part.length > 0)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  };

  const getAvatarColor = (sessionId: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500'
    ];
    
    const hash = sessionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const isCurrentUser = (user: AnonymousUser): boolean => {
    return user.sessionId === session.sessionId;
  };

  const sortedUsers = [...users].sort((a, b) => {
    // Current user first
    if (isCurrentUser(a)) return -1;
    if (isCurrentUser(b)) return 1;
    
    // Then by connection status
    if (a.isConnected !== b.isConnected) {
      return a.isConnected ? -1 : 1;
    }
    
    // Then by last seen time
    return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
  });

  const formatLastSeen = (lastSeen: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - lastSeen.getTime()) / 1000);
    
    if (diffInSeconds < 30) return 'just now';
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className="w-full">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Active Users</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {users.length}
            </Badge>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-3">
          {/* Share Link Button */}
          {onShareLink && (
            <Button
              onClick={onShareLink}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Others
            </Button>
          )}

          {/* Users List */}
          <ScrollArea className="max-h-64">
            <div className="space-y-2">
              {sortedUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No users online</p>
                </div>
              ) : (
                sortedUsers.map((user) => (
                  <div
                    key={user.sessionId}
                    className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      isCurrentUser(user) 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={`text-white text-xs font-bold ${getAvatarColor(user.sessionId)}`}>
                          {getInitials(user.nickname)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Online indicator */}
                      <div 
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                          user.isConnected ? 'bg-green-500' : 'bg-gray-400'
                        }`} 
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className={`text-sm font-medium truncate ${
                          isCurrentUser(user) ? 'text-blue-700' : 'text-gray-900'
                        }`}>
                          {user.nickname}
                        </p>
                        {isCurrentUser(user) && (
                          <Crown className="h-3 w-3 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>
                          {user.isConnected ? 'online' : formatLastSeen(user.lastSeen)}
                        </span>
                      </div>
                    </div>

                    {isCurrentUser(user) && (
                      <Badge variant="outline" className="text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Connection Status */}
          <div className="border-t pt-3">
            <div className={`text-xs flex items-center space-x-2 ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              } ${!isConnected ? 'animate-pulse' : ''}`} />
              <span>
                {isConnected ? 'Connected to collaboration' : 'Reconnecting...'}
              </span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ActiveUsers;
