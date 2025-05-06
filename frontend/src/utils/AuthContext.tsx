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

        try {
          const response = await api.get('/api/auth/me');
          debug('Auth check response:', response.data);

          if (response.data?.success && response.data?.data) {
            debug('Setting user state:', response.data.data);
            setUser(response.data.data);
          } else {
            debug('Invalid response format, clearing auth state');
            clearUserData();
            setUser(null);
          }
        } catch (error: any) {
          debug('Auth check error:', error.response?.data || error.message);
          
          // Clear auth state on token validation errors
          if (error.response?.status === 401) {
            debug('Token invalid or expired, clearing auth state');
            clearUserData();
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
      
      // Get fresh user data from /me endpoint
      const meResponse = await api.get('/api/auth/me');
      if (meResponse.data?.success && meResponse.data?.data) {
        setUser(meResponse.data.data);
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