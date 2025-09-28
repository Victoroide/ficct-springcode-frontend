/**
 * UMLFlowEditor.tsx
 * Enhanced UML editor with proper UML nodes, relationships, and editing capabilities
 */

import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Panel,
  BackgroundVariant,
  useViewport,
  useOnViewportChange,
  applyNodeChanges,
  applyEdgeChanges
} from 'reactflow';
import type { Connection, Viewport } from 'reactflow';
import type { UMLNode, UMLEdge } from './types';
import { toast } from '@/components/ui/toast-service';
import { getWebSocketService, ConnectionState, WebSocketMessageBuilders } from '@/services/websocketService';
import { WebSocketMessageType, ChangeEventType } from '@/types/collaboration';
// Removed: useDiagramAutoSave hook (auth-dependent)

// Import our custom components
import UMLClassNode from './nodes/UMLClassNode';
import UMLInterfaceNode from './nodes/UMLInterfaceNode';
import UMLEnumNode from './nodes/UMLEnumNode';
import AttributeHandleNode from './nodes/AttributeHandleNode';
import UMLRelationshipEdge from './edges/UMLRelationshipEdge';
import AttributeRelationshipEdge from './edges/AttributeRelationshipEdge';
import type { UMLEdgeData as NewUMLEdgeData } from './edges/UMLRelationshipEdge';
import UMLToolbar from './UMLToolbar';
import UMLNodePanel from './panels/UMLNodePanel';
import UMLRelationshipPanel from './panels/UMLRelationshipPanel';
import UMLEnumPanel from './panels/UMLEnumPanel';
import CollaborationPanel from './CollaborationPanel';
import CollaborativeCursors from './CollaborativeCursors';
import CodeGenerator from './CodeGenerator';

// Import types
import { 
  UMLNodeType, 
  UMLRelationshipType,
  UMLVisibility,
  generateId 
} from './types';
import type { 
  UMLNodeData, 
  UMLEdgeData, 
  EditorMode 
} from './types';

// Import styles
import 'reactflow/dist/style.css';
import './styles/uml-flow.css';

// 🔧 PERFORMANCE: Node types registry - STATIC OBJECTS outside component
const NODE_TYPES = {
  class: UMLClassNode,
  interface: UMLInterfaceNode,
  abstractClass: UMLClassNode,
  enum: UMLEnumNode,
  record: UMLClassNode,
  attributeHandle: AttributeHandleNode,
} as const;

// 🔧 PERFORMANCE: Edge types registry - STATIC OBJECTS outside component
const EDGE_TYPES = {
  umlRelationship: UMLRelationshipEdge,
  attributeRelationship: AttributeRelationshipEdge,
} as const;

// 🔧 PERFORMANCE: Default user profile - STATIC OBJECT
const DEFAULT_USER_PROFILE = {
  id: 1,  // Mock user ID, should come from authentication
  firstName: 'Current',
  lastName: 'User'
} as const;

export interface UMLFlowEditorProps {
  onSave?: () => void;
  onUpdateFlowData?: (nodes: any[], edges: any[]) => void;
  diagramId?: string;
  diagramName?: string;
  isNewDiagram?: boolean;
}

const UMLFlowEditor: React.FC<UMLFlowEditorProps> = ({ 
  onSave, 
  onUpdateFlowData,
  diagramId, 
  diagramName = 'Nuevo Diagrama UML',
  isNewDiagram = false 
}) => {
  // React Flow states
  const [nodes, setNodes] = useNodesState<any>([]);
  const [edges, setEdges] = useEdgesState<any>([]);
  
  // Selection state
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<any | null>(null);
  
  // Editor state
  const [editorMode, setEditorMode] = useState<EditorMode>('select');
  const [showMinimap, setShowMinimap] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [cursorPositions, setCursorPositions] = useState<Record<number, any>>({});
  const [localDiagramId, setLocalDiagramId] = useState<string>("");
  
  // For collaboration - MUST be defined before using in callbacks
  const wsService = useMemo(() => getWebSocketService(), []);
  // 🔧 PERFORMANCE: Usar perfil estático
  const userProfile = DEFAULT_USER_PROFILE;
  
  // 🔧 CRITICAL FIX: Implementar WebSocket sending de node changes
  const onNodesChange = useCallback((changes) => {
    // Aplicar cambios localmente primero
    const updatedNodes = applyNodeChanges(changes, nodes);
    setNodes(updatedNodes);
    
    // BROADCAST TO OTHER USERS - Solo si estamos conectados
    if (isCollaborating && wsService?.isConnected()) {
      if (import.meta.env.DEV) {
        console.log('💬 Enviando cambios de nodos vía WebSocket:', changes);
      }
      
      // Usar la función especializada para eventos de cambio con formato correcto
      wsService.sendChangeEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session: diagramId || 'default-session',
        user: userProfile.id,
        eventType: ChangeEventType.ELEMENT_UPDATED,
        targetId: changes[0]?.id,
        changeData: {
          changes,
          nodes: updatedNodes,
          timestamp: Date.now()
        },
        metadata: {},
        timestamp: new Date().toISOString(),
        synchronized: false
      }).catch(err => console.error('Error enviando cambios de nodos:', err));
    }
  }, [nodes, wsService, isCollaborating, diagramId, userProfile]);
  
  // 🔧 CRITICAL FIX: Implementar WebSocket sending de edge changes
  const onEdgesChange = useCallback((changes) => {
    // Aplicar cambios localmente primero
    const updatedEdges = applyEdgeChanges(changes, edges);
    setEdges(updatedEdges);
    
    // BROADCAST TO OTHER USERS - Solo si estamos conectados
    if (isCollaborating && wsService?.isConnected()) {
      if (import.meta.env.DEV) {
        console.log('💬 Enviando cambios de aristas vía WebSocket:', changes);
      }
      
      // Usar la función especializada para eventos de cambio con formato correcto
      wsService.sendChangeEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session: diagramId || 'default-session',
        user: userProfile.id,
        eventType: ChangeEventType.RELATIONSHIP_UPDATED,
        targetId: changes[0]?.id,
        changeData: {
          changes,
          edges: updatedEdges,
          timestamp: Date.now()
        },
        metadata: {},
        timestamp: new Date().toISOString(),
        synchronized: false
      }).catch(err => console.error('Error enviando cambios de aristas:', err));
    }
  }, [edges, wsService, isCollaborating, diagramId, userProfile]);
  
  // Notificar al componente padre sobre cambios en nodos y aristas
  useEffect(() => {
    if (onUpdateFlowData) {
      onUpdateFlowData(nodes, edges);
    }
  }, [nodes, edges, onUpdateFlowData]);
  
  // NOTA: Ya se declararon los estados anteriormente
  
  // Removed: Auto-save functionality (auth-dependent)
  
  // Refs
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();
  const viewport = useViewport();

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle edge selection
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: any) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Handle edge creation
  const onConnect = useCallback((connection: Connection) => {
    // Create a UML relationship edge
    const edge = {
      ...connection,
      id: generateId(),
      type: 'umlRelationship',
      data: {
        relationshipType: UMLRelationshipType.ASSOCIATION,
      }
    };
    
    setEdges((eds) => addEdge(edge, eds));
    
    // 🔧 CRITICAL FIX: BROADCAST NEW CONNECTION via WebSocket
    if (isCollaborating && wsService?.isConnected()) {
      if (import.meta.env.DEV) {
        console.log('💬 Enviando nueva conexión vía WebSocket:', edge);
      }
      
      // Enviar evento de creación de relación con formato correcto
      wsService.sendChangeEvent({
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        session: diagramId || 'default-session',
        user: userProfile.id,
        eventType: ChangeEventType.RELATIONSHIP_CREATED,
        targetId: edge.id,
        changeData: {
          relationship: edge,
          timestamp: Date.now()
        },
        metadata: {},
        timestamp: new Date().toISOString(),
        synchronized: false
      }).catch(err => console.error('Error enviando nueva conexión:', err));
    }
    
    toast({
      title: 'Relación creada',
      description: 'Nueva relación entre elementos',
      variant: 'success'
    });
  }, [setEdges, isCollaborating, wsService, diagramId, userProfile]);

  // Create a new UML node
  const createUMLNode = useCallback((nodeType: UMLNodeType, position: { x: number, y: number }) => {
    const nodeData: UMLNodeData = {
      label: getDefaultNodeName(nodeType),
      nodeType,
      attributes: [],
      methods: [],
      isAbstract: nodeType === UMLNodeType.ABSTRACT_CLASS,
    };

    const newNode = {
      id: generateId(),
      type: getReactFlowNodeType(nodeType),
      position,
      data: nodeData,
    };

    setNodes(nds => [...nds, newNode]);
    setSelectedNode(newNode);
    setEditorMode('select');
    
    toast({
      title: 'Elemento creado',
      description: `${getDefaultNodeName(nodeType)} añadido al diagrama`,
      variant: 'success'
    });
  }, [setNodes]);

  // Handle canvas click to add nodes
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (editorMode !== 'select' && editorMode !== 'pan' && editorMode !== 'connect') {
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (reactFlowBounds) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top
        });

        const nodeType = getUMLNodeType(editorMode);
        if (nodeType) {
          createUMLNode(nodeType, position);
        }
      }
    } else {
      // Clear selections when clicking on pane
      setSelectedNode(null);
      setSelectedEdge(null);
    }
  }, [editorMode, reactFlowInstance, createUMLNode]);

  // 🔧 OPTIMIZACIÓN: Update node data - removed nodes,edges dependency
  const onNodeDataUpdate = useCallback((nodeId: string, updates: Partial<UMLNodeData>) => {
    setNodes(nds => nds.map(node => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: { ...node.data, ...updates }
        };
      }
      return node;
    }));
    
    if (selectedNode && selectedNode.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...updates } } : null);
    }
  }, [setNodes, selectedNode]);

  // 🔧 OPTIMIZACIÓN: Update edge data - removed nodes,edges dependency
  const onEdgeDataUpdate = useCallback((edgeId: string, data: NewUMLEdgeData) => {
    setEdges(eds => eds.map(edge => {
      if (edge.id === edgeId) {
        return { ...edge, data };
      }
      return edge;
    }));
    
    // Update selected edge if it's the one being updated
    if (selectedEdge && selectedEdge.id === edgeId) {
      setSelectedEdge(prev => prev ? { ...prev, data } : null);
    }
  }, [setEdges, selectedEdge]);

  // Delete selected elements
  const handleDelete = useCallback(() => {
    if (selectedNode) {
      setNodes(nodes => nodes.filter(node => node.id !== selectedNode.id));
      setEdges(edges => edges.filter(edge => 
        edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
      toast({
        title: 'Elemento eliminado',
        description: 'El elemento y sus relaciones han sido eliminados',
        variant: 'info'
      });
    } else if (selectedEdge) {
      setEdges(edges => edges.filter(edge => edge.id !== selectedEdge.id));
      setSelectedEdge(null);
      toast({
        title: 'Relación eliminada',
        description: 'La relación ha sido eliminada',
        variant: 'info'
      });
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    reactFlowInstance.zoomIn();
  }, [reactFlowInstance]);

  const handleZoomOut = useCallback(() => {
    reactFlowInstance.zoomOut();
  }, [reactFlowInstance]);

  const handleFitView = useCallback(() => {
    reactFlowInstance.fitView();
  }, [reactFlowInstance]);

  // Export diagram (placeholder)
  const handleExportDiagram = useCallback(() => {
    const diagramData = {
      nodes,
      edges,
      viewport: reactFlowInstance.getViewport()
    };
    
    console.log('Diagram data:', diagramData);
    
    toast({
      title: 'Exportar diagrama',
      description: 'Funcionalidad de exportación próximamente',
      variant: 'info'
    });
  }, [nodes, edges, reactFlowInstance]);
  
  // Send cursor position updates to collaborators
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isCollaborating || !reactFlowWrapper.current) return;
    
    const bounds = reactFlowWrapper.current.getBoundingClientRect();
    const position = reactFlowInstance.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    });
    
    wsService.updateCursor(position).catch(console.error);
  }, [isCollaborating, reactFlowInstance, wsService]);
  
  // Start collaboration session
  const startCollaboration = useCallback(async () => {
    if (isCollaborating) return;
    
    try {
      // Simplified collaboration for anonymous mode
      if (nodes.length === 0) {
        toast({
          title: 'No se puede iniciar colaboración',
          description: 'El diagrama está vacío. Agrega al menos una clase con contenido.',
          variant: 'warning'
        });
        return;
      }
      
      // Use local diagram info for anonymous collaboration
      const sessionId = diagramId || 'anonymous_session';
      const sessionName = diagramName || 'Anonymous Diagram';
      
      // Conectar al websocket para colaboración
      // El ID del diagrama debe pasarse como string, y el ID del usuario como number
      await wsService.connect(sessionId, userProfile.id);
      
      setIsCollaborating(true);
      
      // 🔧 CRITICAL FIX: Implementar listeners para WebSocket
      // Setup event handlers
      wsService.updateHandlers({
        onMessage: (message) => {
          // 🔧 CRITICAL FIX: Implementar procesamiento de mensajes WebSocket
          if (import.meta.env.DEV) {
            console.log('📺 Mensaje WebSocket recibido:', message);
          }
          
          // Procesar cambios en elementos del diagrama
          if (message.type === WebSocketMessageType.CHANGE_EVENT && message.event) {
            const changeEvent = message.event;
            
            // Evitar procesar eventos propios
            if (changeEvent.user === userProfile.id) {
              if (import.meta.env.DEV) {
                console.log('🔍 Ignorando evento propio:', changeEvent);
              }
              return;
            }
            
            // Procesamiento según tipo de evento
            switch (changeEvent.eventType) {
              case ChangeEventType.ELEMENT_UPDATED:
                // Actualizar nodos
                if (changeEvent.changeData?.nodes) {
                  if (import.meta.env.DEV) {
                    console.log('💻 Actualizando nodos desde otro usuario:', changeEvent.changeData.nodes);
                  }
                  setNodes(changeEvent.changeData.nodes);
                }
                break;
                
              case ChangeEventType.RELATIONSHIP_UPDATED:
                // Actualizar aristas
                if (changeEvent.changeData?.edges) {
                  if (import.meta.env.DEV) {
                    console.log('💻 Actualizando aristas desde otro usuario:', changeEvent.changeData.edges);
                  }
                  setEdges(changeEvent.changeData.edges);
                }
                break;
                
              case ChangeEventType.RELATIONSHIP_CREATED:
                // Añadir nueva arista
                if (changeEvent.changeData?.relationship) {
                  const newEdge = changeEvent.changeData.relationship;
                  if (import.meta.env.DEV) {
                    console.log('💻 Añadiendo nueva arista desde otro usuario:', newEdge);
                  }
                  setEdges(eds => [...eds.filter(e => e.id !== newEdge.id), newEdge]);
                }
                break;
                
              case ChangeEventType.ELEMENT_CREATED:
                // Añadir nuevo nodo
                if (changeEvent.changeData?.element) {
                  const newNode = changeEvent.changeData.element;
                  if (import.meta.env.DEV) {
                    console.log('💻 Añadiendo nuevo nodo desde otro usuario:', newNode);
                  }
                  setNodes(nds => [...nds.filter(n => n.id !== newNode.id), newNode]);
                }
                break;
                
              case ChangeEventType.ELEMENT_DELETED:
              case ChangeEventType.RELATIONSHIP_DELETED:
                // Eliminar elemento (nodo o arista)
                if (changeEvent.targetId) {
                  if (changeEvent.eventType === ChangeEventType.ELEMENT_DELETED) {
                    if (import.meta.env.DEV) {
                      console.log('💻 Eliminando nodo desde otro usuario:', changeEvent.targetId);
                    }
                    setNodes(nds => nds.filter(n => n.id !== changeEvent.targetId));
                    // También eliminar aristas conectadas
                    setEdges(eds => eds.filter(e => e.source !== changeEvent.targetId && e.target !== changeEvent.targetId));
                  } else {
                    if (import.meta.env.DEV) {
                      console.log('💻 Eliminando arista desde otro usuario:', changeEvent.targetId);
                    }
                    setEdges(eds => eds.filter(e => e.id !== changeEvent.targetId));
                  }
                }
                break;
            }
          }
          
          // Manejar actualizaciones de participantes
          else if (message.type === WebSocketMessageType.PARTICIPANT_UPDATE) {
            // Handling ParticipantUpdateMessage
            const participantMessage = message as any; // Type assertion para evitar errores
            
            if (participantMessage.action === 'joined' || participantMessage.action === 'role_changed') {
              // Add or update participant
              setCollaborators(prev => {
                const existingIndex = prev.findIndex(p => p.user === participantMessage.participant?.user);
                
                if (existingIndex >= 0 && participantMessage.participant) {
                  const updated = [...prev];
                  updated[existingIndex] = participantMessage.participant;
                  return updated;
                } else if (participantMessage.participant) {
                  return [...prev, participantMessage.participant];
                }
                return prev;
              });
            } else if (participantMessage.action === 'left' && participantMessage.participant) {
              // Remove participant
              setCollaborators(prev => 
                prev.filter(p => p.user !== participantMessage.participant?.user)
              );
            } else if (participantMessage.action === 'cursor_moved' && participantMessage.participant?.cursorPosition) {
              // Update cursor position
              const { user, cursorPosition, userInfo } = participantMessage.participant;
              if (user && cursorPosition) {
                setCursorPositions(prev => ({
                  ...prev,
                  [user]: {
                    userId: user,
                    position: cursorPosition,
                    userInfo: {
                      firstName: userInfo?.firstName || 'User',
                      lastName: userInfo?.lastName || '',
                      avatar: userInfo?.avatar,
                      color: `hsl(${Number(user) * 137.5 % 360}, 70%, 60%)`
                    },
                    lastUpdate: new Date().toISOString()
                  }
                }));
              }
            }
          } else if (message.type === WebSocketMessageType.CHANGE_EVENT) {
            // Handling ChangeEventMessage
            const changeMessage = message as any; // Type assertion
            if (changeMessage.event) {
              handleRemoteChangeEvent(changeMessage.event);
            }
          }
        },
        onDisconnect: () => {
          setIsCollaborating(false);
          setCollaborators([]);
          setCursorPositions({});
          toast({
            title: "Desconectado",
            description: "La sesión colaborativa ha terminado.",
            variant: "error"
          });
        }
      });
    } catch (error) {
      console.error('Failed to start collaboration:', error);
      toast({
        title: "Error de colaboración",
        description: "No se pudo iniciar la sesión colaborativa.",
        variant: "error"
      });
    }
  }, [diagramId, userProfile, wsService]);
  
  // Stop collaboration session
  const stopCollaboration = useCallback(async () => {
    try {
      await wsService.leaveSession();
      wsService.disconnect();
      setIsCollaborating(false);
      setCollaborators([]);
      setCursorPositions({});
      
      toast({
        title: "Colaboración finalizada",
        description: "Has salido de la sesión colaborativa.",
        variant: "info"
      });
    } catch (error) {
      console.error('Error stopping collaboration:', error);
    }
  }, [wsService]);
  
  // Handle remote change events
  const handleRemoteChangeEvent = useCallback((event: any) => {
    switch (event.eventType) {
      case ChangeEventType.ELEMENT_CREATED:
        // Add a new node
        const newNodeData = event.changeData.element;
        setNodes(nodes => [...nodes, {
          id: newNodeData.id,
          type: newNodeData.classType || 'class',
          position: newNodeData.position,
          data: { 
            label: newNodeData.name,
            nodeType: newNodeData.classType === 'class' ? UMLNodeType.CLASS : 
                      newNodeData.classType === 'interface' ? UMLNodeType.INTERFACE :
                      newNodeData.classType === 'abstractClass' ? UMLNodeType.ABSTRACT_CLASS :
                      newNodeData.classType === 'enum' ? UMLNodeType.ENUM : UMLNodeType.RECORD,
            attributes: [],
            methods: []
          }
        }]);
        break;
        
      case ChangeEventType.ELEMENT_MOVED:
        // Update node position
        setNodes(nodes => nodes.map(node => {
          if (node.id === event.targetId) {
            return {
              ...node,
              position: event.changeData.position
            };
          }
          return node;
        }));
        break;
        
      case ChangeEventType.ELEMENT_UPDATED:
        // Update node data
        setNodes(nodes => nodes.map(node => {
          if (node.id === event.targetId) {
            return {
              ...node,
              data: { ...node.data, ...event.changeData }
            };
          }
          return node;
        }));
        break;
        
      case ChangeEventType.ELEMENT_DELETED:
        // Delete node
        setNodes(nodes => nodes.filter(node => node.id !== event.targetId));
        // Also delete related edges
        setEdges(edges => edges.filter(edge => 
          edge.source !== event.targetId && edge.target !== event.targetId
        ));
        break;
        
      case ChangeEventType.RELATIONSHIP_CREATED:
        // Add new edge
        const relationship = event.changeData.relationship;
        const newEdge = {
          id: event.targetId,
          source: relationship.sourceClass,
          target: relationship.targetClass,
          type: 'umlRelationship',
          data: {
            relationshipType: relationship.relationshipType || UMLRelationshipType.ASSOCIATION,
            sourceMultiplicity: relationship.sourceMultiplicity,
            targetMultiplicity: relationship.targetMultiplicity,
            sourceLabel: relationship.sourceLabel,
            targetLabel: relationship.targetLabel
          }
        };
        setEdges(edges => [...edges, newEdge]);
        break;
        
      case ChangeEventType.RELATIONSHIP_UPDATED:
        // Update edge data
        setEdges(edges => edges.map(edge => {
          if (edge.id === event.targetId) {
            return {
              ...edge,
              data: { ...edge.data, ...event.changeData }
            };
          }
          return edge;
        }));
        break;
        
      case ChangeEventType.RELATIONSHIP_DELETED:
        // Delete edge
        setEdges(edges => edges.filter(edge => edge.id !== event.targetId));
        break;
    }
  }, [setNodes, setEdges]);
  
  // Send local change event to collaborators
  const sendChangeEvent = useCallback((event: any) => {
    if (!isCollaborating) return;
    wsService.sendChangeEvent(event).catch(console.error);
  }, [isCollaborating, wsService]);

  // Check if anything is selected
  const canDelete = useMemo(() => {
    return selectedNode !== null || selectedEdge !== null;
  }, [selectedNode, selectedEdge]);

  return (
    <div className="uml-flow-editor flex flex-col h-full">
      {/* Toolbar */}
      <UMLToolbar
        mode={editorMode}
        onModeChange={setEditorMode}
        onDelete={handleDelete}
        canDelete={canDelete}
        onSave={onSave}
        onToggleMinimap={() => setShowMinimap(!showMinimap)}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onExportDiagram={handleExportDiagram}
        isCollaborating={isCollaborating}
        showMinimap={showMinimap}
        showGrid={showGrid}
        showSidebar={showSidebar}
        onStartCollaboration={startCollaboration}
        onStopCollaboration={stopCollaboration}
      />
      
      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* React Flow Canvas */}
        <div 
          className="flex-1" 
          ref={reactFlowWrapper}
          onMouseMove={handleMouseMove}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            nodeTypes={NODE_TYPES}
            edgeTypes={EDGE_TYPES}
            fitView
            className="uml-flow-canvas"
          >
            {showGrid && <Background variant={BackgroundVariant.Dots} gap={20} size={1} />}
            <Controls />
            {showMinimap && <MiniMap nodeStrokeWidth={3} />}
            
            {/* Collaborative cursors */}
            {isCollaborating && (
              <CollaborativeCursors
                cursors={cursorPositions}
                reactFlowInstance={reactFlowInstance}
                viewport={viewport}
                currentUserId={userProfile.id}
              />
            )}
            
            {/* Collaboration status panel */}
            {isCollaborating && (
              <Panel position="top-right" className="mt-12">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm flex items-center">
                  <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                  Colaborando en tiempo real • {collaborators.length} {collaborators.length === 1 ? 'usuario' : 'usuarios'}
                </div>
              </Panel>
            )}

            {/* Code Generator Panel */}
            <Panel position="bottom-center" className="mb-4">
              <CodeGenerator nodes={nodes} edges={edges} />
            </Panel>
          </ReactFlow>
        </div>
        
        {/* Properties Panel */}
        {showSidebar && (
          <div className="w-80 border-l bg-white overflow-y-auto flex flex-col">
            {selectedNode && (
              selectedNode.data.nodeType === UMLNodeType.ENUM ? (
                <UMLEnumPanel
                  node={selectedNode}
                  onNodeDataUpdate={onNodeDataUpdate}
                />
              ) : (
                <UMLNodePanel
                  node={selectedNode}
                  onNodeDataUpdate={onNodeDataUpdate}
                />
              )
            )}
            {selectedEdge && (
              <UMLRelationshipPanel
                edge={selectedEdge}
                onEdgeDataUpdate={onEdgeDataUpdate}
              />
            )}
            {!selectedNode && !selectedEdge && (
              <div className="p-4 text-center text-gray-500">
                <p>Select an element to edit its properties</p>
              </div>
            )}
            
            {/* Collaboration panel */}
            {isCollaborating && collaborators.length > 0 && (
              <div className="mt-auto p-3 border-t">
                <CollaborationPanel collaborators={collaborators} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getDefaultNodeName = (nodeType: UMLNodeType): string => {
  switch (nodeType) {
    case UMLNodeType.CLASS: return 'NewClass';
    case UMLNodeType.INTERFACE: return 'NewInterface';
    case UMLNodeType.ABSTRACT_CLASS: return 'AbstractClass';
    case UMLNodeType.ENUM: return 'NewEnum';
    case UMLNodeType.RECORD: return 'NewRecord';
    default: return 'NewElement';
  }
};

const getReactFlowNodeType = (umlNodeType: UMLNodeType): string => {
  switch (umlNodeType) {
    case UMLNodeType.CLASS: return 'class';
    case UMLNodeType.INTERFACE: return 'interface';
    case UMLNodeType.ABSTRACT_CLASS: return 'abstractClass';
    case UMLNodeType.ENUM: return 'enum';
    case UMLNodeType.RECORD: return 'record';
    default: return 'class';
  }
};

const getUMLNodeType = (editorMode: EditorMode): UMLNodeType | null => {
  switch (editorMode) {
    case 'class': return UMLNodeType.CLASS;
    case 'interface': return UMLNodeType.INTERFACE;
    case 'abstractClass': return UMLNodeType.ABSTRACT_CLASS;
    case 'enum': return UMLNodeType.ENUM;
    case 'record': return UMLNodeType.RECORD;
    default: return null;
  }
};

// Main component with provider
const UMLFlowEditorWithProvider: React.FC<UMLFlowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <UMLFlowEditor {...props} />
    </ReactFlowProvider>
  );
};

export default UMLFlowEditorWithProvider;
