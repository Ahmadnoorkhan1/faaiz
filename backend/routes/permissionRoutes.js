import express from 'express';
import { authenticateToken, authorize } from '../middlewares/auth.js';
import {
  getAvailablePermissions,
  getAllUsers,
  getUserPermissions,
  updateUserPermissions,
  clearUserPermissions,
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
  getPermissionById
} from '../controllers/permissionController.js';

const router = express.Router();

// Protect all routes with authentication middleware
router.use(authenticateToken);

// Basic permission routes
router.get('/', authorize('ADMIN'), getPermissions);
router.post('/', authorize('ADMIN'), createPermission);

// Fix the routing order issue - specific routes first
// Available permissions structure
router.get('/available', authorize('ADMIN'), getAvailablePermissions);

// User permission management routes
router.get('/users', authorize('ADMIN'), getAllUsers);
router.get('/users/:userId/permissions', authorize('ADMIN'), getUserPermissions);
router.post('/users/:userId/update', authorize('ADMIN'), updateUserPermissions);
router.delete('/users/:userId/permissions', authorize('ADMIN'), clearUserPermissions);

// Individual permission routes (put after specific routes to avoid conflicts)
router.get('/:id', authorize('ADMIN'), getPermissionById);
router.put('/:id', authorize('ADMIN'), updatePermission);
router.delete('/:id', authorize('ADMIN'), deletePermission);

export default router;