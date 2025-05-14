import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { ConsultantFormData, consultantSchema } from '../utils/schemas/consultantSchema';
import api from '../service/apiService';
import CardLayout from '../layouts/CardLayout';
import Input from '../components/FormElements/Input';
import Select from '../components/FormElements/Select';

const industryOptions = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'other', label: 'Other' },
];

// Step definitions
const steps = [
  { id: 1, name: "Basic Info", description: "Account & Personal" },
  { id: 2, name: "CV", description: "Upload Resume" },
  { id: 3, name: "Certifications", description: "Upload Documents" },
];

const ConsultantOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [consultantId, setConsultantId] = useState<string | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [uploadingCerts, setUploadingCerts] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid }
  } = useForm<ConsultantFormData>({
    // @ts-ignore
    resolver: zodResolver(consultantSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      organizationWebsite: '',
      contactFirstName: '',
      contactLastName: '',
      phone: '',
      industry: '',
      position: '',
      experience: '',
      dateOfBirth: '',
      certifications: [],
      servicesOffered: [],
      otherDetails: '',
      profileCompleted: false
    }
  });

  // Handle Basic Info Step submission
  const onSubmitBasicInfo: SubmitHandler<ConsultantFormData> = async (data) => {
    try {
      setLoading(true);
      const response = await api.post('/api/consultants', {
        ...data,
        onboardingStatus: 'IN_PROGRESS'
      });
      
      // Store consultant ID for subsequent steps
      if (response.data?.data?.id) {
        setConsultantId(response.data.data.id);
      } else if (response.data?.id) {
        setConsultantId(response.data.id);
      }
      
      toast.success('Basic information saved! Please continue with your CV upload.');
      // Move to next step
      setCurrentStep(1);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('Failed to complete onboarding. ' + (error.response?.data?.message || error.response?.data?.error || 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  // Handle CV file selection
  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (validTypes.includes(selectedFile.type)) {
      setCvFile(selectedFile);
    } else {
      toast.error("Only PDF or Word documents are allowed.");
      setCvFile(null);
    }
  };

  // Handle CV upload
  const handleCvUpload = async () => {
    if (!cvFile || !consultantId) {
      toast.error("Please select a CV file to upload");
      return;
    }

    try {
      setUploadingCv(true);
      const formData = new FormData();
      formData.append("cv", cvFile);

      await api.post(
        `/api/consultants/${consultantId}/cv`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("CV uploaded successfully!");
      // Move to next step
      setCurrentStep(2);
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      toast.error("Failed to upload CV: " + (error.response?.data?.message || 'Please try again.'));
    } finally {
      setUploadingCv(false);
    }
  };

  // Handle certification file selection
  const handleCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.type === "application/msword" ||
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type.startsWith("image/")
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only PDF, Word documents, and images are allowed.");
    }

    setCertFiles((prev) => [...prev, ...validFiles]);
  };

  // Remove certification file
  const removeCertFile = (index: number) => {
    setCertFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle certifications upload and complete profile
  const handleCertificationsUpload = async () => {
    try {
      setUploadingCerts(true);
      
      // If there are cert files, upload them
      if (certFiles.length > 0) {
        const formData = new FormData();
        certFiles.forEach((file) => {
          formData.append("certifications", file);
        });

        await api.post(
          `/api/consultants/${consultantId}/certifications`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }     
      
      toast.success('Consultant account setup completed!');
      navigate('/login');
    } catch (error: any) {
      console.error("Error in final step:", error);
      toast.error("Failed to complete profile setup: " + (error.response?.data?.message || 'Please try again.'));
    } finally {
      setUploadingCerts(false);
    }
  };

  // Handle going back a step
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Stepper component
  const Stepper = () => (
    <div className="mb-8">
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
          <div
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
            }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#0078D4] transition-all duration-300"
          />
        </div>
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                index <= currentStep ? "text-[#0078D4]" : "text-gray-500"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 ${
                  index <= currentStep
                    ? "border-[#0078D4] bg-[#0078D4] text-white"
                    : "border-gray-500"
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-1 font-semibold">{step.name}</span>
              <span className="text-xs text-gray-400">{step.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <form onSubmit={handleSubmit(onSubmitBasicInfo as any)} className="space-y-6">
            <div className="border-b border-[#003175] pb-6">
              <h3 className="text-lg font-medium text-white mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    register={register}
                    error={errors.password}
                    required
                    placeholder="Create a secure password"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-b border-[#003175] pb-6">
              <h3 className="text-lg font-medium text-white mb-4">Organization Information</h3>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Organization Website"
                    name="organizationWebsite"
                    type="url"
                    register={register}
                    error={errors.organizationWebsite}
                    required
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Contact First Name"
                      name="contactFirstName"
                      register={register}
                      error={errors.contactFirstName}
                      required
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Input
                      label="Contact Last Name"
                      name="contactLastName"
                      register={register}
                      error={errors.contactLastName}
                      required
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneInput
                        {...field}
                        country={'us'}
                        inputClass="!w-full !h-10 !border-[#EFEFFE] !rounded-md"
                        buttonClass=" !border-[#EFEFEF]"
                        dropdownClass=""
                        containerClass="!w-full"
                        specialLabel=""
                        inputProps={{
                          required: true,
                          className: '!w-full !h-10 bg-transparent border border-[#EFEFEF] !rounded-md ps-16'
                        }}
                      />
                    )}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Select
                    label="Industry"
                    name="industry"
                    register={register}
                    error={errors.industry}
                    required
                    options={industryOptions}
                  />
                </div>
              </div>
            </div>

            <div className="border-b border-[#003175] pb-6">
              <h3 className="text-lg font-medium text-white mb-4">Professional Information</h3>
              <div className="space-y-4">
                <div>
                  <Input
                    label="Position"
                    name="position"
                    register={register}
                    error={errors.position}
                    required
                    placeholder="Enter your position"
                  />
                </div>

                <div>
                  <Input
                    label="Years of Experience"
                    name="experience"
                    register={register}
                    error={errors.experience}
                    required
                    placeholder="Enter years of experience"
                  />
                </div>

                <div>
                  <Input
                    label="Date of Birth"
                    name="dateOfBirth"
                    type="date"
                    register={register}
                    error={errors.dateOfBirth}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={!isDirty || !isValid || loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !isDirty || !isValid || loading
                    ? 'bg-[#003175] cursor-not-allowed'
                    : 'bg-[#0078D4] hover:bg-[#106EBE]'
                }`}
              >
                {loading ? 'Submitting...' : 'Next: Upload CV'}
              </button>
            </div>
          </form>
        );
      
      case 1: // CV Upload Step
        return (
          <div className="space-y-6">
            <div className="border-b border-[#003175] pb-6">
              <h3 className="text-lg font-medium text-white mb-4">Upload Your CV</h3>
              <p className="text-sm text-white/70 mb-4">
                Upload your CV or Resume in PDF or Word format. This helps clients understand your qualifications.
              </p>
              
              <div className="mt-6">
                <label className="block">
                  <span className="inline-block bg-[#0078D4] text-white px-4 py-2 rounded-full text-sm font-semibold cursor-pointer hover:bg-[#106EBE]">
                    Choose File
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvFileChange}
                  />
                </label>
              </div>

              {cvFile && (
                <div className="mt-4 p-3 bg-[#242935] rounded-lg text-sm text-white/70 flex items-center justify-between">
                  <span>{cvFile.name}</span>
                  <button
                    onClick={() => setCvFile(null)}
                    className="text-red-500 hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between space-x-4 pt-6">
              <button
                onClick={handleBack}
                className="w-full px-4 py-2 border border-gray-600 text-black rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCvUpload}
                disabled={!cvFile || uploadingCv}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  !cvFile || uploadingCv
                    ? 'bg-[#003175] cursor-not-allowed'
                    : 'bg-[#0078D4] hover:bg-[#106EBE]'
                }`}
              >
                {uploadingCv ? 'Uploading...' : 'Next: Certifications'}
              </button>
            </div>
          </div>
        );
      
      case 2: // Certifications Upload Step
        return (
          <div className="space-y-6">
            <div className="border-b border-[#003175] pb-6">
              <h3 className="text-lg font-medium text-white mb-4">Upload Certifications</h3>
              <p className="text-sm text-white/70 mb-4">
                Upload any relevant certifications or qualification documents (Optional).
                <br />
                Accepted formats: PDF, Word documents, and images
              </p>
              
              <div className="mt-6">
                <label className="block">
                  <span className="sr-only">Choose certification files</span>
                  <input
                    type="file"
                    multiple
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#0078D4] file:text-white
                      hover:file:bg-[#106EBE]"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleCertFileChange}
                  />
                </label>
              </div>

              {certFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {certFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm text-white/70 bg-[#242935] p-3 rounded-lg"
                    >
                      <span>{file.name}</span>
                      <button
                        onClick={() => removeCertFile(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between space-x-4 pt-6">
              <button
                onClick={handleBack}
                className="w-full px-4 py-2 border border-gray-600 text-black hover:text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCertificationsUpload}
                disabled={uploadingCerts}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  uploadingCerts
                    ? 'bg-[#003175] cursor-not-allowed'
                    : 'bg-[#0078D4] hover:bg-[#106EBE]'
                }`}
              >
                {uploadingCerts ? 'Finalizing...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading && currentStep === 0) {
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
          <CardLayout title="Consultant Onboarding">
            <Stepper />
            {renderStepContent()}
          </CardLayout>
        </div>
      </div>
    </div>
  );
};

export default ConsultantOnboarding;