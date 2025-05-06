import { PublicClientApplication } from '@azure/msal-browser';

// Explicitly define the exact redirect URI to match Azure configuration
const isLocalhost = window.location.hostname === 'localhost';

// Updated to match exactly what's in Azure - including trailing slash
const redirectUri = isLocalhost ? 'http://localhost:5173/' : 'https://app.grcdepartment.com/';

export const msalConfig = {
  auth: {
    clientId: 'ac2e0217-86c9-45c5-9f66-2cb61329bdd0',
    authority: 'https://login.microsoftonline.com/d8d3c1d1-f608-4781-9aa2-3d85c0b3c24b',
    redirectUri: redirectUri, // Use the explicitly defined URI
    // Enable implicit flow (needed for SPA)
    navigateToLoginRequestUrl: true,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: true,
  },
};

export const loginRequest = {
  scopes: [
    'user.read', 
    'offline_access', 
    'calendars.readwrite', 
    'onlineMeetings.readwrite',
    'Team.ReadBasic.All',
    'Channel.ReadBasic.All',
    'TeamMember.Read.All',
    'ChannelMessage.Read.All',
    'Files.Read.All',
    'Sites.Read.All',
    'Group.Read.All',
    'Calendars.Read'
  ]
};

// Log the configuration at startup for debugging
console.log("MSAL Configuration:", {
  clientId: msalConfig.auth.clientId,
  redirectUri: msalConfig.auth.redirectUri
});

// Create and initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Ensure MSAL is initialized
export const initializeMsal = async () => {
  try {
    // Don't log out existing users - removed the logout code
    await msalInstance.initialize();
    console.log('MSAL initialized successfully');
    return msalInstance;
  } catch (error) {
    console.error('Error initializing MSAL:', error);
    throw error;
  }
}; 