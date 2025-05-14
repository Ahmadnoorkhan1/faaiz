import React, { useState, useEffect } from 'react';
import api from '../../../service/apiService';
import toast from 'react-hot-toast';
import ConsultantTable from './ConsultantManagement/ConsultantTable';
import StatusFilter from './ConsultantManagement/StatusFilter';
import InterviewInvitationModal from './ConsultantManagement/InterviewInvitationModal';
import ConsultantReviewModal from './ConsultantManagement/ConsultantReviewModal';
import ConsultantDetailModal from './ConsultantManagement/ConsultantDetailModal';
import { Consultant, ConsultantStatus } from '../../../types/consultant';

const ConsultantManagement: React.FC = () => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ConsultantStatus | 'ALL'>('ALL');
  
  // Selected consultant for operations
  const [selectedConsultant, setSelectedConsultant] = useState<Consultant | null>(null);
  
  // Modal states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch consultants
  useEffect(() => {
    fetchConsultants();
  }, []);

  // Filter consultants when status changes
  useEffect(() => {
    if (selectedStatus === 'ALL') {
      setFilteredConsultants(consultants);
    } else {
      setFilteredConsultants(
        consultants.filter(consultant => consultant.status === selectedStatus)
      );
    }
  }, [selectedStatus, consultants]);

  const fetchConsultants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/consultants');
      
      if (response.data.success) {
        setConsultants(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch consultants');
      }
    } catch (err: any) {
      console.error('Error fetching consultants:', err);
      setError(err.message || 'An error occurred while fetching consultants');
      toast.error('Failed to load consultants');
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

  const handleReviewClick = (consultant: Consultant) => {
    setSelectedConsultant(consultant);
    setShowReviewModal(true);
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

  const handleReviewSubmit = async (score: number, notes: string) => {
    if (!selectedConsultant) return;
    
    try {
      setLoading(true);
      const response = await api.post(`/api/consultants/${selectedConsultant.id}/review`, {
        score,
        notes
      });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Consultant reviewed successfully');
        
        // Update consultant in the list
        setConsultants(prevConsultants => 
          prevConsultants.map(c => 
            c.id === selectedConsultant.id ? response.data.data : c
          )
        );
        
        setShowReviewModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to submit review');
      }
    } catch (err: any) {
      console.error('Error submitting review:', err);
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-200">Consultant Management</h2>
      </div>

      {/* Status Filter */}
      <StatusFilter 
        selectedStatus={selectedStatus} 
        onStatusChange={handleStatusFilter} 
      />

      {/* Consultants Table */}
      <ConsultantTable 
        consultants={filteredConsultants}
        loading={loading}
        error={error}
        onViewDetails={handleViewDetails}
        onInvite={handleInviteClick}
        onReview={handleReviewClick}
      />

      {/* Modals */}
      {showDetailModal && selectedConsultant && (
        <ConsultantDetailModal
          consultant={selectedConsultant}
          onClose={() => setShowDetailModal(false)}
          onInvite={handleInviteClick}
          onReview={handleReviewClick}
        />
      )}

      {showInviteModal && selectedConsultant && (
        <InterviewInvitationModal
          consultant={selectedConsultant}
          onClose={() => setShowInviteModal(false)}
          onSubmit={handleInvitationSubmit}
        />
      )}

      {showReviewModal && selectedConsultant && (
        <ConsultantReviewModal
          consultant={selectedConsultant}
          onClose={() => setShowReviewModal(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
};

export default ConsultantManagement;