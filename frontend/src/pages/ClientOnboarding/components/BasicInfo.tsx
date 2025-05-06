import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import Input from '../../../components/FormElements/Input';
import { ClientFormData } from '../../../utils/schemas/clientSchema';

const serviceOptions = [
  { value: 'ISO_27001_INFORMATION_SECURITY_MANAGEMENT_SYSTEM', label: 'ISO 27001 Information Security Management System' },
  { value: 'ISO_27701_PRIVACY_INFORMATION_MANAGEMENT_SYSTEM', label: 'ISO 27701 Privacy Information Management System' },
  { value: 'ISO_22301_BUSINESS_CONTINUITY_MANAGEMENT_SYSTEM', label: 'ISO 22301 Business Continuity Management System' },
  { value: 'ISO_27017_CLOUD_SECURITY_CONTROLS', label: 'ISO 27017 Information Security Controls for Cloud Services' },
  { value: 'ISO_27018_PII_PROTECTION_IN_PUBLIC_CLOUD', label: 'ISO 27018 PII Protection in Public Clouds' },
  { value: 'ISO_20000_SERVICE_MANAGEMENT', label: 'ISO 20000 Service Management' },
  { value: 'ISO_12207_SOFTWARE_LIFE_CYCLE', label: 'ISO 12207:2017 Software Life Cycle Processes' },
  { value: 'ISO_42001_AI_MANAGEMENT_SYSTEM', label: 'ISO 42001 Artificial Intelligence Management System' },
  { value: 'TESTING_SERVICES', label: 'Testing Services' },
  { value: 'RISK_ASSESSMENT', label: 'Risk Assessment' },
  { value: 'BUSINESS_IMPACT_ANALYSIS', label: 'Business Impact Analysis' },
  { value: 'PRIVACY_IMPACT_ANALYSIS', label: 'Privacy Impact Analysis' },
  { value: 'DATA_ASSURANCE', label: 'Data Assurance' },
  { value: 'AUDIT', label: 'Audit' },
  { value: 'AWARENESS_TRAINING', label: 'Awareness Training' },
  { value: 'TABLETOP_EXERCISE', label: 'Tabletop Exercise' },
  { value: 'OTHER', label: 'Other' },
];

const BasicInfo: React.FC = () => {
  const { register, formState: { errors }, watch, setValue, trigger } = useFormContext<ClientFormData>();
  const requestedServices = watch('requestedServices') || [];
  
  // Handle checkbox change to ensure proper form state updates
  const handleServiceChange = (value: string, checked: boolean) => {
    let newServices = [...requestedServices];
    
    if (checked && !newServices.includes(value)) {
      newServices = [...newServices, value];
    } else if (!checked && newServices.includes(value)) {
      newServices = newServices.filter(service => service !== value);
    }
    
    // Update form state with new services array
    setValue('requestedServices', newServices, { 
      shouldValidate: false,  // Don't validate immediately
      shouldDirty: true
    });
    
    // Manually trigger validation after a short delay to let state update
    setTimeout(() => {
      trigger('requestedServices');
    }, 100);
  };
  
  // Validate services when component mounts
  useEffect(() => {
    if (requestedServices.length > 0) {
      trigger('requestedServices');
    }
  }, [trigger]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-white">Select Services</h3>
      
      {errors.requestedServices && (
        <p className="text-sm text-red-500">{errors.requestedServices.message || "Please select at least one service"}</p>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {serviceOptions.map((service) => (
          <div key={service.value} className="flex items-start space-x-2 bg-white p-3 rounded-lg shadow-sm">
            <input
              type="checkbox"
              id={service.value}
              checked={requestedServices.includes(service.value)}
              onChange={(e) => handleServiceChange(service.value, e.target.checked)}
              className="h-5 w-5 mt-0.5 text-[#0078D4] focus:ring-[#0078D4] border-gray-300 rounded"
            />
            <label htmlFor={service.value} className="block text-sm text-gray-800">
              {service.label}
            </label>
          </div>
        ))}
      </div>
      
      {requestedServices.includes('OTHER') && (
        <Input
          label="Other Details"
          name="otherDetails"
          register={register}
          error={errors.otherDetails}
          required
          placeholder="Please specify other services"
        />
      )}
    </div>
  );
};

export default BasicInfo;