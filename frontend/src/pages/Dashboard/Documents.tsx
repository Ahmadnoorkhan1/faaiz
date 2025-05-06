import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { getAll,  remove } from '../../service/apiService';
import { toast } from 'react-hot-toast';
import api from '../../service/apiService';

interface Document {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  documentType: 'PROPOSAL' | 'REPORT' | 'CONTRACT' | 'CERTIFICATE' | 'OTHER';
  uploadedBy: {
    id: string;
    email: string;
  };
  client?: {
    id: string;
    email: string;
  };
  consultant?: {
    id: string;
    email: string;
  };
  createdAt: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];

const Documents: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getAll<Document>('/api/documents');
      setDocuments(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch documents');
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File size exceeds 10MB limit';
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Invalid file type. Allowed types: PDF, DOC, DOCX, XLS, XLSX, TXT';
    }
    return null;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name);
      formData.append('documentType', 'OTHER');
      formData.append('description', 'Uploaded document');
      user?.role === 'CLIENT' ? formData.append('clientId', user.id) : formData.append('consultantId', user.id);
      // Set the correct content type for the request
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      await api.post('/api/documents/upload', formData, config);
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await remove(`/api/documents/${id}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return 'text-red-500';
      case 'doc':
      case 'docx':
        return 'text-blue-500';
      case 'xls':
      case 'xlsx':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  // const formatFileSize = (bytes: number): string => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  const filteredDocuments = selectedFilter === 'all' 
    ? documents 
    : documents.filter(doc => doc.documentType === selectedFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Documents</h1>
          <p className="text-gray-400 mt-1">Manage your uploaded documents</p>
        </div>
        <div className="flex space-x-4">
          <select 
            className="bg-[#1a1f2b] text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Documents</option>
            <option value="PROPOSAL">Proposals</option>
            <option value="REPORT">Reports</option>
            <option value="CONTRACT">Contracts</option>
            <option value="CERTIFICATE">Certificates</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload New Document'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {
       (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments?.map((doc) => (
            <div key={doc.id} className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg hover:bg-[#242935] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 ${getFileIcon(doc.fileType)}`}>
                    <svg className="w-full h-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-gray-200 font-medium truncate max-w-[200px]">{doc.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{doc.fileType}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-gray-400 hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Uploaded by</span>
                  <span className="text-gray-200">{doc.uploadedBy.email}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-400">Upload date</span>
                  <span className="text-gray-200">{new Date(doc.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Documents; 