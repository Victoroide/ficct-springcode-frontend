/**
 * Session Service
 * Handles structured persistence of the complete login response in localStorage
 */
// @ts-nocheck
import type { LoginResponse, User, SecurityStatus } from '@/types/auth'

// Storage keys
const USER_PROFILE_KEY = 'springcode_user_profile'
const SECURITY_CONTEXT_KEY = 'springcode_security_context'
const SESSION_DATA_KEY = 'springcode_session_data'
const SECURITY_RECOMMENDATIONS_KEY = 'springcode_security_recommendations'
const USER_DATA_VERSION = 'springcode_data_version'

/**
 * Saves authentication user data to localStorage with comprehensive structure
 * Improved to save ALL user fields for complete state restoration
 */
export const saveLoginResponse = (data: LoginResponse): void => {
  try {
    const { user, tokens } = data

    // Store complete user object to ensure all fields are preserved
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user))

    // Security context - for easy access to security-specific data
    localStorage.setItem(SECURITY_CONTEXT_KEY, JSON.stringify({
      is_2fa_enabled: user.is_2fa_enabled,
      email_verified: user.email_verified,
      permissions: user.permissions,
      security_status: user.security_status || {
        "2fa_enabled": user.is_2fa_enabled || false,
        security_score: 0,
        backup_codes_available: 0
      },
      security_score: user.security_status?.security_score || 0,
      last_password_change: user.security_status?.last_password_change,
      password_expires_in_days: user.password_expires_in_days || 90,
      security_recommendations: user.security_recommendations || []
    }))

    // Session info - for quick access to session metadata
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify({
      last_login: user.last_login || new Date().toISOString(),
      last_login_formatted: user.last_login_formatted || 'Just now',
      last_login_ip: user.last_login_ip || '127.0.0.1',
      last_activity: user.last_activity || new Date().toISOString(),
      failed_login_attempts: user.security_status?.failed_login_attempts || 0,
      lastAuthenticated: new Date().toISOString() // Important for session duration tracking
    }))

    // Recommendations as separate entity for easy access
    localStorage.setItem(SECURITY_RECOMMENDATIONS_KEY, JSON.stringify(user.security_recommendations || []))
    
    // Store data version for future schema migrations
    localStorage.setItem(USER_DATA_VERSION, '1.1')
    
    // Debug log only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('User data persisted to localStorage', { user })
    }
  } catch (err) {
    console.error('Failed to persist login response', err)
    // Try to save at least the minimal user data
    try {
      if (data?.user) {
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify({
          id: data.user.id,
          full_name: data.user.full_name,
          corporate_email: data.user.corporate_email,
          role: data.user.role
        }))
      }
    } catch (fallbackErr) {
      console.error('Critical failure in user data persistence', fallbackErr)
    }
  }
}

/**
 * Retrieves complete user profile from localStorage with fallbacks
 * Added validation and defensive parsing to prevent corrupted data
 */
export const getStoredUserProfile = (): User | null => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY)
    if (!raw) return null
    
    const userData = JSON.parse(raw)
    
    // Validate minimum required fields
    if (!userData || !userData.id || !userData.corporate_email) {
      console.warn('Incomplete user data found in localStorage')
      return null
    }
    
    return userData
  } catch (error) {
    console.error('Failed to retrieve user profile from localStorage:', error)
    return null
  }
}

/**
 * Retrieves security context data with validation and fallback defaults
 */
export const getStoredSecurityContext = (): SecurityStatus | null => {
  try {
    const raw = localStorage.getItem(SECURITY_CONTEXT_KEY)
    if (!raw) return null
    
    const securityData = JSON.parse(raw)
    
    // Ensure security_status is available with defaults
    if (securityData && !securityData.security_status) {
      securityData.security_status = {
        "2fa_enabled": securityData.is_2fa_enabled || false,
        security_score: securityData.security_score || 0,
        backup_codes_available: 0
      }
    }
    
    return securityData
  } catch (error) {
    console.error('Failed to retrieve security context from localStorage:', error)
    // Return minimal defaults to prevent UI errors
    return {
      security_status: {
        "2fa_enabled": false,
        security_score: 0,
        backup_codes_available: 0
      },
      security_recommendations: []
    }
  }
}

/**
 * Retrieves security recommendations with validation
 */
export const getStoredSecurityRecommendations = (): string[] => {
  try {
    const raw = localStorage.getItem(SECURITY_RECOMMENDATIONS_KEY)
    if (!raw) return []
    
    const recommendations = JSON.parse(raw)
    return Array.isArray(recommendations) ? recommendations : []
  } catch (error) {
    console.error('Failed to retrieve security recommendations from localStorage:', error)
    return []
  }
}

/**
 * Clears all session data with comprehensive cleanup
 */
export const clearSessionData = (): void => {
  try {
    localStorage.removeItem(USER_PROFILE_KEY)
    localStorage.removeItem(SECURITY_CONTEXT_KEY)
    localStorage.removeItem(SESSION_DATA_KEY)
    localStorage.removeItem(SECURITY_RECOMMENDATIONS_KEY)
    localStorage.removeItem(USER_DATA_VERSION)
    
    // Additional cleanup for any potential redundant data
    const keysToCheck = ['user', 'profile', 'security', 'session']
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && keysToCheck.some(check => key.toLowerCase().includes(check))) {
        localStorage.removeItem(key)
      }
    }
  } catch (err) {
    console.error('Failed clearing session storage', err)
    // Attempt aggressive clear if specific removals fail
    try {
      for (const key of [USER_PROFILE_KEY, SECURITY_CONTEXT_KEY, SESSION_DATA_KEY, SECURITY_RECOMMENDATIONS_KEY]) {
        localStorage.removeItem(key)
      }
    } catch (fallbackErr) {
      console.error('Critical failure in session data cleanup', fallbackErr)
    }
  }
}
