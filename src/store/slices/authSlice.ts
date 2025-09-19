import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthState, LoginResponse, TokensData, User } from '@/types/auth'
import { getTokens, removeTokens, saveTokens } from '@/services/tokenService'
import { normalizeTokensResponse } from '@/utils/authUtils'

const storedTokens = getTokens()

const initialState: AuthState = {
  isAuthenticated: !!storedTokens.accessToken,
  user: null,
  tokens: {
    accessToken: storedTokens.accessToken,
    refreshToken: storedTokens.refreshToken,
    expiresAt: storedTokens.expiresAt,
    tokenType: storedTokens.tokenType
  },
  requires2FA: false,
  isLoading: false,
  error: null,
  lastAuthenticated: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
      const { success, requires_2fa, message, tokens, user, user_id, corporate_email } = action.payload
      
      state.isLoading = false
      state.error = null
      
      if (requires_2fa) {
        state.isAuthenticated = false
        state.requires2FA = true
        
        state.user = {
          id: user_id,
          corporate_email: corporate_email,
          ...state.user
        }
        
      } else if (tokens || action.payload.access_token) {
        const normalizedTokens = normalizeTokensResponse(action.payload);
        
        saveTokens(normalizedTokens);
              
        state.isAuthenticated = true
        state.user = user
        state.tokens = {
          accessToken: normalizedTokens.access_token,
          refreshToken: normalizedTokens.refresh_token,
          expiresAt: Date.now() + (normalizedTokens.expires_in * 1000),
          tokenType: normalizedTokens.token_type || 'Bearer'
        }
        state.requires2FA = false
        state.lastAuthenticated = new Date().toISOString()
      } else {
        state.isAuthenticated = false
      }
    },
    
    verify2FASuccess: (state, action: PayloadAction<any>) => {
      const { user } = action.payload
      
      // Normalizar la estructura de tokens para manejar diferentes formatos
      const normalizedTokens = normalizeTokensResponse(action.payload);
      
      // Save tokens to localStorage
      saveTokens(normalizedTokens);
            
      state.isLoading = false
      state.isAuthenticated = true
      state.user = user
      state.tokens = {
        accessToken: normalizedTokens.access_token,
        refreshToken: normalizedTokens.refresh_token,
        expiresAt: Date.now() + (normalizedTokens.expires_in * 1000),
        tokenType: normalizedTokens.token_type || 'Bearer'
      }
      state.requires2FA = false
      state.lastAuthenticated = new Date().toISOString()
      state.error = null
    },
    
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.isAuthenticated = false
      state.user = null
      state.tokens = {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        tokenType: null
      }
      state.requires2FA = false
      state.error = action.payload
      
      // Clear tokens from localStorage
      removeTokens();
          },
    
    logout: (state) => {
      state.isAuthenticated = false
      state.user = null
      state.tokens = {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        tokenType: null
      }
      state.requires2FA = false
      state.isLoading = false
      state.error = null
      state.lastAuthenticated = null
      
      // Clear tokens from localStorage
      removeTokens();
          },
    
    refreshTokens: (state, action: PayloadAction<TokensData>) => {
      const { access_token, refresh_token, expires_in, token_type } = action.payload
      
      saveTokens(action.payload)
      
      state.tokens = {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: Date.now() + (expires_in * 1000),
        tokenType: token_type
      }
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    setRequires2FA: (state, action: PayloadAction<boolean>) => {
      state.requires2FA = action.payload
    },
    
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  verify2FASuccess,
  loginFailure,
  logout,
  refreshTokens,
  clearError,
  setRequires2FA,
  updateUserProfile,
} = authSlice.actions

export default authSlice.reducer
