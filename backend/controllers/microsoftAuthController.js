import { Client } from '@microsoft/microsoft-graph-client';
import prisma from '../config/prisma.js';
import crypto from 'crypto';

export const microsoftAuthController = {
  // Get Microsoft OAuth URL with PKCE
  getAuthUrl(req, res) {
    const clientId = process.env.MS_TEAMS_CLIENT_ID;
    const redirectUri = `${process.env.FRONTEND_URL}/auth/microsoft/callback`;
    const scope = 'openid profile email offline_access Calendars.ReadWrite OnlineMeetings.ReadWrite';
    
    // Generate PKCE challenge
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');

    // Store verifier in session
    req.session.codeVerifier = verifier;
    
    const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `response_mode=query&` +
      `code_challenge=${challenge}&` +
      `code_challenge_method=S256`;

    res.json({ authUrl, codeVerifier: verifier });
  },

  // Handle Microsoft OAuth callback with PKCE
  async handleCallback(req, res) {
    try {
      const { code, codeVerifier } = req.body;
      const clientId = process.env.MS_TEAMS_CLIENT_ID;
      const clientSecret = process.env.MS_TEAMS_CLIENT_SECRET;
      const redirectUri = `${process.env.FRONTEND_URL}/auth/microsoft/callback`;

      // Exchange code for tokens with PKCE
      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
          scope: 'openid profile email offline_access Calendars.ReadWrite OnlineMeetings.ReadWrite',
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || 'Failed to get access token');
      }

      // Get user info from Microsoft Graph
      const graphClient = Client.init({
        authProvider: (done) => {
          done(null, tokens.access_token);
        }
      });

      const userInfo = await graphClient.api('/me').get();

      // Update user in database with Microsoft tokens
      await prisma.user.update({
        where: { id: req.user.id },
        data: {
          microsoftAccessToken: tokens.access_token,
          microsoftRefreshToken: tokens.refresh_token,
          microsoftTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error in Microsoft auth callback:', error);
      res.status(500).json({ error: 'Failed to authenticate with Microsoft' });
    }
  },

  // Refresh Microsoft token
  async refreshToken(req, res) {
    try {
      const user = req.user;
      const clientId = process.env.MS_TEAMS_CLIENT_ID;
      const clientSecret = process.env.MS_TEAMS_CLIENT_SECRET;

      const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: user.microsoftRefreshToken,
          grant_type: 'refresh_token',
          scope: 'openid profile email offline_access Calendars.ReadWrite OnlineMeetings.ReadWrite',
        }),
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || 'Failed to refresh token');
      }

      // Update user's tokens in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          microsoftAccessToken: tokens.access_token,
          microsoftRefreshToken: tokens.refresh_token,
          microsoftTokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        },
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Error refreshing Microsoft token:', error);
      res.status(500).json({ error: 'Failed to refresh Microsoft token' });
    }
  },

  async checkConnection(req, res) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ connected: false });
      }
      const now = new Date();
      if (
        user.microsoftAccessToken &&
        user.microsoftTokenExpiresAt &&
        new Date(user.microsoftTokenExpiresAt) > now
      ) {
        return res.json({ connected: true });
      } else {
        return res.json({ connected: false });
      }
    } catch (error) {
      console.error('Error checking Microsoft connection:', error);
      res.status(500).json({ connected: false });
    }
  },
}; 