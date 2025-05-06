import express from 'express';
import { documentController, upload } from '../controllers/documentController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Upload a new document
router.post('/upload', upload.single('file'), documentController.uploadDocument);

// Get all documents for the authenticated user
router.get('/', documentController.getDocuments);

// Update a document
router.put('/:id', documentController.updateDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

const documentRoutes = router;
export default documentRoutes; 