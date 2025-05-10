import React, { useState, useEffect } from 'react';
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

interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate: string;
  endDate?: string;
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

const Board: React.FC = () => {
  // Initialize with empty data - will be populated from API
  const [columns, setColumns] = useState<TaskColumn[]>([
    { id: 'TO_DO', title: 'To Do', tasks: [] },
    { id: 'IN_PROGRESS', title: 'In Progress', tasks: [] },
    { id: 'REVIEW', title: 'Review', tasks: [] },
    { id: 'DONE', title: 'Done', tasks: [] }
  ]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');

  // Drag state
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);

  // Task detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch initial board data on mount
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
        const fetchedTasks = tasksRes.data.data || [];
        setTasks(fetchedTasks);
        
        // Group tasks by status
        const initialColumns = [
          { id: 'TO_DO', title: 'To Do', tasks: fetchedTasks.filter((t:any) => t.status === 'TO_DO') },
          { id: 'IN_PROGRESS', title: 'In Progress', tasks: fetchedTasks.filter((t:any) => t.status === 'IN_PROGRESS') },
          { id: 'REVIEW', title: 'Review', tasks: fetchedTasks.filter((t:any) => t.status === 'REVIEW') },
          { id: 'DONE', title: 'Done', tasks: fetchedTasks.filter((t:any) => t.status === 'DONE') }
        ];
        setColumns(initialColumns);
        
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
        console.error('Error fetching board data:', err);
        setError('Failed to load tasks. Please try again later.');
        toast.error('Failed to load tasks: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update columns when filters change
  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Filter tasks based on selected filters
    const filteredTasks = tasks.filter(task => {
      let matches = true;
      if (selectedProject && task.projectId !== selectedProject) matches = false;
      if (selectedConsultant && task.consultantId !== selectedConsultant) matches = false;
      return matches;
    });
    
    // Group filtered tasks by status
    const newColumns = [
      { id: 'TO_DO', title: 'To Do', tasks: filteredTasks.filter(t => t.status === 'TO_DO') },
      { id: 'IN_PROGRESS', title: 'In Progress', tasks: filteredTasks.filter(t => t.status === 'IN_PROGRESS') },
      { id: 'REVIEW', title: 'Review', tasks: filteredTasks.filter(t => t.status === 'REVIEW') },
      { id: 'DONE', title: 'Done', tasks: filteredTasks.filter(t => t.status === 'DONE') }
    ];
    
    setColumns(newColumns);
  }, [tasks, selectedProject, selectedConsultant]);

  // Update task status on drag and drop
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      setLoading(true);
      
      // Optimistic update (update locally first)
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus as Task['status'] } : task
      );
      setTasks(updatedTasks);
      
      // Send update to server
      const response = await api.put(`/api/tasks/${taskId}`, { TaskStatus: newStatus });
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to update task status');
      }
      
      toast.success('Task status updated');
    } catch (err: any) {
      // Revert optimistic update on error
      setTasks(tasks); // Reset to original state
      console.error('Error updating task status:', err);
      toast.error(err.message || 'Failed to update task status');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggingTaskId(taskId);
    // Set a custom drag image (optional)
    const dragElement = document.getElementById(`task-${taskId}`);
    if (dragElement) {
      // Create a ghost element with fixed width
      const ghost = dragElement.cloneNode(true) as HTMLElement;
      ghost.style.width = '250px';
      ghost.style.opacity = '0.8';
      ghost.style.position = 'absolute';
      ghost.style.top = '-1000px';
      document.body.appendChild(ghost);
      
      e.dataTransfer.setDragImage(ghost, 125, 30);
      
      // Clean up after drag
      setTimeout(() => {
        document.body.removeChild(ghost);
      }, 0);
    }
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggingTaskId) {
      updateTaskStatus(draggingTaskId, columnId);
      setDraggingTaskId(null);
    }
  };
  
  // Get priority badge class
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
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDueDate = new Date(dueDate);
      taskDueDate.setHours(0, 0, 0, 0);
      const diffTime = taskDueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };
  
  // Get consultant name
  const getConsultantName = (consultant: Task['consultant']) => {
    if (!consultant) return 'Unassigned';
    if (consultant.consultantProfile) {
      return `${consultant.consultantProfile.contactFirstName} ${consultant.consultantProfile.contactLastName}`;
    }
    return consultant.email || 'Unknown';
  };
  
  // Get avatar initials
  const getInitials = (consultant: Task['consultant']) => {
    if (!consultant) return 'NA';
    if (consultant.consultantProfile) {
      return `${consultant.consultantProfile.contactFirstName[0]}${consultant.consultantProfile.contactLastName[0]}`.toUpperCase();
    }
    return consultant.email?.substring(0, 2).toUpperCase() || 'NA';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Board</h1>
          <p className="text-gray-400 mt-1">Visual task management board</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
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
      {loading && !error && (
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

      {/* Kanban Board */}
      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map(column => (
            <div 
              key={column.id}
              className="bg-[#1a1f2b] rounded-xl p-4 flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-200">{column.title}</h2>
                <div className="bg-[#242935] text-gray-400 text-xs rounded-full px-2 py-1">
                  {column.tasks.length}
                </div>
              </div>
              
              <div className="flex-1 min-h-[50vh] space-y-6 overflow-y-auto">
                {column.tasks.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center text-gray-500 text-sm">
                    No tasks in this column
                  </div>
                ) : (
                 (() => {
  const phases = Array.from(new Set(column.tasks.map(t => t.phase || 'No Phase')));
  return phases.map(phase => (
    <div key={phase} className="space-y-3">
      <div className="px-3 py-1.5 bg-[#2b2f3c] text-gray-300 text-sm font-semibold rounded">
        {phase}
      </div>
      {column.tasks
        .filter(t => (t.phase || 'No Phase') === phase)
        .map(task => (
          <div
            key={task.id}
            id={`task-${task.id}`}
            className="bg-[#1f2430] rounded-lg px-4 py-5 shadow-sm cursor-pointer transition-all duration-200 hover:bg-[#2a2f3c]"
            style={{ minHeight: '150px' }}
            draggable
            onDragStart={e => handleDragStart(e, task.id)}
            onClick={() => {
              setSelectedTask(task);
              setShowModal(true);
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-200 text-sm truncate w-3/4" title={task.title}>
                {task.title}
              </h3>
              <span className={`${getPriorityBadgeClass(task.priority)} rounded-full px-2 py-0.5 text-xs whitespace-nowrap`}>
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p className="text-gray-400 text-xs mb-4 line-clamp-3" title={task.description}>
                {task.description}
              </p>
            )}

            <div className="flex justify-between items-center text-xs text-gray-500">
              <span className="truncate w-1/2" title={task.project?.name || 'No Project'}>
                {task.project?.name || 'No Project'}
              </span>
              <div className="flex items-center space-x-2">
                {task.consultant && (
                  <div 
                    className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs"
                    title={getConsultantName(task.consultant)}
                  >
                    {getInitials(task.consultant)}
                  </div>
                )}
                {task.dueDate && getDaysRemaining(task.dueDate) !== null && (
                  <div className={`text-xs ${
                    getDaysRemaining(task.dueDate)! < 0 ? 'text-red-400' :
                    getDaysRemaining(task.dueDate)! <= 2 ? 'text-orange-400' :
                    'text-gray-400'
                  }`}>
                    {getDaysRemaining(task.dueDate) === 0 ? 'Due today' :
                     getDaysRemaining(task.dueDate)! > 0 ? `${getDaysRemaining(task.dueDate)}d left` :
                     `${Math.abs(getDaysRemaining(task.dueDate)!)}d overdue`}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
    </div>
  ));
})()

                )}
              </div>
              
              <button 
                className="mt-3 w-full py-2 bg-[#242935] hover:bg-[#2d3444] text-gray-400 rounded-lg transition-colors flex items-center justify-center"
                onClick={() => {
                  // Create a new empty task with this status
                  setSelectedTask(null);
                  setShowModal(true);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Task
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div 
              className="fixed inset-0 bg-black/70 transition-opacity" 
              onClick={() => {
                setShowModal(false);
                setSelectedTask(null);
              }}
            ></div>
            <div 
              className="inline-block align-bottom bg-[#1a1f2b] rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#1a1f2b] px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-200 mb-2">
                        {selectedTask ? selectedTask.title : 'Create New Task'}
                      </h3>
                      <button 
                        onClick={() => {
                          setShowModal(false);
                          setSelectedTask(null);
                        }}
                        className="text-gray-400 hover:text-gray-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    {selectedTask ? (
                      <>
                        <div className="flex items-center space-x-3 mb-4">
                          <span className={`${getPriorityBadgeClass(selectedTask.priority)} rounded-full px-2.5 py-1 text-xs`}>
                            {selectedTask.priority}
                          </span>
                          <span className="text-gray-400 text-sm">
                            Due: {formatDate(selectedTask.dueDate)}
                          </span>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-4 pb-3">
                          <p className="text-gray-300 whitespace-pre-wrap">
                            {selectedTask.description || 'No description provided'}
                          </p>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-4 pb-3">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium text-gray-300">Project</h4>
                            <span className="text-sm text-gray-400">
                              {selectedTask.project?.name || 'No Project'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-300">Assigned to</h4>
                            <div className="flex items-center">
                              {selectedTask.consultant ? (
                                <>
                                  <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-2">
                                    {getInitials(selectedTask.consultant)}
                                  </div>
                                  <span className="text-sm text-gray-400">
                                    {getConsultantName(selectedTask.consultant)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-400">Unassigned</span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-700 pt-4 flex justify-between">
                          <div>
                            <select
                              value={selectedTask.status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as Task['status'];
                                await updateTaskStatus(selectedTask.id, newStatus);
                                setSelectedTask({...selectedTask, status: newStatus});
                              }}
                              className="bg-[#242935] text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 text-sm"
                            >
                              <option value="TO_DO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="REVIEW">Review</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>
                          <div className="space-x-2">
                            <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                              Edit
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="py-4">
                        <p className="text-gray-400 mb-4">
                          Create a new task to add to your workflow.
                        </p>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                            <input
                              type="text"
                              className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Task title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                            <textarea
                              rows={3}
                              className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Task description"
                            ></textarea>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Due Date</label>
                              <input
                                type="date"
                                className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Priority</label>
                              <select
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
                              <label className="block text-sm font-medium text-gray-400 mb-1">Project</label>
                              <select
                                className="w-full bg-[#242935] text-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Project</option>
                                {projects.map(project => (
                                  <option key={project.id} value={project.id}>{project.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Consultant</label>
                              <select
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
                          </div>
                          <div className="pt-4 flex justify-end space-x-3 border-t border-gray-700">
                            <button
                              onClick={() => setShowModal(false)}
                              className="px-4 py-2 bg-[#242935] text-gray-300 rounded-lg hover:bg-[#2d3444]"
                            >
                              Cancel
                            </button>
                            <button
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                            >
                              Create Task
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Board;