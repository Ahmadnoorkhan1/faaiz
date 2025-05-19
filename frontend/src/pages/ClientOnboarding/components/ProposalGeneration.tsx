import React from "react";

interface ProposalPreviewProps {
  name: string;
  organization: string;
  requestedServices: string;
}

import '../../../index.css'
import chart from '../../../assets/chart.png'
const ProposalPreview: React.FC<ProposalPreviewProps> = ({name,organization,requestedServices}) => {
  
  // Watching the fields you need

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 bg-white shadow-lg rounded-lg text-gray-800">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-center mb-6 overflow-wrap">
        {requestedServices.replace(/_/g, ' ') || "Your Service"}
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
            Subject: Proposal for {requestedServices.replace(/_/g, ' ')}
          </p>

          <p className="mt-4">Dear Sir,</p>

          <p className="mt-2">
            Thank you for providing us this opportunity to conduct <strong>{requestedServices.replace(/_/g, ' ')}</strong>  for <strong>{ organization }</strong>. We understand
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
      {/* CLIENT INFOFRMARINO FROM ONBOARDING AND SCOPING */}
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
        <h2 className="text-xl font-semibold mb-2">Scope of Work</h2>
        <ul className="list-disc pl-6">
          <li>Organization Name: {organization}</li>
          <li>Department Name : {' IT'}</li>
          <li>No of People : { 10}</li>
          <li>Estimated Timeline : {'6 weeks'}</li>
          {/* <li>{'YES'? 'New Compliance' : 'Revission of Compliance'}</li> */}
          <li>New Compliance</li>
        </ul>
      </section>

      {/* Pre-requisites */}
      {/* <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Pre-requisites</h2>
        <ul className="list-disc pl-6">
          <li>Access to {name || "client"} infrastructure</li>
          <li>Technical contact from {name || "client"}</li>
          <li>Documentation and compliance details</li>
        </ul>
      </section> */}

      {/* Overall Approach (Table) */}

      {/* OVER ALL APPROACH DYNAMIC TABLE */}
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
            <tr>
              <td className="border px-4 py-2">01</td>
              <td className="border px-4 py-2">Kick Off</td>
              <td className="border px-4 py-2">Implementation methodology, Project point of contact, List of Deliverables, Information requisition, Draft project plan​</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">02</td>
              <td className="border px-4 py-2">Info Acquisition</td>
              <td className="border px-4 py-2">IT infrastructure Details, Existing policies and procedures
Previous risk assessment or audit reports
</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">03</td>
              <td className="border px-4 py-2">Design the ISMS
              </td>
              <td className="border px-4 py-2">Establish the context, Scope and Objective, Needs  & Expectations, Current practices
Security organization, Management commitment.

</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">04</td>
              <td className="border px-4 py-2">Gap Analysis</td>
              <td className="border px-4 py-2">Gap Analysis report. Road map to compliance
              </td>
            </tr>
            <tr>
              <td className="border px-4 py-2">05</td>
              <td className="border px-4 py-2">Design and Develop</td>
              <td className="border px-4 py-2">Mandatory ISMS documentation
Policies, Procedures, Asset register, Plans  Baselines, Guidelines

</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">06</td>
              <td className="border px-4 py-2">Risk Assessment</td>
              <td className="border px-4 py-2">Comprehensive Risk Assessment on the identified critical Information assets 
Risk Assessment & Treatment plan

</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">07</td>
              <td className="border px-4 py-2">Performance</td>
              <td className="border px-4 py-2">Information security metrics development
Internal audit Program, Internal audit
Management review
</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">08</td>
              <td className="border px-4 py-2">Action Plan</td>
              <td className="border px-4 py-2">ISMS compliance program
Pre-certification audit preparation
External Audit support
</td>
            </tr>
             {/* Add more rows dynamically */}
          </tbody>
        </table>
      </section>

      {/* Project Timeline */}
      {/* PROJECT TIMELINE DYNAMIC TABLE */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Project Timeline
        </h2>
        {/* <p>Below is a summary of the key scoping activities:</p> */}
        {/* PHASE */}
        <table>
          <thead>
            <tr>
              <th>Phase</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>D1</td>
              <td>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Project Deliverables */}
      {/* PROJECT Deliverables DYNAMIC TABLE */}
      

      {/* Project Assumptions and limitations */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          Project Assumptions and limitations
        </h2>
        <p>
          We have detailed below they key expectations and requirements for the project. Should any of the assumptions change, scope and/or timing may be impacted​
        </p>

        <ul className="list-disc pl-6">
          {/* List */}
          ​
        <li>
          GRCDepartment will submit a detailed project plan to {organization}; following signing of engagement letter, illustrating the milestones.​
        </li>
        <li>
          {organization} will provide us with all relevant available documentation / data requirement in English. ​
        </li>
        <li>
          Key individuals from {organization} would be available for detailed discussions and would provide the requested information. Any time delays that are caused by the non-availability of key personnel or the key documents can impact the timelines of the project, and hence cause delays in the agreed-upon timelines. The consolidated list of project stakeholders from {organization} for review and discussion of deliverables will be agreed at the start.​
        </li>

        <li>
          GRCDepartment expects {organization} to appoint a ‘Single Point-of-Contact’ (SPOC) as well as a project coordinator. The project team will route all their requests for information, interviews and meetings during execution of the proposed assignment through XYZ SPOC. The SPOC will also be responsible for coordinating and obtaining management responses and comments for information sought and outputs submitted by GRCDepartment. SPOC need to ensure timely availability of senior management time for meetings, executive work sessions and timely availability of data/information, as required.​
        </li>
        <li>
          This engagement does not include the deployment of any hardware/software or assistance to the client in deployment. The engagement does not include assisting the client in finalizing any risk mitigation measure.​
        </li>
        <li>
          This proposal will be valid for a period of 60 days from the date of submission.​
        </li>

        <li>
          Project work will be carried out Online.​
        </li>
        <li>
          Activities like preparation of various documents and deliverables will be carried out at GRCDepartment' s offices to enable access and reference to the GRCDepartment materials and knowledge base​
        </li>
        </ul>

        <ul>
          <li>
            The timeline has been proposed inline with the scope. Any proposed changes to the agreed scope must be submitted in writing to GRCDepartment in writing. The changes will be evaluated in terms of their potential impact on the project timeline, deliverables, pricing and the agreed changes shall be signed by the contracting parties.​
          </li>
          <li>
            The scope does not include implementation of proposed recommendations. Also, any impact due to changes in the regulatory environment will be mutually agreed and any amendments to project timeline, deliverables and pricing shall be agreed accordingly.​
          </li>
          <li>
            The work performed by GRCDepartment is purely recommendatory in nature and the services performed under this proposal do not constitute a management function. {organization} is responsible for evaluating and determining which of the recommendations made by us should be implemented. ​
          </li>
          <li>
            Client would provide written feedback within five (5) working days of the submission of any deliverable. In case no feedback is obtained within this period, Client and GRCDepartment will consider it as a deemed acceptance. The project if awarded shall be complete and not partial. The scope of work and deliverables mentioned in this proposal are ONLY for Client.​
          </li>
          ​<li>
            {organization} will make available, on a timely basis, management decisions, approvals acceptances and other such information and assistance desired or required by the engagement team to perform its obligations.​
          </li>
          <li>
            The scope of this proposal specifically excludes assurance of any nature.​
          </li>
          <li>
            Any delay in provision of information by {organization} or non-availability of {organization} personnel will be notified to SPOC. These delays will not be delays due to GRCDepartment. Any such delays, not attributed to GRCDepartment, causes increase in our effort on the project, will be notified to {organization} and appropriate additional fee to compensate for this shall be determined jointly by {organization} and GRCDepartment.​
          </li>
          <li>
            This engagement does not include deployment of any hardware/software or assistance to the Client in deployment. The engagement does not include assisting {organization} in implementing any risk mitigation measure.​
          </li>
          <li>
            The services does not include the provision of legal advice. We make no representations regarding questions of legal interpretation. {organization} should consult with its attorneys with respect to any legal matters or items that require legal interpretation, under central, state or other type of law or regulation.​
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
