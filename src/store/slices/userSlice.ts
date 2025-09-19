import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { loginSuccess, verify2FASuccess, logout } from './authSlice'
import type { LoginResponse } from '@/types/auth'
import type { User, SecurityStatus } from '@/types/auth'

interface UserState {
  profile: User | null;
  
  isProfileComplete: boolean;
  lastUpdated: string | null;
  
  securityStatus: SecurityStatus | null;
  securityRecommendations: string[];
  
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isProfileComplete: false,
  lastUpdated: null,
  securityStatus: null,
  securityRecommendations: [],
  isLoading: false,
  error: null,
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<User>) => {
      state.profile = action.payload
      state.isProfileComplete = action.payload.full_profile_complete
      state.securityStatus = action.payload.security_status
      state.securityRecommendations = action.payload.security_recommendations || []
      state.lastUpdated = new Date().toISOString()
      state.error = null
    },
    
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.profile) {
        state.profile = { 
          ...state.profile, 
          ...action.payload 
        }
        state.lastUpdated = new Date().toISOString()
      }
    },
    
    updateSecurityStatus: (state, action: PayloadAction<SecurityStatus>) => {
      state.securityStatus = action.payload
      if (state.profile) {
        state.profile.security_status = action.payload
      }
    },
    
    addSecurityRecommendation: (state, action: PayloadAction<string>) => {
      if (!state.securityRecommendations.includes(action.payload)) {
        state.securityRecommendations.push(action.payload)
      }
    },
    
    removeSecurityRecommendation: (state, action: PayloadAction<string>) => {
      state.securityRecommendations = state.securityRecommendations.filter(
        recommendation => recommendation !== action.payload
      )
    },
    
    clearSecurityRecommendations: (state) => {
      state.securityRecommendations = []
    },
    
    setProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    
    setProfileError: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    
    clearUserProfile: (state) => {
      state.profile = null
      state.isProfileComplete = false
      state.lastUpdated = null
      state.securityStatus = null
      state.securityRecommendations = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginSuccess, (state, action: PayloadAction<LoginResponse>) => {
        if (action.payload.user && !action.payload.requires_2fa) {
          const user = action.payload.user
          state.profile = user
          state.isProfileComplete = user?.full_profile_complete || false
          state.securityStatus = user?.security_status || null
          state.securityRecommendations = user?.security_recommendations || []
          state.lastUpdated = new Date().toISOString()
          state.error = null
        } 
        else if (action.payload.requires_2fa) {
          state.profile = {
            ...state.profile,
            id: action.payload.user_id,
            corporate_email: action.payload.corporate_email
          }
        }
      })
      .addCase(verify2FASuccess, (state, action: PayloadAction<LoginResponse>) => {
        if (action.payload.user) {
          const user = action.payload.user
          state.profile = user
          state.isProfileComplete = user?.full_profile_complete || false
          state.securityStatus = user?.security_status || null
          state.securityRecommendations = user?.security_recommendations || []
          state.lastUpdated = new Date().toISOString()
          state.error = null
        }
      })
            .addCase(logout, (state) => {
        state.profile = null
        state.isProfileComplete = false
        state.lastUpdated = null
        state.securityStatus = null
        state.securityRecommendations = []
        state.error = null
      })
  },
})

export const {
  setUserProfile,
  updateUserProfile,
  updateSecurityStatus,
  addSecurityRecommendation,
  removeSecurityRecommendation,
  clearSecurityRecommendations,
  setProfileLoading,
  setProfileError,
  clearUserProfile,
} = userSlice.actions

export default userSlice.reducer

export const selectUserProfile = (state: { user: UserState }) => state.user.profile

export const selectUserFullName = (state: { user: UserState }) => state.user.profile?.full_name

export const selectUserRole = (state: { user: UserState }) => ({
  role: state.user.profile?.role,
  roleDisplay: state.user.profile?.role_display
})

export const selectUserPermissions = (state: { user: UserState }) => state.user.profile?.permissions

export const selectSecurityStatus = (state: { user: UserState }) => state.user.securityStatus

export const selectSecurityScore = (state: { user: UserState }) => state.user.securityStatus?.security_score || 0

export const selectIs2FAEnabled = (state: { user: UserState }) => 
  state.user.securityStatus?.["2fa_enabled"] || false

export const selectSecurityRecommendations = (state: { user: UserState }) => 
  state.user.securityRecommendations

export const selectIsAdmin = (state: { user: UserState }) => {
  const permissions = state.user.profile?.permissions
  return permissions ? 
    (permissions.can_manage_users || permissions.can_access_admin_panel) : false
}

export const selectIsProfileComplete = (state: { user: UserState }) => state.user.isProfileComplete

export const selectIsProfileLoading = (state: { user: UserState }) => state.user.isLoading

export const selectLastLoginTime = (state: { user: UserState }) => state.user.profile?.last_login
export const selectLastLoginFormatted = (state: { user: UserState }) => state.user.profile?.last_login_formatted
export const selectLastLoginIP = (state: { user: UserState }) => state.user.profile?.last_login_ip
export const selectAccountAge = (state: { user: UserState }) => state.user.profile?.account_age_days
export const selectDepartment = (state: { user: UserState }) => state.user.profile?.department
export const selectCompanyDomain = (state: { user: UserState }) => state.user.profile?.company_domain
