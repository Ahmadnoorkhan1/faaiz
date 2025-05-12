import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1f2b] rounded-xl p-8 shadow-lg text-center">
        <svg
          className="w-16 h-16 text-red-500 mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4v1m0-1h1m-1 0h-1m4-4l-4-3-4 3m8 0v4m-16-3v7a2 2 0 002 2h12a2 2 0 002-2v-7"
          />
        </svg>
        
        <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
        
        <p className="text-gray-400 mb-6">
          You don't have permission to access this page. If you believe this is an error, please contact your administrator.
        </p>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
          
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;