import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all permissions
 * @route GET /api/permissions
 * @access Private/Admin
 */
export const getPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
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
      message: 'Server error while fetching permissions'
    });
  }
};

/**
 * Get available permissions structure
 * @route GET /api/permissions/available
 * @access Private/Admin
 */
export const getAvailablePermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { name: 'asc' }
      ]
    });
    
    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const resource = permission.resource;
      
      // Find if we already have a category for this resource
      let category = acc.find(cat => cat.name === resource);
      
      if (!category) {
        category = {
          name: resource,
          permission: []
        };
        acc.push(category);
      }
      
      // Add permission name to category
      category.permission.push(permission.name);
      
      return acc;
    }, []);
    
    return res.status(200).json({
      success: true,
      data: groupedPermissions
    });
  } catch (error) {
    console.error('Error getting available permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting available permissions'
    });
  }
};

/**
 * Create a new permission
 * @route POST /api/permissions
 * @access Private/Admin
 */
export const createPermission = async (req, res) => {
  try {
    const { name, description, resource, action } = req.body;
    
    if (!name || !resource || !action) {
      return res.status(400).json({
        success: false,
        message: 'Name, resource, and action are required'
      });
    }
    
    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name }
    });
    
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission with this name already exists'
      });
    }
    
    // Create the permission
    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        resource,
        action
      }
    });
    
    return res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating permission'
    });
  }
};

/**
 * Update a permission
 * @route PUT /api/permissions/:id
 * @access Private/Admin
 */
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, resource, action } = req.body;
    
    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    // Check if new name conflicts with another permission
    if (name && name !== existingPermission.name) {
      const nameConflict = await prisma.permission.findUnique({
        where: { name }
      });
      
      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'Permission with this name already exists'
        });
      }
    }
    
    // Update the permission
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(resource && { resource }),
        ...(action && { action })
      }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Permission updated successfully',
      data: updatedPermission
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating permission'
    });
  }
};

/**
 * Delete a permission
 * @route DELETE /api/permissions/:id
 * @access Private/Admin
 */
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    // Check if permission is being used in any roles
    const rolesUsingPermission = await prisma.roleDefinition.findMany({
      where: {
        permissions: {
          has: existingPermission.name
        }
      }
    });
    
    if (rolesUsingPermission.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete permission. It is currently assigned to ${rolesUsingPermission.length} role(s): ${rolesUsingPermission.map(r => r.name).join(', ')}`,
        data: {
          conflictingRoles: rolesUsingPermission.map(r => ({ id: r.id, name: r.name }))
        }
      });
    }
    
    // Delete the permission
    await prisma.permission.delete({
      where: { id }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting permission'
    });
  }
};

/**
 * Get all users with their roles
 * @route GET /api/permissions/users
 * @access Private/Admin
 */
/**
 * Get all users with their roles
 * @route GET /api/permissions/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
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
        clientProfile: {
          select: {
            fullName: true,
            organization: true
          }
        },
        consultantProfile: {
          select: {
            contactFirstName: true,
            contactLastName: true,
            // Remove 'organization' field which doesn't exist
            // Use 'organizationWebsite' instead which is in your schema
            organizationWebsite: true
          }
        }
      },
      orderBy: {
        email: 'asc'
      }
    });

    // Format the data for frontend consumption
    const formattedUsers = users.map(user => {
      let displayName = user.email.split('@')[0];
      let organization = '';
      
      if (user.clientProfile) {
        displayName = user.clientProfile.fullName;
        organization = user.clientProfile.organization || '';
      } else if (user.consultantProfile) {
        displayName = `${user.consultantProfile.contactFirstName} ${user.consultantProfile.contactLastName}`;
        // Use organizationWebsite instead of organization
        organization = user.consultantProfile.organizationWebsite || '';
      }

      return {
        id: user.id,
        email: user.email,
        displayName,
        role: user.role,
        organization,
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
 * @access Private/Admin
 */
export const getUserPermissions = async (req, res) => {
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
    
    // Get user roles
    const userRoles = await prisma.userRoleAssignment.findMany({
      where: { userId },
      include: {
        role: true
      }
    });
    
    // Extract all permissions from user roles
    const allPermissions = new Set();
    
    userRoles.forEach(userRole => {
      if (userRole.role.permissions) {
        userRole.role.permissions.forEach(permission => {
          allPermissions.add(permission);
        });
      }
    });
    
    // If user is admin, include all permissions
    if (user.role === 'ADMIN') {
      const allDbPermissions = await prisma.permission.findMany({
        select: { name: true }
      });
      
      allDbPermissions.forEach(p => allPermissions.add(p.name));
    }
    
    return res.status(200).json({
      success: true,
      count: allPermissions.size,
      data: Array.from(allPermissions)
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
 * @access Private/Admin
 */
export const updateUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;
    const { permissions } = req.body;
    
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: 'Permissions must be provided as an array'
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
    
    // Find or create a custom role for this user
    let customRole = await prisma.roleDefinition.findFirst({
      where: {
        name: `custom-${userId}`,
        users: {
          some: {
            userId
          }
        }
      }
    });
    
    // Create or update the custom role
    if (customRole) {
      customRole = await prisma.roleDefinition.update({
        where: { id: customRole.id },
        data: {
          permissions
        }
      });
    } else {
      // Create a new custom role for this user
      customRole = await prisma.roleDefinition.create({
        data: {
          name: `custom-${userId}`,
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
      message: 'User permissions updated successfully',
      data: customRole
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating user permissions'
    });
  }
};

/**
 * Clear user permissions
 * @route DELETE /api/permissions/users/:userId/permissions
 * @access Private/Admin
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
    const customRole = await prisma.roleDefinition.findFirst({
      where: {
        name: `custom-${userId}`,
        users: {
          some: {
            userId
          }
        }
      }
    });
    
    // Delete the role if it exists
    if (customRole) {
      await prisma.userRoleAssignment.deleteMany({
        where: { 
          userId,
          roleId: customRole.id
        }
      });
      
      await prisma.roleDefinition.delete({
        where: { id: customRole.id }
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'User permissions cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing user permissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while clearing user permissions'
    });
  }
};

/**
 * Get permission by ID
 * @route GET /api/permissions/:id
 * @access Private/Admin
 */
export const getPermissionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const permission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching permission'
    });
  }
};