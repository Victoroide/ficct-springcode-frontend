import React, { useEffect, useState } from 'react'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { store } from './store'
import { useGetUserQuery } from './store/api/authApi'
import { setUserProfile } from './store/slices/userSlice'
import { loginSuccess } from './store/slices/authSlice'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RegistrationPage } from './pages/RegistrationPage'
import { ToastContainer } from './components/ui/toast'
import { ErrorBoundary } from './components/ui/error-boundary'
import { useAppSelector, useAppDispatch } from './hooks/redux'
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from './components/auth/ProtectedRoute'
import { isTokenExpired, getTokens } from './services/tokenService'
import { setupGlobalErrorHandlers } from './services/errorService'
import { getStoredUserProfile, getStoredSecurityContext } from './services/sessionService'

const AppContent: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, requires2FA, user } = useAppSelector((state) => state.auth);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { data: userData, isLoading: isUserLoading, error: userError } = useGetUserQuery(undefined, { 
    skip: !isAuthenticated || !isInitialized,
    refetchOnFocus: true,
    pollingInterval: 300000
  });
  
  useEffect(() => {
    setupGlobalErrorHandlers();
  }, []);
  
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const tokens = getTokens();
        const storedUser = getStoredUserProfile();
        const securityContext = getStoredSecurityContext();
        
        if (tokens.accessToken && !isTokenExpired() && storedUser && !user) {
          
          const restoredUser = {
            ...storedUser,
            security_status: securityContext?.security_status || storedUser.security_status,
            lastAuthenticated: tokens.expiresAt ? new Date(tokens.expiresAt - 3600000).toISOString() : new Date().toISOString()
          };
          
          dispatch(loginSuccess({
            success: true,
            requires_2fa: false,
            user: restoredUser,
            tokens: {
              access_token: tokens.accessToken,
              refresh_token: tokens.refreshToken,
              expires_in: tokens.expiresAt ? Math.floor((tokens.expiresAt - Date.now()) / 1000) : 3600,
              token_type: tokens.tokenType || 'Bearer'
            }
          }));
          
          dispatch(setUserProfile(restoredUser));
        }
      } catch (error) {
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeUserData();
  }, [dispatch, user]);

  useEffect(() => {
    if (userData?.user && isAuthenticated && isInitialized) {
      dispatch(setUserProfile(userData.user));
    }
  }, [userData, dispatch, isAuthenticated, isInitialized]);

  useEffect(() => {
    const tokenCheckInterval = setInterval(() => {
      if (isAuthenticated && isTokenExpired()) {
      }
    }, 60000);
    
    return () => clearInterval(tokenCheckInterval);
  }, [isAuthenticated])
  
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
          <p className="text-slate-700">Cargando datos de usuario...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          } />
          
          <Route path="/register" element={
            <PublicOnlyRoute>
              <RegistrationPage />
            </PublicOnlyRoute>
          } />
          
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <ErrorBoundary>
                <DashboardPage />
              </ErrorBoundary>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <AdminRoute>
              <ErrorBoundary>
                <div>Admin Panel</div>
              </ErrorBoundary>
            </AdminRoute>
          } />
          
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <ToastContainer />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
          <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <div className="text-center">
              <h2 className="text-xl font-bold text-red-600 mb-2">Error Crítico</h2>
              <p className="text-slate-700 mb-4">
                Lo sentimos, ha ocurrido un error inesperado en la aplicación.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Recargar Aplicación
              </button>
            </div>
          </div>
        </div>
      }
    >
      <Provider store={store}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
