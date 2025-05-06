import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import CardLayout from '../layouts/CardLayout';
import Stepper from '../components/Stepper';
import Input from '../components/FormElements/Input';
import api from '../service/apiService';
import { ClientFormData, clientSchema } from '../utils/schemas/clientSchema';
const steps = [
  { title: 'Account', description: 'Create Account' },
  { title: 'Basic Info', description: 'Contact and Services' },
  { title: 'Personal Info', description: 'Your Details' },
  { title: 'Discovery', description: 'Call or Form' },
  { title: 'Proposal', description: 'Generating...' },
  { title: 'Interview', description: 'Schedule (Optional)' },
  { title: 'Legal', description: 'Final Steps' },
];

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


const ClientOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [loading, setLoading] = useState(false);

  const methods = useForm<ClientFormData>({
    // @ts-ignore
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      requestedServices: [],
      otherDetails: '',
      fullName: '',
      phoneNumber: '',
      organization: '',
      additionalContact: '',
      discoveryMethod: 'call',
      scopingDetails: {},
      interviewDate: '',
      interviewTime: '',
      termsAccepted: false,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = methods;

  // Function to check if current step is valid
  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 0:
        return await trigger(['email', 'password', 'name']);
      case 1:
        return await trigger(['requestedServices']);
      case 2:
        return await trigger(['fullName', 'phoneNumber', 'organization']);
      case 3:
        return await trigger('discoveryMethod');
      case 5:
        // Interview fields are optional
        return true;
      case 6:
        return await trigger('termsAccepted');
      default:
        return true;
    }
  };

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      
      // Create new client profile
      await api.post('/api/clients',{
        ...data,
        currentStep: 0,
        onboardingStatus: 'NOT_STARTED'
      });
      toast.success('Account created and onboarding completed successfully!');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error:any) {
      console.error('Error submitting form:', error);
      toast.error('Failed to complete onboarding.', error.response.data.error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep();
    
    if (isStepValid) {
      if (currentStep === 3) {
        setIsGeneratingProposal(true);
        setTimeout(() => {
          setIsGeneratingProposal(false);
          setCurrentStep((prev) => prev + 1);
        }, 2000);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <Input
              label="Email"
              name="email"
              type="email"
              register={methods.register}
              error={errors.email}
              required
              placeholder="Enter your email"
            />
            <Input
              label="Password"
              name="password"
              type="password"
              register={methods.register}
              error={errors.password}
              required
              placeholder="Create a secure password"
            />
            <Input
              label="Name"
              name="name"
              register={methods.register}
              error={errors.name}
              required
              placeholder="Enter your full name"
            />
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Select Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {serviceOptions.map((service) => (
                <div key={service.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={service.value}
                    value={service.value}
                    {...methods.register('requestedServices')}
                    className="h-4 w-4 text-[#0078D4] focus:ring-[#0078D4] border-[#003175] rounded"
                  />
                  <label htmlFor={service.value} className="ml-2 block text-sm text-white">
                    {service.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.requestedServices && (
              <p className="mt-1 text-sm text-red-500">{errors.requestedServices.message}</p>
            )}
            <Input
              label="Other Details"
              name="otherDetails"
              register={methods.register}
              error={errors.otherDetails}
              placeholder="Please specify other services"
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <Input
              label="Full Name"
              name="fullName"
              register={methods.register}
              error={errors.fullName}
              required
              placeholder="Enter your full name"
            />
            <Input
              label="Phone Number"
              name="phoneNumber"
              register={methods.register}
              error={errors.phoneNumber}
              required
              placeholder="Enter your phone number"
            />
            <Input
              label="Organization"
              name="organization"
              register={methods.register}
              error={errors.organization}
              required
              placeholder="Enter your organization name"
            />
            <Input
              label="Additional Contact Details"
              name="additionalContact"
              register={methods.register}
              error={errors.additionalContact}
              placeholder="Any additional contact information"
            />
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">
                Choose Discovery Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('discoveryMethod', 'call')}
                  className={`p-4 border rounded-lg ${
                    watch('discoveryMethod') === 'call'
                      ? 'border-[#0078D4] bg-[#00204E]'
                      : 'border-[#003175]'
                  }`}
                >
                  <h4 className="font-medium text-white">Discovery Call (MS Teams)</h4>
                  <p className="text-sm text-white/70">
                    Schedule a call with our team
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('discoveryMethod', 'form')}
                  className={`p-4 border rounded-lg ${
                    watch('discoveryMethod') === 'form'
                      ? 'border-[#0078D4] bg-[#00204E]'
                      : 'border-[#003175]'
                  }`}
                >
                  <h4 className="font-medium text-white">Scoping Form</h4>
                  <p className="text-sm text-white/70">
                    Fill out detailed requirements
                  </p>
                </button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0078D4] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white">
              Generating your proposal...
            </h3>
            <p className="mt-2 text-sm text-white/70">
              This may take a few moments
            </p>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <Input
              label="Interview Date"
              name="interviewDate"
              type="date"
              register={methods.register}
              error={errors.interviewDate}
              placeholder="Select interview date"
            />
            <Input
              label="Interview Time"
              name="interviewTime"
              type="time"
              register={methods.register}
              error={errors.interviewTime}
              placeholder="Select interview time"
            />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div className="border border-[#003175] rounded-lg p-4">
              <h3 className="text-lg font-medium text-white mb-4">
                Terms and Conditions
              </h3>
              <div className="prose prose-sm text-white/70">
                {/* TODO: Add actual terms and conditions */}
                <p>Please review and accept our terms and conditions...</p>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="termsAccepted"
                {...methods.register('termsAccepted')}
                className="h-4 w-4 text-[#0078D4] focus:ring-[#0078D4] border-[#003175] rounded"
              />
              <label htmlFor="termsAccepted" className="ml-2 block text-sm text-white">
                I accept the terms and conditions
              </label>
            </div>
            {errors.termsAccepted && (
              <p className="mt-1 text-sm text-red-500">{errors.termsAccepted.message}</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001538] py-8">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute w-[200%] h-[200%] rounded-full border border-[#0078D4]/10 top-[10%] left-[-50%]"></div>
            <div className="absolute w-[150%] h-[150%] rounded-full border border-[#0078D4]/20 top-[20%] left-[-25%]"></div>
            <div className="absolute w-[100%] h-[100%] rounded-full border border-[#0078D4]/30 top-[30%] left-[0%]"></div>
          </div>
          
          <div className="relative z-10">
            <CardLayout title="Loading...">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0078D4]"></div>
              </div>
            </CardLayout>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001538] py-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] rounded-full border border-[#0078D4]/10 top-[10%] left-[-50%]"></div>
          <div className="absolute w-[150%] h-[150%] rounded-full border border-[#0078D4]/20 top-[20%] left-[-25%]"></div>
          <div className="absolute w-[100%] h-[100%] rounded-full border border-[#0078D4]/30 top-[30%] left-[0%]"></div>
        </div>
        
        <div className="relative z-10">
          <CardLayout title="Client Onboarding">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-8">
                <Stepper
                  steps={steps}
                  currentStep={currentStep}
                />

                <div className="mt-8">
                  {renderStep()}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={currentStep === 0 || loading}
                    className={`px-4 py-2 border border-[#003175] rounded-md text-sm font-medium ${
                      currentStep === 0 || loading
                        ? 'text-[#0078D4]/50 cursor-not-allowed'
                        : 'text-white hover:bg-[#003175]'
                    }`}
                  >
                    Back
                  </button>
                  {currentStep === steps.length - 1 ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        loading
                          ? 'bg-[#003175] cursor-not-allowed'
                          : 'bg-[#0078D4] hover:bg-[#106EBE]'
                      }`}
                    >
                      {loading ? 'Submitting...' : 'Create Account'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isGeneratingProposal || loading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        isGeneratingProposal || loading
                          ? 'bg-[#003175] cursor-not-allowed'
                          : 'bg-[#0078D4] hover:bg-[#106EBE]'
                      }`}
                    >
                      {loading ? 'Saving...' : 'Next'}
                    </button>
                  )}
                </div>
              </form>
            </FormProvider>
          </CardLayout>
        </div>
      </div>
    </div>
  );
};

export default ClientOnboarding; 