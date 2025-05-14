import { PrismaClient } from '@prisma/client';
import { uploadToAzure } from '../config/azureStorage.js';
import bcrypt from 'bcryptjs';
import PDFDocument from 'pdfkit';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import { sendInterviewInvitation, sendConsultantApprovalEmail, sendConsultantRejectionEmail } from '../utils/emailService.js';

const prisma = new PrismaClient();

/**
 * Get all consultant profiles
 * @route GET /api/consultants
 * @access Private/Admin
 */
export const getConsultantProfiles = async (req, res, next) => {
  try {
    const { userId } = req.query;
    
    // Build where clause
    let whereClause = {};
    
    if (userId) {
      // Check user role first
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true }
      });
      
      // If user is not an admin, apply user-specific filtering
      if (user && user.role !== 'ADMIN') {
        // For consultants, only show their own profile
        if (user.role === 'CONSULTANT') {
          whereClause.userId = userId;
        } else {
          // For clients or others, use default behavior (determined by your business logic)
          // Here we're allowing clients to see all consultants, but you may want to filter
          // to only consultants working on their projects
        }
      }
    }
    
    const consultantProfiles = await prisma.consultantProfile.findMany({
      where: whereClause,
      include: { 
        user: { 
          select: { 
            id: true, 
            email: true, 
            role: true 
          } 
        } 
      },
    });
    
    res.status(200).json({
      success: true,
      count: consultantProfiles.length,
      data: consultantProfiles,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consultant profile by ID
 * @route GET /api/consultants/:id
 * @access Private
 */
export const getConsultantProfileById = async (req, res, next) => {
  try {
    const consultantProfile = await prisma.consultantProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  
    if (!consultantProfile) {
      console.error('Consultant profile not found');
      res.status(404).json({
        success:false,
        message:'Consultant profile not found'
      })
    }
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get consultant profile by user ID
 * @route GET /api/consultants/user/:userId
 * @access Private
 */
export const getConsultantProfileByUserId = async (req, res, next) => {
  try {
    const consultantProfile = await prisma.consultantProfile.findUnique({
      where: { userId: req.params.userId },
    });
  
    if (!consultantProfile) {
      return res.status(404).json({
        success: false,
        message: 'Consultant profile not found'
      });
    }
  
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    console.error('Error fetching consultant profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching consultant profile',
      error: error.message
    });
  }
};

/**
 * Create consultant profile
 * @route POST /api/consultants
 * @access Public
 */
export const createConsultantProfile = async (req, res, next) => {
  try {
    // Direct consultant creation
    const { 
      email, 
      password, 
      contactFirstName,
      contactLastName,
      phone,
      organizationWebsite,
      industry,
      position,
      experience,
      dateOfBirth,
      servicesOffered,
      otherDetails,
      certifications,
      cvUrl,
      ...otherConsultantData 
    } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email:email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    // Create user and consultant profile in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create user with CONSULTANT role
      const user = await prisma.user.create({
        data: {
          email:email,
          password: hashedPassword,
          role: 'CONSULTANT',
        },
      });
  
      // Create consultant profile 
      // (Remove email from here if your ConsultantProfile model does not expect it)
      const consultantProfile = await prisma.consultantProfile.create({
        data: {
          userId: user.id,
          email,  // remove if not defined in ConsultantProfile model
          contactFirstName,
          contactLastName,
          phone,
          organizationWebsite,
          industry,
          position,
          experience,
          dateOfBirth: new Date(dateOfBirth),
          servicesOffered: servicesOffered || [],
          otherDetails: otherDetails || null,
          certifications: certifications || [],
          cvUrl: cvUrl || null,
          profileCompleted: false,
          onboardingStatus: 'NOT_STARTED',
          isAllowedToLogin: false, // Set to false by default

        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });
  
      return consultantProfile;
    });
  
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update consultant profile
 * @route PUT /api/consultants/:id
 * @access Private
 */
export const updateConsultantProfile = async (req, res, next) => {
  try {
    const existingProfile = await prisma.consultantProfile.findUnique({
      where: { id:req.params.id },
    });
  
    if (!existingProfile) {
      throw new Error('Consultant profile not found');
    }
    const consultantProfile = await prisma.consultantProfile.update({
      where: { id:req.params.id },
      data:  req.body,
    });
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update consultant onboarding status
 * @route PATCH /api/consultants/:id/onboarding
 * @access Private
 */
export const updateConsultantOnboardingStatus = async (req, res, next) => {
  try {
    const { onboardingStatus,  profileCompleted} = req.body;
    
    if (!onboardingStatus) {
      return res.status(400).json({
        success: false,
        message: 'Please provide onboarding status',
      });
    }
    
    const consultantProfile =  await prisma.consultantProfile.update({
      where: { id:req.params.id },
      data: {
        onboardingStatus: onboardingStatus || undefined,
        profileCompleted: profileCompleted !== undefined ? profileCompleted : undefined,
      },
    });
    res.status(200).json({
      success: true,
      data: consultantProfile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete consultant profile
 * @route DELETE /api/consultants/:id
 * @access Private/Admin
 */
export const deleteConsultantProfile = async (req, res, next) => {
  try {
    const consultantProfile = await prisma.consultantProfile.findUnique({
      where: { id },
      include: { user: true },
    });
  
    if (!consultantProfile) {
      throw new Error('Consultant profile not found');
    }
  
    // Use transaction to delete both profile and user
    const result = await prisma.$transaction(async (prisma) => {
      // Delete consultant profile
      const deletedProfile = await prisma.consultantProfile.delete({
        where: { id },
      });
  
      // Delete associated user
      if (existingProfile.userId) {
        await prisma.user.delete({
          where: { id: existingProfile.userId },
        });
      }
      return deletedProfile;
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload consultant CV
 * @route POST /api/consultants/:id/cv
 * @access Private
 */
export const uploadCV = async (req, res) => {
  try {
    const { id } = req.params;
    const cvFile = req.file;

    if (!cvFile) {
      return res.status(400).json({
        success: false,
        message: 'CV file is required'
      });
    }

    // Check if consultant exists
    const consultant = await prisma.consultantProfile.findUnique({ where: { id } });
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant profile not found'
      });
    }

    // Upload to Azure
    const cvUrl = await uploadToAzure(cvFile.buffer, 'cvs', cvFile.originalname);

    // Update DB
    const updatedConsultant = await prisma.consultantProfile.update({
      where: { id },
      data: { cvUrl }
    });

    res.status(200).json({
      success: true,
      data: updatedConsultant
    });
  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading CV'
    });
  }
};

/**
 * Upload consultant certifications
 * @route POST /api/consultants/:id/certifications
 * @access Private
 */
export const uploadCertifications = async (req, res) => {
  try {
    const { id } = req.params;
    const certificationFiles = req.files;

    if (!certificationFiles || certificationFiles.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one certification file is required'
      });
    }

    // Upload all certification files to Azure
    const certificationUrls = await Promise.all(
      certificationFiles.map(file => 
        uploadToAzure(
          file.buffer,
          'certifications',
          file.originalname
        )
      )
    );

    // Update consultant profile with certification URLs
    const updatedConsultant = await prisma.consultantProfile.update({
      where: { id },
      data: { 
        certifications: {
          push: certificationUrls
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedConsultant
    });
  } catch (error) {
    console.error('Certifications upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading certifications'
    });
  }
};

/**
 * Sign NDA for consultant
 * @route POST /api/consultants/:id/sign-nda
 * @access Private
 */
export const signNDA = async (req, res) => {
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

    // Check if consultant exists
    const consultant = await prisma.consultantProfile.findUnique({ 
      where: { userId: id },
      include: { user: { select: { id: true, email: true } } }
    });
    
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant profile not found'
      });
    }
    
    // Make sure the authenticated user is the same as the consultant
    if (consultant.user.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to sign NDA for this consultant'
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
      consultant.contactFirstName + ' ' + consultant.contactLastName,
      consultant.email,
      signatureUrl,
      signatureData
    );

    // 3. Upload PDF to Azure
    const pdfUrl = await uploadToAzure(
      pdfBuffer,
      `nda-documents`,
      `NDA-${id}.pdf`
    );
    
    // 4. Update consultant profile with NDA information
    // Create updated otherDetails object first
    let updatedOtherDetails = consultant.otherDetails || {};
    if (typeof updatedOtherDetails === 'string') {
      try {
        updatedOtherDetails = JSON.parse(updatedOtherDetails);
      } catch (e) {
        updatedOtherDetails = {};
      }
    }
    
    // Add ndaPdfUrl to the object
    updatedOtherDetails.ndaPdfUrl = pdfUrl;
    
    // Update the consultant profile
    const updatedConsultant = await prisma.consultantProfile.update({
      where: { userId: id },
      data: {
        ndaSigned: true,
        ndaSignatureDate: new Date(),
        ndaSignatureUrl: signatureUrl,
        otherDetails: JSON.stringify(updatedOtherDetails)
      }
    });
    
    res.status(200).json({
      success: true,
      data: {
        ...updatedConsultant,
        ndaPdfUrl: pdfUrl
      }
    });
  } catch (error) {
    console.error('NDA signing error:', error);
    res.status(500).json({
      success: false,
      message: 'Error signing NDA',
      details: error.message
    });
  }
};

/**
 * Generate PDF for NDA
 * @param {string} consultantName - Consultant name
 * @param {string} consultantEmail - Consultant email
 * @param {string} signatureUrl - URL of the signature image in Azure
 * @param {string} signatureData - Base64 encoded signature data
 * @returns {Promise<Buffer>} - PDF as buffer
 */
const generateNDAPdf = async (consultantName, consultantEmail, signatureUrl, signatureData) => {
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
      
      doc.text(`2) The undersigned person: ${consultantName} (${consultantEmail})`);
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
      
      doc.text(`Name: ${consultantName}`, { align: 'left' });
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

/**
 * Check if consultant has signed NDA
 * @route GET /api/consultants/:id/nda-status
 * @access Private
 */
export const getNDAStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if consultant exists
    const consultant = await prisma.consultantProfile.findUnique({ 
      where: { userId:id },
      select: {
        ndaSigned: true,
        ndaSignatureDate: true,
        ndaSignatureUrl: true,
        otherDetails: true
      }
    });
    
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant profile not found'
      });
    }
    
    // Extract NDA PDF URL from otherDetails if available
    let ndaPdfUrl;
    if (consultant.otherDetails) {
      try {
        // Handle otherDetails whether it's a string or object
        const otherDetails = typeof consultant.otherDetails === 'string' 
          ? JSON.parse(consultant.otherDetails) 
          : consultant.otherDetails;
        ndaPdfUrl = otherDetails.ndaPdfUrl;
      } catch (e) {
        console.error('Error parsing otherDetails:', e);
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        ndaSigned: consultant.ndaSigned,
        ndaSignatureDate: consultant.ndaSignatureDate,
        ndaSignatureUrl: consultant.ndaSignatureUrl,
        ndaPdfUrl: ndaPdfUrl
      }
    });
  } catch (error) {
    console.error('NDA status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking NDA status'
    });
  }
};

/**
 * Invite consultant for interview
 * @route POST /api/consultants/:id/invite
 * @access Private/Admin
 */
export const inviteConsultantForInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const { interviewLink, scheduledDate } = req.body;
    
    // Find the consultant
    const consultant = await prisma.consultantProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } }
    });
    
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant profile not found'
      });
    }
    
    // Send invitation email
    await sendInterviewInvitation(consultant, interviewLink);
    
    // Update consultant status
    const updatedConsultant = await prisma.consultantProfile.update({
      where: { id },
      data: { 
        status: scheduledDate ? 'INTERVIEW_SCHEDULED' : 'INTERVIEW_INVITED',
        interviewDate: scheduledDate ? new Date(scheduledDate) : null
      }
    });
    
    res.status(200).json({
      success: true,
      message: 'Interview invitation sent successfully',
      data: updatedConsultant
    });
  } catch (error) {
    console.error('Interview invitation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending interview invitation',
      error: error.message
    });
  }
};

/**
 * Review consultant after interview
 * @route POST /api/consultants/:id/review
 * @access Private/Admin
 */
export const reviewConsultant = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, notes } = req.body;
    
    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        message: 'Interview score is required'
      });
    }
    
    // Score should be between 0 and 5
    const validScore = Math.max(0, Math.min(5, parseFloat(score)));
    
    // Find the consultant
    const consultant = await prisma.consultantProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } }
    });
    
    if (!consultant) {
      return res.status(404).json({
        success: false,
        message: 'Consultant profile not found'
      });
    }
    
    // Determine status based on score
    const isApproved = validScore >= 3;
    const newStatus = isApproved ? 'APPROVED' : 'REJECTED';
    
    // Update consultant data
    const updatedConsultant = await prisma.consultantProfile.update({
      where: { id },
      data: {
        interviewScore: validScore,
        reviewNotes: notes || null,
        status: newStatus,
        isAllowedToLogin: isApproved // Only allow login if approved
      }
    });
    
    // Send appropriate email based on decision
    if (isApproved) {
      await sendConsultantApprovalEmail(consultant);
    } else {
      await sendConsultantRejectionEmail(consultant, notes);
    }
    
    res.status(200).json({
      success: true,
      message: `Consultant ${isApproved ? 'approved' : 'rejected'}`,
      data: updatedConsultant
    });
  } catch (error) {
    console.error('Consultant review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reviewing consultant',
      error: error.message
    });
  }
};

/**
 * Get consultants by status
 * @route GET /api/consultants/by-status/:status
 * @access Private/Admin
 */
export const getConsultantsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    
    // Validate status
    const validStatuses = ['PENDING_REVIEW', 'INTERVIEW_INVITED', 'INTERVIEW_SCHEDULED', 'REJECTED', 'APPROVED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
        validOptions: validStatuses
      });
    }
    
    // Get consultants with the requested status
    const consultants = await prisma.consultantProfile.findMany({
      where: { status },
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
    
    res.status(200).json({
      success: true,
      count: consultants.length,
      data: consultants
    });
  } catch (error) {
    console.error('Get consultants by status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting consultants by status',
      error: error.message
    });
  }
};