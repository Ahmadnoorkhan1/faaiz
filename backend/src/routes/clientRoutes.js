import express from 'express';
import * as clientController from '../controllers/clientController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating client profile during onboarding
router.post('/', clientController.createClientProfile);

// Protected routes
router.use(protect);

// Admin-only routes
router.get('/', authorize('ADMIN'), clientController.getClientProfiles);

// User-specific routes
router.get('/user/:userId', clientController.getClientProfileByUserId);

// Protected routes for specific client profiles
router.route('/:id')
  .get(clientController.getClientProfileById)
  .put(clientController.updateClientProfile)
  .delete(authorize('ADMIN'), clientController.deleteClientProfile);

// Route for updating onboarding status
router.patch('/:id/onboarding', clientController.updateClientOnboardingStatus);

export default router; 