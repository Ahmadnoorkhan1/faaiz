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
      
      // Comment out API calls for permissions
      /* 
      try {
        const [permissionsResponse, rolesResponse] = await Promise.all([
          get(`/api/roles/users/${user.id}/permissions`),
          get(`/api/roles/users/${user.id}/roles`)
        ]) as any;

        const permsList = Array.isArray(permissionsResponse?.data) 
          ? permissionsResponse.data.map((p: any) => p.name) 
          : [];
        
        const rolesList = Array.isArray(rolesResponse?.data) 
          ? rolesResponse.data.map((r: any) => r.name) 
          : [];

        if (permsList.length > 0) {
          setPermissions(permsList);
          setRoles(rolesList);
          setUseLocalPermissions(false);
          setLastFetched(now);
          console.log('Using server-side permissions', permsList);
          return;
        } else {
          setUseLocalPermissions(true);
        }
      } catch (error) {
        console.warn('Error fetching permissions from backend, using local permissions:', error);
        setUseLocalPermissions(true);
      }
      */

      // Always use local permissions based on user role
console.log(user.role, "user role");

      if (user?.role) {
        const userRole = user.role as "ADMIN" | "CONSULTANT" | "CLIENT";
        const localPermissions = getPermissionsByRole(userRole);
        console.log('Using local permissions based on role', userRole, localPermissions);
        
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