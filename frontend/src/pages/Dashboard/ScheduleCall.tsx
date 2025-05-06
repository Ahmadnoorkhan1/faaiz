import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { post, get } from '../../service/apiService';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import MicrosoftAuth from '../../components/MicrosoftAuth';
import { getSignedInAccount, getAccessToken, safeLoginWithMicrosoft } from '../../utils/msalUtils';

// Constants for localStorage keys (matching MicrosoftAuth.tsx)
const MS_USER_DATA_KEY = 'ms_user_data';
const MS_CONNECTION_STATUS_KEY = 'ms_connection_status';

// Define interface for Microsoft connection check response
interface MicrosoftConnectionResponse {
  connected: boolean;
}

interface ScheduleCallForm {
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  clientId: string;
  consultantId: string;
}

const ScheduleCall: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [microsoftConnected, setMicrosoftConnected] = useState(() => {
    // Initialize from localStorage on component mount
    return localStorage.getItem(MS_CONNECTION_STATUS_KEY) === 'true';
  });
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [microsoftUser, setMicrosoftUser] = useState<any>(null);
  
  // For development/testing purposes, we'll use the user's own ID as consultant
  // In a real app, you would select this from a list of consultants
  const [formData, setFormData] = useState<ScheduleCallForm>({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // Default 1 hour duration
    clientId: user.id,
    consultantId: user.id, // Setting the current user as consultant for testing purposes
  });

  // Load Microsoft user data from localStorage
  useEffect(() => {
    // Try to load Microsoft user data
    const savedUserData = localStorage.getItem(MS_USER_DATA_KEY);
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        setMicrosoftUser(parsedUserData);
      } catch (error) {
        console.error('Error parsing saved Microsoft user data:', error);
      }
    }
  }, []);

  // Check Microsoft connection status when component mounts
  useEffect(() => {
    // First check localStorage for fast initial state
    const savedConnectionStatus = localStorage.getItem(MS_CONNECTION_STATUS_KEY);
    if (savedConnectionStatus === 'true') {
      setMicrosoftConnected(true);
    }
    
    // Then validate connection status
    checkMicrosoftConnection();
  }, []);

  const checkMicrosoftConnection = async () => {
    try {
      setCheckingConnection(true);
      setTokenError(null);
      
      // First check if user is already signed in with Microsoft
      const account = getSignedInAccount();
      if (account) {
        console.log('User already has a Microsoft account connected:', account.username);
        setMicrosoftUser({
          username: account.username,
          name: account.name,
          tenantId: account.tenantId,
          environment: account.environment,
        });
        
        try {
          // Try to get a token to verify validity
          const token = await getAccessToken(account);
          if (token && token.length > 20) {
            console.log('Found valid Microsoft token, setting connected state');
            setMicrosoftConnected(true);
            localStorage.setItem(MS_CONNECTION_STATUS_KEY, 'true');
            
            // Save Microsoft user data
            localStorage.setItem(MS_USER_DATA_KEY, JSON.stringify({
              username: account.username,
              name: account.name,
              tenantId: account.tenantId,
              environment: account.environment,
            }));
            
            return;
          }
        } catch (tokenError) {
          console.error('Error getting token from existing account:', tokenError);
          // Continue to API check as fallback
        }
      }
      
      // If no account or token issue, check with the API
      const response = await get<MicrosoftConnectionResponse>('/api/microsoft/check-connection');
      setMicrosoftConnected(response.connected || false);
      localStorage.setItem(MS_CONNECTION_STATUS_KEY, String(response.connected || false));
      
      // If connected, try to get a fresh token right away
      if (response.connected) {
        await refreshMicrosoftToken();
      }
    } catch (error) {
      console.error('Error checking Microsoft connection:', error);
      setMicrosoftConnected(false);
      localStorage.setItem(MS_CONNECTION_STATUS_KEY, 'false');
      setTokenError('Error connecting to Microsoft. Please reconnect your account.');
    } finally {
      setCheckingConnection(false);
    }
  };

  // Function to refresh Microsoft token before scheduling
  const refreshMicrosoftToken = async () => {
    try {
      const account = getSignedInAccount();
      if (!account) {
        setTokenError('No Microsoft account found. Please connect your account.');
        setMicrosoftConnected(false);
        return null;
      }
      
      try {
        // Get a fresh token
        const accessToken = await getAccessToken(account);
        
        // Make sure token is valid
        if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
          setTokenError('Invalid access token received. Please reconnect your Microsoft account.');
          setMicrosoftConnected(false);
          return null;
        }
        
        // Skip sending token to backend on every refresh to avoid unnecessary state changes
        console.log('Microsoft token refreshed successfully');
        setMicrosoftConnected(true);
        
        // Update Microsoft user data
        setMicrosoftUser({
          username: account.username,
          name: account.name,
          tenantId: account.tenantId,
          environment: account.environment,
        });
        
        // Save Microsoft user data
        localStorage.setItem(MS_USER_DATA_KEY, JSON.stringify({
          username: account.username,
          name: account.name,
          tenantId: account.tenantId,
          environment: account.environment,
        }));
        
        return accessToken;
      } catch (tokenError) {
        console.error('Token refresh failed, attempting login again:', tokenError);
        
        // Try a fresh login as last resort
        try {
          const newAccount = await safeLoginWithMicrosoft();
          if (newAccount) {
            const newToken = await getAccessToken(newAccount);
            if (newToken) {
              setMicrosoftConnected(true);
              
              // Update Microsoft user data
              setMicrosoftUser({
                username: newAccount.username,
                name: newAccount.name,
                tenantId: newAccount.tenantId,
                environment: newAccount.environment,
              });
              
              // Save Microsoft user data
              localStorage.setItem(MS_USER_DATA_KEY, JSON.stringify({
                username: newAccount.username,
                name: newAccount.name,
                tenantId: newAccount.tenantId,
                environment: newAccount.environment,
              }));
              
              return newToken;
            }
          }
        } catch (loginError) {
          console.error('Login attempt also failed:', loginError);
        }
        
        setTokenError('Could not refresh your Microsoft token. Please reconnect your account.');
        setMicrosoftConnected(false);
        return null;
      }
    } catch (error) {
      console.error('Error in refresh flow:', error);
      setTokenError('Could not refresh your Microsoft token. Please reconnect your account.');
      setMicrosoftConnected(false);
      return null;
    }
  };

  const validateForm = () => {
    // Check title is not empty
    if (!formData.title.trim()) {
      toast.error('Please enter a title for the call');
      return false;
    }
    
    // Check start and end times are valid
    if (!formData.startTime || !formData.endTime) {
      toast.error('Please select valid start and end times');
      return false;
    }
    
    // Check end time is after start time
    if (formData.endTime <= formData.startTime) {
      toast.error('End time must be after start time');
      return false;
    }
    
    // Check consultantId is set
    if (!formData.consultantId) {
      toast.error('No consultant selected');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Microsoft account is connected
    if (!microsoftConnected) {
      toast.error('Please connect your Microsoft account before scheduling a call');
      return;
    }
    
    // Validate form data
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      // Refresh Microsoft token before scheduling
      const token = await refreshMicrosoftToken();
      if (!token) {
        toast.error('Could not refresh Microsoft access token. Please reconnect your account.');
        setLoading(false);
        return;
      }
      
      // Quick validation of token
      if (token.length < 20) {
        toast.error('Invalid access token. Please reconnect your Microsoft account.');
        setLoading(false);
        return;
      }
      
      console.log('Submitting form data with a valid token');
      
      // Make sure we send the latest access token with the request
      const response = await post('/api/scheduled-calls', {
        ...formData,
        startTime: formData.startTime.toISOString(),
        endTime: formData.endTime.toISOString(),
        accessToken: token,
      });

      console.log('Call scheduling response:', response);

      // Show success message
      toast.success('Call scheduled successfully!');
      
      // Use direct window location navigation instead of React Router
      // This is a more reliable approach when dealing with complex state
      setTimeout(() => {
        window.location.href = '/scheduled-calls';
      }, 500);
    } catch (error:any) {
      const errorMessage = error.response?.data?.error || 'Failed to schedule call';
      const errorDetails = error.response?.data?.details || '';
      
      // Check if the error is related to Microsoft token
      if (
        errorMessage.includes('Microsoft') || 
        errorMessage.includes('Teams') || 
        errorMessage.includes('token') || 
        errorMessage.includes('auth')
      ) {
        setMicrosoftConnected(false);
        setTokenError('Your Microsoft connection has expired. Please reconnect your account.');
        
        // Show detailed error if available
        if (errorDetails) {
          toast.error(`${errorMessage}: ${errorDetails}`);
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
      
      console.error('Error scheduling call:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle when the Microsoft connection changes
  const handleMicrosoftConnectionChange = (isConnected: boolean) => {
    setMicrosoftConnected(isConnected);
    
    // If connected, try to get user info
    if (isConnected) {
      const account = getSignedInAccount();
      if (account) {
        setMicrosoftUser({
          username: account.username,
          name: account.name,
          tenantId: account.tenantId,
          environment: account.environment,
        });
      }
    } else {
      setMicrosoftUser(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-gray-200 mb-6">Schedule a Call</h1>
      
      <div className="mb-6 p-4 bg-[#1a1f2b] border border-gray-700 rounded-lg">
        <h2 className="text-lg font-medium text-gray-200 mb-2">Microsoft Teams Integration</h2>
        <p className="text-gray-400 mb-3">Connect your Microsoft account to create Teams meetings automatically.</p>
        
        {tokenError && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-red-400 text-sm">{tokenError}</p>
            <button 
              onClick={checkMicrosoftConnection}
              className="mt-2 px-3 py-1 text-sm bg-red-700 text-white rounded hover:bg-red-600 transition-colors"
            >
              Refresh Connection
            </button>
          </div>
        )}
        
        <MicrosoftAuth onConnectionChange={handleMicrosoftConnectionChange} />
        
        {!checkingConnection && microsoftConnected && (
          <div className="mt-3">
            <p className="text-green-500 text-sm">✓ Your Microsoft account is connected</p>
            {microsoftUser && (
              <div className="mt-2 p-2 bg-[#242935] rounded-lg text-sm">
                <p className="text-gray-200">Connected as: <span className="font-medium">{microsoftUser.name || microsoftUser.username}</span></p>
                <p className="text-gray-400 text-xs">{microsoftUser.username}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 bg-[#1a1f2b] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-[#1a1f2b] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Start Time
            </label>
            <DatePicker
              selected={formData.startTime}
              onChange={(date: Date | null) => {
                if (date) {
                  setFormData({ ...formData, startTime: date });
                }
              }}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-4 py-2 bg-[#1a1f2b] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              End Time
            </label>
            <DatePicker
              selected={formData.endTime}
              onChange={(date: Date | null) => {
                if (date) {
                  setFormData({ ...formData, endTime: date });
                }
              }}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full px-4 py-2 bg-[#1a1f2b] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => window.location.href = '/scheduled-calls'}
            className="px-4 py-2 text-gray-200 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !microsoftConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Scheduling...' : 'Schedule Call'}
          </button>
        </div>
        
        {!microsoftConnected && !tokenError && (
          <p className="text-amber-400 text-sm mt-2">You must connect your Microsoft account before scheduling a call.</p>
        )}
      </form>
    </div>
  );
};

export default ScheduleCall; 