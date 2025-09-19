import React from 'react';
import { ClockIcon, IPIcon } from '@/components/icons';

interface SessionInfoProps {
  lastActivity: string | null;
  ipAddress: string | null;
  sessionTime?: number | null; // in minutes
}

/**
 * SessionInfo Component
 * Displays user's session information including last activity and IP address
 */
export function SessionInfo({ lastActivity, ipAddress, sessionTime }: SessionInfoProps) {
  // Format session duration
  const formatSessionDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  };
  
  // Calculate time since last activity
  const getTimeSinceActivity = (lastActivityTime: string) => {
    try {
      const lastActivityDate = new Date(lastActivityTime);
      const now = new Date();
      const diffMs = now.getTime() - lastActivityDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Ahora';
      if (diffMins < 60) return `${diffMins} min`;
      if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        return `${hours}h`;
      }
      const days = Math.floor(diffMins / 1440);
      return `${days}d`;
    } catch (e) {
      return 'Desconocido';
    }
  };

  return (
    <div className="flex flex-col space-y-1 mt-1 text-xs text-slate-500">
      {/* Last activity */}
      {lastActivity && (
        <div className="flex items-center">
          <ClockIcon className="h-3 w-3 mr-1.5" />
          <span>
            Última actividad: <span className="font-medium">{getTimeSinceActivity(lastActivity)}</span>
          </span>
        </div>
      )}
      
      {/* IP Address */}
      {ipAddress && (
        <div className="flex items-center">
          <IPIcon className="h-3 w-3 mr-1.5" />
          <span>
            IP: <span className="font-medium">{ipAddress}</span>
          </span>
        </div>
      )}
      
      {/* Session duration */}
      {sessionTime !== undefined && sessionTime !== null && (
        <div className="flex items-center">
          <ClockIcon className="h-3 w-3 mr-1.5" />
          <span>
            Duración: <span className="font-medium">{formatSessionDuration(sessionTime)}</span>
          </span>
        </div>
      )}
    </div>
  );
}
