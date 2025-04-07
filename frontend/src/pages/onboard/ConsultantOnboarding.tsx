import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import CardLayout from '../../layouts/CardLayout';
import Input from '../../components/form/Input';
import Select from '../../components/form/Select';
import { consultantSchema, ConsultantFormData } from '../../schemas/consultantSchema';
import { createConsultant } from '../../services/api/consultantService';

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
    formState: { errors, isDirty, isValid }
  } = useForm<ConsultantFormData>({
    resolver: zodResolver(consultantSchema),
    mode: 'all', // Changed from onChange to all to validate on all events
    defaultValues: {
      email: '',
      password: '',
      organizationWebsite: '',
      contactName: '',
      contactInfo: '',
      industry: '',
      firstName: '',
      lastName: '',
      position: '',
      experience: '',
      dateOfBirth: '',
    }
  });

  const onSubmit = async (data: ConsultantFormData) => {
    try {
      setLoading(true);
      
      // Create consultant profile with user data
      await createConsultant(data);
      
      // Success message and redirect
      toast.success('Consultant profile created successfully!');
      navigate('/login');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to create consultant profile. Please try again.');
    } finally {
      setLoading(false);
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
          <CardLayout title="Consultant Onboarding">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="border-b border-neutral-200 pb-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Account Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email}
                    required
                    placeholder="your.email@example.com"
                  />
                  
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
              
              <div className="border-b border-neutral-200 pb-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Organization Information</h3>
                <div className="space-y-4">
                  <Input
                    label="Organization Website"
                    name="organizationWebsite"
                    type="url"
                    register={register}
                    error={errors.organizationWebsite}
                    required
                    placeholder="https://example.com"
                  />

                  <Input
                    label="Contact Name"
                    name="contactName"
                    register={register}
                    error={errors.contactName}
                    required
                    placeholder="Enter contact name"
                  />

                  <Input
                    label="Contact Information"
                    name="contactInfo"
                    register={register}
                    error={errors.contactInfo}
                    required
                    placeholder="Email or phone number"
                  />

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

              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="firstName"
                      register={register}
                      error={errors.firstName}
                      required
                      placeholder="Enter first name"
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      register={register}
                      error={errors.lastName}
                      required
                      placeholder="Enter last name"
                    />
                  </div>

                  <Input
                    label="Position"
                    name="position"
                    register={register}
                    error={errors.position}
                    required
                    placeholder="Enter your position"
                  />

                  <Input
                    label="Years of Experience"
                    name="experience"
                    register={register}
                    error={errors.experience}
                    required
                    placeholder="Enter years of experience"
                  />

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

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!isDirty || !isValid || loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !isDirty || !isValid || loading
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600'
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