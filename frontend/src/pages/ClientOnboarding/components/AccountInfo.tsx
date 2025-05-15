import React from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../../../components/FormElements/Input';
import { ClientFormData } from '../../../utils/schemas/clientSchema';

const AccountInfo: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<ClientFormData>();

  return (
    <div className="space-y-6">
      <Input
        label="Email"
        name="email"
        type="email"
        register={register}
        error={errors.email}
        required
        placeholder="Enter your email"
      />
      <Input
        label="Password"
        name="password"
        type="password"
        register={register}
        error={errors.password}
        required
        placeholder="Create a secure password"
      />
      {/* <Input
        label="Name"
        name="name"
        register={register}
        error={errors.name}
        required
        placeholder="Enter your full name"
      /> */}
    </div>
  );
};

export default AccountInfo;