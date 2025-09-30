/**
 * UML Flow Editor with AI Assistant Integration
 * Enhanced version of the UML editor with integrated AI Assistant
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Node, Edge } from 'reactflow';

// Import existing components
import UMLFlowEditorFixed from './UMLFlowEditorBase';
import AIAssistantComplete from '../ai-assistant/AIAssistantComplete';

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
  showCommandInput?: boolean;
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
  hasUnsavedChanges = false,
  showCommandInput = true
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

  // Handle elements generated from natural language commands
  const handleElementsGenerated = useCallback((elements: { nodes: any[]; edges: any[] }) => {
    const newNodes = [...currentNodes, ...elements.nodes];
    const newEdges = [...currentEdges, ...elements.edges];
    
    setCurrentNodes(newNodes);
    setCurrentEdges(newEdges);
    
    onNodesChange?.(newNodes);
    onEdgesChange?.(newEdges);
    
    // Track user action for AI context
    setCurrentAction(`Elementos generados por IA: ${elements.nodes.length} nodos, ${elements.edges.length} relaciones`);
    setTimeout(() => setCurrentAction(null), 5000);
  }, [currentNodes, currentEdges, onNodesChange, onEdgesChange]);

  // Handle save with AI context tracking
  const handleSave = useCallback(() => {
    onSave?.();
    
    // Track user action for AI context
    setCurrentAction('Guardando diagrama');
    setTimeout(() => setCurrentAction(null), 3000);
  }, [onSave]);

  // Toggle AI Assistant
  const toggleAIAssistant = useCallback(() => {
    setIsAIAssistantOpen(prev => !prev);
  }, []);

  // Handle AI Assistant feature navigation
  const handleFeatureNavigation = useCallback((feature: string) => {
    // This could navigate to specific parts of the application
    // For now, just show a notification that the feature would be opened
    
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
        event.stopPropagation();
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

  // Toggle natural language command input with keyboard shortcut visibility
  const commandInputProps = useMemo(() => ({
    diagramId,
    currentNodes,
    onElementsGenerated: handleElementsGenerated
  }), [
    diagramId,
    currentNodes,
    currentEdges,
    handleElementsGenerated
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
        onToggleAIAssistant={toggleAIAssistant}
        isAIAssistantOpen={isAIAssistantOpen}
      />

      {/* AI Assistant Complete - Password protection is handled in toolbar */}
      <AIAssistantComplete
        diagramId={diagramId}
        diagramNodes={currentNodes as UMLNode[]}
        diagramEdges={currentEdges as UMLEdge[]}
        isOpen={isAIAssistantOpen}
        onToggle={toggleAIAssistant}
        onElementsGenerated={handleElementsGenerated}
      />
    </div>
  );
};

export default UMLFlowEditorWithAI;
