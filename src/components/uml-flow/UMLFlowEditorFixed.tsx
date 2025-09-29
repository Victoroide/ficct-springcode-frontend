import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Panel,
  BackgroundVariant
} from 'reactflow';
import type { Node, Edge, NodeChange, EdgeChange, Connection, NodeProps } from 'reactflow';

// Import our custom components
import UMLClassNode from './nodes/UMLClassNode';
import UMLInterfaceNode from './nodes/UMLInterfaceNode';
import UMLEnumNode from './nodes/UMLEnumNode';
import AttributeHandleNode from './nodes/AttributeHandleNode';
import UMLRelationshipEdge from './edges/UMLRelationshipEdge';
import AttributeRelationshipEdge from './edges/AttributeRelationshipEdge';
import UMLToolbar from './UMLToolbarSimple';
import AnonymousChat from '../chat/AnonymousChat';
import CodeGenerator from './CodeGenerator';
import UMLNodePanel from './panels/UMLNodePanel';
import UMLRelationshipPanel from './panels/UMLRelationshipPanel';
import UMLEnumPanel from './panels/UMLEnumPanel';
import UMLClassEditor from './modals/UMLClassEditor';
import CodeGenerationModal from './modals/CodeGenerationModal';
import ResponsivePropertiesPanel from './panels/ResponsivePropertiesPanel';

// Import types and utility functions
import {
  generateId,
  type UMLNodeType,
  type UMLRelationshipType,
  type UMLVisibility,
  type UMLNode,
  type UMLEdge
} from './types';

import type {
  UMLNodeData,
  UMLEdgeData,
  EditorMode,
  UMLEnumValue
} from './types';
// Import styles
import 'reactflow/dist/style.css';
import './styles/uml-flow.css';

// Static edge type definitions (prevent re-creation)
const EDGE_TYPES = {
  umlRelationship: UMLRelationshipEdge,
  attributeRelationship: AttributeRelationshipEdge,
} as const;

export interface UMLFlowEditorFixedProps {
  // Required props from parent
  initialNodes?: Node[];
  initialEdges?: Edge[];

  // Callback props for parent to handle changes
  onUpdateFlowData?: (nodes: Node[], edges: Edge[]) => void;

  // Optional props
  diagramId?: string;
  diagramName?: string;
  isNewDiagram?: boolean;
  onSave?: () => void;
  
  // Chat integration props - TASK 1 FIX
  onSendChatMessage?: (message: string) => void;
  onSendTypingIndicator?: (isTyping: boolean) => void;
  chatMessages?: Array<{id: string; content: string; sender: {id: string; nickname: string}; timestamp: Date; type: 'message' | 'system'}>;
  isConnected?: boolean;
  connectedUserCount?: number;
}

const UMLFlowEditorFixed: React.FC<UMLFlowEditorFixedProps> = ({
  initialNodes = [],
  initialEdges = [],
  onUpdateFlowData,
  diagramId,
  diagramName = 'Nuevo Diagrama UML',
  isNewDiagram = false,
  onSave,
  onSendChatMessage,
  onSendTypingIndicator,
  chatMessages = [],
  isConnected = false,
  connectedUserCount = 1
}) => {
  // LOCAL React Flow state (no WebSocket services)
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // UI state
  const [selectedNode, setSelectedNode] = useState<Node<UMLNodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge<UMLEdgeData> | null>(null);
  const [editingNodeData, setEditingNodeData] = useState<UMLNodeData | null>(null);
  const [showNodePanel, setShowNodePanel] = useState(false);
  const [showEnumPanel, setShowEnumPanel] = useState(false);
  const [showRelationshipPanel, setShowRelationshipPanel] = useState(false);
  const [showClassEditor, setShowClassEditor] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('select');

  // Chat state now comes from props - TASK 1 FIX: Use parent connection status

  // Refs for tracking user actions vs external updates
  const isUserActionRef = useRef(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // Update internal state when props change (for WebSocket updates)
  useEffect(() => {
    if (JSON.stringify(nodes) !== JSON.stringify(initialNodes)) {
      setNodes(initialNodes);
    }
  }, [initialNodes]);

  useEffect(() => {
    if (JSON.stringify(edges) !== JSON.stringify(initialEdges)) {
      setEdges(initialEdges);
    }
  }, [initialEdges]);

  // TASK 2 FIX: Prevent React Flow state loop with user action tracking
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    isUserActionRef.current = true;

    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);

    // Notify parent component (which handles WebSocket broadcasting)
    if (onUpdateFlowData) {
      onUpdateFlowData(updatedNodes, edges);
    }

    // Reset user action flag
    setTimeout(() => {
      isUserActionRef.current = false;
    }, 100);

  }, [nodes, edges, onUpdateFlowData]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    isUserActionRef.current = true;

    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);

    // Notify parent component (which handles WebSocket broadcasting)
    if (onUpdateFlowData) {
      onUpdateFlowData(nodes, updatedEdges);
    }

    // Reset user action flag
    setTimeout(() => {
      isUserActionRef.current = false;
    }, 100);

  }, [edges, nodes, onUpdateFlowData]);

  // Connection handler
  const onConnect = useCallback((params: Connection) => {
    isUserActionRef.current = true;

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: params.source!,
      target: params.target!,
      sourceHandle: params.sourceHandle,
      targetHandle: params.targetHandle,
      type: 'umlRelationship',
      data: {
        relationshipType: 'ASSOCIATION' as UMLRelationshipType,
        sourceMultiplicity: '1',
        targetMultiplicity: '1',
        label: ''
      }
    };

    const updatedEdges = addEdge(newEdge, edges);
    setEdges(updatedEdges);

    // Notify parent component
    if (onUpdateFlowData) {
      onUpdateFlowData(nodes, updatedEdges);
    }

    // Reset user action flag
    setTimeout(() => {
      isUserActionRef.current = false;
    }, 100);

  }, [edges, nodes, onUpdateFlowData]);

  // Node creation functions (simplified, no WebSocket spam)
  const createClassNode = useCallback((position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `class-${Date.now()}`,
      type: 'class',
      position,
      data: {
        label: 'Nueva Clase',
        nodeType: 'class' as UMLNodeType,
        attributes: [],
        methods: [],
        isAbstract: false
      }
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);

    if (onUpdateFlowData) {
      onUpdateFlowData(updatedNodes, edges);
    }
  }, [nodes, edges, onUpdateFlowData]);

  const createInterfaceNode = useCallback((position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `interface-${Date.now()}`,
      type: 'interface',
      position,
      data: {
        label: 'Nueva Interface',
        nodeType: 'interface' as UMLNodeType,
        attributes: [],
        methods: []
      }
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);

    if (onUpdateFlowData) {
      onUpdateFlowData(updatedNodes, edges);
    }
  }, [nodes, edges, onUpdateFlowData]);

  const createEnumNode = useCallback((position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `enum-${Date.now()}`,
      type: 'enum',
      position,
      data: {
        label: 'Nuevo Enum',
        nodeType: 'enum' as UMLNodeType,
        attributes: [],
        methods: [],
        enumValues: [
          { id: generateId(), name: 'VALOR1' },
          { id: generateId(), name: 'VALOR2' },
        ]
      }
    };

    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);

    if (onUpdateFlowData) {
      onUpdateFlowData(updatedNodes, edges);
    }
  }, [nodes, edges, onUpdateFlowData]);

  // Handle node clicks - set selection and open appropriate panel
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node<UMLNodeData>) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setShowPropertiesPanel(true);
    setShowNodePanel(false);
    setShowEnumPanel(false);
    setShowRelationshipPanel(false);
  }, []);

  // Edge click handler - TASK 3 FIX: Open relationship panel for multiplicity editing
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.preventDefault();
    event.stopPropagation();
    setSelectedEdge(edge);
    setSelectedNode(null);
    setShowPropertiesPanel(false);
    setShowRelationshipPanel(true); // FIXED: Show relationship panel instead of hiding it
  }, []);

  // Update node data
  const updateNodeData = useCallback((nodeId: string, newData: Partial<UMLNodeData>) => {
    const updatedNodes = nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    );

    setNodes(updatedNodes);

    if (onUpdateFlowData) {
      onUpdateFlowData(updatedNodes, edges);
    }
  }, [nodes, edges, onUpdateFlowData]);

  // Update edge data
  const updateEdgeData = useCallback((edgeId: string, newData: Partial<UMLEdgeData>) => {
    const updatedEdges = edges.map(edge =>
      edge.id === edgeId
        ? { ...edge, data: { ...edge.data, ...newData } }
        : edge
    );

    setEdges(updatedEdges);

    if (onUpdateFlowData) {
      onUpdateFlowData(nodes, updatedEdges);
    }
  }, [edges, nodes, onUpdateFlowData]);

  // Delete selected elements
  const deleteSelectedElements = useCallback(() => {
    if (selectedNode) {
      const updatedNodes = nodes.filter(n => n.id !== selectedNode.id);
      const updatedEdges = edges.filter(e =>
        e.source !== selectedNode.id && e.target !== selectedNode.id
      );

      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setSelectedNode(null);
      setShowNodePanel(false);
      setShowEnumPanel(false);

      if (onUpdateFlowData) {
        onUpdateFlowData(updatedNodes, updatedEdges);
      }
    }

    if (selectedEdge) {
      const updatedEdges = edges.filter(e => e.id !== selectedEdge.id);
      setEdges(updatedEdges);
      setSelectedEdge(null);
      setShowRelationshipPanel(false);

      if (onUpdateFlowData) {
        onUpdateFlowData(nodes, updatedEdges);
      }
    }
  }, [selectedNode, selectedEdge, nodes, edges, onUpdateFlowData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedElements();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [deleteSelectedElements]);

  // Panel close handlers
  const closeNodePanel = useCallback(() => {
    setShowNodePanel(false);
    setSelectedNode(null);
  }, []);

  const closeEnumPanel = useCallback(() => {
    setShowEnumPanel(false);
    setSelectedNode(null);
  }, []);

  const closeRelationshipPanel = useCallback(() => {
    setShowRelationshipPanel(false);
    setSelectedEdge(null);
  }, []);

  // Class editor handlers
  const openClassEditor = useCallback((nodeData: UMLNodeData) => {
    setEditingNodeData(nodeData);
    setShowClassEditor(true);
  }, []);

  const closeClassEditor = useCallback(() => {
    setShowClassEditor(false);
    setEditingNodeData(null);
  }, []);

  const handleClassEditorSave = useCallback((updatedData: UMLNodeData) => {
    if (!editingNodeData) return;

    const updatedNodes = nodes.map(node => {
      if (node.data === editingNodeData) {
        return {
          ...node,
          data: updatedData
        };
      }
      return node;
    });

    setNodes(updatedNodes);

    if (onUpdateFlowData) {
      onUpdateFlowData(updatedNodes, edges);
    }

    closeClassEditor();
  }, [nodes, edges, editingNodeData, onUpdateFlowData, closeClassEditor]);

  // Code generator is now self-contained - no handlers needed

  // Chat handlers - TASK 1 FIX: Real WebSocket integration
  const handleSendMessage = useCallback((message: string) => {
    // Send via WebSocket using unified message format
    if (onSendChatMessage) {
      onSendChatMessage(message);
    }
  }, [onSendChatMessage]);

  const handleTyping = useCallback((isTyping: boolean) => {
    // Send typing indicator via WebSocket
    if (onSendTypingIndicator) {
      onSendTypingIndicator(isTyping);
    }
  }, [onSendTypingIndicator]);

  // Node types with onEdit handler for class nodes - FIXED: Correct type mapping
  const nodeTypes = useMemo(() => ({
    class: (props: NodeProps<UMLNodeData>) => <UMLClassNode {...props} onEdit={openClassEditor} />,
    interface: UMLInterfaceNode,
    enum: UMLEnumNode,
    attributeHandle: AttributeHandleNode
  }), [openClassEditor]);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        edgeTypes={EDGE_TYPES}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            switch (node.type) {
              case 'class': return '#3B82F6';
              case 'interface': return '#10B981';
              case 'enum': return '#F59E0B';
              default: return '#6B7280';
            }
          }}
          maskColor="rgba(255, 255, 255, 0.2)"
          position="bottom-right"
        />

        {/* Toolbar */}
        <Panel position="top-left">
          <UMLToolbar
            mode={editorMode}
            onModeChange={setEditorMode}
            onCreateClass={createClassNode}
            onCreateInterface={createInterfaceNode}
            onCreateEnum={createEnumNode}
            onDeleteSelected={deleteSelectedElements}
            hasSelection={!!(selectedNode || selectedEdge)}
            onSave={onSave}
            nodes={nodes}
            edges={edges}
          />
        </Panel>
        
        {/* Real-time Collaborative Chat Panel - TASK 1 FIX: Connected to WebSocket */}
        <AnonymousChat 
          diagramId={diagramId || 'anonymous-diagram'}
          currentUser={{ 
            id: 'anonymous-user', 
            nickname: 'Anonymous User', 
            isOnline: isConnected 
          }}
          onlineUsers={[
            { id: 'anonymous-user', nickname: 'Anonymous User', isOnline: true }
          ]}
          messages={chatMessages}
          isConnected={isConnected}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </ReactFlow>

      {/* Node Panel */}
      {showNodePanel && selectedNode && (
        <UMLNodePanel
          node={selectedNode}
          onUpdateNode={updateNodeData}
          onClose={closeNodePanel}
        />
      )}

      {/* Enum Panel */}
      {showEnumPanel && selectedNode && (
        <UMLEnumPanel
          node={selectedNode}
          onUpdateNode={updateNodeData}
          onClose={closeEnumPanel}
        />
      )}

      {/* Relationship Panel */}
      {showRelationshipPanel && selectedEdge && (
        <UMLRelationshipPanel
          edge={selectedEdge}
          onUpdateEdge={updateEdgeData}
          onClose={closeRelationshipPanel}
        />
      )}

      {/* Class Editor Modal */}
      {showClassEditor && editingNodeData && (
        <UMLClassEditor
          isOpen={showClassEditor}
          nodeData={editingNodeData}
          onClose={closeClassEditor}
          onSave={handleClassEditorSave}
        />
      )}

      {/* Code Generation Modal - Now integrated into toolbar */}

      {/* Responsive Properties Panel */}
      <ResponsivePropertiesPanel
        isOpen={showPropertiesPanel}
        selectedNode={selectedNode}
        selectedEdge={selectedEdge}
        onUpdateNode={updateNodeData}
        onUpdateEdge={updateEdgeData}
        onClose={() => setShowPropertiesPanel(false)}
      />
    </div>
  );
};

// Wrapper component with ReactFlowProvider
const UMLFlowEditorFixedWrapper: React.FC<UMLFlowEditorFixedProps> = (props) => (
  <ReactFlowProvider>
    <UMLFlowEditorFixed {...props} />
  </ReactFlowProvider>
);

export default UMLFlowEditorFixedWrapper;
