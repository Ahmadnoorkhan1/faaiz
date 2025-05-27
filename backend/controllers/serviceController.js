import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all services
 * @route GET /api/services
 * @access Private
 */
export const getAllServices = async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        scopingForm: true,        // ✅ one-to-one
        serviceProposal: true,    // (optional) if you want to include the proposal as well
        clientProfiles: true,     // (optional) if you want to include clients
        consultantProfiles: true, // (optional)
        documents: true           // (optional)
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching services',
      error: error.message
    });
  }
};

/**
 * Create new service
 * @route POST /api/services
 * @access Private
 */
export const createService = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      });
    }

    const service = await prisma.service.create({
      data: {
        name
      
      }
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating service',
      error: error.message
    });
  }
};


// Get service by id
export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const service = await prisma.service.findUnique({
      where: { id }
    });
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching service',
      error: error.message
    });
  }
};


// Get service by name