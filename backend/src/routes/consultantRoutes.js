import express from 'express';
import * as consultantController from '../controllers/consultantController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public route for creating consultant profile during onboarding
router.post('/', consultantController.createConsultantProfile);

// Protected routes
router.use(protect);

// Admin-only routes
router.get('/', authorize('ADMIN'), consultantController.getConsultantProfiles);

// User-specific routes
router.get('/user/:userId', consultantController.getConsultantProfileByUserId);

// Protected routes for specific consultant profiles
router.route('/:id')
  .get(consultantController.getConsultantProfileById)
  .put(consultantController.updateConsultantProfile)
  .delete(authorize('ADMIN'), consultantController.deleteConsultantProfile);

// Route for updating onboarding status
router.patch('/:id/onboarding', consultantController.updateConsultantOnboardingStatus);

export default router; 