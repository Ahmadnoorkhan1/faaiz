import React, { useState } from 'react';
import ConsultantManagement from './ConsultantManagement';
import ConsultantFeedback from './ConsultantFeedback';

const FeedbackSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'management' | 'feedback'>('management');

  return (
    <div className="space-y-6">
      {/* <div className="flex border-b border-gray-700">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'management'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('management')}
        >
          Consultant Management
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'feedback'
              ? 'border-b-2 border-blue-500 text-blue-500'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          onClick={() => setActiveTab('feedback')}
        >
          Consultant Feedback
        </button>
      </div> 

      {activeTab === 'management' ? (
        <ConsultantManagement />
      ) : ( */}
        <ConsultantFeedback />
      {/* )} */}

      {/* <ConsultantManagement /> */}
    </div>
  );
};

export default FeedbackSystem;