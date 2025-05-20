import express from 'express';
import { 
  createScopingFormController, 
  getAllScopingFormsController, 
  getScopingFormByServiceController, 
  updateScopingFormController,  
  deleteScopingFormController, 
  submitClientScopingFormController,
  getClientScopingFormController,  // Add this new controller
  getClientScopingFormHtmlController // Add this new controller
} from '../controllers/ScopingFormController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router(); 
 
router.post('/create', createScopingFormController);
router.get('/get-all', getAllScopingFormsController);
router.post('/get-by-service', getScopingFormByServiceController);
router.post('/update', updateScopingFormController);
router.delete('/delete', deleteScopingFormController);
router.post('/client-submission', authenticateToken, submitClientScopingFormController);

// New routes for client specific forms
router.get('/client/:clientId/service/:serviceType', authenticateToken, getClientScopingFormController);
router.get('/client/:clientId/service/:serviceType/html',  getClientScopingFormHtmlController);

export default router;