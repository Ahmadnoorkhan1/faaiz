import React, {useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import CardLayout from "../../layouts/CardLayout";
import Stepper from "../../components/Stepper";
import api from "../../service/apiService";
import { ClientFormData, clientSchema } from "../../utils/schemas/clientSchema";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

// Import step components
import AccountInfo from "./components/AccountInfo";
import BasicInfo from "./components/BasicInfo";

// Streamlined step order: Services first, then merged Account & Personal Info
const steps = [
  { title: "Service Selection", description: "Services" },
  { title: "Account & Personal", description: "Your Details" },
];

// Fields to validate for each step
const stepFields = {
  0: ["requestedServices", "otherDetails"],
  1: ["email", "password", "fullName", "organization", "phoneNumber", "additionalContact"],
};



const ClientOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>("Creating account...");
  const [stepValidated, setStepValidated] = useState<Record<number, boolean>>({});

  // Change form mode to onSubmit - only validate when explicitly triggered
  const methods = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      serviceId: [],
      otherDetails: "",
      fullName: "",
      phoneNumber: "",
      organization: "",
      additionalContact: "",
      discoveryMethod: "call", // Default value even though step is removed
      scopingDetails: {},
      interviewDate: "",
      interviewTime: "",
      termsAccepted: false,
    },
  });

  const {
    handleSubmit,
    watch,
    trigger,
    control,
    getValues,
    formState: { errors },
  } = methods;

  // Watch all fields for the current step
  const currentStepFields =
    stepFields[currentStep as keyof typeof stepFields] || [];
  const watchedStepFields = watch(currentStepFields as any);

  // Specifically watch requestedServices for Step 0
  const watchedServices = watch("serviceId");

  // Validation function for steps
  const validateCurrentStep = useCallback(
    async (showToast = true): Promise<boolean> => {
      if (isValidating) return false;

      setIsValidating(true);
      let isValid = false;

      try {
        const fieldsToValidate = [
          ...(stepFields[currentStep as keyof typeof stepFields] || []),
        ];

        // Special case for Step 0 (Service Selection) - check if any services are selected
        if (currentStep === 0) {
          const services = getValues("serviceId");

          if (services.length === 0) {
            if (showToast) {
              toast.error("Please select at least one service");
            }
            setIsValidating(false);
            setStepValidated((prev) => ({ ...prev, [currentStep]: false }));
            return false;
          }

          // If OTHER is selected, validate otherDetails
          if (
            services.includes("OTHER") &&
            !fieldsToValidate.includes("otherDetails")
          ) {
            fieldsToValidate.push("otherDetails");
          }
        }

        if (fieldsToValidate.length > 0) {
          // Trigger validation for all fields in this step
          isValid = await trigger(fieldsToValidate as any, {
            shouldFocus: true,
          });
        } else {
          isValid = true;
        }

        // Set step validation state
        setStepValidated((prev) => ({ ...prev, [currentStep]: isValid }));

        if (!isValid && showToast) {
          toast.error("Please fix the errors before proceeding.");
        }

        return isValid;
      } catch (error) {
        console.error("Validation error:", error);
        if (showToast) {
          toast.error("An error occurred during validation.");
        }
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    [currentStep, getValues, trigger, isValidating]
  );

  const [serviceList, setServiceList] = useState<any>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  
  const fetchServices = async () => {
      try {
        console.log("Starting to fetch services...");
        setIsLoadingServices(true);
        const response:any = await api.get('/api/services')
        console.log("API response:", response);
        console.log("Response data:", response.data);
        
        if(response.data.success){
          console.log("Services fetched successfully:", response.data.data);
          setServiceList(response.data.data)
        }else{
          console.error("API returned success=false:", response.data);
          toast.error("Failed to fetch services")
        }
      } catch (error) {
        console.error("Error in fetchServices:", error);
        toast.error("Error fetching services");
      } finally {
        setIsLoadingServices(false);
      }
    }
  useEffect(()=>{
    console.log("useEffect triggered - fetching services");
    fetchServices();
  },[])

  // Fetch full services on mount:
  // useEffect(() => {
  //   const fetchServices = async () => {
  //     try {
  //       const response = await api.get("/api/services");
  //       if (response.data.success) {
  //         // Assume response.data.data returns an array of service objects with id and name
  //         setServiceList(response.data.data);

  //         console.log("Fetched services:", response.data.data);


  //       } else {
  //         toast.error("Failed to fetch services");
  //         console.error("Failed to fetch services:", response.data.message);
  //       }
  //     } catch (error) {
  //       toast.error("Error fetching services");
  //       console.error(error);
  //     }
  //   };
  //   fetchServices();
  // }, []);

  // ... rest of your code

  const onSubmit: SubmitHandler<ClientFormData> = async (data) => {
    try {
      setLoading(true);
      setProcessingStatus("Creating account...");

      console.log("Submitting form data:", data);
      console.log("requestedServices (before mapping):", data.serviceId);
      
     
      const clientResponse = await api.post("/api/clients", {
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        organization: data.organization,
        additionalContact: data.additionalContact || null,
        serviceId: data.serviceId, // Use serviceId for one-to-many
        otherDetails: data.otherDetails || null,
        discoveryMethod: "call",
        scopingDetails: {},
        currentStep: 0,
        onboardingStatus: "COMPLETED",
      });

      const responseData = clientResponse.data.data;
      console.log("Created client with ID:", responseData.clientProfile.id);
      setProcessingStatus("Account created successfully!");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Account created successfully!");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: unknown) {
      console.error("Error in onboarding process:", error);
      let errorMessage = "Failed to complete onboarding.";
      if (error && typeof error === "object") {
        const err = error as Record<string, any>;
        if (err.response?.data?.message) {
          errorMessage += ` ${err.response.data.message}`;
        } else if (err.response?.data?.error) {
          errorMessage += ` ${err.response.data.error}`;
        } else if ("message" in err) {
          errorMessage += ` ${err.message}`;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  // Modified handle next button to properly submit form
  const handleNext = useCallback(async () => {
    if (isValidating) return;

    const isStepValid = await validateCurrentStep(true);

    if (isStepValid) {
      // If current step is the last step (Account & Personal), submit the form
      if (currentStep === 1) {
        console.log("Attempting to submit form...");
        // Directly call the onSubmit function with current form values
        const formValues = getValues();
        await onSubmit(formValues);
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  }, [currentStep, isValidating, validateCurrentStep, getValues, onSubmit]);

  const handleBack = useCallback(() => {
    if (currentStep > 0 && !loading) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, loading]);

  // Render only the first two steps
  const renderStepComponent = useCallback(() => {
    switch (currentStep) {
      case 0:
        return <BasicInfo  />; // Service Selection
      case 1:
        // Combined Account & Personal Info step with custom Phone field
        return (
          <div className="space-y-6">
            <AccountInfo />
            <div className="space-y-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...methods.register("fullName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="phoneNumber"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        country={'us'}
                        inputClass="!w-full !h-10 !border-gray-300 !rounded-md"
                        buttonClass="!border-gray-300"
                        dropdownClass=""
                        containerClass="!w-full"
                        specialLabel=""
                        inputProps={{
                          required: true,
                          className: '!w-full !h-10 border border-gray-300 !rounded-md ps-16'
                        }}
                      />
                    )}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...methods.register("organization")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your organization name"
                  />
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-500">{errors.organization.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Additional Contact Details
                  </label>
                  <input
                    {...methods.register("additionalContact")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Any additional contact information"
                  />
                  {errors.additionalContact && (
                    <p className="mt-1 text-sm text-red-500">{errors.additionalContact.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep, control, errors, methods]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#001538] py-8">
        <div className="relative z-10 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
          <CardLayout title="Processing Your Request">
            <div className="flex flex-col justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0078D4] mb-4"></div>
              <p className="text-white text-center mb-2">
                Please wait while we process your information...
              </p>
              <p className="text-white/70 text-center text-sm">
                {processingStatus}
              </p>
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
            <form className="space-y-8">
              <Stepper steps={steps} currentStep={currentStep} />

              <div className="mt-8 w-full min-h-[300px]">
                {renderStepComponent()}
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                  className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors
                    ${
                      currentStep === 0 || loading
                        ? "text-gray-300 border-gray-300 cursor-not-allowed"
                        : "text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading || isValidating}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
                    ${
                      loading || isValidating
                        ? "bg-[#003175] cursor-not-allowed"
                        : "bg-[#0078D4] hover:bg-[#106EBE]"
                    }`}
                >
                  {isValidating
                    ? "Validating..."
                    : loading
                    ? "Processing..."
                    : currentStep === 1
                    ? "Create Account"
                    : "Next"}
                </button>
              </div>
            </form>
          </FormProvider>
        </CardLayout>
      </div>
    </div>
  );
};

export default ClientOnboarding;