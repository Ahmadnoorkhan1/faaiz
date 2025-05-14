import React from 'react';
import { Consultant, ConsultantStatus } from '../../../../types/consultant';
import StatusBadge from './StatusBadge';

interface ConsultantTableProps {
  consultants: Consultant[];
  loading: boolean;
  error: string | null;
  onViewDetails: (consultant: Consultant) => void;
  onInvite: (consultant: Consultant) => void;
  onReview: (consultant: Consultant) => void;
}

const ConsultantTable: React.FC<ConsultantTableProps> = ({
  consultants,
  loading,
  error,
  onViewDetails,
  onInvite,
  onReview
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActionButtons = (consultant: Consultant) => {
    const { status } = consultant;
    
    return (
      <div className="flex space-x-2">
        <button
          onClick={() => onViewDetails(consultant)}
          className="px-3 py-1 text-xs text-blue-500 hover:text-blue-400 transition-colors"
        >
          View
        </button>
        
        {status === 'PENDING_REVIEW' && (
          <button
            onClick={() => onInvite(consultant)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Invite
          </button>
        )}
        
        {/* {status === 'INTERVIEW_SCHEDULED' && (
          <button
            onClick={() => onReview(consultant)}
            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Review
          </button>
        )} */}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#242935] rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-[#1a1f2b]">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Experience
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Interview Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Score
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-[#242935] divide-y divide-gray-700">
            {consultants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-400">
                  No consultants found with the selected criteria.
                </td>
              </tr>
            ) : (
              consultants.map((consultant) => (
                <tr key={consultant.id} className="hover:bg-[#2d344a] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {consultant.contactFirstName.charAt(0)}{consultant.contactLastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-200">
                          {consultant.contactFirstName} {consultant.contactLastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {consultant.position}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {consultant.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={consultant.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {consultant.experience}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {formatDate(consultant.interviewDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {consultant.interviewScore !== null ? (
                      <div className="flex items-center">
                        <span className="text-yellow-500 mr-1">★</span>
                        <span>{consultant.interviewScore}</span>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {getActionButtons(consultant)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultantTable;