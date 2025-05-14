import React from 'react';
import { Consultant } from '../../../../types/consultant';
import StatusBadge from './StatusBadge';

interface ConsultantDetailModalProps {
  consultant: Consultant;
  onClose: () => void;
  onInvite: (consultant: Consultant) => void;
  onReview: (consultant: Consultant) => void;
}

const ConsultantDetailModal: React.FC<ConsultantDetailModalProps> = ({
  consultant,
  onClose,
  onInvite,
  onReview
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActionButton = () => {
    const { status } = consultant;
    
    if (status === 'PENDING_REVIEW') {
      return (
        <button
          onClick={() => onInvite(consultant)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Invite for Interview
        </button>
      );
    }
    
    if (status === 'INTERVIEW_SCHEDULED') {
      return (
        <button
          onClick={() => onReview(consultant)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Review Consultant
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl shadow-xl p-6 w-full max-w-3xl my-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold text-gray-200">
            Consultant Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Basic info */}
          <div className="col-span-1">
            <div className="flex flex-col items-center mb-4">
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-semibold mb-3">
                {consultant.contactFirstName.charAt(0)}{consultant.contactLastName.charAt(0)}
              </div>
              <h3 className="text-lg font-semibold text-gray-200">
                {consultant.contactFirstName} {consultant.contactLastName}
              </h3>
              <p className="text-sm text-gray-400">{consultant.position}</p>
              <div className="mt-2">
                <StatusBadge status={consultant.status} />
              </div>
            </div>
            
            <div className="mt-6 space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Email</h4>
                <p className="text-sm text-gray-200">{consultant.email}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Phone</h4>
                <p className="text-sm text-gray-200">{consultant.phone}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Organization</h4>
                <p className="text-sm text-gray-200">{consultant.organizationWebsite}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Experience</h4>
                <p className="text-sm text-gray-200">{consultant.experience}</p>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Industry</h4>
                <p className="text-sm text-gray-200">{consultant.industry}</p>
              </div>
            </div>
          </div>
          
          {/* Middle column - Services & certifications */}
          <div className="col-span-1">
            <h3 className="text-md font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
              Services Offered
            </h3>
            <div className="space-y-2 mb-6">
              {consultant.servicesOffered.length === 0 ? (
                <p className="text-sm text-gray-400">No services listed</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {consultant.servicesOffered.map((service, index) => (
                    <li key={index} className="text-sm text-gray-200">
                      {service.replace(/_/g, ' ')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <h3 className="text-md font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
              Certifications
            </h3>
            <div className="space-y-2">
              {consultant.certifications.length === 0 ? (
                <p className="text-sm text-gray-400">No certifications listed</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {consultant.certifications.map((cert, index) => (
                    <li key={index} className="text-sm text-gray-200">
                      {cert}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {consultant.cvUrl && (
              <div className="mt-6">
                <h3 className="text-md font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
                  Resume/CV
                </h3>
                <a
                  href={consultant.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-500 hover:text-blue-400"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  View CV
                </a>
              </div>
            )}
          </div>
          
          {/* Right column - Interview & review info */}
          <div className="col-span-1">
            <h3 className="text-md font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
              Interview Details
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Interview Date</h4>
                <p className="text-sm text-gray-200">{formatDate(consultant.interviewDate)}</p>
              </div>
              
              {consultant.interviewScore !== null && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase">Interview Score</h4>
                  <div className="flex items-center">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-sm text-gray-200">{consultant.interviewScore.toFixed(1)}/5.0</span>
                  </div>
                </div>
              )}
              
              {consultant.reviewNotes && (
                <div>
                  <h4 className="text-xs font-medium text-gray-400 uppercase">Review Notes</h4>
                  <p className="text-sm text-gray-200 whitespace-pre-line">{consultant.reviewNotes}</p>
                </div>
              )}
            </div>
            
            <h3 className="text-md font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
              Account Status
            </h3>
            <div className="space-y-2 mb-6">
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Login Allowed</h4>
                <div className={`text-sm ${consultant.isAllowedToLogin ? 'text-green-500' : 'text-red-500'}`}>
                  {consultant.isAllowedToLogin ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Profile Completed</h4>
                <div className={`text-sm ${consultant.profileCompleted ? 'text-green-500' : 'text-yellow-500'}`}>
                  {consultant.profileCompleted ? 'Yes' : 'No'}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-medium text-gray-400 uppercase">Registration Date</h4>
                <p className="text-sm text-gray-200">{formatDate(consultant.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          {renderActionButton()}
        </div>
      </div>
    </div>
  );
};

export default ConsultantDetailModal;