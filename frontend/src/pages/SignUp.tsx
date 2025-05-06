import React from 'react';
import SolutionsSection from '../components/SolutionsSection';

const SignUp: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#001538] py-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-extrabold text-[#0078D4] mb-4">Sign Up</h1>
        <p className="text-white/70 text-lg">Choose your path to get started with GRCDepartment. Whether you are a client or a consultant, we have a tailored onboarding experience for you.</p>
      </div>
      <SolutionsSection />
    </div>
  );
};

export default SignUp; 