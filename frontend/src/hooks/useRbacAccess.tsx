import { useState, useEffect } from 'react';
import { useRbac } from '../contexts/RbacContext';

interface RbacAccessOptions {
  requiredPermissions?: string[];
  allowedRoles?: string[];
  waitForPermissions?: boolean;
}

export const useRbacAccess = (options: RbacAccessOptions = {}) => {
  const { 
    checkAccess, 
    isPermissionLoading,
    hasPermission,
    hasRole,
    roles
  } = useRbac();
  
  const [hasAccess, setHasAccess] = useState(false);
  const [checkComplete, setCheckComplete] = useState(!options.waitForPermissions);

  useEffect(() => {
    if (options.waitForPermissions && isPermissionLoading) {
      return;
    }

    const accessResult = checkAccess(
      options.requiredPermissions || null,
      options.allowedRoles || null
    );
    
    setHasAccess(accessResult);
    setCheckComplete(true);
  }, [
    options.requiredPermissions, 
    options.allowedRoles, 
    isPermissionLoading, 
    checkAccess
  ]);

  return {
    hasAccess,
    checkComplete,
    isLoading: options.waitForPermissions && isPermissionLoading,
    hasPermission,
    hasRole,
    isAdmin: roles.includes('ADMIN')
  };
};