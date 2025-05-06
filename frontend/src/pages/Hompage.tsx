import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  
  const testimonials = [
    {
      quote: "GRCDepartment's AI-driven approach significantly accelerated our compliance timeline.",
      author: "CFO, Financial Services Company"
    },
    {
      quote: "The integration of AI and experienced professionals offered unparalleled compliance accuracy and speed.",
      author: "Head of Compliance, Global SaaS Provider"
    },
    {
      quote: "Their flexible staffing model has transformed our approach to regulatory readiness.",
      author: "CIO, Healthcare Network"
    }
  ];

  
  return (
    <div className="min-h-screen bg-[#001538]">
      {/* Hero Section */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
                <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Simplify Your GRC Journey</span>
              <span className="block text-[#0078D4]">with AI-Powered Compliance</span>
                </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-white/70 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Comprehensive, scalable Governance, Risk & Compliance solutions—leveraging AI and Human Intelligence for unmatched precision and speed.
                </p>
            <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                  <div className="rounded-md shadow">
                <button onClick={() => navigate('/demo')} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0078D4] hover:bg-[#106EBE] md:py-4 md:text-lg md:px-10">
                  Schedule a Demo
                    </button>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                <button onClick={() => navigate('/services')} className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#0078D4] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10">
                  Explore Services
                    </button>
                  </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#0078D4] sm:text-4xl">
             Overview
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-xl text-white/70">
              GRCDepartment is the next-generation SaaS platform designed to accelerate GRC maturity. Using world-leading Azure infrastructure and AI-enhanced project management, we deliver integrated compliance solutions, industry expertise, and seamless operational support for organizations at every GRC maturity level.
            </p>
          </div>
        </div>
      </div>

      {/* Core Benefits Section */}
      <div className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-extrabold text-[#0078D4] sm:text-4xl mb-10">
              Core Benefits
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <div className="flex items-center mb-4">
                  <svg className="h-6 w-6 text-[#0078D4] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-white/90 text-lg">Complete GRC lifecycle management</p>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <div className="flex items-center mb-4">
                  <svg className="h-6 w-6 text-[#0078D4] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-white/90 text-lg">AI-driven insights and human expertise</p>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <div className="flex items-center mb-4">
                  <svg className="h-6 w-6 text-[#0078D4] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-white/90 text-lg">Flexible team models (short-term, long-term, project-based)</p>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <div className="flex items-center mb-4">
                  <svg className="h-6 w-6 text-[#0078D4] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-white/90 text-lg">Tool-agnostic GRC professionals</p>
                </div>
              </div>

              <div className="bg-white/5 p-6 rounded-lg border border-white/10">
                <div className="flex items-center mb-4">
                  <svg className="h-6 w-6 text-[#0078D4] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-white/90 text-lg">Robust Azure cloud infrastructure</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/learn-more')} 
              className="text-[#0078D4] hover:text-[#106EBE] font-medium text-lg mt-8"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Industries Served Section */}
      <div className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-[#0078D4] sm:text-4xl mb-10">
            Industries Served
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-8 justify-items-center">
            {/* Finance */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
                  <path d="M3 9h18" strokeWidth="2"/>
                  <path d="M9 21V9" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Finance</span>
            </div>

            {/* Healthcare */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M12 4v16m8-8H4" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Healthcare</span>
            </div>

            {/* Retail */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M4 7V5a1 1 0 011-1h14a1 1 0 011 1v2" strokeWidth="2"/>
                  <path d="M20 7H4l1 9h14l1-9z" strokeWidth="2"/>
                  <path d="M8 20a1 1 0 100-2 1 1 0 000 2z" strokeWidth="2"/>
                  <path d="M16 20a1 1 0 100-2 1 1 0 000 2z" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Retail</span>
            </div>

            {/* SaaS */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10" strokeWidth="2"/>
                  <path d="M22 12h-4m-4 0h-4m-4 0H2" strokeWidth="2"/>
                  <path d="M12 2v4m0 4v4m0 4v4" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">SaaS</span>
            </div>

            {/* Manufacturing */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M18 8h-2a2 2 0 00-2 2v4M2 8h2a2 2 0 012 2v4" strokeWidth="2"/>
                  <path d="M4 16v-4a2 2 0 012-2h12a2 2 0 012 2v4" strokeWidth="2"/>
                  <path d="M18 20H6a2 2 0 01-2-2v-2h16v2a2 2 0 01-2 2z" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Manufacturing</span>
            </div>

            {/* Technology */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <rect x="4" y="4" width="16" height="12" rx="2" strokeWidth="2"/>
                  <path d="M8 20h8" strokeWidth="2"/>
                  <path d="M12 16v4" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Technology</span>
            </div>

            {/* Government */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M3 21h18M4 18h16M12 3L2 9h20L12 3z" strokeWidth="2"/>
                  <path d="M6 9v9m4-9v9m4-9v9m4-9v9" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Government</span>
            </div>

            {/* Education */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M12 3L2 9l10 6 10-6-10-6z" strokeWidth="2"/>
                  <path d="M2 9v6m20-6v6M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Education</span>
            </div>

            {/* Energy */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Energy</span>
            </div>

            {/* Pharmaceuticals */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M19 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" strokeWidth="2"/>
                  <path d="M9 5V3h6v2M12 8v8M8 12h8" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Pharmaceuticals</span>
            </div>

            {/* Telecommunications */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M12 19V5M5 12h14" strokeWidth="2"/>
                  <path d="M15 9a3 3 0 000 6M18 7a6 6 0 010 10M9 15a3 3 0 010-6M6 17a6 6 0 010-10" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Telecommunications</span>
            </div>

            {/* Construction */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M2 20h20M4 20V8l4-4h8l4 4v12" strokeWidth="2"/>
                  <path d="M12 20v-8m-4 8v-6m8 6v-6" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Construction</span>
            </div>

            {/* Transportation */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M5 17h14M8 17v3H6v-3m10 0v3h2v-3" strokeWidth="2"/>
                  <path d="M3 17V8a5 5 0 015-5h8a5 5 0 015 5v9M3 12h18" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Transportation</span>
            </div>

            {/* Non-Profit */}
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-white">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2"/>
                </svg>
              </div>
              <span className="text-white/70 text-sm">Non-Profit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-center text-[#0078D4] sm:text-4xl mb-10">
            Testimonials
          </h2>
          <div className="grid gap-8 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/5 p-6 rounded-lg border border-white/10">
                <p className="text-white/70 italic mb-4">"{testimonial.quote}"</p>
                <p className="text-[#0078D4] font-medium">— {testimonial.author}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-[#0078D4] sm:text-4xl">
            Start Simplifying Your GRC Today
          </h2>
          <div className="mt-8 flex justify-center space-x-4">
            <button onClick={() => navigate('/demo')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0078D4] hover:bg-[#106EBE]">
              Schedule a Demo
            </button>
            <button onClick={() => navigate('/services')} className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-[#0078D4] bg-white hover:bg-gray-50">
              Explore Services
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 