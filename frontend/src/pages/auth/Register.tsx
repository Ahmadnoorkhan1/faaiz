import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import CardLayout from '../../layouts/CardLayout';
import Input from '../../components/form/Input';
import toast from 'react-hot-toast';

// Validation schema
const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

// Role options
type Role = 'CLIENT' | 'CONSULTANT';

const Register: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      
      // Check if a role has been selected
      if (!selectedRole) {
        toast.error('Please select a role');
        setLoading(false);
        return;
      }
      
      await registerUser(data.name, data.email, data.password);
      
      // After successful registration, redirect to the appropriate onboarding path
      toast.success('Registration successful! Redirecting to onboarding...');
      
      setTimeout(() => {
        if (selectedRole === 'CLIENT') {
          navigate('/onboard/client');
        } else {
          navigate('/onboard/consultant');
        }
      }, 1500);
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#00204E] py-12">
      <div className="relative overflow-hidden">
        {/* Background with circular gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] rounded-full border border-[#0078D4]/10 top-[10%] left-[-50%]"></div>
          <div className="absolute w-[150%] h-[150%] rounded-full border border-[#0078D4]/20 top-[20%] left-[-25%]"></div>
          <div className="absolute w-[100%] h-[100%] rounded-full border border-[#0078D4]/30 top-[30%] left-[0%]"></div>
        </div>
        
        <div className="relative z-10">
          <CardLayout title="Create your account">
            {/* Role selection */}
            <div className="mb-6">
              <p className="text-neutral-700 mb-3">I am a:</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRole('CLIENT')}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedRole === 'CLIENT'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <h4 className="font-medium text-neutral-900">Client</h4>
                  <p className="text-sm text-neutral-500">
                    I'm looking for GRC services
                  </p>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedRole('CONSULTANT')}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedRole === 'CONSULTANT'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  <h4 className="font-medium text-neutral-900">Consultant</h4>
                  <p className="text-sm text-neutral-500">
                    I provide GRC services
                  </p>
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Full Name"
                name="name"
                register={register}
                error={errors.name}
                required
                placeholder="Your full name"
              />
              
              <Input
                label="Email"
                name="email"
                type="email"
                register={register}
                error={errors.email}
                required
                placeholder="name@example.com"
              />
              
              <Input
                label="Password"
                name="password"
                type="password"
                register={register}
                error={errors.password}
                required
                placeholder="Create a password"
              />
              
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                register={register}
                error={errors.confirmPassword}
                required
                placeholder="Confirm your password"
              />
              
              <div className="mt-2 text-xs text-neutral-600">
                <p>Password must:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Be at least 8 characters long</li>
                  <li>Contain at least one lowercase letter</li>
                  <li>Contain at least one uppercase letter</li>
                  <li>Contain at least one number</li>
                </ul>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading || !selectedRole}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black ${
                    loading || !selectedRole
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </div>
              
              <div className="text-center mt-4">
                <span className="text-neutral-500 text-sm">
                  Already have an account?{' '}
                </span>
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary-500 hover:text-primary-600"
                >
                  Log in
                </Link>
              </div>
            </form>
          </CardLayout>
        </div>
      </div>
    </div>
  );
};

export default Register; 