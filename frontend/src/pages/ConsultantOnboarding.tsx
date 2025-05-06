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

const ConsultantOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  const onSubmit: SubmitHandler<ConsultantFormData> = async (data) => {
    try {
      setLoading(true);
      await api.post('/api/consultants', {
        ...data,
        onboardingStatus: 'IN_PROGRESS'
      });
      toast.success('Consultant account created successfully! Please complete your profile in the dashboard.');
      navigate('/login');
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error('Failed to complete onboarding. ' + error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
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
          <CardLayout title="Consultant Onboarding">
            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
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
                    <label className="block text-sm font-medium  mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="phone"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          {...field}
                          country={'us'}
                          inputClass="!w-full  !h-10  !border-[#EFEFFE] !rounded-md"
                          buttonClass=" !border-[#EFEFEF]"
                          dropdownClass=""
                          containerClass="!w-full"
                          specialLabel=""
                          inputProps={{
                            required: true,
                            className: '!w-full !h-10 bg-transparent border border-[#EFEFEF]   !rounded-md ps-16'
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
                  {loading ? 'Submitting...' : 'Create Consultant Account'}
                </button>
              </div>
            </form>
          </CardLayout>
        </div>
      </div>
    </div>
  );
};

export default ConsultantOnboarding;