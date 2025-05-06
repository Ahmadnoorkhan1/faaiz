import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../service/apiService';
import { format } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate: string;
  endDate?: string;
  client?: {
    id: string;
    email: string;
    clientProfile?: {
      fullName: string;
      organization: string;
    };
  };
  consultant?: {
    id: string;
    email: string;
    consultantProfile?: {
      contactFirstName: string;
      contactLastName: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/projects');
        setProjects(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteProject = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/api/projects/${id}`);
        setProjects(projects.filter(project => project.id !== id));
      } catch (err) {
        console.error('Error deleting project:', err);
        setError('Failed to delete project. Please try again.');
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client?.clientProfile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.consultant?.consultantProfile?.contactFirstName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500';
      case 'COMPLETED':
        return 'bg-blue-500/10 text-blue-500';
      case 'ON_HOLD':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'dd MMM yyyy');
  };

  const getConsultantName = (project: Project) => {
    if (!project.consultant) return 'N/A';
    if (project.consultant.consultantProfile) {
      const { contactFirstName, contactLastName } = project.consultant.consultantProfile;
      return `${contactFirstName} ${contactLastName}`;
    }
    return project.consultant.email;
  };

  const getClientName = (project: Project) => {
    if (!project.client) return 'N/A';
    if (project.client.clientProfile) {
      return project.client.clientProfile.fullName;
    }
    return project.client.email;
  };

  const getClientCompany = (project: Project) => {
    if (!project.client || !project.client.clientProfile) return 'N/A';
    return project.client.clientProfile.organization;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Projects</h1>
          <p className="text-gray-400 mt-1">Manage and monitor all projects</p>
        </div>
        <button 
          onClick={() => navigate('/project/new')} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add New Project
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search projects..."
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
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
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
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Project Name</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Status</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Consultant</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Client</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Start Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">End Date</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProjects.length > 0 ? (
                  filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-[#242935] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-200">{project.name}</div>
                            {project.description && (
                              <div className="text-xs text-gray-400">{project.description.substring(0, 50)}{project.description.length > 50 ? '...' : ''}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-200">{getConsultantName(project)}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-200">{getClientName(project)}</div>
                        <div className="text-xs text-gray-400">{getClientCompany(project)}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-200">{formatDate(project.startDate)}</td>
                      <td className="px-6 py-4 text-gray-200">{formatDate(project.endDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => navigate(`/project/${project.id}`)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => navigate(`/project/${project.id}/edit`)}
                            className="text-yellow-500 hover:text-yellow-400"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-500 hover:text-red-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-400">
                      No projects found. Try adjusting your search or filters.
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

export default Projects; 