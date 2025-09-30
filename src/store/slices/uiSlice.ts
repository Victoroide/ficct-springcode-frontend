import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

interface CommandProcessingState {
  isProcessing: boolean
  isRecording: boolean
  recommendations: UMLRecommendation[]
  currentCommand: string
  commandHistory: CommandHistoryEntry[]
  previewMode: boolean
  rateLimitInfo: {
    remaining: number
    resetTime: number
  }
}

interface UMLRecommendation {
  id: string
  type: 'class' | 'relationship' | 'attribute' | 'method'
  element: any
  preview?: any
  accepted: boolean
}

interface CommandHistoryEntry {
  id: string
  command: string
  timestamp: number // Use timestamp instead of Date for serialization
  success: boolean
  elementsGenerated: number
  errorMessage?: string
  processingTime?: number
}

interface UIState {
  currentPage: string
  redirectPath: string | null
  notifications: Notification[]
  isLoading: {
    login: boolean
    registration: boolean
    global: boolean
  }
  modals: {
    logout: boolean
    revokeAllSessions: boolean
  }
  commandProcessing: CommandProcessingState
}

const initialState: UIState = {
  currentPage: 'login',
  redirectPath: null,
  notifications: [],
  isLoading: {
    login: false,
    registration: false,
    global: false,
  },
  modals: {
    logout: false,
    revokeAllSessions: false,
  },
  commandProcessing: {
    isProcessing: false,
    isRecording: false,
    recommendations: [],
    currentCommand: '',
    commandHistory: [],
    previewMode: false,
    rateLimitInfo: {
      remaining: 30,
      resetTime: Date.now() + 3600000 // 1 hour from now
    }
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload
    },
    setRedirectPath: (state, action: PayloadAction<string | null>) => {
      state.redirectPath = action.payload
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: uuidv4(), // Usar UUID para evitar duplicados
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      )
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
    setLoading: (state, action: PayloadAction<{ 
      key: keyof UIState['isLoading']
      value: boolean 
    }>) => {
      state.isLoading[action.payload.key] = action.payload.value
    },
    setModal: (state, action: PayloadAction<{
      modal: keyof UIState['modals']
      open: boolean
    }>) => {
      state.modals[action.payload.modal] = action.payload.open
    },
    // Command Processing Actions
    setCommandProcessing: (state, action: PayloadAction<boolean>) => {
      state.commandProcessing.isProcessing = action.payload
    },
    setVoiceRecording: (state, action: PayloadAction<boolean>) => {
      state.commandProcessing.isRecording = action.payload
    },
    setCurrentCommand: (state, action: PayloadAction<string>) => {
      state.commandProcessing.currentCommand = action.payload
    },
    setRecommendations: (state, action: PayloadAction<UMLRecommendation[]>) => {
      state.commandProcessing.recommendations = action.payload
    },
    updateRecommendation: (state, action: PayloadAction<{ id: string; updates: Partial<UMLRecommendation> }>) => {
      const { id, updates } = action.payload
      const recommendation = state.commandProcessing.recommendations.find(r => r.id === id)
      if (recommendation) {
        Object.assign(recommendation, updates)
      }
    },
    addToCommandHistory: (state, action: PayloadAction<Omit<CommandHistoryEntry, 'id' | 'timestamp'>>) => {
      const entry: CommandHistoryEntry = {
        ...action.payload,
        id: uuidv4(),
        timestamp: Date.now() // Use numeric timestamp for serialization
      }
      state.commandProcessing.commandHistory.unshift(entry)
      // Keep only last 50 entries
      if (state.commandProcessing.commandHistory.length > 50) {
        state.commandProcessing.commandHistory = state.commandProcessing.commandHistory.slice(0, 50)
      }
    },
    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.commandProcessing.previewMode = action.payload
    },
    updateRateLimitInfo: (state, action: PayloadAction<{ remaining: number; resetTime: number }>) => {
      state.commandProcessing.rateLimitInfo = action.payload
    },
    clearRecommendations: (state) => {
      state.commandProcessing.recommendations = []
    },
    acceptRecommendation: (state, action: PayloadAction<string>) => {
      const recommendation = state.commandProcessing.recommendations.find(r => r.id === action.payload)
      if (recommendation) {
        recommendation.accepted = true
      }
    },
  },
})

export const {
  setCurrentPage,
  setRedirectPath,
  addNotification,
  removeNotification,
  clearNotifications,
  setLoading,
  setModal,
  setCommandProcessing,
  setVoiceRecording,
  setCurrentCommand,
  setRecommendations,
  updateRecommendation,
  addToCommandHistory,
  setPreviewMode,
  updateRateLimitInfo,
  clearRecommendations,
  acceptRecommendation,
} = uiSlice.actions

export default uiSlice.reducer
