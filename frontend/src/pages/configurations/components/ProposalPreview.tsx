import React from 'react';

interface ProposalPreviewProps {
  serviceName: string;
  clientName: string;
  organizationName: string;
  approachPhases: {id: number, phase: string, deliverables: string}[];
  timeline: {id: number, phase: string, description: string}[];
  deliverables: {id: number, title: string, description: string}[];
}

const ProposalPreview: React.FC<ProposalPreviewProps> = ({
  serviceName,
  clientName,
  organizationName,
  approachPhases,
  timeline,
  deliverables
}) => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white shadow-lg rounded-lg text-gray-800">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-center mb-6 overflow-wrap">
        {serviceName.replace(/_/g, ' ') || "Your Service"}
      </h1>

      {/* Cover Letter */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Cover Letter</h2>
        <div className="whitespace-pre-line">
          <p>
            To
            <br />
            {clientName}
            <br />
            February 21, 2025
          </p>

          <p className="mt-4 font-semibold">
            Subject: Proposal for {serviceName.replace(/_/g, ' ')}
          </p>

          <p className="mt-4">Dear Sir,</p>

          <p className="mt-2">
            Thank you for providing us this opportunity to conduct <strong>{serviceName.replace(/_/g, ' ')}</strong> for <strong>{organizationName}</strong>. We understand
            the criticality, scope, and magnitude of the effort required to
            conduct the engagement. We believe that GRCDepartment positioning is
            unique to meet your requirements for the following key reasons:
          </p>

          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>
              GRCDepartment is one of the leading business and risk consulting
              firms whose core business is advising clients on risk, governance,
              internal controls, and compliance. Our clients are spread across
              Asia Pacific, Middle East, Africa, and the USA.
            </li>
            <li>
              Building on our proven methodologies honed through extensive
              engagements in Information Security across different service
              sectors, GRCDepartment delivers an in-depth comprehensive
              Vulnerability Assessment & Penetration Testing.
            </li>
            <li>
              We understand information security and risk management –
              GRCDepartment has gained significant experience since its inception
              in 2007 from numerous engagements on Information/Cyber Security,
              Data Privacy, Data Governance, Risk and Compliance across the
              region and globally. Our understanding of your expectations is
              comprehensive, helping us tailor our approach and solutions that
              not only meet <strong>{clientName}'s</strong> specific requirements but also
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
              True independence – GRCDepartment is not performing any external
              audit attestation services, statutory audit work, among others,
              thus allowing us to operate in a conflict-free manner.
            </li>
          </ul>

          <p className="mt-6">
            Yours Faithfully,
            <br />
            Team GRCDepartment
            <br />
          </p>
        </div>
      </section>

      {/* Background of Engagement */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Background of Engagement</h2>
        <p>
          With a strong focus on providing unique and tailored itineraries,{" "}
          {clientName || "the client"} recognizes the importance of protecting the
          sensitive data of their passengers...
          <br />
          <br />
          This engagement marks a significant step toward fortifying their
          cybersecurity infrastructure...
        </p>
      </section>

      {/* Scope */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Scope of Work</h2>
        <ul className="list-disc pl-6">
          <li>Organization Name: {organizationName}</li>
          <li>Department Name: IT</li>
          <li>No of People: 10</li>
          <li>Estimated Timeline: 6 weeks</li>
          <li>New Compliance</li>
        </ul>
      </section>

      {/* Overall Approach (Dynamic Table) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Overall Approach</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">No</th>
              <th className="border px-4 py-2">Phases</th>
              <th className="border px-4 py-2">Deliverables</th>
            </tr>
          </thead>
          <tbody>
            {approachPhases.map((item, index) => (
              <tr key={item.id}>
                <td className="border px-4 py-2">{String(index + 1).padStart(2, '0')}</td>
                <td className="border px-4 py-2">{item.phase}</td>
                <td className="border px-4 py-2">{item.deliverables}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Project Timeline (Dynamic Table) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Project Timeline</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Phase</th>
              <th className="border px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map(item => (
              <tr key={item.id}>
                <td className="border px-4 py-2">{item.phase}</td>
                <td className="border px-4 py-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Project Deliverables (Dynamic Table) */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Project Deliverables</h2>
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Title</th>
              <th className="border px-4 py-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {deliverables.map(item => (
              <tr key={item.id}>
                <td className="border px-4 py-2">{item.title}</td>
                <td className="border px-4 py-2">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Project Assumptions and limitations */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Project Assumptions and limitations
        </h2>
        <p>
          We have detailed below they key expectations and requirements for the project. Should any of the assumptions change, scope and/or timing may be impacted​
        </p>

        <ul className="list-disc pl-6">
          <li>
            GRCDepartment will submit a detailed project plan to {organizationName}; following signing of engagement letter, illustrating the milestones.​
          </li>
          <li>
            {organizationName} will provide us with all relevant available documentation / data requirement in English. ​
          </li>
          <li>
            Key individuals from {organizationName} would be available for detailed discussions and would provide the requested information. Any time delays that are caused by the non-availability of key personnel or the key documents can impact the timelines of the project, and hence cause delays in the agreed-upon timelines. The consolidated list of project stakeholders from {organizationName} for review and discussion of deliverables will be agreed at the start.​
          </li>
          <li>
            GRCDepartment expects {organizationName} to appoint a 'Single Point-of-Contact' (SPOC) as well as a project coordinator. The project team will route all their requests for information, interviews and meetings during execution of the proposed assignment through XYZ SPOC. The SPOC will also be responsible for coordinating and obtaining management responses and comments for information sought and outputs submitted by GRCDepartment. SPOC need to ensure timely availability of senior management time for meetings, executive work sessions and timely availability of data/information, as required.​
          </li>
          <li>
            This engagement does not include the deployment of any hardware/software or assistance to the client in deployment. The engagement does not include assisting the client in finalizing any risk mitigation measure.​
          </li>
        </ul>
      </section>

      {/* About Us */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">About Us</h2>
        <p>
          GRCD is a Governance, Risk and Compliance (GRC) professional services provider, which was established in the Kingdom of Bahrain in 2008.  GRCD offers Information security, Cyber security, business continuity & data privacy GRC services  and solutions through its Management & Risk Advisory (MRA)  and  Knowledge Management (KM) service domains to clients across the globe.​
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