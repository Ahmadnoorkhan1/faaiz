import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { UserRole } from '../hooks/useRoleBasedAccess';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  redirectPath = '/login',
}) => {
  const { user, loading, checkUserRole } = useAuth();

  // Still loading, show loading indicator or nothing
  if (loading) {
    return <div>Loading...</div>;
  }

  // Not authenticated
  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  // Check role if roles are specified
  if (allowedRoles.length > 0 && !checkUserRole(allowedRoles)) {
    // Redirect to unauthorized page or dashboard with limited access
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
};

export default ProtectedRoute;
