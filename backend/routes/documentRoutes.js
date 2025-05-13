import express from 'express';
import { documentController, upload } from '../controllers/documentController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Public route - Get all service types (no authentication required)
router.get('/service-types', documentController.getServiceTypes);

router.get('/by-service/:serviceType', documentController.getDocumentsByService);
// All routes below this middleware require authentication
router.use(authenticateToken);

// Upload a document
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// Get all documents for authenticated user
router.get('/', documentController.getDocuments);

// Get documents by service type

// Update a document
router.put('/:id', documentController.updateDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

export default router;