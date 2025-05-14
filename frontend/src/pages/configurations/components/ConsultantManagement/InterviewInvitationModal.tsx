import React, { useState } from 'react';
import { Consultant } from '../../../../types/consultant';

interface InterviewInvitationModalProps {
  consultant: Consultant;
  onClose: () => void;
  onSubmit: (interviewLink: string, scheduledDate: string) => void;
}

const InterviewInvitationModal: React.FC<InterviewInvitationModalProps> = ({
  consultant,
  onClose,
  onSubmit
}) => {
  const [interviewLink, setInterviewLink] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [errors, setErrors] = useState<{
    interviewLink?: string;
    scheduledDate?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      interviewLink?: string;
      scheduledDate?: string;
    } = {};
    
    if (!interviewLink) {
      newErrors.interviewLink = 'Interview link is required';
    } else if (!/^https?:\/\/.+/.test(interviewLink)) {
      newErrors.interviewLink = 'Please enter a valid URL starting with http:// or https://';
    }
    
    if (!scheduledDate) {
      newErrors.scheduledDate = 'Interview date is required';
    } else {
      const selected = new Date(scheduledDate);
      const now = new Date();
      if (selected < now) {
        newErrors.scheduledDate = 'Interview date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(interviewLink, scheduledDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1f2b] rounded-xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          Schedule Interview with {consultant.contactFirstName} {consultant.contactLastName}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="interviewLink" className="block text-sm font-medium text-gray-400 mb-1">
                Interview Link
              </label>
              <input
                type="text"
                id="interviewLink"
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.interviewLink && (
                <p className="mt-1 text-sm text-red-500">{errors.interviewLink}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-400 mb-1">
                Interview Date and Time
              </label>
              <input
                type="datetime-local"
                id="scheduledDate"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.scheduledDate && (
                <p className="mt-1 text-sm text-red-500">{errors.scheduledDate}</p>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterviewInvitationModal;