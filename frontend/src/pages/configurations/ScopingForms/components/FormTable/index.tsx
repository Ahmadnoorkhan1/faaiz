import React from 'react';
import ServiceItem from './ServiceItem';

interface FormTableProps {
  serviceOptions: string[];
  onViewForm: (service: string) => void;
  onAddForm: (service: string) => void;
}

const FormTable: React.FC<FormTableProps> = ({ 
  serviceOptions, 
  onViewForm, 
  onAddForm 
}) => {

  console.log(serviceOptions)
  const getFormForService = (service: any) => {
    return service.scopingForm ? true : false;
  };

  return (
    <div>
      <h1 className="text-2xl font-normal text-gray-200 py-2">Scoping Forms</h1>
      <div className="">
        {serviceOptions.map((service:any, index:number) => (
          <ServiceItem 
            key={index}
            service={service.name}
            hasForm={getFormForService(service)}
            onView={() => onViewForm(service)}
            onAdd={() => onAddForm(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default FormTable;