import express from 'express';
import { getPermissions, getPermissionById, createPermission, updatePermission, deletePermission } from '../controllers/permissionController.js';
import { authorize, hasPermission } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getPermissions);
router.get('/:id', getPermissionById);

// Protected admin-only routes
router.post('/', authorize, hasPermission, createPermission);
router.put('/:id', authorize, hasPermission, updatePermission);
router.delete('/:id', authorize, hasPermission, deletePermission);

export default router;