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
  const [uploadingService, setUploadingService] = useState<string | null>(null);
  const [downloadingService, setDownloadingService] = useState<string | null>(null);
  const [uploadedServices, setUploadedServices] = useState<Set<string>>(
    new Set(configurations.map(item => item.key))
  );

  const formatServiceName = (name: string) => {
    return name.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0) + word.slice(1).toUpperCase()
    ).join(' ');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, service: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingService(service);
      await onUpload(service, file);
      setUploadedServices(prev => new Set(prev).add(service));
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingService(null);
      // Reset the file input
      e.target.value = '';
    }
  };

  const handleDownload = async (service: string) => {
    try {
      setDownloadingService(service);
      
      // Find the configuration item for this service
      const configItem = configurations[0].value;
      if (!configItem) return;

      
      // Implement download functionality
      const response = await api.get(`/api/documents/download/${service}`, {
        responseType: 'blob'
      });
      
      // Create a temporary link to download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', configItem); // Use the filename stored in value
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading document:', err);
      alert('Failed to download document. Please try again.');
    } finally {
      setDownloadingService(null);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-200 mb-4">{category}</h2>
      
      <div className="bg-[#1a1f2b] rounded-lg p-4">
        <div className="divide-y divide-gray-700">
          {SERVICE_TYPES.map(service => (
            <div key={service} className="flex py-3 first:pt-0 last:pb-0">
              <div className="w-[70%] flex items-center">
                <span className="text-gray-200">{formatServiceName(service)}</span>
              </div>
              <div className="w-[30%] flex justify-end">
                {uploadedServices.has(service) ? (
                  <div 
                    className="text-blue-400 cursor-pointer hover:text-blue-300"
                    onClick={() => handleDownload(service)}
                  >
                    {downloadingService === service ? (
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, service)}
                      disabled={uploadingService !== null || downloadingService !== null}
                    />
                    {uploadingService === service ? (
                      <span className="text-gray-400">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Upload
                      </span>
                    )}
                  </label>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectProposalUpload;