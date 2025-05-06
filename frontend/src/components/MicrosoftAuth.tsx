import React, { useEffect, useState } from 'react';
import { AccountInfo, InteractionRequiredAuthError, BrowserAuthError } from '@azure/msal-browser';
import { toast } from 'react-hot-toast';
import { connectMicrosoftAccount, get } from '../service/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import { safeLoginWithMicrosoft, getSignedInAccount, getAccessToken, } from '../utils/msalUtils';
import { initializeMsal } from '../msalConfig';

// Constants for localStorage keys
const MS_USER_DATA_KEY = 'ms_user_data';
const MS_CONNECTION_STATUS_KEY = 'ms_connection_status';
// Use localStorage for current path too - no need for sessionStorage
const MS_REDIRECT_PATH_KEY = 'ms_redirect_path';

interface MicrosoftAuthProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

const MicrosoftAuth: React.FC<MicrosoftAuthProps> = ({ onConnectionChange }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Update parent component when connection status changes
  useEffect(() => {
    if (onConnectionChange) {
      onConnectionChange(isConnected);
    }
    
    // Save connection status to localStorage
    localStorage.setItem(MS_CONNECTION_STATUS_KEY, String(isConnected));
  }, [isConnected, onConnectionChange]);

  // Load saved connection status and user data on mount
  useEffect(() => {
    // Try to load saved connection status from localStorage
    const savedConnectionStatus = localStorage.getItem(MS_CONNECTION_STATUS_KEY);
    if (savedConnectionStatus === 'true') {
      // Just set the UI state - we'll verify with the backend shortly
      setIsConnected(true);
    }
    
    // Try to load saved user data from localStorage
    const savedUserData = localStorage.getItem(MS_USER_DATA_KEY);
    if (savedUserData) {
      try {
        const parsedUserData = JSON.parse(savedUserData);
        // Just for display purposes until we verify with the actual account
        setAccount(parsedUserData);
      } catch (error) {
        console.error('Error parsing saved Microsoft user data:', error);
        localStorage.removeItem(MS_USER_DATA_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        await initializeMsal();
        setIsInitialized(true);
        
        // Check if user is already signed in
        const existingAccount = getSignedInAccount();
        if (existingAccount) {
          setAccount(existingAccount);
          // Save account to localStorage
          saveUserDataToLocalStorage(existingAccount);
          // Check if the account is connected on the backend
          await checkConnectionStatus(existingAccount);
        } else {
          // If no account is found but we have localStorage data, clear it
          if (localStorage.getItem(MS_USER_DATA_KEY)) {
            localStorage.removeItem(MS_USER_DATA_KEY);
            localStorage.removeItem(MS_CONNECTION_STATUS_KEY);
            setIsConnected(false);
          }
        }
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
      }
    };

    init();
  }, [navigate, location.hash]);

  // Save Microsoft user data to localStorage
  const saveUserDataToLocalStorage = (msAccount: AccountInfo) => {
    try {
      // Only save non-sensitive information
      const userDataToSave = {
        username: msAccount.username,
        name: msAccount.name,
        tenantId: msAccount.tenantId,
        environment: msAccount.environment,
        homeAccountId: msAccount.homeAccountId,
      };
      
      localStorage.setItem(MS_USER_DATA_KEY, JSON.stringify(userDataToSave));
    } catch (error) {
      console.error('Error saving Microsoft user data to localStorage:', error);
    }
  };

  // Check connection status with the backend
  const checkConnectionStatus = async (currentAccount?: AccountInfo) => {
    try {
      const response = await get('/api/microsoft/check-connection') as { connected: boolean };
      const isCurrentlyConnected = response.connected || false;
      setIsConnected(isCurrentlyConnected);
      
      // Update localStorage with the verified connection status
      localStorage.setItem(MS_CONNECTION_STATUS_KEY, String(isCurrentlyConnected));
      
      // If we have an account but not connected on backend, try to connect
      if (currentAccount && !isCurrentlyConnected) {
        await checkTokenAndUpdateBackend(currentAccount);
      }
      
      return isCurrentlyConnected;
    } catch (error) {
      console.error('Error checking Microsoft connection status:', error);
      setIsConnected(false);
      localStorage.setItem(MS_CONNECTION_STATUS_KEY, 'false');
      return false;
    }
  };

  const checkTokenAndUpdateBackend = async (currentAccount: AccountInfo) => {
    if (!isInitialized) return;
    
    try {
      // Get a fresh access token from MSAL
      const accessToken = await getAccessToken(currentAccount);
      
      // Send the access token to the backend to store it with the user account
      const result = await connectMicrosoftAccount(accessToken);
      console.log('Microsoft account connected successfully:', result);
      
      setIsConnected(true);
      
      // Save the verified account data to localStorage
      saveUserDataToLocalStorage(currentAccount);
      localStorage.setItem(MS_CONNECTION_STATUS_KEY, 'true');
      
      if (onConnectionChange) {
        onConnectionChange(true);
      }
      
      return true;
    } catch (error) {
      console.error('Error acquiring or sending token to backend:', error);
      
      if (error instanceof InteractionRequiredAuthError) {
        setIsConnected(false);
        localStorage.setItem(MS_CONNECTION_STATUS_KEY, 'false');
        if (onConnectionChange) {
          onConnectionChange(false);
        }
        
        // Try to prompt for interactive login
        toast.error('Your Microsoft session requires re-authentication. Please sign in again.');
        
        try {
          await handleConnect();
        } catch (e) {
          console.error('Failed to reconnect automatically:', e);
        }
      } else {
        toast.error('Failed to connect Microsoft account to application.');
      }
      
      return false;
    }
  };

  const handleConnect = async () => {
    if (!isInitialized) {
      toast.error('Microsoft authentication is not initialized yet. Please try again.');
      return;
    }
    
    setIsConnecting(true);
    try {      
      // Store current path - using localStorage instead of sessionStorage
      localStorage.setItem(MS_REDIRECT_PATH_KEY, window.location.pathname);
      
      // Use our safe login helper
      const newAccount = await safeLoginWithMicrosoft();
      setAccount(newAccount);
      
      // Save user data to localStorage
      saveUserDataToLocalStorage(newAccount);
      
      // Get token and connect to backend
      const accessToken = await getAccessToken(newAccount);
      
      // Send token to backend API to store with user account
      const result = await connectMicrosoftAccount(accessToken);
      console.log('Microsoft account connected successfully:', result);
      
      setIsConnected(true);
      localStorage.setItem(MS_CONNECTION_STATUS_KEY, 'true');
      
      if (onConnectionChange) {
        onConnectionChange(true);
      }
      
      toast.success('Successfully connected to Microsoft');
      
      // Navigate back if needed - using localStorage instead of sessionStorage
      const savedPath = localStorage.getItem(MS_REDIRECT_PATH_KEY);
      if (savedPath && savedPath !== window.location.pathname) {
        localStorage.removeItem(MS_REDIRECT_PATH_KEY);
        navigate(savedPath);
      }
    } catch (error) {
      console.error('Error connecting to Microsoft:', error);
      
      // Clear localStorage on error
      localStorage.removeItem(MS_USER_DATA_KEY);
      localStorage.setItem(MS_CONNECTION_STATUS_KEY, 'false');
      
      // Handle error with proper type checking
      let errorMessage = 'Failed to connect to Microsoft';
      if (error instanceof BrowserAuthError) {
        errorMessage = error.errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <span className="text-green-500">Connected to Microsoft</span>
          {account && <span className="text-gray-400">({account.username})</span>}
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting || !isInitialized}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isConnecting ? 'Connecting...' : !isInitialized ? 'Initializing...' : 'Connect Microsoft Account'}
        </button>
      )}
    </div>
  );
};

export default MicrosoftAuth; 