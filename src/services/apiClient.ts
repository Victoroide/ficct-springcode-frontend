
import { env } from '@/config/environment'
import { getTokens, isTokenExpired, saveTokens } from './tokenService'
import { normalizeApiUrl } from '@/utils/urlUtils'

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

class ApiClient {
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

    // Normalizar endpoint para asegurar que sea compatible con API v1
    const normalizedEndpoint = normalizeApiUrl(endpoint)
    const url = `${this.baseUrl}${normalizedEndpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    }

    const token = await this.getAuthToken()
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`
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
        case 401:
          errorMessage = 'Unauthorized'
          this.handleUnauthorized()
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

  private async getAuthToken(): Promise<string | null> {
    try {
      if (isTokenExpired()) {
        const refreshed = await this.refreshAuthToken()
        if (!refreshed) {
          return null
        }
      }
      
      const tokens = getTokens()
      return tokens.accessToken
    } catch (error) {
      return null
    }
  }
  
  private async refreshAuthToken(): Promise<boolean> {
    try {
      const tokens = getTokens()
      
      if (!tokens.refreshToken) {
        return false
      }
      
      const refreshEndpoint = normalizeApiUrl('/auth/refresh/')
      const response = await fetch(`${this.baseUrl}${refreshEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: tokens.refreshToken
        }),
      })
      
      if (!response.ok) {
        this.handleUnauthorized()
        return false
      }
      
      const data = await response.json()
      
      saveTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        token_type: 'Bearer',
        expires_in: 900,
        user_id: 0,
        corporate_email: ''
      })
      
      return true
    } catch (error) {
      return false
    }
  }

  private handleUnauthorized(): void {
    try {
      localStorage.removeItem(env.authConfig.tokenKey)
      localStorage.removeItem(env.authConfig.refreshTokenKey)
    } catch (error) {
    }

    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
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

export const apiClient = new ApiClient()
export default apiClient
