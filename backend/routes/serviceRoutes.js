import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  getAllServices,
  createService
} from '../controllers/serviceController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Service routes
router.route('/')
  .get(getAllServices)
  .post(createService);

const serviceRoutes = router;
export default serviceRoutes;