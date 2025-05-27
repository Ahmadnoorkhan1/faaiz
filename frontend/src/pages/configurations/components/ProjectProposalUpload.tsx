import React, { useState, useRef, useEffect } from "react";
import api from "../../../service/apiService";
import ProposalPreview from "./ProposalPreview";
import ProposalBuilder from "./ProposalBuilder";
import ProposalGeneration from "../../ClientOnboarding/components/ProposalGeneration";
import toast from "react-hot-toast";

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


interface ProjectProposalUploadProps {
  category: string;
  configurations: ConfigItem[];
  onUpload: (service: string, file: File) => void;
}

// New interface for modal content data
interface ProposalData {
  data: {
    id: string;
    serviceType: string;
    phases: Array<{
      id: number;
      phase: string;
      deliverables: string;
    }>;
    timeline: Array<{
      id: number;
      phase: string;
      description: string;
    }>;
    deliverables: Array<{
      id: number;
      title: string;
      description: string;
    }>;
  };
}

export const formatServiceName = (name: string) => {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toUpperCase())
    .join(" ");
};

const ProjectProposalUpload: React.FC<ProjectProposalUploadProps> = ({
  category,
  configurations,
  onUpload,
}) => {
  const [uploadingService, setUploadingService] = useState<string | null>(null);
  const [existingProposal, setExistingProposal] = useState<any>([]);

  // const [downloadingService, setDownloadingService] = useState<string | null>(null);
  // const [uploadedServices, setUploadedServices] = useState<Set<string>>(
  //   new Set(configurations.map((item) => item.key))
  // );

  // Add new state for proposal builder
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showViewProposalModal, setShowViewProposalModal] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [proposalData, setProposalData] = useState<ProposalData>({
    data: {
      id: "",
      serviceType: "",
      phases: [
        {
          id: 1,
          phase: "Kick Off",
          deliverables:
            "Implementation methodology, Project point of contact, List of Deliverables, Information requisition, Draft project plan​",
        },
        {
          id: 2,
          phase: "Info Acquisition",
          deliverables:
            "IT infrastructure Details, Existing policies and procedures\nPrevious risk assessment or audit reports",
        },
      ],
      timeline: [
        {
          id: 1,
          phase: "D1",
          description:
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
        },
      ],
      deliverables: [
        {
          id: 1,
          title: "Initial Report",
          description: "Comprehensive analysis document",
        },
      ],
    },
  });
  const proposalRef = useRef<HTMLDivElement>(null);
  // const [downloading, setDownloading] = useState(false);

  const handleShowPreview = (flag: boolean) => {
    setShowPreview(flag);
  };
  const [services,setServices]=useState([]);
  useEffect(()=>{
    const fetchProposals = async () => {
      const response = await api.get('/api/proposals/getAllProposals');
      setExistingProposal(response.data.data);

      console.log("Existing proposals:", response.data.data);
    }


    const getServices= async () => {

      try {
        const response = await api.get('/api/services');
        if (response.data.success) {
          console.log("Fetched services:", response.data.data);
          setServices(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }
    fetchProposals();
    getServices();

     
  },[])

 

  // Modify the handleOpenProposalBuilder function to fetch data
  const handleOpenProposalBuilder = async (service: string) => {
    try {
      // await handleGetProposal(service);
      setSelectedService(service);
      setShowProposalModal(true);
    } catch (error) {
      console.error("Error loading proposal:", error);
    }
  };

  const handleViewProposal = async (service: string) => {
    try {
      setSelectedService(service);
      setShowViewProposalModal(true);
      setSelectedProposal(existingProposal.find((item: any) => item.serviceType === service));
    } catch (error) {
      console.error("Error loading proposal:", error);
    }
  };

  const handleCloseProposalBuilder = () => {
    setShowProposalModal(false);
    setSelectedService(null);
    setShowPreview(false);
  };

  const handleGenerateProposal = async (data: {
    service: string;
    phases: Array<{ id: number; phase: string; deliverables: string }>;
    timeline: Array<{ id: number; phase: string; description: string }>;
    deliverables: Array<{ id: number; title: string; description: string }>;
  }) => {

    // console.log("Generating proposal with data:", data);
    // return;
    try {
      setUploadingService(data.service);

      // console.log("gg",data.service);
      // Get auth token from localStorage if you're using it
      const token = localStorage.getItem("token");

      const transformedData = {
        serviceType: data.service,
        phases: data.phases,
        timeline: data.timeline,
        deliverables: data.deliverables,
      };

      console.log("Sending transformed data:", transformedData);

      const response = await api.post(
        "/api/proposals/createProposal",
        transformedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 201) {
        console.log("Proposal generated successfully");
        // setUploadedServices((prev) => new Set(prev).add(data.service));
        handleCloseProposalBuilder();
        toast.success("Proposal generated successfully!");
      }
    } catch (error: any) {
      console.error("Error generating proposal:", error);
      toast.error(error.response.data.message);
    } finally {
      setUploadingService(null);
    }
  };
  // Handle adding new items to tables
  const handleAddApproachPhase = () => {
    const newId =
      proposalData.data.phases.length > 0
        ? Math.max(...proposalData.data.phases.map((item) => item.id)) + 1
        : 1;
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        phases: [
          ...proposalData.data.phases,
          { id: newId, phase: "", deliverables: "" },
        ],
      },
    });
  };

  const handleAddTimelineItem = () => {
    const newId =
      proposalData.data.timeline.length > 0
        ? Math.max(...proposalData.data.timeline.map((item) => item.id)) + 1
        : 1;
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        timeline: [
          ...proposalData.data.timeline,
          { id: newId, phase: "", description: "" },
        ],
      },
    });
  };

  const handleAddDeliverable = () => {
    const newId =
      proposalData.data.deliverables.length > 0
        ? Math.max(...proposalData.data.deliverables.map((item) => item.id)) + 1
        : 1;
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        deliverables: [
          ...proposalData.data.deliverables,
          { id: newId, title: "", description: "" },
        ],
      },
    });
  };

  // Handle updating items in tables
  const handleUpdateApproachPhase = (
    id: number,
    field: "phase" | "deliverables",
    value: string
  ) => {
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        phases: proposalData.data.phases.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    });
  };

  const handleUpdateTimelineItem = (
    id: number,
    field: "phase" | "description",
    value: string
  ) => {
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        timeline: proposalData.data.timeline.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    });
  };

  const handleUpdateDeliverable = (
    id: number,
    field: "title" | "description",
    value: string
  ) => {
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        deliverables: proposalData.data.deliverables.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    });
  };

  // Handle removing items from tables
  const handleRemoveApproachPhase = (id: number) => {
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        phases: proposalData.data.phases.filter((item) => item.id !== id),
      },
    });
  };

  const handleRemoveTimelineItem = (id: number) => {
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        timeline: proposalData.data.timeline.filter((item) => item.id !== id),
      },
    });
  };

  const handleRemoveDeliverable = (id: number) => {
    setProposalData({
      ...proposalData,
      data: {
        ...proposalData.data,
        deliverables: proposalData.data.deliverables.filter(
          (item) => item.id !== id
        ),
      },
    });
  };

  const handleSaveProposal = async () => {
    if (selectedService) {
      try {
        // Here you would save the proposal data to your backend
        // For now, we're just marking it as uploaded
        // setUploadedServices((prev) => new Set(prev).add(selectedService));
        setShowProposalModal(false);
        setSelectedService(null);
        setShowPreview(false);
      } catch (error) {
        console.error("Error saving proposal:", error);
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
          {services && services.map((service:any,index:number) => (
            <div key={index} className="flex py-3 first:pt-0 last:pb-0">
              <div className="w-[70%] flex items-center">
                <span className="text-gray-200">
                  {formatServiceName(service.name)}
                </span>
              </div>
              <div className="w-[30%] flex justify-end">
              {existingProposal.find((prop: any) => prop.serviceType === service.name) ? (
                    <button
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    onClick={() => handleViewProposal(service.name)}
                    disabled={uploadingService !== null}
                  >
                    View Proposal
                  </button>
                ) : (
                  <button
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    onClick={() => handleOpenProposalBuilder(service.name)}
                    disabled={uploadingService !== null}
                  >
                    Generate Proposal
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
      {
        showViewProposalModal && selectedService && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
        <div className="bg-[#1a1f2b] rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-200">
              Proposal for {formatServiceName(selectedService)}
            </h2>
            <button 
              onClick={() => setShowViewProposalModal(false)}
              className="text-gray-400 hover:text-gray-200 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <ProposalGeneration
            name={'name'}
            organization={'organization'}
            requestedServices={selectedService}
            proposalData={selectedProposal}
          />
        </div>
    </div>      
        )
      }
    </div>

  );
};

export default ProjectProposalUpload;
