import React, { useState, useEffect, Fragment } from 'react';
import api from '../../service/apiService';
import toast from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  startDate: string | null;
  status: 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  consultantId: string | null;
  consultant: {
    id: string;
    email: string;
    consultantProfile?: {
      contactFirstName: string;
      contactLastName: string;
    };
  } | null;
  projectId: string;
  project: {
    id: string;
    name: string;
  };
  phase: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
  clientId: string;
  consultantId: string;
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
}

interface Consultant {
  id: string;
  userId: string;
  email: string;
  contactFirstName: string;
  contactLastName: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

const Tasks: React.FC = () => {
  // Initialize state with empty arrays, not dummy data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'TO_DO',
    priority: 'MEDIUM',
    consultantId: '',
    projectId: ''
  });

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tasksRes, projectsRes, consultantsRes] = await Promise.all([
          api.get('/api/tasks'),
          api.get('/api/projects'),
          api.get('/api/consultants')
        ]);
        
        // Validate API responses
        if (!tasksRes.data?.success || !projectsRes.data?.success || !consultantsRes.data?.success) {
          throw new Error('Invalid API response format');
        }
        
        // Process and set data
        setTasks(tasksRes.data.data || []);
        setFilteredTasks(tasksRes.data.data || []);
        setProjects(projectsRes.data.data || []);
        
        // Transform consultant data to match component needs
        const processedConsultants = consultantsRes.data.data.map((consultant: any) => ({
          id: consultant.id,
          userId: consultant.userId,
          email: consultant.email,
          contactFirstName: consultant.contactFirstName,
          contactLastName: consultant.contactLastName,
          user: consultant.user
        }));
        
        setConsultants(processedConsultants);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching task data:', err);
        setError('Failed to load tasks. Please try again later.');
        toast.error('Failed to load tasks: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters when filter criteria change
  useEffect(() => {
    if (tasks.length === 0) return;
    
    let filtered = [...tasks];
    if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === selectedProject);
    }
    if (selectedConsultant) {
      filtered = filtered.filter(task => task.consultantId === selectedConsultant);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        (task.title?.toLowerCase().includes(term)) || 
        (task.description?.toLowerCase().includes(term))
      );
    }
    setFilteredTasks(filtered);
  }, [tasks, selectedProject, selectedConsultant, searchTerm]);
  
  // Task CRUD operations
  const createTask = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/tasks', newTask);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to create task');
      }
      
      setTasks(prevTasks => [...prevTasks, response.data.data]);
      setShowModal(false);
      toast.success('Task created successfully');
      
      // Reset form
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'TO_DO',
        priority: 'MEDIUM',
        consultantId: '',
        projectId: ''
      });
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error('Failed to create task: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
      setLoading(true);
      const response = await api.put(`/api/tasks/${taskId}`, updatedData);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update task');
      }
      
      // Update the task in state
      setTasks(prevTasks => 
        prevTasks.map(task => task.id === taskId ? { ...task, ...response.data.data } : task)
      );
      
      setEditingTask(null);
      toast.success('Task updated successfully');
    } catch (err: any) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        const response = await api.delete(`/api/tasks/${taskId}`);
        
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to delete task');
        }
        
        // Remove task from state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        toast.success('Task deleted successfully');
      } catch (err: any) {
        console.error('Error deleting task:', err);
        toast.error('Failed to delete task: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle inline editing
  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    updateTask(taskId, { status: newStatus });
  };
  
  const handlePriorityChange = (taskId: string, newPriority: Task['priority']) => {
    updateTask(taskId, { priority: newPriority });
  };

  // Helpers for rendering
  const getPriorityBadgeClass = (priority: Task['priority']) => {
    switch (priority) {
      case 'LOW':
        return 'bg-gray-500/20 text-gray-400';
      case 'MEDIUM':
        return 'bg-blue-500/20 text-blue-400';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400';
      case 'URGENT':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const getStatusBadgeClass = (status: Task['status']) => {
    switch (status) {
      case 'TO_DO':
        return 'bg-gray-500/20 text-gray-400';
      case 'IN_PROGRESS':
        return 'bg-blue-500/20 text-blue-400';
      case 'REVIEW':
        return 'bg-purple-500/20 text-purple-400';
      case 'DONE':
        return 'bg-green-500/20 text-green-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };
  
  // Check if due date is past
  const isDueDatePast = (dueDate: string | null) => {
    if (!dueDate) return false;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDueDate = new Date(dueDate);
      taskDueDate.setHours(0, 0, 0, 0);
      return taskDueDate < today;
    } catch {
      return false;
    }
  };
  
  // Get consultant name from consultant object
  const getConsultantName = (consultant: Task['consultant']) => {
    if (!consultant) return 'Unassigned';
    if (consultant.consultantProfile) {
      return `${consultant.consultantProfile.contactFirstName} ${consultant.consultantProfile.contactLastName}`;
    }
    return consultant.email || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Tasks</h1>
          <p className="text-gray-400 mt-1">Manage and track project tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search tasks..."
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
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#242935] text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <select
            value={selectedConsultant}
            onChange={(e) => setSelectedConsultant(e.target.value)}
            className="bg-[#242935] text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
          >
            <option value="">All Consultants</option>
            {consultants.map(consultant => (
              <option key={consultant.userId} value={consultant.userId}>
                {consultant.contactFirstName} {consultant.contactLastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-[#1a1f2b] rounded-xl shadow-lg flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredTasks.length === 0 && (
        <div className="bg-[#1a1f2b] rounded-xl shadow-lg">
          <div className="px-6 py-10 text-center text-gray-400">
            <div className="flex justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks found</h3>
            <p>Try adjusting your filters or create a new task to get started.</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Create New Task
            </button>
          </div>
        </div>
      )}

      {/* Tasks Table */}
     {!loading && !error && filteredTasks.length > 0 && (
  <div className="bg-[#1a1f2b] rounded-xl shadow-lg overflow-x-auto">
    <table className="min-w-full table-fixed">
      <thead className="bg-[#242935] border-b border-gray-700">
        <tr>
          <th className="w-48 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Task</th>
          <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
          <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Priority</th>
          <th className="w-36 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Due Date</th>
          <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Consultant</th>
          <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Project</th>
          <th className="w-36 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Phase</th>
          <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {(() => {
          const phases = Array.from(new Set(filteredTasks.map(t => t.phase || 'No Phase')));
          return phases.map(phase => (
            <Fragment key={phase}>
              <tr>
                <td colSpan={8} className="bg-[#242935] px-4 py-3 text-sm font-medium text-gray-300">
                  {phase.length > 40 ? phase.substring(0,40) : phase}
                </td>
              </tr>
              {filteredTasks.filter(t => (t.phase || 'No Phase') === phase).map(task => (
                <tr key={task.id} className="hover:bg-[#242935]">
                  <td className="px-4 py-4 text-sm text-gray-200 truncate max-w-[12rem]">
                    <div className="relative group">
                      <span title={task.title}>{task.title.length > 30 ? `${task.title.substring(0, 30)}...` : task.title}</span>
                      {task.description && (
                        <div className="text-xs text-gray-400 truncate max-w-[11rem]" title={task.description}>
                          {task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                      className={`${getStatusBadgeClass(task.status)} rounded-full px-2.5 py-1 text-xs font-medium focus:outline-none bg-opacity-10`}
                    >
                      <option value="TO_DO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="REVIEW">Review</option>
                      <option value="DONE">Done</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    <select
                      value={task.priority}
                      onChange={(e) => handlePriorityChange(task.id, e.target.value as Task['priority'])}
                      className={`${getPriorityBadgeClass(task.priority)} rounded-full px-2.5 py-1 text-xs font-medium focus:outline-none bg-opacity-10`}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </td>
                  <td className={`px-4 py-4 text-sm ${
                    isDueDatePast(task.dueDate) && task.status !== 'DONE' ? 'text-red-400' : 'text-gray-300'
                  }`}>
                    {formatDate(task.dueDate)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 truncate max-w-[10rem]" title={getConsultantName(task.consultant)}>
                    {getConsultantName(task.consultant)}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 truncate max-w-[10rem]" title={task.project?.name || 'No Project'}>
                    {task.project?.name || 'No Project'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-300 truncate max-w-[8rem]" title={task.phase || 'No Phase'}>
                    {task.phase || 'No Phase'}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => {
                          setEditingTask(task);
                          setShowModal(true);
                        }}
                        className="text-blue-400 hover:text-blue-300"
                        title="Edit Task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete Task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </Fragment>
          ));
        })()}
      </tbody>
    </table>
  </div>
)}

      

      {/* Task Modal - Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-black/70 transition-opacity" onClick={() => {
              setShowModal(false);
              setEditingTask(null);
            }}></div>
            <div 
              className="inline-block align-bottom bg-[#1a1f2b] rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1a1f2b] px-4 pt-5 pb-4 sm:p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-200">
                    {editingTask ? 'Edit Task' : 'Create New Task'}
                  </h3>
                </div>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  if (editingTask) {
                    const updatedTask = {
                      title: editingTask.title,
                      description: editingTask.description,
                      dueDate: editingTask.dueDate,
                      status: editingTask.status,
                      priority: editingTask.priority,
                      consultantId: editingTask.consultantId,
                      projectId: editingTask.projectId,
                      phase: editingTask.phase
                    };
                    updateTask(editingTask.id, updatedTask);
                  } else {
                    createTask();
                  }
                }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editingTask ? editingTask.title : newTask.title}
                      onChange={(e) => {
                        if (editingTask) {
                          setEditingTask({...editingTask, title: e.target.value});
                        } else {
                          setNewTask({...newTask, title: e.target.value});
                        }
                      }}
                      required
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                    <textarea
                      value={editingTask ? editingTask.description || '' : newTask.description || ''}
                      onChange={(e) => {
                        if (editingTask) {
                          setEditingTask({...editingTask, description: e.target.value});
                        } else {
                          setNewTask({...newTask, description: e.target.value});
                        }
                      }}
                      rows={3}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                      <input
                        type="date"
                        value={editingTask ? editingTask.dueDate || '' : newTask.dueDate || ''}
                        onChange={(e) => {
                          if (editingTask) {
                            setEditingTask({...editingTask, dueDate: e.target.value});
                          } else {
                            setNewTask({...newTask, dueDate: e.target.value});
                          }
                        }}
                        className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                      <select
                        value={editingTask ? editingTask.priority : newTask.priority}
                        onChange={(e) => {
                          if (editingTask) {
                            setEditingTask({...editingTask, priority: e.target.value as Task['priority']});
                          } else {
                            setNewTask({...newTask, priority: e.target.value as Task['priority']});
                          }
                        }}
                        className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="URGENT">Urgent</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                      <select
                        value={editingTask ? editingTask.status : newTask.status}
                        onChange={(e) => {
                          if (editingTask) {
                            setEditingTask({...editingTask, status: e.target.value as Task['status']});
                          } else {
                            setNewTask({...newTask, status: e.target.value as Task['status']});
                          }
                        }}
                        className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="TO_DO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
                      <select
                        value={editingTask ? editingTask.projectId : newTask.projectId}
                        onChange={(e) => {
                          if (editingTask) {
                            setEditingTask({...editingTask, projectId: e.target.value});
                          } else {
                            setNewTask({...newTask, projectId: e.target.value});
                          }
                        }}
                        required
                        className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Phase</label>
                    <input
                      type="text"
                      value={editingTask ? editingTask.phase || '' : newTask.phase || ''}
                      onChange={(e) => {
                        if (editingTask) {
                          setEditingTask({...editingTask, phase: e.target.value});
                        } else {
                          setNewTask({...newTask, phase: e.target.value});
                        }
                      }}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Planning, Development, Testing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Assign Consultant</label>
                    <select
                      value={editingTask ? editingTask.consultantId || '' : newTask.consultantId || ''}
                      onChange={(e) => {
                        if (editingTask) {
                          setEditingTask({...editingTask, consultantId: e.target.value || null});
                        } else {
                          setNewTask({...newTask, consultantId: e.target.value || null});
                        }
                      }}
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {consultants.map(consultant => (
                        <option key={consultant.userId} value={consultant.userId}>
                          {consultant.contactFirstName} {consultant.contactLastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setEditingTask(null);
                      }}
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
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        editingTask ? 'Update Task' : 'Create Task'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;