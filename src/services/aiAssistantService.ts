/**
 * AI Assistant Service
 * Service layer for AI Assistant API integration with caching and error handling
 */

import { env } from '@/config/environment';
import type {
  AIAssistantResponse,
  DiagramAnalysis,
  AIStatistics,
  AIHealthStatus,
  AIAssistantRequest,
  AIAssistantContext,
  AIAssistantErrorDetails,
  AIAssistantError,
  NaturalLanguageCommandRequest,
  NaturalLanguageCommandResponse,
  UMLElementRecommendation
} from '@/types/aiAssistant';

class AIAssistantService {
  private baseUrl: string;
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private rateLimitReset = 0;
  private requestCount = 0;
  private readonly MAX_REQUESTS_PER_HOUR = 30;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.baseUrl = `${env.apiConfig.baseUrl}/api/ai-assistant`;
  }

  /**
   * Check if user is authenticated before making AI calls
   */
  private checkAuthentication(): void {
    const isAuth = sessionStorage.getItem('ai_authenticated') === 'true';
    if (!isAuth) {
      console.error('[AIService] Authentication required - user not authenticated');
      throw new Error('AI features require authentication. Please log in to access the AI Assistant.');
    }
  }

  /**
   * Ask a general question to the AI Assistant
   */
  async askQuestion(
    question: string, 
    contextType: string = 'general',
    userContext?: Partial<AIAssistantContext>
  ): Promise<AIAssistantResponse> {
    this.checkAuthentication(); // BLOCK if not authenticated
    this.checkRateLimit();

    const cacheKey = `question_${question}_${contextType}`;
    const cached = this.getFromCache<AIAssistantResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Backend expects this exact format according to AIAssistantQuestionSerializer
    const request = {
      question,
      context_type: contextType,
      diagram_id: null  // For general questions
    };

    try {
      
      const response = await this.makeRequest<AIAssistantResponse>('/ask/', {
        method: 'POST',
        body: JSON.stringify(request)
      });

      this.setCache(cacheKey, response, this.CACHE_TTL);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Ask a question about a specific diagram
   */
  async askAboutDiagram(
    question: string, 
    diagramId: string,
    diagramData?: { nodes: any[]; edges: any[] }
  ): Promise<AIAssistantResponse> {
    this.checkAuthentication(); // BLOCK if not authenticated
    this.checkRateLimit();

    const cacheKey = `diagram_${diagramId}_${question}`;
    const cached = this.getFromCache<AIAssistantResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    // Backend expects this exact format according to AIAssistantQuestionSerializer
    const payload = {
      question,
      context_type: 'diagram',
      diagram_id: diagramId
    };

    try {
      
      const response = await this.makeRequest<AIAssistantResponse>(
        `/ask-about-diagram/${diagramId}/`,
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      this.setCache(cacheKey, response, this.CACHE_TTL);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get diagram analysis
   */
  async getAnalysis(
    diagramId: string,
    diagramData?: { nodes: any[]; edges: any[] }
  ): Promise<DiagramAnalysis> {
    const cacheKey = `analysis_${diagramId}`;
    const cached = this.getFromCache<DiagramAnalysis>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      
      const response = await this.makeRequest<DiagramAnalysis>(
        `/analysis/${diagramId}/`,
        {
          method: 'GET'
        }
      );

      this.setCache(cacheKey, response, this.CACHE_TTL * 2); // Longer cache for analysis
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get AI Assistant statistics
   */
  async getStatistics(): Promise<AIStatistics> {
    const cacheKey = 'statistics';
    const cached = this.getFromCache<AIStatistics>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      
      const response = await this.makeRequest<AIStatistics>('/statistics/');
      this.setCache(cacheKey, response, 60 * 1000); // 1 minute cache
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get AI service health status
   */
  async getHealth(): Promise<AIHealthStatus> {
    try {
      
      const response = await this.makeRequest<AIHealthStatus>('/health/', {
        timeout: 5000 // Shorter timeout for health checks
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Submit feedback for a response
   */
  async submitFeedback(
    questionId: string,
    rating: 1 | 2 | 3 | 4 | 5,
    comment?: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await this.makeRequest<{ success: boolean }>('/feedback/', {
        method: 'POST',
        body: JSON.stringify({
          question_id: questionId,
          rating,
          comment
        })
      });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process natural language command for UML generation
   */
  async processCommand(
    command: string,
    diagramId?: string,
    currentDiagramData?: { nodes: any[]; edges: any[] }
  ): Promise<NaturalLanguageCommandResponse> {
    this.checkAuthentication(); // BLOCK if not authenticated
    this.checkRateLimit();

    const cacheKey = `command_${command}_${diagramId || 'new'}`;
    const cached = this.getFromCache<NaturalLanguageCommandResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const request: NaturalLanguageCommandRequest = {
      command: command.trim(),
      diagram_id: diagramId || null,
      current_diagram_data: currentDiagramData || null
    };

    try {
      
      // Use correct endpoint based on whether diagram_id is provided
      const endpoint = diagramId 
        ? `/process-command/${diagramId}/`
        : '/process-command/';
      
      const response = await this.makeRequest<NaturalLanguageCommandResponse>(
        endpoint,
        {
          method: 'POST',
          body: JSON.stringify(request)
        }
      );

      // Cache successful responses for shorter time (commands change context frequently)
      this.setCache(cacheKey, response, 60000); // 1 minute cache
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process image to extract UML diagram
   */
  async processImageToDiagram(
    base64Image: string,
    sessionId?: string
  ): Promise<{
    success: boolean;
    data?: {
      nodes: any[];
      edges: any[];
      metadata: {
        classes_extracted: number;
        confidence: number;
        method: string;
      };
    };
    error?: string;
    message?: string;
  }> {
    this.checkAuthentication(); // BLOCK if not authenticated
    this.checkRateLimit();

    try {
      const response = await this.makeRequest<any>(
        '/diagrams/from-image/',
        {
          method: 'POST',
          body: JSON.stringify({
            image: base64Image,
            session_id: sessionId || this.getSessionId()
          }),
          timeout: 120000 // 120 seconds timeout for image processing
        }
      );

      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get command suggestions based on current diagram state
   */
  async getCommandSuggestions(
    diagramId?: string,
    diagramData?: { nodes: any[]; edges: any[] }
  ): Promise<{ suggestions: string[] }> {
    const cacheKey = `suggestions_${diagramId || 'new'}_${diagramData?.nodes?.length || 0}`;
    const cached = this.getFromCache<{ suggestions: string[] }>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.makeRequest<{ suggestions: string[] }>(
        '/supported-commands/',
        {
          method: 'GET'
        }
      );

      this.setCache(cacheKey, response, this.CACHE_TTL);
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate and optimize UML element recommendations
   */
  validateRecommendations(
    recommendations: UMLElementRecommendation[],
    currentNodes: any[],
    currentEdges: any[]
  ): UMLElementRecommendation[] {
    return recommendations.filter(rec => {
      // Skip if class with same name already exists
      if (rec.element_type === 'class') {
        const existingClass = currentNodes.find(
          node => node.data?.label?.toLowerCase() === rec.element_data?.name?.toLowerCase()
        );
        if (existingClass) {
          return false;
        }
      }

      // Skip if relationship already exists
      if (rec.element_type === 'relationship') {
        const sourceExists = currentNodes.find(
          node => node.data?.label?.toLowerCase() === rec.element_data?.source?.toLowerCase()
        );
        const targetExists = currentNodes.find(
          node => node.data?.label?.toLowerCase() === rec.element_data?.target?.toLowerCase()
        );
        
        if (!sourceExists || !targetExists) {
          return false;
        }

        const existingEdge = currentEdges.find(
          edge => edge.source === sourceExists.id && edge.target === targetExists.id
        );
        if (existingEdge) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Get contextual quick suggestions based on current state
   */
  getContextualSuggestions(context: AIAssistantContext): string[] {
    const { diagramNodes, diagramEdges, currentAction, errorMessages } = context;

    // No diagram yet
    if (!diagramNodes || diagramNodes.length === 0) {
      return [
        "¿Cómo empiezo a crear un diagrama UML?",
        "¿Cuáles son los elementos básicos de un diagrama de clases?",
        "¿Cómo añado mi primera clase al diagrama?"
      ];
    }

    // Has nodes but no relationships
    if (diagramEdges.length === 0 && diagramNodes.length > 1) {
      return [
        "¿Cómo añado relaciones entre clases?",
        "¿Cuáles son los tipos de relaciones UML?",
        "¿Cómo conecto mis clases con asociaciones?"
      ];
    }

    // Complex diagram
    if (diagramNodes.length > 5) {
      return [
        "¿Cómo genero código SpringBoot desde mi diagrama?",
        "¿Mi diagrama está listo para generar código?",
        "¿Qué mejores prácticas debería aplicar a mi diseño?"
      ];
    }

    // Has errors
    if (errorMessages && errorMessages.length > 0) {
      return [
        "¿Cómo soluciono los errores en mi diagrama?",
        "¿Qué significan estos mensajes de error?",
        "¿Cómo valido que mi diagrama esté correcto?"
      ];
    }

    // Default suggestions
    return [
      "¿Cómo mejoro mi diagrama actual?",
      "¿Qué elementos me faltan en el diseño?",
      "¿Cómo optimizo las relaciones entre clases?"
    ];
  }

  /**
   * Get natural language command suggestions based on diagram state
   */
  getNaturalLanguageCommandSuggestions(context: AIAssistantContext): string[] {
    const { diagramNodes, diagramEdges } = context;

    // No diagram yet - basic creation commands
    if (!diagramNodes || diagramNodes.length === 0) {
      return [
        "Crea una clase User con atributos id, name, email",
        "Añade una clase Product con precio y descripción",
        "Genera una clase Order con fecha y estado"
      ];
    }

    // Has nodes but no relationships - relationship commands
    if (diagramEdges.length === 0 && diagramNodes.length > 1) {
      const classNames = diagramNodes.map(node => node.data?.label).filter(Boolean);
      if (classNames.length >= 2) {
        return [
          `Conecta ${classNames[0]} con ${classNames[1]} usando asociación`,
          `Crea una relación de herencia entre las clases`,
          `Añade una composición entre ${classNames[0]} y una nueva clase`
        ];
      }
    }

    // Complex diagram - enhancement commands
    if (diagramNodes.length > 3) {
      return [
        "Añade métodos CRUD a todas las clases",
        "Crea getters y setters para todos los atributos",
        "Genera una clase Controller para cada entidad"
      ];
    }

    // Default enhancement suggestions
    return [
      "Añade atributos id a las clases que no lo tengan",
      "Crea una relación entre dos clases existentes",
      "Genera métodos básicos para una clase"
    ];
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  // Private helper methods

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit & { timeout?: number } = {}
  ): Promise<T> {
    const { timeout = env.apiConfig.timeout, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || env.apiConfig.timeout);
    
    try {
      const csrfToken = await this.getCSRFToken();
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      };
      
      if (csrfToken) {
        (headers as Record<string, string>)['X-CSRFToken'] = csrfToken;
      }
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error Response Body:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      this.requestCount++;

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Request Failed:', error);
      throw error;
    }
  }

  private getSessionId(): string {
    return localStorage.getItem('diagram_session') || 'anonymous';
  }

  /**
   * Get current rate limit status
   */
  getRateLimitInfo(): { remaining: number; resetTime: number } {
    const now = Date.now();
    
    // Reset counter every hour
    if (now > this.rateLimitReset) {
      this.requestCount = 0;
      this.rateLimitReset = now + (60 * 60 * 1000); // 1 hour
    }

    return {
      remaining: Math.max(0, this.MAX_REQUESTS_PER_HOUR - this.requestCount),
      resetTime: this.rateLimitReset
    };
  }

  private async getCSRFToken(): Promise<string | null> {
    try {
      // Try to get CSRF token from meta tag first
      const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (metaToken) return metaToken;

      // If not available, try to get it from a cookie
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];
      
      return cookieToken || null;
    } catch (error) {
      console.warn('Could not get CSRF token:', error);
      return null;
    }
  }

  private checkRateLimit(): void {
    const now = Date.now();
    
    // Reset counter every hour
    if (now > this.rateLimitReset) {
      this.requestCount = 0;
      this.rateLimitReset = now + (60 * 60 * 1000); // 1 hour
    }

    if (this.requestCount >= this.MAX_REQUESTS_PER_HOUR) {
      const error: AIAssistantErrorDetails = {
        type: 'rate_limit_exceeded',
        message: `Se ha alcanzado el límite de ${this.MAX_REQUESTS_PER_HOUR} preguntas por hora. Inténtelo más tarde.`,
        retryable: true,
        retryAfter: Math.ceil((this.rateLimitReset - now) / 1000)
      };
      throw error;
    }
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && Date.now() - entry.timestamp < entry.ttl) {
      return entry.data as T;
    }
    
    if (entry) {
      this.cache.delete(key);
    }
    
    return null;
  }

  private setCache(key: string, data: any, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Clean up old entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private handleError(error: any): AIAssistantErrorDetails {
    if (error.name === 'AbortError') {
      return {
        type: 'timeout_error',
        message: 'La solicitud tardó demasiado tiempo. Verifique su conexión e inténtelo de nuevo.',
        retryable: true
      };
    }

    if (error.message?.includes('Failed to fetch')) {
      return {
        type: 'network_error',
        message: 'No se pudo conectar con el servicio de asistente. Verifique su conexión a internet.',
        retryable: true
      };
    }

    if (error.message?.includes('429')) {
      return {
        type: 'rate_limit_exceeded',
        message: 'Demasiadas solicitudes. Espere un momento antes de hacer otra pregunta.',
        retryable: true,
        retryAfter: 60
      };
    }

    if (error.message?.includes('500')) {
      return {
        type: 'service_unavailable',
        message: 'El servicio de asistente no está disponible temporalmente. Inténtelo más tarde.',
        retryable: true
      };
    }

    // If it's already an AIAssistantErrorDetails object, return as is
    if (error.type && error.message) {
      return error;
    }

    // Default error
    return {
      type: 'network_error',
      message: error.message || 'Ha ocurrido un error inesperado. Inténtelo de nuevo.',
      retryable: true
    };
  }
}

// Export singleton instance
export const aiAssistantService = new AIAssistantService();
export default aiAssistantService;
