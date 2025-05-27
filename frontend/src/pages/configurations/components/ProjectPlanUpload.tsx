import React, { useState, useEffect } from 'react';
import api from '../../../service/apiService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../../utils/AuthContext';
import { AnyZodObject } from 'zod';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  fileUrl: string;
  fileType: string;
  title: string;
  description: string | null;
  documentType: string;
  serviceType: string;
  uploadedById: string;
  clientId: string | null;
  consultantId: string | null;
  createdAt: string;
  updatedAt: string;
  client: any | null;
  consultant: any | null;
  uploadedBy: {
    id: string;
    email: string;
  };
}

interface ProjectPlanUploadProps {
  configurations: ConfigItem[];
  category?: string;
}

const ProjectPlanUpload: React.FC<ProjectPlanUploadProps> = ({ 
  configurations,
  category = 'Project Plan' 
}) => {
  const [uploadingService, setUploadingService] = useState<string | null>(null);
  const [downloadingService, setDownloadingService] = useState<string | null>(null);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [documents, setDocuments] = useState<Record<string, Document>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadedServices, setUploadedServices] = useState<Set<string>>(new Set());
  const [fetchingServiceTypes, setFetchingServiceTypes] = useState<boolean>(true);
  const [fetchingDocuments, setFetchingDocuments] = useState<boolean>(true);
  const [loadingServices, setLoadingServices] = useState<Record<string, boolean>>({});
  const [replacingServices, setReplacingServices] = useState<Record<string, boolean>>({});
  const {user} = useAuth();

  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        setFetchingServiceTypes(true);
        const response = await api.get('/api/services');
        
        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Failed to fetch service types');
        }
        
        if (response.data && Array.isArray(response.data.data)) {
          setServiceTypes(response.data.data);
          
          console.log("Fetched service types1:", response.data.data);
        } else if (response.data && Array.isArray(response.data)) {
          setServiceTypes(response.data);
        }
      } catch (error) {
        console.error('Error fetching service types:', error);
      } finally {
        setFetchingServiceTypes(false);
      }
    };

    fetchServiceTypes();
  }, []);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setFetchingDocuments(true);
        const docsMap: Record<string, Document> = {};
        const uploadedSet = new Set<string>();
        
        for (const serviceType of serviceTypes as any) {
          try {
            setLoadingServices(prev => ({ ...prev, [serviceType]: true }));
            const response = await api.get(`/api/documents/by-service/${serviceType.name}`);
            
            if (response.data?.success === false) {
              throw new Error(response.data?.message || `Failed to fetch documents for ${serviceType}`);
            }
            
            const docs = response.data.data || response.data || [];
            if (docs.length > 0) {
              const latestDoc = docs.sort((a: Document, b: Document) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              )[0];
              docsMap[serviceType] = latestDoc;
              uploadedSet.add(serviceType);
            }
            } catch (err) {
            console.error(`Error fetching documents for ${serviceType}:`, err);
          } finally {
            setLoadingServices(prev => ({ ...prev, [serviceType]: false }));
          }
        }
        
        setDocuments(docsMap);
        setUploadedServices(uploadedSet);
      } catch (error) {
        console.error('Error fetching documents:', error);
      } finally {
        setFetchingDocuments(false);
      }
    };

    if (serviceTypes.length > 0) {
      fetchDocuments();
    }
  }, [serviceTypes]);

  const formatServiceName = (name: string) => {
    return name
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getFileIcon = (fileType: string) => {
    if(typeof(fileType)!=='string'){
      return
    }
    if ((fileType.includes('spreadsheet') || fileType.includes('excel'))) {
      return (
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('document') || fileType.includes('word')) {
      return (
        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v-1H5v1h10zm0 2v1H5v-1h10z" clipRule="evenodd" />
        </svg>
      );
    } else if (fileType.includes('pdf')) {
      return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm8 8v-1H5v1h10zm0 2v1H5v-1h10z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, service: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.docx') && !file.name.endsWith('.pdf')) {
      alert('Please upload only .xlsx, .docx, or .pdf files');
      e.target.value = '';
      return;
    }

    try {
      
      setUploadingService(service);
      
      if (uploadedServices.has(service)) {
        setReplacingServices(prev => ({ ...prev, [service]: true }));
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('serviceType', service);
      formData.append('category', category);
      formData.append('documentType', 'ProjectPlan');
      formData.append('userId',user.id);
      
      const response = await api.post(`/api/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to upload document');
      }
      
      setUploadedServices(prev => new Set([...prev, service]));
      
      let uploadedDoc = null;
      if (Array.isArray(response.data)) {
        uploadedDoc = response.data[0];
      } else if (response.data?.data) {
        uploadedDoc = Array.isArray(response.data.data) ? response.data.data[0] : response.data.data;
      }
      
      if (uploadedDoc) {
        setDocuments(prev => ({ ...prev, [service]: uploadedDoc }));
      } else {
        const docsResponse = await api.get(`/api/documents/by-service/${service}`);
        if (docsResponse.data.success !== false) {
          const docs = docsResponse.data.data || docsResponse.data || [];
          if (docs.length > 0) {
            const latestDoc = docs.sort((a: Document, b: Document) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0];
            setDocuments(prev => ({ ...prev, [service]: latestDoc }));
          }
        }
      }
       if (uploadedServices.has(service)) {
      toast.success(`Template for ${formatServiceName(service)} replaced successfully`);
    } else {
      toast.success(`Template for ${formatServiceName(service)} uploaded successfully`);
    }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload document: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingService(null);
      if (uploadedServices.has(service)) {
        setReplacingServices(prev => ({ ...prev, [service]: false }));
      }
      e.target.value = '';
    }
  };

  const handleDownload = async (service: string) => {
    if (!documents[service]) {
      alert('No document found for this service');
      return;
    }
    
    try {
      setDownloadingService(service);
      
      const doc = documents[service];
      
      if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank');
        setDownloadingService(null);
        return;
      }
      
      const response = await api.get(`/api/documents/download/${doc.id}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.title || 'document');
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      alert(`Failed to download document: ${err.message || 'Unknown error'}`);
    } finally {
      setDownloadingService(null);

    }
  };

  const handleDeleteDocument = async (service: any) => {
    const docId = service.documents[0].id
    if (!docId) {
      alert('No document found for this service');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }
    
    try {
      
      const response = await api.delete(`/api/documents/${docId}`);
      
      if (response.data?.success === false) {
        throw new Error(response.data?.message || 'Failed to delete document');
      }
      
      setUploadedServices(prev => {
        const next = new Set([...prev]);
        next.delete(service);
        return next;
      });
      
      setDocuments(prev => {
        const next = { ...prev };
        delete next[service];
        return next;
      });
      
    toast.success(`Template for ${formatServiceName(service.name)} deleted successfully`);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      toast.error(`Failed to delete document: ${err.message || 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-200">{category} Templates</h2>
        {(fetchingServiceTypes || fetchingDocuments) && (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-gray-400">
              {fetchingServiceTypes ? 'Loading services...' : 'Loading documents...'}
            </span>
          </div>
        )}
      </div>
      
      {fetchingServiceTypes ? (
        <ServiceTypesSkeletonLoader />
      ) : serviceTypes.length === 0 ? (
        <div className="bg-[#1a1f2b] rounded-xl p-6 text-center text-gray-400">
          <p>No service types available. Please check with the administrator.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceTypes.map((service:any,index:number) => (
            <div 
              key={index} 
              className="bg-[#242935] rounded-xl overflow-hidden shadow-md transition-all hover:shadow-lg"
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-gray-200 font-medium truncate" title={formatServiceName(service.name)}>
                  {formatServiceName(service.name)}
                </h3>
              </div>
              
              {loadingServices[service] ? (
                <div className="p-4">
                  <DocumentSkeletonLoader />
                </div>
              ) : uploadedServices.has(service)  ? (
                <div className="p-4">
                  <div className="bg-[#1a1f2b] rounded-lg p-3 mb-3">
                    <div className="flex items-start space-x-3">
                      {getFileIcon(service.documents[0].fileType)}
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-200 font-medium truncate">
                          {/* {documents[service].title} */}
                          {service.documents[0].title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Uploaded by Admin • {formatDateTime(service.documents[0].createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleDownload(service)}
                          disabled={downloadingService === service}
                          className="inline-flex items-center px-3 py-1 rounded-md bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 transition-colors text-sm"
                        >
                          {downloadingService === service ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Downloading...
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Download
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleDeleteDocument(service)}
                          disabled={uploadingService === service || downloadingService === service}
                          className="inline-flex items-center px-3 py-1 rounded-md bg-red-600/20 text-red-400 hover:bg-red-600/30 transition-colors text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <label className="cursor-pointer w-full">
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.docx,.pdf"
                        onChange={(e) => handleFileChange(e, service)}
                        disabled={uploadingService !== null || replacingServices[service]}
                      />
                      <span className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors text-sm">
                        {replacingServices[service] ? (
                          <>
                            <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Replacing...
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Replace Document
                          </>
                        )}
                      </span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd"></path>
                        </svg>
                        No template uploaded
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-center">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.docx,.pdf"
                        onChange={(e) => handleFileChange(e, service.name)}
                        disabled={uploadingService !== null}
                      />
                      {uploadingService === service.name ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400">
                          <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Upload Template
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectPlanUpload;


// Skeleton loader for service types
const ServiceTypesSkeletonLoader = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3, 4, 5, 6].map((index) => (
      <div key={index} className="bg-[#242935] rounded-xl overflow-hidden shadow-md animate-pulse">
        <div className="p-4 border-b border-gray-700">
          <div className="h-5 bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="p-4">
          <div className="h-24 bg-[#1a1f2b] rounded-lg"></div>
          <div className="mt-4 flex justify-center">
            <div className="h-10 bg-gray-700 rounded-lg w-32"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Skeleton loader for a single service document
const DocumentSkeletonLoader = () => (
  <div className="bg-[#1a1f2b] rounded-lg p-3 mb-3 animate-pulse">
    <div className="flex items-start space-x-3">
      <div className="w-6 h-6 bg-gray-700 rounded"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-700 flex justify-between items-center">
      <div className="flex space-x-3">
        <div className="h-6 bg-gray-700 rounded w-24"></div>
        <div className="h-6 bg-gray-700 rounded w-20"></div>
      </div>
    </div>
  </div>
);