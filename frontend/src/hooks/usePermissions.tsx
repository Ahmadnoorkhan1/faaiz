import { useRbac } from '../contexts/RbacContext';

/**
 * Custom hook for checking user permissions and roles
 * @returns Permission and role checking utilities
 */
export const usePermissions = () => {
  const { hasPermission, hasRole, permissions, roles, loading } = useRbac();
  
  /**
   * Check if user has any of the given permissions
   * @param requiredPermissions - List of permissions to check
   * @returns true if user has any of the permissions
   */
  const hasAnyPermission = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.some(permission => hasPermission(permission));
  };

  /**
   * Check if user has all of the given permissions
   * @param requiredPermissions - List of permissions to check
   * @returns true if user has all the permissions
   */
  const hasAllPermissions = (requiredPermissions: string[]): boolean => {
    return requiredPermissions.every(permission => hasPermission(permission));
  };

  /**
   * Check if user has any of the given roles
   * @param requiredRoles - List of roles to check
   * @returns true if user has any of the roles
   */
  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => hasRole(role));
  };

  return {
    hasPermission,     // Check a single permission
    hasRole,           // Check a single role
    hasAnyPermission,  // Check if any permission in a list is granted
    hasAllPermissions, // Check if all permissions in a list are granted
    hasAnyRole,        // Check if any role in a list is granted
    permissions,       // List of all user permissions
    roles,             // List of all user roles
    isLoading: loading // Loading state
  };
};