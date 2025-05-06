import React from 'react';
import { FieldError, UseFormRegister } from 'react-hook-form';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  name: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  placeholder?: string;
  options: SelectOption[];
  className?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  name,
  register,
  error,
  required = false,
  placeholder = 'Select an option',
  options,
  className = '',
}) => {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-neutral-900">
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>
      
      <select
        id={name}
        {...register(name)}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-200 focus:outline-none focus:ring-primary-500 focus:border-primary-500 rounded-md ${
          error ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : 'border-neutral-200'
        }`}
        aria-invalid={error ? 'true' : 'false'}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-error-500" id={`${name}-error`}>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default Select;
