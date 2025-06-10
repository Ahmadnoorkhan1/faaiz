import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

export const authenticateToken = (req, res, next) => {
  // Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

export const authorize = (role) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // If roles is a string, convert to array
    const roleArray = typeof role === 'string' ? [role] : role;

    console.log(req.user);

    // Admin always has access to everything
    if (req.user.role === 'ADMIN') {
      return next();
    }
    
    // Check if user has required role from their main role
    if (roleArray.includes(req.user.role)) {
      return next();
    }
    
    // Check if user has the required role from their assigned roles
    try {
      const userRoles = await prisma.userRoleAssignment.findMany({
        where: { userId: req.user.id },
        include: { role: true }
      });
      
      const userRoleNames = userRoles.map(ur => ur.role.name);
      
      if (roleArray.some(r => userRoleNames.includes(r))) {
        return next();
      }
    } catch (error) {
      console.error('Error checking user roles:', error);
    }

    return res.status(403).json({ error: 'Access denied. Insufficient role permissions.' });
  };
};

export const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'User not authenticated' 
        });
      }
 
      // Admin has all permissions
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Get user's roles with their permissions
      const userRoles = await prisma.userRoleAssignment.findMany({
        where: { userId: req.user.id },
        include: {
          role: true
        }
      });

      // Check if any role has the required permission
      const hasPermission = userRoles.some(userRole => 
        userRole.role.permissions && userRole.role.permissions.includes(permissionName)
      );

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have the required permission.'
      });
    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};