import React from "react";
import { useProfile } from "../../utils/ProfileContext";
import { useAuth } from "../../utils/AuthContext";



const ClientProfileCompletionWrapper: React.FC = () => {
  const { profileData, loading } = useProfile();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };
  console.log(profileData.onboardingStatus === "NOT_STARTED", '<<< this is my onboarding status')
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

  const renderScopingForm = () => {
    return (
      <div>
        <h1>Scoping Form</h1>
      </div>
    )
  }

  const renderAcknowledgement = () => {
    return (
      <div>
        <h1>Acknowledgement</h1>
      </div>
    )
  }

  const renderNDA = () => {
    return (
      <div>
        <h1>NDA</h1>
      </div>
    )
  }

  const renderCompleted = () => {
    return (
      <div>
        <h1>Completed</h1>
      </div>
    )
  }

  const renderSteps = () => {
    switch (profileData.onboardingStatus) {
      case "NOT_STARTED":
        return renderDiscoveryCallPendingModal();
      case "DISCOVERY_SCHEDULED":
        return renderScopingForm();
      case "SCOPING_REVIEW":
        return renderAcknowledgement();
      case "NDA_SIGNED":
        return renderNDA();
      case "COMPLETED":
        return renderCompleted();
    }
  }

  // Discovery call pending modal
  return renderSteps();
};

export default ClientProfileCompletionWrapper; 