import React, { useState, useEffect, useRef } from 'react';
import { useProfile } from '../../utils/ProfileContext';
import { get, post } from '../../service/apiService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../utils/AuthContext';

// NDA Content Component
export const NDAContent = ({ consultantName, consultantEmail, onClose, onSign }: { 
  consultantName: string;
  consultantEmail: string;
  onClose: () => void;
  onSign: (signatureData: string) => void;
}) => {
  const [signature, setSignature] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [agreementDate, setAgreementDate] = useState(new Date().toISOString().split('T')[0]);

  // Signature pad implementation
  useEffect(() => {
    setAgreementDate(new Date().toISOString().split('T')[0]);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas styling
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    // Clear canvas initially
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    
    // Calculate coordinates precisely
    let clientX, clientY;
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position relative to canvas with proper scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get canvas position
    const rect = canvas.getBoundingClientRect();
    
    // Calculate coordinates precisely
    let clientX, clientY;
    if ('touches' in e) {
      // Touch event
      e.preventDefault(); // Prevent scrolling on touch
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Calculate position relative to canvas with proper scaling
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Save the signature as a data URL
    setSignature(canvas.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  const handleSign = () => {
    if (!signature) {
      toast.error('Please sign the document before submitting');
      return;
    }
    onSign(signature);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-100">Confidentiality Agreement</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 bg-[#242935] p-4 rounded-lg text-gray-300 text-sm h-[30vh] overflow-y-auto">
          <p className="mb-4">This Agreement (hereinafter referred to as this "Agreement") is made with effect from {agreementDate} (the "Effective Date") between Secureitlab Co W.L.L (hereinafter referred to as "SITL") whose principal offices are located at: Unit 23, Building 1431, Road 3624, Area 536, AI Diraz, Kingdom of Bahrain</p>
          
          <p className="mb-4">and</p>
          
          <p className="mb-4">2) The undersigned person: {consultantName} ({consultantEmail})</p>
          
          <p className="mb-2">2.1 member of SITL's staff on definite contracts and internships</p>
          <p className="mb-2">2.2 member of SITL's staff on indefinite contracts</p>
          <p className="mb-4">2.3 member of SITL's staff employed from sub-contractors.</p>
          
          <p className="mb-4">(any of which are hereinafter referred to as the "Employee")</p>
          
          <p className="mb-4">3) The Employee undertakes and confirms that all matters relating to SITL referred to as "SITL") shall be subject to this Agreement.</p>
          
          <p className="mb-4">• The Employee hereby agrees to treat all Proprietary, Highly Confidential, Top-Secret Information defined below as confidential at all times and shall only use such Information solely for the purpose of conducting SITL business at all times.</p>
          
          <p className="mb-4">• For the purpose of this Agreement Proprietary Information shall mean information, whether or not originated by SITL, which is used in SITL business and is:</p>
          
          <p className="mb-2">• Proprietary to, about or created by SITL, and/or</p>
          <p className="mb-2">• Which gives SITL some competitive business advantage or the opportunity of obtaining such an advantage or the disclosure of which could be detrimental to SITL; and/or</p>
          <p className="mb-4">• Designated as Proprietary Information by SITL or from all the relevant circumstances should be reasonably assumed by the Employee to be confidential and proprietary to SITL; and/or</p>
          <p className="mb-4">• Not generally known by people outside SITL.</p>
          
          <p className="mb-4">• Such Proprietary Information includes but is not limited to the following types of information and other information of a similar nature (whether or not reduced to writing or designated as confidential by SITL):</p>
          
          <p className="mb-4 font-medium">• Business Operations</p>
          <p className="mb-4">Internal SITL personnel and financial information, business acquisitions and mergers, strategic partnerships, vendor and/or consultant names and other vendor/consultant information (including vendor characteristics, services and agreements), purchasing and internal cost information, internal services and operational manuals, and the manner and methods of conducting SITL business.; and</p>
          
          <p className="mb-4 font-medium">• Development</p>
          <p className="mb-4">Development plans, presentations and presentation materials, trademarks, Internet and/or home page development plans, price and cost data, price and fees amounts, pricing and billing policies, quoting procedures, marketing techniques and methods of obtaining business, forecasts and forecast assumptions and volumes and future plans and potential strategies of SITL which have been or are being discussed; and</p>
          
          <p className="mb-4 font-medium">• Customers</p>
          <p className="mb-4">Any data and/or information related to the names and/or addresses and/or contact details and customer accounts of SITL customers and/or their representatives, contracts and/or their contents and/or their parties, customer services, data provided by customers and the type, quantity and specifications of products and /or services purchased by clients of SITL.</p>
          
          <p className="mb-4 font-medium">• Computer Software and all Systems and Processes (electronic and manual)</p>
          <p className="mb-4">Computer software, systems and processes of any type or form in any stage of actual or anticipated research and development, including but not limited to programs and program modules, routines and sub-routines, processes, algorithms, design concepts, design specifications (design notes, annotations, documentation, web page designs, web pages, flow charts, coding sheets, and the like), source code, object code and load modules, programming, program patches and system designs; and</p>
          
          <p className="mb-4 font-medium">• Other Proprietary Data and Information</p>
          <p className="mb-4">Data and information relating to the SITL proprietary rights and any information which SITL has received under a condition of confidentiality relating to any public disclosure thereof, including but not limited to the nature of the proprietary rights, production data, technical and engineering data, test data and test results, the status and details of research and development of products and/or services, and information regarding acquiring, protecting enforcing and licensing proprietary rights (including patents, copyrights and trade secrets); and</p>
          
          <p className="mb-4">• For the purpose of this agreement Highly Confidential Information is a sensitive form of information. This information is distributed on a "Need to Know" basis only. Examples include employee personal information, business plans, unpublished financial statements, etc.</p>
          
          <p className="mb-4">• For the purpose of this agreement Top Secret Information is the most sensitive form of information. It is so sensitive that disclosure or usage would have a definite impact on SITL's business and future. Extremely restrictive controls need to be applied (e.g., very limited audience). Examples include strategic plans, investment decisions etc</p>
          
          <p className="mb-4">• The Employee hereby agrees that with regard to such Proprietary Highly Confidential, Top Secret Information the Employee shall not copy, remove, erase, corrupt, destroy, use, disclose, transfer, sell, lease, rent, steal, borrow, lend or cause to become known in any manner whatsoever such Proprietary Information in any manner which is not duly authorized by SITL or in a manner which is outside the Employee recognized authority within SITL, nor shall the Employee solicit, encourage, incite or conspire with others either within or without SITL to cause such actions as listed in this Clause 6 to occur</p>
          
          <p className="mb-4">• The Employee hereby recognizes and agrees that the Proprietary Highly Confidential, Top Secret Information has substantial value and that any unauthorized disclosure would likely cause irreparable damage that could not be fully remedied by monetary damages and that any breach of confidentiality by the Employee shall make the Employee liable to be subjected to both SITL's Disciplinary Code and further additional prosecution by SITL at SITL sole discretion.</p>
          
          <p className="mb-4">• In the event of a breach or a threatened breach of this Agreement by the Employee, the Employee hereby grants SITL the right to obtain injunctive or other equitable relief from a court of competent jurisdiction as a remedy for any such breach or anticipated breach without the necessity of posting a bond in order to prevent actions which are unauthorized and/or in breach of this Agreement and/or unlawful. Any such relief shall be in addition to and not in lieu of any appropriate relief by way of monetary damages. In addition where SITL prevails in any legal dispute hereunder SITL shall be entitled to collect its legal fees and expenses from the Employee</p>
          
          <p className="mb-4">• In the event that the Employee ceases to be employed by SITL for whatever reason the terms of this Agreement shall remain in effect with respect to any Proprietary Information for 7 years from the date of the Employee's termination with SITL.</p>
          
          <p className="mb-4">• This Agreement is the complete and exclusive statement of the mutual understanding of the parties and supersedes and cancels all previous written and oral agreements and communications with respect to the subject matter of this Agreement.</p>
          
          <p className="mb-4">• This Agreement is governed by the laws of Kingdom of Bahrain and India and may only be waived and/or modified in writing by mutual agreement between the parties.</p>
          
          <p className="mb-4">• Where any provision is found to be unenforceable, such provision will be limited or deleted to the minimum extent necessary so that the remaining terms stay in full force and effect.</p>
        </div>

        <div className="mb-6">
          <div className="mb-2 text-gray-300">Sign below:</div>
          <div className="border border-gray-600 rounded bg-white">
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className="w-full cursor-crosshair"
            ></canvas>
          </div>
          <button 
            onClick={clearSignature}
            className="mt-2 px-3 py-1 text-xs bg-gray-700 text-white rounded hover:bg-gray-600"
          >
            Clear Signature
          </button>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSign}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            I Agree & Sign
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const { profileData, userType, loading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showNDAModal, setShowNDAModal] = useState(false);
  const [ndaStatus, setNdaStatus] = useState<{ ndaSigned: boolean, ndaSignatureDate?: string, ndaPdfUrl?: string } | null>(null);
  const [ndaLoading, setNdaLoading] = useState(false);
  const [signingNDA, setSigningNDA] = useState(false);

  const { user} = useAuth();

  // Check NDA status for consultants
  useEffect(() => {
    console.log(signingNDA)
    
    const checkNdaStatus = async () => {
      if (userType === 'consultant' && profileData?.id) {
        setNdaLoading(true);
        try {
          const response = await get<{ data: { ndaSigned: boolean, ndaSignatureDate?: string, ndaPdfUrl?: string } }>(`/api/consultants/${user?.id}/nda-status`);
          setNdaStatus(response.data);
        } catch (error) {
          console.error('Error checking NDA status:', error);
          setNdaStatus({ ndaSigned: false });
        } finally {
          setNdaLoading(false);
        }
      }
    };

    checkNdaStatus();
  }, [userType, profileData]);

  // Handle NDA signing
  const handleSignNDA = async (signatureData: string) => {
    if (!profileData?.id) return;
    
    setSigningNDA(true);
    try {
      const response = await post<{ success: boolean, data: { ndaPdfUrl: string } }>(`/api/consultants/${profileData.id}/sign-nda`, { signatureData });
      toast.success('NDA signed successfully');
      // Update NDA status with PDF URL from response
      setNdaStatus({ 
        ndaSigned: true, 
        ndaSignatureDate: new Date().toISOString(),
        ndaPdfUrl: response.data?.ndaPdfUrl 
      });
      setShowNDAModal(false);
    } catch (error) {
      console.error('Error signing NDA:', error);
      toast.error('Failed to sign NDA. Please try again.');
    } finally {
      setSigningNDA(false);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  if (!profileData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-200">Profile Not Found</h2>
        <p className="text-gray-400 mt-2">Your profile information could not be loaded.</p>
      </div>
    );
  }

  const renderClientProfile = () => (
    <div className="space-y-6">
      <ProfileSection title="Personal Information">
        <ProfileField label="Full Name" value={profileData.fullName} />
        <ProfileField label="Phone Number" value={profileData.phoneNumber} />
        <ProfileField label="Organization" value={profileData.organization} />
        {profileData.additionalContact && (
          <ProfileField label="Additional Contact" value={profileData.additionalContact} />
        )}
      </ProfileSection>

      <ProfileSection title="Services Requested">
        {profileData.requestedServices && profileData.requestedServices.length > 0 ? (
          <ul className="list-disc pl-5 text-gray-300">
            {profileData.requestedServices.map((service:any, index:any) => (
              <li key={index}>{formatServiceType(service)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">No services requested</p>
        )}
        {profileData.otherDetails && (
          <ProfileField label="Other Details" value={profileData.otherDetails} />
        )}
      </ProfileSection>

      <ProfileSection title="Onboarding Status">
        <ProfileField 
          label="Status" 
          value={formatOnboardingStatus(profileData.onboardingStatus)} 
        />
        <ProfileField 
          label="Current Step" 
          value={`Step ${profileData.currentStep}`} 
        />
        {profileData.termsAccepted && (
          <div className="flex items-center text-green-500">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Terms Accepted
          </div>
        )}
      </ProfileSection>
    </div>
  );

  const renderConsultantProfile = () => (
    <div className="space-y-6">
      <ProfileSection title="NDA Status">
        {ndaLoading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
            <span className="text-gray-400">Checking NDA status...</span>
          </div>
        ) : ndaStatus?.ndaSigned ? (
          <div>
            <div className="flex items-center text-green-500">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>NDA Signed</span>
            </div>
            {ndaStatus.ndaSignatureDate && (
              <p className="text-gray-400 text-sm mt-1">
                Signed on {new Date(ndaStatus.ndaSignatureDate).toLocaleDateString()}
              </p>
            )}
            {ndaStatus.ndaPdfUrl && (
              <div className="mt-3">
                <a 
                  href={ndaStatus.ndaPdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  View Signed NDA Document
                </a>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center text-yellow-500 mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>NDA Not Signed</span>
            </div>
            <button
              onClick={() => setShowNDAModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Sign NDA Now
            </button>
            <p className="text-gray-400 text-xs mt-2">
              You must sign the Non-Disclosure Agreement before proceeding with consulting work.
            </p>
          </div>
        )}
      </ProfileSection>

      <ProfileSection title="Personal Information">
        <ProfileField label="First Name" value={profileData.contactFirstName} />
        <ProfileField label="Last Name" value={profileData.contactLastName} />
        <ProfileField label="Email" value={profileData.email} />
        <ProfileField label="Phone" value={profileData.phone} />
        <ProfileField label="Date of Birth" value={formatDate(profileData.dateOfBirth)} />
      </ProfileSection>

      <ProfileSection title="Professional Information">
        <ProfileField label="Organization Website" value={profileData.organizationWebsite} />
        <ProfileField label="Industry" value={profileData.industry} />
        <ProfileField label="Position" value={profileData.position} />
        <ProfileField label="Experience" value={profileData.experience} />
      </ProfileSection>

      <ProfileSection title="Services Offered">
        {profileData.servicesOffered && profileData.servicesOffered.length > 0 ? (
          <ul className="list-disc pl-5 text-gray-300">
            {profileData.servicesOffered.map((service:any, index:any) => (
              <li key={index}>{formatServiceType(service)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 italic">No services specified</p>
        )}
        {profileData.otherDetails && (
          <ProfileField label="Other Details" value={profileData.otherDetails} />
        )}
      </ProfileSection>

      <ProfileSection title="Certifications & Resume">
        {profileData.certifications && profileData.certifications.length > 0 ? (
          <div className='flex flex-col'>
            <div className='text-xs font-medium text-gray-200 pb-2'>Certifications</div>
          <ul className="list-disc pl-5 text-gray-300">
            {profileData.certifications.map((cert:any, index:any) => (
              <div className="mt-2" key={index}>
              <a 
                href={cert} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View Document
              </a>
            </div>
            ))}
          </ul>
          </div>
        ) : (
          <p className="text-gray-400 italic">No certifications uploaded</p>
        )}
        {profileData.cvUrl && (
          <div className='flex flex-col'>
            <div className='text-xs font-medium text-gray-200 pb-2'>CV</div>
            <div className="mt-2">
              <a 
                href={profileData.cvUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400 inline-flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                View Resume
              </a>
            </div>
          </div>
        )}
      </ProfileSection>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-100">My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        {userType === 'client' ? renderClientProfile() : renderConsultantProfile()}
      </div>

      {/* NDA Modal */}
      {showNDAModal && (
        <NDAContent
          consultantName={`${profileData.contactFirstName} ${profileData.contactLastName}`}
          consultantEmail={profileData.email}
          onClose={() => setShowNDAModal(false)}
          onSign={handleSignNDA}
        />
      )}
    </div>
  );
};

// Helper components
const ProfileSection = ({ title, children }:any) => (
  <div>
    <h3 className="text-lg font-medium text-gray-200 mb-4 border-b border-gray-700 pb-2">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
  </div>
);

const ProfileField = ({ label, value }:any) => (
  <div>
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-gray-200">{value || '-'}</p>
  </div>
);

// Helper functions
const formatServiceType = (service:any) => {
  return service.replace(/_/g, ' ').replace(/\b\w/g, (l:any) => l.toUpperCase());
};

const formatOnboardingStatus = (status:any) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l:any) => l.toUpperCase());
};

const formatDate = (dateString:any) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default Profile;