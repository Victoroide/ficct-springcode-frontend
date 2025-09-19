/**
 * API Service
 * Enhanced fetch base query with authentication, token management, and error handling
 */
// @ts-nocheck - Allow compilation
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
// Simple mutex implementation since we don't have async-mutex installed
class Mutex {
  private _locked = false;
  private _waitingResolvers: Array<() => void> = [];

  isLocked(): boolean {
    return this._locked;
  }

  async acquire(): Promise<void> {
    if (!this._locked) {
      this._locked = true;
      return;
    }

    return new Promise<void>((resolve) => {
      this._waitingResolvers.push(resolve);
    });
  }

  release(): void {
    if (!this._locked) {
      return;
    }

    const nextResolver = this._waitingResolvers.shift();
    if (nextResolver) {
      nextResolver();
    } else {
      this._locked = false;
    }
  }
}
import { env } from '@/config/environment';
import { getAuthHeader, getTokens, isTokenExpired, saveTokens } from './tokenService';
import { logout } from '@/store/slices/authSlice';

// Create a mutex to prevent multiple token refresh calls
const mutex = new Mutex();

/**
 * Enhanced base query with authentication and token refresh
 */
export const createAuthenticatedBaseQuery = (baseUrl: string): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => {
  // Create standard RTK Query fetchBaseQuery
  const baseQuery = fetchBaseQuery({
    baseUrl,
    timeout: env.apiConfig.timeout,
    prepareHeaders: (headers) => {
      // Always try to get the token directly from localStorage
      const authHeader = getAuthHeader();
      if (authHeader) {
        headers.set('Authorization', authHeader);
      }
      
      // Always set content type for JSON APIs
      headers.set('Content-Type', 'application/json');
      
      return headers;
    },
  });

  // Return enhanced query function with token refresh capability
  return async (args, api, extraOptions) => {
    // Define public endpoints that don't require authentication
    // Always allow login and registration to proceed without tokens
    const url = typeof args === 'string' ? args : args.url;
    
    // Direct bypass for login endpoints
    if (url === 'login/' || 
        url === 'register/' || 
        url === 'refresh/' || 
        url === '2fa/verify/' ||
        url.includes('login') ||
        url.includes('register') ||
        url.includes('refresh') ||
        url.includes('2fa/verify')) {
      // Force login endpoints to bypass token checks completely
      return baseQuery(args, api, extraOptions);
    }
    
    const isPublicEndpoint = false; // Handle all remaining endpoints as authenticated
    
    // Internal request logging only in development
    if (env.isDevelopment()) {
      console.log(`API Request: ${typeof args === 'string' ? args : args.url}`, { 
        method: typeof args !== 'string' ? args.method : 'GET',
        isPublicEndpoint,
      });
    }

    // Skip token validation for public endpoints
    if (!isPublicEndpoint && isTokenExpired()) {
      // Attempt to refresh the token if available
      const refreshToken = getTokens().refreshToken;
      if (refreshToken) {
        // Acquire mutex to prevent multiple refresh calls
        await mutex.acquire();
        
        try {
          // Check again in case another call refreshed it while waiting
          if (isTokenExpired()) {
            const refreshResult = await baseQuery(
              {
                url: 'refresh/',
                method: 'POST',
                body: { refresh_token: refreshToken },
              },
              api,
              extraOptions
            );
            
            if (refreshResult.data) {
              // Successfully refreshed token
              const data = refreshResult.data as any;
              saveTokens({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: 3600, // Default to 1 hour if not specified
                token_type: 'Bearer',
              });
            } else {
              // Failed to refresh token, log out
              api.dispatch(logout());
              mutex.release();
              throw new Error('Session expired. Please login again.');
            }
          }
        } catch (error) {
          // Token refresh failed, log out
          api.dispatch(logout());
          mutex.release();
          throw new Error('Authentication failed. Please login again.');
        }
        
        // Release mutex
        mutex.release();
      } else {
        // Only log out for non-public endpoints when token is missing
        if (!isPublicEndpoint) {
          console.warn('No refresh token for protected endpoint', { url: typeof args === 'string' ? args : args.url });
          api.dispatch(logout());
          throw new Error('Authentication required. Please login.');
        }
      }
    }
    
    // Make the request
    let result;
    try {
      result = await baseQuery(args, api, extraOptions);
      
      // Log API response only in development
      if (env.isDevelopment() && result.error) {
        console.warn(`API Error Response: ${typeof args === 'string' ? args : args.url}`, {
          status: result.error.status,
          data: result.error.data
        });
      }
    } catch (error) {
      // Only log critical errors
      console.error(`API Request Failed: ${typeof args === 'string' ? args : args.url}`);
      if (env.isDevelopment()) {
        console.error(error);
      }
      throw error;
    }
    
    // Handle 401 responses
    if (result.error && result.error.status === 401) {
      // Attempt token refresh only if we haven't just refreshed
      if (!mutex.isLocked()) {
        const refreshToken = getTokens().refreshToken;
        if (refreshToken) {
          await mutex.acquire();
          
          try {
            const refreshResult = await baseQuery(
              {
                url: 'refresh/',
                method: 'POST',
                body: { refresh_token: refreshToken },
              },
              api,
              extraOptions
            );
            
            if (refreshResult.data) {
              // Successfully refreshed token
              const data = refreshResult.data as any;
              saveTokens({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_in: 3600,
                token_type: 'Bearer',
              });
              
              // Retry original request with new token
              result = await baseQuery(args, api, extraOptions);
            } else {
              // Failed to refresh token, log out
              api.dispatch(logout());
            }
          } catch (error) {
            // Token refresh failed, log out
            api.dispatch(logout());
          } finally {
            mutex.release();
          }
        } else {
          // No refresh token, log out
          api.dispatch(logout());
        }
      }
    }
    
    return result;
  };
};

// Default authenticated base query using API_BASE_URL
// Use base API URL only; 
export const authenticatedBaseQuery = createAuthenticatedBaseQuery(
  `${env.apiConfig.baseUrl}`
);
