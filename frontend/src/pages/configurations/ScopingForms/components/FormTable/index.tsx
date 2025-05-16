import React from 'react';
import { ScopingForm } from '../../types';
import ServiceItem from './ServiceItem';

interface FormTableProps {
  scopingForms: ScopingForm[];
  serviceOptions: string[];
  onViewForm: (service: string) => void;
  onAddForm: (service: string) => void;
}

const FormTable: React.FC<FormTableProps> = ({ 
  scopingForms, 
  serviceOptions, 
  onViewForm, 
  onAddForm 
}) => {
  const getFormForService = (service: string) => {
    return scopingForms.find(form => form.service === service);
  };

  return (
    <div>
      <h1 className="text-2xl font-normal text-gray-200 py-2">Scoping Forms</h1>
      <div className="">
        {serviceOptions.map((service, index) => (
          <ServiceItem 
            key={index}
            service={service}
            hasForm={!!getFormForService(service)}
            onView={() => onViewForm(service)}
            onAdd={() => onAddForm(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default FormTable;