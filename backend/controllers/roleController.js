import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all roles
 * @route GET /api/roles
 * @access Private/Admin
 */
export const getAllRoles = async (req, res, next) => {
  try {
    const roles = await prisma.roleDefinition.findMany({
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new role
 * @route POST /api/roles
 * @access Private/Admin
 */
export const createRole = async (req, res, next) => {
  try {
    const { name, description, permissionIds } = req.body;
    
    // Check if role with same name already exists
    const existingRole = await prisma.roleDefinition.findUnique({
      where: { name }
    });
    
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role with this name already exists'
      });
    }
    
    // Create role and assign permissions
    const role = await prisma.$transaction(async (prisma) => {
      // Create the role
      const newRole = await prisma.roleDefinition.create({
        data: {
          name,
          description
        }
      });
      
      // Assign permissions if provided
      if (permissionIds && permissionIds.length > 0) {
        await Promise.all(
          permissionIds.map(permissionId => 
            prisma.rolePermission.create({
              data: {
                roleId: newRole.id,
                permissionId
              }
            })
          )
        );
      }
      
      // Return the created role with permissions
      return prisma.roleDefinition.findUnique({
        where: { id: newRole.id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });
    });
    
    res.status(201).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a role to a user
 * @route POST /api/users/:id/roles
 * @access Private/Admin
 */
export const assignRoleToUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;
    
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
    
    // Check if role exists
    const role = await prisma.roleDefinition.findUnique({
      where: { id: roleId }
    });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if user already has this role
    const existingAssignment = await prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
    
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'User already has this role assigned'
      });
    }
    
    // Assign role to user
    const userRole = await prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId
      }
    });
    
    res.status(201).json({
      success: true,
      data: userRole
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user roles
 * @route GET /api/users/:id/roles
 * @access Private/Admin
 */
export const getUserRoles = async (req, res, next) => {
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
    
    // Get user roles with permissions
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: { userId },
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
    
    res.status(200).json({
      success: true,
      count: userRoles.length,
      data: userRoles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove role from user
 * @route DELETE /api/users/:userId/roles/:roleId
 * @access Private/Admin
 */
export const removeRoleFromUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.params;
    
    // Check if assignment exists
    const assignment = await prisma.userRoleAssignment.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Role assignment not found'
      });
    }
    
    // Remove role from user
    await prisma.userRoleAssignment.delete({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Role removed from user successfully'
    });
  } catch (error) {
    next(error);
  }
}; 