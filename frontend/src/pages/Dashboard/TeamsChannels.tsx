import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getSignedInAccount, getAccessToken } from '../../utils/msalUtils';
import MicrosoftAuth from '../../components/MicrosoftAuth';
import { initializeMsal } from '../../msalConfig';

// Constants for localStorage keys (matching MicrosoftAuth.tsx)
const MS_USER_DATA_KEY = 'ms_user_data';
const MS_CONNECTION_STATUS_KEY = 'ms_connection_status';

interface Channel {
  id: string;
  displayName: string;
  description: string;
  webUrl: string;
}

interface Team {
  id: string;
  displayName: string;
  description: string;
  channels: Channel[];
}

interface ChannelMessage {
  id: string;
  content: string;
  from: {
    user: {
      displayName: string;
      id: string;
    }
  };
  createdDateTime: string;
}

interface File {
  id: string;
  name: string;
  webUrl: string;
  size: number;
  lastModifiedDateTime: string;
}

interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  isOnlineMeeting: boolean;
  onlineMeetingUrl?: string;
  organizer: {
    emailAddress: {
      name: string;
    }
  };
}

const TeamsChannels: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [microsoftConnected, setMicrosoftConnected] = useState<boolean>(() => {
    // Initialize from localStorage on component mount
    return localStorage.getItem(MS_CONNECTION_STATUS_KEY) === 'true';
  });
  const [error, setError] = useState<string | null>(null);
  const hasAttemptedInitialLoad = useRef<boolean>(false);
  const lastApiCallTime = useRef<number>(0);
  
  // UI state
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'files' | 'board' | 'schedule'>('posts');
  const [newPost, setNewPost] = useState<string>('');
  
  // Real data states
  const [channelMessages, setChannelMessages] = useState<Record<string, ChannelMessage[]>>({});
  const [channelFiles, setChannelFiles] = useState<Record<string, File[]>>({});
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [channelEvents, setChannelEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [eventsLoading, setEventsLoading] = useState<boolean>(false);

  // Fix for infinite loop: Only fetch on mount or when microsoftConnected changes from false to true
  useEffect(() => {
    const shouldFetch = 
      microsoftConnected && 
      !loading && 
      !hasAttemptedInitialLoad.current;
    
    if (shouldFetch) {
      hasAttemptedInitialLoad.current = true;
      const now = Date.now();
      if (now - lastApiCallTime.current > 5000) {
        lastApiCallTime.current = now;
        fetchTeamsData();
      }
    }
  }, [microsoftConnected, loading]);

  // Load channel content when selection changes
  useEffect(() => {
    if (selectedTeam && selectedChannel) {
      const channelKey = `${selectedTeam}-${selectedChannel}`;
      
      // Load messages if needed
      if (activeTab === 'posts' && !channelMessages[channelKey]) {
        fetchChannelMessages(selectedTeam, selectedChannel);
      }
      
      // Load files if needed
      if (activeTab === 'files' && !channelFiles[channelKey]) {
        fetchChannelFiles(selectedTeam, selectedChannel);
      }
    }
  }, [selectedTeam, selectedChannel, activeTab]);

  // Handle Microsoft connection change
  const handleMicrosoftConnectionChange = (isConnected: boolean) => {
    if (isConnected && !microsoftConnected) {
      // Only when changing from disconnected to connected
      hasAttemptedInitialLoad.current = false; // Reset the flag to allow a new load
    }
    setMicrosoftConnected(isConnected);
  };

  // Fetch Teams data using Microsoft Graph API
  const fetchTeamsData = async () => {
    if (loading) return; // Prevent concurrent calls
    
    setLoading(true);
    setError(null);
    
    try {
      // Initialize MSAL first to prevent "uninitialized" errors
      await initializeMsal();
      
      const account = getSignedInAccount();
      if (!account) {
        setError('No Microsoft account connected. Please connect your account.');
        setLoading(false);
        return;
      }
      
      const accessToken = await getAccessToken(account);
      if (!accessToken) {
        setError('Failed to get Microsoft access token. Please reconnect your account.');
        setLoading(false);
        return;
      }

      // Fetch teams the user is a member of
      const teamsResponse = await fetch('https://graph.microsoft.com/v1.0/me/joinedTeams', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!teamsResponse.ok) {
        throw new Error(`Error fetching teams: ${teamsResponse.statusText}`);
      }

      const teamsData = await teamsResponse.json();
      const teamsWithChannels: Team[] = [];

      // For each team, fetch its channels
      for (const team of teamsData.value) {
        const channelsResponse = await fetch(`https://graph.microsoft.com/v1.0/teams/${team.id}/channels`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!channelsResponse.ok) {
          console.error(`Error fetching channels for team ${team.id}: ${channelsResponse.statusText}`);
          continue;
        }

        const channelsData = await channelsResponse.json();
        
        teamsWithChannels.push({
          id: team.id,
          displayName: team.displayName,
          description: team.description || 'No description',
          channels: channelsData.value.map((channel: any) => ({
            id: channel.id,
            displayName: channel.displayName,
            description: channel.description || 'No description',
            webUrl: channel.webUrl
          }))
        });
      }

      setTeams(teamsWithChannels);
      
      // Select first team and channel by default if available
      if (teamsWithChannels.length > 0 && !selectedTeam) {
        setSelectedTeam(teamsWithChannels[0].id);
        if (teamsWithChannels[0].channels.length > 0) {
          setSelectedChannel(teamsWithChannels[0].channels[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching Teams data:', error);
      setError('Failed to fetch Teams data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch channel messages
  const fetchChannelMessages = async (teamId: string, channelId: string) => {
    setMessagesLoading(true);
    
    try {
      // Initialize MSAL first to prevent "uninitialized" errors
      await initializeMsal();
      
      const account = getSignedInAccount();
      if (!account) return;
      
      const accessToken = await getAccessToken(account);
      if (!accessToken) return;
      
      const response = await fetch(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/messages`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching channel messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      const channelKey = `${teamId}-${channelId}`;
      
      // Map the MS Graph message format to our internal format
      setChannelMessages(prev => ({
        ...prev,
        [channelKey]: data.value
      }));
    } catch (error) {
      console.error('Error fetching channel messages:', error);
      toast.error('Failed to load channel messages');
    } finally {
      setMessagesLoading(false);
    }
  };
  
  // Fetch channel files
  const fetchChannelFiles = async (teamId: string, channelId: string) => {
    setFilesLoading(true);
    
    try {
      // Initialize MSAL first to prevent "uninitialized" errors
      await initializeMsal();
      
      const account = getSignedInAccount();
      if (!account) return;
      
      const accessToken = await getAccessToken(account);
      if (!accessToken) return;
      
      // First, get the drive and folder
      const folderResponse = await fetch(`https://graph.microsoft.com/v1.0/teams/${teamId}/channels/${channelId}/filesFolder`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!folderResponse.ok) {
        throw new Error(`Error fetching files folder: ${folderResponse.statusText}`);
      }
      
      const folderData = await folderResponse.json();
      const parentReference = folderData.parentReference;
      
      // Then get the files in that folder
      const filesResponse = await fetch(`https://graph.microsoft.com/v1.0/drives/${parentReference.driveId}/items/${folderData.id}/children`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!filesResponse.ok) {
        throw new Error(`Error fetching files: ${filesResponse.statusText}`);
      }
      
      const filesData = await filesResponse.json();
      const channelKey = `${teamId}-${channelId}`;
      
      setChannelFiles(prev => ({
        ...prev,
        [channelKey]: filesData.value.filter((file: any) => !file.folder) // Filter out folders
      }));
    } catch (error) {
      console.error('Error fetching channel files:', error);
      toast.error('Failed to load channel files');
    } finally {
      setFilesLoading(false);
    }
  };

  // Post a new message
  const sendChannelMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !selectedTeam || !selectedChannel) return;
    
    try {
      // Initialize MSAL first to prevent "uninitialized" errors
      await initializeMsal();
      
      const account = getSignedInAccount();
      if (!account) {
        toast.error('No Microsoft account connected');
        return;
      }
      
      const accessToken = await getAccessToken(account);
      if (!accessToken) {
        toast.error('Failed to get access token');
        return;
      }
      
      // Format the message content
      const message = {
        body: {
          content: newPost,
          contentType: "text"
        }
      };
      
      const response = await fetch(`https://graph.microsoft.com/v1.0/teams/${selectedTeam}/channels/${selectedChannel}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });
      
      if (!response.ok) {
        throw new Error(`Error posting message: ${response.statusText}`);
      }
      
      // Refresh channel messages
      fetchChannelMessages(selectedTeam, selectedChannel);
      setNewPost('');
      toast.success('Message posted successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to post message. Make sure you have the right permissions.');
    }
  };

  const manualRefresh = () => {
    const now = Date.now();
    if (now - lastApiCallTime.current > 2000) { // Allow manual refresh with shorter cooldown
      lastApiCallTime.current = now;
      // Reset the attempt flag to allow a fresh load
      hasAttemptedInitialLoad.current = false;
      fetchTeamsData();
      
      // Refresh current channel data if applicable
      if (selectedTeam && selectedChannel) {
        if (activeTab === 'posts') {
          fetchChannelMessages(selectedTeam, selectedChannel);
        } else if (activeTab === 'files') {
          fetchChannelFiles(selectedTeam, selectedChannel);
        }
      }
    } else {
      toast.error("Please wait before refreshing again");
    }
  };

  const handleTeamSelect = (teamId: string) => {
    setSelectedTeam(teamId);
    
    // Select the first channel of the team by default
    const team = teams.find(t => t.id === teamId);
    if (team && team.channels.length > 0) {
      setSelectedChannel(team.channels[0].id);
    } else {
      setSelectedChannel(null);
    }
  };

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
  };

  const getSelectedTeamAndChannel = () => {
    const team = teams.find(t => t.id === selectedTeam);
    if (!team) return { team: null, channel: null };
    
    const channel = team.channels.find(c => c.id === selectedChannel);
    return { team, channel };
  };

  const { team, channel } = getSelectedTeamAndChannel();
  const channelKey = selectedTeam && selectedChannel ? `${selectedTeam}-${selectedChannel}` : '';
  
  const currentMessages = channelKey && channelMessages[channelKey] ? channelMessages[channelKey] : [];
  const currentFiles = channelKey && channelFiles[channelKey] ? channelFiles[channelKey] : [];
  const currentEvents = channelKey && channelEvents[channelKey] ? channelEvents[channelKey] : [];

  // Add this useEffect clause to fetch events when tab changes to schedule
  useEffect(() => {
    if (selectedTeam && selectedChannel && activeTab === 'schedule') {
      const channelKey = `${selectedTeam}-${selectedChannel}`;
      if (!channelEvents[channelKey]) {
        fetchChannelEvents(selectedTeam, selectedChannel);
      }
    }
  }, [selectedTeam, selectedChannel, activeTab]);

  // Fetch channel calendar events
  const fetchChannelEvents = async (teamId: string, channelId: string) => {
    setEventsLoading(true);
    
    try {
      // Initialize MSAL first to prevent "uninitialized" errors
      await initializeMsal();
      
      const account = getSignedInAccount();
      if (!account) return;
      
      const accessToken = await getAccessToken(account);
      if (!accessToken) return;
      
      // Get events from the team calendar
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const startDate = today.toISOString();
      const endDate = nextMonth.toISOString();
      
      // Fetch team events
      const eventsResponse = await fetch(
        `https://graph.microsoft.com/v1.0/groups/${teamId}/events?$filter=start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'&$orderby=start/dateTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!eventsResponse.ok) {
        if (eventsResponse.status === 404) {
          // If 404, the team doesn't have a group calendar, fetch user calendar instead
          const userEventsResponse = await fetch(
            `https://graph.microsoft.com/v1.0/me/calendar/events?$filter=start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'&$orderby=start/dateTime`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (userEventsResponse.ok) {
            const eventsData = await userEventsResponse.json();
            const channelKey = `${teamId}-${channelId}`;
            
            setChannelEvents(prev => ({
              ...prev,
              [channelKey]: eventsData.value
            }));
            return;
          }
        }
        
        throw new Error(`Error fetching events: ${eventsResponse.statusText}`);
      }
      
      const eventsData = await eventsResponse.json();
      const channelKey = `${teamId}-${channelId}`;
      
      setChannelEvents(prev => ({
        ...prev,
        [channelKey]: eventsData.value
      }));
    } catch (error) {
      console.error('Error fetching channel events:', error);
      toast.error('Failed to load calendar events');
    } finally {
      setEventsLoading(false);
    }
  };

  // Add this helper function for formatting dates in the schedule display
  const formatEventTime = (dateTimeString: string, timeZone: string) => {
    const date = new Date(dateTimeString);
    const options: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    };
    return date.toLocaleTimeString(undefined, options);
  };

  const formatEventDate = (dateTimeString: string, timeZone: string) => {
    const date = new Date(dateTimeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.getDate() === today.getDate() && 
                   date.getMonth() === today.getMonth() && 
                   date.getFullYear() === today.getFullYear();
    
    const isTomorrow = date.getDate() === tomorrow.getDate() && 
                      date.getMonth() === tomorrow.getMonth() && 
                      date.getFullYear() === tomorrow.getFullYear();
                      
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-200">Microsoft Teams Channels</h1>
          <p className="text-gray-400 mt-1">View and access your Teams channels</p>
        </div>
        <button 
          onClick={manualRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Microsoft Connection Status */}
      {!microsoftConnected && (
        <div className="bg-[#1a1f2b] rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-medium text-gray-200 mb-2">Microsoft Teams Integration</h2>
          <p className="text-gray-400 mb-4">Connect your Microsoft account to view your Teams channels.</p>
          
          <MicrosoftAuth onConnectionChange={handleMicrosoftConnectionChange} />
          
          {error && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Teams UI */}
      {microsoftConnected && (
        <div className="bg-[#1a1f2b] rounded-xl shadow-lg overflow-hidden">
          {loading && teams.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">Loading your Teams data...</p>
            </div>
          ) : teams.length > 0 ? (
            <div className="flex h-[70vh]">
              {/* Teams/Channels Sidebar */}
              <div className="w-64 border-r border-gray-700 overflow-y-auto">
                <div className="p-4">
                  <h3 className="text-gray-300 font-medium mb-2">Teams</h3>
                  <ul className="space-y-1">
                    {teams.map(t => (
                      <li key={t.id}>
                        <button
                          onClick={() => handleTeamSelect(t.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg ${selectedTeam === t.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-[#242935]'}`}
                        >
                          {t.displayName}
                        </button>
                        
                        {selectedTeam === t.id && (
                          <ul className="ml-4 mt-1 space-y-1">
                            {t.channels.map(c => (
                              <li key={c.id}>
                                <button
                                  onClick={() => handleChannelSelect(c.id)}
                                  className={`w-full text-left px-3 py-1.5 rounded-lg ${selectedChannel === c.id ? 'bg-blue-600/60 text-white' : 'text-gray-400 hover:bg-[#242935]'}`}
                                >
                                  # {c.displayName}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Channel Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {channel ? (
                  <>
                    {/* Channel Header */}
                    <div className="border-b border-gray-700 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-200"># {channel.displayName}</h2>
                          <p className="text-gray-400 text-sm">{channel.description}</p>
                        </div>
                        <a 
                          href={channel.webUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Open in Teams
                        </a>
                      </div>
                      
                      {/* Channel Tabs */}
                      <div className="flex space-x-4 mt-4">
                        <button
                          onClick={() => setActiveTab('posts')}
                          className={`px-3 py-1.5 rounded-lg ${activeTab === 'posts' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                          Posts
                        </button>
                        <button
                          onClick={() => setActiveTab('files')}
                          className={`px-3 py-1.5 rounded-lg ${activeTab === 'files' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                          Files
                        </button>
                        <button
                          onClick={() => setActiveTab('schedule')}
                          className={`px-3 py-1.5 rounded-lg ${activeTab === 'schedule' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                          Schedule
                        </button>
                        <button
                          onClick={() => setActiveTab('board')}
                          className={`px-3 py-1.5 rounded-lg ${activeTab === 'board' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}
                        >
                          Board (Coming Soon)
                        </button>
                      </div>
                    </div>
                    
                    {/* Channel Content based on active tab */}
                    <div className="flex-1 overflow-y-auto p-4">
                      {activeTab === 'posts' && (
                        <div className="space-y-6">
                          {/* New Post Form */}
                          <form onSubmit={sendChannelMessage} className="mb-6">
                            <textarea
                              value={newPost}
                              onChange={e => setNewPost(e.target.value)}
                              placeholder="Start a new conversation..."
                              className="w-full p-3 bg-[#242935] text-gray-200 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              rows={3}
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                type="submit"
                                disabled={!newPost.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Post
                              </button>
                            </div>
                          </form>
                          
                          {/* Posts List */}
                          {messagesLoading ? (
                            <div className="text-center py-4">
                              <p className="text-gray-400">Loading messages...</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {currentMessages.map((message: ChannelMessage) => (
                                <div key={message.id} className="bg-[#242935] rounded-lg p-4">
                                  <div className="flex items-start">
                                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium">
                                      {message.from && message.from.user && message.from.user.displayName 
                                        ? message.from.user.displayName.charAt(0) 
                                        : '?'}
                                    </div>
                                    <div className="ml-3 flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-200">
                                          {message.from && message.from.user && message.from.user.displayName 
                                            ? message.from.user.displayName 
                                            : 'Unknown'}
                                        </span>
                                        <span className="text-xs text-gray-400">{formatDate(message.createdDateTime)}</span>
                                      </div>
                                      <div 
                                        className="mt-1 text-gray-300 whitespace-pre-wrap" 
                                        dangerouslySetInnerHTML={{ __html: message.content }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {currentMessages.length === 0 && !messagesLoading && (
                                <div className="text-center py-8">
                                  <p className="text-gray-400">No messages in this channel. Start a conversation!</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'files' && (
                        <div className="space-y-4">
                          {filesLoading ? (
                            <div className="text-center py-4">
                              <p className="text-gray-400">Loading files...</p>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-medium text-gray-200">Files</h3>
                              
                              {currentFiles.length > 0 ? (
                                <div className="bg-[#242935] rounded-lg overflow-hidden">
                                  <div className="grid grid-cols-12 text-sm font-medium text-gray-300 p-3 border-b border-gray-700">
                                    <div className="col-span-6">Name</div>
                                    <div className="col-span-3">Modified</div>
                                    <div className="col-span-2">Size</div>
                                    <div className="col-span-1"></div>
                                  </div>
                                  
                                  <div className="divide-y divide-gray-700">
                                    {currentFiles.map((file: File) => (
                                      <div key={file.id} className="grid grid-cols-12 p-3 hover:bg-[#2d3544] transition-colors">
                                        <div className="col-span-6 text-gray-200 truncate">{file.name}</div>
                                        <div className="col-span-3 text-gray-400 text-sm">
                                          {formatDate(file.lastModifiedDateTime)}
                                        </div>
                                        <div className="col-span-2 text-gray-400 text-sm">
                                          {formatFileSize(file.size)}
                                        </div>
                                        <div className="col-span-1 text-right">
                                          <a 
                                            href={file.webUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-400 hover:text-blue-300 text-sm"
                                          >
                                            Open
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-8">
                                  <p className="text-gray-400">No files in this channel yet.</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'schedule' && (
                        <div className="space-y-4">
                          {eventsLoading ? (
                            <div className="text-center py-4">
                              <p className="text-gray-400">Loading calendar events...</p>
                            </div>
                          ) : (
                            <>
                              <h3 className="text-lg font-medium text-gray-200">Upcoming Meetings</h3>
                              
                              {currentEvents.length > 0 ? (
                                <div className="space-y-4">
                                  {/* Group events by date */}
                                  {(() => {
                                    const eventsByDate: Record<string, CalendarEvent[]> = {};
                                    
                                    currentEvents.forEach(event => {
                                      const dateKey = formatEventDate(event.start.dateTime, event.start.timeZone);
                                      if (!eventsByDate[dateKey]) {
                                        eventsByDate[dateKey] = [];
                                      }
                                      eventsByDate[dateKey].push(event);
                                    });
                                    
                                    return Object.entries(eventsByDate).map(([date, events]) => (
                                      <div key={date} className="bg-[#242935] rounded-lg overflow-hidden">
                                        <div className="bg-gray-700 px-4 py-2 font-medium text-white">
                                          {date}
                                        </div>
                                        <div className="divide-y divide-gray-700">
                                          {events.map(event => (
                                            <div key={event.id} className="p-4 hover:bg-[#2d3544] transition-colors">
                                              <div className="flex items-start">
                                                <div className="flex-shrink-0 w-16 text-center">
                                                  <p className="text-gray-300 font-medium">
                                                    {formatEventTime(event.start.dateTime, event.start.timeZone)}
                                                  </p>
                                                </div>
                                                <div className="ml-4 flex-1">
                                                  <h4 className="text-gray-200 font-medium">{event.subject}</h4>
                                                  <div className="mt-1 flex items-center text-sm text-gray-400">
                                                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>
                                                      {formatEventTime(event.start.dateTime, event.start.timeZone)} - 
                                                      {formatEventTime(event.end.dateTime, event.end.timeZone)}
                                                    </span>
                                                  </div>
                                                  {event.location && event.location.displayName && (
                                                    <div className="mt-1 flex items-center text-sm text-gray-400">
                                                      <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                                      </svg>
                                                      <span>{event.location.displayName}</span>
                                                    </div>
                                                  )}
                                                  <div className="mt-1 flex items-center text-sm text-gray-400">
                                                    <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>{event.organizer.emailAddress.name}</span>
                                                  </div>
                                                  {event.isOnlineMeeting && event.onlineMeetingUrl && (
                                                    <div className="mt-2">
                                                      <a 
                                                        href={event.onlineMeetingUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center px-3 py-1 bg-blue-600/20 text-blue-400 rounded-md hover:bg-blue-600/30 transition-colors"
                                                      >
                                                        <svg className="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                                        </svg>
                                                        Join Meeting
                                                      </a>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-[#242935] rounded-lg">
                                  <p className="text-gray-400">No upcoming meetings found.</p>
                                  <a 
                                    href={channel.webUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Schedule in Teams
                                  </a>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'board' && (
                        <div className="text-center py-8">
                          <p className="text-gray-400">Board view is coming soon. This feature will display real Planner tasks from Microsoft Teams.</p>
                          <p className="text-gray-400 mt-2">In the meantime, you can access the board in the Teams app directly.</p>
                          <a 
                            href={channel.webUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Open Teams
                          </a>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-gray-400">Select a channel to view its content</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-400">No teams found. You might not be a member of any teams.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamsChannels; 