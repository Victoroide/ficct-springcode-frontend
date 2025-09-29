/**
 * UML Flow Editor with AI Assistant Integration
 * Enhanced version of the UML editor with integrated AI Assistant
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Node, Edge } from 'reactflow';

// Import existing components
import UMLFlowEditorFixed from './UMLFlowEditorFixed';
import AIAssistant from '../ai-assistant/AIAssistant';

// Import types
import type { UMLNode, UMLEdge } from './types';

interface UMLFlowEditorWithAIProps {
  diagramId?: string;
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
  onSave?: () => void;
  className?: string;
  isCollaborating?: boolean;
  onStartCollaboration?: () => void;
  onStopCollaboration?: () => void;
  hasUnsavedChanges?: boolean;
}

const UMLFlowEditorWithAI: React.FC<UMLFlowEditorWithAIProps> = ({
  diagramId,
  initialNodes = [],
  initialEdges = [],
  onNodesChange,
  onEdgesChange,
  onSave,
  className = '',
  isCollaborating = false,
  onStartCollaboration,
  onStopCollaboration,
  hasUnsavedChanges = false
}) => {
  // State for tracking nodes and edges to pass to AI Assistant
  const [currentNodes, setCurrentNodes] = useState<Node[]>(initialNodes);
  const [currentEdges, setCurrentEdges] = useState<Edge[]>(initialEdges);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  // AI Assistant state
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // Update internal state when props change
  useEffect(() => {
    setCurrentNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    setCurrentEdges(initialEdges);
  }, [initialEdges]);

  // Handle nodes change with AI context tracking
  const handleNodesChange = useCallback((nodes: Node[]) => {
    setCurrentNodes(nodes);
    onNodesChange?.(nodes);
    
    // Track user action for AI context
    setCurrentAction('Modificando nodos del diagrama');
    setTimeout(() => setCurrentAction(null), 3000);
  }, [onNodesChange]);

  // Handle edges change with AI context tracking
  const handleEdgesChange = useCallback((edges: Edge[]) => {
    setCurrentEdges(edges);
    onEdgesChange?.(edges);
    
    // Track user action for AI context
    setCurrentAction('Modificando relaciones del diagrama');
    setTimeout(() => setCurrentAction(null), 3000);
  }, [onEdgesChange]);

  // Handle save with AI context tracking
  const handleSave = useCallback(() => {
    onSave?.();
    
    // Track user action for AI context
    setCurrentAction('Guardando diagrama');
    setTimeout(() => setCurrentAction(null), 3000);
  }, [onSave]);

  // Toggle AI Assistant
  const toggleAIAssistant = useCallback(() => {
    console.log('toggleAIAssistant called, current state:', isAIAssistantOpen);
    setIsAIAssistantOpen(prev => {
      console.log('Setting AI Assistant open to:', !prev);
      return !prev;
    });
  }, [isAIAssistantOpen]);

  // Handle AI Assistant feature navigation
  const handleFeatureNavigation = useCallback((feature: string) => {
    // This could navigate to specific parts of the application
    // For now, just show a notification that the feature would be opened
    console.log('Navigating to feature:', feature);
    
    // You could add logic here to:
    // - Open code generation modal if feature includes "código"
    // - Navigate to export panel if feature includes "exportar"
    // - etc.
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+H to toggle AI Assistant (case insensitive)
      if (event.ctrlKey && (event.key === 'h' || event.key === 'H')) {
        event.preventDefault();
        event.stopPropagation();
        console.log('Ctrl+H pressed - toggling AI Assistant');
        toggleAIAssistant();
      }
      
      // Escape to close AI Assistant
      if (event.key === 'Escape' && isAIAssistantOpen) {
        event.preventDefault();
        setIsAIAssistantOpen(false);
      }
    };

    // Add to document and window for maximum coverage
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keydown', handleKeyDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isAIAssistantOpen, toggleAIAssistant]);

  // Memoize AI Assistant props to prevent unnecessary re-renders
  const aiAssistantProps = useMemo(() => ({
    diagramId,
    diagramNodes: currentNodes,
    diagramEdges: currentEdges,
    currentAction,
    hasUnsavedChanges,
    isCollaborating,
    onFeatureNavigation: handleFeatureNavigation
  }), [
    diagramId, 
    currentNodes, 
    currentEdges, 
    currentAction, 
    hasUnsavedChanges, 
    isCollaborating, 
    handleFeatureNavigation
  ]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Main UML Editor */}
      <UMLFlowEditorFixed
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        onNodesUpdate={handleNodesChange}
        onEdgesUpdate={handleEdgesChange}
        onSave={handleSave}
        isCollaborating={isCollaborating}
        onStartCollaboration={onStartCollaboration}
        onStopCollaboration={onStopCollaboration}
        // Pass AI Assistant toggle function to toolbar
        onToggleAIAssistant={toggleAIAssistant}
        isAIAssistantOpen={isAIAssistantOpen}
      />

      {/* AI Assistant Overlay */}
      <AIAssistant
        {...aiAssistantProps}
        isOpen={isAIAssistantOpen}
        onToggle={toggleAIAssistant}
        className="z-50"
      />

      {/* Optional: AI Assistant activation hint for new users */}
      {!isAIAssistantOpen && currentNodes.length === 0 && (
        <div className="absolute bottom-20 right-6 bg-blue-100 border border-blue-300 rounded-lg p-3 shadow-lg max-w-xs z-40">
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">💡 Sugerencia</p>
            <p className="text-blue-800 text-xs">
              ¿Necesitas ayuda? Haz clic en el botón <strong>🧠</strong> o presiona <kbd className="bg-blue-200 px-1 rounded">Ctrl+H</kbd> para abrir el asistente IA
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UMLFlowEditorWithAI;
