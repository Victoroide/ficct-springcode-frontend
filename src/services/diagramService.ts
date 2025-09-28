/**
 * Diagram Service for UML Diagram Backend Integration
 * Handles CRUD operations for UML diagrams with session-based storage
 */

import { anonymousSessionService } from './anonymousSessionService';
import { env } from '@/config/environment';
import { v4 as uuidv4 } from 'uuid';

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

  constructor() {
    // 🔧 CORRECCIÓN CRÍTICA: Usar nginx proxy en puerto 80, NO directamente Django 8000
    this.baseURL = 'http://localhost'; // ✅ Nginx proxy (puerto 80)
    console.log('🔧 DiagramService inicializado con baseURL (nginx proxy):', this.baseURL);
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
    console.log('💾 Actualizando diagrama:', id, data);
    
    // Asegurar UUID válido para backend
    const validUUID = this.ensureValidUUID(id);
    
    try {
      const response = await fetch(`${this.baseURL}/api/diagrams/${validUUID}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Diagrama actualizado exitosamente:', result);
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
          return await this.createDiagram({
            title: `Diagram ${id.substring(0, 8)}`,
            diagram_type: 'CLASS',
            content: { nodes: [], edges: [] }
          });
        }
        
        const errorText = await response.text();
        console.error('❌ Error response:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Diagram retrieved via nginx proxy:', result);
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
}

// Export singleton instance
export const diagramService = new DiagramService();
export default diagramService;
