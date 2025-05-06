import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ClientFormData } from '../../../utils/schemas/clientSchema';

const LegalTerms: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ClientFormData>();

  return (
    <div className="space-y-6">
      <div className="border border-[#003175] rounded-lg p-4 max-h-60 overflow-y-auto">
        <h3 className="text-lg font-medium text-white mb-4">
          Terms and Conditions
        </h3>
        <div className="prose prose-sm text-white/70">
          <p>Please review and accept our terms and conditions...</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc vel nunc.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc vel nunc.</p>
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="termsAccepted"
          {...register('termsAccepted')}
          className="h-4 w-4 text-[#0078D4] focus:ring-[#0078D4] border-[#003175] rounded"
        />
        <label htmlFor="termsAccepted" className="ml-2 block text-sm text-white">
          I accept the terms and conditions
        </label>
      </div>
      {errors.termsAccepted && (
        <p className="mt-1 text-sm text-red-500">{errors.termsAccepted.message}</p>
      )}
    </div>
  );
};

export default LegalTerms;