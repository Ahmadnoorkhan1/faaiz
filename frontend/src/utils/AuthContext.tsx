import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import api from '../service/apiService';
import { clearUserData } from './clearUserData';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom event for logout
export const LOGOUT_EVENT = 'app:logout';

// Key for storing user data in localStorage
export const USER_DATA_KEY = 'userData';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Add this debug function
const debug = (message: string, data?: any) => {
  console.log(`[Auth] ${message}`, data || '');
};

// Helper function to save user data to localStorage
const saveUserData = (userData: any) => {
  try {
    const userDataString = JSON.stringify(userData);
    localStorage.setItem(USER_DATA_KEY, userDataString);
    debug('User data saved to localStorage');
  } catch (error) {
    console.error('Error saving user data to localStorage:', error);
  }
};

// Helper function to get user data from localStorage
const getUserDataFromStorage = (): any | null => {
  try {
    const userDataString = localStorage.getItem(USER_DATA_KEY);
    if (!userDataString) return null;
    return JSON.parse(userDataString);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

// Auth provider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      debug('Checking auth state...');
      try {
        const token = localStorage.getItem('token');
        debug('Token from localStorage:', token ? 'exists' : 'not found');
        
        if (!token) {
          debug('No token found, clearing auth state');
          setUser(null);
          setLoading(false);
          return;
        }

        // Try to load user data from localStorage first for immediate UI display
        const storedUserData = getUserDataFromStorage();
        if (storedUserData) {
          debug('Setting user state from localStorage:', storedUserData);
          setUser(storedUserData);
        }

        try {
          // Verify token with server and get fresh user data
          const response = await api.get('/api/auth/me');
          debug('Auth check response:', response.data);

          if (response.data?.success && response.data?.data) {
            const freshUserData = response.data.data;
            debug('Setting user state from API:', freshUserData);
            setUser(freshUserData);
            
            // Update localStorage with fresh data
            saveUserData(freshUserData);
          } else {
            debug('Invalid response format, clearing auth state');
            clearUserData();
            localStorage.removeItem(USER_DATA_KEY);
            setUser(null);
          }
        } catch (error: any) {
          debug('Auth check error:', error.response?.data || error.message);
          
          // Clear auth state on token validation errors
          if (error.response?.status === 401) {
            debug('Token invalid or expired, clearing auth state');
            clearUserData();
            localStorage.removeItem(USER_DATA_KEY);
            setUser(null);
          } else {
            console.error('Error checking authentication status:', error);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    debug('Attempting login...');
    try {
      setLoading(true);
      const response = await api.post('/api/auth/login', { email, password });
      debug('Login response:', response.data);
      
      if (!response.data?.success || !response.data?.data) {
        throw new Error('Invalid login response format');
      }

      const { token, ...userData } = response.data.data;
      
      // Store token
      localStorage.setItem('token', token);

      // Set user data immediately
      setUser(userData);
      
      // Store user data in localStorage
      saveUserData(userData);
      
      // Get fresh user data from /me endpoint
      const meResponse = await api.get('/api/auth/me');
      if (meResponse.data?.success && meResponse.data?.data) {
        const freshUserData = meResponse.data.data;
        setUser(freshUserData);
        
        // Update localStorage with fresh data
        saveUserData(freshUserData);
      }
      
      toast.success('Login successful!');
    } catch (error: any) {
      debug('Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.error || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    debug('Logging out...');
    try {
      setLoading(true);
      
      // Clear all user data
      clearUserData();
      localStorage.removeItem(USER_DATA_KEY);
      setUser(null);
      
      // Remove authorization header
      delete api.defaults.headers.common['Authorization'];
      debug('Cleared auth data and headers');
      
      // Emit logout event for other contexts
      window.dispatchEvent(new Event(LOGOUT_EVENT));
      debug('Emitted logout event');
      
      // Notify backend
      try {
        await api.post('/api/auth/logout');
        debug('Backend notified of logout');
      } catch (error) {
        debug('Error notifying backend of logout:', error);
      }
      
      toast.success('Logged out successfully!');
    } catch (error) {
      debug('Logout error:', error);
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};