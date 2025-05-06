import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';

interface Consultant {
  id: string;
  email: string;
  role: string;
  consultantProfile: {
    id: string;
    contactFirstName: string;
    contactLastName: string;
    email: string;
    phone: string;
    position: string;
    industry: string;
    organizationWebsite: string;
    servicesOffered: string[];
    onboardingStatus: string;
  };
  projects: any[];
}

const ConsultantsList: React.FC = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/consultants');
        setConsultants(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching consultants:', err);
        setError('Failed to load consultants. Please try again later.');
        setLoading(false);
      }
    };

    fetchConsultants();
  }, []);

  const filteredConsultants = consultants.filter(consultant => {
    const fullName = `${consultant.consultantProfile?.contactFirstName || ''} ${consultant.consultantProfile?.contactLastName || ''}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.consultantProfile?.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.consultantProfile?.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || consultant.consultantProfile?.onboardingStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500';
      case 'IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-500';
      case 'NOT_STARTED':
        return 'bg-yellow-500/10 text-yellow-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getConsultantProjects = (consultant: Consultant) => {
    return consultant.projects?.length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Consultants</h1>
          <p className="text-gray-400 mt-1">Manage and monitor all consultants</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Total Consultants</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">{consultants.length}</p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Active</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {consultants.filter(c => c.consultantProfile?.onboardingStatus === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">In Progress</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {consultants.filter(c => c.consultantProfile?.onboardingStatus === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Not Started</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {consultants.filter(c => c.consultantProfile?.onboardingStatus === 'NOT_STARTED').length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search consultants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#242935] text-gray-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-[#242935] text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="NOT_STARTED">Not Started</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consultants Table */}
      <div className="bg-[#1a1f2b] rounded-xl shadow-lg">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left bg-[#242935]">
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Role</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Assigned Projects</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredConsultants.length > 0 ? (
                  filteredConsultants.map((consultant) => (
                    <tr key={consultant.id} className="hover:bg-[#242935] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {consultant.consultantProfile?.contactFirstName?.charAt(0) || consultant.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-200">
                              {consultant.consultantProfile?.contactFirstName 
                                ? `${consultant.consultantProfile.contactFirstName} ${consultant.consultantProfile.contactLastName}`
                                : 'N/A'}
                            </div>
                            <div className="text-xs text-gray-400">{consultant.consultantProfile?.position || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-200">{consultant.email}</td>
                      <td className="px-6 py-4 text-gray-200">{consultant.consultantProfile?.industry || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-200">{getConsultantProjects(consultant)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${getStatusBadgeClass(consultant.consultantProfile?.onboardingStatus || 'NOT_STARTED')}`}>
                          {consultant.consultantProfile?.onboardingStatus?.replace('_', ' ') || 'NOT STARTED'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-blue-500 hover:text-blue-400">View Details</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-400">
                      No consultants found. Try adjusting your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultantsList; 