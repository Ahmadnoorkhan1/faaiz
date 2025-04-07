import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import CardLayout from '../../layouts/CardLayout';
import Stepper from '../../components/stepper/Stepper';
import Input from '../../components/form/Input';
import Checkbox from '../../components/form/Checkbox';
import { clientSchema, ClientFormData } from '../../schemas/clientSchema';
import { createClient } from '../../services/api/clientService';

const steps = [
  { title: 'Account', description: 'Create Account' },
  { title: 'Basic Info', description: 'Contact and Services' },
  { title: 'Personal Info', description: 'Your Details' },
  { title: 'Discovery', description: 'Call or Form' },
  { title: 'Proposal', description: 'Generating...' },
  { title: 'Interview', description: 'Schedule (Optional)' },
  { title: 'Legal', description: 'Final Steps' },
];

const services = [
  { name: 'isoService', label: 'ISO Service' },
  { name: 'testingServices', label: 'Testing Services' },
  { name: 'riskAssessment', label: 'Risk Assessment' },
  { name: 'businessImpactAnalysis', label: 'Business Impact Analysis' },
  { name: 'privacyImpactAnalysis', label: 'Privacy Impact Analysis' },
  { name: 'dataAssurance', label: 'Data Assurance' },
  { name: 'audit', label: 'Audit' },
  { name: 'awarenessTraining', label: 'Awareness Training' },
  { name: 'tabletopExercise', label: 'Tabletop Exercise' },
  { name: 'other', label: 'Other' },
];

const ClientOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [loading, setLoading] = useState(false);

  const methods = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      name: '',
      services: {
        isoService: false,
        testingServices: false,
        riskAssessment: false,
        businessImpactAnalysis: false,
        privacyImpactAnalysis: false,
        dataAssurance: false,
        audit: false,
        awarenessTraining: false,
        tabletopExercise: false,
        other: false,
      },
      fullName: '',
      phoneNumber: '',
      organization: '',
      additionalContact: '',
      discoveryMethod: 'call',
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
    getValues,
  } = methods;

  // Function to check if current step is valid
  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 0:
        return await trigger(['email', 'password', 'name']);
      case 1:
        return await trigger(['services']);
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

  // Auto-select first service to make form validation easier for the user
  React.useEffect(() => {
    setValue('services.isoService', true);
  }, [setValue]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true);
      
      // Extract services from the services object for backend compatibility
      const formattedData = {
        ...data,
        // Extract services from the services object
        isoService: data.services.isoService,
        testingServices: data.services.testingServices,
        riskAssessment: data.services.riskAssessment,
        businessImpactAnalysis: data.services.businessImpactAnalysis,
        privacyImpactAnalysis: data.services.privacyImpactAnalysis,
        dataAssurance: data.services.dataAssurance,
        audit: data.services.audit,
        awarenessTraining: data.services.awarenessTraining,
        tabletopExercise: data.services.tabletopExercise,
        other: data.services.other,
        otherDetails: data.services.otherDetails,
        // Set onboarding as completed
        onboardingStatus: 'COMPLETED' as const,
        companyName: data.organization, // Map organization to companyName
        contactName: data.fullName, // Map fullName to contactName
        contactEmail: data.email, // Map email to contactEmail
        contactPhone: data.phoneNumber, // Map phoneNumber to contactPhone
      };
      
      // Create new client profile
      await createClient(formattedData);
      toast.success('Account created and onboarding completed successfully!');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to complete onboarding. Please try again.');
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
            <h3 className="text-lg font-medium text-neutral-900">Select Services</h3>
            {services.map((service) => (
              <Checkbox
                key={service.name}
                label={service.label}
                name={`services.${service.name}`}
                register={methods.register}
                error={errors.services?.[service.name as keyof ClientFormData['services']]}
              />
            ))}
            {watch('services.other') && (
              <Input
                label="Other Details"
                name="services.otherDetails"
                register={methods.register}
                error={errors.services?.otherDetails}
                placeholder="Please specify other services"
              />
            )}
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
              <h3 className="text-lg font-medium text-neutral-900">
                Choose Discovery Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue('discoveryMethod', 'call')}
                  className={`p-4 border rounded-lg ${
                    watch('discoveryMethod') === 'call'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200'
                  }`}
                >
                  <h4 className="font-medium">Discovery Call (MS Teams)</h4>
                  <p className="text-sm text-neutral-500">
                    Schedule a call with our team
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setValue('discoveryMethod', 'form')}
                  className={`p-4 border rounded-lg ${
                    watch('discoveryMethod') === 'form'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200'
                  }`}
                >
                  <h4 className="font-medium">Scoping Form</h4>
                  <p className="text-sm text-neutral-500">
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900">
              Generating your proposal...
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
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
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                Terms and Conditions
              </h3>
              <div className="prose prose-sm text-neutral-500">
                {/* TODO: Add actual terms and conditions */}
                <p>Please review and accept our terms and conditions...</p>
              </div>
            </div>
            <Checkbox
              label="I accept the terms and conditions"
              name="termsAccepted"
              register={methods.register}
              error={errors.termsAccepted}
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 py-8">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute w-[200%] h-[200%] rounded-full border border-primary-100 top-[10%] left-[-50%]"></div>
            <div className="absolute w-[150%] h-[150%] rounded-full border border-primary-200 top-[20%] left-[-25%]"></div>
            <div className="absolute w-[100%] h-[100%] rounded-full border border-primary-300 top-[30%] left-[0%]"></div>
          </div>
          
          <div className="relative z-10">
            <CardLayout title="Loading...">
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            </CardLayout>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 py-8">
      <div className="relative overflow-hidden">
        {/* Background with circular gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] rounded-full border border-primary-100 top-[10%] left-[-50%]"></div>
          <div className="absolute w-[150%] h-[150%] rounded-full border border-primary-200 top-[20%] left-[-25%]"></div>
          <div className="absolute w-[100%] h-[100%] rounded-full border border-primary-300 top-[30%] left-[0%]"></div>
        </div>
        
        <div className="relative z-10">
          <CardLayout title="Client Onboarding">
            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                    className={`px-4 py-2 border border-neutral-200 rounded-md text-sm font-medium ${
                      currentStep === 0 || loading
                        ? 'text-neutral-400 cursor-not-allowed'
                        : 'text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    Back
                  </button>
                  {currentStep === steps.length - 1 ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
                    >
                      {loading ? 'Submitting...' : 'Create Account'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={isGeneratingProposal || loading}
                      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black ${
                        isGeneratingProposal || loading
                          ? 'bg-primary-400 cursor-not-allowed'
                          : 'bg-primary-500 hover:bg-primary-600'
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