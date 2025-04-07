import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#00204E]">
      {/* Navbar */}
      <nav className="bg-[#00204E] border-b border-[#003175]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <svg width="24" height="24" viewBox="0 0 24 24" className="mr-2">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022" />
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
                </svg>
                <span className="text-xl font-semibold text-white">GRC Platform</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <a href="/" className="text-white hover:text-primary-200">Home</a>
              <a href="#solutions" className="text-white hover:text-primary-200">Solutions</a>
              <button className="text-white">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative flex-grow flex flex-col items-center justify-center text-center px-4 py-12 md:py-24 overflow-hidden">
        {/* Background with circular gradient */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute w-[200%] h-[200%] rounded-full border border-[#0078D4]/10 top-[10%] left-[-50%]"></div>
          <div className="absolute w-[150%] h-[150%] rounded-full border border-[#0078D4]/20 top-[20%] left-[-25%]"></div>
          <div className="absolute w-[100%] h-[100%] rounded-full border border-[#0078D4]/30 top-[30%] left-[0%]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Build the future<br />with GRC Platform
          </h1>
          <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
            Innovate with powerful governance, risk, and compliance solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => navigate('/onboard/client')}
              className="px-8 py-3 bg-[#0078D4] text-white font-semibold rounded-md hover:bg-[#106EBE] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-75 transition-colors"
            >
              Get started
            </button>
            <button
              onClick={() => navigate('#learn-more')}
              className="px-8 py-3 bg-transparent text-white border border-white/30 font-semibold rounded-md hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-25 transition-colors"
            >
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* Solution Tiles */}
      <div id="solutions" className="bg-[#001538] py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold text-white mb-8 text-center">Our Solutions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Client Tile */}
            <div 
              onClick={() => navigate('/onboard/client')}
              className="bg-[#00204E] border border-[#003175] rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary-400 group"
            >
              <div className="text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#0078D4]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300">Client Onboarding</h3>
              <p className="text-white/70 mb-4">Join as a client and access our comprehensive GRC services tailored to your needs.</p>
              <div className="text-[#0078D4] group-hover:translate-x-1 transition-transform">
                Get started →
              </div>
            </div>

            {/* Consultant Tile */}
            <div 
              onClick={() => navigate('/onboard/consultant')}
              className="bg-[#00204E] border border-[#003175] rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary-400 group"
            >
              <div className="text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#0078D4]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300">Consultant Onboarding</h3>
              <p className="text-white/70 mb-4">Join our network of GRC professionals and offer your expertise to clients.</p>
              <div className="text-[#0078D4] group-hover:translate-x-1 transition-transform">
                Join now →
              </div>
            </div>

            {/* Resources Tile */}
            <div 
              onClick={() => navigate('/resources')}
              className="bg-[#00204E] border border-[#003175] rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary-400 group"
            >
              <div className="text-primary-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#0078D4]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-300">GRC Resources</h3>
              <p className="text-white/70 mb-4">Access our library of resources, templates, and best practices for governance and compliance.</p>
              <div className="text-[#0078D4] group-hover:translate-x-1 transition-transform">
                Browse resources →
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#00204E] py-8 border-t border-[#003175]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white/50 text-sm">© 2023 GRC Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 