import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
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
} = uiSlice.actions

export default uiSlice.reducer
