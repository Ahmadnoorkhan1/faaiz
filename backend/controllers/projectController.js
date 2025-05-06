import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all projects
 * @route GET /api/projects
 * @access Private
 */
export const getProjects = async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
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
      consultantId 
    } = req.body;
    
    // Basic validation
    if (!name || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and start date'
      });
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || undefined,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        clientId,
        consultantId
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
    
    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    next(error);
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