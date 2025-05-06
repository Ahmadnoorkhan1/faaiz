import { msalInstance, loginRequest, initializeMsal } from '../msalConfig';
import { AccountInfo, BrowserAuthError } from '@azure/msal-browser';

// Force clear all MSAL cache to ensure a fresh start
export const forceResetMsalCache = () => {
  try {
    // Clear all storage related to MSAL
    console.log("Forcefully clearing all MSAL cache...");
    
    // Clear sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('msal') || key.includes('login') || key.includes('auth')) {
        console.log(`Clearing sessionStorage key: ${key}`);
        sessionStorage.removeItem(key);
      }
    });
    
    // Clear localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('msal') || key.includes('login') || key.includes('auth')) {
        console.log(`Clearing localStorage key: ${key}`);
        localStorage.removeItem(key);
      }
    });
    
    // Clear any cookies related to authentication
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('msal') || name.includes('auth')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      }
    });
    
    return true;
  } catch (error) {
    console.error("Error clearing MSAL cache:", error);
    return false;
  }
};

// Clear the MSAL cache to resolve interaction_in_progress issues
const clearMsalCache = () => {
  try {
    // Clear session storage entries related to MSAL
    Object.keys(sessionStorage).forEach(key => {
      if (key.includes('msal') || key.includes('login') || key.includes('interaction')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Reload MSAL instance
    return initializeMsal();
  } catch (error) {
    console.error("Error clearing MSAL cache:", error);
    throw error;
  }
};

// Safely handle Microsoft login with error recovery
export const safeLoginWithMicrosoft = async (): Promise<any> => {
  try {
    // Check if we already have an account first
    const accounts = msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      console.log("User already signed in, returning existing account");
      return accounts[0];
    }
    
    // Only login if no existing account
    const response:any = await msalInstance.loginPopup(loginRequest);
    return response.account;
  } catch (error) {
    // If there's an interaction_in_progress error, try to recover
    if (error instanceof BrowserAuthError && 
        error.errorCode === "interaction_in_progress") {
      
      console.log("Interaction in progress, attempting recovery...");
      
      // Clear MSAL cache and reinitialize
      await clearMsalCache();
      
      // Wait a moment before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try login again after recovery
      const retryResponse:any = await msalInstance.loginPopup(loginRequest);
      return retryResponse.account;
    }
    
    // If it's another type of error, rethrow
    throw error;
  }
};

// Get access token for authenticated user
export const getAccessToken = async (account: AccountInfo): Promise<string> => {
  try {
    // Try to get token silently first
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account
    });
    return response.accessToken;
  } catch (error) {
    console.log("Silent token acquisition failed, attempting interactive refresh", error);
    
    try {
      // If silent acquisition fails (e.g., token expired), try interactive refresh
      // without fully logging the user out
      const interactiveResponse = await msalInstance.acquireTokenPopup({
        ...loginRequest,
        account
      });
      return interactiveResponse.accessToken;
    } catch (refreshError) {
      console.error("Interactive token refresh failed:", refreshError);
      // Only at this point should we consider the session invalid
      throw refreshError;
    }
  }
};

// Check if user is already signed in
export const getSignedInAccount = (): AccountInfo | null => {
  const accounts = msalInstance.getAllAccounts();
  return accounts.length > 0 ? accounts[0] : null;
};

// Sign out the current user
export const signOut = async (): Promise<void> => {
  const isLocalhost = window.location.hostname === 'localhost';
  const postLogoutRedirectUri = isLocalhost 
    ? 'http://localhost:5173/' 
    : 'https://app.grcdepartment.com/';
    
  return msalInstance.logout({
    postLogoutRedirectUri: postLogoutRedirectUri
  });
}; 