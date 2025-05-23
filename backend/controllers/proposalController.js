import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Get all configuration settings
 * @route GET /api/proposals
 * @access Private/Admin
 */

export const generateServiceProposal = async (req, res) => {
  try {
const { serviceType, phases, timeline, deliverables } = req.body;

    // Validate input
    if (!serviceType || !phases || !timeline || !deliverables) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Check if proposal already exists
    const existingProposal = await prisma.serviceProposal.findFirst({
      where: {
        serviceType: serviceType
      }
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'Proposal already exists for this service type'
      });
    }

    // Create the proposal
    const proposal = await prisma.serviceProposal.create({
      data: {
        serviceType: serviceType,
        phases: phases,
        timeline: timeline,
        deliverables: deliverables
      }
    });

    res.status(201).json({
      success: true,
      data: proposal
    });

  } catch (error) {
    console.error('Error generating proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating proposal',
      error: error.message
    });
  }
};


// Get proposal by service type
export const getProposalByService = async (req, res) => {
  try {
    const { serviceType } = req.params;

    const proposal = await prisma.serviceProposal.findFirst({
      where: {
        serviceType: serviceType
      }
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'No proposal found for this service type'
      });
    }

    res.status(200).json({
      success: true,
      data: proposal
    });

  } catch (error) {
    console.error('Error fetching proposal:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proposal',
      error: error.message
    });
  }
};

// Get All Proposals
export const getAllProposals = async (req, res) => {
  try {
    const proposals = await prisma.serviceProposal.findMany();
    res.status(200).json({
      success: true,
      data: proposals
    });
  } catch (error) {
    console.error('Error fetching proposals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching proposals',

      error: error.message
    });
  }
};


