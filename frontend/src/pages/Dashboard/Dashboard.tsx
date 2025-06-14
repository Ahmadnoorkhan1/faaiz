import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import { useuser } from '../../utils/userContext';
import { get } from '../../service/apiService';
import { useAuth } from '../../utils/AuthContext';
import BarChart from '../../components/UI/BarChart';

const Dashboard: React.FC = () => {
  const {user} = useAuth();


  const [ndaSigned, setNdaSigned] = useState<boolean | null>(null);
  const [ndaLoading, setNdaLoading] = useState<boolean>(false);


  // Check NDA status for consultants
  useEffect(() => {
    const checkNdaStatus = async () => {
      if (user.role === 'CONSULTANT' && user?.id) {
        setNdaLoading(true);
        try {
          const response = await get<{ data: { ndaSigned: boolean } }>(`/api/consultants/${user.id}/nda-status`);
          setNdaSigned(response.data.ndaSigned);
        } catch (error) {
          console.error('Error checking NDA status:', error);
          setNdaSigned(false);
        } finally {
          setNdaLoading(false);
        }
      }
    };

    checkNdaStatus();
  }, [user]);

  const stats = [
    {
      title: 'Total Clients',
      value: '89',
      change: '+9%',
      trend: 'up',
    },
    {
      title: 'Active Projects',
      value: '12',
      change: '+15%',
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: '$48.2k',
      change: '-3%',
      trend: 'down',
    },
    {
      title: 'Pending Tasks',
      value: '24',
      change: '+8%',
      trend: 'up',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'New client onboarded',
      description: 'Tech Solutions Inc. completed onboarding process',
      time: '2 hours ago',
      type: 'client',
    },
    {
      id: 2,
      title: 'Project milestone completed',
      description: 'Phase 1 of Project Aurora completed',
      time: '5 hours ago',
      type: 'project',
    },
    {
      id: 3,
      title: 'New task assigned',
      description: 'Review Q4 financial projections',
      time: '1 day ago',
      type: 'task',
    },
  ];

  // NDA Banner component for consultants
  const NDABanner = () => {
    return (
      <div className="bg-yellow-500/20 border-l-4 border-yellow-500 p-4 mb-6 rounded-r">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
           
            <p className="text-sm text-yellow-500 font-medium">
              You must sign the Non-Disclosure Agreement before proceeding with consulting work.
              <Link to="/profile" className="ml-2 font-bold underline">
                Sign NDA
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Client Dashboard
  if (user.role === 'CLIENT' && user ) {
    return (
      // <div className="space-y-6">
      //   <div className="flex items-center justify-between">
      //     <div>
      //       <h1 className="text-2xl font-semibold text-gray-200">Client Dashboard</h1>
      //       <p className="text-gray-400 mt-1">Welcome back, {user?.companyName}</p>
      //     </div>
      //     <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
      //       Generate Report
      //     </button>
      //   </div>

      //   {/* Stats Grid */}
      //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      //     {stats.map((stat, index) => (
      //       <div key={index} className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
      //         <div className="flex items-center justify-between">
      //           <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
      //           <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
      //             {stat.change}
      //           </span>
      //         </div>
      //         <p className="mt-2 text-2xl font-semibold text-gray-200">{stat.value}</p>
      //       </div>
      //     ))}
      //   </div>

      //   {/* Quick Links */}
      //   <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
      //     <h2 className="text-xl font-semibold text-gray-200 mb-4">Quick Links</h2>
      //     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      //       <button className="flex items-center space-x-3 rounded-lg bg-[#242935] p-4 hover:bg-[#2d3544] transition-colors">
      //         <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
      //           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      //           </svg>
      //         </span>
      //         <span className="text-gray-200">My Projects</span>
      //       </button>
      //       <button className="flex items-center space-x-3 rounded-lg bg-[#242935] p-4 hover:bg-[#2d3544] transition-colors">
      //         <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
      //           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      //           </svg>
      //         </span>
      //         <span className="text-gray-200">My Consultants</span>
      //       </button>
      //       <button className="flex items-center space-x-3 rounded-lg bg-[#242935] p-4 hover:bg-[#2d3544] transition-colors">
      //         <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
      //           <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      //           </svg>
      //         </span>
      //         <span className="text-gray-200">Reports</span>
      //       </button>
      //     </div>
      //   </div>

      //   {/* Recent Activity */}
      //   <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
      //     <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Activity</h2>
      //     <div className="space-y-4">
      //       {recentActivity.map((activity) => (
      //         <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-[#242935] rounded-lg transition-colors">
      //           <div className="flex-shrink-0">
      //             <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
      //               {activity.type === 'client' && (
      //                 <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      //                 </svg>
      //               )}
      //               {activity.type === 'project' && (
      //                 <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      //                 </svg>
      //               )}
      //               {activity.type === 'task' && (
      //                 <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      //                 </svg>
      //               )}
      //             </div>
      //           </div>
      //           <div className="flex-1">
      //             <h4 className="text-sm font-medium text-gray-200">{activity.title}</h4>
      //             <p className="text-sm text-gray-400">{activity.description}</p>
      //             <span className="text-xs text-gray-500">{activity.time}</span>
      //           </div>
      //         </div>
      //       ))}
      //     </div>
      //   </div>

      //   {/* user Information */}
      //   <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
      //     <h2 className="text-xl font-semibold text-gray-200 mb-4">user Information</h2>
      //     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      //       <div>
      //         <h3 className="text-sm font-medium text-gray-400">Company Name</h3>
      //         <p className="mt-1 text-gray-200">{user.companyName}</p>
      //       </div>
      //       <div>
      //         <h3 className="text-sm font-medium text-gray-400">Industry</h3>
      //         <p className="mt-1 text-gray-200">{user.industry}</p>
      //       </div>
      //       <div>
      //         <h3 className="text-sm font-medium text-gray-400">Contact Person</h3>
      //         <p className="mt-1 text-gray-200">{user.contactName}</p>
      //       </div>
      //       <div>
      //         <h3 className="text-sm font-medium text-gray-400">Contact Information</h3>
      //         <p className="mt-1 text-gray-200">{user.contactEmail}</p>
      //       </div>
      //     </div>
      //   </div>
      // </div>
  <div className="space-y-6">
  {/* Project Summary */}
  <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center">
    <div>
      <h2 className="text-xl font-semibold text-gray-200 mb-2">Project Summary</h2>
      <div className="grid grid-cols-2 gap-4 text-gray-400">
        <div>
          <span className="font-medium">Project Name:</span> ISO 27001:2022 Implementation Project
        </div>
        <div>
          <span className="font-medium">Client Name:</span> Client Name
        </div>
        <div>
          <span className="font-medium">Phase:</span> All Phases
        </div>
        <div>
          <span className="font-medium">Week:</span> Week Start Date – Week End Date
        </div>
      </div>
    </div>
    <div className="flex flex-col items-center mt-4 md:mt-0">
      <span className="text-gray-400 font-medium">Project Progress</span>
      <span className="text-3xl font-bold text-blue-500 mt-1">92%</span>
      {/* Add a progress bar here if you like */}
    </div>
  </div>

  {/* Phase Breakdown & Bar Chart */}
  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
    <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
      <h3 className="text-gray-400 text-sm font-medium mb-2">Phase Status</h3>
      <div className="flex space-x-6">
        <div>
          <span className="text-green-500 font-bold text-2xl">65</span>
          <div className="text-gray-400 text-xs">Completed</div>
        </div>
        <div>
          <span className="text-blue-500 font-bold text-2xl">3</span>
          <div className="text-gray-400 text-xs">In Progress</div>
        </div>
        <div>
          <span className="text-yellow-500 font-bold text-2xl">4</span>
          <div className="text-gray-400 text-xs">To be Started</div>
        </div>
      </div>
    </div>
    
  </div>

  {/* Achievements & Upcoming Tasks */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
      <h3 className="text-purple-400 text-sm font-medium mb-2">Previous Achievements</h3>
      <ul className="list-disc list-inside text-gray-200">
        <li>Phase 02 completed.</li>
        <li>ISO 27001 Documentation set completed.</li>
        <li>ICT readiness for Business Continuity meeting completed</li>
      </ul>
    </div>
    <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
      <h3 className="text-purple-400 text-sm font-medium mb-2">Upcoming Tasks</h3>
      <ul className="list-disc list-inside text-gray-200">
        <li>ISSC Meeting</li>
        <li>Internal Audit</li>
        <li>Awareness training session</li>
      </ul>
    </div>
  </div>

  <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg flex justify-center items-center">
    <BarChart  />
  </div>

  {/* Requires Attention */}
  <div className="bg-[#6d28d9] rounded-xl p-6 shadow-lg">
    <h3 className="text-white text-sm font-medium mb-2">Requires Attention</h3>
    <p className="text-white">No items at this time.</p>
  </div>
</div>
    );
  }

  // Consultant Dashboard
  if (user.role === 'CONSULTANT' && user ) {
    return (
      <div className="space-y-6">
        {/* NDA Banner */}
        {/* {user.role === 'CONSULTANT' && !ndaLoading && ndaSigned === false && <NDABanner />} */}
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-200">Consultant Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user.name}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-200">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-[#242935] rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    {activity.type === 'client' && (
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {activity.type === 'project' && (
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    {activity.type === 'task' && (
                      <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-200">{activity.title}</h4>
                  <p className="text-sm text-gray-400">{activity.description}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* user Information */}
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">user Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Name</h3>
              <p className="mt-1 text-gray-200">{user.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Expertise</h3>
              <p className="mt-1 text-gray-200">{user.expertise}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Contact Information</h3>
              <p className="mt-1 text-gray-200">{user.email}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Experience</h3>
              <p className="mt-1 text-gray-200">{user.yearsOfExperience} years</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  if(user.role ==='ADMIN' && user){
    return(
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-200">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.companyName}</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Generate Report
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-gray-400 text-sm font-medium">{stat.title}</h3>
                <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="mt-2 text-2xl font-semibold text-gray-200">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <button className="flex items-center space-x-3 rounded-lg bg-[#242935] p-4 hover:bg-[#2d3544] transition-colors">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              <span className="text-gray-200">My Projects</span>
            </button>
            <button className="flex items-center space-x-3 rounded-lg bg-[#242935] p-4 hover:bg-[#2d3544] transition-colors">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span className="text-gray-200">My Consultants</span>
            </button>
            <button className="flex items-center space-x-3 rounded-lg bg-[#242935] p-4 hover:bg-[#2d3544] transition-colors">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-500">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <span className="text-gray-200">Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-[#242935] rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    {activity.type === 'client' && (
                      <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    {activity.type === 'project' && (
                      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    )}
                    {activity.type === 'task' && (
                      <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-200">{activity.title}</h4>
                  <p className="text-sm text-gray-400">{activity.description}</p>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* user Information */}
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-200 mb-4">user Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-400">Company Name</h3>
              <p className="mt-1 text-gray-200">{user.companyName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Industry</h3>
              <p className="mt-1 text-gray-200">{user.industry}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Contact Person</h3>
              <p className="mt-1 text-gray-200">{user.contactName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-400">Contact Information</h3>
              <p className="mt-1 text-gray-200">{user.contactEmail}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
};

export default Dashboard; 