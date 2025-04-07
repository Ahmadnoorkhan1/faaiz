import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getClientByUserId } from '../services/api/clientService';
import { getConsultantByUserId } from '../services/api/consultantService';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<'client' | 'consultant' | 'none'>('none');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    const checkUserProfiles = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        
        // Check if user has a client profile
        const clientProfile = await getClientByUserId(user.id);
        if (clientProfile) {
          setUserType('client');
          setProfileData(clientProfile);
          setLoading(false);
          return;
        }
        
        // Check if user has a consultant profile
        const consultantProfile = await getConsultantByUserId(user.id);
        if (consultantProfile) {
          setUserType('consultant');
          setProfileData(consultantProfile);
          setLoading(false);
          return;
        }
        
        // No profile found
        setUserType('none');
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user profiles:', error);
        setLoading(false);
      }
    };
    
    checkUserProfiles();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If user has no profile yet
  if (userType === 'none') {
    return (
      <div className="min-h-screen bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-2xl font-bold text-neutral-900">Welcome to GRC Solutions</h1>
            <p className="mt-4 text-neutral-600">
              To get started, please select your role to complete the onboarding process:
            </p>
            
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-medium text-neutral-900">I'm a Client</h2>
                <p className="mt-2 text-neutral-600">
                  Organizations seeking GRC solutions and consulting services.
                </p>
                <div className="mt-6">
                  <Link
                    to="/onboard/client"
                    className="inline-flex items-center justify-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    Complete Client Onboarding
                  </Link>
                </div>
              </div>
              
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h2 className="text-xl font-medium text-neutral-900">I'm a Consultant</h2>
                <p className="mt-2 text-neutral-600">
                  Professionals providing GRC consulting services to organizations.
                </p>
                <div className="mt-6">
                  <Link
                    to="/onboard/consultant"
                    className="inline-flex items-center justify-center rounded-md bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600"
                  >
                    Complete Consultant Onboarding
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Client Dashboard
  if (userType === 'client') {
    return (
      <div className="min-h-screen bg-neutral-50">
        <header className="bg-white shadow">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-neutral-900">Client Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-neutral-900 mb-4">Welcome back, {profileData.companyName}</h2>
                
                {/* Status Card */}
                <div className="mb-6 p-4 rounded-md bg-primary-50 border border-primary-200">
                  <h3 className="text-lg font-medium text-primary-800">Onboarding Status</h3>
                  <p className="mt-1 text-sm text-primary-600">
                    {profileData.onboardingStatus === 'COMPLETED' 
                      ? 'Your onboarding is complete.' 
                      : 'Your profile is still in progress. Please complete all required steps.'}
                  </p>
                </div>
                
                {/* Quick Links */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Quick Links</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <button className="flex items-center space-x-2 rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </span>
                      <span>My Projects</span>
                    </button>
                    <button className="flex items-center space-x-2 rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </span>
                      <span>My Consultants</span>
                    </button>
                    <button className="flex items-center space-x-2 rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </span>
                      <span>Reports</span>
                    </button>
                  </div>
                </div>
                
                {/* Profile Summary */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Profile Information</h3>
                  <div className="rounded-md border border-neutral-200 overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                      <p className="text-sm font-medium text-neutral-500">Company Information</p>
                    </div>
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-neutral-500">Company Name</span>
                        <span className="block font-medium text-neutral-900">{profileData.companyName}</span>
                      </div>
                      <div>
                        <span className="block text-neutral-500">Industry</span>
                        <span className="block font-medium text-neutral-900">{profileData.industry}</span>
                      </div>
                      <div>
                        <span className="block text-neutral-500">Contact Person</span>
                        <span className="block font-medium text-neutral-900">{profileData.contactName}</span>
                      </div>
                      <div>
                        <span className="block text-neutral-500">Contact Information</span>
                        <span className="block font-medium text-neutral-900">{profileData.contactEmail}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Consultant Dashboard
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900">Consultant Dashboard</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">
                Welcome back, {profileData.firstName} {profileData.lastName}
              </h2>
              
              {/* Status Card */}
              <div className="mb-6 p-4 rounded-md bg-primary-50 border border-primary-200">
                <h3 className="text-lg font-medium text-primary-800">Onboarding Status</h3>
                <p className="mt-1 text-sm text-primary-600">
                  {profileData.onboardingStatus === 'COMPLETED' 
                    ? 'Your onboarding is complete.' 
                    : 'Your profile is still in progress. Please complete all required steps.'}
                </p>
              </div>
              
              {/* Quick Links */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-neutral-900 mb-3">Quick Links</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <button className="flex items-center space-x-2 rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </span>
                    <span>Client Organizations</span>
                  </button>
                  <button className="flex items-center space-x-2 rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </span>
                    <span>My Assignments</span>
                  </button>
                  <button className="flex items-center space-x-2 rounded-md border border-neutral-200 p-4 hover:bg-neutral-50">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </span>
                    <span>Time Tracking</span>
                  </button>
                </div>
              </div>
              
              {/* Profile Summary */}
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-3">Profile Information</h3>
                <div className="rounded-md border border-neutral-200 overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                    <p className="text-sm font-medium text-neutral-500">Consultant Information</p>
                  </div>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-neutral-500">Name</span>
                      <span className="block font-medium text-neutral-900">
                        {profileData.firstName} {profileData.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="block text-neutral-500">Industry</span>
                      <span className="block font-medium text-neutral-900">{profileData.industry}</span>
                    </div>
                    <div>
                      <span className="block text-neutral-500">Position</span>
                      <span className="block font-medium text-neutral-900">{profileData.position}</span>
                    </div>
                    <div>
                      <span className="block text-neutral-500">Experience</span>
                      <span className="block font-medium text-neutral-900">{profileData.experience} years</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 