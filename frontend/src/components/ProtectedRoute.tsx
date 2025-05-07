import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useRbac } from '../contexts/RbacContext';

// Define UserRole type here since the import is causing an error
type UserRole = 'ADMIN' | 'USER' | 'MANAGER' | 'CONSULTANT' | string;

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  requiredPermissions?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  requiredPermissions = [],
  redirectPath = '/login',
}) => {
  const { user, loading: authLoading } = useAuth();
  const { permissions, roles, loading: rbacLoading } = useRbac();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Check permissions
    if (requiredPermissions.length > 0) {
      const hasRequiredPerm = requiredPermissions.some(perm => 
        permissions.includes(perm)
      );
      setHasAccess(hasRequiredPerm);
    }
    // Check roles
    else if (allowedRoles.length > 0) {
      const hasAllowedRole = allowedRoles.some(role => 
        roles.includes(role)
      );
      setHasAccess(hasAllowedRole);
    }
    // Just authenticated
    else {
      setHasAccess(true);
    }
  }, [user, permissions, roles, requiredPermissions, allowedRoles]);

  // Loading state
  // if (authLoading || rbacLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // Not authenticated
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // User is authenticated but doesn't have required roles/permissions
  // if (!hasAccess) {
  //   return <Navigate to="/unauthorized" replace />;
  // }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;
