import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const authController = {
  async register(req, res) {
    try {
      const { email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role || 'CLIENT',
        },
        select: {
          id: true,
          email: true,
          role: true,
        },
      });

      // Generate JWT token
     const token = jwt.sign(
  { id: user.id, role: user.role }, // Include role in token payload
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);

      res.status(201).json({
        success: true,
        data: {
          token,
          user,
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  },

  async login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user with profile data
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        consultantProfile: true,
      },
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials' 
      });
    }

    // If the user is a consultant, check if they are allowed to login
    if (user.role === 'CONSULTANT' && user.consultantProfile) {
      if (!user.consultantProfile.isAllowedToLogin) {
        return res.status(403).json({
          success: false,
          error: 'Your account is pending approval. You will be notified when your account is activated.'
        });
      }
    }

    // Generate JWT token
   const token = jwt.sign(
  { id: user.id, role: user.role }, // Include role in token payload
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);

    // Remove password and sensitive data from response
    const { password: _, consultantProfile, ...userDataForResponse } = user;

    res.json({
      success: true,
      data: {
        token,
        user: userDataForResponse,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to login' 
    });
  }
  },

  async getMe(req, res) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          role: true,
          clientProfile: true,
          consultantProfile: true,
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        success: true,
        data: user,
      });

    } catch (error) {
      console.error('Get me error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  },

  async logout(req, res) {
    try {
      // In a real application, you might want to invalidate the token
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  },
}; 