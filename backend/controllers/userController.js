import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Get all users
 * @route GET /api/users
 * @access Private/Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const { search, role, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.OR = [
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users with their roles
    const users = await prisma.user.findMany({
      where: filter,
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
            organization: true
          }
        }
      },
      skip,
      take: parseInt(limit),
      orderBy: { email: 'asc' }
    });

    // Get total count for pagination
    const total = await prisma.user.count({ where: filter });

    // Format user data
    const formattedUsers = users.map(user => {
      let displayName;
      let organization = '';
      
      if (user.clientProfile) {
        displayName = user.clientProfile.fullName;
        organization = user.clientProfile.organization || '';
      } else if (user.consultantProfile) {
        displayName = `${user.consultantProfile.contactFirstName} ${user.consultantProfile.contactLastName}`;
        organization = user.consultantProfile.organization || '';
      } else {
        displayName = user.email.split('@')[0];
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

    res.status(200).json({
      success: true,
      count: formattedUsers.length,
      total,
      data: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

/**
 * Create new user
 * @route POST /api/users
 * @access Private/Admin
 */
export const createUser = async (req, res) => {
  try {
    const { email, password, role, roleIds = [] } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with role assignments in a transaction
    const result = await prisma.$transaction(async (prisma) => {      // Create the user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role || 'CLIENT'
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      });
      
      // Assign roles if provided
      if (roleIds.length > 0) {
        await Promise.all(roleIds.map(roleId => 
          prisma.userRoleAssignment.create({
            data: {
              userId: user.id,
              roleId
            }
          })
        ));
      }
      
      return user;
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating user',
      error: error.message
    });
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, role, roleIds } = req.body;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Prepare update data
      const updateData = {};
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      
      // Hash new password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      
      // Update the user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          role: true
        }
      });
      
      // Update role assignments if provided
      if (roleIds) {
        // First, remove existing role assignments
        await prisma.userRoleAssignment.deleteMany({
          where: { userId: id }
        });
        
        // Then, create new role assignments
        if (roleIds.length > 0) {
          await Promise.all(roleIds.map(roleId => 
            prisma.userRoleAssignment.create({
              data: {
                userId: id,
                roleId
              }
            })
          ));
        }
      }
      
      return updatedUser;
    });
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete user in a transaction (cascade will handle related records)
    await prisma.user.delete({
      where: { id }
    });
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        userRoles: {
          include: {
            role: true
          }
        },
        clientProfile: true,
        consultantProfile: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};