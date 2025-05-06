import React, { useState, useEffect, Fragment } from 'react';
import api from '../../service/apiService';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'TO_DO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  consultantId: string;
  consultant: {
    id: string;
    name: string;
    email: string;
  };
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
}

interface Consultant {
  id: string;
  name: string;
  email: string;
}

// Compute dynamic dates for dummy tasks
const now = new Date();
const formatISO = (date: Date) => date.toISOString().split('T')[0];

// Add dummy data to visualize UI
const DUMMY_PROJECTS: Project[] = [
  { id: 'p1', name: 'Project Alpha' },
  { id: 'p2', name: 'Project Beta' }
];
const DUMMY_CONSULTANTS: Consultant[] = [
  { id: 'c1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'c2', name: 'Bob Smith', email: 'bob@example.com' }
];
const DUMMY_TASKS: Task[] = [
  { id: 't1', title: 'Design UI Mockups', description: 'Create initial mockups', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)), status: 'TO_DO', priority: 'MEDIUM', consultantId: 'c1', consultant: { id: 'c1', name: 'Alice Johnson', email: '' }, projectId: 'p1', project: { id: 'p1', name: 'Project Alpha' }, phase: 'Planning' },
  { id: 't2', title: 'Develop API Endpoints', description: 'Implement backend APIs', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)), status: 'IN_PROGRESS', priority: 'HIGH', consultantId: 'c2', consultant: { id: 'c2', name: 'Bob Smith', email: '' }, projectId: 'p1', project: { id: 'p1', name: 'Project Alpha' }, phase: 'Development' },
  { id: 't3', title: 'Write Unit Tests', description: 'Ensure code coverage', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)), status: 'REVIEW', priority: 'LOW', consultantId: 'c1', consultant: { id: 'c1', name: 'Alice Johnson', email: '' }, projectId: 'p2', project: { id: 'p2', name: 'Project Beta' }, phase: 'Testing' },
  { id: 't4', title: 'Deploy to Production', description: 'Release new version', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4)), status: 'DONE', priority: 'URGENT', consultantId: 'c2', consultant: { id: 'c2', name: 'Bob Smith', email: '' }, projectId: 'p2', project: { id: 'p2', name: 'Project Beta' }, phase: 'Deployment' }
];

const Tasks: React.FC = () => {
  // Initialize state with dummy data
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(DUMMY_TASKS);
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);
  const [consultants, setConsultants] = useState<Consultant[]>(DUMMY_CONSULTANTS);
  const [loading, setLoading] = useState(false);
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

  // Remove API fetch; state is initialized with dummy data
  useEffect(() => {
    // const fetchData = async () => {
    //   setLoading(true);
    //   try {
    //     const [tasksRes, projectsRes, consultantsRes] = await Promise.all([
    //       api.get('/api/tasks'),
    //       api.get('/api/projects'),
    //       api.get('/api/consultants')
    //     ]);
        
    //     setTasks(tasksRes.data);
    //     setFilteredTasks(tasksRes.data);
    //     setProjects(projectsRes.data);
    //     setConsultants(consultantsRes.data);
    //     setError(null);
    //   } catch (err) {
    //     setError('Failed to load tasks. Please try again later.');
    //     console.error('Error fetching task data:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchData();
  }, []);
  
  // Apply filters when filter criteria change
  useEffect(() => {
    let filtered = [...tasks];
    if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === selectedProject);
    }
    if (selectedConsultant) {
      filtered = filtered.filter(task => task.consultantId === selectedConsultant);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task => task.title.toLowerCase().includes(term) || task.description.toLowerCase().includes(term));
    }
    setFilteredTasks(filtered);
  }, [tasks, selectedProject, selectedConsultant, searchTerm]);
  
  // Task CRUD operations
  const createTask = async () => {
    try {
      const response = await api.post('/api/tasks', newTask);
      setTasks([...tasks, response.data]);
      setShowModal(false);
      setNewTask({
        title: '',
        description: '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'TO_DO',
        priority: 'MEDIUM',
        consultantId: '',
        projectId: ''
      });
    } catch (err) {
      setError('Failed to create task. Please try again.');
      console.error('Error creating task:', err);
    }
  };
  
  const updateTask = async (taskId: string, updatedData: Partial<Task>) => {
    try {
      const response = await api.put(`/api/tasks/${taskId}`, updatedData);
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...response.data } : task
      );
      setTasks(updatedTasks);
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task. Please try again.');
      console.error('Error updating task:', err);
    }
  };
  
  const deleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/api/tasks/${taskId}`);
        setTasks(tasks.filter(task => task.id !== taskId));
      } catch (err) {
        setError('Failed to delete task. Please try again.');
        console.error('Error deleting task:', err);
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Check if due date is past
  const isDueDatePast = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    return taskDueDate < today;
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
              <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      {
      error ? (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-[#1a1f2b] rounded-xl shadow-lg overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[#242935] border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Consultant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phase</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-gray-400">
                    No tasks found. Try adjusting your filters or create a new task.
                  </td>
                </tr>
              ) : (
                (() => {
                  const phases = Array.from(new Set(filteredTasks.map(t => t.phase)));
                  return phases.map(phase => (
                    <Fragment key={phase}>
                      <tr>
                        <td colSpan={8} className="bg-[#242935] px-6 py-3 text-sm font-medium text-gray-300">{phase}</td>
                      </tr>
                      {filteredTasks.filter(t => t.phase === phase).map(task => (
                        <tr key={task.id} className="hover:bg-[#242935]">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-200">{task.title}</span>
                              <span className="text-sm text-gray-400">{task.description.length > 50 ? `${task.description.substring(0, 50)}...` : task.description}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className="px-6 py-4 whitespace-nowrap">
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
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDueDatePast(task.dueDate) && task.status !== 'DONE' ? 'text-red-400' : 'text-gray-300'}`}>
                            {formatDate(task.dueDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {task.consultant?.name || 'Unassigned'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {task.project?.name || 'No Project'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {task.phase}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-3">
                              <button 
                                onClick={() => {
                                  setEditingTask(task);
                                  setShowModal(true);
                                }}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => deleteTask(task.id)}
                                className="text-red-400 hover:text-red-300"
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
                })()
              )}
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
                    updateTask(editingTask.id, newTask);
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
                      value={editingTask ? editingTask.description : newTask.description}
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
                        value={editingTask ? editingTask.dueDate : newTask.dueDate}
                        onChange={(e) => {
                          if (editingTask) {
                            setEditingTask({...editingTask, dueDate: e.target.value});
                          } else {
                            setNewTask({...newTask, dueDate: e.target.value});
                          }
                        }}
                        required
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
                    <label className="block text-sm font-medium text-gray-400 mb-1">Assign Consultant</label>
                    <select
                      value={editingTask ? editingTask.consultantId : newTask.consultantId}
                      onChange={(e) => {
                        if (editingTask) {
                          setEditingTask({...editingTask, consultantId: e.target.value});
                        } else {
                          setNewTask({...newTask, consultantId: e.target.value});
                        }
                      }}
                      required
                      className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Consultant</option>
                      {consultants.map(consultant => (
                        <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
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
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
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