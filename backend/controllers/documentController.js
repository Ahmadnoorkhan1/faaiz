import { v4 as uuidv4 } from 'uuid';
import { ServiceTypes } from '../constants/services.js';

import multer from 'multer';
import { uploadToAzure } from '../config/azureStorage.js';
import prisma from '../config/prisma.js';
import pkg from '@prisma/client';
// const { ServiceType } = pkg;
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
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      documentType = "PROPOSAL",
      serviceType,
      title,
      description
    } = req.body;

    const service = await prisma.service.findUnique({
      where: { name: serviceType }
    });

    if (!service) {
      return res.status(400).json({ error: 'Invalid service type' });
    }

    const userIdSuffix = req.user.id.replace(/-/g, '').substring(0, 8);
    const shortServiceName = service.name.toLowerCase().substring(0, 8);
    const containerName = `${shortServiceName}-${userIdSuffix}`;

    const fileUrl = await uploadToAzure(
      req.file.buffer,
      containerName,
      req.file.originalname
    );

    const document = await prisma.document.create({
      data: {
        id: uuidv4(),
        fileUrl,
        fileType: req.file.mimetype,
        title: title || req.file.originalname,
        description,
        documentType,
        serviceId: service.id,
        uploadedById: req.user.id,
      },
      include: {
        uploadedBy: {
          select: { id: true, email: true }
        },
        service: true
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Error uploading document:', error);
    res.status(500).json({ error: 'Failed to upload document', details: error.message });
  }
}



  // Get all documents for a user
  ,async getDocuments(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { serviceType } = req.query;

    const whereClause = {
      uploadedById: req.user.id,
    };

    if (serviceType) {
      whereClause['service'] = { name: serviceType };
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        uploadedBy: { select: { id: true, email: true } },
        service: true
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents || []);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}


  // Get documents by service type
,async getDocumentsByService(req, res) {
  try {
    const { serviceType } = req.params;

    const whereClause = {
      service: { name: serviceType },
    };

    if (req.user && req.user.id) {
      whereClause['uploadedById'] = req.user.id;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        uploadedBy: { select: { id: true, email: true } },
        service: true
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(documents || []);
  } catch (error) {
    console.error('Error fetching documents by service:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
}

  // Get all available service types
  // async getServiceTypes(req, res) {
  //   try {
  //     // Return all service types from the imported enum
  //     res.json(Object.values(ServiceType));
  //   } catch (error) {
  //     console.error('Error fetching service types:', error);
  //     res.status(500).json({ error: 'Failed to fetch service types' });
  //   }
  // }, 

  ,async getServiceTypes(req, res) {
  try {
    res.json(Object.values(ServiceTypes));
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({ error: 'Failed to fetch service types' });
  }
},

  // Update a document
async updateDocument(req, res) {
  try {
    const { id } = req.params;
    const { title, description, documentType, serviceType } = req.body;

    let serviceId;

    if (serviceType) {
      const service = await prisma.service.findUnique({
        where: { name: serviceType }
      });

      if (!service) {
        return res.status(400).json({ error: 'Invalid service type' });
      }

      serviceId = service.id;
    }

    const document = await prisma.document.update({
      where: { id },
      data: {
        title,
        description,
        documentType,
        serviceId
      },
      include: {
        uploadedBy: { select: { id: true, email: true } },
        service: true
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
}


  // Delete a document
  ,async deleteDocument(req, res) {
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