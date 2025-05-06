import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user
router.get('/me', authenticateToken, authController.getMe);

// Logout user
router.post('/logout', authController.logout);

const authRoutes = router;
export default authRoutes; 