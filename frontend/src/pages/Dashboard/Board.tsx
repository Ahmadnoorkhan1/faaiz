import React, { useState, useEffect } from 'react';
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

interface TaskColumn {
  id: string;
  title: string;
  tasks: Task[];
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

// Dummy data for UI preview
const DUMMY_PROJECTS: Project[] = [
  { id: 'p1', name: 'Project Alpha' },
  { id: 'p2', name: 'Project Beta' }
];
const DUMMY_CONSULTANTS: Consultant[] = [
  { id: 'c1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'c2', name: 'Bob Smith', email: 'bob@example.com' }
];
const DUMMY_TASKS: Task[] = [
  { id: 't1', title: 'Design UI Mockups', description: 'Initial user flows & wireframes', dueDate: '2023-08-10', status: 'TO_DO', priority: 'MEDIUM', consultantId: 'c1', consultant: { id: 'c1', name: 'Alice Johnson', email: '' }, projectId: 'p1', project: { id: 'p1', name: 'Project Alpha' }, phase: 'Planning' },
  { id: 't2', title: 'Develop API Endpoints', description: 'Implement CRUD endpoints', dueDate: '2023-08-12', status: 'IN_PROGRESS', priority: 'HIGH', consultantId: 'c2', consultant: { id: 'c2', name: 'Bob Smith', email: '' }, projectId: 'p1', project: { id: 'p1', name: 'Project Alpha' }, phase: 'Development' },
  { id: 't3', title: 'Write Unit Tests', description: 'Ensure 80% coverage', dueDate: '2023-08-15', status: 'REVIEW', priority: 'LOW', consultantId: 'c1', consultant: { id: 'c1', name: 'Alice Johnson', email: '' }, projectId: 'p2', project: { id: 'p2', name: 'Project Beta' }, phase: 'Testing' },
  { id: 't4', title: 'Deploy to Production', description: 'Release v1.0', dueDate: '2023-08-18', status: 'DONE', priority: 'URGENT', consultantId: 'c2', consultant: { id: 'c2', name: 'Bob Smith', email: '' }, projectId: 'p2', project: { id: 'p2', name: 'Project Beta' }, phase: 'Deployment' }
];

const Board: React.FC = () => {
  // Initialize with dummy data - will be overwritten by filter effect
  const [columns, setColumns] = useState<TaskColumn[]>([]);
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);
  const [consultants, setConsultants] = useState<Consultant[]>(DUMMY_CONSULTANTS);
  const [loading, setLoading] = useState(false);
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
    // On mount, also group DUMMY_TASKS for initial render
    const initialColumns: TaskColumn[] = [
      { id: 'TO_DO', title: 'To Do', tasks: DUMMY_TASKS.filter(t => t.status === 'TO_DO') },
      { id: 'IN_PROGRESS', title: 'In Progress', tasks: DUMMY_TASKS.filter(t => t.status === 'IN_PROGRESS') },
      { id: 'REVIEW', title: 'Review', tasks: DUMMY_TASKS.filter(t => t.status === 'REVIEW') },
      { id: 'DONE', title: 'Done', tasks: DUMMY_TASKS.filter(t => t.status === 'DONE') }
    ];
    setColumns(initialColumns);
  }, []);

  // Update columns when filters change
  useEffect(() => {
    // const fetchData = async () => {
    //   setLoading(true);
    //   try {
    //     const [tasksRes, projectsRes, consultantsRes] = await Promise.all([
    //       api.get('/api/tasks'),
    //       api.get('/api/projects'),
    //       api.get('/api/consultants')
    //     ]);
        
    //     // Group tasks by status
    //     const tasks = tasksRes.data;
    //     const groupedTasks = columns.map(column => ({
    //       ...column,
    //       tasks: tasks.filter((task: Task) => {
    //         let matches = task.status === column.id;
            
    //         if (selectedProject && task.projectId !== selectedProject) {
    //           matches = false;
    //         }
            
    //         if (selectedConsultant && task.consultantId !== selectedConsultant) {
    //           matches = false;
    //         }
            
    //         return matches;
    //       })
    //     }));
        
    //     setColumns(groupedTasks);
    //     setProjects(projectsRes.data);
    //     setConsultants(consultantsRes.data);
    //     setError(null);
    //   } catch (err) {
    //     setError('Failed to load tasks. Please try again later.');
    //     console.error('Error fetching board data:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchData();
    const filteredTasks = DUMMY_TASKS.filter(task => {
      let matches = true;
      if (selectedProject && task.projectId !== selectedProject) matches = false;
      if (selectedConsultant && task.consultantId !== selectedConsultant) matches = false;
      return matches;
    });
    const grouped: TaskColumn[] = [
      { id: 'TO_DO', title: 'To Do', tasks: filteredTasks.filter(t => t.status === 'TO_DO') },
      { id: 'IN_PROGRESS', title: 'In Progress', tasks: filteredTasks.filter(t => t.status === 'IN_PROGRESS') },
      { id: 'REVIEW', title: 'Review', tasks: filteredTasks.filter(t => t.status === 'REVIEW') },
      { id: 'DONE', title: 'Done', tasks: filteredTasks.filter(t => t.status === 'DONE') }
    ];
    setColumns(grouped);
  }, [selectedProject, selectedConsultant]);

  // Update task status on drag and drop
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // local update for dummy
    setColumns(cols => cols.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => t.id !== taskId)
    })).map(col => col.id === newStatus ? {
      ...col,
      tasks: [...col.tasks, ...DUMMY_TASKS.filter(t => t.id === taskId).map(t => ({...t, status: newStatus as Task['status']}))]
    } : col));
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDueDate = new Date(dueDate);
    taskDueDate.setHours(0, 0, 0, 0);
    const diffTime = taskDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Get avatar initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
              <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      {
       error ? (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      ) : (
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
              
              <div className="flex-1 min-h-[70vh] space-y-6 overflow-y-auto">
                {column.tasks.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-700 rounded-lg h-24 flex items-center justify-center text-gray-500 text-sm">
                    No tasks in this column
                  </div>
                ) : (
                  (() => {
                    const phases = Array.from(new Set(column.tasks.map(t => t.phase)));
                    return phases.map(phase => (
                      <div key={phase} className="space-y-2">
                        <div className="px-2 py-1 bg-[#242935] text-gray-300 text-sm font-medium rounded">
                          {phase}
                        </div>
                        {column.tasks
                          .filter(t => t.phase === phase)
                          .map(task => (
                            <div
                              key={task.id}
                              id={`task-${task.id}`}
                              className="bg-[#242935] rounded-lg p-4 shadow cursor-pointer"
                              draggable
                              onDragStart={e => handleDragStart(e, task.id)}
                              onClick={() => {
                                setSelectedTask(task);
                                setShowModal(true);
                              }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-gray-200 flex-1">{task.title}</h3>
                                <span className={`${getPriorityBadgeClass(task.priority)} rounded-full px-2 py-0.5 text-xs ml-2`}>
                                  {task.priority}
                                </span>
                              </div>
                              
                              <p className="text-gray-400 text-sm mb-3 line-clamp-2">{task.description}</p>
                              
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                  {task.project?.name || 'No Project'}
                                </div>
                                <div className="flex items-center space-x-1">
                                  {task.consultant && (
                                    <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs">
                                      {getInitials(task.consultant.name)}
                                    </div>
                                  )}
                                  <div className={`text-xs ${getDaysRemaining(task.dueDate) < 0 ? 'text-red-400' : getDaysRemaining(task.dueDate) <= 2 ? 'text-orange-400' : 'text-gray-400'}`}>
                                    {getDaysRemaining(task.dueDate) === 0 ? 'Due today' : 
                                     getDaysRemaining(task.dueDate) > 0 ? `${getDaysRemaining(task.dueDate)}d left` : 
                                     `${Math.abs(getDaysRemaining(task.dueDate))}d overdue`}
                                  </div>
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
      {showModal && selectedTask && (
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
                        {selectedTask.title}
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
                        {selectedTask.description}
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
                          {selectedTask.consultant && (
                            <>
                              <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs mr-2">
                                {getInitials(selectedTask.consultant.name)}
                              </div>
                              <span className="text-sm text-gray-400">
                                {selectedTask.consultant.name}
                              </span>
                            </>
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