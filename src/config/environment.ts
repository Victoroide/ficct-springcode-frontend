/**
 * Environment Configuration Module
 * Centralized configuration management for different environments
 */

export interface EnvironmentConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
  }
  api: {
    baseUrl: string
    wsUrl: string  // URL específica para WebSocket (ASGI)
    timeout: number
    retryAttempts: number
  }
  auth: {
    tokenKey: string
    refreshTokenKey: string
  }
  features: {
    enableDevtools: boolean
    debugMode: boolean
    aiEnabled: boolean
  }
  ai: {
    passwordProtected: boolean
    sessionDuration: number
    maxAttempts: number
    lockoutDuration: number
  }
}

class Environment {
  private config: EnvironmentConfig

  constructor() {
    this.config = this.loadConfiguration()
    this.validateConfiguration()
  }

  private loadConfiguration(): EnvironmentConfig {
    return {
      app: {
        name: import.meta.env.VITE_APP_NAME || 'SpringCode Generator',
        version: import.meta.env.VITE_APP_VERSION || '1.0.0',
        environment: (import.meta.env.VITE_APP_ENV as any) || 'development',
      },
      api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost',
        wsUrl: import.meta.env.VITE_API_WS_URL || 'ws://localhost:8001',
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
        retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3', 10),
      },
      auth: {
        tokenKey: import.meta.env.VITE_JWT_TOKEN_KEY || 'springcode_auth_token',
        refreshTokenKey: import.meta.env.VITE_JWT_REFRESH_KEY || 'springcode_refresh_token',
      },
      features: {
        enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
        debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
        aiEnabled: import.meta.env.VITE_AI_FEATURES_ENABLED === 'true',
      },
      ai: {
        passwordProtected: true,
        sessionDuration: 24 * 60 * 60 * 1000, // 24 hours
        maxAttempts: 3,
        lockoutDuration: 5 * 60 * 1000, // 5 minutes
      },
    }
  }

  private validateConfiguration(): void {
    const { api } = this.config

    if (!api.baseUrl) {
      throw new Error('API base URL is required but not configured')
    }

    if (!api.baseUrl.startsWith('http')) {
      throw new Error('API base URL must be a valid HTTP/HTTPS URL')
    }

    if (api.timeout < 1000) {
      console.warn('API timeout is set to less than 1 second, this may cause issues')
    }
  }

  // Public getters
  get appConfig() {
    return this.config.app
  }

  get apiConfig() {
    return this.config.api
  }

  get authConfig() {
    return this.config.auth
  }

  get featureConfig() {
    return this.config.features
  }

  get aiConfig() {
    return this.config.ai
  }

  // Utility methods
  isDevelopment(): boolean {
    return this.config.app.environment === 'development'
  }

  isStaging(): boolean {
    return this.config.app.environment === 'staging'
  }

  isProduction(): boolean {
    return this.config.app.environment === 'production'
  }

  // Get full configuration
  getConfig(): EnvironmentConfig {
    return { ...this.config }
  }
}

// Export singleton instance
export const env = new Environment()
export default env
