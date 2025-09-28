// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Eye, 
  EyeOff, 
  Crown, 
  Edit, 
  MessageSquare,
  Clock,
  Activity
} from 'lucide-react';
import { useListParticipantsQuery, useUpdateParticipantMutation } from '@/store/api/collaborationApi';
import { getWebSocketService } from '@/services/websocketService';

interface CollaborationPanelProps {
  session: any;
  className?: string;
}

export function CollaborationPanel({ session, className }: CollaborationPanelProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  const { data: participantsData, isLoading } = useListParticipantsQuery({ 
    sessionId: session.id 
  });
  const [updateParticipant] = useUpdateParticipantMutation();

  const participants = participantsData?.results || [];

  useEffect(() => {
    const wsService = getWebSocketService();
    
    const handleMessage = (message) => {
      if (message.type === 'participant_joined' || message.type === 'participant_left') {
        // Refresh participants list
      }
    };

    wsService.updateHandlers({ onMessage: handleMessage });
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'HOST': return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'EDITOR': return <Edit className="h-3 w-3 text-blue-500" />;
      case 'VIEWER': return <Eye className="h-3 w-3 text-slate-500" />;
      default: return <MessageSquare className="h-3 w-3 text-green-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'HOST': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'EDITOR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'VIEWER': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleRoleChange = async (participantId: number, newRole: string) => {
    try {
      await updateParticipant({
        id: participantId,
        data: { role: newRole }
      }).unwrap();
    } catch (error) {
      console.error('Error updating participant role:', error);
    }
  };

  if (!isVisible) {
    return (
      <div className={className}>
        <Button 
          onClick={() => setIsVisible(true)}
          size="sm"
          variant="outline"
          className="bg-white dark:bg-slate-800 shadow-lg"
        >
          <Users className="h-4 w-4 mr-2" />
          Colaboradores ({participants.length})
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Colaboradores ({participants.length})
            </CardTitle>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsVisible(false)}
              >
                <EyeOff className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Sesión: {session.sessionType}</span>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              <span>Activa</span>
            </div>
          </div>

          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <div className="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              participants.map(participant => (
                <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                        {getInitials(participant.userInfo?.full_name || 'Usuario')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 ${
                      participant.isActive ? 'bg-green-500' : 'bg-slate-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                      {participant.userInfo?.full_name || 'Usuario'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`text-xs px-1.5 py-0.5 ${getRoleColor(participant.role)}`}>
                        {getRoleIcon(participant.role)}
                        <span className="ml-1">{participant.role}</span>
                      </Badge>
                      {participant.lastActivity && (
                        <span className="text-xs text-slate-400">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(participant.lastActivity).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <Button variant="outline" size="sm" className="w-full text-xs">
              <UserPlus className="h-3 w-3 mr-2" />
              Invitar Colaborador
            </Button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Límite de participantes:</span>
              <span>{session.activeParticipants}/{session.maxParticipants}</span>
            </div>
            <div className="flex justify-between">
              <span>Duración de sesión:</span>
              <span>
                {session.createdAt && 
                  Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000)
                }m
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
