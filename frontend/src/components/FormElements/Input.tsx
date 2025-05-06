import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface InputProps {
  label: string;
  name: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  type = 'text',
  register,
  error,
  required = false,
  placeholder,
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-900">
        {label} {required && <span className="text-error-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register(name, { required })}
        className={`mt-1 block w-full rounded-md shadow-sm border ${
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
            : 'border-neutral-200 focus:border-primary-500 focus:ring-primary-500'
        } focus:ring-1 focus:outline-none px-3 py-2 text-neutral-900 placeholder-neutral-400`}
        placeholder={placeholder}
      />
      {error && (
        <p className="mt-1 text-sm  text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export default Input;
