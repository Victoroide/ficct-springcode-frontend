/**
 * Diagram Service for UML Diagram Backend Integration
 * Handles CRUD operations for UML diagrams with session-based storage
 */

import { anonymousSessionService } from './anonymousSessionService';
import { env } from '@/config/environment';
import { v4 as uuidv4 } from 'uuid';

// Map para almacenar los timeouts de auto-guardado
type AutoSaveTimeout = ReturnType<typeof setTimeout>;

export interface DiagramData {
  id?: string;
  title: string;
  content: any;
  diagram_type: 'CLASS' | 'SEQUENCE' | 'USE_CASE' | 'ACTIVITY';
  layout_config?: any;
  created_at?: string;
  updated_at?: string;
  session_id?: string;
}

export interface CreateDiagramRequest {
  title: string;
  content: any;
  diagram_type: 'CLASS' | 'SEQUENCE' | 'USE_CASE' | 'ACTIVITY';
  layout_config?: any;
  session_id: string;
}

export interface UpdateDiagramRequest {
  title?: string;
  content?: any;
  layout_config?: any;
}

class DiagramService {
  private readonly baseURL: string;
  private autoSaveTimeouts: Map<string, AutoSaveTimeout> = new Map();

  constructor() {
    // 🔧 CORRECCIÓN CRÍTICA: Usar nginx proxy en puerto 80, NO directamente Django 8000
    this.baseURL = 'http://localhost'; // ✅ Nginx proxy (puerto 80)
    console.log('🔧 DiagramService inicializado con baseURL (nginx proxy):', this.baseURL);
  }
  
  /**
   * Auto-guardar diagrama con debounce para evitar múltiples llamadas a API
   * @param diagramId ID del diagrama
   * @param diagramData Datos del diagrama
   * @param delay Tiempo de espera antes de guardar (ms)
   */
  debouncedAutoSave(diagramId: string, diagramData: Partial<DiagramData>, delay: number = 2000): void {
    if (import.meta.env.DEV) {
      console.log('💾 Configurando auto-guardado para diagrama:', diagramId);
    }
    
    // Cancelar timeout anterior si existe
    const existingTimeout = this.autoSaveTimeouts.get(diagramId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Crear nuevo timeout
    const timeout = setTimeout(async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('💾 Auto-guardando diagrama:', diagramId);
        }
        
        // Validar UUID para backend
        const validUUID = this.ensureValidUUID(diagramId);
        
        // CRITICAL FIX: Asegurar que el contenido esté en formato correcto para API
        // El backend espera que el contenido sea un objeto con nodos y aristas
        let formattedContent = diagramData.content;
        
        // Si content no es un objeto con nodos y aristas, formatear correctamente
        if (diagramData.content && 
            (Array.isArray(diagramData.content.nodes) || Array.isArray(diagramData.content.edges))) {
          // El formato ya es correcto, no hay que hacer nada
        } else if (typeof diagramData.content === 'string') {
          // Intentar parsear si es string
          try {
            formattedContent = JSON.parse(diagramData.content);
          } catch (e) {
            console.error('❌ Error parsing content string:', e);
            formattedContent = { nodes: [], edges: [] };
          }
        } else {
          // Formato fallback si no hay estructura esperada
          formattedContent = { nodes: [], edges: [] };
        }

        // Actualizar en la base de datos con formato correcto
        const result = await this.updateDiagram(validUUID, {
          content: formattedContent,
          title: diagramData.title,
          layout_config: diagramData.layout_config
        });
        
        if (import.meta.env.DEV) {
          console.log('✅ Diagrama auto-guardado exitosamente:', diagramId);
        }
        
        // IMPORTANTE: Guardar también en localStorage SÓLO DESPUÉS de éxito en DB
        // para mantener sincronización y como respaldo
        localStorage.setItem(`diagram_${diagramId}`, JSON.stringify({
          nodes: formattedContent.nodes || [],
          edges: formattedContent.edges || [],
          title: diagramData.title || 'Untitled Diagram',
          updated_at: new Date().toISOString()
        }));
        
        // Eliminar timeout completado
        this.autoSaveTimeouts.delete(diagramId);
        
        return result;
      } catch (error) {
        console.error('❌ Error en auto-guardado:', error);
        this.autoSaveTimeouts.delete(diagramId);
        
        // Reintentar una vez en caso de error
        setTimeout(() => {
          console.log('🔄 Reintentando auto-guardado tras error...');
          this.debouncedAutoSave(diagramId, diagramData, 0);
        }, 5000);
      }
    }, delay);
    
    // Guardar referencia al timeout
    this.autoSaveTimeouts.set(diagramId, timeout);
  }

  /**
   * Create a new diagram
   */
  async createDiagram(data: Omit<DiagramData, 'id' | 'created_at' | 'updated_at' | 'session_id'>): Promise<DiagramData> {
    const sessionId = anonymousSessionService.getSessionId();
    
    const requestData: CreateDiagramRequest = {
      ...data,
      session_id: sessionId
    };
    
    console.log('💾 Creando diagrama:', requestData);
    
    try {
      const response = await fetch(`${this.baseURL}/api/diagrams/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Diagrama creado exitosamente:', result);
      
      // Add diagram to session
      anonymousSessionService.addDiagramToSession(result.id);
      
      return result;
    } catch (error) {
      console.error('❌ Error creando diagrama:', error);
      throw error;
    }
  }

  /**
   * Update an existing diagram
   */
  async updateDiagram(id: string, data: UpdateDiagramRequest): Promise<DiagramData> {
    console.log('💾 Actualizando diagrama:', id);
    
    // Asegurar UUID válido para backend
    const validUUID = this.ensureValidUUID(id);
    
    // CRITICAL FIX: Sanitizar los datos antes de enviar
    const sanitizedData = { ...data };
    
    // Asegurar que content tiene formato correcto si existe
    if (sanitizedData.content) {
      // Si es un objeto con nodes/edges, asegurarse que son arrays
      if (typeof sanitizedData.content === 'object') {
        sanitizedData.content = {
          nodes: Array.isArray(sanitizedData.content.nodes) ? sanitizedData.content.nodes : [],
          edges: Array.isArray(sanitizedData.content.edges) ? sanitizedData.content.edges : []
        };
      } else if (typeof sanitizedData.content === 'string') {
        // Si es string, intentar parsear
        try {
          const parsed = JSON.parse(sanitizedData.content);
          sanitizedData.content = {
            nodes: Array.isArray(parsed.nodes) ? parsed.nodes : [],
            edges: Array.isArray(parsed.edges) ? parsed.edges : []
          };
        } catch (e) {
          sanitizedData.content = { nodes: [], edges: [] };
        }
      } else {
        sanitizedData.content = { nodes: [], edges: [] };
      }
    }
    
    try {
      const response = await fetch(`${this.baseURL}/api/diagrams/${validUUID}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Diagrama actualizado exitosamente');
      return result;
    } catch (error) {
      console.error('❌ Error actualizando diagrama:', error);
      throw error;
    }
  }

  /**
   * Asegura que un ID sea un UUID válido
   * Django requiere UUIDs válidos en la DB
   */
  ensureValidUUID(id: string): string {
    if (id === 'new' || !id) {
      // Generar nuevo UUID si es 'new' o vacío
      return uuidv4();
    }
    
    // Verificar si ya es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(id)) {
      return id;
    }
    
    // Para IDs en formato 'local_timestamp', usar un UUID fijo
    if (id.startsWith('local_')) {
      console.log('🔄 Convirtiendo ID local a UUID válido:', id);
      return '00000000-0000-4000-a000-000000000001';
    }
    
    // Para cualquier otro formato, generar UUID derivado del ID
    console.log('🔄 Generando UUID para ID no válido:', id);
    return uuidv4();
  }

  /**
   * Get a diagram by ID
   */
  async getDiagram(id: string): Promise<DiagramData> {
    console.log('📖 Getting diagram via nginx proxy:', id);
    
    // Asegurar UUID válido para backend
    const validUUID = this.ensureValidUUID(id);
    console.log('🔧 ID convertido a UUID válido:', validUUID);
    
    try {
      const response = await fetch(`${this.baseURL}/api/diagrams/${validUUID}/`);
      
      if (!response.ok) {
        // Si no existe, crear diagrama nuevo automáticamente
        if (response.status === 404) {
          console.log('📝 Diagram not found, creating new one...');
          const newDiagram = await this.createDiagram({
            title: `Diagram ${id.substring(0, 8)}`,
            diagram_type: 'CLASS',
            content: { nodes: [], edges: [] }
          });
          
          // CRITICAL FIX: Guardar el nuevo diagrama en localStorage para persistencia offline
          localStorage.setItem(`diagram_${id}`, JSON.stringify({
            nodes: [],
            edges: [],
            title: newDiagram.title,
            updated_at: new Date().toISOString()
          }));
          
          return newDiagram;
        }
        
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Diagram retrieved from database:', result);
      
      // CRITICAL FIX: Verificar y procesar metadata correctamente
      // Los campos last_modified y active_sessions son información adicional importante
      if (result) {
        // Normalizar estructura para consumo interno
        const normalizedDiagram: DiagramData = {
          id: result.id,
          title: result.title || 'Sin título',
          content: result.content || { nodes: [], edges: [] },
          diagram_type: result.diagram_type || 'CLASS',
          layout_config: result.layout_config || {},
          created_at: result.created_at || result.last_modified,
          updated_at: result.last_modified || result.updated_at || new Date().toISOString(),
          session_id: result.session_id
        };
        
        // NUEVA FUNCIONALIDAD: Capturar información de sesiones activas si existe
        if (result.active_sessions && Array.isArray(result.active_sessions)) {
          console.log(`👥 Sesiones activas detectadas: ${result.active_sessions.length}`);
          
          // Aquí podríamos almacenar las sesiones activas en un estado global
          // para mostrarlas en la UI más tarde
        }
        
        // Mantener localStorage actualizado con la última versión
        try {
          const formattedData = {
            nodes: normalizedDiagram.content?.nodes || [],
            edges: normalizedDiagram.content?.edges || [],
            title: normalizedDiagram.title,
            updated_at: normalizedDiagram.updated_at
          };
          localStorage.setItem(`diagram_${id}`, JSON.stringify(formattedData));
        } catch (storageError) {
          console.warn('⚠️ No se pudo actualizar localStorage:', storageError);
        }
        
        return normalizedDiagram;
      }
      
      return result;
    } catch (error) {
      console.error('❌ Error getting diagram:', error);
      throw error;
    }
  }

  /**
   * List diagrams for current session
   */
  async listDiagrams(): Promise<DiagramData[]> {
    const sessionId = anonymousSessionService.getSessionId();
    console.log('📋 Listando diagramas para sesión:', sessionId);
    
    try {
      const response = await fetch(`${this.baseURL}/api/diagrams/?session_id=${sessionId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Diagramas listados exitosamente:', result);
      
      // Return results array or empty array if no results key
      return Array.isArray(result) ? result : result.results || [];
    } catch (error) {
      console.error('❌ Error listando diagramas:', error);
      throw error;
    }
  }

  /**
   * Delete a diagram
   */
  async deleteDiagram(id: string): Promise<void> {
    console.log('🗑️ Eliminando diagrama:', id);
    
    try {
      const response = await fetch(`${this.baseURL}/api/diagrams/${id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      console.log('✅ Diagrama eliminado exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando diagrama:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health/`);
      const isHealthy = response.ok;
      console.log(isHealthy ? '✅ Backend saludable' : '❌ Backend no disponible');
      return isHealthy;
    } catch (error) {
      console.error('❌ Error verificando salud del backend:', error);
      return false;
    }
  }
  
  /**
   * Create a new diagram or update existing one based on ID
   * @param data Diagram data to create or update
   * @returns The created or updated diagram data
   */
  async createOrUpdateDiagram(data: Omit<DiagramData, 'created_at' | 'updated_at' | 'session_id'>): Promise<DiagramData> {
    try {
      // Check if diagram already exists by ID
      if (data.id) {
        // Update existing diagram
        return this.updateDiagram(data.id, {
          title: data.title,
          content: data.content,
          layout_config: data.layout_config
        });
      } else {
        // Create new diagram
        return this.createDiagram({
          title: data.title,
          content: data.content,
          diagram_type: data.diagram_type || 'CLASS',
          layout_config: data.layout_config
        });
      }
    } catch (error) {
      console.error('❌ Error creating or updating diagram:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const diagramService = new DiagramService();
export default diagramService;
