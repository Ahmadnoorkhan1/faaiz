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

interface TaskWithDateType extends Task {
  dateType: 'start' | 'due';
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

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: TaskWithDateType[];
}

type ViewMode = 'month' | 'week';

const Schedule: React.FC = () => {
  // Initialize with empty arrays, not dummy data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get user data from localStorage
        const userDataString = localStorage.getItem('userData');
        if (!userDataString) {
          throw new Error('User data not found. Please log in again.');
        }
        
        const userData = JSON.parse(userDataString);
        const userId = userData.id;
        
        if (!userId) {
          throw new Error('User ID not found. Please log in again.');
        }
        
        console.log('Fetching schedule data for user:', userId);
        
        // Using Promise.allSettled to handle partial failures gracefully
        const [tasksResult, projectsResult, consultantsResult] = await Promise.allSettled([
          api.get(`/api/tasks?userId=${userId}`),
          api.get(`/api/projects?userId=${userId}`),
          api.get(`/api/consultants/user/${userId}`)
        ]);
        
        // Process tasks response
        if (tasksResult.status === 'fulfilled' && tasksResult.value.data?.success) {
          const fetchedTasks = tasksResult.value.data.data || [];
          setTasks(fetchedTasks);
          setFilteredTasks(fetchedTasks);
        } else {
          console.warn('Could not fetch tasks:', 
            tasksResult.status === 'rejected' ? tasksResult.reason : 'API returned unsuccessful response');
          toast.error('Could not load tasks. Please try again later.');
          setTasks([]);
          setFilteredTasks([]);
        }
        
        // Process projects response
        if (projectsResult.status === 'fulfilled' && projectsResult.value.data?.success) {
          setProjects(projectsResult.value.data.data || []);
        } else {
          console.warn('Could not fetch projects:', 
            projectsResult.status === 'rejected' ? projectsResult.reason : 'API returned unsuccessful response');
          toast.error('Projects data could not be loaded. Some filter options may be limited.');
          setProjects([]);
        }
        
        // Process consultants response
        if (consultantsResult.status === 'fulfilled' && consultantsResult.value.data?.success) {
          // Transform consultant data to match component needs
          const processedConsultants = consultantsResult.value.data.data.map((consultant: any) => ({
            id: consultant.id,
            userId: consultant.userId,
            email: consultant.email,
            contactFirstName: consultant.contactFirstName || 'Unknown',
            contactLastName: consultant.contactLastName || 'Consultant',
            user: consultant.user
          }));
          
          setConsultants(processedConsultants);
        } else {
          const errorMessage = consultantsResult.status === 'rejected' ? 
            consultantsResult.reason?.response?.data?.message || consultantsResult.reason?.message : 
            'API returned unsuccessful response';
            
          console.warn('Could not fetch consultants:', errorMessage);
          
          // Only show toast if it's not the "Consultant profile not found" error
          if (errorMessage !== 'Consultant profile not found') {
            toast.error('Consultant data could not be loaded. Assignment filters may be limited.');
          }
          
          setConsultants([]);
        }
        
        // Only set error if all APIs failed
        if (tasksResult.status === 'rejected' && 
            projectsResult.status === 'rejected' && 
            consultantsResult.status === 'rejected') {
          setError('Failed to load schedule data. Please check your connection and try again later.');
        } else {
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching schedule data:', err);
        setError('Failed to load schedule data. Please try again later.');
        toast.error('Failed to load schedule: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Filter tasks when filter criteria change
  useEffect(() => {
    if (tasks.length === 0) return;
    
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
      const newDate = new Date(d);
      const dayTasksWithType: TaskWithDateType[] = [];
      
      // Check for tasks with due date matching this day
      tasksList.forEach(task => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() === newDate.getTime()) {
            dayTasksWithType.push({...task, dateType: 'due'});
          }
        }
        
        // Check for tasks with start date matching this day
        if (task.startDate) {
          const taskStartDate = new Date(task.startDate);
          taskStartDate.setHours(0, 0, 0, 0);
          if (taskStartDate.getTime() === newDate.getTime()) {
            dayTasksWithType.push({...task, dateType: 'start'});
          }
        }
      });
      
      days.push({
        date: newDate,
        isCurrentMonth: newDate.getMonth() === month,
        isToday: newDate.getTime() === today.getTime(),
        tasks: dayTasksWithType
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
      
      const dayTasksWithType: TaskWithDateType[] = [];
      
      // Check for tasks with due date matching this day
      tasksList.forEach(task => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate.getTime() === d.getTime()) {
            dayTasksWithType.push({...task, dateType: 'due'});
          }
        }
        
        // Check for tasks with start date matching this day
        if (task.startDate) {
          const taskStartDate = new Date(task.startDate);
          taskStartDate.setHours(0, 0, 0, 0);
          if (taskStartDate.getTime() === d.getTime()) {
            dayTasksWithType.push({...task, dateType: 'start'});
          }
        }
      });
      
      days.push({
        date: new Date(d),
        isCurrentMonth: d.getMonth() === currentDay.getMonth(),
        isToday: d.getTime() === today.getTime(),
        tasks: dayTasksWithType
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
  
  // Get date type indicator class
  const getDateTypeClass = (dateType: 'start' | 'due') => {
    return dateType === 'start' 
      ? 'bg-green-500/20 text-green-400' 
      : 'bg-orange-500/20 text-orange-400';
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
  
  // Get consultant name
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
                <option key={consultant.userId} value={consultant.userId}>
                  {consultant.contactFirstName} {consultant.contactLastName}
                </option>
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

      {/* Legend for calendar */}
      {!loading && !error && (
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500/50 mr-1"></span>
            Start Date
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500/50 mr-1"></span>
            Due Date
          </div>
        </div>
      )}

      {/* Calendar */}
      {!loading && !error && (
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
                  {day.tasks.length > 0 ? (() => {
                    const phases = Array.from(new Set(day.tasks.map(t => t.phase || 'No Phase')));
                    return phases.map(phase => (
                      <React.Fragment key={phase}>
                        <div className="text-xs font-semibold text-gray-400 mb-1">{phase}</div>
                        {day.tasks.filter(t => (t.phase || 'No Phase') === phase).map(task => (
                          <div 
                            key={`${task.id}-${task.dateType}`}
                            className="bg-[#242935] rounded p-1.5 cursor-pointer hover:bg-[#2d3444] transition-colors"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowModal(true);
                            }}
                          >
                            <div className="flex items-start space-x-1">
                              <span 
                                className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 ${
                                  task.dateType === 'start' ? 'bg-green-500' : 'bg-orange-500'
                                }`}
                              ></span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className="text-xs font-medium text-gray-200 truncate" title={task.title}>
                                    {task.title}
                                  </p>
                                  <span className="text-xs font-medium px-1 rounded-sm bg-opacity-20 whitespace-nowrap">
                                    {task.dateType === 'start' ? '(Start)' : '(Due)'}
                                  </span>
                                </div>
                                {viewMode === 'week' && (
                                  <p className="text-xs text-gray-400 truncate" title={task.project?.name || 'No Project'}>
                                    {task.project?.name || 'No Project'}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </React.Fragment>
                    ));
                  })() : (
                    day.isCurrentMonth && (
                      <div className="text-xs text-gray-500 text-center py-2">No tasks</div>
                    )
                  )}
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
                    
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                      <span className={`${getPriorityBadgeClass(selectedTask.priority)} rounded-full px-2.5 py-1 text-xs`}>
                        {selectedTask.priority}
                      </span>
                      <span className={`${getStatusBadgeClass(selectedTask.status)} rounded-full px-2.5 py-1 text-xs`}>
                        {selectedTask.status.replace('_', ' ')}
                      </span>
                      {selectedTask.startDate && (
                        <span className="bg-green-500/20 text-green-400 rounded-full px-2.5 py-1 text-xs">
                          Start: {formatDate(selectedTask.startDate)}
                        </span>
                      )}
                      {selectedTask.dueDate && (
                        <span className="bg-orange-500/20 text-orange-400 rounded-full px-2.5 py-1 text-xs">
                          Due: {formatDate(selectedTask.dueDate)}
                        </span>
                      )}
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
                        <span className="text-sm text-gray-400">
                          {getConsultantName(selectedTask.consultant)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-700 pt-4 flex justify-end">
                      <div className="space-x-2">
                        <button 
                          className="px-3 py-1.5 bg-[#242935] text-gray-300 rounded-lg hover:bg-[#2d3444] transition-colors text-sm"
                          onClick={() => {
                            setShowModal(false);
                            setSelectedTask(null);
                          }}
                        >
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