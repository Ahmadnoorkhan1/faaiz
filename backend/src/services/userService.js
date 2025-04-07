import prisma from '../utils/prisma.js';
import bcrypt from 'bcryptjs';

/**
 * Get all users
 * @returns {Array} List of users without password
 */
export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    include: {
      clientProfile: {
        select: {
          id: true,
          onboardingStatus: true,
        },
      },
      consultantProfile: {
        select: {
          id: true,
          onboardingStatus: true,
        },
      },
    },
  });

  // Remove password from each user
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Object} User object without password
 */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      clientProfile: true,
      consultantProfile: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

/**
 * Update user
 * @param {string} id - User ID
 * @param {Object} userData - User data to update
 * @returns {Object} Updated user without password
 */
export const updateUser = async (id, userData) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // If password is provided, hash it
  if (userData.password) {
    const salt = await bcrypt.genSalt(10);
    userData.password = await bcrypt.hash(userData.password, salt);
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id },
    data: userData,
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};

/**
 * Delete user (and associated profiles via cascading)
 * @param {string} id - User ID
 * @returns {Object} Deleted user without password
 */
export const deleteUser = async (id) => {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw new Error('User not found');
  }

  // Delete user
  const deletedUser = await prisma.user.delete({
    where: { id },
  });

  // Remove password from response
  const { password, ...userWithoutPassword } = deletedUser;

  return userWithoutPassword;
}; 