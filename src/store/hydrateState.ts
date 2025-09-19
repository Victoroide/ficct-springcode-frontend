// @ts-nocheck
/**
 * Store Hydration Utility
 * Builds the initial Redux preloadedState from localStorage.
 */
import type { AuthState } from '@/types/auth'
import { getTokens } from '@/services/tokenService'
import { getStoredUserProfile, getStoredSecurityContext, getStoredSecurityRecommendations } from '@/services/sessionService'

export const buildPreloadedState = () => {
  const tokens = getTokens()
  const user = getStoredUserProfile()
  const securityStatus = getStoredSecurityContext()
  const recommendations = getStoredSecurityRecommendations()

  const preloadedAuth: Partial<AuthState> = {
    isAuthenticated: !!tokens.accessToken,
    user: user || null,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      tokenType: tokens.tokenType,
    },
    requires2FA: false,
    isLoading: false,
    error: null,
    lastAuthenticated: user?.last_login || null,
  }

  const preloadedUser = {
    profile: user || null,
    isProfileComplete: user?.full_profile_complete || false,
    lastUpdated: user ? new Date().toISOString() : null,
    securityStatus: securityStatus || null,
    securityRecommendations: recommendations,
    isLoading: false,
    error: null,
  }

  return {
    auth: preloadedAuth,
    user: preloadedUser,
  }
}
