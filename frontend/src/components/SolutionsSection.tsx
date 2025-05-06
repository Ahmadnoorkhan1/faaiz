import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Solution {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  actionText: string;
}

const solutions: Solution[] = [
  {
    title: 'Client Onboarding',
    description: 'Join as a client and access our comprehensive GRC services tailored to your needs.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#0078D4]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    path: '/onboard/client',
    actionText: 'Get started'
  },
  {
    title: 'Consultant Onboarding',
    description: 'Join our network of GRC professionals and offer your expertise to clients.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#0078D4]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
      </svg>
    ),
    path: '/onboard/consultant',
    actionText: 'Join now'
  },
  {
    title: 'GRC Resources',
    description: 'Access our library of resources, templates, and best practices for governance and compliance.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#0078D4]">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    path: '/resources',
    actionText: 'Browse resources'
  }
];

const SolutionsSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div id="solutions" className="bg-[#001538] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-semibold text-white mb-8 text-center">Our Solutions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, index) => (
            <div 
              key={index}
              onClick={() => navigate(solution.path)}
              className="bg-[#00204E] border border-[#003175] rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary-400 group"
            >
              <div className="text-primary-500 mb-4">
                {solution.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300">
                {solution.title}
              </h3>
              <p className="text-white/70 mb-4">{solution.description}</p>
              <div className="text-[#0078D4] group-hover:translate-x-1 transition-transform">
                {solution.actionText} →
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SolutionsSection; 