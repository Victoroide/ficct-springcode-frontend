// @ts-nocheck
import React from 'react';
import { MousePointer } from 'lucide-react';

interface CollaborativeCursorProps {
  cursor: {
    userId: number;
    userName: string;
    position: { x: number; y: number };
    color: string;
    elementId?: string;
  };
  zoom: number;
}

export function CollaborativeCursor({ cursor, zoom }: CollaborativeCursorProps) {
  const cursorStyle = {
    position: 'absolute' as const,
    left: cursor.position.x,
    top: cursor.position.y,
    transform: `scale(${1 / zoom})`,
    transformOrigin: 'top left',
    pointerEvents: 'none' as const,
    zIndex: 1000,
  };

  return (
    <div style={cursorStyle}>
      <div className="relative">
        <MousePointer 
          className="h-5 w-5" 
          style={{ color: cursor.color }}
          fill={cursor.color}
        />
        <div 
          className="absolute top-5 left-2 px-2 py-1 rounded text-xs text-white font-medium shadow-lg whitespace-nowrap"
          style={{ backgroundColor: cursor.color }}
        >
          {cursor.userName}
        </div>
      </div>
    </div>
  );
}
