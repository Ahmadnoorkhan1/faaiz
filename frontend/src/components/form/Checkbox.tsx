import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface CheckboxProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  description?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  register,
  error,
  required = false,
  description,
}) => {
  return (
    <div className="relative flex items-start">
      <div className="flex items-center h-5">
        <input
          id={name}
          type="checkbox"
          {...register(name, { required })}
          className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-neutral-300 rounded"
        />
      </div>
      <div className="ml-3">
        <label htmlFor={name} className="font-medium text-neutral-900">
          {label} {required && <span className="text-error-500">*</span>}
        </label>
        {description && (
          <p className="text-sm text-neutral-500">{description}</p>
        )}
        {error && (
          <p className="mt-1 text-sm text-error-500">{error.message}</p>
        )}
      </div>
    </div>
  );
};

export default Checkbox; 