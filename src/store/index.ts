import { configureStore } from '@reduxjs/toolkit'
import { umlApi } from './api/umlApi'
import { collaborationApi } from './api/collaborationApi'
import { generationApi } from './api/generationApi'
import uiReducer from './slices/uiSlice'

// Define root reducer first for type inference
const rootReducer = {
  ui: uiReducer,
  [umlApi.reducerPath]: umlApi.reducer,
  [collaborationApi.reducerPath]: collaborationApi.reducer,
  [generationApi.reducerPath]: generationApi.reducer,
};

// Simplified store for anonymous UML tool
export const store = configureStore({
  reducer: rootReducer,
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

// Define RootState type manually to avoid inference issues
export type RootState = {
  ui: ReturnType<typeof uiReducer>;
  [umlApi.reducerPath]: ReturnType<typeof umlApi.reducer>;
  [collaborationApi.reducerPath]: ReturnType<typeof collaborationApi.reducer>;
  [generationApi.reducerPath]: ReturnType<typeof generationApi.reducer>;
}
export type AppDispatch = typeof store.dispatch

// Export store for compatibility
export { store as default }
