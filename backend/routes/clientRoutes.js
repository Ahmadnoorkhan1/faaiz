import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { getClients, createClient } from '../controllers/clientController.js';

const router = express.Router();

// Public route for client registration
router.post('/', createClient);

// All routes below this line require authentication
router.use(authenticateToken);

// Client routes that require authentication
router.get('/', getClients);

const clientRoutes = router;
export default clientRoutes;