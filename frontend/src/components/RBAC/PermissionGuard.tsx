import React, { ReactNode } from 'react';
import { useRbac } from '../../contexts/RbacContext';

interface PermissionGuardProps {
  permissions?: string[];
  roles?: string[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Component that conditionally renders its children based on the user's permissions or roles
 * @param permissions - Array of required permissions (any one is sufficient)
 * @param roles - Array of required roles (any one is sufficient)
 * @param fallback - Content to show if user lacks permission
 * @param children - Content to show if user has permission
 */
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions = [],
  roles = [],
  fallback = null,
  children,
}) => {
  const { checkAccess } = useRbac();

  const hasAccess = checkAccess(
    permissions.length > 0 ? permissions : null,
    roles.length > 0 ? roles : null
  );

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
