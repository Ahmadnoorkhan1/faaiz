import express from 'express';
import { createScopingFormController, getAllScopingFormsController, getScopingFormByServiceController, updateScopingFormController, deleteScopingFormController } from '../controllers/ScopingFormController.js';

const router = express.Router();

router.post('/create', createScopingFormController);
router.get('/get-all', getAllScopingFormsController);
router.get('/get-by-service', getScopingFormByServiceController);
router.put('/update', updateScopingFormController);
router.delete('/delete', deleteScopingFormController);

export default router;