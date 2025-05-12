import React from "react";
import { useFormContext } from "react-hook-form";

const ProposalPreview: React.FC = () => {
  const { watch } = useFormContext();

  // Watching the fields you need
  const requestedServices = watch("requestedServices");
  const name = watch("name");
  const organization = watch("organization");

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white shadow-lg rounded-lg text-gray-800">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-center mb-6">
        {requestedServices[0] || "Your Service"}
      </h1>

      {/* Cover Letter */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cover Letter</h2>
        <div className="whitespace-pre-line">
          <p>
            To
            <br />
            { name }
            <br />
            February 21, 2025
          </p>

          <p className="mt-4 font-semibold">
            Subject: Proposal for {requestedServices[0]}
          </p>

          <p className="mt-4">Dear Sir,</p>

          <p className="mt-2">
            Thank you for providing us this opportunity to conduct Vulnerability
            Assessment, Penetration Testing, Configuration Review and Cyber
            Security Monitoring services for <strong>{ organization }</strong>. We understand
            the criticality, scope, and magnitude of the effort required to
            conduct the engagement. We believe that Secureitlab's positioning is
            unique to meet your requirements for the following key reasons:
          </p>

          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              Secureitlab is one of the leading business and risk consulting
              firms whose core business is advising clients on risk, governance,
              internal controls, and compliance. Our clients are spread across
              Asia Pacific, Middle East, Africa, and the USA.
            </li>
            <li>
              Building on our proven methodologies honed through extensive
              engagements in Information Security across different service
              sectors, SecureITLab delivers an in-depth comprehensive
              Vulnerability Assessment & Penetration Testing.
            </li>
            <li>
              We understand information security and risk management –
              Secureitlab has gained significant experience since its inception
              in 2007 from numerous engagements on Information/Cyber Security,
              Data Privacy, Data Governance, Risk and Compliance across the
              region and globally. Our understanding of your expectations is
              comprehensive, helping us tailor our approach and solutions that
              not only meet <strong>{name}'s</strong> specific requirements but also
              ensure efficient and timely delivery while providing substantial
              value to the stakeholder teams.
            </li>
            <li>
              We have an in-depth understanding of the industry. The same is
              evident from the various services we have been providing to
              numerous banks, exchange houses, SAAS companies, among others in
              the region. We are providing our relevant credentials as part of
              this proposal.
            </li>
            <li>
              We have established proven methodologies that are derived from our
              many years of providing holistic advisory solutions to financial
              services clients across the region and therefore stand in good
              stead delivering the services seamlessly.
            </li>
            <li>
              True independence – Secureitlab is not performing any external
              audit attestation services, statutory audit work, among others,
              thus allowing us to operate in a conflict-free manner.
            </li>
          </ul>

          <p className="mt-6">
            Yours Faithfully,
            <br />
            Ashish Sharma
            <br />
            Founder / Partner
          </p>
        </div>
      </section>

      {/* Background of Engagement */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Background of Engagement</h2>
        <p>
          With a strong focus on providing unique and tailored itineraries,{" "}
          {name || "the client"} recognizes the importance of protecting the
          sensitive data of their passengers...
          <br />
          <br />
          This engagement marks a significant step toward fortifying their
          cybersecurity infrastructure...
        </p>
      </section>

      {/* Scope */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Statement of Work (SOW)</h2>
        <ul className="list-disc pl-6">
          <li>Evaluate current network infrastructure</li>
          <li>Identify and mitigate vulnerabilities</li>
          <li>Perform cybersecurity assessments</li>
          <li>Etc...</li>
        </ul>
      </section>

      {/* Pre-requisites */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Pre-requisites</h2>
        <ul className="list-disc pl-6">
          <li>Access to {name || "client"} infrastructure</li>
          <li>Technical contact from {name || "client"}</li>
          <li>Documentation and compliance details</li>
        </ul>
      </section>

      {/* Overall Approach (Table) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Overall Approach</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Phase</th>
              <th className="border px-4 py-2">Activities</th>
              <th className="border px-4 py-2">Deliverables</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Phase 1</td>
              <td className="border px-4 py-2">Reconnaissance & Planning</td>
              <td className="border px-4 py-2">Initial Assessment Report</td>
            </tr>
            {/* Add more rows dynamically */}
          </tbody>
        </table>
      </section>

      {/* Initial Scoping & Recon (Charts) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Initial Scoping & Reconnaissance
        </h2>
        <p>Below is a summary of the key scoping activities:</p>
        <div className="mt-4">
          <img
            src="/path/to/chart.png"
            alt="Scoping Chart"
            className="w-full max-w-md mx-auto"
          />
        </div>
      </section>

      {/* Asset Discovery and Mapping */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Asset Discovery & Mapping
        </h2>
        <p>
          Our team will identify and map all critical assets relevant to{" "}
          {name || "the client"}. These include:
        </p>
        <ul className="list-disc pl-6">
          <li>Onboard IT Systems</li>
          <li>Fleet Communication Networks</li>
          <li>Customer-facing applications</li>
        </ul>
      </section>

      {/* About Us */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">About Us</h2>
        <p>
          SecureITLab, established in 2008 and headquartered in Bahrain,
          specializes in delivering tailored cybersecurity solutions...
        </p>
      </section>

      {/* Why Us */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Why Us</h2>
        <p>
          We combine deep domain expertise with hands-on experience across
          critical infrastructure sectors. Our proven methodology, certified
          team, and client-first philosophy make us your trusted cybersecurity
          partner.
        </p>
      </section>
    </div>
  );
};

export default ProposalPreview;
