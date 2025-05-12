import React from 'react';
import { useFormContext } from 'react-hook-form';
import { ClientFormData } from '../../../utils/schemas/clientSchema';

const LegalTerms: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ClientFormData>();

  return (
    <section className="bg-[#001f3f] border border-[#003175] rounded-2xl p-6 space-y-6 text-white shadow-lg">
      <h2 className="text-xl font-semibold">Terms and Conditions</h2>

      <div className="max-h-64 overflow-y-auto space-y-4 text-sm text-white/80 leading-relaxed pr-2">
        <p>
          Please review and accept our terms and conditions to proceed. These terms outline the rights and responsibilities of both parties throughout the engagement.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc vel nunc.
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisl aliquet nunc, eget aliquam nisl nunc vel nunc.
        </p>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="termsAccepted"
          {...register('termsAccepted')}
          className="mt-1 h-5 w-5 text-[#5B93C7] focus:ring-[#5B93C7] border-[#003175] rounded-md"
        />
        <label htmlFor="termsAccepted" className="text-sm">
          I accept the terms and conditions
        </label>
      </div>

      {errors.termsAccepted && (
        <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>
      )}
    </section>
  );
};

export default LegalTerms;
