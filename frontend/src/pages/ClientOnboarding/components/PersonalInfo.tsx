import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../../../components/FormElements/Input';
import { ClientFormData } from '../../../utils/schemas/clientSchema';

const PersonalInfo: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ClientFormData>();

  return (
    <div className="space-y-6">
      <Input
        label="Full Name"
        name="fullName"
        register={register}
        error={errors.fullName}
        required
        placeholder="Enter your full name"
      />
      <Input
        label="Phone Number"
        name="phoneNumber"
        register={register}
        error={errors.phoneNumber}
        required
        placeholder="Enter your phone number"
      />
      <Input
        label="Organization"
        name="organization"
        register={register}
        error={errors.organization}
        required
        placeholder="Enter your organization name"
      />
      <Input
        label="Additional Contact Details"
        name="additionalContact"
        register={register}
        error={errors.additionalContact}
        placeholder="Any additional contact information"
      />
    </div>
  );
};

export default PersonalInfo;