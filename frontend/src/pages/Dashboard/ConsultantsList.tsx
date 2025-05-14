import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';
import { toast } from 'react-hot-toast';
import ConsultantTable from '../../pages/configurations/components/ConsultantManagement/ConsultantTable';
import StatusFilter from '../../pages/configurations/components/ConsultantManagement/StatusFilter';
import InterviewInvitationModal from '../../pages/configurations/components/ConsultantManagement/InterviewInvitationModal';
import ConsultantDetailModal from '../../pages/configurations/components/ConsultantManagement/ConsultantDetailModal';
import { Consultant, ConsultantStatus } from '../../types/consultant';

const ConsultantsList: React.FC = () => {
  // Core state
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ConsultantStatus | 'ALL'>('ALL');
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected consultant and modal states
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch consultants on component mount
  useEffect(() => {
    fetchConsultants();
  }, []);

  // Apply filters when status or search terms change
  useEffect(() => {
    if (!consultants.length) return;
    
    let filtered = [...consultants];
    
    // Apply status filter
    if (selectedStatus !== 'ALL') {
      filtered = filtered.filter(consultant => consultant.status === selectedStatus);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(consultant => {
        const fullName = `${consultant.contactFirstName} ${consultant.contactLastName}`.toLowerCase();
        const email = consultant.email.toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower) ||
               consultant.position?.toLowerCase().includes(searchLower) ||
               consultant.industry?.toLowerCase().includes(searchLower);
      });
    }
    
    setFilteredConsultants(filtered);
  }, [selectedStatus, searchTerm, consultants]);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user data from localStorage
      const userDataString = localStorage.getItem('userData');
      if (!userDataString) {
        throw new Error('User authentication data not found');
      }
      
      const userData = JSON.parse(userDataString);
      if (!userData || !userData.id) {
        throw new Error('User ID not found');
      }
      
      // Make API request based on user role
      const response = userData.role === 'ADMIN'
        ? await api.get('/api/consultants')
        : await api.get(`/api/consultants/user/${userData.id}`);
      
      if (response.data.success) {
        const consultantsData = response.data.data || [];
        setConsultants(consultantsData);
        setFilteredConsultants(consultantsData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch consultants');
      }
    } catch (err: any) {
      console.error('Error fetching consultants:', err);
      setError(err.message || 'An error occurred while fetching consultants');
      toast.error('Failed to load consultants data');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultantsByStatus = async (status: ConsultantStatus) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/consultants/by-status/${status}`);
      
      if (response.data.success) {
        setFilteredConsultants(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch consultants');
      }
    } catch (err: any) {
      console.error('Error fetching consultants by status:', err);
      setError(err.message || 'An error occurred while filtering consultants');
      toast.error('Failed to filter consultants');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status: ConsultantStatus | 'ALL') => {
    setSelectedStatus(status);
    if (status !== 'ALL') {
      fetchConsultantsByStatus(status);
    }
  };

  const handleViewDetails = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowDetailModal(true);
  };

  const handleInviteClick = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowInviteModal(true);
  };

  const handleInvitationSubmit = async (interviewLink: string, scheduledDate: string) => {
    if (!selectedConsultant) return;
    
    try {
      setLoading(true);
      const response = await api.post(`/api/consultants/${selectedConsultant.id}/invite`, {
        interviewLink,
        scheduledDate
      });
      
      if (response.data.success) {
        toast.success('Interview invitation sent successfully');
        
        // Update consultant in the list
        setConsultants(prevConsultants => 
          prevConsultants.map(c => 
            c.id === selectedConsultant.id ? response.data.data : c
          )
        );
        
        setShowInviteModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to send invitation');
      }
    } catch (err: any) {
      console.error('Error sending invitation:', err);
      toast.error(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  // Calculate counts for metrics
  const getStatusCount = (status: string) => {
    return consultants.filter(c => c.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h3 className="text-gray-400 text-sm font-medium">Approved</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {getStatusCount('APPROVED')}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Pending Review</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {getStatusCount('PENDING_REVIEW')}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Scheduled</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {getStatusCount('INTERVIEW_SCHEDULED')}
          </p>
        </div>
      </div>

      {/* Search and Status Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
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
        
        {/* Status Filter */}
        <StatusFilter 
          selectedStatus={selectedStatus} 
          onStatusChange={handleStatusFilter} 
        />
      </div>

      {/* Consultants Table */}
      <ConsultantTable 
        consultants={filteredConsultants}
        loading={loading}
        error={error}
        onViewDetails={handleViewDetails}
        onInvite={handleInviteClick}
        onReview={() => {}} // Empty function as we're excluding review functionality
      />

      {/* Modals */}
      {showDetailModal && selectedConsultant && (
        <ConsultantDetailModal
          consultant={selectedConsultant}
          onClose={() => setShowDetailModal(false)}
          onInvite={handleInviteClick}
          onReview={() => {}} // Empty function as we're excluding review functionality
        />
      )}

      {showInviteModal && selectedConsultant && (
        <InterviewInvitationModal
          consultant={selectedConsultant}
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInvitationSubmit}
        />
      )}
    </div>
  );
};

export default ConsultantsList;