import React, { useState, useEffect } from 'react';
import api from '../../../service/apiService';
import toast from 'react-hot-toast';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  client?: {
    id: string;
    email: string;
    clientProfile?: {
      fullName: string;
      organization: string;
    };
  };
  consultant?: {
    id: string;
    email: string;
    consultantProfile?: {
      contactFirstName: string;
      contactLastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface ProjectPlanUploadProps {
  configurations: ConfigItem[];
  projectId?: string;
}

const ProjectPlanUpload: React.FC<ProjectPlanUploadProps> = ({ configurations }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await api.get('/api/projects');
        setProjects(response.data.data || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
        toast.error('Failed to load projects. Please try again.');
      } finally {
        setProjectsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const uploadExcelFile = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!selectedProjectId) {
      toast.error('Please select a project first');
      return;
    }
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('projectId', selectedProjectId);
    
    try {
      const response = await api.post('/api/tasks/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data?.success) {
        toast.success('Project plan uploaded successfully!');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('excelFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(response.data?.message || 'Failed to upload project plan');
      }
    } catch (err: any) {
      console.error('Error uploading project plan:', err);
      toast.error(err?.message || 'Failed to upload project plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client?.clientProfile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500';
      case 'ON_HOLD':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get client name
  const getClientName = (project: Project) => {
    if (!project.client) return 'N/A';
    if (project.client.clientProfile) {
      return project.client.clientProfile.fullName;
    }
    return project.client.email;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-200">Project Plan Upload</h2>
      </div>
      
      {!selectedProjectId ? (
        <div className="space-y-6">
          <p className="text-gray-400">
            Select a project to upload a plan for. This will import tasks and timelines into the selected project.
          </p>
          
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#242935] text-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Project grid */}
          {projectsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <div 
                    key={project.id} 
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`bg-[#242935] rounded-lg p-4 cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                      selectedProjectId === project.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="text-gray-200 font-medium line-clamp-1">{project.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-gray-400 text-sm mt-2 line-clamp-2">{project.description}</p>
                    )}
                    
                    <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-gray-400">
                      <div>Client:</div>
                      <div className="text-gray-300 truncate">{getClientName(project)}</div>
                      
                      <div>Start:</div>
                      <div className="text-gray-300">{formatDate(project.startDate)}</div>
                      
                      <div>End:</div>
                      <div className="text-gray-300">{formatDate(project.endDate)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-400">
                  No projects found. Try adjusting your search.
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-400 text-sm">Selected Project:</div>
              <div className="text-gray-200 font-medium">
                {projects.find(p => p.id === selectedProjectId)?.name}
              </div>
            </div>
            <button 
              onClick={() => setSelectedProjectId(null)}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              Change Project
            </button>
          </div>
          
          <p className="text-gray-400">
            Upload an Excel file containing the project plan tasks and timeline.
            The system will automatically import tasks from the spreadsheet.
          </p>
          
          <div className="bg-[#242935] rounded-xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Excel File (.xlsx)
              </label>
              <input
                type="file"
                id="excelFile"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-blue-600 file:text-white
                  hover:file:bg-blue-700
                  file:cursor-pointer
                  bg-[#1a1f2b] rounded-lg p-2"
              />
            </div>
            
            {selectedFile && (
              <div className="bg-[#1a1f2b] rounded-lg p-3 text-gray-300">
                Selected: {selectedFile.name}
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={uploadExcelFile}
                disabled={!selectedFile || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  'Import Project Plan'
                )}
              </button>
            </div>
          </div>
        </>
      )}
      
      {configurations.length > 0 && (
        <div className="mt-8">
          <h3 className="text-md font-medium text-gray-200 mb-4">Previous Uploads</h3>
          <div className="space-y-3">
            {configurations.map(config => (
              <div key={config.id} className="bg-[#242935] rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-gray-200 font-medium">{config.key}</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      Uploaded on {new Date(config.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-[#1a1f2b] rounded-lg text-gray-300">
                  {config.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectPlanUpload;





// import React, { useState } from 'react';
// import api from '../../../service/apiService';

// interface ConfigItem {
//   id: string;
//   key: string;
//   value: string;
//   category: string;
//   description?: string;
//   createdAt: string;
//   updatedAt: string;
// }

// // Service types from schema.prisma
// const SERVICE_TYPES = [
//   'ISO_27001_INFORMATION_SECURITY_MANAGEMENT_SYSTEM',
//   'ISO_27701_PRIVACY_INFORMATION_MANAGEMENT_SYSTEM',
//   'ISO_22301_BUSINESS_CONTINUITY_MANAGEMENT_SYSTEM',
//   'ISO_27017_CLOUD_SECURITY_CONTROLS',
//   'ISO_27018_PII_PROTECTION_IN_PUBLIC_CLOUD',
//   'ISO_20000_SERVICE_MANAGEMENT',
//   'ISO_12207_SOFTWARE_LIFE_CYCLE',
//   'ISO_42001_AI_MANAGEMENT_SYSTEM',
//   'TESTING_SERVICES',
//   'RISK_ASSESSMENT',
//   'BUSINESS_IMPACT_ANALYSIS',
//   'PRIVACY_IMPACT_ANALYSIS',
//   'DATA_ASSURANCE',
//   'AUDIT',
//   'AWARENESS_TRAINING',
//   'TABLETOP_EXERCISE',
//   'OTHER'
// ];

// interface ProjectProposalUploadProps {
//   category: string;
//   configurations: ConfigItem[];
//   onUpload: (service: string, file: File) => void;
// }

// const ProjectPlanUpload: React.FC<ProjectProposalUploadProps> = ({ 
//   category, 
//   configurations, 
//   onUpload 
// }) => {
//   const [uploadingService, setUploadingService] = useState<string | null>(null);
//   const [downloadingService, setDownloadingService] = useState<string | null>(null);
//   const [uploadedServices, setUploadedServices] = useState<Set<string>>(
//     new Set(configurations.map(item => item.key))
//   );

//   const formatServiceName = (name: string) => {
//     return name.replace(/_/g, ' ').split(' ').map(word => 
//       word.charAt(0) + word.slice(1).toUpperCase()
//     ).join(' ');
//   };

// const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, service: string) => {
//   const file = e.target.files?.[0];
//   if (!file) return;
//   // Check if the file is an Excel file
//   if (!file.name.endsWith('.xlsx')) {
//     alert('Please upload only Excel files (.xlsx)');
//     e.target.value = ''; // Reset the file input
//     return;
//   }

//   try {
//     setUploadingService(service);
//     await onUpload(service, file);
//     setUploadedServices(prev => new Set(prev).add(service));
//   } catch (error) {
//     console.error('Upload error:', error);
//   } finally {
//     setUploadingService(null);
//     // Reset the file input
//     e.target.value = '';
//   }
// };

//   const handleDownload = async (service: string) => {
//     try {
//       setDownloadingService(service);
      
//       // Find the configuration item for this service
//       const configItem = configurations[0].value;
//       if (!configItem) return;

      
//       // Implement download functionality
//       const response = await api.get(`/api/documents/download/${service}`, {
//         responseType: 'blob'
//       });
      
//       // Create a temporary link to download the file
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', configItem); // Use the filename stored in value
//       document.body.appendChild(link);
//       link.click();
      
//       // Cleanup
//       link.parentNode?.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error('Error downloading document:', err);
//       alert('Failed to download document. Please try again.');
//     } finally {
//       setDownloadingService(null);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <h2 className="text-lg font-medium text-gray-200 mb-4">{category}</h2>
      
//       <div className="bg-[#1a1f2b] rounded-lg p-4">
//         <div className="divide-y divide-gray-700">
//           {SERVICE_TYPES.map(service => (
//             <div key={service} className="flex py-3 first:pt-0 last:pb-0">
//               <div className="w-[70%] flex items-center">
//                 <span className="text-gray-200">{formatServiceName(service)}</span>
//               </div>
//               <div className="w-[30%] flex justify-end">
//                 {uploadedServices.has(service) ? (
//                   <div 
//                     className="text-blue-400 cursor-pointer hover:text-blue-300"
//                     onClick={() => handleDownload(service)}
//                   >
//                     {downloadingService === service ? (
//                       <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                     ) : (
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                       </svg>
//                     )}
//                   </div>
//                 ) : (
//                   <label className="cursor-pointer">
//                     <input
//                       type="file"
//                       className="hidden"
//                       onChange={(e) => handleFileChange(e, service)}
//                       disabled={uploadingService !== null || downloadingService !== null}
//                     />
//                     {uploadingService === service ? (
//                       <span className="text-gray-400">
//                         <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                       </span>
//                     ) : (
//                       <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
//                         Upload
//                       </span>
//                     )}
//                   </label>
//                 )}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectPlanUpload;