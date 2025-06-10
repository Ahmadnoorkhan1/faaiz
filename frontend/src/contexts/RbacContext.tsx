import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '../utils/AuthContext';
import { get } from '../service/apiService';
import { getPermissionsByRole, permissions as allPermissions } from '../utils/permissions';

interface RbacContextType {
  permissions: string[];
  roles: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
  refetchPermissions: () => Promise<void>;
  checkAccess: (requiredPermissions: string[] | null, allowedRoles: string[] | null) => boolean;
  isPermissionLoading: boolean;
}

const RbacContext = createContext<RbacContextType | null>(null);

export const RbacProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPermissionLoading, setIsPermissionLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(0);
  const [useLocalPermissions, setUseLocalPermissions] = useState(true); // Always use local permissions
  const fetchPermissions = async () => {
    const now = Date.now();
    if (now - lastFetched < 60000 && lastFetched !== 0) {
      return;
    }

    if (!user?.id) {
      setPermissions([]);
      setRoles([]);
      setLoading(false);
      setIsPermissionLoading(false);
      return;
    }

    try {
      setLoading(true);
      setIsPermissionLoading(true);
      
      // Use dynamic permissions from backend API
      try {
        // Get permissions from backend
        const permissionsResponse = await get(`/api/permissions/users/${user.id}/permissions`);
        
        // Get roles from backend
        const rolesResponse = await get(`/api/roles/users/${user.id}/roles`);
        
        // Extract permissions array from response
        const permsList = permissionsResponse?.data?.data || [];
        
        // Extract roles array from response
        const rolesList = rolesResponse?.data?.data?.map((roleAssignment: any) => 
          roleAssignment.role.name
        ) || [];

        if (permsList.length > 0) {
          setPermissions(permsList);
          setRoles([user.role, ...rolesList]);
          setUseLocalPermissions(false);
          setLastFetched(now);
          console.log('Using dynamic permissions from backend:', permsList);
          return;
        } else {
          setUseLocalPermissions(true);
        }
      } catch (error) {
        console.warn('Error fetching permissions from backend, falling back to local permissions:', error);
        setUseLocalPermissions(true);
      }

      // Fallback to local permissions if API call fails
      console.log('Fallback: Using local permissions based on role', user.role);

      if (user?.role) {
        const userRole = user.role as "ADMIN" | "CONSULTANT" | "CLIENT";
        const localPermissions = getPermissionsByRole(userRole);
        
        setPermissions(localPermissions);
        setRoles([userRole]);
        setLastFetched(now);
      } else {
        setPermissions([]);
        setRoles([]);
      }
    } catch (error) {
      console.error('Error in permission handling:', error);
      setPermissions([]);
      setRoles([]);
    } finally {
      setLoading(false);
      setIsPermissionLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, [user?.id, user?.role]);

  const hasPermission = (permission: string) => {
    if (roles.includes('ADMIN')) return true;
    return permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    return roles.includes(role);
  };

  const checkAccess = (requiredPermissions: string[] | null, allowedRoles: string[] | null): boolean => {
    console.log("Checking access with:", { 
      requiredPermissions,
      allowedRoles, 
      userRoles: roles,
      userPermissions: permissions
    });

    if ((!requiredPermissions || requiredPermissions.length === 0) && 
        (!allowedRoles || allowedRoles.length === 0)) {
      console.log("No requirements specified, granting access");
      return true;
    }

    // Always grant access to ADMIN
    if (roles.includes('ADMIN')) {
      console.log("User is ADMIN, granting access");
      return true;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      for (const role of allowedRoles) {
        if (hasRole(role)) {
          console.log(`User has required role: ${role}, granting access`);
          return true;
        }
      }
    }

    if (requiredPermissions && requiredPermissions.length > 0) {
      for (const permission of requiredPermissions) {
        if (hasPermission(permission)) {
          console.log(`User has required permission: ${permission}, granting access`);
          return true;
        }
      }
      console.log("User does not have any required permissions, denying access");
      return false;
    }

    console.log("Access check failed, denying access");
    return false;
  };

  return (
    <RbacContext.Provider value={{
      permissions,
      roles,
      hasPermission,
      hasRole,
      loading,
      isPermissionLoading,
      refetchPermissions: fetchPermissions,
      checkAccess
    }}>
      {children}
    </RbacContext.Provider>
  );
};

export const useRbac = () => {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error('useRbac must be used within a RbacProvider');
  }
  return context;
};