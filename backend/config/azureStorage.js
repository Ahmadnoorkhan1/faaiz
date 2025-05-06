// azureStorage.js

import { BlobServiceClient, StorageSharedKeyCredential } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';

// Create shared key credential
const sharedKeyCredential = new StorageSharedKeyCredential(
  process.env.AZURE_STORAGE_ACCOUNT_NAME,
  process.env.AZURE_STORAGE_ACCOUNT_KEY
);

// Create blob service client
const blobServiceClient = new BlobServiceClient(
  `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
  sharedKeyCredential
);

/**
 * Upload a file to Azure Blob Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} containerName - Container name
 * @param {string} originalFileName - Original file name
 * @returns {Promise<string>} URL of the uploaded file
 */
export const uploadToAzure = async (fileBuffer, containerName, originalFileName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container if it doesn't exist
    await containerClient.createIfNotExists({
      access: 'blob'
    });

    const fileExtension = originalFileName.split('.').pop();
    const blobName = `${uuidv4()}.${fileExtension}`;

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: {
        blobContentType: getContentType(fileExtension)
      }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to Azure:', error.message);
    throw error;
  }
};

/**
 * Get content type based on file extension
 * @param {string} extension - File extension
 * @returns {string} Content type
 */
const getContentType = (extension) => {
  const contentTypes = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png'
  };

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
};
