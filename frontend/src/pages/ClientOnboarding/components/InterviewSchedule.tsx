import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../../../components/FormElements/Input';
import { ClientFormData } from '../../../utils/schemas/clientSchema';

const InterviewSchedule: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ClientFormData>();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-white">
        Schedule an Interview (Optional)
      </h3>
      <p className="text-sm text-white/70 mb-4">
        You can skip this step if you don't want to schedule an interview now.
      </p>
      <Input
        label="Interview Date"
        name="interviewDate"
        type="date"
        register={register}
        error={errors.interviewDate}
        placeholder="Select interview date"
      />
      <Input
        label="Interview Time"
        name="interviewTime"
        type="time"
        register={register}
        error={errors.interviewTime}
        placeholder="Select interview time"
      />
    </div>
  );
};

export default InterviewSchedule;