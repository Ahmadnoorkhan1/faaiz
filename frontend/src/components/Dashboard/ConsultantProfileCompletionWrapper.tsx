import React, { useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import { useProfile } from "../../utils/ProfileContext";
import api from "../../service/apiService";

interface Step {
  id: number;
  name: string;
  component: React.FC<StepProps>;
}

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  isLastStep: boolean;
}

const AVAILABLE_SERVICES = [
  {
    name: "ISO 27001 Information Security Management System",
    serviceType: "ISO_27001_INFORMATION_SECURITY_MANAGEMENT_SYSTEM",
  },
  {
    name: "ISO 27701 Privacy Information Management System",
    serviceType: "ISO_27701_PRIVACY_INFORMATION_MANAGEMENT_SYSTEM",
  },
  {
    name: "ISO 22301 Business Continuity Management System",
    serviceType: "ISO_22301_BUSINESS_CONTINUITY_MANAGEMENT_SYSTEM",
  },
  {
    name: "ISO 27017 Information Security Controls for Cloud Services",
    serviceType: "ISO_27017_CLOUD_SECURITY_CONTROLS",
  },
  {
    name: "ISO 27018 PII Protection in Public Clouds",
    serviceType: "ISO_27018_PII_PROTECTION_IN_PUBLIC_CLOUD",
  },
  {
    name: "ISO 20000 Service Management",
    serviceType: "ISO_20000_SERVICE_MANAGEMENT",
  },
  {
    name: "ISO 12207:2017 Software Life Cycle Processes",
    serviceType: "ISO_12207_SOFTWARE_LIFE_CYCLE",
  },
  {
    name: "ISO 42001 Artificial Intelligence Management System",
    serviceType: "ISO_42001_AI_MANAGEMENT_SYSTEM",
  },
  { name: "Testing Services", serviceType: "TESTING_SERVICES" },
  { name: "Risk Assessment", serviceType: "RISK_ASSESSMENT" },
  { name: "Business Impact Analysis", serviceType: "BUSINESS_IMPACT_ANALYSIS" },
  { name: "Privacy Impact Analysis", serviceType: "PRIVACY_IMPACT_ANALYSIS" },
  { name: "Data Assurance", serviceType: "DATA_ASSURANCE" },
  { name: "Audit", serviceType: "AUDIT" },
  { name: "Awareness Training", serviceType: "AWARENESS_TRAINING" },
  { name: "Tabletop Exercise", serviceType: "TABLETOP_EXERCISE" },
];

const SelectServices: React.FC<StepProps> = ({ onNext }) => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const { user } = useAuth();

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleNext = () => {
    if (selectedServices.length === 0) {
      alert("Please select at least one service");
      return;
    }
    const updateConsultant = async () => {
      try {
        await api.post(`/api/consultants/${user?.consultantProfile?.id}`, {
          servicesOffered: selectedServices,
        });
      } catch (error) {
        console.log(error);
      }
    };
    updateConsultant();
    // Save services to parent form data
    onNext();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-200">
        Select Your Services
      </h3>
      <p className="text-sm text-gray-400">
        Choose the services you'll provide to clients
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
        {AVAILABLE_SERVICES.map((service, index) => (
          <label
            key={index}
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
              selectedServices.includes(service.serviceType)
                ? "bg-blue-600 text-white"
                : "bg-[#242935] text-gray-300 hover:bg-[#2d3544]"
            }`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={selectedServices.includes(service.serviceType)}
              onChange={() => toggleService(service.serviceType)}
            />
            <span className="ml-2">{service.name}</span>
          </label>
        ))}
      </div>

      <button
        onClick={handleNext}
        className="w-full px-4 py-2 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        disabled={selectedServices.length === 0}
      >
        Continue
      </button>
    </div>
  );
};

const UploadCV: React.FC<StepProps> = ({ onNext, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (validTypes.includes(selectedFile.type)) {
      setFile(selectedFile);
    } else {
      alert("Only PDF or Word documents are allowed.");
      setFile(null);

    }
  };

  const handleUpload = async () => {
    if (!file || !user?.consultantProfile?.id) return;

    try {
      const formData = new FormData();
      formData.append("cv", file);
      setUploading(true);

      await api.post(
        `/api/consultants/${user?.consultantProfile?.id}/cv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      onNext();
    } catch (error) {
      console.error("Error uploading CV:", error);
      alert("Failed to upload CV. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-200">Upload Your CV</h3>
      <p className="text-sm text-gray-400">
        Upload your CV in PDF or Word format
      </p>

      <div className="mt-4">
        <label className="block">
        <span
    className="inline-block bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-blue-600"
  >
    Choose File
  </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {file && (
        <div className="text-sm text-gray-400">Selected file: {file.name}</div>
      )}

      <div className="flex justify-between space-x-4 mt-4 items-center">
        <button
          onClick={onBack}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:cursor-pointer disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

const UploadCertifications: React.FC<StepProps> = ({
  onNext,
  onBack,
  isLastStep,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const { user } = useAuth();

  const updateConsultant = async () => {
    try {
      await api.post(`/api/consultants/${user?.consultantProfile?.id}`, {
        profileCompleted: true,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      alert(
        "Some files were skipped. Only PDF, Word documents, and images are allowed."
      );
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      updateConsultant();
      onNext(); // Skip if no files selected since it's optional
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("certifications", file);
      });

      await api.post(
        `/api/consultants/${user?.consultantProfile?.id}/certifications`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      updateConsultant();
      onNext();
    } catch (error) {
      console.error("Error uploading certifications:", error);
      alert("Failed to upload certifications. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-200">
        Upload Certifications
      </h3>
      <p className="text-sm text-gray-400">
        Upload any relevant certifications (Optional)
        <br />
        Accepted formats: PDF, Word documents, and images
      </p>

      <div className="mt-4">
        <label className="block">
          <span className="sr-only">Choose certification files</span>
          <input
            type="file"
            multiple
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-500 file:text-white
              hover:file:bg-blue-600"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm text-gray-400 bg-[#242935] p-2 rounded"
            >
              <span>{file.name}</span>
              <button
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between space-x-4 mt-4">
        <button
          onClick={onBack}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Back
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? "Uploading..." : isLastStep ? "Complete" : "Continue"}
        </button>
      </div>
    </div>
  );
};

const steps: Step[] = [
  { id: 1, name: "Services", component: SelectServices },
  { id: 2, name: "CV", component: UploadCV },
  { id: 3, name: "Certifications", component: UploadCertifications },
];

const ConsultantProfileCompletionWrapper: React.FC = () => {
  const { user } = useAuth();
  const { profileData, userType } = useProfile();
  const [showPopup, setShowPopup] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  // Only show for consultants with incomplete profiles
  if (
    !user ||
    userType !== "consultant" ||
    !profileData ||
    profileData.profileCompleted
  ) {
    return null;
  }

  if (!showPopup) {
    return null;
  }

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Handle profile completion
      setShowPopup(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-[#1a1f2b] rounded-xl p-6 w-full mx-64">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-200">
              Complete Your Profile
            </h2>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
              <div
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
              />
            </div>
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? "text-blue-500" : "text-gray-500"
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-sm border-2 ${
                      index <= currentStep
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="text-xs mt-1">{step.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <CurrentStepComponent
          onNext={handleNext}
          onBack={handleBack}
          isLastStep={currentStep === steps.length - 1}
        />
      </div>
    </div>
  );
};

export default ConsultantProfileCompletionWrapper;
