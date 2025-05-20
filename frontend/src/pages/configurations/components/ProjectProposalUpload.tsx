import React, { useState, useRef } from 'react';
import api from '../../../service/apiService';
import ProposalPreview from './ProposalPreview';
import ProposalBuilder from './ProposalBuilder';

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

// New interface for modal content data
interface ProposalData {
  approachPhases: {id: number, phase: string, deliverables: string}[];
  timeline: {id: number, phase: string, description: string}[];
  deliverables: {id: number, title: string, description: string}[];
}

export const formatServiceName = (name: string) => {
  return name.replace(/_/g, ' ').split(' ').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

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
  
  // Add new state for proposal builder
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData>({
    approachPhases: [
      { id: 1, phase: "Kick Off", deliverables: "Implementation methodology, Project point of contact, List of Deliverables, Information requisition, Draft project plan​" },
      { id: 2, phase: "Info Acquisition", deliverables: "IT infrastructure Details, Existing policies and procedures\nPrevious risk assessment or audit reports" }
    ],
    timeline: [
      { id: 1, phase: "D1", description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos." }
    ],
    deliverables: [
      { id: 1, title: "Initial Report", description: "Comprehensive analysis document" }
    ]
  });
  const proposalRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);


  const handleShowPreview = (flag: boolean) => {
    setShowPreview(flag);
  }
 

  // Keep existing handleFileChange and handleDownload for backwards compatibility, but commented out
  /* 
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
  */

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

  // Add new handlers for proposal generation
  const handleOpenProposalBuilder = (service: string) => {
    setSelectedService(service);
    setShowProposalModal(true);
  };

  const handleCloseProposalBuilder = () => {
    setShowProposalModal(false);
    setSelectedService(null);
    setShowPreview(false);
  };

  const handleGenerateProposal = () => {

    console.log(proposalData,' <<< ', selectedService)
    // Here you would generate and save the proposal
    // For now just mark as generated
    // if (selectedService) {
    //   setUploadedServices(prev => new Set(prev).add(selectedService));
    //   // setShowPreview(true);
    // }
  };

  // Handle adding new items to tables
  const handleAddApproachPhase = () => {
    const newId = proposalData.approachPhases.length > 0 ? 
      Math.max(...proposalData.approachPhases.map(item => item.id)) + 1 : 1;
    setProposalData({
      ...proposalData,
      approachPhases: [
        ...proposalData.approachPhases,
        { id: newId, phase: "", deliverables: "" }
      ]
    });
  };

  const handleAddTimelineItem = () => {
    const newId = proposalData.timeline.length > 0 ? 
      Math.max(...proposalData.timeline.map(item => item.id)) + 1 : 1;
    setProposalData({
      ...proposalData,
      timeline: [
        ...proposalData.timeline,
        { id: newId, phase: "", description: "" }
      ]
    });
  };

  const handleAddDeliverable = () => {
    const newId = proposalData.deliverables.length > 0 ? 
      Math.max(...proposalData.deliverables.map(item => item.id)) + 1 : 1;
    setProposalData({
      ...proposalData,
      deliverables: [
        ...proposalData.deliverables,
        { id: newId, title: "", description: "" }
      ]
    });
  };

  // Handle updating items in tables
  const handleUpdateApproachPhase = (id: number, field: 'phase' | 'deliverables', value: string) => {
    setProposalData({
      ...proposalData,
      approachPhases: proposalData.approachPhases.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const handleUpdateTimelineItem = (id: number, field: 'phase' | 'description', value: string) => {
    setProposalData({
      ...proposalData,
      timeline: proposalData.timeline.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const handleUpdateDeliverable = (id: number, field: 'title' | 'description', value: string) => {
    setProposalData({
      ...proposalData,
      deliverables: proposalData.deliverables.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  // Handle removing items from tables
  const handleRemoveApproachPhase = (id: number) => {
    setProposalData({
      ...proposalData,
      approachPhases: proposalData.approachPhases.filter(item => item.id !== id)
    });
  };

  const handleRemoveTimelineItem = (id: number) => {
    setProposalData({
      ...proposalData,
      timeline: proposalData.timeline.filter(item => item.id !== id)
    });
  };

  const handleRemoveDeliverable = (id: number) => {
    setProposalData({
      ...proposalData,
      deliverables: proposalData.deliverables.filter(item => item.id !== id)
    });
  };

  const handleSaveProposal = async () => {
    if (selectedService) {
      try {
        // Here you would save the proposal data to your backend
        // For now, we're just marking it as uploaded
        setUploadedServices(prev => new Set(prev).add(selectedService));
        setShowProposalModal(false);
        setSelectedService(null);
        setShowPreview(false);
      } catch (error) {
        console.error('Error saving proposal:', error);
      }
    }
  };

  const handlePrintProposal = () => {
    const printContents = proposalRef.current?.innerHTML;
    if (!printContents) return;
    
    const originalContents = document.body.innerHTML;
    const printStyles = `
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        h1 { text-align: center; font-size: 1.5rem; margin-bottom: 1.5rem; }
        h2 { font-size: 1.2rem; margin-top: 1.5rem; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; }
        section { margin-bottom: 2rem; }
        @media print {
          body { padding: 20mm; }
          button { display: none; }
        }
      </style>
    `;
    
    // Set content to print
    document.body.innerHTML = printStyles + printContents;
    
    // Print
    window.print();
    
    // Restore original content
    document.body.innerHTML = originalContents;
    
    // Force a re-render to restore React's event handlers
    window.location.reload();
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
                  <button
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    onClick={() => handleOpenProposalBuilder(service)}
                    disabled={uploadingService !== null || downloadingService !== null}
                  >
                    {uploadingService === service ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </span>
                    ) : (
                      "Generate Proposal"
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proposal Builder Modal */}
      {showProposalModal && selectedService && (
        <ProposalBuilder
          selectedService={selectedService}
          showPreview={showPreview}
          setShowPreview={handleShowPreview}
          proposalData={proposalData}
          handleCloseProposalBuilder={handleCloseProposalBuilder}
          handleAddApproachPhase={handleAddApproachPhase}
          handleAddTimelineItem={handleAddTimelineItem}
          handleAddDeliverable={handleAddDeliverable}
          handleUpdateApproachPhase={handleUpdateApproachPhase}
          handleUpdateTimelineItem={handleUpdateTimelineItem}
          handleUpdateDeliverable={handleUpdateDeliverable}
          handleRemoveApproachPhase={handleRemoveApproachPhase}
          handleRemoveTimelineItem={handleRemoveTimelineItem}
          handleRemoveDeliverable={handleRemoveDeliverable}
          handleGenerateProposal={handleGenerateProposal}
         />
      )}
    </div>
  );
};

export default ProjectProposalUpload;