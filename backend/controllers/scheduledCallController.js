import { v4 as uuidv4 } from 'uuid';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch'; // Make sure this is imported
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js';
import { ClientSecretCredential } from '@azure/identity';
import axios from 'axios'; // Import axios for direct API calls
import prisma from '../config/prisma.js';

export const scheduledCallController = {
  // Create a new scheduled call
  async createCall(req, res) {
    try {
      const { title, description, startTime, endTime, clientId, consultantId, accessToken } = req.body;
      const user = req.user;

      // Validate required fields
      if (!title || !startTime || !endTime) {
        return res.status(400).json({ 
          error: 'Missing required fields. Please provide title, startTime, and endTime.' 
        });
      }
      
      // Strict token validation
      if (!accessToken || typeof accessToken !== 'string' || accessToken.trim() === '') {
        return res.status(400).json({ 
          error: 'Microsoft Teams access token is missing or invalid. Please reconnect your Microsoft account.' 
        });
      }

      // Ensure startTime and endTime are valid dates
      const parsedStartTime = new Date(startTime);
      const parsedEndTime = new Date(endTime);
      
      if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        return res.status(400).json({ error: 'Invalid date format for startTime or endTime' });
      }

      // Log token for debugging (only prefix for security)
      const tokenPrefix = accessToken.substring(0, 10) + '...';
      console.log(`Using Microsoft Graph token prefix: ${tokenPrefix}, length: ${accessToken.length}`);

      try {
        // Use the Outlook Calendar API to create a meeting
        // Instead of onlineMeetings API which requires specific permissions and formats
        const meetingRequest = {
          subject: title,
          body: {
            contentType: "HTML",
            content: description || "Meeting details will be discussed during the call."
          },
          start: {
            dateTime: parsedStartTime.toISOString(),
            timeZone: "UTC"
          },
          end: {
            dateTime: parsedEndTime.toISOString(),
            timeZone: "UTC"
          },
          // Ensure the meeting is created as an online meeting
          isOnlineMeeting: true,
          onlineMeetingProvider: "teamsForBusiness",
          // If we know the attendee emails, we can add them
          attendees: [
            {
              emailAddress: {
                address: user.email,
                name: user.name || user.email.split('@')[0]
              },
              type: "required"
            }
          ]
        };

        console.log('Creating calendar event with Teams meeting:', JSON.stringify(meetingRequest));

        // Direct API call using fetch
        const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(meetingRequest)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Microsoft Graph API Error:', errorData);
          throw new Error(`Microsoft API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const meeting = await response.json();
        
        // Get the Teams meeting link from the response
        const teamsMeetingLink = meeting.onlineMeeting?.joinUrl || meeting.webLink;
        
        if (!teamsMeetingLink) {
          throw new Error('Meeting created but no join URL was returned');
        }

        console.log('Meeting created successfully, link:', teamsMeetingLink);

        // Create the call record in database
        const call = await prisma.scheduledCall.create({
          data: {
            id: uuidv4(),
            title,
            description,
            startTime: parsedStartTime,
            endTime: parsedEndTime,
            teamsMeetingLink,
            clientId,
            consultantId,
          },
          include: {
            client: {
              select: {
                id: true,
                email: true,
              },
            },
            consultant: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        });

        res.status(201).json(call);
      } catch (graphError) {
        console.error('Error creating Teams meeting:', graphError);
        
        // Fall back to creating a regular calendar event without Teams integration
        try {
          console.log('Attempting fallback to regular calendar event...');
          
          // Create a simpler calendar event without Teams meeting
          const simpleEvent = {
            subject: title,
            body: {
              contentType: "HTML",
              content: description || "Meeting details will be discussed."
            },
            start: {
              dateTime: parsedStartTime.toISOString(),
              timeZone: "UTC"
            },
            end: {
              dateTime: parsedEndTime.toISOString(),
              timeZone: "UTC"
            }
          };
          
          // Use axios as a different approach
          const eventResponse = await axios.post(
            'https://graph.microsoft.com/v1.0/me/events',
            simpleEvent,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          const regularEvent = eventResponse.data;
          const eventLink = regularEvent.webLink;
          
          console.log('Created regular calendar event:', eventLink);
          
          // Create the call record in database with regular event link
          const call = await prisma.scheduledCall.create({
            data: {
              id: uuidv4(),
              title,
              description,
              startTime: parsedStartTime,
              endTime: parsedEndTime,
              teamsMeetingLink: eventLink, // Using regular event link instead
              clientId,
              consultantId,
            },
            include: {
              client: {
                select: {
                  id: true,
                  email: true,
                },
              },
              consultant: {
                select: {
                  id: true,
                  email: true,
                },
              },
            },
          });
          
          // Success, but with a note that it's not a Teams meeting
          return res.status(201).json({
            ...call,
            note: "Created as a regular calendar event instead of Teams meeting"
          });
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          // Return a helpful error message
          return res.status(500).json({ 
            error: 'Could not create meeting in Microsoft Calendar.',
            details: 'Please check your Microsoft permissions and try again.',
            originalError: graphError.message,
            fallbackError: fallbackError.message
          });
        }
      }
    } catch (error) {
      console.error('Error creating scheduled call:', error);
      res.status(500).json({ 
        error: 'Failed to create scheduled call',
        details: error.message || 'Unknown error'
      });
    }
  },

  // Get all scheduled calls for a user
  async getCalls(req, res) {
    try {
      const calls = await prisma.scheduledCall.findMany({
        where: {
          OR: [
            { clientId: req.user.id },
            { consultantId: req.user.id },
          ],
        },
        include: {
          client: {
            select: {
              id: true,
              email: true,
            },
          },
          consultant: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });

      res.json(calls);
    } catch (error) {
      console.error('Error fetching calls:', error);
      res.status(500).json({ error: 'Failed to fetch calls' });
    }
  },

  // Update a scheduled call
  async updateCall(req, res) {
    try {
      const { id } = req.params;
      const { title, description, startTime, endTime, status } = req.body;

      const call = await prisma.scheduledCall.update({
        where: { id },
        data: {
          title,
          description,
          startTime: startTime ? new Date(startTime) : undefined,
          endTime: endTime ? new Date(endTime) : undefined,
          status,
        },
        include: {
          client: {
            select: {
              id: true,
              email: true,
            },
          },
          consultant: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      res.json(call);
    } catch (error) {
      console.error('Error updating call:', error);
      res.status(500).json({ error: 'Failed to update call' });
    }
  },

  // Delete a scheduled call
  async deleteCall(req, res) {
    try {
      const { id } = req.params;

      await prisma.scheduledCall.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting call:', error);
      res.status(500).json({ error: 'Failed to delete call' });
    }
  },
}; 