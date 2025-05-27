import pkg from '@prisma/client';
const { PrismaClient } = pkg;import bcrypt from 'bcryptjs';
import { sendClientDiscoveryInvitation, sendClientScopingNotification } from '../utils/emailService.js';
import { uploadToAzure } from '../config/azureStorage.js';
import PDFDocument from 'pdfkit';

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
      serviceId, // Expect serviceId in the request body
      discoveryMethod,
      scopingDetails,
      interviewDate,
      interviewTime,
      termsAccepted,
      // Other details fields
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
    if (!email || !password || !fullName || !phoneNumber || !organization || !serviceId) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, fullName, phoneNumber, organization, and serviceId are required'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const mappedServiceId = await Promise.all(serviceId.map(async (service) => {
      const services = await prisma.service.findUnique({
        where: {
          name: service
        }
      })
      return services.id
    }))
    console.log("**********")
    console.log(mappedServiceId[0])
    console.log("**********")
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

      // Prepare otherDetails JSON
      const otherDetailsJson = JSON.stringify({
        address: address || null,
        country: country || null,
        state: state || null,
        city: city || null,
        postalCode: postalCode || null,
        industry: industry || null,
        companySize: companySize || null,
        website: website || null,
        ...(otherDetails && typeof otherDetails === 'object' ? otherDetails : {})
      });

      // Create client profile using the provided serviceId
      const clientProfile = await prisma.clientProfile.create({
        data: {
          userId: user.id,
          fullName,
          organization,
          phoneNumber,
          additionalContact: additionalContact || null,
          serviceId: mappedServiceId[0], // Assign the selected service
          otherDetails: otherDetailsJson,
          discoveryMethod: discoveryMethod || null,
          scopingDetails: scopingDetails || null,
          interviewDate: interviewDate || null,
          interviewTime: interviewTime || null,
          termsAccepted: termsAccepted || false,
          currentStep: 0,
          onboardingStatus: "NOT_STARTED"
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

      return { user, clientProfile };
    });

    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error("Client creation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "An error occurred during client creation"
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
        include: { user: { select: { id: true, email: true, role: true } }, service:true },
        orderBy: { createdAt: 'desc' }
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


export const updateClientStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedClient = await prisma.clientProfile.update({
      where: { id },
      data: {
        onboardingStatus: status
      }
    });

    res.status(200).json({
      success: true,
      message: 'Client status updated successfully',
      data: updatedClient
    });
  } catch (error) {
    console.error('Error updating client status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client status',
      error: error.message
    });
  }
};

const generateNDAPdf = async (clientName, clientEmail, signatureUrl, signatureData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ margin: 50 });
      
      // Buffer to collect PDF data
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // Add header
      doc.fontSize(20).font('Helvetica-Bold').text('Confidentiality Agreement', { align: 'center' });
      doc.moveDown();
      
      // Current date
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Add NDA content
      doc.fontSize(12).font('Helvetica');
      
      doc.text(`This Agreement (hereinafter referred to as this "Agreement") is made with effect from ${currentDate} (the "Effective Date") between Secureitlab Co W.L.L (hereinafter referred to as "SITL") whose principal offices are located at: Unit 23, Building 1431, Road 3624, Area 536, AI Diraz, Kingdom of Bahrain`);
      doc.moveDown();
      
      doc.text('and');
      doc.moveDown();
      
      doc.text(`2) The undersigned person: ${clientName} (${clientEmail})`);
      doc.moveDown();

      doc.text('2.1 member of SITL\'s staff on definite contracts and internships');
      doc.text('2.2 member of SITL\'s staff on indefinite contracts');
      doc.text('2.3 member of SITL\'s staff employed from sub-contractors.');
      doc.moveDown();

      doc.text('(any of which are hereinafter referred to as the "Employee")');
      doc.moveDown();

      doc.text('3) The Employee undertakes and confirms that all matters relating to SITL referred to as "SITL") shall be subject to this Agreement.');
      doc.moveDown();

      // NDA terms - adding a few key points (simplified for this implementation)
      doc.text('• The Employee hereby agrees to treat all Proprietary, Highly Confidential, Top-Secret Information defined below as confidential at all times and shall only use such Information solely for the purpose of conducting SITL business at all times.');
      doc.moveDown();
      
      doc.text('• For the purpose of this agreement Highly Confidential Information is a sensitive form of information. This information is distributed on a "Need to Know" basis only.');
      doc.moveDown();
      
      doc.text('• The Employee hereby agrees that with regard to such Proprietary Highly Confidential, Top Secret Information the Employee shall not copy, remove, erase, corrupt, destroy, use, disclose, transfer, sell, lease, rent, steal, borrow, lend or cause to become known in any manner whatsoever such Proprietary Information in any manner which is not duly authorized by SITL.');
      doc.moveDown();
      
      doc.text('• In the event that the Employee ceases to be employed by SITL for whatever reason the terms of this Agreement shall remain in effect with respect to any Proprietary Information for 7 years from the date of the Employee\'s termination with SITL.');
      doc.moveDown();
      
      // Add signature section
      doc.moveDown();
      doc.text('The Employee', { align: 'left' });
      doc.moveDown();
      
      doc.text(`Name: ${clientName}`, { align: 'left' });
      doc.moveDown();
      
      doc.text('Signed:', { align: 'left' });
      
      // Add the signature image directly from base64 data
      if (signatureData) {
        const imgBuffer = Buffer.from(signatureData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        doc.image(imgBuffer, { width: 200, align: 'left' });
      }
      
      doc.moveDown();
      doc.text(`Date: ${currentDate}`, { align: 'left' });
      doc.moveDown(2);
      
      // SITL signature section
      doc.text('On behalf of Secureitlab W.L.L', { align: 'left' });
      doc.moveDown();
      
      doc.text('Name: Ashish Sharma', { align: 'left' });
      doc.moveDown();
      
      doc.text('Position in Company: Partner', { align: 'left' });
      doc.moveDown();
      
      doc.text('Date: March 20, 2025', { align: 'left' });
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
};

export const updateClientNDA = async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureData } = req.body;
    
    // Validate input
    if (!signatureData) {
      return res.status(400).json({
        success: false,
        message: 'Signature data is required'
      });
    }

    console.log(id, 'id')
    // Check if client exists
    const client = await prisma.clientProfile.findUnique({ 
      where: { id: id },
      include: { user: { select: { id: true, email: true } } }
    });

    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Make sure the authenticated user is the same as the client
    if (client.user.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to sign NDA for this client'
      });
    }
    
    // The signature data is a base64 encoded image
    // Convert it to a buffer to store in Azure
    const signatureBuffer = Buffer.from(
      signatureData.replace(/^data:image\/\w+;base64,/, ''),
      'base64'
    );
    
    // 1. Upload signature to Azure
    const signatureUrl = await uploadToAzure(
      signatureBuffer,
      `signatures-${req.user.id}`,
      `nda-signature-${id}-${Date.now()}.png`
    );

    // 2. Generate PDF with NDA content and signature
    const pdfBuffer = await generateNDAPdf(
      client.fullName,
      client.email,
      signatureUrl,
      signatureData
    );

    // 3. Upload PDF to Azure
    const pdfUrl = await uploadToAzure(
      pdfBuffer,
      `client-nda-documents`,
      `NDA-${id}.pdf`
    );
    
    
    
    // Add ndaPdfUrl to the object
    
    // Update the consultant profile
    const updatedClient = await prisma.clientProfile.update({
      where: { id },
      data: {
        onboardingStatus: 'ONBOARDED'
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...updatedClient,
        ndaPdfUrl: pdfUrl
      }
    });

  } catch (error) {
    console.error('Error updating client NDA:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating client NDA',
      error: error.message
    });
  }
};



