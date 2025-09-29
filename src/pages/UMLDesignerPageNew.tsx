/**
 * UMLDesignerPageNew.tsx
 * Implementación limpia y optimizada de la página de diseño UML
 * ===========================================================
 * 
 * Esta página implementa el editor UML usando el hook useWebSocket
 * para sincronización en tiempo real sin los servicios complejos anteriores.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Save, ChevronLeft, Edit, Check, Users, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/components/ui/toast-service';

import UMLFlowEditorWithAI from '@/components/uml-flow/UMLFlowEditorWithAI';
import { useWebSocket } from '@/hooks/useWebSocket';
import { diagramService } from '@/services/diagramService';
import type { DiagramData } from '@/services/diagramService';
import { anonymousSessionService } from '@/services/anonymousSessionService';

interface UMLDesignerPageNewProps {
  diagramId?: string;
  initialDiagram?: any;
  onDiagramChange?: (nodes: any[], edges: any[]) => void;
  isAnonymousMode?: boolean;
}

export function UMLDesignerPageNew({ 
  diagramId: propDiagramId, 
  initialDiagram, 
  onDiagramChange,
  isAnonymousMode = false 
}: UMLDesignerPageNewProps = {}) {
  
  const { diagramId: paramDiagramId } = useParams();
  const navigate = useNavigate();
  
  // Resolución de ID de diagrama estable
  const diagramId = propDiagramId || paramDiagramId || 'new';
  const isNewDiagram = diagramId === 'new';

  // Estados de diagrama
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [diagramLoading, setDiagramLoading] = useState(true);
  const [diagramLoadError, setDiagramLoadError] = useState<string | null>(null);
  
  // Estados de React Flow - gestionados directamente por el componente
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  
  // Estados de edición de título con prevención de conflictos
  const [diagramName, setDiagramName] = useState('Nuevo Diagrama');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isReceivingTitleUpdate, setIsReceivingTitleUpdate] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const localTitleRef = useRef<string>('Nuevo Diagrama');
  
  // Información de sesión
  const session = anonymousSessionService.getOrCreateSession();
  
  // ================================================================================
  // INTEGRACIÓN WEBSOCKET LIMPIA - Reemplaza TODOS los servicios rotos
  // ================================================================================
  const { isConnected, connectedUsers, sendMessage } = useWebSocket({
    diagramId,
    
    // Integración directa con el estado de React Flow
    onNodesChange: useCallback((newNodes) => {
      if (!isReceivingTitleUpdate) {
        // FIX: Eliminación de logs excesivos
        setNodes(newNodes);
        
        // Llamar al callback del padre si se proporciona
        if (onDiagramChange) {
          onDiagramChange(newNodes, edges);
        }
      }
    }, [isReceivingTitleUpdate, edges, onDiagramChange]),
    
    onEdgesChange: useCallback((newEdges) => {
      if (!isReceivingTitleUpdate) {
        // FIX: Eliminación de logs excesivos
        setEdges(newEdges);
        
        // Llamar al callback del padre si se proporciona
        if (onDiagramChange) {
          onDiagramChange(nodes, newEdges);
        }
      }
    }, [isReceivingTitleUpdate, nodes, onDiagramChange]),
    
    onTitleChange: useCallback((newTitle) => {
      if (!isEditingName) {
        // FIX: Eliminación de logs excesivos
        setIsReceivingTitleUpdate(true);
        setDiagramName(newTitle);
        localTitleRef.current = newTitle;
        setTimeout(() => setIsReceivingTitleUpdate(false), 200);
      }
    }, [isEditingName]),
    
    onUserJoined: useCallback((user) => {
      toast({
        title: "Usuario conectado",
        description: `${user.nickname} se ha unido al diagrama`,
        variant: "success"
      });
    }, []),
    
    onUserLeft: useCallback((user) => {
      toast({
        title: "Usuario desconectado", 
        description: `${user.nickname} ha salido del diagrama`,
        variant: "warning"
      });
    }, [])
  });

  // Cargar diagrama al montar
  useEffect(() => {
    if (isNewDiagram) {
      setDiagramLoading(false);
      return;
    }

    const loadDiagram = async () => {
      try {
        setDiagramLoading(true);
        setDiagramLoadError(null);
        
        const loadedDiagram = await diagramService.getDiagram(diagramId);
        setDiagram(loadedDiagram);
        
        // Extraer nodos y aristas del contenido del diagrama
        if (loadedDiagram?.content) {
          if (Array.isArray(loadedDiagram.content.nodes)) {
            setNodes(loadedDiagram.content.nodes);
          }
          
          if (Array.isArray(loadedDiagram.content.edges)) {
            setEdges(loadedDiagram.content.edges);
          }
        }
        
        // Establecer título del diagrama
        if (loadedDiagram?.title) {
          setDiagramName(loadedDiagram.title);
          localTitleRef.current = loadedDiagram.title;
        }
        
        setDiagramLoading(false);
      } catch (error) {
        console.error('Error al cargar diagrama:', error);
        setDiagramLoadError('No se pudo cargar el diagrama');
        setDiagramLoading(false);
      }
    };

    loadDiagram();
  }, [diagramId, isNewDiagram]);

  // ================================================================================
  // INTEGRACIÓN LIMPIA DE REACT FLOW - Gestión de estado directo con difusión WebSocket
  // ================================================================================
  const handleNodesChange = useCallback((newNodes) => {
    // FIX: Eliminación de logs excesivos
    setNodes(newNodes);
    
    // Difundir a otros usuarios a través de WebSocket
    if (isConnected) {
      sendMessage('node_update', { nodes: newNodes });
    }
    
    // Llamar al callback del padre si se proporciona
    if (onDiagramChange) {
      onDiagramChange(newNodes, edges);
    }
  }, [isConnected, sendMessage, edges, onDiagramChange]);

  const handleEdgesChange = useCallback((newEdges) => {
    // FIX: Eliminación de logs excesivos
    setEdges(newEdges);
    
    // Difundir a otros usuarios a través de WebSocket
    if (isConnected) {
      sendMessage('edge_update', { edges: newEdges });
    }
    
    // Llamar al callback del padre si se proporciona
    if (onDiagramChange) {
      onDiagramChange(nodes, newEdges);
    }
  }, [isConnected, sendMessage, nodes, onDiagramChange]);

  // Guardar diagrama en la API
  const handleSave = useCallback(async () => {
    if (nodes.length === 0) return;
    
    try {
      const diagramData = {
        title: diagramName,
        content: {
          nodes: nodes,
          edges: edges
        },
        diagram_type: 'CLASS' as const
      };
      
      const result = await diagramService.updateDiagram(diagramId, diagramData);
      
      toast({
        title: "Diagrama guardado",
        description: `El diagrama "${diagramName}" se ha guardado correctamente.`,
        variant: "success"
      });
      
      if (isNewDiagram && result.id) {
        navigate(`/editor/${result.id}`, { replace: true });
      }
      
    } catch (error: any) {
      console.error('Error al guardar diagrama:', error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar el diagrama. Inténtalo de nuevo.",
        variant: "error"
      });
    }
  }, [diagramId, diagramName, nodes, edges, navigate, isNewDiagram]);

  // Manejadores de edición de título
  const startEditingName = useCallback(() => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, []);
  
  const finishEditingName = useCallback(() => {
    const finalTitle = nameInputRef.current?.value || diagramName;
    const titleChanged = finalTitle !== diagramName && finalTitle.trim() !== '';
    
    setIsEditingName(false);
    
    if (titleChanged) {
      setDiagramName(finalTitle);
      localTitleRef.current = finalTitle;
      
      // Actualizar en la base de datos
      if (diagramId && diagramId !== 'new') {
        diagramService.updateDiagram(diagramId, { title: finalTitle })
          .catch(error => console.error('Error al guardar título:', error));
      }
      
      // Difundir cambio de título a través de WebSocket
      if (isConnected) {
        sendMessage('title_changed', { title: finalTitle });
      }
    }
  }, [diagramName, diagramId, isConnected, sendMessage]);

  // Estado de carga
  if (diagramLoading && !isNewDiagram) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando diagrama...</p>
        </div>
      </div>
    );
  }

  // Estado de error
  if (diagramLoadError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p className="font-bold">Error</p>
            <p>{diagramLoadError}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Volver a inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Cabecera */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>

          <div className="flex-1 flex items-center gap-3">
            <div className="flex items-center gap-2">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    ref={nameInputRef}
                    defaultValue={diagramName}
                    className="h-8 text-lg font-semibold"
                    onBlur={finishEditingName}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') finishEditingName();
                      if (e.key === 'Escape') {
                        setIsEditingName(false);
                        if (nameInputRef.current) {
                          nameInputRef.current.value = diagramName;
                        }
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={finishEditingName}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 
                    className="text-lg font-semibold cursor-pointer hover:text-blue-600"
                    onClick={startEditingName}
                  >
                    {diagramName}
                  </h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startEditingName}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Estado de conexión WebSocket limpio */}
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Conectado
                </Badge>
              ) : (
                <Badge variant="destructive" className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Sin conexión
                </Badge>
              )}
              
              {connectedUsers.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {connectedUsers.length} usuarios
                </Badge>
              )}
              
              <span className="text-sm text-slate-500">
                Sesión: {session.sessionId.substring(0, 8)}
              </span>
            </div>
          </div>

          <Button onClick={handleSave} disabled={nodes.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1">
        <UMLFlowEditorWithAI
          initialNodes={nodes}
          initialEdges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          diagramId={diagramId}
          onSave={handleSave}
          isCollaborating={isConnected}
          hasUnsavedChanges={true}
          onStartCollaboration={() => {}}
          onStopCollaboration={() => {}}
        />
      </div>
    </div>
  );
}
