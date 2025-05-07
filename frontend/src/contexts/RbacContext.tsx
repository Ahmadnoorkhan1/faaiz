import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from '../utils/AuthContext';
import { get } from '../service/apiService';

interface RbacContextType {
  permissions: string[];
  roles: string[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
  refetchPermissions: () => Promise<void>;
}

const RbacContext = createContext<RbacContextType | null>(null);

export const RbacProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetched, setLastFetched] = useState(0);

  const fetchPermissions = async () => {
    // Don't refetch if we fetched within the last minute, unless forced
    const now = Date.now();
    if (now - lastFetched < 60000 && lastFetched !== 0) {
      return;
    }

    if (!user?.id) {
      setPermissions([]);
      setRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const [permissionsResponse, rolesResponse] = await Promise.all([
        get(`/api/roles/users/${user.id}/permissions`),
        get(`/api/roles/users/${user.id}/roles`)
      ]) as any;

      // Check if data exists and is an array before mapping
      const permsList = Array.isArray(permissionsResponse?.data) 
        ? permissionsResponse.data.map((p: any) => p.name) 
        : [];
      
      const rolesList = Array.isArray(rolesResponse?.data) 
        ? rolesResponse.data.map((r: any) => r.name) 
        : [];

      setPermissions(permsList);
      setRoles(rolesList);
      setLastFetched(now);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      setPermissions([]);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount or when user changes
  useEffect(() => {
    fetchPermissions();
  }, [user?.id]);

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    return roles.includes(role);
  };

  return (
    <RbacContext.Provider value={{
      permissions,
      roles,
      hasPermission,
      hasRole,
      loading,
      refetchPermissions: fetchPermissions
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