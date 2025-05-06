import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all clients
 * @route GET /api/clients
 * @access Private
 */
export const getClients = async (req, res, next) => {
  try {
    const clients = await prisma.user.findMany({
      where: {
        role: 'CLIENT'
      },
      include: {
        clientProfile: true,
        clientProjects: {
          include: {
            consultant: {
              select: {
                id: true,
                email: true,
                consultantProfile: true
              }
            }
          }
        }
      }
    });
    
    const formattedClients = clients.map(client => {
      return {
        id: client.id,
        email: client.email,
        name: client.clientProfile?.fullName || 'N/A',
        company: client.clientProfile?.organization || 'N/A',
        assignedProjects: client.clientProjects.length,
        projects: client.clientProjects,
        status: client.clientProfile?.onboardingStatus || 'NOT_STARTED',
        phone: client.clientProfile?.phoneNumber || 'N/A',
        createdAt: client.createdAt
      };
    });
    
    res.status(200).json({
      success: true,
      count: clients.length,
      data: formattedClients
    });
  } catch (error) {
    next(error);
  }
}; 