import React, { useState, useEffect, useRef, useCallback } from "react";
import { useProfile } from "../../utils/ProfileContext";
import { useAuth } from "../../utils/AuthContext";
import api from "../../service/apiService";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import { NDAContent } from "../../pages/Dashboard/Profile";
import ProposalPreview from "../../pages/ClientOnboarding/components/ProposalGeneration";


// Add after imports
interface ProposalData {
  id: string;
  serviceType: string;
  phases: Array<{
    id: number;
    phase: string;
    deliverables: string;
  }>;
  timeline: Array<{
    id: number;
    phase: string;
    description: string;
  }>;
  deliverables: Array<{
    id: number;
    title: string;
    description: string;
  }>;
}

// Types
type OnboardingStep =
  | "NOT_STARTED"
  | "PENDING_DISCOVERY"
  | "DISCOVERY_SCHEDULED"
  | "DISCOVERY_COMPLETED"
  | "SCOPING_REVIEW"
  | "TERMS_PENDING"
  | "NDA_PENDING"
  | "COMPLETED";

// Updated mapping constants - removed "Scheduled" step
const statusToStepMap: Record<OnboardingStep, number> = {
  "NOT_STARTED": 0,
  "PENDING_DISCOVERY": 0,
  "DISCOVERY_SCHEDULED": 0, // Now part of Discovery Call step
  "DISCOVERY_COMPLETED": 1,
  "SCOPING_REVIEW": 1,
  "TERMS_PENDING": 2,
  "NDA_PENDING": 3,
  "COMPLETED": 4
};

const stepToStatusMap: Record<number, OnboardingStep> = {
  0: "PENDING_DISCOVERY",
  1: "DISCOVERY_COMPLETED",
  2: "TERMS_PENDING",
  3: "NDA_PENDING",
  4: "COMPLETED"
};

// Updated onboarding steps - removed "Scheduled"
const onboardingSteps = [
  { title: "Discovery Call" },
  { title: "Scoping" },
  { title: "Terms" },
  { title: "NDA" },
  { title: "Complete" }
];

const ClientProfileCompletionWrapper: React.FC = () => {
  // Context hooks
  const { profileData, loading } = useProfile();
  const { user, logout } = useAuth();
  
  // Step state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [originalStep, setOriginalStep] = useState<number>(0);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  
  // Terms state
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState<boolean>(false);
  const termsRef = useRef<HTMLDivElement>(null);
  
  // NDA state 
  const [ndaStatus, setNdaStatus] = useState<{ signed: boolean, url?: string }>({ signed: false });
  const [signature, setSignature] = useState<string>("");
  const [signingNda, setSigningNda] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  
  // UI state
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [stepError, setStepError] = useState<string | null>(null);


const [proposalData, setProposalData] = useState<ProposalData | null>(null);

  useEffect(() => {
    if (currentStep === 4 && profileData?.requestedServices?.[0]) {
      handleGetProposal(profileData.requestedServices[0]);
    }
  }, [currentStep, profileData?.requestedServices]);

  const handleGetProposal = async (serviceType: string) => {
    try {
      const response = await api.get(`/api/proposals/getProposal/${serviceType}`);
  
      console.log('Fetched proposal data:', response.data);
  
      if (response.data) {
         setProposalData({
        id: response.data.data.id,
        serviceType: response.data.data.serviceType,
        phases: response.data.data.phases,
        timeline: response.data.data.timeline,
        deliverables: response.data.data.deliverables
      });
        console.log('Proposal data', response.data);
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast.error('Failed to fetch proposal data');
    }
  };
  // Effect: Update current step based on onboarding status
  useEffect(() => {
    if (profileData && profileData.onboardingStatus) {
      try {
        const status = profileData.onboardingStatus.toUpperCase() as OnboardingStep;
        
        // If status is SCOPING_REVIEW, immediately show the scoping form
        if (status === "SCOPING_REVIEW") {
          setCurrentStep(1); // Updated to match new step indexing
          setOriginalStep(1);
          setCanGoBack(false); // No going back to discovery steps
          console.log(`Scoping review detected, skipping to scoping step`);
        } else {
          const step = statusToStepMap[status] || 0;
          setCurrentStep(step);
          setOriginalStep(step);
          setCanGoBack(step > 0);
          console.log(`Current onboarding status: ${status}, mapped to step: ${step}`);
        }
      } catch (error) {
        console.error("Error setting step:", error);
        setCurrentStep(0);
      }
    }
  }, [profileData]);

  // Effect: Check NDA status when in NDA_PENDING stage
  useEffect(() => {
    if (profileData && profileData.id && 
        profileData.onboardingStatus === "NDA_PENDING") {
      checkNdaStatus();
    }
  }, [profileData]);

  // Effect: Set up canvas for signature
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && profileData.onboardingStatus === "NDA_PENDING") {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0078D4';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [profileData.onboardingStatus]);

  // Effect: Show confetti when onboarding completes
  useEffect(() => {
    if (profileData.onboardingStatus === "COMPLETED") {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [profileData.onboardingStatus]);

  // Handler Functions
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleGoBack = useCallback(() => {
    if (currentStep > 0 && currentStep <= originalStep) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep, originalStep]);

  const handleGoForward = useCallback(() => {
    if (currentStep < onboardingSteps.length - 1 && currentStep < originalStep) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, originalStep]);

  const handleTermsScroll = useCallback(() => {
    if (termsRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        setHasScrolledToBottom(true);
      }
    }
  }, []);

  // Updated handleAcceptTerms function - now advances to NDA step directly
  const handleAcceptTerms = useCallback(async () => {
    if (!termsAccepted || !profileData.id) return;
    
    try {
      setSubmitting(true);
      setStepError(null);
      
      // Call the terms API endpoint
      const response = await api.post(`/api/clients/${profileData.id}/status`, {
        status: "NDA_PENDING"
      });

      if (response.data.success) {
        toast.success('Terms accepted successfully');
        // Advance to NDA step
        setCurrentStep(3);
      } else {
        toast.error(response.data.message || 'Failed to accept terms');
      }
    } catch (error: any) {
      console.error('Error accepting terms:', error);
      setStepError(error.message || 'Failed to accept terms');
      toast.error(error.message || 'Failed to accept terms');
    } finally {
      setSubmitting(false);
    }
  }, [termsAccepted, profileData.id]);

  // NDA functions - remain unchanged
  const checkNdaStatus = async () => {
    if (!profileData.id) return;
    try {
      const response = await api.get(`/api/clients/${profileData.id}/nda-status`);
      setNdaStatus({
        signed: response.data.signed || false,
        url: response.data.url
      });
    } catch (error: any) {
      console.error('Error checking NDA status:', error);
      setStepError('Failed to check NDA status');
    }
  };

  const handleSignNDA = async (signature:any) => {
    if (!signature) {
      toast.error('Please draw your signature before submitting');
      return;
    }
    if (!profileData.id) {
      toast.error('Your profile information is not available');
      return;
    }
    try {
      setSigningNda(true);
      setStepError(null);
      const response = await api.post(`/api/clients/${profileData.id}/sign-nda`, { 
        signatureData: signature 
      });
      if (response.data.success) {
        toast.success('NDA signed successfully');
        await api.post(`/api/clients/${profileData.id}/status`, {
          status: "COMPLETED"
        });
        
        // Move to completed step
        setCurrentStep(4);
      } else {
        throw new Error(response.data.message || 'Failed to sign NDA');
      }
    } catch (error: any) {
      console.error('Error signing NDA:', error);
      setStepError(error.message || 'Failed to sign NDA');
      toast.error(error.message || 'Failed to sign NDA');
    } finally {
      setSigningNda(false);
    }
  };

  const handleAcceptProposal = useCallback(async () => {
    if (!profileData.id) {
      toast.error('Your profile information is not available');
      return;
    }
    try { 
      toast.success('Proposal accepted successfully');
      setSubmitting(true);
      setStepError(null);
      setCurrentStep(5);
      
    } catch (error: any) {
      console.error('Error accepting proposal:', error);
      setStepError(error.message || 'Failed to accept proposal');
      toast.error(error.message || 'Failed to accept proposal');
    }
  }, [profileData.id]);
  // Drawing functions for signature pad
  

  // UI Components
  const OnboardingStepper = () => (
    <div className="mb-6">
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
          <div
            style={{
              width: `${((currentStep) / (onboardingSteps.length - 1)) * 100}%`,
            }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
          />
        </div>
        <div className="flex justify-between">
          {onboardingSteps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  index <= currentStep
                    ? "border-2 border-blue-500 bg-blue-500 text-white"
                    : "border-2 border-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Add type definitions for component props
  interface StepperNavigationProps {
    onBack: () => void;
    onNext: () => void;
    canGoBack?: boolean;
    canGoForward?: boolean;
    nextLabel?: string;
    loading?: boolean;
    customRightButton?: React.ReactNode;
  }

  interface ScopingFormProps {
    onNext: () => void;
  }

  // Navigation Controls component with proper type definitions
  const StepperNavigation: React.FC<StepperNavigationProps> = ({ 
    onBack, 
    onNext, 
    canGoBack = false, 
    canGoForward = false, 
    nextLabel = "Next", 
    loading = false,
    customRightButton = null 
  }) => (
    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
      <button
        onClick={onBack}
        disabled={!canGoBack || loading}
        className={`px-4 py-2 rounded-md flex items-center ${
          canGoBack && !loading 
            ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
            : "bg-gray-800 text-gray-500 cursor-not-allowed"
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      
      {customRightButton || (
        <button
          onClick={onNext}
          disabled={!canGoForward || loading}
          className={`px-6 py-2 rounded-md text-white flex items-center ${
            canGoForward && !loading
              ? "bg-blue-600 hover:bg-blue-700" 
              : "bg-blue-800 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-white rounded-full mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              {nextLabel}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  );

  // Step components
  const ScopingForm: React.FC<ScopingFormProps> = ({ onNext }) => {
    const [scopingData, setScopingData] = useState<any>(null);
    const [loadingScopingData, setLoadingScopingData] = useState<boolean>(true);
    const [scopingError, setScopingError] = useState<string | null>(null);
    
    // Use a proper state to track API call status
    const [apiCallStatus, setApiCallStatus] = useState({
      called: false,
      completed: false
    });

    useEffect(() => {
      const fetchScopingData = async () => {
        // Avoid duplicate API calls
        if (apiCallStatus.called) return;
        
        setApiCallStatus(prev => ({ ...prev, called: true }));
        setLoadingScopingData(true);
        setScopingError(null);
        
        try {
          if (profileData?.id && profileData?.requestedServices?.length > 0) {
            const serviceType = profileData.requestedServices[0];
            console.log(`Fetching scoping data for client: ${profileData.id}, service: ${serviceType}`);
            
            const response = await api.get(
              `/api/scoping-forms/client/${profileData.id}/service/${serviceType}`
            );
            
            if (response.data?.success && response.data.data) {
              setScopingData(response.data.data);
            } else {
              setScopingError('Failed to load scoping form data.');
            }
          } else {
            setScopingError('No service found for this client.');
          }
        } catch (error: any) {
          console.error('Error fetching scoping form:', error);
          setScopingError(error.message || 'Failed to load scoping form data.');
        } finally {
          setLoadingScopingData(false);
          setApiCallStatus(prev => ({ ...prev, completed: true }));
        }
      };

      fetchScopingData();
    }, []); // Empty dependency array ensures it only runs once

    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return dateString;
      }
    };

    const goToNextStep = useCallback(() => {
      if (onNext && typeof onNext === 'function') {
        onNext();
      }
    }, [onNext]);

    return (
      <>
        {scopingError && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-400">{scopingError}</p>
          </div>
        )}

        <div className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto pr-2 custom-scrollbar">
          {loadingScopingData ? (
            <div className="bg-[#242935] p-8 rounded-lg flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-300">Loading your scoping details...</p>
            </div>
          ) : (
            scopingData && (
              <div className="bg-white rounded-lg p-6 text-gray-800">
                <div className="border-b border-gray-200 pb-4 mb-4">
                  <h2 className="text-xl font-semibold">{scopingData.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {formatDate(scopingData.lastUpdated)}
                  </p>
                  {scopingData.status && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {scopingData.status}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {scopingData.questions.map((question: any, index: number) => (
                    <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-medium text-gray-900">{question.text}</h3>
                      <p className="mt-2 text-gray-700">
                        {/* First try to get answer by index, then by ID */}
                        {scopingData.answers[index.toString()] || 
                         scopingData.answers[question.id] || 
                         "No answer provided"}
                      </p>
                      
                      {question.type === 'radio' && question.options.length > 0 && (
                        <div className="mt-1 text-xs text-gray-500">
                          Options: {question.options.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {scopingData.notes && (
                  <div className="mt-6 border-t border-gray-200 pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
                    <p className="text-gray-700">{scopingData.notes}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>

        <StepperNavigation
          onBack={handleGoBack}
          onNext={goToNextStep}
          canGoBack={true}
          canGoForward={!loadingScopingData && apiCallStatus.completed}
          loading={loadingScopingData}
          nextLabel="Continue to Terms"
        />
      </>
    );
  };

  // Modal wrappers
  // const renderDiscoveryCallPendingModal = () => (
  //   <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
  //     <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-2xl m-4">
  //       <OnboardingStepper />
        
  //       <div className="flex justify-between items-center mb-4">
  //         <h2 className="text-xl font-semibold text-gray-200">
  //           Discovery Call Required
  //         </h2>
  //       </div>

  //       <div className="space-y-4 min-h-[40vh] max-h-[60vh]">
  //         <div className="bg-[#242935] p-6 rounded-lg">
  //           <div className="flex flex-col items-center text-center">
  //             <div className="mb-4">
  //               <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  //               </svg>
  //             </div>
  //             <h3 className="text-xl font-medium text-gray-200 mb-2">Waiting for Discovery Call</h3>
  //             <p className="text-gray-300 mb-4">
  //               Your account is currently pending a discovery call with our team. This call is essential for us to understand your needs and requirements.
  //             </p>
  //             <p className="text-gray-400 text-sm">
  //               Our team will contact you soon to schedule this call. In the meantime, you can browse through the dashboard, but some features may be limited.
  //             </p>
  //           </div>
  //         </div>

  //         <div className="bg-[#242935] p-4 rounded-lg border-l-4 border-blue-500">
  //           <h4 className="text-md font-medium text-gray-200 mb-2">What to expect during the discovery call:</h4>
  //           <ul className="list-disc pl-5 text-gray-300 space-y-1">
  //             <li>Discussion of your organization's specific needs</li>
  //             <li>Overview of our service capabilities</li>
  //             <li>Initial assessment of security requirements</li>
  //             <li>Timeline and next steps in the onboarding process</li>
  //           </ul>
  //         </div>
  //       </div>
        
  //       <StepperNavigation
  //         onBack={() => {}}
  //         onNext={() => {}}
  //         canGoBack={false}
  //         canGoForward={true}
  //         customRightButton={
  //           <button 
  //             className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md transition-colors" 
  //             onClick={handleLogout}
  //           >
  //             Log out
  //           </button>
  //         }
  //       />
  //     </div>
  //   </div>
  // );

  const renderScopingForm = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-4xl m-4">
        <OnboardingStepper />

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">
            Review Scoping Details
          </h2>
        </div>

        <ScopingForm onNext={() => setCurrentStep(2)} />
      </div>
    </div>
  );

  const renderAcknowledgement = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-3xl m-4">
        <OnboardingStepper />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">
            Terms & Conditions
          </h2>
        </div>

        {stepError && (
          <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-400">{stepError}</p>
          </div>
        )}

        <div className="space-y-4 h-[calc(100vh-20rem)] overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-[#242935] p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-200 mb-4">Please Review Our Terms</h3>
            
            <div 
              ref={termsRef}
              onScroll={handleTermsScroll}
              className="h-64 overflow-y-auto p-4 text-white bg-[#1a1f2b] rounded-lg border border-gray-700 prose prose-sm prose-invert max-w-none custom-scrollbar"
            >
              <h4>Terms and Conditions of Service</h4>
              <p>This Agreement ("Agreement") is entered into between GRCDepartment Co W.L.L ("Company") and the client ("Client"). By using our services, you agree to the following terms and conditions:</p>
              
              <h5>1. Services</h5>
              <p>The Company will provide cybersecurity and compliance services as outlined in the approved project scope and statement of work (SOW).</p>
              
              {/* Terms content - abbreviated for display */}
              <h5>12. Amendments</h5>
              <p>Any amendments to this Agreement must be in writing and signed by both parties.</p>
            </div>
            
            <div className="mt-6 flex items-center">
              <input
                type="checkbox"
                id="terms-checkbox"
                checked={termsAccepted}
                onChange={() => setTermsAccepted(!termsAccepted)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
                // disabled={!hasScrolledToBottom}
              />
              <label htmlFor="terms-checkbox" className="ml-2 block text-gray-300">
                I have read and agree to the terms and conditions
                {!hasScrolledToBottom && (
                  <span className="ml-2 text-yellow-500 text-sm">(Please scroll to the bottom to accept)</span>
                )}
              </label>
            </div>
          </div>
        </div>
        
        <StepperNavigation
          onBack={handleGoBack}
          onNext={handleAcceptTerms}
          canGoBack={true}
          canGoForward={termsAccepted && !submitting}
          loading={submitting}
          nextLabel="Accept Terms & Continue"
        />
      </div>
    </div>
  );

  const renderNDA = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-3xl m-4">
        <OnboardingStepper />
        <NDAContent consultantEmail={user.email} consultantName={profileData.fullName} onSign={handleSignNDA} onClose={()=>{}} />
        <StepperNavigation
          onBack={handleGoBack}
          onNext={()=>{}}
          canGoBack={true}
          canGoForward={!!signature && !signingNda}
          loading={signingNda}
          nextLabel="Sign Agreement & Continue"
        />
      </div>
    </div>
  );
  
  const renderProposal = () => {

  

    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
        <div className="bg-[#1a1f2b] rounded-xl p-6  max-w-3xl m-4 relative overflow-y-scroll h-[75vh] ">
          <div className="absolute inset-0 bg-blue-500/5 z-0"></div>
          <div className="relative z-10">
            <OnboardingStepper />
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-200 mb-2">Proposal</h2>
            </div>
            <div className="space-y-4">
              <ProposalPreview name={profileData.fullName} organization={profileData.organization} requestedServices={profileData.requestedServices[0]}
  proposalData={proposalData || undefined} // Convert null to undefined

              />
            </div>
            <StepperNavigation
              onBack={handleGoBack}
              onNext={handleAcceptProposal}
              canGoBack={false}
              canGoForward={true}
              nextLabel="Accept Proposal"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderCompleted = () => (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-3xl m-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 z-0"></div>
        
        <div className="relative z-10">
          <OnboardingStepper />
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600 text-white mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-200 mb-2">Onboarding Complete!</h2>
            <p className="text-gray-300">
              Thank you for completing the onboarding process. You now have full access to the platform.
            </p>
          </div>
          
          <div className="space-y-4 h-[calc(100vh-26rem)] overflow-y-auto pr-2 custom-scrollbar">
            {/* Account info section */}
            <div className="bg-[#242935] rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-200 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Name</p>
                  <p className="text-gray-200">{profileData.fullName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-gray-200">{user?.email}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Organization</p>
                  <p className="text-gray-200">{profileData.organization}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Account Status</p>
                  <p className="text-green-500 font-medium">Active</p>
                </div>
              </div>
            </div>
            
            {/* Next steps and support sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#242935] rounded-lg p-6 hover:bg-[#2a303e] transition-colors">
                <h3 className="text-lg font-medium text-gray-200 mb-3">Next Steps</h3>
                <ul className="text-gray-300 space-y-2">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Explore your dashboard
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Review project status
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Access your documents
                  </li>
                </ul>
              </div>
              
              <div className="bg-[#242935] rounded-lg p-6 hover:bg-[#2a303e] transition-colors">
                <h3 className="text-lg font-medium text-gray-200 mb-3">Support</h3>
                <p className="text-gray-300 mb-4">
                  Need assistance? Our support team is here to help you.
                </p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors w-full">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
          
          <StepperNavigation
            onBack={() => {}}
            onNext={() => window.location.reload()}
            canGoBack={false}
            canGoForward={true}
            nextLabel="Continue to Dashboard"
          />
        </div>
      </div>
    </div>
  );

  // Loading spinner
  if (loading) {
    return ( 
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking account status...</p>
        </div>
      </div>
    );
  }

  useEffect(()=>{
    // const 
  },[])


  const renderDiscoveryCallPendingModal = () => {
    return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
        <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-2xl m-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-200">
            Discovery Call Required
            </h2>
        </div>

        <div className="space-y-4">
            <div className="bg-[#242935] p-6 rounded-lg">
            <div className="flex flex-col items-center text-center">
                <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-200 mb-2">Waiting for Discovery Call</h3>
                <p className="text-gray-300 mb-4">
                Your account is currently pending a discovery call with our team. This call is essential for us to understand your needs and requirements.
                </p>
                <p className="text-gray-400 text-sm">
                Our team will contact you soon to schedule this call. In the meantime, you can browse through the dashboard, but some features may be limited.
                </p>
            </div>
            </div>
            <div className="flex justify-end">
                <button className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded-md" onClick={handleLogout} >Log out</button>
            </div>
        </div>
        </div>
    </div>
    )
  }

  const renderSteps = () => {
    switch (currentStep) {
      case 0:
        return renderDiscoveryCallPendingModal();
      case 1:
        return renderScopingForm();
      case 2:
        return renderAcknowledgement();
      case 3:
        return renderNDA();
      case 4:
        return renderProposal();
      case 5:
        return renderCompleted();
      default:
        return renderDiscoveryCallPendingModal();
    }
  };

  return renderSteps();
};

export default ClientProfileCompletionWrapper;