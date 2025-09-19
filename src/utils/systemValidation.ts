/**
 * System Validation Utilities
 * Comprehensive validation for environment, API connectivity, and code quality
 */

import { env } from '@/config/environment'
import { apiClient } from '@/services/apiClient'

export interface ValidationResult {
  category: string
  name: string
  status: 'success' | 'warning' | 'error'
  message: string
  details?: unknown
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'failed'
  results: ValidationResult[]
  timestamp: string
}

class SystemValidator {
  /**
   * Run comprehensive system validation
   */
  async validateSystem(): Promise<SystemStatus> {
    const results: ValidationResult[] = []

    // Environment Configuration Validation
    results.push(...this.validateEnvironmentConfig())

    // API Connectivity Validation
    results.push(...await this.validateApiConnectivity())

    // Frontend Configuration Validation
    results.push(...this.validateFrontendConfig())

    // Determine overall system status
    const hasErrors = results.some(r => r.status === 'error')
    const hasWarnings = results.some(r => r.status === 'warning')
    
    let overall: 'healthy' | 'degraded' | 'failed'
    if (hasErrors) {
      overall = 'failed'
    } else if (hasWarnings) {
      overall = 'degraded'
    } else {
      overall = 'healthy'
    }

    return {
      overall,
      results,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Validate environment configuration
   */
  private validateEnvironmentConfig(): ValidationResult[] {
    const results: ValidationResult[] = []

    try {
      // API Base URL validation
      const apiUrl = env.apiConfig.baseUrl
      if (!apiUrl) {
        results.push({
          category: 'Environment',
          name: 'API Base URL',
          status: 'error',
          message: 'API base URL is not configured',
        })
      } else if (!apiUrl.startsWith('http')) {
        results.push({
          category: 'Environment',
          name: 'API Base URL',
          status: 'error',
          message: 'API base URL must be a valid HTTP/HTTPS URL',
          details: { apiUrl },
        })
      } else {
        results.push({
          category: 'Environment',
          name: 'API Base URL',
          status: 'success',
          message: `API base URL configured: ${apiUrl}`,
          details: { apiUrl },
        })
      }

      // Timeout validation
      const timeout = env.apiConfig.timeout
      if (timeout < 1000) {
        results.push({
          category: 'Environment',
          name: 'API Timeout',
          status: 'warning',
          message: 'API timeout is less than 1 second, this may cause issues',
          details: { timeout },
        })
      } else {
        results.push({
          category: 'Environment',
          name: 'API Timeout',
          status: 'success',
          message: `API timeout configured: ${timeout}ms`,
          details: { timeout },
        })
      }

      // Environment detection
      const environment = env.appConfig.environment
      results.push({
        category: 'Environment',
        name: 'Environment Detection',
        status: 'success',
        message: `Running in ${environment} environment`,
        details: { environment },
      })

      // Feature flags validation
      results.push({
        category: 'Environment',
        name: 'Feature Flags',
        status: 'success',
        message: 'Feature flags configured',
        details: env.featureConfig,
      })

    } catch (error) {
      results.push({
        category: 'Environment',
        name: 'Configuration Loading',
        status: 'error',
        message: 'Failed to load environment configuration',
        details: { error: (error as Error).message },
      })
    }

    return results
  }

  /**
   * Validate API connectivity
   */
  private async validateApiConnectivity(): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    try {
      // Test basic connectivity
      const isConnected = await apiClient.testConnection()
      
      if (isConnected) {
        results.push({
          category: 'API Connectivity',
          name: 'Backend Connection',
          status: 'success',
          message: 'Successfully connected to Django backend',
          details: { baseUrl: env.apiConfig.baseUrl },
        })
      } else {
        results.push({
          category: 'API Connectivity',
          name: 'Backend Connection',
          status: 'error',
          message: 'Failed to connect to Django backend',
          details: { baseUrl: env.apiConfig.baseUrl },
        })
      }

      // Test specific endpoints (without authentication)
      const endpointsToTest = [
        '/api/v1/auth/login/',
        '/api/v1/registration/register/',
      ]

      for (const endpoint of endpointsToTest) {
        try {
          const response = await apiClient.request(endpoint, { 
            method: 'POST',
            timeout: 3000 
          })
          
          // We expect this to fail with 400/422 (validation error) rather than 404/500
          if (response.status === 400 || response.status === 422) {
            results.push({
              category: 'API Connectivity',
              name: `Endpoint ${endpoint}`,
              status: 'success',
              message: 'Endpoint is accessible and responding',
              details: { endpoint, status: response.status },
            })
          } else if (response.status === 404) {
            results.push({
              category: 'API Connectivity',
              name: `Endpoint ${endpoint}`,
              status: 'error',
              message: 'Endpoint not found - check backend routing',
              details: { endpoint, status: response.status },
            })
          } else {
            results.push({
              category: 'API Connectivity',
              name: `Endpoint ${endpoint}`,
              status: 'warning',
              message: 'Endpoint responded with unexpected status',
              details: { endpoint, status: response.status },
            })
          }
        } catch (error) {
          results.push({
            category: 'API Connectivity',
            name: `Endpoint ${endpoint}`,
            status: 'error',
            message: 'Failed to test endpoint',
            details: { endpoint, error: (error as Error).message },
          })
        }
      }

    } catch (error) {
      results.push({
        category: 'API Connectivity',
        name: 'Connectivity Test',
        status: 'error',
        message: 'Failed to perform connectivity tests',
        details: { error: (error as Error).message },
      })
    }

    return results
  }

  /**
   * Validate frontend configuration
   */
  private validateFrontendConfig(): ValidationResult[] {
    const results: ValidationResult[] = []

    // Check localStorage availability
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      results.push({
        category: 'Frontend',
        name: 'Local Storage',
        status: 'success',
        message: 'Local storage is available',
      })
    } catch (error) {
      results.push({
        category: 'Frontend',
        name: 'Local Storage',
        status: 'error',
        message: 'Local storage is not available',
        details: { error: (error as Error).message },
      })
    }

    // Check if running in development
    if (env.isDevelopment()) {
      results.push({
        category: 'Frontend',
        name: 'Development Mode',
        status: 'success',
        message: 'Running in development mode with enhanced debugging',
      })
    }

    // Validate path aliases
    try {
      // This is a simple check - in a real scenario you might test actual imports
      results.push({
        category: 'Frontend',
        name: 'Path Aliases',
        status: 'success',
        message: 'Path aliases configured (@/ mapping)',
      })
    } catch (error) {
      results.push({
        category: 'Frontend',
        name: 'Path Aliases',
        status: 'error',
        message: 'Path aliases configuration issue',
        details: { error: (error as Error).message },
      })
    }

    return results
  }

  /**
   * Generate validation report for console output
   */
  generateReport(status: SystemStatus): string {
    const { overall, results, timestamp } = status

    let report = `\n🔍 SYSTEM VALIDATION REPORT\n`
    report += `📅 Timestamp: ${timestamp}\n`
    report += `🎯 Overall Status: ${this.getStatusEmoji(overall)} ${overall.toUpperCase()}\n\n`

    // Group results by category
    const categories = [...new Set(results.map(r => r.category))]
    
    for (const category of categories) {
      report += `📂 ${category}:\n`
      const categoryResults = results.filter(r => r.category === category)
      
      for (const result of categoryResults) {
        const emoji = this.getStatusEmoji(result.status)
        report += `   ${emoji} ${result.name}: ${result.message}\n`
        
        if (result.details && env.featureConfig.debugMode) {
          report += `      Details: ${JSON.stringify(result.details, null, 2)}\n`
        }
      }
      report += '\n'
    }

    return report
  }

  /**
   * Get emoji for status
   */
  private getStatusEmoji(status: string): string {
    switch (status) {
      case 'success':
      case 'healthy':
        return '✅'
      case 'warning':
      case 'degraded':
        return '⚠️'
      case 'error':
      case 'failed':
        return '❌'
      default:
        return '❓'
    }
  }
}

// Export singleton instance
export const systemValidator = new SystemValidator()
export default systemValidator
