import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useRbac } from '../contexts/RbacContext';

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
  const location = useLocation();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      return;
    }

    if (requiredPermissions.length > 0) {
      const hasPerm = requiredPermissions.some(perm => permissions.includes(perm));
      setHasAccess(hasPerm);
    } else if (allowedRoles.length > 0) {
      const hasRole = allowedRoles.some(role => roles.includes(role));
      setHasAccess(hasRole);
    } else {
      setHasAccess(true);
    }
  }, [user, permissions, roles, requiredPermissions, allowedRoles]);

  // ✅ Hooks must come first — return only after them
  if (authLoading || rbacLoading) {
    return null; // or <LoadingOverlay message="Checking permissions..." />
  }

  if (!user) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  if (!hasAccess) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
