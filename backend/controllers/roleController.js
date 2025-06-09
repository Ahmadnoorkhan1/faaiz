import pkg from '@prisma/client';
const { PrismaClient } = pkg;
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
        users: true  // You can only include relations
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
 * Get a single role by ID
 * @route GET /api/roles/:id
 * @access Private/Admin
 */
export const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const role = await prisma.roleDefinition.findUnique({
      where: { id },
      include: {
        users: true  // You can only include relations
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
    const { name, description } = req.body;
    
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
      
      
       
      // Return the created role with permissions
      return prisma.roleDefinition.findUnique({
        where: { id: newRole.id },
        
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
 * Update a role
 * @route PUT /api/roles/:id
 * @access Private/Admin
 */
export const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, permissionIds } = req.body;
    
    // Check if role exists
    const existingRole = await prisma.roleDefinition.findUnique({
      where: { id }
    });
    
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Update role and permissions
    const role = await prisma.$transaction(async (prisma) => {
      // Update basic role info
      const updatedRole = await prisma.roleDefinition.update({
        where: { id },
        data: {
          name: name || undefined,
          description: description !== undefined ? description : undefined
        }
      });
      
      // If permissions are provided, update them
      if (permissionIds) {
        // First, remove existing permissions
        await prisma.rolePermission.deleteMany({
          where: { roleId: id }
        });
        
        // Then add new permissions
        if (permissionIds.length > 0) {
          await Promise.all(
            permissionIds.map(permissionId => 
              prisma.rolePermission.create({
                data: {
                  roleId: id,
                  permissionId
                }
              })
            )
          );
        }
      }
      
      // Return updated role with permissions
      return prisma.roleDefinition.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });
    });
    
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a role
 * @route DELETE /api/roles/:id
 * @access Private/Admin
 */
export const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if role exists
    const existingRole = await prisma.roleDefinition.findUnique({
      where: { id }
    });
    
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }
    
    // Delete role (cascade will handle permissions and user assignments)
    await prisma.roleDefinition.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign a role to a user
 * @route POST /api/roles/assign
 * @access Private/Admin
 */
export const assignRoleToUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and roleId'
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
    
    // Check if assignment already exists
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
    
    // Create role assignment
    const assignment = await prisma.userRoleAssignment.create({
      data: {
        userId,
        roleId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        },
        role: true
      }
    });
    
    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a role from a user
 * @route DELETE /api/roles/remove
 * @access Private/Admin
 */
export const removeRoleFromUser = async (req, res, next) => {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId and roleId'
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
    
    // Delete assignment
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

/**
 * Get user's permissions
 * @route GET /api/roles/users/:userId/permissions
 * @access Private/Admin
 */
export const getUserPermissions = async (req, res, next) => {
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
    
    // If user is admin, they have all permissions
    if (user.role === 'ADMIN') {
      const allPermissions = await prisma.permission.findMany();
      return res.status(200).json({
        success: true,
        isAdmin: true,
        count: allPermissions.length,
        data: allPermissions
      });
    }
    
    // Get user's roles and permissions
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
    
    // Extract unique permissions
    const permissions = userRoles.flatMap(userRole => 
      userRole.role.permissions.map(rp => rp.permission)
    );
    
    // Remove duplicates
    const uniquePermissions = permissions.filter((permission, index, self) =>
      index === self.findIndex(p => p.id === permission.id)
    );
    
    res.status(200).json({
      success: true,
      isAdmin: false,
      count: uniquePermissions.length,
      data: uniquePermissions
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRoles = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true
      }
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
      baseRole: user.role,
      count: userRoles.length,
      data: userRoles
    });
  } catch (error) {
    next(error);
  }
};