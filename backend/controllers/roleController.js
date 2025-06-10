import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/** 
 * Get all roles  
 * @route GET /api/roles
 * @access Private/Admin
 */
export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.roleDefinition.findMany({
      include: {
        users: true
      }
    });
    
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching roles'
    });
  }
};

/**
 * Create a new role
 * @route POST /api/roles
 * @access Private/Admin
 */
export const createRole = async (req, res) => {
  try {
    const { name, description, permissions = [] } = req.body;
    
    // Validate name
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Role name is required'
      });
    }
    
    // Check if role already exists
    const existingRole = await prisma.roleDefinition.findUnique({
      where: { name }
    });
    
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'A role with this name already exists'
      });
    }
    
    // Create the role
    const newRole = await prisma.roleDefinition.create({
      data: {
        name,
        description,
        permissions
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: newRole
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating role'
    });
  }
};

/**
 * Get a role by ID
 * @route GET /api/roles/:id
 * @access Private/Admin
 */
export const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const role = await prisma.roleDefinition.findUnique({
      where: { id },
      include: {
        users: {
          include: {
            user: {
              select: {
                id: true,
                email: true
              }
            }
          }
        }
      }
    });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false, 
      message: 'Server error while fetching role'
    });
  }
};

/**
 * Update a role
 * @route PUT /api/roles/:id
 * @access Private/Admin
 */
export const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    // Check if role exists
    const role = await prisma.roleDefinition.findUnique({
      where: { id }
    });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if name is being changed and already exists
    if (name && name !== role.name) {
      const existingRole = await prisma.roleDefinition.findUnique({
        where: { name }
      });
      
      if (existingRole) {
        return res.status(400).json({
          success: false,
          message: 'A role with this name already exists'
        });
      }
    }
    
    // Update the role
    const updatedData = {};
    if (name) updatedData.name = name;
    if (description !== undefined) updatedData.description = description;
    if (permissions) updatedData.permissions = permissions;
    
    const updatedRole = await prisma.roleDefinition.update({
      where: { id },
      data: updatedData
    });
    
    res.status(200).json({
      success: true,
      message: 'Role updated successfully',
      data: updatedRole
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating role'
    });
  }
};

/**
 * Delete a role
 * @route DELETE /api/roles/:id
 * @access Private/Admin
 */
export const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const role = await prisma.roleDefinition.findUnique({
      where: { id }
    });
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if it's a system role
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: 'System roles cannot be deleted'
      });
    }
    
    // Delete the role (cascade will handle user assignments)
    await prisma.roleDefinition.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting role'
    });
  }
};

/**
 * Assign a role to a user
 * @route POST /api/roles/assign
 * @access Private/Admin
 */
export const assignRoleToUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Role ID are required'
      });
    }
    
    // Check if user and role exist
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const role = await prisma.roleDefinition.findUnique({ where: { id: roleId } });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Check if role assignment already exists
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
    
    // Create the assignment
    const assignment = await prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId
      },
      include: {
        role: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    res.status(201).json({
      success: true,
      message: 'Role assigned successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning role'
    });
  }
};

/**
 * Remove a role from a user
 * @route POST /api/roles/remove
 * @access Private/Admin
 */
export const removeRoleFromUser = async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Role ID are required'
      });
    }
    
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
    
    // Delete the assignment
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
      message: 'Role removed successfully'
    });
  } catch (error) {
    console.error('Error removing role:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing role'
    });
  }
};

/**
 * Get roles for a specific user
 * @route GET /api/roles/users/:userId/roles
 * @access Private
 */
export const getUserRoles = async (req, res) => {
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
    
    // Get user's role assignments
    const roleAssignments = await prisma.userRoleAssignment.findMany({
      where: { userId },
      include: {
        role: true
      }
    });
    
    res.status(200).json({
      success: true,
      count: roleAssignments.length,
      data: roleAssignments
    });
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user roles'
    });
  }
};

/**
 * Get all available permissions
 * @route GET /api/roles/permissions
 * @access Private/Admin
 */
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        resource: 'asc',
      }
    });
    
    // Group permissions by resource for easier UI consumption
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const resource = permission.resource;
      
      if (!acc[resource]) {
        acc[resource] = [];
      }
      
      acc[resource].push({
        id: permission.id,
        name: permission.name,
        action: permission.action,
        description: permission.description
      });
      
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      count: permissions.length,
      data: groupedPermissions
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching permissions'
    });
  }
};