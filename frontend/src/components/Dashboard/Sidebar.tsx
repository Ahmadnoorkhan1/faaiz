import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { usePermissions } from '../../hooks/usePermissions';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  clientProfile: any | null;
  consultantProfile: any | null;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle }) => {
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // const { hasPermission, hasRole } = usePermissions();

  useEffect(() => {
    const fetchUserData = () => {
      try {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          setUserData(JSON.parse(storedUserData));
          setIsLoading(false);
        } else {
          // If userData is not available yet, wait and try again
          setTimeout(() => {
            const retryData = localStorage.getItem('userData');
            if (retryData) {
              setUserData(JSON.parse(retryData));
            }
            setIsLoading(false);
          }, 3000); // Wait for 5 seconds
        }
      } catch (error) {
        console.error('Error parsing userData from localStorage:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const hasAccess = (allowedRoles: string[]) => {
    if (!userData || !userData.role) return false;
    return allowedRoles.includes(userData.role);
  };

  const menuItems = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/dashboard',
      label: 'Dashboard',
      allowedRoles: ['ADMIN', 'CLIENT', 'CONSULTANT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      path: '/projects',
      label: 'Projects',
      allowedRoles: ['ADMIN']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: '/clients-list',
      label: 'Clients',
      allowedRoles: ['ADMIN', 'CONSULTANT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      path: '/consultants-list',
      label: 'Consultants',
      allowedRoles: ['ADMIN', 'CLIENT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      path: '/tasks',
      label: 'Tasks',
      allowedRoles: ['ADMIN', 'CLIENT', 'CONSULTANT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      path: '/board',
      label: 'Board',
      allowedRoles: ['ADMIN', 'CLIENT', 'CONSULTANT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/schedule',
      label: 'Schedule',
      allowedRoles: ['ADMIN', 'CLIENT', 'CONSULTANT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      path: '/scheduled-calls',
      label: 'Scheduled Calls',
      allowedRoles: ['ADMIN', 'CLIENT', 'CONSULTANT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414-5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      path: '/documents',
      label: 'Documents',
      allowedRoles: ['ADMIN', 'CLIENT', 'CONSULTANT']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      path: '/role-management',
      label: 'Role Management',
      allowedRoles: ['ADMIN']
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/configurations',
      label: 'Configurations',
      allowedRoles: ['ADMIN']
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = userData 
    ? menuItems.filter(item => item.allowedRoles.includes(userData.role))
    : [];

  if (isLoading) {
    return (
      <div
        style={{ scrollbarWidth: 'none' }}
        className={`fixed left-0 top-0 h-full bg-[#1a1f2b] flex flex-col items-center justify-center py-4 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div 
    style={{scrollbarWidth: 'none'}}
      className={`fixed left-0 top-0 h-full bg-[#1a1f2b] flex flex-col items-center py-4 space-y-8 transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between w-full px-4">
        <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            One
          </div>
          {!isCollapsed && <span className="ml-3 text-xl font-semibold text-white">GRC</span>}
        </div>
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="text-gray-400 hover:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav style={{scrollbarWidth: 'none'}}
        className="flex-1 w-full px-2 overflow-y-auto">
        <ul className="space-y-4">
          {filteredMenuItems.map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed ? 'justify-center' : ''} w-full p-2 rounded-xl transition-colors duration-200 relative group ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
                onMouseEnter={() => isCollapsed && setShowTooltip(item.label)}
                onMouseLeave={() => setShowTooltip(null)}
              >
                {item.icon}
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
                {isCollapsed && showTooltip === item.label && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse/Expand Button at Bottom */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-300 p-2 relative group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100">
            Expand Sidebar
          </span>
        </button>
      )}

      {/* Help Icon */}
      <button 
        className="text-gray-400 hover:text-gray-300 p-2 relative group"
        onMouseEnter={() => isCollapsed && setShowTooltip('Help')}
        onMouseLeave={() => setShowTooltip(null)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {isCollapsed && showTooltip === 'Help' && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded whitespace-nowrap z-50">
            Help & Support
          </div>
        )}
      </button>
    </div>
  );
};

export default Sidebar;