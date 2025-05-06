import React from 'react';

const ProposalGeneration: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0078D4] mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-800">
        Generating your proposal...
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        This may take a few moments
      </p>
    </div>
  );
};

export default ProposalGeneration;