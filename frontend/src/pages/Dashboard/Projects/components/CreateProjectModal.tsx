import React, { useState, useEffect } from 'react';
import api from '../../../../service/apiService';
import toast from 'react-hot-toast';

interface Client {
  id: string;
  email: string;
  clientProfile?: {
    fullName: string;
    organization: string;
  };
}

interface Consultant {
  id: string;
  email: string;
  consultantProfile?: {
    contactFirstName: string;
    contactLastName: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  clientId?: string;
  consultantId?: string;
  // Additional fields that the API might return
  createdAt: string;
  updatedAt: string;
}

interface CreateProjectModalProps {
  onClose: () => void;
  onProjectCreated: (project: Project) => void;
}

const PROJECT_STATUSES = [
  'PLANNING',
  'ACTIVE',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED'
];

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onProjectCreated }) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    projectStatus: 'PLANNING',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    clientId: '',
    consultantId: ''
  });
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data for dropdowns
  const [clients, setClients] = useState<Client[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  
  // Fetch clients and consultants on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsRes, consultantsRes] = await Promise.all([
          api.get('/api/clients'),
          api.get('/api/consultants')
        ]);
        
        setClients(clientsRes.data.data || []);
        setConsultants(consultantsRes.data.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        toast.error('Failed to load clients and consultants');
        setError('Failed to load clients and consultants. Please try again.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.name || !formData.startDate) {
        throw new Error('Project name and start date are required');
      }
      
      // Trim whitespace from all string values to prevent validation errors
      const trimmedData = Object.entries(formData).reduce((acc:any, [key, value]) => {
        // Only trim string values
        acc[key] = typeof value === 'string' ? value.trim() : value;
        return acc;
      }, {} as typeof formData);
      
      // Submit data to API
      const response = await api.post('/api/projects', trimmedData);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create project');
      }
      
      // Pass the created project back to parent
      onProjectCreated(response.data.data);
      
    } catch (err: any) {
      setLoading(false);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create project';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  // Prevent clicks inside the modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1f2b] rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={handleModalClick}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-200">Create New Project</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-400 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                />
              </div>
              
              {/* Project Status */}
              <div>
                <label htmlFor="projectStatus" className="block text-sm font-medium text-gray-400 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="projectStatus"
                  value={formData.projectStatus}
                  onChange={handleChange}
                  className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROJECT_STATUSES.map(status => (
                    <option key={status} value={status}>
                      {status.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-400 mb-1">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-400 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Client */}
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-gray-400 mb-1">
                  Client
                </label>
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.clientProfile?.fullName || client.email}
                      {client.clientProfile?.organization ? ` (${client.clientProfile.organization})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Consultant */}
              <div>
                <label htmlFor="consultantId" className="block text-sm font-medium text-gray-400 mb-1">
                  Consultant
                </label>
                <select
                  id="consultantId"
                  name="consultantId"
                  value={formData.consultantId}
                  onChange={handleChange}
                  className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a consultant</option>
                  {consultants.map((consultant:any) => (
                    <option key={consultant.userId} value={consultant.userId}>
                      {consultant.consultantProfile ? 
                        `${consultant.consultantProfile.contactFirstName} ${consultant.consultantProfile.contactLastName}` : 
                        consultant.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project description"
              />
            </div>
            
            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#242935] text-gray-300 rounded-lg hover:bg-[#2d3444] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectModal;