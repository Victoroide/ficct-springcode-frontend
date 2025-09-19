/**
 * Security Slice
 * Manages security-related state independently from user and auth state
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { SecurityFeature, SecurityImprovementStep, SecurityScoreDetails } from '@/types/user'

export interface SecurityState {
  twoFactorEnabled: boolean;
  backupCodesCount: number;
  securityScore: number;
  securityFeatures: SecurityFeature[];
  recommendations: string[];
  pendingActions: SecurityImprovementStep[];
  wizardActive: boolean;
  wizardCurrentStep: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SecurityState = {
  twoFactorEnabled: false,
  backupCodesCount: 0,
  securityScore: 0,
  securityFeatures: [],
  recommendations: [],
  pendingActions: [],
  wizardActive: false,
  wizardCurrentStep: null,
  isLoading: false,
  error: null
}

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    /**
     * Set security score details
     */
    setSecurityScore: (state, action: PayloadAction<SecurityScoreDetails>) => {
      state.securityScore = action.payload.score;
      state.securityFeatures = action.payload.features;
      state.recommendations = action.payload.recommendations;
      state.error = null;
    },

    /**
     * Update security feature status
     */
    updateSecurityFeature: (state, action: PayloadAction<{ name: string; enabled: boolean }>) => {
      const { name, enabled } = action.payload;
      const featureIndex = state.securityFeatures.findIndex(feature => feature.name === name);
      
      if (featureIndex !== -1) {
        state.securityFeatures[featureIndex].enabled = enabled;
        
        // Update 2FA status if the feature is 2FA
        if (name === '2fa_enabled') {
          state.twoFactorEnabled = enabled;
        }
      }
    },

    /**
     * Set backup codes count
     */
    setBackupCodesCount: (state, action: PayloadAction<number>) => {
      state.backupCodesCount = action.payload;
    },

    /**
     * Set security improvement steps
     */
    setSecurityImprovementSteps: (state, action: PayloadAction<SecurityImprovementStep[]>) => {
      state.pendingActions = action.payload;
    },

    /**
     * Start security wizard
     */
    startSecurityWizard: (state, action: PayloadAction<string | undefined>) => {
      state.wizardActive = true;
      state.wizardCurrentStep = action.payload || 
        (state.pendingActions.length > 0 ? state.pendingActions[0].id : null);
    },

    /**
     * Set current wizard step
     */
    setWizardStep: (state, action: PayloadAction<string>) => {
      state.wizardCurrentStep = action.payload;
    },

    /**
     * Complete wizard step
     */
    completeWizardStep: (state, action: PayloadAction<string>) => {
      const stepIndex = state.pendingActions.findIndex(step => step.id === action.payload);
      if (stepIndex !== -1) {
        state.pendingActions[stepIndex].completed = true;
        
        // Move to next step if available
        const nextStep = state.pendingActions.find(step => !step.completed);
        if (nextStep) {
          state.wizardCurrentStep = nextStep.id;
        } else {
          // All steps completed
          state.wizardActive = false;
          state.wizardCurrentStep = null;
        }
      }
    },

    /**
     * End security wizard
     */
    endSecurityWizard: (state) => {
      state.wizardActive = false;
      state.wizardCurrentStep = null;
    },

    /**
     * Set loading state
     */
    setSecurityLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    /**
     * Set error state
     */
    setSecurityError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    /**
     * Clear error state
     */
    clearSecurityError: (state) => {
      state.error = null;
    },
  },
})

export const {
  setSecurityScore,
  updateSecurityFeature,
  setBackupCodesCount,
  setSecurityImprovementSteps,
  startSecurityWizard,
  setWizardStep,
  completeWizardStep,
  endSecurityWizard,
  setSecurityLoading,
  setSecurityError,
  clearSecurityError,
} = securitySlice.actions

export default securitySlice.reducer

/**
 * Selectors
 */

// Select security score
export const selectSecurityScore = (state: { security: SecurityState }) => state.security.securityScore

// Select if 2FA is enabled
export const selectIs2FAEnabled = (state: { security: SecurityState }) => state.security.twoFactorEnabled

// Select backup codes count
export const selectBackupCodesCount = (state: { security: SecurityState }) => state.security.backupCodesCount

// Select security features
export const selectSecurityFeatures = (state: { security: SecurityState }) => state.security.securityFeatures

// Select security recommendations
export const selectSecurityRecommendations = (state: { security: SecurityState }) => state.security.recommendations

// Select pending security actions
export const selectPendingSecurityActions = (state: { security: SecurityState }) => state.security.pendingActions

// Select security wizard state
export const selectSecurityWizardActive = (state: { security: SecurityState }) => state.security.wizardActive

// Select current wizard step
export const selectCurrentWizardStep = (state: { security: SecurityState }) => {
  const stepId = state.security.wizardCurrentStep;
  if (stepId) {
    return state.security.pendingActions.find(step => step.id === stepId);
  }
  return null;
}

// Select loading state
export const selectSecurityLoading = (state: { security: SecurityState }) => state.security.isLoading

// Select error state
export const selectSecurityError = (state: { security: SecurityState }) => state.security.error
