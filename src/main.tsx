import React from 'react'
import { initializeUserData, setupUserDataRefresh } from './config/userDataInitializer'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

initializeUserData()
setupUserDataRefresh()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
