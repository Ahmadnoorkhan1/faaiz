import React, { useState } from 'react';
import api from '../../../service/apiService';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Service types from schema.prisma
const SERVICE_TYPES = [
  'ISO_27001_INFORMATION_SECURITY_MANAGEMENT_SYSTEM',
  'ISO_27701_PRIVACY_INFORMATION_MANAGEMENT_SYSTEM',
  'ISO_22301_BUSINESS_CONTINUITY_MANAGEMENT_SYSTEM',
  'ISO_27017_CLOUD_SECURITY_CONTROLS',
  'ISO_27018_PII_PROTECTION_IN_PUBLIC_CLOUD',
  'ISO_20000_SERVICE_MANAGEMENT',
  'ISO_12207_SOFTWARE_LIFE_CYCLE',
  'ISO_42001_AI_MANAGEMENT_SYSTEM',
  'TESTING_SERVICES',
  'RISK_ASSESSMENT',
  'BUSINESS_IMPACT_ANALYSIS',
  'PRIVACY_IMPACT_ANALYSIS',
  'DATA_ASSURANCE',
  'AUDIT',
  'AWARENESS_TRAINING',
  'TABLETOP_EXERCISE',
  'OTHER'
];

interface ProjectProposalUploadProps {
  category: string;
  configurations: ConfigItem[];
  onUpload: (service: string, file: File) => void;
}

const ProjectProposalUpload: React.FC<ProjectProposalUploadProps> = ({ 
  category, 
  configurations, 
  onUpload 
}) => {
  const [view, setView] = useState<'services' | 'upload'>('services');
  const [selectedService, setSelectedService] = useState<string>('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingKey, setDownloadingKey] = useState<string | null>(null);
  
  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setView('upload');
  };
  
  const handleBack = () => {
    setView('services');
    setSelectedService('');
    setUploadFile(null);
    setError(null);
  };
  
  const handleUpload = async () => {
    if (!selectedService || !uploadFile) return;
    
    try {
      setUploading(true);
      setError(null);
      
      // Call the parent's onUpload function which handles the API call
      await onUpload(selectedService, uploadFile);
      
      // Reset form
      setUploadFile(null);
      
      // Return to service selection after successful upload
      setView('services');
      setSelectedService('');
    } catch (err: any) {
      console.error('Error uploading document:', err);
      setError(err?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDownload = async (key: string, value: string) => {
    try {
      setDownloadingKey(key);
      
      // Implement download functionality
      const response = await api.get(`/api/documents/download/${key}`, {
        responseType: 'blob'
      });
      
      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', value); // Use the filename stored in value
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloadingKey(null);
    }
  };
  
  const formatServiceName = (name: string) => {
    return name.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-gray-200 mb-4">{category}</h2>
      
      {error && (
        <div className="bg-red-600/20 border border-red-500 text-red-200 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {view === 'services' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {SERVICE_TYPES.map(service => (
              <div 
                key={service}
                onClick={() => handleServiceSelect(service)}
                className="bg-[#242935] p-4 rounded-lg cursor-pointer hover:bg-[#2e3446] transition-colors flex flex-col justify-between h-full border border-transparent hover:border-blue-500"
              >
                <div className="mb-3">
                  <h3 className="text-gray-200 font-medium leading-tight line-clamp-3">{formatServiceName(service)}</h3>
                </div>
                <div className="mt-auto">
                  <p className="text-blue-400 text-sm">Select →</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Uploaded Documents Section */}
          <div className="mt-8 space-y-4">
            <h3 className="font-medium text-gray-300 border-b border-gray-700 pb-2">Uploaded Documents</h3>
            {configurations.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {configurations.map(item => (
                  <div key={item.id} className="bg-[#242935] p-4 rounded-lg flex justify-between items-center">
                    <div className="overflow-hidden">
                      <p className="text-gray-200 truncate">{formatServiceName(item.key)}</p>
                      <p className="text-gray-400 text-sm truncate">{item.value}</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => handleDownload(item.key, item.value)}
                      disabled={downloadingKey !== null || uploading}
                      className="text-blue-500 hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px] text-center ml-3 flex-shrink-0"
                    >
                      {downloadingKey === item.key ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      ) : 'Download'}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 bg-[#1a1f2b] rounded-lg">
                No documents uploaded yet
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-[#1a1f2b] p-5 rounded-lg">
          <div className="flex items-center mb-4">
            <button 
              type="button" 
              onClick={handleBack}
              className="text-gray-400 hover:text-gray-200 mr-3 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span className="ml-1">Back</span>
            </button>
            <h3 className="text-gray-200 font-medium">Upload for {formatServiceName(selectedService)}</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-[#242935] p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-400 mb-1">Upload Document</label>
              <input
                type="file"
                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                disabled={uploading}
                className="w-full text-gray-200 disabled:opacity-60 bg-[#1a1f2b] p-2 rounded"
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                disabled={!uploadFile || uploading}
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
              >
                {uploading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </span>
                ) : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProposalUpload;