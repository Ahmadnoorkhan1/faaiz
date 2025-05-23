import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  generateServiceProposal,
  getProposalByService,
  getAllProposals,
} from '../controllers/proposalController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Proposal routes
router.route('/createProposal').post(generateServiceProposal);
router.route('/getProposal/:serviceType').get(getProposalByService);
router.route('/getAllProposals').get(getAllProposals);

const proposalRoutes = router;
export default proposalRoutes; 