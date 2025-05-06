import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../utils/AuthContext';
import CardLayout from '../layouts/CardLayout';
import Input from '../components/FormElements/Input';

// Validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
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
          <CardLayout title="Log in to your account">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Email"
                name="email"
                type="email"
                register={register}
                error={errors.email}
                required
                placeholder="name@example.com"
              />
              
              <div>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  register={register}
                  error={errors.password}
                  required
                  placeholder="Enter your password"
                />
                <div className="mt-1 text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm font-medium text-primary-500 hover:text-primary-600"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black ${
                    loading
                      ? 'bg-neutral-400 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  {loading ? 'Logging in...' : 'Log in'}
                </button>
              </div>
              
              
            </form>
          </CardLayout>
        </div>
      </div>
    </div>
  );
};

export default Login; 