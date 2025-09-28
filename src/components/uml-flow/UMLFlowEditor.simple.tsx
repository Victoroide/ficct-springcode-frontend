/**
 * UMLFlowEditor.simple.tsx
 * Simplified version of UML editor using React Flow for initial release
 */

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  Panel
} from 'reactflow';
import type { Connection, Edge, Node } from 'reactflow';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast-service';

// Import styles
import 'reactflow/dist/style.css';

// 🔧 PERFORMANCE: Node types estáticos (simple implementation first)
const NODE_TYPES = {
  classNode: ({ data }) => (
    <div style={{ padding: '10px', border: '1px solid #1a192b', borderRadius: '3px', background: 'white', minWidth: '150px' }}>
      <div style={{ 
        borderBottom: '1px solid #ddd', 
        padding: '8px', 
        textAlign: 'center', 
        fontWeight: 'bold',
        background: '#f0f0f0'
      }}>
        {data.label}
      </div>
      <div style={{ padding: '8px' }}>
        <div style={{ borderBottom: '1px solid #eee', padding: '5px 0' }}>
          <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#555' }}>Attributes</div>
        </div>
        <div style={{ padding: '5px 0' }}>
          <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: '#555' }}>Methods</div>
        </div>
      </div>
    </div>
  )
};

// 🔧 PERFORMANCE: Edge types estáticos
const EDGE_TYPES = {
  default: ({ id, sourceX, sourceY, targetX, targetY, style }) => {
    const edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    return (
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
      />
    );
  },
};

// Default viewport
const defaultViewport = { x: 0, y: 0, zoom: 1.0 };

export interface UMLFlowEditorProps {
  onSave?: () => void;
}

const UMLFlowEditor: React.FC<UMLFlowEditorProps> = ({ onSave }) => {
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  
  // Editor state
  const [editorMode, setEditorMode] = useState<'select' | 'class' | 'pan'>('select');
  
  // Refs
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Handle edge creation
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  // Handle canvas click to add nodes
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (editorMode === 'class') {
      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (reactFlowBounds) {
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top
        });

        const newNode = {
          id: `node_${Date.now()}`,
          type: 'classNode',
          position,
          data: { label: 'New Class' },
        };

        setNodes(nds => [...nds, newNode]);
        setEditorMode('select'); // Switch back to select after adding
        
        toast({
          title: 'Nuevo elemento',
          description: 'Clase añadida con éxito',
          variant: 'success'
        });
      }
    }
  }, [editorMode, reactFlowInstance, setNodes]);

  // Delete selected node
  const deleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes(nodes => nodes.filter(node => node.id !== selectedNode.id));
      setSelectedNode(null);
      toast({
        title: 'Elemento eliminado',
        description: 'El elemento ha sido eliminado',
        variant: 'info'
      });
    }
  }, [selectedNode, setNodes]);

  return (
    <div style={{ width: '100%', height: '100%' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={NODE_TYPES}
        // edgeTypes={EDGE_TYPES} // 🔧 Commented out due to TypeScript edge type conflict
        fitView
        defaultViewport={defaultViewport}
      >
        <Background />
        <Controls />
        
        <Panel position="top-left">
          <div style={{ display: 'flex', gap: '8px', background: 'white', padding: '8px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
            <Button 
              onClick={() => setEditorMode('select')}
              variant={editorMode === 'select' ? 'default' : 'outline'}
            >
              Seleccionar
            </Button>
            <Button 
              onClick={() => setEditorMode('class')}
              variant={editorMode === 'class' ? 'default' : 'outline'}
            >
              Añadir Clase
            </Button>
            <Button 
              onClick={() => setEditorMode('pan')}
              variant={editorMode === 'pan' ? 'default' : 'outline'}
            >
              Mover Lienzo
            </Button>
            {selectedNode && (
              <Button 
                onClick={deleteSelected}
                variant="outline"
                className="text-red-500"
              >
                Eliminar
              </Button>
            )}
          </div>
        </Panel>
        
        {onSave && (
          <Panel position="top-right">
            <Button onClick={onSave} className="bg-blue-500 text-white">
              Guardar
            </Button>
          </Panel>
        )}
        
        {selectedNode && (
          <Panel position="bottom-right">
            <div style={{ background: 'white', padding: '12px', borderRadius: '4px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', minWidth: '200px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>Propiedades</h3>
              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Nombre:</label>
                <input 
                  type="text" 
                  value={selectedNode.data.label || ''} 
                  onChange={(e) => {
                    const newLabel = e.target.value;
                    setNodes(nodes => nodes.map(n => {
                      if (n.id === selectedNode.id) {
                        return {
                          ...n,
                          data: { ...n.data, label: newLabel }
                        };
                      }
                      return n;
                    }));
                  }}
                  style={{ width: '100%', padding: '4px', border: '1px solid #ddd', borderRadius: '3px' }}
                />
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

const UMLFlowEditorWithProvider: React.FC<UMLFlowEditorProps> = (props) => {
  return (
    <ReactFlowProvider>
      <UMLFlowEditor {...props} />
    </ReactFlowProvider>
  );
};

export default UMLFlowEditorWithProvider;
