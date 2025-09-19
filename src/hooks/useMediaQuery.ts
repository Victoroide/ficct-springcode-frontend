import { useState, useEffect } from 'react';

/**
 * Media query breakpoints matching TailwindCSS defaults
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * Custom hook to check if a media query is matched
 * @param query Media query to check
 * @returns Boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  // Default to true for SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);
    
    // Set initial value
    setMatches(mediaQuery.matches);

    // Create handler function
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handler);

    // Clean up
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

/**
 * Utility hook to check if viewport is mobile sized
 * @returns Boolean indicating if screen is mobile sized
 */
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${breakpoints.md})`);
}

/**
 * Utility hook to check if viewport is tablet sized
 * @returns Boolean indicating if screen is tablet sized
 */
export function useIsTablet(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`);
}

/**
 * Utility hook to check if viewport is desktop sized
 * @returns Boolean indicating if screen is desktop sized
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.lg})`);
}
