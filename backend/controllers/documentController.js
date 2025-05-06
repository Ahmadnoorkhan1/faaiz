import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { uploadToAzure } from '../config/azureStorage.js';
import prisma from '../config/prisma.js';

// Configure multer for file uploads
const upload = multer({ 
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT'));
    }
  }
});

export const documentController = {
  // Upload a new document
  async uploadDocument(req, res) {
    try {
      // Check if prisma is properly initialized
      if (!prisma || !prisma.document) {
        console.error('Prisma or Document model not properly initialized');
        // Try to reconnect
        try {
          await prisma.$connect();
        } catch (error) {
          console.error('Failed to reconnect to Prisma:', error);
          return res.status(500).json({ error: 'Database service unavailable' });
        }
      }

      // Check if file exists in request
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { documentType, clientId, consultantId } = req.body;

      // Get file type from the uploaded file
      const fileType = req.file.mimetype;

      // Upload file to Azure Blob Storage
      const fileUrl = await uploadToAzure(
        req.file.buffer,
        `shared-documents-${req.user.id}`, // container name - fix invalid space character
        req.file.originalname
      );

      // Create document record
      const document = await prisma.document.create({
        data: {
          id: uuidv4(),
          fileUrl,
          fileType,
          documentType,
          uploadedById: req.user.id,
          clientId: clientId || null,
          consultantId: consultantId || null,
        },
        include: {
          client: {
            select: {
              id: true,
              email: true,
            },
          },
          consultant: {
            select: {
              id: true,
              email: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.status(201).json(document);
    } catch (error) {
      console.error('Error uploading document:', error);
      
      // Handle specific Prisma errors
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'A document with this identifier already exists' });
      }
      
      res.status(500).json({ error: 'Failed to upload document' });
    }
  },

  // Get all documents for a user
  async getDocuments(req, res) {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      // Check if prisma is properly initialized
      if (!prisma || !prisma.document) {
        console.error('Prisma or Document model not properly initialized');
        // Try to reconnect
        try {
          await prisma.$connect();
        } catch (error) {
          console.error('Failed to reconnect to Prisma:', error);
          return res.status(500).json({ error: 'Database service unavailable' });
        }
      }

      const documents = await prisma.document.findMany({
        where: {
          OR: [
            { clientId: req.user.id },
            { consultantId: req.user.id },
            { uploadedById: req.user.id },
          ],
        },
        include: {
          client: {
            select: {
              id: true,
              email: true,
            },
          },
          consultant: {
            select: {
              id: true,
              email: true,
            },
          },
          uploadedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  },

  // Update a document
  async updateDocument(req, res) {
    try {
      const { id } = req.params;
      const { title, description, documentType } = req.body;

      const document = await prisma.document.update({
        where: { id },
        data: {
          title,
          description,
          documentType,
        },
        include: {
          uploadedBy: {
            select: {
              id: true,
              email: true,
            },
          },
          client: {
            select: {
              id: true,
              email: true,
            },
          },
          consultant: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.json(document);
    } catch (error) {
      console.error('Error updating document:', error);
      res.status(500).json({ error: 'Failed to update document' });
    }
  },

  // Delete a document
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        return res.status(404).json({ error: 'Document not found' });
      }

      // Delete the file from storage
      // TODO: Implement file deletion logic

      await prisma.document.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting document:', error);
      res.status(500).json({ error: 'Failed to delete document' });
    }
  },
};

export { upload }; 