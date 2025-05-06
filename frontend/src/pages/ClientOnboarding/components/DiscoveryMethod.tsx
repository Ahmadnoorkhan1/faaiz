import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ClientFormData } from '../../../utils/schemas/clientSchema';

const DiscoveryMethod: React.FC = () => {
  const { setValue, watch } = useFormContext<ClientFormData>();
  const selectedMethod = watch('discoveryMethod');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">
          Choose Discovery Method
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setValue('discoveryMethod', 'call', { shouldValidate: true })}
            className={`p-6 border rounded-lg flex flex-col items-center justify-center transition-colors ${
              selectedMethod === 'call'
                ? 'border-[#0078D4] bg-[#00204E]'
                : 'border-[#003175] bg-white'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-10 w-10 mb-2 ${
                selectedMethod === 'call' ? 'text-[#0078D4]' : 'text-[#0078D4]'
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <h4 className={`font-medium text-center ${
              selectedMethod === 'call' ? 'text-white' : 'text-gray-800'
            }`}>
              Discovery Call
            </h4>
            <p className={`text-sm text-center ${
              selectedMethod === 'call' ? 'text-white/70' : 'text-gray-600'
            }`}>
              Schedule a call with our team
            </p>
          </button>
          <button
            type="button"
            onClick={() => setValue('discoveryMethod', 'form', { shouldValidate: true })}
            className={`p-6 border rounded-lg flex flex-col items-center justify-center transition-colors ${
              selectedMethod === 'form'
                ? 'border-[#0078D4] bg-[#00204E]'
                : 'border-[#003175] bg-white'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-10 w-10 mb-2 ${
                selectedMethod === 'form' ? 'text-[#0078D4]' : 'text-[#0078D4]'
              }`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className={`font-medium text-center ${
              selectedMethod === 'form' ? 'text-white' : 'text-gray-800'
            }`}>
              Scoping Form
            </h4>
            <p className={`text-sm text-center ${
              selectedMethod === 'form' ? 'text-white/70' : 'text-gray-600'
            }`}>
              Fill out detailed requirements
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryMethod;