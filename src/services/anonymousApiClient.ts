import { env } from '@/config/environment'
import { normalizeApiUrl } from '@/utils/urlUtils'
import { anonymousSessionService } from './anonymousSessionService'

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  success: boolean
  status: number
}

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

class AnonymousApiClient {
  private baseUrl: string
  private defaultTimeout: number
  private retryAttempts: number

  constructor() {
    this.baseUrl = env.apiConfig.baseUrl
    this.defaultTimeout = env.apiConfig.timeout
    this.retryAttempts = env.apiConfig.retryAttempts
  }

  async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = config

    // 🔧 CRITICAL: Normalizar endpoint para asegurar que sea compatible
    const normalizedEndpoint = normalizeApiUrl(endpoint)
    const url = `${this.baseUrl}${normalizedEndpoint}`
    
    // Debug logging en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${method} ${url}`);
      console.log('📄 Endpoint original:', endpoint, '→ Normalizado:', normalizedEndpoint);
    }
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Session-ID': anonymousSessionService.getSessionId(),
      'X-Nickname': anonymousSessionService.getNickname(),
      ...headers,
    }

    const requestConfig: RequestInit = {
      method,
      headers: requestHeaders,
      signal: controller.signal,
    }

    if (body && method !== 'GET') {
      requestConfig.body = JSON.stringify(body)
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, requestConfig)
        clearTimeout(timeoutId)

        const responseData = await this.handleResponse<T>(response)
        return responseData
      } catch (error) {
        lastError = error as Error
        
        if (
          error instanceof TypeError ||
          (error as any).name === 'AbortError' ||
          attempt === this.retryAttempts
        ) {
          break
        }

        await this.delay(Math.pow(2, attempt) * 1000)
      }
    }

    clearTimeout(timeoutId)

    return {
      success: false,
      status: 0,
      error: lastError?.message || 'Network request failed',
    }
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const status = response.status
    let data: T | undefined

    try {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      }
    } catch (error) {
      // Ignore JSON parsing errors
    }

    if (response.ok) {
      return {
        success: true,
        status,
        data,
      }
    }

    let errorMessage = 'Request failed'
    
    if (data && typeof data === 'object' && 'message' in data) {
      errorMessage = (data as any).message
    } else if (data && typeof data === 'object' && 'error' in data) {
      errorMessage = (data as any).error
    } else {
      switch (status) {
        case 400:
          errorMessage = 'Bad Request'
          break
        case 403:
          errorMessage = 'Forbidden'
          break
        case 404:
          errorMessage = 'Not Found'
          break
        case 422:
          errorMessage = 'Validation Error'
          break
        case 500:
          errorMessage = 'Internal Server Error'
          break
        default:
          errorMessage = `Request failed with status ${status}`
      }
    }

    return {
      success: false,
      status,
      error: errorMessage,
      data,
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.request('/health/', { timeout: 5000 })
      return response.success
    } catch (error) {
      return false
    }
  }

  async get<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' })
  }

  async post<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body })
  }

  async put<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body })
  }

  async patch<T>(endpoint: string, body?: unknown, config?: Omit<ApiRequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body })
  }

  async delete<T>(endpoint: string, config?: Omit<ApiRequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' })
  }
}

export const anonymousApiClient = new AnonymousApiClient()
export default anonymousApiClient
