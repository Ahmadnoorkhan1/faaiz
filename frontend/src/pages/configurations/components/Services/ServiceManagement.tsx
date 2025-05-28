import React, { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../../../../service/apiService';
import toast from 'react-hot-toast';
export interface Service {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  category?: string;
}
const ServiceManagement: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [newService, setNewService] = useState<CreateServiceDto>({
    name: '',
    description: '',
    category: ''
  });

  // Fetch all services
  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services');
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  // Create new service
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/services', newService);
      if (response.data.success) {
        setServices([...services, response.data.data]);
        // Reset form
        setNewService({ name: '', description: '', category: '' });
        toast.success('Service Created Successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service');
      toast.error('Something went wrong')
      
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  if (loading) return <div>Loading services...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-200">Service Management</h2>
      </div>

      {/* Create Service Form */}
      <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Create New Service</h3>
        <form onSubmit={handleCreateService} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={newService.name}
              onChange={handleInputChange}
              className="w-full bg-[#1a1f2b] text-gray-200 rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              value={newService.description}
              onChange={handleInputChange}
              className="w-full bg-[#1a1f2b] text-gray-200 rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={newService.category}
              onChange={handleInputChange}
              className="w-full bg-[#1a1f2b] text-gray-200 rounded-lg p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Service
            </button>
          </div>
        </form>
      </div>

      {/* Services List */}
      <div className="bg-[#242935] rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-medium text-gray-200 mb-4">Services List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className="bg-[#1a1f2b] border border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-200">{service.name}</h4>
              {service.description && (
                <p className="text-gray-400 text-sm mt-1">{service.description}</p>
              )}
              {service.category && (
                <p className="text-gray-500 text-xs mt-2">Category: {service.category}</p>
              )}
              <p className="text-gray-600 text-xs mt-2">
                Created: {new Date(service.createdAt).toLocaleDateString()}
              </p>
            
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;