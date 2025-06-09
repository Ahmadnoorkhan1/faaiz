import express from 'express';
import { authenticateToken, authorize } from '../middlewares/auth.js';
import {
  getAvailablePermissions,
  getAllUsers,
  getUserPermissions,
  updateUserPermissions,
  clearUserPermissions,
  getPermissions
} from '../controllers/permissionController.js';

const router = express.Router();

// Protect all routes with authentication middleware
router.use(authenticateToken);

router.get('/', getPermissions);


// Fix the routing order issue - specific routes first
// Available permissions structure
router.get('/available', authorize('ADMIN'), getAvailablePermissions);

// User permission management routes
router.get('/users', authorize('ADMIN'), getAllUsers);
router.get('/users/:userId/permissions', authorize('ADMIN'), getUserPermissions);
router.post('/users/:userId/update', authorize('ADMIN'), updateUserPermissions);
router.delete('/users/:userId/permissions', authorize('ADMIN'), clearUserPermissions);

export default router;