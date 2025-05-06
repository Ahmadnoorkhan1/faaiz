import React from 'react';
import { useNavigate } from 'react-router-dom';

const Services: React.FC = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "Full Management",
      description: "Implement robust GRC frameworks rapidly and effectively with our AI-powered project management and industry-leading expertise. Whether adopting for the first time or enhancing your current strategy, we streamline every step.",
      link: "/services/implementation"
    },
    {
      title: "Expert Augmentation",
      description: "Expand your GRC capabilities instantly with our vetted and experienced professionals:",
      bulletPoints: [
        "Interim compliance officers",
        "Audit specialists",
        "Risk and governance experts",
        "Flexible, scalable teams"
      ],
      link: "/services/augmentation"
    },
    {
      title: "Advisory & Audit",
      description: "Navigate audits confidently. Our comprehensive advisory ensures you remain compliant and prepared, minimizing risk exposure through proactive, AI-enhanced risk monitoring and real-time guidance.",
      link: "/services/advisory"
    },
    {
      title: "Industry-Experienced Professionals",
      description: "Transform your compliance activities with cutting-edge automation strategies. Our specialists help select, implement, and optimize AI-driven compliance tools and workflows.",
      link: "/services/automation"
    }
  ];

  return (
    <div className="min-h-screen bg-[#001538] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-center text-[#0078D4] mb-12">
          GRC Implementation
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">
                {service.title}
              </h3>
              <div className="text-white/70 mb-6">
                <p className="mb-4">{service.description}</p>
                {service.bulletPoints && (
                  <ul className="list-disc pl-5 space-y-2">
                    {service.bulletPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                onClick={() => navigate(service.link)}
                className="text-[#0078D4] hover:text-[#106EBE] font-medium"
              >
                Learn Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services; 