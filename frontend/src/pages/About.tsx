import React from 'react';

const About: React.FC = () => {
  const differentiators = [
    {
      title: 'AI-driven project management',
      icon: (
        <svg className="w-12 h-12 text-[#0078D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      title: 'Highly flexible staffing models',
      icon: (
        <svg className="w-12 h-12 text-[#0078D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Comprehensive compliance lifecycle management',
      icon: (
        <svg className="w-12 h-12 text-[#0078D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Deep, cross-industry expertise',
      icon: (
        <svg className="w-12 h-12 text-[#0078D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#001538]">
      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-[#0078D4] sm:text-5xl md:text-6xl">
              About Us
            </h1>
          </div>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#0078D4] sm:text-4xl">
              Our Mission
            </h2>
            <p className="mt-4 text-xl text-white/70">
              To simplify and accelerate GRC maturity for every organization through cutting-edge AI technology combined with expert human insight.
            </p>
          </div>
        </div>
      </div>

      {/* Who We Are Section */}
      <div className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#0078D4] sm:text-4xl">
              Who We Are
            </h2>
            <p className="mt-4 text-xl text-white/70">
              We are an innovative team of GRC experts and technology leaders dedicated to transforming compliance through AI-driven solutions and deep industry experience. Our platform provides both operational and strategic advantages.
            </p>
          </div>
        </div>
      </div>

      {/* What Makes Us Different Section */}
      <div className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-[#0078D4] sm:text-4xl">
              What Makes Us Different
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {differentiators.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {item.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust & Transparency Section */}
      <div className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-[#0078D4] sm:text-4xl">
              Trust & Transparency
            </h2>
            <p className="mt-4 text-xl text-white/70">
              Committed to transparency and client success, we uphold strict standards through clear communication, precise SLA adherence, and proactive compliance monitoring using world-class Azure infrastructure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 