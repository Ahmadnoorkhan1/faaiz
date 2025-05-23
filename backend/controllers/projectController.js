import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

/**
 * Get all projects
 * @route GET /api/projects
 * @access Private
 */
export const getProjects = async (req, res, next) => {
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
        if (user.role === 'CLIENT') {
          // Clients see only their projects
          whereClause.clientId = userId;
        } else if (user.role === 'CONSULTANT') {
          // Consultants see only projects they're assigned to
          whereClause.consultantId = userId;
        }
      }
    }
    
    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            email: true,
            role: true,
            clientProfile: true
          }
        },
        consultant: {
          select: {
            id: true,
            email: true,
            role: true,
            consultantProfile: true
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get project by ID
 * @route GET /api/projects/:id
 * @access Private
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        client: {
          select: {
            id: true,
            email: true,
            role: true,
            clientProfile: true
          }
        },
        consultant: {
          select: {
            id: true,
            email: true,
            role: true,
            consultantProfile: true
          }
        },
        tasks: true,
        events: {
          include: {
            attendees: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        chatRooms: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new project
 * @route POST /api/projects
 * @access Private
 */
export const createProject = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      status, 
      startDate, 
      endDate, 
      clientId,
      // consultantId,
      userId
    } = req.body;
    
    // Basic validation
    if (!name || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and start date'
      });
    }

    // We need to ensure clientId is a valid User.id
    let validClientId = clientId;
    
    if (clientId) {
      // Check if it exists in the User table
      const user = await prisma.user.findUnique({
        where: { id: clientId }
      });
      
      // If it exists in User table, we can proceed
      if (user) {
        console.log(`Found user with ID ${clientId} - this is valid for Project.clientId`);
      } else {
        // If not in User table, the clientId is invalid - we need to find the associated User
        const clientProfile = await prisma.clientProfile.findUnique({
          where: { id: clientId },
          include: { user: true }
        });
        if (!clientProfile) {
          return res.status(400).json({
            success: false,
            message: 'No valid entity found with the provided clientId'
          });
        }
        
        // Use the userId from the clientProfile instead
        if (clientProfile.user) {
          validClientId = clientProfile.user.id;
          console.log(`Using clientProfile's userId ${validClientId} instead of clientId ${clientId}`);
        } else {
          return res.status(400).json({
            success: false,
            message: 'Client profile found but has no associated user'
          });
        }
      }
    }
    
    // Similar logic for consultantId
    // let validConsultantId = consultantId;
    
    // if (consultantId) {
    //   const consultant = await prisma.user.findUnique({
    //     where: { id: consultantId }
    //   });
      
    //   if (consultant) {
    //     console.log(`Found user with ID ${consultantId} - this is valid for Project.consultantId`);
    //   } else {
    //     const consultantProfile = await prisma.consultantProfile.findUnique({
    //       where: { id: consultantId },
    //       include: { user: true }
    //     });
        
    //     if (!consultantProfile) {
    //       return res.status(400).json({
    //         success: false,
    //         message: 'Consultant profile not found with the provided consultantId'
    //       });
    //     }
        
    //     if (consultantProfile.user) {
    //       validConsultantId = consultantProfile.user.id;
    //       console.log(`Using consultantProfile's userId ${validConsultantId} instead of consultantId ${consultantId}`);
    //     } else {
    //       return res.status(400).json({
    //         success: false,
    //         message: 'Consultant profile found but has no associated user'
    //       });
    //     }
    //   }
    // }

    // Create project with valid IDs
    // console.log(`Creating project with clientId: ${validClientId}`);
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        clientId: validClientId,
        // consultantId: validConsultantId
      },
      include: {
        client: true,
        consultant: true
      }
    });
    console.log('Project created:', project);
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};

/**
 * Update a project
 * @route PUT /api/projects/:id
 * @access Private
 */
export const updateProject = async (req, res, next) => {
  try {
    const { 
      name, 
      description, 
      status, 
      startDate, 
      endDate, 
      clientId, 
      consultantId 
    } = req.body;
    
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Update project
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        status: status || undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        clientId: clientId || undefined,
        consultantId: consultantId || undefined
      },
      include: {
        client: {
          select: {
            id: true,
            email: true
          }
        },
        consultant: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    res.status(200).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a project
 * @route DELETE /api/projects/:id
 * @access Private
 */
export const deleteProject = async (req, res, next) => {
  try {
    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: req.params.id }
    });
    
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }
    
    // Delete project
    await prisma.project.delete({
      where: { id: req.params.id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};