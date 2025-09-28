import { configureStore } from '@reduxjs/toolkit'
import { umlApi } from './api/umlApi'
import { collaborationApi } from './api/collaborationApi'
import { generationApi } from './api/generationApi'
import uiReducer from './slices/uiSlice'

// Simplified store for anonymous UML tool
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    [umlApi.reducerPath]: umlApi.reducer,
    [collaborationApi.reducerPath]: collaborationApi.reducer,
    [generationApi.reducerPath]: generationApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    })
      .concat(umlApi.middleware)
      .concat(collaborationApi.middleware)
      .concat(generationApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Export store for compatibility
export { store as default }
