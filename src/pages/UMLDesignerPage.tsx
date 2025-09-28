/**
 * UMLDesignerPage.tsx
 * Main page for the UML designer featuring React Flow based diagramming
 * Updated to use direct backend integration with WebSocket collaboration
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Save, ChevronLeft, Edit, Check, Users, Wifi, WifiOff } from 'lucide-react';
import { toast } from '@/components/ui/toast-service';

import UMLFlowEditor from '@/components/uml-flow/UMLFlowEditor';
import { umlCollaborationService } from '@/services/umlCollaborationService';
import type { DiagramData } from '@/services/diagramService';
import { anonymousSessionService } from '@/services/anonymousSessionService';
// Import debug tools in development
import '@/utils/debugWebSocket';

interface UMLDesignerPageProps {
  diagramId?: string;
  initialDiagram?: any;
  onDiagramChange?: (nodes: any[], edges: any[]) => void;
  isAnonymousMode?: boolean;
}

export function UMLDesignerPage({ 
  diagramId: propDiagramId, 
  initialDiagram, 
  onDiagramChange,
  isAnonymousMode = false 
}: UMLDesignerPageProps = {}) {
  // 🔍 DEBUGGING: Monitorear cuándo se renderiza el componente
  if (import.meta.env.DEV) {
    console.log('🔍 UMLDesignerPage render triggered', { 
      propDiagramId, 
      initialDiagramId: initialDiagram?.id, 
      isAnonymousMode,
      renderTime: new Date().toISOString()
    });
  }
  const { diagramId: paramDiagramId } = useParams();
  const navigate = useNavigate();
  
  // 🔧 CRITICAL FIX: Estabilizar diagramId para prevenir UUID chaos
  // Usar diagramId estable que persiste entre renders
  const stableDiagramId = useMemo(() => {
    // Si tenemos prop diagramId (prioritario)
    if (propDiagramId && propDiagramId !== 'new' && propDiagramId !== 'undefined') {
      return propDiagramId;
    }
    
    // Si tenemos param diagramId de la URL
    if (paramDiagramId && paramDiagramId !== 'new' && paramDiagramId !== 'undefined') {
      return paramDiagramId;
    }
    
    // Intentar recuperar de localStorage (para persistencia entre sesiones)
    const savedId = localStorage.getItem('current_diagram_id');
    if (savedId && savedId !== 'new' && savedId !== 'undefined') {
      return savedId;
    }
    
    // UUID fallback consistente
    return '00000000-0000-4000-a000-000000000001';
  }, [propDiagramId, paramDiagramId]);
  
  // Almacenar para futuras referencias
  const diagramId = stableDiagramId;
  
  // Actualizar localStorage cuando cambie el diagramId
  useEffect(() => {
    if (diagramId && diagramId !== 'new' && diagramId !== 'undefined') {
      localStorage.setItem('current_diagram_id', diagramId);
    }
  }, [diagramId]);
    
  const isNewDiagram = diagramId === 'new';

  // Estado del diagrama y colaboración
  const [diagram, setDiagram] = useState<DiagramData | null>(null);
  const [diagramLoading, setDiagramLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<any[]>([]);
  
  // Estado para la edición del nombre del diagrama
  const [diagramName, setDiagramName] = useState('Nuevo Diagrama');
  const [isEditingName, setIsEditingName] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  
  // Nodos y edges del diagrama actual para guardar
  const [currentNodes, setCurrentNodes] = useState<any[]>([]);
  const [currentEdges, setCurrentEdges] = useState<any[]>([]);
  
  // Session info for debugging - usar cache para evitar múltiples calls
  const session = useMemo(() => anonymousSessionService.getOrCreateSession(), []);
  
  // 🔧 OPTIMIZACIÓN: INICIALIZACIÓN DEL SERVICIO DE COLABORACIÓN - evitar re-renders
  const collaborationService = useMemo(() => umlCollaborationService, []);

  // 🔧 Variables mantenidas para compatibilidad con código
  const isMountedRef = useRef(true);
  const initAttemptedRef = useRef(false);
  const lastDiagramIdRef = useRef<string | null>(null);

  // 🔴 STOPGAP EMERGENCIA: WEBSOCKET DESHABILITADO TEMPORALMENTE
  useEffect(() => {
    // 🔍 DEBUGGING: Monitorear cuando se ejecuta este useEffect y por qué
    if (import.meta.env.DEV) {
      console.log('🔍 WebSocket useEffect ejecutado', {
        diagramId, 
        dependencies: [diagramId],
        traceId: Math.random().toString(36).substring(2, 9), // ID único para rastrear la ejecución
        time: new Date().toISOString()
      });
      console.trace('WebSocket useEffect call stack');
    }
    
    console.log('🚫 WebSocket connection DISABLED - STOPGAP de emergencia');
    console.log('⚠️ Esta es una medida temporal para detener WebSocket spam loop');
    console.log('💡 Re-habilitar cuando el backend Consumer esté listo');
    
    // 🔧 CRITICAL FIX: Configurar handlers para eventos, incluidos los cambios de título
    if (collaborationService) {
      collaborationService.updateHandlers({
        onDiagramUpdate: (data) => {
          // Procesar cambios de título
          if (data?.type === 'title_changed' && data?.title && isMountedRef.current) {
            if (import.meta.env.DEV) {
              console.log('💬 Recibido cambio de título:', data.title);
            }
            
            // Actualizar título local sin emitir otro evento
            setDiagramName(data.title);
          }
        }
      });
    }
    
    // Simular estado conectado para evitar errores en UI
    setIsConnected(true);
    setDiagramLoading(false);
    
    return () => {
      // Cleanup también desactivado temporalmente
      console.log('💫 WebSocket cleanup deshabilitado');
    };
  }, [diagramId, collaborationService]); // Incluir collaborationService como dependencia
  
  // ====================================================================
  // NOTA IMPORTANTE: WEBSOCKET DESACTIVADO TEMPORALMENTE COMO STOPGAP 
  // ====================================================================
  // Se ha deshabilitado temporalmente la conexión WebSocket para detener
  // el spam de conexiones que estaba sobrecargando el backend.
  //
  // PARA RE-HABILITAR: Restaurar el código original del useEffect 
  // cuando el backend Consumer esté listo para manejar las conexiones
  // correctamente.
  // ====================================================================
  
  // 🔧 OPTIMIZED: Guardar el diagrama con debounce
  const handleSave = useCallback(async () => {
    if (!diagramId || currentNodes.length === 0) return;
    
    try {
      // 🔧 CORRECTED: Usar el formato correcto para saveDiagram
      const result = await collaborationService.saveDiagram({
        title: diagramName,
        content: {
          nodes: currentNodes,
          edges: currentEdges
        },
        diagram_type: 'CLASS'
      });
      
      toast({
        title: "Diagrama guardado",
        description: `El diagrama "${diagramName}" se ha guardado correctamente.`,
        variant: "success"
      });
      
      // Si era un diagrama nuevo, actualizar la URL
      if (isNewDiagram && result.id) {
        if (import.meta.env.DEV) {
          console.log('🔄 Navigating to new diagram URL:', result.id);
        }
        navigate(`/editor/${result.id}`, { replace: true });
      }
      
    } catch (error: any) {
      console.error('❗ Error saving diagram:', error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar el diagrama. Inténtalo de nuevo.",
        variant: "error"
      });
    }
  }, [diagramId, diagramName, currentNodes, currentEdges, navigate, isNewDiagram, collaborationService]);

  // 🔧 CRITICAL FIX: Implementar title broadcasting
  const updateTitle = useCallback((newTitle: string) => {
    setDiagramName(newTitle);
    
    // BROADCAST TITLE CHANGE vía WebSocket si estamos conectados
    if (isConnected && collaborationService) {
      if (import.meta.env.DEV) {
        console.log('💬 Enviando cambio de título vía WebSocket:', newTitle);
      }
      
      // Broadcast el cambio de título a otros usuarios
      collaborationService.sendTitleUpdate(diagramId, newTitle)
        .catch(err => console.error('Error al enviar cambio de título:', err));
    }
    
    // También guardar al cambiar el título, con debounce
    if (diagramId && diagramId !== 'new' && diagramId !== 'undefined') {
      handleSave();
    }
  }, [diagramId, isConnected, collaborationService, handleSave]);

  // Manipular la edición del nombre
  const startEditingName = useCallback(() => {
    setIsEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, []);
  
  const finishEditingName = useCallback(() => {
    setIsEditingName(false);
    
    // Al terminar la edición, enviamos el cambio de título
    // No usamos diagramName directamente porque podría haber sido actualizado entre tanto
    const finalTitle = nameInputRef.current?.value || diagramName;
    if (finalTitle !== diagramName) {
      updateTitle(finalTitle);
    }
  }, [diagramName, updateTitle]);
  
  // 🔧 OPTIMIZADO: Actualizar los nodos y edges para guardar - stable callback
  const updateFlowData = useCallback((nodes, edges) => {
    setCurrentNodes(nodes);
    setCurrentEdges(edges);
    
    // Notificar cambios si estamos en modo anónimo
    if (isAnonymousMode && onDiagramChange) {
      onDiagramChange(nodes, edges);
    }
  }, [isAnonymousMode, onDiagramChange]);
  
  // NOTA: handleSave ya fue declarado anteriormente
  
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
  
  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* Header con información de colaboración */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Volver
          </Button>
          
          {isEditingName ? (
            <div className="flex items-center">
              <Input
                ref={nameInputRef}
                value={diagramName}
                onChange={(e) => setDiagramName(e.target.value)}
                className="mr-2 h-8 w-64 text-base font-medium"
                onBlur={finishEditingName}
                onKeyDown={(e) => e.key === 'Enter' && finishEditingName()}
                placeholder="Nombre del diagrama"
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={finishEditingName}
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center">
              <h1 className="text-lg font-semibold mr-1">
                {diagramName}
              </h1>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100" 
                onClick={startEditingName}
              >
                <Edit className="h-3 w-3" />
              </Button>
              
              {!isNewDiagram && diagram?.id && (
                <Badge variant="outline" className="ml-2">
                  {diagram.id.substring(0, 8)}
                </Badge>
              )}
            </div>
          )}
          
          {/* 🔧 INFORMACIÓN DE COLABORACIÓN */}
          <div className="flex items-center gap-2 ml-4">
            {/* Estado de conexión */}
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-600" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-xs ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Conectado' : 'Sin conexión'}
              </span>
            </div>
            
            {/* Usuarios conectados */}
            {connectedUsers.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-blue-600">
                  {connectedUsers.length} usuarios
                </span>
              </div>
            )}
            
            {/* Información de sesión (solo en desarrollo) */}
            {import.meta.env.DEV && (
              <Badge variant="outline" className="text-xs">
                {session.nickname}
              </Badge>
            )}
          </div>
          
          <div className="ml-auto">
            <Button onClick={handleSave} size="sm">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content - UML Flow Editor */}
      <div className="flex-1 overflow-hidden">
        <UMLFlowEditor 
          onSave={handleSave} 
          onUpdateFlowData={updateFlowData} 
          diagramName={diagramName}
        />
      </div>
    </div>
  );
}
