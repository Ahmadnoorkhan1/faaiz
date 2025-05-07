import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { authorize } from '../middlewares/auth.js';
import { 
  getAllPermissions,
  createPermission,
  updatePermission,
  deletePermission
} from '../controllers/permissionController.js';

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Only admin can manage permissions
router.use(authorize('ADMIN'));

router.route('/')
  .get(getAllPermissions)
  .post(createPermission);

router.route('/:id')
  .put(updatePermission)
  .delete(deletePermission);

export default router;