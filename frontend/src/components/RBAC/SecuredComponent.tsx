import React from 'react';
import { useRbacAccess } from '../../hooks/useRbacAccess';

interface SecuredComponentProps {
  requiredPermissions?: string[];
  allowedRoles?: string[];
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  waitForPermissions?: boolean;
  children: React.ReactNode;
}

export const SecuredComponent: React.FC<SecuredComponentProps> = ({
  requiredPermissions,
  allowedRoles,
  fallback = null,
  loadingComponent = null,
  waitForPermissions = true,
  children
}) => {
  const { hasAccess, isLoading } = useRbacAccess({
    requiredPermissions,
    allowedRoles,
    waitForPermissions
  });

  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};