import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { useRbacAccess } from '../../hooks/useRbacAccess';

interface SecuredRouteProps {
  requiredPermissions?: string[];
  allowedRoles?: string[];
  redirectPath?: string;
  fallbackComponent?: React.ReactNode;
}

export const SecuredRoute: React.FC<SecuredRouteProps> = ({
  requiredPermissions,
  allowedRoles,
  redirectPath = '/unauthorized',
  fallbackComponent
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasAccess, isLoading } = useRbacAccess({
    requiredPermissions,
    allowedRoles,
    waitForPermissions: true
  });

  console.log('SecuredRoute', {
    user,
    hasAccess,
    isLoading,
    requiredPermissions,
    allowedRoles
  }
  )

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f1117]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated but doesn't have required permissions
//   if (!hasAccess) {
//     if (fallbackComponent) {
//       return <>{fallbackComponent}</>;
//     }
//     return <Navigate to={redirectPath} replace />;
//   }

  // User has access
  return <Outlet />;
};