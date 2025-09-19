import type { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/hooks/redux';
import { selectUserPermissions } from '@/store/slices/userSlice';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'DEVELOPER' | 'ANALYST';
  requiredPermissions?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  requiredPermissions,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, requires2FA } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const userRole = useAppSelector((state) => state.user.profile?.role);
  const userPermissions = useAppSelector(selectUserPermissions);

  if (isAuthenticated && requires2FA && location.pathname !== '/verify-2fa') {
    return <Navigate to="/verify-2fa" state={{ from: location.pathname }} replace />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermissions && requiredPermissions.length > 0 && userPermissions) {
    const hasAllPermissions = requiredPermissions.every(
      (permission) => userPermissions[permission as keyof typeof userPermissions]
    );

    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export const AdminRoute: FC<Omit<ProtectedRouteProps, 'requiredRole'>> = (props) => {
  return (
    <ProtectedRoute
      {...props}
      requiredPermissions={['can_access_admin_panel']}
      redirectTo="/unauthorized"
    />
  );
};

export const PublicOnlyRoute: FC<Omit<ProtectedRouteProps, 'requireAuth'>> = ({
  children,
  redirectTo = '/dashboard',
  ...rest
}) => {
  const { isAuthenticated, requires2FA } = useAppSelector((state) => state.auth);
  
  if (isAuthenticated && !requires2FA) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <ProtectedRoute {...rest} requireAuth={false}>{children}</ProtectedRoute>;
};

export default ProtectedRoute;
