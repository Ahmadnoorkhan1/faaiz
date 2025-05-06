import React from 'react';

const openRoles = [
  {
    title: 'GRC Consultant',
    responsibilities: [
      'Implement GRC frameworks for clients',
      'Conduct gap assessments and audits',
      'Provide strategic guidance across risk, compliance, and governance functions',
    ],
  },
  {
    title: 'Compliance Analyst',
    responsibilities: [
      'Monitor and evaluate regulatory changes',
      'Assist in maintaining compliance documentation',
      'Support internal audits and data analysis',
    ],
  },
  {
    title: 'Risk Manager',
    responsibilities: [
      'Conduct enterprise-wide risk assessments',
      'Develop mitigation strategies',
      'Coordinate business continuity plans',
    ],
  },
  {
    title: 'Internal Auditor',
    responsibilities: [
      'Plan and perform audits of key business processes',
      'Identify control weaknesses and recommend improvements',
      'Ensure audit trails are complete and compliant',
    ],
  },
  {
    title: 'GRC Tool Specialist',
    responsibilities: [
      'Customize and implement GRC platforms',
      'Support integration and automation of compliance processes',
      'Provide user training and support',
    ],
  },
  {
    title: 'AI Integration Engineer (Compliance Focus)',
    responsibilities: [
      'Design and develop AI-driven automation for GRC use cases',
      'Collaborate with consultants to create smart workflows',
      'Continuously optimize performance of AI systems',
    ],
  },
  {
    title: 'Project Manager (GRC Programs)',
    responsibilities: [
      'Lead GRC implementation projects end-to-end',
      'Coordinate with cross-functional teams and clients',
      'Manage delivery timelines and quality assurance',
    ],
  },
];

const internRoles = [
  {
    title: 'GRC Intern',
    description: 'Training in frameworks like ISO 27001, NIST, SOC 2',
  },
  {
    title: 'Cybersecurity Compliance Intern',
    description: '',
  },
  {
    title: 'Data Privacy Intern',
    description: 'Exposure to GDPR, PDPL, HIPAA',
  },
  {
    title: 'Audit Support Intern',
    description: '',
  },
  {
    title: 'GRC Research Assistant',
    description: '',
  },
];

const internGains = [
  'Hands-on experience with real clients',
  'Mentorship from industry experts',
  'Certification support and learning modules',
];

const WorkWithUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#001538] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-4xl font-extrabold text-[#0078D4] mb-2">Work With Us</h1>
        <h2 className="text-2xl font-bold text-white mb-8">Join the GRCDepartment Team</h2>
        <p className="text-white/70 mb-12">We're always on the lookout for passionate, driven professionals and interns ready to revolutionize the future of GRC.</p>

        {/* Open Roles */}
        <div className="bg-white/5 rounded-xl p-8 mb-16 border border-white/10">
          <h3 className="text-2xl font-bold text-[#0078D4] mb-2">Current Open Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {openRoles.map((role, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow border border-white/20 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{role.title}</h4>
                  <ul className="list-disc list-inside text-gray-700 text-sm mb-4">
                    {role.responsibilities.map((resp, i) => (
                      <li key={i}>{resp}</li>
                    ))}
                  </ul>
                </div>
                <a href="#apply" className="mt-auto inline-block bg-[#0078D4] text-white font-semibold rounded px-4 py-2 hover:bg-[#106EBE] transition">Apply Now</a>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <a href="#apply" className="text-[#0078D4] font-semibold hover:underline">Submit Your Application →</a>
          </div>
        </div>

        {/* Internship Opportunities */}
        <div className="bg-white/5 rounded-xl p-8 border border-white/10">
          <h3 className="text-2xl font-bold text-[#0078D4] mb-2">Internship Opportunities</h3>
          <p className="text-white/70 mb-6">We offer structured internship programs for recent graduates and students passionate about compliance, cybersecurity, risk management, and enterprise governance.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {internRoles.map((role, idx) => (
              <div key={idx} className="bg-white rounded-lg p-6 shadow border border-white/20 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{role.title}</h4>
                  {role.description && <p className="text-gray-700 text-sm mb-2">{role.description}</p>}
                </div>
                <a href="#apply-intern" className="mt-auto inline-block bg-[#0078D4] text-white font-semibold rounded px-4 py-2 hover:bg-[#106EBE] transition">Start Now</a>
              </div>
            ))}
          </div>
          <div className="mb-6">
            <h4 className="text-lg font-bold text-white mb-2">What You'll Gain:</h4>
            <ul className="list-disc list-inside text-white/80">
              {internGains.map((gain, i) => (
                <li key={i}>{gain}</li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end">
            <a href="#apply-intern" className="text-[#0078D4] font-semibold hover:underline">Start Your GRC Journey →</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkWithUs; 