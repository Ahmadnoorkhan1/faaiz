import React from 'react';
import { ConsultantStatus } from '../../../../types/consultant';

interface StatusBadgeProps {
  status: ConsultantStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: ConsultantStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'INTERVIEW_INVITED':
        return 'bg-blue-500/10 text-blue-500';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-purple-500/10 text-purple-500';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500';
      case 'APPROVED':
        return 'bg-green-500/10 text-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatStatus = (status: ConsultantStatus) => {
    // return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
    return status
  }; 

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;