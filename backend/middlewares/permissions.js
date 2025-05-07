import prisma from '../config/prisma.js';

/**
 * Middleware to check if user has required permissions
 * @param {string} resource - Resource name (e.g., "projects", "users")
 * @param {string} action - Action type ("READ", "WRITE", "DELETE", "ADMIN")
 * @returns {Function} Middleware function
 */
export const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Skip check for admin users - they have all permissions
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Get user's assigned roles
      const userRoles = await prisma.userRoleAssignment.findMany({
        where: { userId: req.user.id },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      });

      // Check if user has the required permission through any of their roles
      const hasPermission = userRoles.some(userRole => 
        userRole.role.permissions.some(rolePermission => 
          rolePermission.permission.resource === resource && 
          (rolePermission.permission.type === action || rolePermission.permission.type === 'ADMIN')
        )
      );

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform this action.'
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};