import axios from 'axios';
const isLocalhost = window.location.hostname === 'localhost';
const api = axios.create({
  baseURL: isLocalhost ? 'http://localhost:5000' : 'https://app.grcdepartment.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the error for debugging
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Generic GET function for fetching a single item
export const get = async <T>(endpoint: string, params?: Record<string, any>): Promise<T> => {
  try {
    const response = await api.get<T>(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

// Generic GET function for fetching multiple items
export const getAll = async <T>(endpoint: string, params?: Record<string, any>): Promise<T[]> => {
  try {
    const response = await api.get<T[]>(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching all from ${endpoint}:`, error);
    throw error;
  }
};

// Generic POST function
export const post = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    throw error;
  }
};

// Generic PUT function for updates
export const update = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating ${endpoint}:`, error);
    throw error;
  }
};

// Generic PATCH function for partial updates
export const patch = async <T>(endpoint: string, data: any): Promise<T> => {
  try {
    const response = await api.post<T>(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error patching ${endpoint}:`, error);
    throw error;
  }
};

// Generic DELETE function
export const remove = async <T>(endpoint: string): Promise<T> => {
  try {
    const response = await api.delete<T>(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error deleting from ${endpoint}:`, error);
    throw error;
  }
};

// File upload function
export const uploadFile = async <T>(endpoint: string, file: File, fieldName = 'file'): Promise<T> => {
  try {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    const response = await api.post<T>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading file to ${endpoint}:`, error);
    throw error;
  }
};

// Add this new function to send Microsoft tokens to the backend
export const connectMicrosoftAccount = async (accessToken: string) => {
  return post('/api/microsoft/connect', { accessToken });
};

export default api;
