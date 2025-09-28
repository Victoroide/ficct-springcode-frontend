import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/landing/LandingPage'
import DiagramEditor from './components/editor/DiagramEditor'
import BrowsePage from './components/browse/BrowsePage'
import { CodeGeneratorPage } from './pages/CodeGeneratorPage'
import { ToastContainer } from './components/ui/toast'
import { ErrorBoundary } from './components/ui/error-boundary'
import { setupGlobalErrorHandlers } from './services/errorService'
import { anonymousSessionService } from './services/anonymousSessionService'

const App: React.FC = () => {
  useEffect(() => {
    // Initialize global error handlers
    setupGlobalErrorHandlers();
    
    // Initialize anonymous session
    anonymousSessionService.getOrCreateSession();
  }, []);

  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">Application Error</h2>
              <p className="text-slate-700 mb-4">
                Sorry, an unexpected error occurred in the application.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      }
    >
      <BrowserRouter>
        <Routes>
          {/* Landing Page - Main entry point */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Diagram Editor - Core functionality */}
          <Route path="/editor/:diagramId" element={<DiagramEditor />} />
          
          {/* Browse Public Diagrams */}
          <Route path="/browse" element={<BrowsePage />} />
          
          {/* Code Generator - Standalone for generated projects */}
          <Route path="/code-generator" element={<CodeGeneratorPage />} />
          <Route path="/code-generator/:requestId" element={<CodeGeneratorPage />} />
          
          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
