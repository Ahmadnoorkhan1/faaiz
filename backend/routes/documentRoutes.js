import express from 'express';
import { documentController, upload } from '../controllers/documentController.js';
// import { authMiddleware } from '../middlewares/auth.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Protect all routes with authentication
router.use(authenticateToken);

// Upload a document
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// Get all documents for authenticated user
router.get('/', documentController.getDocuments);

// Get all service types
router.get('/service-types', documentController.getServiceTypes);

// Get documents by service type
router.get('/by-service/:serviceType', documentController.getDocumentsByService);

// Update a document
router.put('/:id', documentController.updateDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

export default router;