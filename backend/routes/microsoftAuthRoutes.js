import express from 'express';
import axios from 'axios';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import { microsoftAuthController } from '../controllers/microsoftAuthController.js';
import { authenticateToken } from '../middlewares/auth.js';
import prisma from '../config/prisma.js';
const router = express.Router();

// Microsoft OAuth configuration
const clientId = process.env.MS_TEAMS_CLIENT_ID;
const clientSecret = process.env.MS_TEAMS_CLIENT_SECRET;
const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
const tenantId = process.env.MS_TEAMS_TENANT_ID;

// Initialize Microsoft Graph client
const getGraphClient = (accessToken) => {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    }
  });
};

// Route to initiate Microsoft authentication
router.get('/auth-url', (req, res) => {
  const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
    `client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&scope=offline_access%20user.read%20calendars.readwrite%20onlineMeetings.readwrite` +
    `&response_mode=query`;

  res.redirect(authUrl);
});

// Route to handle Microsoft OAuth callback
router.get('/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    // Exchange code for access token
    const tokenResponse = await axios.post(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        scope: 'offline_access user.read calendars.readwrite onlineMeetings.readwrite'
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    // Store access token in session
    req.session.microsoftAccessToken = tokenResponse.data.access_token;
    req.session.microsoftRefreshToken = tokenResponse.data.refresh_token;
    req.session.microsoftTokenExpiresAt = Date.now() + (tokenResponse.data.expires_in * 1000);

    // Redirect to frontend with success message
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=success`);
  } catch (error) {
    console.error('Microsoft OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?auth=error`);
  }
});

// Route to schedule a Teams meeting
router.post('/schedule-meeting', async (req, res) => {
  try {
    const { subject, startTime, endTime, attendees } = req.body;

    // Check if user is authenticated
    if (!req.session.microsoftAccessToken) {
      return res.status(401).json({ error: 'Not authenticated with Microsoft' });
    }

    // Check if token is expired
    if (Date.now() >= req.session.microsoftTokenExpiresAt) {
      // Refresh token
      const tokenResponse = await axios.post(
        `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
        {
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: req.session.microsoftRefreshToken,
          grant_type: 'refresh_token',
          scope: 'offline_access user.read calendars.readwrite onlineMeetings.readwrite'
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      // Update session with new tokens
      req.session.microsoftAccessToken = tokenResponse.data.access_token;
      req.session.microsoftRefreshToken = tokenResponse.data.refresh_token;
      req.session.microsoftTokenExpiresAt = Date.now() + (tokenResponse.data.expires_in * 1000);
    }

    const client = getGraphClient(req.session.microsoftAccessToken);

    // Create online meeting
    const meeting = await client
      .api('/me/onlineMeetings')
      .post({
        subject,
        startDateTime: startTime,
        endDateTime: endTime,
        participants: {
          attendees: attendees.map(email => ({
            upn: email,
            type: 'required'
          }))
        }
      });

    res.json(meeting);
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
});

// Route to get user's calendar events
router.get('/calendar-events', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session.microsoftAccessToken) {
      return res.status(401).json({ error: 'Not authenticated with Microsoft' });
    }

    const client = getGraphClient(req.session.microsoftAccessToken);

    // Get calendar events
    const events = await client
      .api('/me/calendar/events')
      .get();

    res.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// Route to check if user is connected to Microsoft
router.get('/check-connection', authenticateToken, microsoftAuthController.checkConnection);

// Route to receive the access token from the MSAL auth flow
router.post('/connect', authenticateToken, async (req, res) => {
  try {
    const { accessToken } = req.body;
    
    // Strict token validation
    if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
      return res.status(400).json({ error: 'Valid access token is required' });
    }

    // Log token prefix for debugging
    const tokenPrefix = accessToken.substring(0, 10) + '...';
    console.log(`Connecting Microsoft account with token prefix: ${tokenPrefix}, length: ${accessToken.length}`);

    // Initialize Graph client with the provided token
    const graphClient = Client.init({
      authProvider: (done) => {
        if (!accessToken) {
          done(new Error('Access token is null or empty'), null);
          return;
        }
        done(null, accessToken);
      }
    });

    try {
      // Test the token by getting the user's profile
      const userInfo = await graphClient.api('/me').get();
      
      if (!userInfo || !userInfo.id) {
        throw new Error('Invalid user information returned from Microsoft Graph API');
      }
      
      console.log(`Successfully verified Microsoft account for user: ${userInfo.displayName || userInfo.userPrincipalName}`);

      // Update the user record with the access token
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          microsoftAccessToken: accessToken,
          microsoftTokenExpiresAt: new Date(Date.now() + 3600 * 1000), // Typically tokens expire in 1 hour
        },
      });

      res.json({ success: true, userInfo });
    } catch (graphError) {
      console.error('Error validating Microsoft token:', graphError);
      
      // Check if this is an authentication error
      if (graphError.statusCode === 401 || 
          (graphError.message && graphError.message.toLowerCase().includes('auth'))) {
        return res.status(401).json({ 
          error: 'Microsoft authentication failed. The token appears to be invalid or expired.' 
        });
      }
      
      throw graphError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Error connecting Microsoft account:', error);
    res.status(500).json({ 
      error: 'Failed to connect Microsoft account',
      details: error.message || 'Unknown error'
    });
  }
});

export default router; 