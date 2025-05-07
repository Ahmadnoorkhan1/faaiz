import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { authorize } from '../middlewares/auth.js';
import { 
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignRoleToUser,
  removeRoleFromUser,
  getUserRoles,
  getUserPermissions
} from '../controllers/roleController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Role management routes (admin only)
router.route('/')
  .get(authorize('ADMIN'), getAllRoles)
  .post(authorize('ADMIN'), createRole);

router.route('/:id')
  .get(authorize('ADMIN'), getRoleById)
  .put(authorize('ADMIN'), updateRole)
  .delete(authorize('ADMIN'), deleteRole);

// Role assignment routes (admin only)
router.post('/assign', authorize('ADMIN'), assignRoleToUser);
router.post('/remove', authorize('ADMIN'), removeRoleFromUser);

// Get user roles
router.get('/users/:userId/roles', getUserRoles);

// Get user permissions
router.get('/users/:userId/permissions', getUserPermissions);

export default router;