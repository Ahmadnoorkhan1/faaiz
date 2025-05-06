import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import multer from 'multer';
import { createConsultantProfile, getConsultantProfiles, getConsultantProfileByUserId, updateConsultantProfile, updateConsultantOnboardingStatus, uploadCV, uploadCertifications, getConsultantProfileById, deleteConsultantProfile, signNDA, getNDAStatus } from '../controllers/consultantController.js';
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Public route for creating consultant profile during onboarding
router.post('/', createConsultantProfile);

// All routes below this line require authentication
router.use(authenticateToken);

// Admin-only routes
router.get('/', getConsultantProfiles);

// User-specific routes
router.get('/user/:userId', getConsultantProfileByUserId);

// Protected routes for specific consultant profiles
router.route('/:id')
  .get(getConsultantProfileById)
  .post(updateConsultantProfile)
  .delete(deleteConsultantProfile);

// Route for updating onboarding status
router.patch('/:id/onboarding', updateConsultantOnboardingStatus);

// File upload routes
router.post(
  '/:id/cv',
  upload.single('cv'),
  uploadCV
);

router.post(
  '/:id/certifications',
  upload.array('certifications', 10), // Allow up to 10 certification files
  uploadCertifications
);

// NDA related routes
router.post('/:id/sign-nda', signNDA);
router.get('/:id/nda-status', getNDAStatus);

const consultantRoutes = router;
export default consultantRoutes; 