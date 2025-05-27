import React, { useState, useEffect, useCallback } from "react";
import api from "../../service/apiService";
import { toast } from "react-hot-toast";

import ClientsTable from "../../components/UI/ClientsTable";

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
  | "PENDING_DISCOVERY"
  | "DISCOVERY_INVITED"
  | "DISCOVERY_SCHEDULED"
  | "DISCOVERY_COMPLETED"
  | "SCOPING_IN_PROGRESS"
  | "SCOPING_REVIEW"
  | "TERMS_PENDING"
  | "ONBOARDED"
  | "REJECTED"
  | "NOT_STARTED" // Legacy value
  | "IN_PROGRESS" // Legacy value
  | "COMPLETED"; // Legacy value

const ClientsList: React.FC = () => {
  // State variables
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [onboardingStatus, setOnboardingStatus] = useState<string>("all");
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
    callLink: "",
    scheduledDate: "",
  });

  const [statusFormData, setStatusFormData] = useState({
    status: "completed",
    notes: "",
  });

  const [scopingFormData, setScopingFormData] = useState({
    scopingDetails: {},
    notes: "",
  }) as any;

  const [rejectFormData, setRejectFormData] = useState({
    reason: "",
  });

  // Initial data fetch
  useEffect(() => {
    fetchClients();
  }, [page, onboardingStatus]);

  // Filter clients when search term changes
  useEffect(() => {
    if (clients.length === 0) return;

    const filtered = clients.filter((client) => {
      // Match search term
      const searchMatch =
        (client.fullName &&
          client.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        ((client.user?.email || client.email) &&
          (client.user?.email || client.email || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (client.organization &&
          client.organization.toLowerCase().includes(searchTerm.toLowerCase()));

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
      if (page > 1) params.append("page", page.toString());
      params.append("limit", pageSize.toString());

      let endpoint = `/api/clients?${params.toString()}`;

      // If specific status is selected, use the by-status endpoint
      if (onboardingStatus !== "all") {
        endpoint = `/api/clients/by-status/${onboardingStatus}`;
      }

      const response = await api.get(endpoint);

      if (response.data.success) {
        // Process clients to handle data format differences
        const processedClients = (response.data.data || []).map(
            (client: any) => {
            // Parse requestedServices if it's a string

            // Parse otherDetails if it's a string
            let otherDetails = client.otherDetails;
            if (typeof otherDetails === "string") {
              try {
                otherDetails = JSON.parse(otherDetails);
              } catch (e) {
                otherDetails = {};
              }
            }

            // Parse scopingDetails if it's a string
            let scopingDetails = client.scopingDetails;
            if (typeof scopingDetails === "string") {
              try {
                scopingDetails = JSON.parse(scopingDetails);
              } catch (e) {
                scopingDetails = {};
              }
            }

            // Ensure we have a user object
            const user = client.user || {
              id: client.userId,
              email: client.email,
            };

            return {
              ...client,
              
              otherDetails,
              scopingDetails,
              user,
              // Map legacy status to new status if needed
              onboardingStatus: client.onboardingStatus,
            };
          }
        );

        setClients(processedClients);
        setFilteredClients(processedClients);

        // Handle pagination info
        if (response.data.count) {
          setTotalPages(Math.ceil(response.data.count / pageSize));
        } else {
          setTotalPages(Math.ceil(processedClients.length / pageSize));
        }
      } else {
        throw new Error(response.data.message || "Failed to fetch clients");
      }
    } catch (err: any) {
      console.error("Error fetching clients:", err);
      setError(err.message || "An error occurred while fetching clients");
      toast.error("Failed to load clients data");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteModel = (data: any) =>{
    setSelectedClient(data);
    setShowInviteModal(!showInviteModal);
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }

  // Handle discovery call invitation


  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(inviteFormData.scheduledDate < new Date().toISOString()){
      toast.error('Scheduled date cannot be less than current date');
      return;
    }
    if(inviteFormData.callLink === ''){
      toast.error('Call link is required');
      return;
    }
    if (!selectedClient) return;

    try {
      setLoading(true);

      const response = await api.post(
        `/api/clients/${selectedClient.id}/invite`,
        {
          callLink: inviteFormData.callLink,
          scheduledDate: inviteFormData.scheduledDate,
        }
      );

      if (response.data.success) {
        toast.success("Discovery call invitation sent successfully");

        // Update client in the list
        fetchClients(); // Refetch to get updated data
        setShowInviteModal(false);
        resetFormStates();
      } else {
        throw new Error(response.data.message || "Failed to send invitation");
      }
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      toast.error(err.message || "Failed to send invitation");
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

      const response = await api.post(
        `/api/clients/${selectedClient.id}/discovery-status`,
        {
          status: statusFormData.status,
          notes: statusFormData.notes,
        }
      );

      if (response.data.success) {
        toast.success("Discovery call status updated successfully");

        // Update client in the list
        fetchClients(); // Refetch to get updated data
        setShowStatusModal(false);
        resetFormStates();
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
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
      const response = await api.post(
        `/api/clients/${selectedClient.id}/scoping`,
        {
          scopingDetails: scopingFormData.scopingDetails,
          notes: scopingFormData.notes,
        }
      );

      if (response.data.success) {
        toast.success("Scoping details updated successfully");

        // Update client in the list
        fetchClients(); // Refetch to get updated data
        setShowScopingModal(false);
        resetFormStates();
      } else {
        throw new Error(
          response.data.message || "Failed to update scoping details"
        );
      }
    } catch (err: any) {
      console.error("Error updating scoping details:", err);
      toast.error(err.message || "Failed to update scoping details");
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
    setInviteFormData({ callLink: "", scheduledDate: "" });
    setStatusFormData({ status: "completed", notes: "" });
    setScopingFormData({ scopingDetails: {}, notes: "" });
    setRejectFormData({ reason: "" });
  };


  // Render component
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Clients</h1>
          <p className="text-gray-400 mt-1">
            Manage and monitor client onboarding
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Total Clients</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {clients.length}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Onboarded</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {
              clients.filter((c) =>
                ["ONBOARDED", "COMPLETED"].includes(c.onboardingStatus)
              ).length
            }
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">
              Pending Discovery
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {
              clients.filter((c) =>
                ["PENDING_DISCOVERY", "NOT_STARTED"].includes(
                  c.onboardingStatus
                )
              ).length
            }
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">
              New This Month
            </h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {
              clients.filter((c) => {
                const createdDate = new Date(c.createdAt);
                const now = new Date();
                return (
                  createdDate.getMonth() === now.getMonth() &&
                  createdDate.getFullYear() === now.getFullYear()
                );
              }).length
            }
          </p>
        </div>
      </div>

    
            
      <ClientsTable
        columns={["fullName", "organization", "email", "requestedServices", "onboardingStatus", "Actions"]}
        data={clients}
        header={["Client", "Company", "Email", "Services", "Status", "Actions"]}
        pagination={true}
        pageSize={10}
        pageNumber={1}
        totalPages={1}
        totalItems={1}
        onPageChange={() => {}}
        onPageSizeChange={() => {}}
        searchQuery={searchTerm}
        onSearchChange={handleSearch}
        onboardingStatus={onboardingStatus}
        setOnboardingStatus={setOnboardingStatus}
        fetchClients={fetchClients}
        handleInviteModel={handleInviteModel}
        
      />
     
      {/* Discovery Call Invitation Modal */}
      {showInviteModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1a1f2b] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">
              Invite {selectedClient.fullName} for Discovery Call
            </h3>
            <form onSubmit={(e)=>handleInviteSubmit(e)}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Call Link
                  </label>
                  <input
                    type="url"
                    value={inviteFormData.callLink}
                    onChange={(e) =>
                      setInviteFormData({
                        ...inviteFormData,
                        callLink: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setInviteFormData({
                        ...inviteFormData,
                        scheduledDate: e.target.value,
                      })
                    }
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
                  {loading ? "Sending..." : "Send Invitation"}
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
                    onChange={(e) =>
                      setStatusFormData({
                        ...statusFormData,
                        status: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setStatusFormData({
                        ...statusFormData,
                        notes: e.target.value,
                      })
                    }
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
                  {loading ? "Updating..." : "Update Status"}
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
                        {service.replace(/_/g, " ")} Scope
                      </label>
                      <textarea
                        value={scopingFormData?.scopingDetails[service] || ""}
                        onChange={(e) =>
                          setScopingFormData({
                            ...scopingFormData,
                            scopingDetails: {
                              ...scopingFormData.scopingDetails,
                              [service]: e.target.value,
                            },
                          })
                        }
                        rows={3}
                        className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter scoping details for ${service.replace(
                          /_/g,
                          " "
                        )}...`}
                      />
                    </div>
                  ))}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={scopingFormData.notes || ""}
                    onChange={(e) =>
                      setScopingFormData({
                        ...scopingFormData,
                        notes: e.target.value,
                      })
                    }
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
                  {loading ? "Saving..." : "Save Scoping Details"}
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



