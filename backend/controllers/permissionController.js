import { PrismaClient } from '@prisma/client';

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
      error: 'Server error while fetching permissions'
    });
  }
};

/**
 * Get a single permission by ID
 * @route GET /api/permissions/:id
 * @access Private (Admin only)
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
        error: 'Permission not found'
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
      error: 'Server error while fetching permission'
    });
  }
};

/**
 * Create a new permission
 * @route POST /api/permissions
 * @access Private (Admin only)
 */
export const createPermission = async (req, res) => {
  try {
    const { name, description, type, resource } = req.body;
    
    // Validate input
    if (!name || !type || !resource) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, type and resource'
      });
    }
    
    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name }
    });
    
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        error: 'Permission with this name already exists'
      });
    }
    
    // Create new permission
    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        type,
        resource
      }
    });
    
    return res.status(201).json({
      success: true,
      data: permission
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating permission'
    });
  }
};

/**
 * Update a permission
 * @route PUT /api/permissions/:id
 * @access Private (Admin only)
 */
export const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, type, resource } = req.body;
    
    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found'
      });
    }
    
    // Update permission
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        name: name || permission.name,
        description: description !== undefined ? description : permission.description,
        type: type || permission.type,
        resource: resource || permission.resource
      }
    });
    
    return res.status(200).json({
      success: true,
      data: updatedPermission
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while updating permission'
    });
  }
};

/**
 * Delete a permission
 * @route DELETE /api/permissions/:id
 * @access Private (Admin only)
 */
export const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        error: 'Permission not found'
      });
    }
    
    // Check if permission is used by any role
    const rolePermissionCount = await prisma.rolePermission.count({
      where: { permissionId: id }
    });
    
    if (rolePermissionCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete permission as it is used by one or more roles'
      });
    }
    
    // Delete permission
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
      error: 'Server error while deleting permission'
    });
  }
};