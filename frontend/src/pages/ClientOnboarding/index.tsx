import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import CardLayout from '../../layouts/CardLayout';
import Stepper from '../../components/Stepper';
import api from '../../service/apiService';
import { ClientFormData, clientSchema } from '../../utils/schemas/clientSchema';

// Import step components
import AccountInfo from './components/AccountInfo';
import BasicInfo from './components/BasicInfo';
import PersonalInfo from './components/PersonalInfo';
import DiscoveryMethod from './components/DiscoveryMethod';
import ProposalGeneration from './components/ProposalGeneration';
import InterviewSchedule from './components/InterviewSchedule';
import LegalTerms from './components/LegalTerms';

const steps = [
  { title: 'Account', description: 'Create Account' },
  { title: 'Basic Info', description: 'Contact and Services' },
  { title: 'Personal Info', description: 'Your Details' },
  { title: 'Discovery', description: 'Call or Form' },
  { title: 'Proposal', description: 'Generating...' },
  { title: 'Interview', description: 'Schedule (Optional)' },
  { title: 'Legal', description: 'Final Steps' },
];

// Fields to watch per step to prevent unnecessary validations
const stepFields = {
  0: ['email', 'password', 'name'],
  1: ['requestedServices', 'otherDetails'],
  2: ['fullName', 'phoneNumber', 'organization'],
  3: ['discoveryMethod'],
  4: [],
  5: [],
  6: ['termsAccepted']
};

const ClientOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stepValidated, setStepValidated] = useState<Record<number, boolean>>({});

  // Change form mode to onSubmit - only validate when explicitly triggered
  const methods = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: 'onSubmit',
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
    watch,
    trigger,
    getValues,
    formState: { errors, isDirty }
  } = methods;

  // Watch all fields for the current step
  const currentStepFields = stepFields[currentStep as keyof typeof stepFields] || [];
  const watchedStepFields = watch(currentStepFields as any);
  
  // Specifically watch requestedServices for Step 1
  const watchedServices = watch('requestedServices');

  // Improved validation function
  const validateCurrentStep = useCallback(async (showToast = true): Promise<boolean> => {
    if (isValidating) return false;
    
    setIsValidating(true);
    let isValid = false;
    
    try {
      const fieldsToValidate = [...(stepFields[currentStep as keyof typeof stepFields] || [])];
      
      // Special case for Step 1 - check if any services are selected
      if (currentStep === 1) {
        const services = getValues('requestedServices');
        
        if (services.length === 0) {
          if (showToast) {
            toast.error('Please select at least one service');
          }
          setIsValidating(false);
          setStepValidated(prev => ({ ...prev, [currentStep]: false }));
          return false;
        }
        
        // If OTHER is selected, validate otherDetails
        if (services.includes('OTHER') && !fieldsToValidate.includes('otherDetails')) {
          fieldsToValidate.push('otherDetails');
        }
      }
      
      // Skip validation for proposal generation and optional steps
      if (currentStep === 4 || currentStep === 5) {
        isValid = true;
      } else if (fieldsToValidate.length > 0) {
        // Trigger validation for all fields in this step
        isValid = await trigger(fieldsToValidate as any, { shouldFocus: true });
      } else {
        isValid = true;
      }
      
      // Set step validation state
      setStepValidated(prev => ({ ...prev, [currentStep]: isValid }));
      
      if (!isValid && showToast) {
        toast.error('Please fix the errors before proceeding.');
      }
      
      return isValid;
    } catch (error) {
      console.error('Validation error:', error);
      if (showToast) {
        toast.error('An error occurred during validation.');
      }
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [currentStep, getValues, trigger, isValidating]);

  const onSubmit: SubmitHandler<ClientFormData> = async (data) => {
    try {
      setLoading(true);
      
      // Create new client profile
      await api.post('/api/clients', {
        ...data,
        currentStep: 0,
        onboardingStatus: 'NOT_STARTED'
      });
      
      toast.success('Account created and onboarding completed successfully!');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: unknown) {
      console.error('Error submitting form:', error);
      
      // Handle error based on its type
      let errorMessage = 'Failed to complete onboarding.';
      
      if (error && typeof error === 'object') {
        const err = error as Record<string, any>;
        if (err.response?.data?.error) {
          errorMessage += ` ${err.response.data.error}`;
        } else if ('message' in err) {
          errorMessage += ` ${err.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle next button click
  const handleNext = useCallback(async () => {
    if (isValidating || isGeneratingProposal) return;
    
    const isStepValid = await validateCurrentStep(true);
    
    if (isStepValid) {
      if (currentStep === 3) {
        setIsGeneratingProposal(true);
        // Simulate proposal generation
        setTimeout(() => {
          setIsGeneratingProposal(false);
          setCurrentStep((prev) => prev + 1);
          // Mark step as validated
          setStepValidated(prev => ({ ...prev, [currentStep + 1]: true }));
        }, 2000);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  }, [currentStep, isValidating, isGeneratingProposal, validateCurrentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0 && !loading) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, loading]);

  const renderStepComponent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return <AccountInfo />;
      case 1:
        return <BasicInfo />;
      case 2:
        return <PersonalInfo />;
      case 3:
        return <DiscoveryMethod />;
      case 4:
        return <ProposalGeneration />;
      case 5:
        return <InterviewSchedule />;
      case 6:
        return <LegalTerms />;
      default:
        return null;
    }
  }, [currentStep]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001538] py-8">
        <div className="relative z-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
          <CardLayout title="Processing Your Request">
            <div className="flex flex-col justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0078D4] mb-4"></div>
              <p className="text-white text-center">Please wait while we process your information...</p>
            </div>
          </CardLayout>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001538] py-8">
      <div className="relative z-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
        <CardLayout title="Client Onboarding">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Stepper
                steps={steps}
                currentStep={currentStep}
              />

              <div className="mt-8 w-full min-h-[300px]">
                {renderStepComponent()}
              </div>

              <div className="flex justify-between">
              <button
  type="button"
  onClick={handleBack}
  disabled={currentStep === 0 || loading || isGeneratingProposal}
  className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors
    ${currentStep === 0 || loading || isGeneratingProposal
      ? 'text-gray-300 border-gray-300 cursor-not-allowed'
      : 'text-gray-700 border-gray-300 bg-white hover:bg-gray-50'
    }`}
>
  Back
</button>
                {currentStep === steps.length - 1 ? (
                  <button
                    type="submit"
                    disabled={loading || isValidating || !stepValidated[currentStep]}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
                      ${loading || isValidating || !stepValidated[currentStep]
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
                    disabled={isGeneratingProposal || loading || isValidating}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
                      ${isGeneratingProposal || loading || isValidating
                        ? 'bg-[#003175] cursor-not-allowed'
                        : 'bg-[#0078D4] hover:bg-[#106EBE]'
                      }`}
                  >
                    {isValidating ? 'Validating...' : isGeneratingProposal ? 'Generating...' : 'Next'}
                  </button>
                )}
              </div>
            </form>
          </FormProvider>
        </CardLayout>
      </div>
    </div>
  );
};

export default ClientOnboarding;