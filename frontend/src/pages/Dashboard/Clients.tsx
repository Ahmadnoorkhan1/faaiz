import React, { useState } from 'react';

const Clients: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const clients = [
    {
      id: 1,
      name: 'Tech Solutions Inc.',
      industry: 'Technology',
      status: 'active',
      projects: 3,
      lastActivity: '2 hours ago',
      image: 'T'
    },
    {
      id: 2,
      name: 'Global Innovations Ltd.',
      industry: 'Manufacturing',
      status: 'inactive',
      projects: 1,
      lastActivity: '2 days ago',
      image: 'G'
    },
    {
      id: 3,
      name: 'Digital Systems Corp.',
      industry: 'IT Services',
      status: 'active',
      projects: 5,
      lastActivity: '1 hour ago',
      image: 'D'
    },
    {
      id: 4,
      name: 'Future Analytics',
      industry: 'Data Analytics',
      status: 'pending',
      projects: 2,
      lastActivity: '5 hours ago',
      image: 'F'
    }
  ];

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.industry.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const metrics = [
    {
      title: 'Total Clients',
      value: '89',
      change: '+12',
      trend: 'up'
    },
    {
      title: 'Active Projects',
      value: '156',
      change: '+8',
      trend: 'up'
    },
    {
      title: 'Avg. Response Time',
      value: '2.4h',
      change: '-0.5h',
      trend: 'down'
    },
    {
      title: 'Client Satisfaction',
      value: '94%',
      change: '+2%',
      trend: 'up'
    }
  ];

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
        {metrics.map((metric, index) => (
          <div key={index} className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm font-medium">{metric.title}</h3>
              <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {metric.change}
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold text-gray-200">{metric.value}</p>
          </div>
        ))}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clients List */}
      <div className="bg-[#1a1f2b] rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left bg-[#242935]">
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Client</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Industry</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Status</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Projects</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Last Activity</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-[#242935] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {client.image}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-200">{client.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-200">{client.industry}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${client.status === 'active' ? 'bg-green-500/10 text-green-500' :
                        client.status === 'inactive' ? 'bg-red-500/10 text-red-500' :
                        'bg-yellow-500/10 text-yellow-500'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-200">{client.projects}</td>
                  <td className="px-6 py-4 text-gray-400">{client.lastActivity}</td>
                  <td className="px-6 py-4">
                    <button className="text-blue-500 hover:text-blue-400">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clients; 