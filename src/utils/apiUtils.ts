/**
 * API Utilities
 * Helper functions for working with the API response structures
 */

import type { User } from '@/types/auth';

/**
 * Extract user data from the API response
 * Safely handles both old and new API response structures
 * @param response API response object that might contain user data
 * @returns User object or null
 */
export function extractUserData(response: any): User | null {
  if (!response) return null;
  
  // Handle the new API structure where user is nested inside success response
  if (response.success === true && response.user) {
    return response.user;
  }
  
  // Handle legacy structure where user data is directly in the response
  if (response.id && response.corporate_email) {
    return response;
  }
  
  return null;
}

/**
 * Extract security status from user data
 * @param userData User data that might contain security_status
 * @returns Security status object with defaults if not found
 */
export function extractSecurityStatus(userData: any) {
  if (!userData) return { "2fa_enabled": false, security_score: 0, backup_codes_available: 0 };
  
  if (userData.security_status) {
    return userData.security_status;
  }
  
  // Fallback to legacy structure
  return {
    "2fa_enabled": userData.is_2fa_enabled || false,
    security_score: userData.security_score || 0,
    backup_codes_available: userData.backup_codes_count || 0
  };
}

/**
 * Extract sessions data from API response
 * @param response API response that might contain sessions data
 * @returns Array of sessions or empty array
 */
export function extractSessionsData(response: any): any[] {
  if (!response) return [];
  
  // Handle the new API structure where sessions is nested inside success response
  if (response.success === true && response.sessions) {
    return response.sessions;
  }
  
  // Handle legacy structure where sessions data is directly in the response
  if (Array.isArray(response)) {
    return response;
  }
  
  return [];
}
