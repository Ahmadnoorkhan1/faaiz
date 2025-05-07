import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all permissions
 * @route GET /api/permissions
 * @access Private/Admin
 */
export const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        resource: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new permission
 * @route POST /api/permissions
 * @access Private/Admin
 */
export const createPermission = async (req, res, next) => {
  try {
    const { name, description, type, resource } = req.body;
    
    if (!name || !type || !resource) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, type, and resource'
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
    
    // Create permission
    const permission = await prisma.permission.create({
      data: {
        name,
        description,
        type,
        resource
      }
    });
    
    res.status(201).json({
      success: true,
      data: permission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update permission
 * @route PUT /api/permissions/:id
 * @access Private/Admin
 */
export const updatePermission = async (req, res, next) => {
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
        message: 'Permission not found'
      });
    }
    
    // Update permission
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        type: type || undefined,
        resource: resource || undefined
      }
    });
    
    res.status(200).json({
      success: true,
      data: updatedPermission
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete permission
 * @route DELETE /api/permissions/:id
 * @access Private/Admin
 */
export const deletePermission = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id }
    });
    
    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found'
      });
    }
    
    // Delete permission
    await prisma.permission.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};