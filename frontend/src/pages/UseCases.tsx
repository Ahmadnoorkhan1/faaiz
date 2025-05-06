import React from 'react';
import { useNavigate } from 'react-router-dom';

const UseCases: React.FC = () => {
  const navigate = useNavigate();

  const useCases = [
    {
      title: 'Finance',
      description: 'Strengthen compliance across SOX, GDPR, AML, cybersecurity, transaction monitoring, fraud detection, and internal audit automation with advanced AI-driven analytics.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2"/>
          <path d="M3 9h18" strokeWidth="2"/>
          <path d="M9 21V9" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Team-Augpeln',
      description: 'Enhance patient data protection, ensure compliance with HIPAA, GDPR, telehealth governance, medical device regulation, and risk management through integrated AI-powered solutions.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M12 4v16m8-8H4" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Retail',
      description: 'Protect consumer data, manage supply chain risks, comply with PCI DSS, GDPR, privacy regulations, and inventory risk management through AI-enhanced governance.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M4 7V5a1 1 0 011-1h14a1 1 0 011 1v2" strokeWidth="2"/>
          <path d="M20 7H4l1 9h14l1-9z" strokeWidth="2"/>
          <path d="M8 20a1 1 0 100-2 1 1 0 000 2z" strokeWidth="2"/>
          <path d="M16 20a1 1 0 100-2 1 1 0 000 2z" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'SaaS',
      description: 'Achieve rapid SOC 2, ISO 27001, GDPR, CCPA compliance, data residency, and vendor risk management effectively with dynamic, AI-supported compliance solutions.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10" strokeWidth="2"/>
          <path d="M22 12h-4m-4 0h-4m-4 0H2" strokeWidth="2"/>
          <path d="M12 2v4m0 4v4m0 4v4" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Technology',
      description: 'Secure intellectual property, adhere to export regulations, GDPR compliance, manage software lifecycle risks, cybersecurity protocols, and regulatory compliance with expert AI analytics.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <rect x="4" y="4" width="16" height="12" rx="2" strokeWidth="2"/>
          <path d="M8 20h8" strokeWidth="2"/>
          <path d="M12 16v4" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Government',
      description: 'Navigate stringent regulatory requirements, enhance cybersecurity compliance, data protection, public accountability, and governance frameworks seamlessly with AI-enhanced oversight.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M3 21h18M4 18h16M12 3L2 9h20L12 3z" strokeWidth="2"/>
          <path d="M6 9v9m4-9v9m4-9v9m4-9v9" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Education',
      description: 'Ensure student data privacy, regulatory compliance (FERPA, GDPR), cybersecurity, and policy management with integrated AI and expert governance solutions.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M12 3L2 9l10 6 10-6-10-6z" strokeWidth="2"/>
          <path d="M2 9v6m20-6v6M6 12v5c0 1 3 3 6 3s6-2 6-3v-5" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Energy',
      description: 'Mitigate operational risks, regulatory compliance (NERC, environmental regulations), cybersecurity, and supply chain oversight through comprehensive AI-powered solutions.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Pharmaceuticals',
      description: 'Streamline compliance with FDA, EMA, clinical trial governance, quality control, pharmacovigilance, and data integrity with AI-driven compliance management.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M19 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V7a2 2 0 00-2-2z" strokeWidth="2"/>
          <path d="M9 5V3h6v2M12 8v8M8 12h8" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Telecommunications',
      description: 'Secure customer data, comply with telecommunications standards (GDPR, FCC), cybersecurity, network infrastructure risk, and vendor management with proactive AI monitoring.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M12 19V5M5 12h14" strokeWidth="2"/>
          <path d="M15 9a3 3 0 000 6M18 7a6 6 0 010 10M9 15a3 3 0 010-6M6 17a6 6 0 010-10" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Construction',
      description: 'Enhance safety compliance, environmental regulations adherence, risk management, procurement processes, and contractual governance through AI-powered solutions.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M2 20h20M4 20V8l4-4h8l4 4v12" strokeWidth="2"/>
          <path d="M12 20v-8m-4 8v-6m8 6v-6" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Transportation',
      description: 'Ensure regulatory compliance (DOT, FAA), operational safety, cybersecurity, fleet management, and logistical risk management effectively with AI-driven governance.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M5 17h14M8 17v3H6v-3m10 0v3h2v-3" strokeWidth="2"/>
          <path d="M3 17V8a5 5 0 015-5h8a5 5 0 015 5v9M3 12h18" strokeWidth="2"/>
        </svg>
      )
    },
    {
      title: 'Non-Profit',
      description: 'Achieve regulatory adherence, donor data protection, grant management, transparency, and governance efficiency using tailored AI-enhanced compliance solutions.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-12 h-12">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeWidth="2"/>
        </svg>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-[#001538] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#0078D4] sm:text-5xl">
            Use Cases
          </h1>
          <p className="mt-4 text-xl text-white/70">
            Discover how our AI-powered GRC solutions transform compliance across industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              <div className="text-white mb-4">
                {useCase.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#0078D4] mb-3">
                {useCase.title}
              </h3>
              <p className="text-white/70">
                {useCase.description}
              </p>
              <button
                onClick={() => navigate(`/use-cases/${useCase.title.toLowerCase()}`)}
                className="mt-4 text-[#0078D4] hover:text-[#106EBE] font-medium inline-flex items-center"
              >
                Learn More
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UseCases; 