import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getClients } from '../controllers/clientController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Client routes
router.get('/', getClients);

const clientRoutes = router;
export default clientRoutes; 