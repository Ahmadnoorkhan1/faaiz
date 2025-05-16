import React from 'react';

interface ServiceItemProps {
  service: string;
  hasForm: boolean;
  onView: () => void;
  onAdd: () => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ service, hasForm, onView, onAdd }) => {
  return (
    <div className="grid grid-cols-2">
      <div className="col-span-2 border border-white p-4">
        <p className="text-gray-200">{service.replace(/_/g, ' ')}</p>
      </div>
      <div className="col-3 border border-white flex justify-center">
        {hasForm ? (
          <button 
            className="bg-transparent text-blue-400 px-4 w-[75px] cursor-pointer"
            onClick={onView}
            type="button"
          >
            View
          </button>
        ) : (
          <button 
            className="bg-transparent text-blue-400 px-4 w-[75px] cursor-pointer"
            onClick={onAdd}
            type="button"
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceItem;