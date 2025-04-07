import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma.js';

/**
 * Register a new user
 * @param {Object} userData - User data including email, password, role
 * @returns {Object} User object and token
 */
export const register = async (userData) => {
  const { email, password, role = 'CLIENT' } = userData;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  });

  // Generate JWT token
  const token = generateToken(user.id);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token,
  };
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} User object and token
 */
export const login = async (email, password) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  // Generate JWT token
  const token = generateToken(user.id);

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    token,
  };
};

/**
 * Generate JWT token
 * @param {string} id - User ID
 * @returns {string} JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Object} User object with profile information
 */
export const getUserProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
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