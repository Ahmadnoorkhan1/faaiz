import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';

interface Client {
  id: string;
  email: string;
  name: string;
  company: string;
  assignedProjects: number;
  projects: any[];
  status: string;
  phone: string;
  createdAt: string;
}

const ClientsList: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/clients');
        setClients(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError('Failed to load clients. Please try again later.');
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    
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

  const getClientInitials = (name: string) => {
    if (!name || name === 'N/A') return '?';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0);
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Clients</h1>
          <p className="text-gray-400 mt-1">Manage and monitor client relationships</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add New Client
        </button>
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
            <h3 className="text-gray-400 text-sm font-medium">Active Clients</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {clients.filter(c => c.status === 'COMPLETED').length}
          </p>
        </div>
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400 text-sm font-medium">Total Projects</h3>
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-200">
            {clients.reduce((total, client) => total + client.assignedProjects, 0)}
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

      {/* Clients Table */}
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
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Client</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Company</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Assigned Projects</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Account Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#242935] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                            {getClientInitials(client.name)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-200">{client.name}</div>
                            <div className="text-xs text-gray-400">{client.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-200">{client.company}</td>
                      <td className="px-6 py-4 text-gray-200">{client.email}</td>
                      <td className="px-6 py-4 text-gray-200">{client.assignedProjects}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${getStatusBadgeClass(client.status)}`}>
                          {client.status.replace('_', ' ')}
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
                      No clients found. Try adjusting your search or filters.
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

export default ClientsList; 