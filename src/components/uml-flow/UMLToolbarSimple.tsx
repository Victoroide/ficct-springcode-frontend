/**
 * UMLToolbarSimple.tsx
 * Versión simplificada del toolbar para UML Editor Fixed
 */

import React, { useCallback, useState } from 'react';
import { MousePointer, Move, Box, Code, Database, Trash, Save, FileCode, Brain, Lock } from 'lucide-react';
import CodeGenerator from './CodeGenerator';
import { useAIAuthentication } from '@/hooks/useAIAuthentication';
import { AIPasswordModal } from '../ai-assistant/AIPasswordModal';
import type { EditorMode } from './types';

interface UMLToolbarSimpleProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  onCreateClass: (position: { x: number; y: number }) => void;
  onCreateInterface: (position: { x: number; y: number }) => void;
  onCreateEnum: (position: { x: number; y: number }) => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  onSave?: () => void;
  nodes?: any[];
  edges?: any[];
  // AI Assistant props
  onToggleAIAssistant?: () => void;
  isAIAssistantOpen?: boolean;
}

const UMLToolbarSimple: React.FC<UMLToolbarSimpleProps> = ({
  mode,
  onModeChange,
  onCreateClass,
  onCreateInterface,
  onCreateEnum,
  onDeleteSelected,
  hasSelection,
  onSave,
  nodes = [],
  edges = [],
  onToggleAIAssistant,
  isAIAssistantOpen
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { isAuthenticated, authenticateUser, attempts, maxAttempts } = useAIAuthentication();

  const handleCreateNode = (type: string) => {
    const position = { x: 100, y: 100 };
    
    switch (type) {
      case 'class':
        onCreateClass(position);
        break;
      case 'interface':
        onCreateInterface(position);
        break;
      case 'enum':
        onCreateEnum(position);
        break;
        break;
    }
  };

  const handleAIButtonClick = () => {
    if (!isAuthenticated) {
      setShowPasswordModal(true);
    } else {
      onToggleAIAssistant?.();
    }
  };

  const handleAuthentication = (password: string) => {
    const success = authenticateUser(password);
    if (success) {
      setShowPasswordModal(false);
      onToggleAIAssistant?.();
    }
    return success;
  };

  return (
    <div className="uml-toolbar">
      {/* Selection Tools - RESTORED Professional Group */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Selection</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`${mode === 'select' ? 'bg-blue-600 text-white' : ''}`}
          onClick={() => onModeChange('select')}
          title="Seleccionar elementos"
        >
          <MousePointer className="h-5 w-5" />
        </button>

        <button
          className={`${mode === 'pan' ? 'bg-blue-600 text-white' : ''}`}
          onClick={() => onModeChange('pan')}
          title="Mover canvas"
        >
          <Move className="h-5 w-5" />
        </button>
      </div>
      
      {/* UML Elements - RESTORED Professional Group */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">UML Elements</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        <button
          className={`${mode === 'class' ? 'bg-blue-600 text-white' : ''}`}
          onClick={() => {
            onModeChange('class');
            handleCreateNode('class');
          }}
          title="Crear clase"
        >
          <Box className="h-5 w-5" />
        </button>
        
        <button
          className={`${mode === 'interface' ? 'bg-blue-600 text-white' : ''}`}
          onClick={() => {
            onModeChange('interface');
            handleCreateNode('interface');
          }}
          title="Crear interfaz"
        >
          <Code className="h-5 w-5" />
        </button>
        
        <button
          className={`${mode === 'enum' ? 'bg-blue-600 text-white' : ''}`}
          onClick={() => {
            onModeChange('enum');
            handleCreateNode('enum');
          }}
          title="Crear enumeración"
        >
          <Database className="h-5 w-5" />
        </button>
      </div>
      
      {/* Actions - RESTORED Professional Group */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</span>
      </div>
      <div className="flex items-center gap-2 mb-4">
        {hasSelection && (
          <button
            className="text-red-600 hover:bg-red-50"
            onClick={onDeleteSelected}
            title="Eliminar selección"
          >
            <Trash className="h-5 w-5" />
          </button>
        )}
        
        {onSave && (
          <button
            onClick={onSave}
            title="Guardar diagrama"
          >
            <Save className="h-5 w-5" />
          </button>
        )}
        
        {onToggleAIAssistant && (
          <button
            className={`relative ${
              isAIAssistantOpen 
                ? 'bg-blue-600 text-white' 
                : isAuthenticated 
                  ? 'text-blue-600 hover:bg-blue-50' 
                  : 'text-gray-400 hover:bg-gray-50'
            }`}
            onClick={handleAIButtonClick}
            title={isAuthenticated ? 'Asistente de IA' : 'Asistente de IA (Requiere contraseña)'}
          >
            {isAuthenticated ? (
              <Brain className="h-5 w-5" />
            ) : (
              <div className="relative">
                <Brain className="h-5 w-5 opacity-50" />
                <Lock className="h-3 w-3 absolute -bottom-1 -right-1 bg-white rounded-full" />
              </div>
            )}
          </button>
        )}
      </div>

      {/* Password Modal */}
      <AIPasswordModal
        isOpen={showPasswordModal}
        onAuthenticate={handleAuthentication}
        onClose={() => setShowPasswordModal(false)}
        attempts={attempts}
        maxAttempts={maxAttempts}
      />
      
      {/* Code Generation - RESTORED Professional Group */}
      {nodes.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Generate</span>
          </div>
          <div className="flex items-center gap-2">
            <CodeGenerator nodes={nodes} edges={edges} />
          </div>
        </>
      )}
    </div>
  );
};

export default UMLToolbarSimple;
