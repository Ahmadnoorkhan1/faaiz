import express from 'express';
import { scheduledCallController } from '../controllers/scheduledCallController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all scheduled calls
router.get('/', scheduledCallController.getCalls);

// Create a new scheduled call
router.post('/', scheduledCallController.createCall);

// Update a scheduled call
router.put('/:id', scheduledCallController.updateCall);

// Delete a scheduled call
router.delete('/:id', scheduledCallController.deleteCall);

const scheduledCallRoutes = router;
export default scheduledCallRoutes; 