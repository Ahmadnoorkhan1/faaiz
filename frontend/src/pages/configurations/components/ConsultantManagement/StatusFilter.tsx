import React from 'react';
import { ConsultantStatus } from '../../../../types/consultant';

interface StatusFilterProps {
  selectedStatus: ConsultantStatus | 'ALL';
  onStatusChange: (status: ConsultantStatus | 'ALL') => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatus, onStatusChange }) => {
  const statuses: (ConsultantStatus | 'ALL')[] = [
    'ALL',
    'PENDING_REVIEW',
    'INTERVIEW_INVITED',
    'INTERVIEW_SCHEDULED',
    'REJECTED',
    'APPROVED'
  ];

  const formatStatus = (status: ConsultantStatus | 'ALL') => {
    if (status === 'ALL') return 'All Consultants';
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Cast the value to the expected type
    const newStatus = e.target.value as ConsultantStatus | 'ALL';
    onStatusChange(newStatus);
  };

  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="status-filter" className="text-sm font-medium text-gray-400">
        Status:
      </label>
      <div className="relative">
        <select
          id="status-filter"
          value={selectedStatus}
          onChange={handleChange}
          className="bg-[#1a1f2b] text-gray-200 rounded-lg border border-gray-700 py-2 pl-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {formatStatus(status)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
          <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatusFilter;