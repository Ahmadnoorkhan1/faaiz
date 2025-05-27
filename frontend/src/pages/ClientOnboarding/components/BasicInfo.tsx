import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../../../components/FormElements/Input';
import { ClientFormData } from '../../../utils/schemas/clientSchema';
import api from '../../../service/apiService';
import { formatServiceName } from '../../configurations/components/ProjectProposalUpload';
import { LoaderIcon } from 'react-hot-toast';


const BasicInfo: React.FC = () => {
  const { register, formState: { errors }, watch, setValue, trigger } = useFormContext<ClientFormData>();
  const [fetchingServiceTypes, setFetchingServiceTypes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serviceList, setServiceList] = useState<any>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const selectedService = watch('serviceId') || [];
  // Handle radio button change
  const handleServiceChange = (serviceName: string) => {
    // For radio buttons, we set a single value in an array
    setValue('serviceId', [serviceName], { 
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const fetchServices = async () => {
    setIsLoadingServices(true)
    try {
      const response:any = await api.get('/api/services')
      if(response.data.success){
        setServiceList(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoadingServices(false)
    }
  } 

  useEffect(() => {
    fetchServices()
  }, [])
  
  // Validate service selection when component mounts
  useEffect(() => {
    if (selectedService.length > 0) {
      trigger('serviceId');
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
      
      {errors.serviceId && (
        <p className="text-sm text-red-500">{errors.serviceId.message || "Please select a service"}</p>
      )}
      
      {!serviceList || serviceList.length === 0 ? (
        <div className="text-white">
          {isLoadingServices ? "Loading services..." : "No services available"}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {serviceList.map((service:any, index:any) => ( 
             <div key={service.id} className="flex items-start space-x-2 bg-white p-3 rounded-lg shadow-sm"> 
               <input
                type="radio"
                id={`service-${index}`}
                value={service.name}
                name="requestedService" // Same name for all radio buttons
                checked={selectedService.includes(service.name)}
                onChange={() => handleServiceChange(service.name)}
                className="h-5 w-5 mt-0.5 text-[#0078D4] focus:ring-[#0078D4] border-gray-300 rounded-full"
              />
              <label htmlFor={`service-${index}`} className="block text-sm text-gray-800">
                {formatServiceName(service.name)}
              </label> 
            </div> 
          ))}
        </div>
      )}
      
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