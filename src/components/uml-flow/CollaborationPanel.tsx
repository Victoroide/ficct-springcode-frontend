/**
 * CollaborationPanel.tsx
 * Component for displaying active collaborators in the UML Flow Editor
 */

import React from 'react';
import { UserCircle } from 'lucide-react';

interface Collaborator {
  id: string | number;
  user: number;
  role?: string;
  status?: string;
  joinedAt?: string;
  userInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
  };
}

interface CollaborationPanelProps {
  collaborators: Collaborator[];
}

const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ collaborators }) => {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
      <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a3 3 0 00-3-3h-2a3 3 0 00-3 3v1h8zM2 18v-1a3 3 0 013-3h2a3 3 0 013 3v1H2z" />
        </svg>
        Colaboradores Activos ({collaborators.length})
      </h3>

      {collaborators.length === 0 ? (
        <p className="text-sm text-blue-600 italic">No hay colaboradores activos.</p>
      ) : (
        <ul className="space-y-2">
          {collaborators.map((collaborator) => (
            <li key={collaborator.id} className="flex items-center gap-2">
              {collaborator.userInfo?.avatar ? (
                <img 
                  src={collaborator.userInfo.avatar} 
                  alt={`${collaborator.userInfo?.firstName || 'Usuario'}`}
                  className="h-6 w-6 rounded-full"
                />
              ) : (
                <UserCircle 
                  className="h-6 w-6 text-blue-500" 
                  style={{ color: `hsl(${collaborator.user * 137.5 % 360}, 70%, 60%)` }}
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-700">
                  {collaborator.userInfo?.firstName || 'Usuario'} {collaborator.userInfo?.lastName || ''}
                </p>
                <p className="text-xs text-blue-500">
                  {collaborator.role === 'HOST' ? 'Anfitrión' : 
                   collaborator.role === 'EDITOR' ? 'Editor' : 
                   collaborator.role === 'VIEWER' ? 'Visualizador' : 
                   'Participante'}
                </p>
              </div>
              <div className="flex items-center">
                <span 
                  className={`h-2 w-2 rounded-full ${
                    collaborator.status === 'ACTIVE' ? 'bg-green-500' : 
                    collaborator.status === 'INACTIVE' ? 'bg-yellow-500' : 
                    'bg-gray-500'
                  }`}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CollaborationPanel;
