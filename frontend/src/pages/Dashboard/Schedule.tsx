import React, { useState, useEffect } from 'react';
import api from '../../service/apiService';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  startDate?: string;
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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}

type ViewMode = 'month' | 'week';

// Compute dynamic dates for dummy tasks
const now = new Date();
const formatISO = (date: Date) => date.toISOString().split('T')[0];

// Dummy data for UI preview with dynamic dates
const DUMMY_PROJECTS: Project[] = [
  { id: 'p1', name: 'Project Alpha' },
  { id: 'p2', name: 'Project Beta' }
];
const DUMMY_CONSULTANTS: Consultant[] = [
  { id: 'c1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'c2', name: 'Bob Smith', email: 'bob@example.com' }
];
const DUMMY_TASKS: Task[] = [
  { id: 't1', title: 'Design UI Mockups', description: 'Initial wireframes', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)), status: 'TO_DO', priority: 'MEDIUM', consultantId: 'c1', consultant: { id: 'c1', name: 'Alice Johnson', email: '' }, projectId: 'p1', project: { id: 'p1', name: 'Project Alpha' }, phase: 'Planning' },
  { id: 't2', title: 'Develop API Endpoints', description: 'Implement core CRUD', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2)), status: 'IN_PROGRESS', priority: 'HIGH', consultantId: 'c2', consultant: { id: 'c2', name: 'Bob Smith', email: '' }, projectId: 'p1', project: { id: 'p1', name: 'Project Alpha' }, phase: 'Development' },
  { id: 't3', title: 'Write Unit Tests', description: 'Ensure full coverage', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3)), status: 'REVIEW', priority: 'LOW', consultantId: 'c1', consultant: { id: 'c1', name: 'Alice Johnson', email: '' }, projectId: 'p2', project: { id: 'p2', name: 'Project Beta' }, phase: 'Testing' },
  { id: 't4', title: 'Deploy to Production', description: 'Release v1.0', dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4)), status: 'DONE', priority: 'URGENT', consultantId: 'c2', consultant: { id: 'c2', name: 'Bob Smith', email: '' }, projectId: 'p2', project: { id: 'p2', name: 'Project Beta' }, phase: 'Deployment' }
];

const Schedule: React.FC = () => {
  // Initialize state with dummy data
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(DUMMY_TASKS);
  const [projects, setProjects] = useState<Project[]>(DUMMY_PROJECTS);
  const [consultants, setConsultants] = useState<Consultant[]>(DUMMY_CONSULTANTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  // Filter state
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedConsultant, setSelectedConsultant] = useState<string>('');
  
  // Task detail modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Remove API fetch; using dummy data
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
    //     setProjects(projectsRes.data);
    //     setConsultants(consultantsRes.data);
    //     setError(null);
    //   } catch (err) {
    //     setError('Failed to load tasks. Please try again later.');
    //     console.error('Error fetching schedule data:', err);
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    
    // fetchData();
  }, []);

  // Filter tasks when filter criteria change
  useEffect(() => {
    let filtered = [...tasks];
    if (selectedProject) {
      filtered = filtered.filter(task => task.projectId === selectedProject);
    }
    if (selectedConsultant) {
      filtered = filtered.filter(task => task.consultantId === selectedConsultant);
    }
    setFilteredTasks(filtered);
  }, [tasks, selectedProject, selectedConsultant]);

  // Update calendar days when month, view mode, or filtered tasks change
  useEffect(() => {
    if (viewMode === 'month') {
      setCalendarDays(generateMonthDays(currentDate, filteredTasks));
    } else {
      setCalendarDays(generateWeekDays(currentDate, filteredTasks));
    }
  }, [currentDate, viewMode, filteredTasks]);

  // Generate days for month view
  const generateMonthDays = (date: Date, tasksList: Task[]): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first day of week containing the first day of month
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // End on the last day of week containing the last day of month
    const endDate = new Date(lastDay);
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayTasks = tasksList.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === new Date(d).getTime();
      });
      
      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === month,
        isToday: d.getTime() === today.getTime(),
        tasks: dayTasks
      });
    }
    
    return days;
  };

  // Generate days for week view
  const generateWeekDays = (date: Date, tasksList: Task[]): CalendarDay[] => {
    const currentDay = new Date(date);
    const day = currentDay.getDay();
    
    // Start from Sunday of current week
    const startDate = new Date(currentDay);
    startDate.setDate(currentDay.getDate() - day);
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      
      const dayTasks = tasksList.filter(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === d.getTime();
      });
      
      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === currentDay.getMonth(),
        isToday: d.getTime() === today.getTime(),
        tasks: dayTasks
      });
    }
    
    return days;
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setDate(prev.getDate() - 7);
      }
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') {
        newDate.setMonth(prev.getMonth() + 1);
      } else {
        newDate.setDate(prev.getDate() + 7);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
  
  // Get status badge class
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
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format month year for display
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('default', { month: 'long', year: 'numeric' });
  };

  // Format date range for week view
  const formatWeekRange = (startDate: Date, endDate: Date) => {
    return `${startDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  // Get day name
  const getDayName = (date: Date) => {
    return date.toLocaleDateString('default', { weekday: 'short' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Schedule</h1>
          <p className="text-gray-400 mt-1">Task timeline and calendar view</p>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
          
          <div className="flex items-center space-x-3">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg bg-[#242935] text-gray-400 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Today
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg bg-[#242935] text-gray-400 hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="h-6 border-l border-gray-700"></div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-[#242935] text-gray-400 hover:text-gray-200'}`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-[#242935] text-gray-400 hover:text-gray-200'}`}
              >
                Week
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">
          {error}
        </div>
      ) : (
        <div className="bg-[#1a1f2b] rounded-xl shadow-lg overflow-hidden">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-xl font-medium text-gray-200">
              {viewMode === 'month' 
                ? formatMonthYear(currentDate) 
                : formatWeekRange(calendarDays[0]?.date, calendarDays[6]?.date)}
            </h2>
          </div>
          
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-gray-700 bg-[#242935]">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="px-2 py-3 text-center text-sm font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className={`grid grid-cols-7 ${viewMode === 'week' ? 'grid-rows-1 h-96' : 'grid-rows-6'}`}>
            {calendarDays.map((day, i) => (
              <div 
                key={i} 
                className={`min-h-24 border-b border-r border-gray-700 p-2 ${
                  day.isCurrentMonth ? 'bg-[#1a1f2b]' : 'bg-[#171c28]'
                } ${day.isToday ? 'ring-2 ring-inset ring-blue-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    day.isToday 
                      ? 'text-blue-400' 
                      : day.isCurrentMonth 
                        ? 'text-gray-200' 
                        : 'text-gray-500'
                  }`}>
                    {day.date.getDate()}
                  </span>
                  {viewMode === 'week' && (
                    <span className="text-xs text-gray-500">{getDayName(day.date)}</span>
                  )}
                </div>
                
                {/* Tasks for this day */}
                <div className="space-y-1 overflow-y-auto max-h-40">
                  {(() => {
                    const phases = Array.from(new Set(day.tasks.map(t => t.phase)));
                    return phases.map(phase => (
                      <React.Fragment key={phase}>
                        <div className="text-xs font-semibold text-gray-400 mb-1">{phase}</div>
                        {day.tasks.filter(t => t.phase === phase).map(task => (
                          <div 
                            key={task.id}
                            className="bg-[#242935] rounded p-1.5 cursor-pointer hover:bg-[#2d3444] transition-colors"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowModal(true);
                            }}
                          >
                            <div className="flex items-start space-x-1">
                              <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 ${getPriorityBadgeClass(task.priority).replace('text-', 'bg-').replace('/20', '')}`}></span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-200 truncate">{task.title}</p>
                                {viewMode === 'week' && (
                                  <p className="text-xs text-gray-400 truncate">{task.project?.name}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ));
                  })()}
                </div>
              </div>
            ))}
          </div>
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
                      <span className={`${getStatusBadgeClass(selectedTask.status)} rounded-full px-2.5 py-1 text-xs`}>
                        {selectedTask.status.replace('_', ' ')}
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
                        <span className="text-sm text-gray-400">
                          {selectedTask.consultant?.name || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4 flex justify-end">
                      <div className="space-x-2">
                        <button className="px-3 py-1.5 bg-[#242935] text-gray-300 rounded-lg hover:bg-[#2d3444] transition-colors text-sm">
                          Close
                        </button>
                        <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                          View in Tasks
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

export default Schedule; 