/**
 * Anonymous API Service
 * Simple fetch base query without authentication for anonymous UML tool
 */
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { env } from '@/config/environment';

/**
 * Simple fetch base query without authentication
 */
export const createAnonymousBaseQuery = (baseUrl: string): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> => {
  const baseQuery = fetchBaseQuery({
    baseUrl,
    timeout: env.apiConfig.timeout,
    prepareHeaders: (headers) => {
      // Add session information for anonymous tracking
      const sessionId = localStorage.getItem('diagram_session') || 'anonymous';
      headers.set('X-Session-ID', sessionId);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  });

  return async (args, api, extraOptions) => {
    try {
      const result = await baseQuery(args, api, extraOptions);
      
      // Log API response only in development
      if (env.isDevelopment && result.error) {
        console.warn(`Anonymous API Error: ${typeof args === 'string' ? args : args.url}`, {
          status: result.error.status,
          data: result.error.data
        });
      }
      
      return result;
    } catch (error) {
      console.error(`Anonymous API Request Failed: ${typeof args === 'string' ? args : args.url}`, error);
      return {
        error: {
          status: 'FETCH_ERROR',
          error: 'Network request failed',
        } as FetchBaseQueryError,
      };
    }
  };
};

/**
 * Default anonymous base query using environment config
 */
export const anonymousBaseQuery = createAnonymousBaseQuery(env.apiConfig.baseUrl);

export default anonymousBaseQuery;
