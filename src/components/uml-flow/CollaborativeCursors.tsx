/**
 * CollaborativeCursors.tsx
 * Component for displaying real-time cursors of collaborators in the UML Flow Editor
 */

import React, { useCallback } from 'react';
import type { ReactFlowInstance } from 'reactflow';
import type { RealtimeCursor } from '@/types/collaboration';

interface CollaborativeCursorsProps {
  cursors: Record<number, RealtimeCursor>;
  reactFlowInstance: ReactFlowInstance | null;
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  currentUserId: number;
}

const CollaborativeCursors: React.FC<CollaborativeCursorsProps> = ({
  cursors,
  reactFlowInstance,
  viewport,
  currentUserId,
}) => {
  // Function to transform flow position to screen position
  const getScreenPosition = useCallback((position: { x: number; y: number }) => {
    if (!reactFlowInstance) return { x: 0, y: 0 };
    
    const { x, y } = position;
    const screenPos = reactFlowInstance.project({
      x: x,
      y: y
    });
    
    return screenPos;
  }, [reactFlowInstance]);
  
  // Filter out current user's cursor and inactive cursors (older than 1 minute)
  const activeCursors = Object.values(cursors).filter(cursor => {
    if (cursor.userId === currentUserId) return false;
    
    const lastUpdateTime = new Date(cursor.lastUpdate).getTime();
    const currentTime = new Date().getTime();
    const oneMinute = 60 * 1000;
    
    return currentTime - lastUpdateTime < oneMinute;
  });
  
  if (activeCursors.length === 0) return null;
  
  return (
    <>
      {activeCursors.map(cursor => {
        const screenPos = getScreenPosition(cursor.position);
        const userInitial = cursor.userInfo.firstName?.[0] || '?';
        
        return (
          <div
            key={cursor.userId}
            className="collaborative-cursor"
            style={{
              position: 'absolute',
              left: `${screenPos.x}px`,
              top: `${screenPos.y}px`,
              pointerEvents: 'none',
              zIndex: 1000,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Cursor */}
            <div 
              style={{ 
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path
                  d="M5,2 L19,12 L12,13 L9,20 L5,2"
                  fill={cursor.userInfo.color || `hsl(${cursor.userId * 137.5 % 360}, 70%, 60%)`}
                  stroke="#ffffff"
                  strokeWidth="1"
                />
              </svg>
            </div>
            
            {/* Name badge */}
            <div 
              style={{
                position: 'absolute',
                left: '12px',
                top: '0px',
                backgroundColor: cursor.userInfo.color || `hsl(${cursor.userId * 137.5 % 360}, 70%, 60%)`,
                color: '#ffffff',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                whiteSpace: 'nowrap',
              }}
            >
              {cursor.userInfo.firstName || 'User'} {cursor.userInfo.lastName || ''}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default CollaborativeCursors;
