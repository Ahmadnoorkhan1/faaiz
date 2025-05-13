import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { uploadToAzure } from '../config/azureStorage.js';
import prisma from '../config/prisma.js';
import { ServiceType } from '@prisma/client';

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

      const { 
        documentType = "PROPOSAL", 
        clientId, 
        consultantId,
        serviceType, // Add this field
        title,
        description
      } = req.body;      // Validate serviceType if provided
      if (serviceType && !Object.values(ServiceType).includes(serviceType)) {
        return res.status(400).json({ 
          error: 'Invalid service type',
          validTypes: Object.values(ServiceType)
        });
      }

      // Get file type from the uploaded file
      const fileType = req.file.mimetype;      // Upload file to Azure Blob Storage
      // Create a shorter container name to avoid Azure's 63 character limit
      let shortServiceName = "shared";
      
      if (serviceType) {
        // Create an abbreviated version of the service type
        // Take first 3 letters and any number if present
        const matches = serviceType.match(/^([A-Z]+)_?(\d+)?/);
        if (matches) {
          shortServiceName = matches[1].toLowerCase();
          if (matches[2]) shortServiceName += matches[2];
        } else {
          // Fallback to first 8 chars
          shortServiceName = serviceType.toLowerCase().substring(0, 8);
        }
      }
      
      // Create a shorter container name: [service-abbr]-[user-id-first-8-chars]
      const userIdSuffix = req.user.id.replace(/-/g, '').substring(0, 8);
      const containerName = `${shortServiceName}-${userIdSuffix}`;
      
      console.log(`Using container name: ${containerName} for service: ${serviceType || 'shared'}`);
      
      const fileUrl = await uploadToAzure(
        req.file.buffer,
        containerName,
        req.file.originalname
      );
 
      // Create document record
      const document = await prisma.document.create({
        data: {
          id: uuidv4(),
          fileUrl,
          fileType,
          title: title || req.file.originalname,
          description,
          documentType,
          serviceType, // Add this field
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
      
      res.status(500).json({ error: 'Failed to upload document', details: error.message });
    }
  },

  // Get all documents for a user
  async getDocuments(req, res) {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { serviceType } = req.query;

      // Build where clause
      let whereClause = {
        OR: [
          { clientId: req.user.id },
          { consultantId: req.user.id },
          { uploadedById: req.user.id },
        ]
      };

      // Add serviceType filter if provided
      if (serviceType) {
        whereClause.serviceType = serviceType;
      }

      const documents = await prisma.document.findMany({
        where: whereClause,
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

  // Get documents by service type
  async getDocumentsByService(req, res) {
  try {
    const { serviceType } = req.params;
    
    // Validate serviceType
    if (!Object.values(ServiceType).includes(serviceType)) {
      return res.status(400).json({ 
        error: 'Invalid service type',
        validTypes: Object.values(ServiceType)
      });
    }

    // Build where clause without user check
    const whereClause = {
      serviceType
    };

    // Add user filter only if user is authenticated
    if (req.user && req.user.id) {
      whereClause.OR = [
        { clientId: req.user.id },
        { consultantId: req.user.id },
        { uploadedById: req.user.id },
      ];
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
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
    console.error('Error fetching documents by service:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
},
  // Get all available service types
  async getServiceTypes(req, res) {
    try {
      // Return all service types from the imported enum
      res.json(Object.values(ServiceType));
    } catch (error) {
      console.error('Error fetching service types:', error);
      res.status(500).json({ error: 'Failed to fetch service types' });
    }
  }, 

  // Update a document
  async updateDocument(req, res) {
    try {
      const { id } = req.params;
      const { title, description, documentType, serviceType } = req.body;      // Validate serviceType if provided
      if (serviceType && !Object.values(ServiceType).includes(serviceType)) {
        return res.status(400).json({ 
          error: 'Invalid service type',
          validTypes: Object.values(ServiceType)
        });
      }

      const document = await prisma.document.update({
        where: { id },
        data: {
          title,
          description,
          documentType,
          serviceType
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

      // Check if user has permission to delete
      if (document.uploadedById !== req.user.id) {
        return res.status(403).json({ error: 'You do not have permission to delete this document' });
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