import { v4 as uuidv4 } from 'uuid';

export interface AnonymousSession {
  sessionId: string;
  nickname: string;
  createdAt: Date;
  diagramIds: string[];
}

class AnonymousSessionService {
  private static instance: AnonymousSessionService;
  private currentSession: AnonymousSession | null = null;
  private readonly SESSION_STORAGE_KEY = 'anonymous_session';
  
  // 🔧 OPTIMIZACIÓN: Cache en memoria para evitar múltiples accesos a localStorage
  private cachedSessionId: string | null = null;
  private cachedNickname: string | null = null;

  static getInstance(): AnonymousSessionService {
    if (!AnonymousSessionService.instance) {
      AnonymousSessionService.instance = new AnonymousSessionService();
    }
    return AnonymousSessionService.instance;
  }

  /**
   * Genera un nickname anónimo único
   */
  private generateNickname(): string {
    const adjectives = ['Creative', 'Smart', 'Quick', 'Bright', 'Cool', 'Swift', 'Sharp', 'Clever'];
    const animals = ['Fox', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Bear', 'Hawk', 'Owl'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    
    return `${adjective}${animal}${number}`;
  }

  /**
   * Obtiene o crea una sesión anónima
   */
  public getOrCreateSession(): AnonymousSession {
    // 🔧 CACHE HIT - evita logs excesivos
    if (this.currentSession) {
      return this.currentSession;
    }

    // Intentar cargar desde localStorage
    const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.currentSession = {
          ...parsed,
          createdAt: new Date(parsed.createdAt)
        };
        // Log solo en modo desarrollo
        if (import.meta.env.DEV) {
        }
        return this.currentSession;
      } catch (error) {
        console.warn('Error parsing stored session:', error);
      }
    }

    // Crear nueva sesión
    this.currentSession = {
      sessionId: uuidv4(),
      nickname: this.generateNickname(),
      createdAt: new Date(),
      diagramIds: []
    };

    // Log solo en modo desarrollo
    if (import.meta.env.DEV) {
      console.log('🆕 Nueva sesión creada:', {
        sessionId: this.currentSession.sessionId,
        nickname: this.currentSession.nickname
      });
    }

    this.saveSession();
    return this.currentSession;
  }

  /**
   * Obtiene la sesión actual sin crear una nueva
   */
  public getCurrentSession(): AnonymousSession | null {
    return this.currentSession;
  }

  /**
   * Actualiza el nickname de la sesión
   */
  public updateNickname(nickname: string): void {
    if (this.currentSession) {
      this.currentSession.nickname = nickname;
      this.saveSession();
    }
  }

  /**
   * Añade un diagrama a la sesión
   */
  public addDiagramToSession(diagramId: string): void {
    const session = this.getOrCreateSession();
    if (!session.diagramIds.includes(diagramId)) {
      session.diagramIds.push(diagramId);
      this.saveSession();
    }
  }

  /**
   * 🔧 CRITICAL: Obtiene el ID de sesión con cache agresivo
   */
  public getSessionId(): string {
    // Cache hit agresivo - evita TODA llamada a getOrCreateSession
    if (this.cachedSessionId) {
      return this.cachedSessionId;
    }
    
    // Intentar obtener del localStorage primero sin crear sesión
    const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.cachedSessionId = parsed.sessionId;
        return this.cachedSessionId;
      } catch (error) {
        // Si falla el parsing, crear nueva sesión
      }
    }
    
    // Último recurso - crear sesión
    const session = this.getOrCreateSession();
    this.cachedSessionId = session.sessionId;
    return this.cachedSessionId;
  }

  /**
   * 🔧 CRITICAL: Obtiene el nickname con cache agresivo
   */
  public getNickname(): string {
    // Cache hit agresivo
    if (this.cachedNickname) {
      return this.cachedNickname;
    }
    
    // Intentar obtener del localStorage primero
    const stored = localStorage.getItem(this.SESSION_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.cachedNickname = parsed.nickname;
        return this.cachedNickname;
      } catch (error) {
        // Si falla el parsing, crear nueva sesión
      }
    }
    
    // Último recurso - crear sesión
    const session = this.getOrCreateSession();
    this.cachedNickname = session.nickname;
    return this.cachedNickname;
  }

  /**
   * Guarda la sesión en localStorage
   */
  private saveSession(): void {
    if (this.currentSession) {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(this.currentSession));
    }
  }

  /**
   * 🔧 OPTIMIZACIÓN: Limpia la sesión y cache
   */
  public clearSession(): void {
    this.currentSession = null;
    this.cachedSessionId = null;
    this.cachedNickname = null;
    localStorage.removeItem(this.SESSION_STORAGE_KEY);
  }

  /**
   * Regenera el nickname manteniendo la sesión
   */
  public regenerateNickname(): string {
    const newNickname = this.generateNickname();
    this.updateNickname(newNickname);
    return newNickname;
  }
}

// 🔧 OPTIMIZACIÓN: Export singleton instance
export const anonymousSessionService = AnonymousSessionService.getInstance();
export default anonymousSessionService;
