import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import { 
  defaultPermissions,
  getAllPermissionNames,
  getDefaultPermissionsByRole
} from '../utils/permissions.js';

const prisma = new PrismaClient();




/**
 * Get all permissions
 * @route GET /api/permissions
 * @access Private (Admin only)
 */
export const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { name: 'asc' }
      ]
    });
    
    return res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching permissions'
    });
  }
};

/**
 * Get available permissions structure
 * @route GET /api/permissions/available
 * @access Private (Admin only)
 */
export const getAvailablePermissions = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: defaultPermissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching permissions'
    });
  }
};

/**
 * Get all users with their roles
 * @route GET /api/permissions/users
 * @access Private (Admin only)
 */
export const getAllUsers = async (req, res) => {
  try {
    // Get all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        userRoles: {
          include: {
            role: true
          }
        },
       
      },
      orderBy: {
        email: 'asc'
      }
    });

    // Format user data for the frontend
    const formattedUsers = users.map(user => {
      let displayName;
      
      if (user.clientProfile) {
        displayName = user.clientProfile.fullName;
      } else if (user.consultantProfile) {
        displayName = `${user.consultantProfile.contactFirstName} ${user.consultantProfile.contactLastName}`;
      } else {
        displayName = user.email.split('@')[0];
      }

      return {
        id: user.id,
        email: user.email,
        displayName,
        role: user.role,
        organization: user.clientProfile?.organization || user.consultantProfile?.organization || '',
        roles: user.userRoles?.map(ur => ur.role.name) || []
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedUsers.length,
      data: formattedUsers
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

/**
 * Get user permissions
 * @route GET /api/permissions/users/:userId/permissions
 * @access Private (Admin only)
 */
export const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's role assignments
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: { userId },
      include: {
        role: true
      }
    });

    let userPermissions = [];
    
    // If user has custom roles with permissions, use those
    if (userRoles.length > 0) {
      userPermissions = userRoles.reduce((allPermissions, userRole) => {
        if (userRole.role && Array.isArray(userRole.role.permissions)) {
          return [...allPermissions, ...userRole.role.permissions];
        }
        return allPermissions;
      }, []);
    }
    
    // If no permissions are found, use default permissions based on user role
    if (userPermissions.length === 0) {
      userPermissions = getDefaultPermissionsByRole(user.role);
    }

    // Remove duplicates
    userPermissions = [...new Set(userPermissions)];

    return res.status(200).json({
      success: true,
      count: userPermissions.length,
      data: userPermissions
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user permissions'
    });
  }
};

/**
 * Update user permissions
 * @route POST /api/permissions/users/:userId/update
 * @access Private (Admin only)
 */
export const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid permissions array'
      });
    }
    
    // Validate that all permissions are valid
    const allValidPermissions = getAllPermissionNames();
    const invalidPermissions = permissions.filter(p => !allValidPermissions.includes(p));
    
    if (invalidPermissions.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid permissions: ${invalidPermissions.join(', ')}`
      });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check for existing custom role for this user
    let userRole = await prisma.roleDefinition.findFirst({
      where: {
        name: `custom-role-${userId}`,
        users: {
          some: {
            userId
          }
        }
      }
    });
    
    // First, remove any existing role assignments for this user
    if (userRole) {
      // Update the existing role with new permissions
      userRole = await prisma.roleDefinition.update({
        where: { id: userRole.id },
        data: {
          permissions
        }
      });
    } else {
      // Create a new role with the provided permissions
      userRole = await prisma.roleDefinition.create({
        data: {
          name: `custom-role-${userId}`,
          description: `Custom permissions for ${user.email}`,
          permissions,
          users: {
            create: {
              userId
            }
          }
        }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      data: userRole
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating permissions'
    });
  }
};

/**
 * Clear user permissions
 * @route DELETE /api/permissions/users/:userId/permissions
 * @access Private (Admin only) 
 */
export const clearUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find custom role for this user
    const userRole = await prisma.roleDefinition.findFirst({
      where: {
        name: `custom-role-${userId}`,
        users: {
          some: {
            userId
          }
        }
      }
    });
    
    // If role exists, delete the role assignment
    if (userRole) {
      // Delete the role assignment
      await prisma.userRoleAssignment.deleteMany({
        where: {
          userId,
          roleId: userRole.id
        }
      });
      
      // Delete the role if no other users are using it
      const otherAssignments = await prisma.userRoleAssignment.findFirst({
        where: { roleId: userRole.id }
      });
      
      if (!otherAssignments) {
        await prisma.roleDefinition.delete({
          where: { id: userRole.id }
        });
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'User permissions cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing user permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing permissions'
    });
  }
};