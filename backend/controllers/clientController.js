import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  // try {
  //   const clients = await prisma.user.findMany({
  //     where: {
  //       role: 'CLIENT'
  //     },
  //     include: {
  //       clientProfile: true,
  //       clientProjects: {
  //         include: {
  //           consultant: {
  //             select: {
  //               id: true,
  //               email: true,
  //               consultantProfile: true
  //             }
  //           }
  //         }
  //       }
  //     }
  //   });
    
  //   const formattedClients = clients.map(client => {
  //     console.log("***********");
  //     console.log(client);
  //     console.log("***********");
  //     return {
  //       id: client.id,
  //       email: client.email,
  //       name: client.clientProfile?.fullName || 'N/A',
  //       company: client.clientProfile?.organization || 'N/A',
  //       assignedProjects: client.clientProjects.length,
  //       projects: client.clientProjects,
  //       status: client.clientProfile?.onboardingStatus || 'NOT_STARTED',
  //       phone: client.clientProfile?.phoneNumber || 'N/A',
  //       createdAt: client.createdAt,
  //       services:client.clientProfile.requestedServices,
  //       role:client.role,
  //     };
  //   });
    
  //   res.status(200).json({
  //     success: true,
  //     count: clients.length,
  //     data: formattedClients
  //   });
  // } catch (error) {
  //   next(error);
  // }
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


export const getClientByUserId = async (req,res) => {
  try {
    const client = await prisma.clientProfile.findUnique({
      where:{userId:id}
    })

    if(!client){
      return res.status(404).json({
        success:false,
        message:"Client not found",
      })
    }

    return res.status(200).json({
        success:true,
        message:"Client  found",
        data:client
      })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error
    })
  }
}