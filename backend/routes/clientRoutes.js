import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { updateClientNDA,updateClientStatus,getClients, createClient, getClientByUserId, getClientsByStatus, inviteClientForDiscovery, updateDiscoveryStatus, updateClientScoping, updateClientTerms, rejectClient } from '../controllers/clientController.js';

const router = express.Router();

// Public route for client registration
router.post('/', createClient);

// All routes below this line require authentication
router.use(authenticateToken);

// Client routes that require authentication
router.get('/', getClients);

router.get('/user/:userId', getClientByUserId);

// Admin routes for client onboarding process
router.get('/by-status/:status', authenticateToken, getClientsByStatus);
router.post('/:id/invite', authenticateToken, inviteClientForDiscovery);
router.post('/:id/discovery-status', authenticateToken, updateDiscoveryStatus);
router.post('/:id/scoping', authenticateToken, updateClientScoping);
router.post('/:id/terms', authenticateToken, updateClientTerms);
router.post('/:id/reject', authenticateToken, rejectClient);
router.post('/:id/status',authenticateToken,updateClientStatus)
router.post('/:id/sign-nda',authenticateToken,updateClientNDA)

const clientRoutes = router;
export default clientRoutes;