import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  getAllRoles, 
  createRole, 
  assignRoleToUser, 
  getUserRoles, 
  removeRoleFromUser 
} from '../controllers/roleController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Role routes
router.route('/')
  .get(getAllRoles)
  .post(createRole);

// User role routes
router.route('/users/:userId/roles')
  .get(getUserRoles)
  .post(assignRoleToUser);

router.route('/users/:userId/roles/:roleId')
  .delete(removeRoleFromUser);

const roleRoutes = router;
export default roleRoutes; 