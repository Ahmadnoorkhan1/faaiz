import React, { useState, useEffect, useCallback } from 'react';
import api from '../../service/apiService';
import { toast } from 'react-hot-toast';
import { FiAlertCircle, FiCheckCircle, FiClock, FiCalendar, FiSlash, FiUsers } from 'react-icons/fi';

// Enhanced client interface with onboarding fields
interface Client {
  id: string;
  userId: string;
  fullName: string;
  organization: string;
  phoneNumber: string;
  requestedServices: string[];
  email?: string; // For display purposes
  createdAt: string;
  updatedAt: string;
  onboardingStatus: OnboardingStatus;
  isDiscoveryCallInvited: boolean;
  discoveryCallLink?: string;
  discoveryCallDate?: string;
  discoveryCallStatus?: string;
  adminReviewNotes?: string;
  rejectionReason?: string;
  scopingDetails?: any;
  termsAccepted: boolean;
  otherDetails?: string | any;
  user?: {
    id: string;
    email: string;
  };
}

// Updated to match schema OnboardingStatus values
type OnboardingStatus = 
  'PENDING_DISCOVERY' | 
  'DISCOVERY_INVITED' | 
  'DISCOVERY_SCHEDULED' | 
  'DISCOVERY_COMPLETED' | 
  'SCOPING_IN_PROGRESS' |
  'SCOPING_REVIEW' |
  'TERMS_PENDING' |
  'ONBOARDED' | 
  'REJECTED' |
  'NOT_STARTED' |  // Legacy value
  'IN_PROGRESS' |  // Legacy value
  'COMPLETED';     // Legacy value

const ClientsList: React.FC = () => {
  // State variables
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [onboardingStatus, setOnboardingStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);
  
  // Selected client and modal states
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showScopingModal, setShowScopingModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Form state for modals
  const [inviteFormData, setInviteFormData] = useState({
    callLink: '',
    scheduledDate: ''
  });
  
  const [statusFormData, setStatusFormData] = useState({
    status: 'completed',
    notes: ''
  });
  
  const [scopingFormData, setScopingFormData] = useState({
    scopingDetails: {},
    notes: ''
  }) as any;
  
  const [rejectFormData, setRejectFormData] = useState({
    reason: ''
  });
  
  // Initial data fetch
  useEffect(() => {
    fetchClients();
  }, [page, onboardingStatus]);
  
  // Filter clients when search term changes
  useEffect(() => {
    if (clients.length === 0) return;
    
    const filtered = clients.filter(client => {
      // Match search term
      const searchMatch = 
        (client.fullName && client.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((client.user?.email || client.email) && (client.user?.email || client.email || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.organization && client.organization.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return searchMatch;
    });
    
    setFilteredClients(filtered);
  }, [searchTerm, clients]);
  
  // Fetch clients with optional filtering
  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (page > 1) params.append('page', page.toString());
      params.append('limit', pageSize.toString());
      
      let endpoint = `/api/clients?${params.toString()}`;
      
      // If specific status is selected, use the by-status endpoint
      if (onboardingStatus !== 'all') {
        endpoint = `/api/clients/by-status/${onboardingStatus}`;
      }
      
      const response = await api.get(endpoint);
      
      if (response.data.success) {
        // Process clients to handle data format differences
        const processedClients = (response.data.data || []).map((client: any) => {
          // Parse requestedServices if it's a string
          let requestedServices = client.requestedServices || [];
          if (typeof requestedServices === 'string') {
            // Handle format like "{ISO_27001_INFORMATION_SECURITY_MANAGEMENT_SYSTEM}"
            requestedServices = requestedServices.replace(/[{}]/g, '').split(',');
          }
          
          // Parse otherDetails if it's a string
          let otherDetails = client.otherDetails;
          if (typeof otherDetails === 'string') {
            try {
              otherDetails = JSON.parse(otherDetails);
            } catch (e) {
              otherDetails = {};
            }
          }
          
          // Parse scopingDetails if it's a string
          let scopingDetails = client.scopingDetails;
          if (typeof scopingDetails === 'string') {
            try {
              scopingDetails = JSON.parse(scopingDetails);
            } catch (e) {
              scopingDetails = {};
            }
          }
          
          // Ensure we have a user object
          const user = client.user || { id: client.userId, email: client.email };
          
          return {
            ...client,
            requestedServices,
            otherDetails,
            scopingDetails,
            user,
            // Map legacy status to new status if needed
            onboardingStatus: mapLegacyStatus(client.onboardingStatus)
          };
        });
        
        setClients(processedClients);
        setFilteredClients(processedClients);
        
        // Handle pagination info
        if (response.data.count) {
          setTotalPages(Math.ceil(response.data.count / pageSize));
        } else {
          setTotalPages(Math.ceil(processedClients.length / pageSize));
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch clients');
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'An error occurred while fetching clients');
      toast.error('Failed to load clients data');
    } finally {
      setLoading(false);
    }
  };
  
  // Map legacy status values to new ones
  const mapLegacyStatus = (status: string): OnboardingStatus => {
    if (!status) return 'PENDING_DISCOVERY';
    
    switch (status) {
      case 'NOT_STARTED':
        return 'PENDING_DISCOVERY';
      case 'IN_PROGRESS':
        return 'DISCOVERY_INVITED';
      case 'COMPLETED':
        return 'ONBOARDED';
      default:
        return status as OnboardingStatus;
    }
  };

  // Helper function for status icons
  const getStatusIcon = (status: OnboardingStatus) => {
    const mappedStatus = mapLegacyStatus(status);
    
    switch (mappedStatus) {
      case 'ONBOARDED':
      case 'COMPLETED':
        return <FiCheckCircle className="mr-1.5" />;
      case 'DISCOVERY_COMPLETED':
      case 'SCOPING_REVIEW':
      case 'SCOPING_IN_PROGRESS':
        return <FiUsers className="mr-1.5" />;
      case 'PENDING_DISCOVERY':
      case 'NOT_STARTED':
        return <FiClock className="mr-1.5" />;
      case 'DISCOVERY_INVITED':
      case 'DISCOVERY_SCHEDULED':
      case 'IN_PROGRESS':
        return <FiCalendar className="mr-1.5" />;
      // case 'REJECTED':
      //   return <FiSlash className="mr-1.5" />;
      case 'TERMS_PENDING':
        return <FiAlertCircle className="mr-1.5" />;
      default:
        return null;
    }
  };
  
  // Handle discovery call invitation
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      
      const response = await api.post(`/api/clients/${selectedClient.id}/invite`, {
        callLink: inviteFormData.callLink,
        scheduledDate: inviteFormData.scheduledDate
      });
      
      if (response.data.success) {
        toast.success('Discovery call invitation sent successfully');
        
        // Update client in the list
        fetchClients(); // Refetch to get updated data
        setShowInviteModal(false);
        resetFormStates();
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
  
  // Handle discovery status update
  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      
      const response = await api.post(`/api/clients/${selectedClient.id}/discovery-status`, {
        status: statusFormData.status,
        notes: statusFormData.notes
      });
      
      if (response.data.success) {
        toast.success('Discovery call status updated successfully');
        
        // Update client in the list
        fetchClients(); // Refetch to get updated data
        setShowStatusModal(false);
        resetFormStates();
      } else {
        throw new Error(response.data.message || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle scoping details update
  const handleScopingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    try {
      setLoading(true);
      
      // Convert form data to expected API format
      const response = await api.post(`/api/clients/${selectedClient.id}/scoping`, {
        scopingDetails: scopingFormData.scopingDetails,
        notes: scopingFormData.notes
      });
      
      if (response.data.success) {
        toast.success('Scoping details updated successfully');
        
        // Update client in the list
        fetchClients(); // Refetch to get updated data
        setShowScopingModal(false);
        resetFormStates();
      } else {
        throw new Error(response.data.message || 'Failed to update scoping details');
      }
    } catch (err: any) {
      console.error('Error updating scoping details:', err);
      toast.error(err.message || 'Failed to update scoping details');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle terms acceptance
  const handleTermsAccept = async (clientId: string) => {
    if (!clientId) return;
    
    try {
      setLoading(true);
      
      const response = await api.post(`/api/clients/${clientId}/terms`, {
        termsAccepted: true
      });
      
      if (response.data.success) {
        toast.success('Client terms accepted successfully');
        
        // Update client in the list
        fetchClients(); // Refetch to get updated data
      } else {
        throw new Error(response.data.message || 'Failed to update terms acceptance');
      }
    } catch (err: any) {
      console.error('Error updating terms acceptance:', err);
      toast.error(err.message || 'Failed to update terms acceptance');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle client rejection
  // const handleRejectSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!selectedClient) return;
    
  //   try {
  //     setLoading(true);
      
  //     const response = await api.post(`/api/clients/${selectedClient.id}/reject`, {
  //       reason: rejectFormData.reason
  //     });
      
  //     if (response.data.success) {
  //       toast.success('Client application rejected');
        
  //       // Update client in the list
  //       fetchClients(); // Refetch to get updated data
  //       setShowRejectModal(false);
  //       resetFormStates();
  //     } else {
  //       throw new Error(response.data.message || 'Failed to reject client');
  //     }
  //   } catch (err: any) {
  //     console.error('Error rejecting client:', err);
  //     toast.error(err.message || 'Failed to reject client');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  
  // Helper function to reset all form states
  const resetFormStates = () => {
    setSelectedClient(null);
    setInviteFormData({ callLink: '', scheduledDate: '' });
    setStatusFormData({ status: 'completed', notes: '' });
    setScopingFormData({ scopingDetails: {}, notes: '' });
    setRejectFormData({ reason: '' });
  };
  
  // Helper function to get status badge class based on onboarding status
  const getStatusBadgeClass = (status: OnboardingStatus) => {
    // Map legacy statuses for display
    const mappedStatus = mapLegacyStatus(status);
    
    switch (mappedStatus) {
      case 'ONBOARDED':
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500';
      case 'DISCOVERY_COMPLETED':
      case 'SCOPING_REVIEW':
      case 'SCOPING_IN_PROGRESS':
        return 'bg-blue-500/10 text-blue-500';
      case 'PENDING_DISCOVERY':
      case 'NOT_STARTED':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'DISCOVERY_INVITED':
      case 'DISCOVERY_SCHEDULED':
      case 'IN_PROGRESS':
        return 'bg-purple-500/10 text-purple-500';
      case 'REJECTED':
        return 'bg-red-500/10 text-red-500';
      case 'TERMS_PENDING':
        return 'bg-orange-500/10 text-orange-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };
  
  // Helper function to get formatted status text
  const getStatusText = (status: OnboardingStatus) => {
    // Map legacy statuses for display
    const mappedStatus = mapLegacyStatus(status);
    return mappedStatus.replace(/_/g, ' ');
  };
  
  // Helper function to get client initials for avatar
  const getClientInitials = (name: string) => {
    if (!name || name === 'N/A') return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
  };
  
  // Helper function to get action buttons based on client status
  const getActionButtons = (client: Client) => {
    // Map legacy statuses for action buttons
    const mappedStatus = mapLegacyStatus(client.onboardingStatus);
    
    switch (mappedStatus) {
      case 'PENDING_DISCOVERY':
      case 'NOT_STARTED':
        return (
          <button 
            onClick={() => {
              setSelectedClient(client);
              setShowInviteModal(true);
            }}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Invite for Discovery
          </button>
        );
      
      case 'DISCOVERY_INVITED':
      case 'DISCOVERY_SCHEDULED':
      case 'IN_PROGRESS':
        return (
          <button 
            onClick={() => {
              setSelectedClient(client);
              setShowStatusModal(true);
            }}
            className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            Update Status
          </button>
        );
      
      case 'DISCOVERY_COMPLETED':
        return (
          <button 
            onClick={() => {
              setSelectedClient(client);
              setShowScopingModal(true);
            }}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Add Scoping
          </button>
        );
      
      case 'SCOPING_REVIEW':
      case 'TERMS_PENDING':
        return (
          <button 
            onClick={() => handleTermsAccept(client.id)}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Accept Terms
          </button>
        );
      
      default:
        return null;
    }
  };
  
  // Render component
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Clients</h1>
          <p className="text-gray-400 mt-1">Manage and monitor client onboarding</p>
        </div>
       
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Total Clients</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">{clients.length}</p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Onboarded</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {clients.filter(c => ['ONBOARDED', 'COMPLETED'].includes(c.onboardingStatus)).length}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Pending Discovery</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {clients.filter(c => ['PENDING_DISCOVERY', 'NOT_STARTED'].includes(c.onboardingStatus)).length}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">New This Month</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {clients.filter(c => {
              const createdDate = new Date(c.createdAt);
              const now = new Date();
              return createdDate.getMonth() === now.getMonth() && 
                     createdDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search clients..."
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
              value={onboardingStatus}
              onChange={(e) => setOnboardingStatus(e.target.value)}
              className="bg-[#242935] text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
            >
              <option value="all">All Status</option>
              <option value="PENDING_DISCOVERY">Pending Discovery</option>
              <option value="DISCOVERY_INVITED">Discovery Invited</option>
              <option value="DISCOVERY_SCHEDULED">Discovery Scheduled</option>
              <option value="DISCOVERY_COMPLETED">Discovery Completed</option>
              <option value="SCOPING_IN_PROGRESS">Scoping In Progress</option>
              <option value="SCOPING_REVIEW">Scoping Review</option>
              <option value="TERMS_PENDING">Terms Pending</option>
              <option value="ONBOARDED">Onboarded</option>
              <option value="REJECTED">Rejected</option>
              {/* Include legacy options to filter existing data */}
              <option value="NOT_STARTED">Not Started (Legacy)</option>
              <option value="IN_PROGRESS">In Progress (Legacy)</option>
              <option value="COMPLETED">Completed (Legacy)</option>
            </select>
            <button 
              onClick={() => {
                setOnboardingStatus('all');
                setSearchTerm('');
                fetchClients();
              }}
              className="bg-[#242935] text-gray-200 px-3 py-2 rounded-lg border border-gray-700 hover:bg-[#2e3446]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Clients Table */}
      <div className="bg-[#1a1f2b] rounded-xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            <table className="w-full min-w-full divide-y divide-gray-800 table-fixed">
              <thead>
                <tr className="bg-[#242935] sticky top-0 z-10">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/4">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                    Company
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                    Services
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-1/6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[#1a1f2b] divide-y divide-gray-800">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client, index) => (
                    <tr key={client.id} className={`transition-colors hover:bg-[#242935] ${index % 2 === 0 ? '' : 'bg-opacity-40 bg-[#242935]'}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                            {getClientInitials(client.fullName)}
                          </div>
                          <div className="ml-4 max-w-[200px]">
                            <div className="text-sm font-medium text-gray-200 truncate" title={client.fullName}>
                              {client.fullName}
                            </div>
                            <div className="flex items-center mt-1">
                              <div className="text-xs text-gray-400 truncate" title={client.phoneNumber}>
                                {client.phoneNumber}
                              </div>
                              {client.discoveryCallDate && (
                                <div className="ml-2 flex items-center text-xs text-blue-400">
                                  <FiCalendar className="mr-1" size={12} />
                                  <span>{new Date(client.discoveryCallDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200 max-w-[150px] truncate" title={client.organization}>
                          {client.organization}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200 max-w-[150px] truncate" title={client.user?.email || client.email || 'N/A'}>
                          {client.user?.email || client.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {Array.isArray(client.requestedServices) && client.requestedServices.slice(0, 2).map((service, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-900/30 text-indigo-400 border border-indigo-800/50">
                              {service.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}
                            </span>
                          ))}
                          {Array.isArray(client.requestedServices) && client.requestedServices.length > 2 && (
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-800/60 text-gray-400 cursor-pointer hover:bg-gray-700/60"
                              title={client.requestedServices.slice(2).map(s => 
                                s.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
                              ).join(', ')}
                            >
                              +{client.requestedServices.length - 2} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium
                            ${getStatusBadgeClass(client.onboardingStatus as OnboardingStatus)}`}>
                            {getStatusIcon(client.onboardingStatus as OnboardingStatus)}
                            {getStatusText(client.onboardingStatus as OnboardingStatus)}
                          </span>
                          
                          {client.discoveryCallStatus && (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium
                              ${client.discoveryCallStatus === 'completed' ? 'bg-green-900/20 text-green-400 border border-green-800/30' : 
                                client.discoveryCallStatus === 'cancelled' ? 'bg-red-900/20 text-red-400 border border-red-800/30' : 
                                'bg-yellow-900/20 text-yellow-400 border border-yellow-800/30'}`}>
                              {client.discoveryCallStatus === 'not_started' ? 'Not Started' : 
                               client.discoveryCallStatus.charAt(0).toUpperCase() + client.discoveryCallStatus.slice(1)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          {getActionButtons(client) && (
                            <div>
                              {getActionButtons(client)}
                            </div>
                          )}
                          {/* <button
                            onClick={() => {
                              setSelectedClient(client);
                              setShowRejectModal(true);
                            }}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center"
                          >
                            <FiSlash className="mr-1" size={12} />
                            Reject
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-gray-800/50 p-3">
                          <FiUsers className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">No clients found</p>
                        <p className="text-gray-500 text-xs">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="bg-[#242935] px-6 py-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-400">
                <span>Showing</span>
                <span className="font-medium mx-1">{(page - 1) * pageSize + 1}</span>
                <span>to</span>
                <span className="font-medium mx-1">
                  {Math.min(page * pageSize, (filteredClients.length || 0))}
                </span>
                <span>of</span>
                <span className="font-medium ml-1">{filteredClients.length || 0}</span>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className={`p-1.5 rounded-md ${page === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`p-1.5 rounded-md ${page === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                  if (pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          page === pageNum 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`p-1.5 rounded-md ${page === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className={`p-1.5 rounded-md ${page === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-700'}`}
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Discovery Call Invitation Modal */}
      {showInviteModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              Invite {selectedClient.fullName} for Discovery Call
            </h3>
            <form onSubmit={handleInviteSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Call Link
                  </label>
                  <input
                    type="url"
                    value={inviteFormData.callLink}
                    onChange={(e) => setInviteFormData({...inviteFormData, callLink: e.target.value})}
                    required
                    placeholder="https://teams.microsoft.com/..."
                    className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={inviteFormData.scheduledDate}
                    onChange={(e) => setInviteFormData({...inviteFormData, scheduledDate: e.target.value})}
                    required
                    className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Discovery Status Modal */}
      {showStatusModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              Update Discovery Call Status
            </h3>
            <form onSubmit={handleStatusSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFormData.status}
                    onChange={(e) => setStatusFormData({...statusFormData, status: e.target.value})}
                    required
                    className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rescheduled">Rescheduled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={statusFormData.notes}
                    onChange={(e) => setStatusFormData({...statusFormData, notes: e.target.value})}
                    rows={4}
                    className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any notes about the discovery call..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scoping Details Modal */}
      {showScopingModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              Add Scoping Details
            </h3>
            <form onSubmit={handleScopingSubmit}>
              <div className="space-y-4">
                {Array.isArray(selectedClient.requestedServices) && 
                 selectedClient.requestedServices.map((service, idx) => (
                  <div key={idx}>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      {service.replace(/_/g, ' ')} Scope
                    </label>
                    <textarea
                      value={scopingFormData?.scopingDetails[service] || ''}
                      onChange={(e) => setScopingFormData({
                        ...scopingFormData, 
                        scopingDetails: {
                          ...scopingFormData.scopingDetails,
                          [service]: e.target.value
                        }
                      })}
                      rows={3}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter scoping details for ${service.replace(/_/g, ' ')}...`}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={scopingFormData.notes || ''}
                    onChange={(e) => setScopingFormData({...scopingFormData, notes: e.target.value})}
                    rows={4}
                    className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowScopingModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Save Scoping Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Client Modal */}
      {showRejectModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              Reject Client Application
            </h3>
            {/* <form onSubmit={handleRejectSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectFormData.reason}
                    onChange={(e) => setRejectFormData({...rejectFormData, reason: e.target.value})}
                    rows={4}
                    required
                    className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Provide a reason for rejection..."
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed"
                >
                  {loading ? 'Rejecting...' : 'Reject Client'}
                </button>
              </div>
            </form> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsList;