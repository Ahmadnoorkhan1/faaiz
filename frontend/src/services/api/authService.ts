import api from './axios';

// User interface
export interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  token?: string;
  clientProfile?: any;
  consultantProfile?: any;
}

// Login credentials interface
interface LoginCredentials {
  email: string;
  password: string;
}

// Register data interface
interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Register a new user
export const register = async (name: string, email: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    const userData = response.data.data;
    
    // Save token and user to local storage
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return userData;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post('/auth/login', { email, password });
    const userData = response.data.data;
    
    // Save token and user to local storage
    if (userData.token) {
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return userData;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout user
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } finally {
    // Always clear the token from local storage
    localStorage.removeItem('token');
  }
};

// Get current user from local storage
export const getCurrentUser = async (): Promise<User | null> => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

// Get current user profile from API
export const getCurrentUserProfile = async (): Promise<User> => {
  try {
    const response = await api.get('/auth/me');
    return response.data.data;
  } catch (error) {
    console.error('Error getting current user profile:', error);
    throw error;
  }
};

// Update the current user's profile
export const updateUserProfile = async (userData: Partial<User>): Promise<User> => {
  const response = await api.put('/auth/profile', userData);
  return response.data;
};

// Change the user's password
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await api.post('/auth/change-password', { currentPassword, newPassword });
}; 