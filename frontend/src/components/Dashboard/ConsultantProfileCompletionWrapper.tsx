import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../utils/AuthContext";
import api from "../../service/apiService";
import { toast } from "react-hot-toast";

interface NDAStatus {
  ndaSigned: boolean;
  ndaSignatureDate?: string;
  ndaPdfUrl?: string;
}

const ConsultantProfileCompletionWrapper: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ndaStatus, setNdaStatus] = useState<NDAStatus>({ ndaSigned: false });
  const [showNdaModal, setShowNdaModal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [agreementDate] = useState(new Date().toISOString().split('T')[0]);
  const [signing, setSigning] = useState(false);

  // Check NDA status on component mount
  useEffect(() => {
    checkNdaStatus();
  }, []);

  // Check if the NDA is signed - using user.id for consistency with Profile page
  const checkNdaStatus = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Use the same endpoint pattern as in Profile.tsx
      const response = await api.get(`/api/consultants/${user.id}/nda-status`);
      
      // Normalize the response structure to match what Profile.tsx expects
      const data = response.data?.data || response.data;
      
      setNdaStatus({
        ndaSigned: data.ndaSigned || false,
        ndaSignatureDate: data.ndaSignatureDate,
        ndaPdfUrl: data.ndaPdfUrl || data.ndaUrl
      });


      console.log(user.role, "===============")
      
      
      // If NDA is not signed, show the signing modal
      if (!data.ndaSigned && user.role === "CONSULTANT" ) {
        setShowNdaModal(true);
      }
    } catch (error: any) {
      console.error('Error checking NDA status:', error);
      toast.error('Failed to check NDA status. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Canvas drawing setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#0078D4';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Clear canvas with white background for better visibility
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
    setIsDrawing(true);
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
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
    
    // Save signature as data URL
    setSignature(canvas.toDataURL('image/png'));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with white background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSignature('');
  };

  // Handle NDA signing - using user.id for consistency with Profile page
  const handleSignNDA = async () => {
    if (!signature) {
      toast.error('Please draw your signature before submitting');
      return;
    }

    if (!user?.id) {
      toast.error('Your profile information is not available');
      return;
    }

    setSigning(true);
    try {
      // Use the same endpoint pattern as in Profile.tsx
      const response = await api.post(`/api/consultants/${user.id}/sign-nda`, { 
        signatureData: signature 
      });
      
      // Handle success, normalizing the response to be consistent
      const data = response.data?.data || response.data;
      
      toast.success('NDA signed successfully');
      setNdaStatus({ 
        ndaSigned: true, 
        ndaSignatureDate: new Date().toISOString(),
        ndaPdfUrl: data?.ndaPdfUrl || data?.ndaUrl 
      });
      setShowNdaModal(false);
    } catch (error: any) {
      console.error('Error signing NDA:', error);
      toast.error(error.message || 'Failed to sign NDA. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  // If loading, show a spinner
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking account status...</p>
        </div>
      </div>
    );
  }

  // If NDA is signed or modal is not showing, don't render anything
  if (ndaStatus.ndaSigned || !showNdaModal) {
    return null;
  }

  // NDA signing modal
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center overflow-y-auto">
      <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-2xl m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-200">
            Non-Disclosure Agreement Required
          </h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-300">
            Before proceeding to the dashboard, you must sign our Non-Disclosure Agreement (NDA).
          </p>

          <div className="bg-[#242935] p-4 rounded-lg text-gray-300 text-sm max-h-60 overflow-y-auto my-4">
            <p className="mb-4">This Agreement (hereinafter referred to as this "Agreement") is made with effect from {agreementDate} (the "Effective Date") between Secureitlab Co W.L.L (hereinafter referred to as "SITL") whose principal offices are located at: Unit 23, Building 1431, Road 3624, Area 536, AI Diraz, Kingdom of Bahrain</p>
            
            <p className="mb-4">and</p>
            
            <p className="mb-4">2) The undersigned person: {user?.name || 'Consultant'} ({user?.email || ''})</p>
            
            <p className="mb-2">2.1 member of SITL's staff on definite contracts and internships</p>
            <p className="mb-2">2.2 member of SITL's staff on indefinite contracts</p>
            <p className="mb-2">2.3 member of SITL's staff on secondment arrangements with third parties</p>
            <p className="mb-2">2.4 SITL's contractors and self-employed consultants</p>
            <p className="mb-4">2.5 SITL's associates and advisors</p>
            
            <p className="mb-4">Hereinafter collectively referred to as "Parties" or individually as a "Party".</p>
            
            <p className="mb-4 font-semibold">1. CONFIDENTIALITY OBLIGATIONS</p>
            
            <p className="mb-4">For the purposes of this Agreement, Confidential Information shall include all information or material that has or could have commercial value or other utility in the business in which SITL is engaged, including its clients.</p>
            
            <p className="mb-4">This Agreement applies to Confidential Information in any form and under any method of storage, including but not limited to that which is in writing, represented by any other means of recording, or which is communicated orally.</p>
            
            <p className="mb-4">The consultant hereby agrees that they will:</p>
            <p className="mb-2">a) hold all Confidential Information in strictest confidence;</p>
            <p className="mb-2">b) not disclose any Confidential Information to third parties without prior written consent from SITL;</p>
            <p className="mb-2">c) use Confidential Information solely for the purpose of performing services for SITL or its clients;</p>
            <p className="mb-2">d) take all reasonable precautions to prevent unauthorized disclosure or use of Confidential Information.</p>
          </div>

          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-700 mb-2 text-sm font-medium">Please sign below to continue:</p>
            <canvas
              ref={canvasRef}
              width={500}
              height={150}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={endDrawing}
              className="border border-gray-300 rounded w-full cursor-crosshair"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Signature
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSignNDA}
              disabled={!signature || signing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {signing ? 'Processing...' : 'Sign Agreement & Continue to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantProfileCompletionWrapper;