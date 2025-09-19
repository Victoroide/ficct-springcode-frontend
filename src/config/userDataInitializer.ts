/**
 * User Data Initializer
 * Handles fetching and updating user data on application startup
 */
// @ts-nocheck
import { store } from '@/store';
import { authApi } from '@/store/api/authApi';
import { setUserProfile } from '@/store/slices/userSlice';
import { getStoredUserProfile, getStoredSecurityContext, getStoredSecurityRecommendations } from '@/services/sessionService';

/**
 * Initialize user data by checking local storage and making API calls if needed
 */
export const initializeUserData = () => {
  // Check if user is authenticated
  const { auth } = store.getState();
  
  if (!auth.isAuthenticated) {
    return false;
  }
  
  try {
    // Get stored profile data and immediately populate store
    const storedProfile = getStoredUserProfile();
    const securityContext = getStoredSecurityContext();
    
    if (storedProfile) {
      // Combine data to create a complete user profile
      const fullProfile = {
        ...storedProfile,
        security_status: securityContext || {},
        security_recommendations: getStoredSecurityRecommendations() || []
      };
      
      // Update Redux store with stored data immediately
      store.dispatch(setUserProfile(fullProfile));
      
      // After hydrating from localStorage, trigger a fresh API fetch in the background
      store.dispatch(authApi.endpoints.getUser.initiate());
      
      return true;
    }
  } catch (error) {
    console.error('Error initializing user data from localStorage:', error);
  }
  
  // If we don't have stored data, trigger API fetch
  store.dispatch(authApi.endpoints.getUser.initiate());
  return false;
};

/**
 * Setup background refresh for user data
 */
export const setupUserDataRefresh = () => {
  // Set up periodic refresh
  const refreshInterval = setInterval(() => {
    const { auth } = store.getState();
    if (auth.isAuthenticated) {
      store.dispatch(authApi.endpoints.getUser.initiate());
    } else {
      clearInterval(refreshInterval);
    }
  }, 300000); // 5 minutes

  return refreshInterval;
};
