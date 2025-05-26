import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../../../components/FormElements/Input';
import { ClientFormData } from '../../../utils/schemas/clientSchema';
import api from '../../../service/apiService';
import { formatServiceName } from '../../configurations/components/ProjectProposalUpload';

interface ServiceType {
  value: string;
  label: string;
}

const BasicInfo: React.FC = () => {
  const { register, formState: { errors }, watch, setValue, trigger } = useFormContext<ClientFormData>();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [fetchingServiceTypes, setFetchingServiceTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const selectedService = watch('requestedServices') || [];
  
  useEffect(() => {
    const fetchServiceTypes = async () => {
      try {
        setFetchingServiceTypes(true);
        setError(null);
        const response = await api.get('/api/documents/service-types');
        console.log("test",response);
        if (response.data?.success === false) {
          throw new Error(response.data?.message || 'Failed to fetch service types');
        }
        
        let servicesData: string[] = [];
        
        if (response.data && Array.isArray(response.data.data)) {
          servicesData = response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
          servicesData = response.data;
        }
        
        // Convert array of strings to array of objects with value and label
        const formattedServices = servicesData.map(service => ({
          value: service,
          label: formatServiceName(service)
        }));
        
        setServiceTypes(formattedServices);
      } catch (error) {
        console.error('Error fetching service types:', error);
        setError('Failed to load services. Please try again later.');
      } finally {
        setFetchingServiceTypes(false);
      }
    };

    fetchServiceTypes();
  }, []);


  // Handle radio button change
  const handleServiceChange = (value: string) => {
    // For radio buttons, we set a single value in an array
    setValue('requestedServices', [value], { 
      shouldValidate: true,
      shouldDirty: true
    });
  };
  
  // Validate service selection when component mounts
  useEffect(() => {
    if (selectedService.length > 0) {
      trigger('requestedServices');
    }
  }, [trigger, selectedService]);

  if (fetchingServiceTypes) {
    return <div className="text-white">Loading services...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Select a Service</h3>
      
      {errors.requestedServices && (
        <p className="text-sm text-red-500">{errors.requestedServices.message || "Please select a service"}</p>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {serviceTypes.map((service, index) => (
          <div key={service.value} className="flex items-start space-x-2 bg-white p-3 rounded-lg shadow-sm">
            <input
              type="radio"
              id={`service-${index}`}
              value={service.value}
              name="requestedService" // Same name for all radio buttons
              checked={selectedService.includes(service.value)}
              onChange={() => handleServiceChange(service.value)}
              className="h-5 w-5 mt-0.5 text-[#0078D4] focus:ring-[#0078D4] border-gray-300 rounded-full"
            />
            <label htmlFor={`service-${index}`} className="block text-sm text-gray-800">
              {service.label}
            </label>
          </div>
        ))}
      </div>
      
      {selectedService.includes('OTHER') && (
        <Input
          label="Other Details"
          name="otherDetails"
          register={register}
          error={errors.otherDetails}
          required
          placeholder="Please specify other service"
        />
      )}
    </div>
  );
};

export default BasicInfo;