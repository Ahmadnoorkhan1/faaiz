import React from 'react'
import { formatServiceName } from './ProjectProposalUpload'

interface ProposalData {
  selectedService: string;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  proposalData: {
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
  };
  handleCloseProposalBuilder: () => void;
  handleAddApproachPhase: () => void;
  handleAddTimelineItem: () => void;
  handleAddDeliverable: () => void;
  handleUpdateApproachPhase: (id: number, field: 'phase' | 'deliverables', value: string) => void;
  handleUpdateTimelineItem: (id: number, field: 'phase' | 'description', value: string) => void;
  handleUpdateDeliverable: (id: number, field: 'title' | 'description', value: string) => void;
  handleRemoveApproachPhase: (id: number) => void;
  handleRemoveTimelineItem: (id: number) => void;
  handleRemoveDeliverable: (id: number) => void;
  handleGenerateProposal: (data: {
    service: string;
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
  }) => void;
}

const ProposalBuilder:React.FC<ProposalData> = ({
  selectedService,
  showPreview,
  setShowPreview,
  proposalData,
  handleCloseProposalBuilder,
  handleAddApproachPhase,
  handleAddTimelineItem,
  handleAddDeliverable,
  handleUpdateApproachPhase,
  handleUpdateTimelineItem,
  handleUpdateDeliverable,
  handleRemoveApproachPhase,
  handleRemoveTimelineItem,
  handleRemoveDeliverable,
  handleGenerateProposal,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-[#1a1f2b] rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {!showPreview ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-200">
                    Proposal Builder - {formatServiceName(selectedService)}
                  </h2>
                  <button 
                    onClick={handleCloseProposalBuilder}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>


                {/* Approach Phases Table */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-200">Overall Approach</h3>
                    <button 
                      onClick={handleAddApproachPhase}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add Phase
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-700 text-sm">
                      <thead>
                        <tr className="bg-gray-800 text-white">
                          <th className="border border-gray-700 px-4 py-2">No</th>
                          <th className="border border-gray-700 px-4 py-2">Phases</th>
                          <th className="border border-gray-700 px-4 py-2">Deliverables</th>
                          <th className="border border-gray-700 px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                     {proposalData?.data?.phases?.map((item: any, index: number) => (
  <tr key={item.id}>
    <td className="border border-gray-700 px-4 py-2 text-white">{index + 1}</td>
    <td className="border border-gray-700 px-4 py-2">
      <input
        type="text"
        value={item.phase}
        onChange={(e) => handleUpdateApproachPhase(item.id, 'phase', e.target.value)}
        className="w-full bg-gray-700 text-white px-2 py-1 rounded"
      />
    </td>
    <td className="border border-gray-700 px-4 py-2">
      <textarea
        value={item.deliverables}
        onChange={(e) => handleUpdateApproachPhase(item.id, 'deliverables', e.target.value)}
        className="w-full bg-gray-700 text-white px-2 py-1 rounded"
        rows={2}
      />
    </td>
    <td className="border border-gray-700 px-4 py-2">
      <button 
        onClick={() => handleRemoveApproachPhase(item.id)}
        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
      >
        Remove
      </button>
    </td>
  </tr>
))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Project Timeline Table */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-200">Project Timeline</h3>
                    <button 
                      onClick={handleAddTimelineItem}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add Timeline Item
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-700 text-sm">
                      <thead>
                        <tr className="bg-gray-800 text-white">
                          <th className="border border-gray-700 px-4 py-2">Phase</th>
                          <th className="border border-gray-700 px-4 py-2">Description</th>
                          <th className="border border-gray-700 px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                       {proposalData?.data?.timeline?.map((item: any) => (
  <tr key={item.id}>
    <td className="border border-gray-700 px-4 py-2">
      <input
        type="text"
        value={item.phase}
        onChange={(e) => handleUpdateTimelineItem(item.id, 'phase', e.target.value)}
        className="w-full bg-gray-700 text-white px-2 py-1 rounded"
      />
    </td>
    <td className="border border-gray-700 px-4 py-2">
      <textarea
        value={item.description}
        onChange={(e) => handleUpdateTimelineItem(item.id, 'description', e.target.value)}
        className="w-full bg-gray-700 text-white px-2 py-1 rounded"
        rows={2}
      />
    </td>
    <td className="border border-gray-700 px-4 py-2">
      <button 
        onClick={() => handleRemoveTimelineItem(item.id)}
        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
      >
        Remove
      </button>
    </td>
  </tr>
))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Project Deliverables Table */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-200">Project Deliverables</h3>
                    <button 
                      onClick={handleAddDeliverable}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Add Deliverable
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-700 text-sm">
                      <thead>
                        <tr className="bg-gray-800 text-white">
                          <th className="border border-gray-700 px-4 py-2">Title</th>
                          <th className="border border-gray-700 px-4 py-2">Description</th>
                          <th className="border border-gray-700 px-4 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                       {proposalData?.data?.deliverables?.map((item: any) => (
  <tr key={item.id}>
    <td className="border border-gray-700 px-4 py-2">
      <input
        type="text"
        value={item.title}
        onChange={(e) => handleUpdateDeliverable(item.id, 'title', e.target.value)}
        className="w-full bg-gray-700 text-white px-2 py-1 rounded"
      />
    </td>
    <td className="border border-gray-700 px-4 py-2">
      <textarea
        value={item.description}
        onChange={(e) => handleUpdateDeliverable(item.id, 'description', e.target.value)}
        className="w-full bg-gray-700 text-white px-2 py-1 rounded"
        rows={2}
      />
    </td>
    <td className="border border-gray-700 px-4 py-2">
      <button 
        onClick={() => handleRemoveDeliverable(item.id)}
        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
      >
        Remove
      </button>
    </td>
  </tr>
))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button 
                    onClick={handleCloseProposalBuilder}
                    className="px-4 py-2 text-gray-400 hover:text-gray-200 mr-4"
                  >
                    Cancel
                  </button>
                <button 
  onClick={() => handleGenerateProposal({
    service: selectedService,
    phases: proposalData.data.phases,
    timeline: proposalData.data.timeline,
    deliverables: proposalData.data.deliverables
  })}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Generate Proposal
</button>
                </div>
              </>
            ) : null}
          </div>
        </div>
  )
}

export default ProposalBuilder