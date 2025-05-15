import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendClientDiscoveryInvitation, sendClientScopingNotification } from '../utils/emailService.js';

const prisma = new PrismaClient();

/**
 * Create a new client
 * @route POST /api/clients
 * @access Public
 */
export const createClient = async (req, res, next) => {
  try {
    const { 
      email, 
      password, 
      fullName,
      organization,
      phoneNumber,
      additionalContact,
      requestedServices,
      discoveryMethod,
      scopingDetails,
      interviewDate,
      interviewTime,
      termsAccepted,
      // Fields to be stored in otherDetails
      address,
      country,
      state,
      city,
      postalCode,
      industry,
      companySize,
      website,
      otherDetails 
    } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already in use' 
      });
    }

    // Validate required fields
    if (!email || !password || !fullName || !phoneNumber || !organization) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, fullName, phoneNumber and organization are required'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user and client profile in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user with CLIENT role
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'CLIENT',
        },
        select: {
          id: true,
          email: true,
          role: true
        }
      });

      // Prepare otherDetails as JSON string
      const otherDetailsJson = JSON.stringify({
        address: address || null,
        country: country || null,
        state: state || null,
        city: city || null,
        postalCode: postalCode || null,
        industry: industry || null,
        companySize: companySize || null,
        website: website || null,
        ...otherDetails && typeof otherDetails === 'object' ? otherDetails : {}
      });

      // Create client profile with fields that match schema
      const clientProfile = await prisma.clientProfile.create({
        data: {
          userId: user.id,
          fullName,
          organization,
          phoneNumber,
          additionalContact: additionalContact || null,
          requestedServices: requestedServices || [],
          otherDetails: otherDetailsJson,
          discoveryMethod: discoveryMethod || null,
          scopingDetails: scopingDetails || null,
          interviewDate: interviewDate || null,
          interviewTime: interviewTime || null,
          termsAccepted: termsAccepted || false,
          currentStep: 0,
          onboardingStatus: 'NOT_STARTED'
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        }
      });

      return {
        user: user,
        clientProfile: clientProfile
      };
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Client creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during client creation'
    });
  }
};

/**
 * Get all clients
 * @route GET /api/clients
 * @access Private
 */
export const getClients = async (req, res, next) => {
  try {
    const clientProfile = await prisma.clientProfile.findMany({
        include: { user: { select: { id: true, email: true, role: true } } },
      });
    
    res.status(200).json({
      success: true,
      count: clientProfile.length,
      data: clientProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get clients by onboarding status
 * @route GET /api/clients/by-status/:status
 * @access Private/Admin
 */
export const getClientsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['PENDING_DISCOVERY', 'DISCOVERY_INVITED', 'DISCOVERY_SCHEDULED', 
                          'DISCOVERY_COMPLETED', 'SCOPING_IN_PROGRESS', 'SCOPING_REVIEW', 
                          'TERMS_PENDING', 'ONBOARDED', 'REJECTED'];
                          
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validOptions: validStatuses
      });
    }
    
    // Get clients with the requested status
    const clients = await prisma.clientProfile.findMany({
      where: { onboardingStatus: status },
      include: { 
        user: { 
          select: { 
            id: true, 
            email: true, 
            role: true 
          } 
        } 
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format the response
    const formattedClients = clients.map(client => ({
      id: client.id,
      userId: client.userId,
      fullName: client.fullName,
      organization: client.organization,
      email: client.user.email,
      phone: client.phoneNumber,
      onboardingStatus: client.onboardingStatus,
      isDiscoveryCallInvited: client.isDiscoveryCallInvited,
      discoveryCallDate: client.discoveryCallDate,
      termsAccepted: client.termsAccepted,
      requestedServices: client.requestedServices,
      createdAt: client.createdAt
    }));
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: formattedClients
    });
  } catch (error) {
    console.error('Get clients by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting clients by status',
      error: error.message
    });
  }
};

/**
 * Invite client for discovery call
 * @route POST /api/clients/:id/invite
 * @access Private/Admin
 */
export const inviteClientForDiscovery = async (req, res) => {
  try {
    const { id } = req.params;
    const { callLink, scheduledDate } = req.body;
    
    // Find the client
    const client = await prisma.clientProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Send invitation email (fixed function call)
    await sendClientDiscoveryInvitation(client, callLink);
    
    // Update client status
    const updatedClient = await prisma.clientProfile.update({
      where: { id },
      data: { 
        isDiscoveryCallInvited: true,
        onboardingStatus: scheduledDate ? 'DISCOVERY_SCHEDULED' : 'DISCOVERY_INVITED',
        discoveryCallDate: scheduledDate ? new Date(scheduledDate) : null,
        discoveryCallLink: callLink || null,
        discoveryCallStatus: scheduledDate ? 'scheduled' : 'invited'
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Discovery call invitation sent successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Discovery invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending discovery invitation',
      error: error.message
    });
  }
};

/**
 * Update client discovery call status
 * @route POST /api/clients/:id/discovery-status
 * @access Private/Admin
 */
export const updateDiscoveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    // Validate status
    const validStatuses = ['completed', 'cancelled', 'rescheduled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validOptions: validStatuses
      });
    }
    
    // Find the client
    const client = await prisma.clientProfile.findUnique({
      where: { id }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Determine onboarding status based on call status
    let onboardingStatus = client.onboardingStatus;
    if (status === 'completed') {
      onboardingStatus = 'DISCOVERY_COMPLETED';
    } else if (status === 'cancelled') {
      // No change in onboarding status
    } else if (status === 'rescheduled') {
      onboardingStatus = 'DISCOVERY_SCHEDULED';
    }
    
    // Update client
    const updatedClient = await prisma.clientProfile.update({
      where: { id },
      data: {
        discoveryCallStatus: status,
        adminReviewNotes: notes || client.adminReviewNotes,
        onboardingStatus
      }
    });
    
    res.status(200).json({
      success: true,
      message: `Discovery call marked as ${status}`,
      data: updatedClient
    });
  } catch (error) {
    console.error('Discovery status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating discovery status',
      error: error.message
    });
  }
};

/**
 * Update client scoping details
 * @route POST /api/clients/:id/scoping
 * @access Private/Admin
 */
export const updateClientScoping = async (req, res) => {
  try {
    const { id } = req.params;
    const { scopingDetails, notes } = req.body;
    
    if (!scopingDetails) {
      return res.status(400).json({
        success: false,
        message: 'Scoping details are required'
      });
    }
    
    // Find the client
    const client = await prisma.clientProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Update client with scoping details
    const updatedClient = await prisma.clientProfile.update({
      where: { id },
      data: {
        scopingDetails: typeof scopingDetails === 'string' ? JSON.parse(scopingDetails) : scopingDetails,
        adminReviewNotes: notes || client.adminReviewNotes,
        onboardingStatus: 'SCOPING_REVIEW'
      }
    });
    
    // Send notification email to client
    await sendClientScopingNotification(client);
    
    res.status(200).json({
      success: true,
      message: 'Scoping details updated successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Scoping update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating scoping details',
      error: error.message
    });
  }
};

/**
 * Update client terms acceptance
 * @route POST /api/clients/:id/terms
 * @access Private
 */
export const updateClientTerms = async (req, res) => {
  try {
    const { id } = req.params;
    const { termsAccepted } = req.body;
    
    // Validate input
    if (termsAccepted === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Terms acceptance status is required'
      });
    }
    
    // Find the client
    const client = await prisma.clientProfile.findUnique({
      where: { id }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Determine new onboarding status
    const onboardingStatus = termsAccepted ? 'ONBOARDED' : client.onboardingStatus;
    
    // Update client
    const updatedClient = await prisma.clientProfile.update({
      where: { id },
      data: {
        termsAccepted: !!termsAccepted,
        onboardingStatus
      }
    });
    
    res.status(200).json({
      success: true,
      message: termsAccepted ? 'Terms accepted' : 'Terms acceptance updated',
      data: updatedClient
    });
  } catch (error) {
    console.error('Terms update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating terms acceptance',
      error: error.message
    });
  }
};

/**
 * Reject client application
 * @route POST /api/clients/:id/reject
 * @access Private/Admin
 */
export const rejectClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Find the client
    const client = await prisma.clientProfile.findUnique({
      where: { id }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Update client
    const updatedClient = await prisma.clientProfile.update({
      where: { id },
      data: {
        onboardingStatus: 'REJECTED',
        rejectionReason: reason || null
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Client application rejected',
      data: updatedClient
    });
  } catch (error) {
    console.error('Client rejection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting client application',
      error: error.message
    });
  }
};

/**
 * Get client profile by user ID
 * @route GET /api/clients/user/:userId
 * @access Private
 */
export const getClientByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const client = await prisma.clientProfile.findUnique({
      where: { userId },
      include: { 
        user: { 
          select: { 
            id: true, 
            email: true, 
            role: true 
          } 
        }
      }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client found",
      data: client
    });
  } catch (error) {
    console.error('Error fetching client by userId:', error);
    return res.status(500).json({
      success: false,
      message: error.message || "An error occurred while fetching client"
    });
  }
};