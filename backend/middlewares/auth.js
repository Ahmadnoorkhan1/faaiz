import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // If roles is a string, convert to array
    const roleArray = typeof roles === 'string' ? [roles] : roles;

    if (!roleArray.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

export const hasPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Admin users have all permissions
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Get user's roles with permissions
      const userRoles = await prisma.userRoleAssignment.findMany({
        where: { userId: req.user.id },
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

      // Check if user has required permission
      const hasRequiredPermission = userRoles.some(userRole =>
        userRole.role.permissions.some(p => 
          p.permission.resource === resource && 
          (p.permission.type === action || p.permission.type === 'ADMIN')
        )
      );

      if (hasRequiredPermission) {
        return next();
      }

      res.status(403).json({ 
        error: 'Access denied. You do not have permission to perform this action.'
      });
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Error checking permissions' });
    }
  };
};