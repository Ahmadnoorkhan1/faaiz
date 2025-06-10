import express from 'express';
import { authenticateToken, authorize } from '../middlewares/auth.js';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController.js';

const router = express.Router();

// Protect all routes with authentication middleware
router.use(authenticateToken);

// Further protect all routes with admin authorization
router.use(authorize('ADMIN'));

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;