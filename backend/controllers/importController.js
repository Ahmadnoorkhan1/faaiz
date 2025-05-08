import prisma from '../config/prisma.js';
import { parseIsoProjectExcel } from '../utils/excelParser.js';

export const importTasksFromExcel = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please upload an Excel file',
      });
    }

    // Check if projectId was provided
    const { projectId } = req.body;
    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a project ID',
      });
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    // Parse Excel file using our utility
    const { phases } = parseIsoProjectExcel(req.file.buffer);
    
    // Add projectId to all phases
    const phasesWithProject = phases.map(phase => ({
      ...phase,
      projectId
    }));

    // Save the parsed data to the database using a transaction
    const result = await prisma.$transaction(async (prisma) => {
      const createdPhases = [];
      
      // Create phases
      for (const phase of phasesWithProject) {
        const { subPhases, ...phaseData } = phase;
        
        const createdPhase = await prisma.phase.create({
          data: phaseData
        });
        
        const createdSubPhases = [];
        
        // Create sub-phases
        for (const subPhase of subPhases) {
          const { tasks, ...subPhaseData } = subPhase;
          
          const createdSubPhase = await prisma.subPhase.create({
            data: {
              ...subPhaseData,
              phaseId: createdPhase.id
            }
          });
          
          const createdTasks = [];
          
          // Create tasks
          for (const task of tasks) {
            const { assigneeName, ...taskData } = task;
            
            // Find or create user based on name (if provided)
            let assigneeId = null;
            if (assigneeName) {
              // Try to find user by name in consultant profiles
              const consultant = await prisma.consultantProfile.findFirst({
                where: {
                  OR: [
                    {
                      contactFirstName: {
                        contains: assigneeName,
                        mode: 'insensitive'
                      }
                    },
                    {
                      contactLastName: {
                        contains: assigneeName,
                        mode: 'insensitive'
                      }
                    },
                    {
                      user: {
                        email: {
                          contains: assigneeName,
                          mode: 'insensitive'
                        }
                      }
                    }
                  ]
                },
                select: {
                  userId: true
                }
              });
              
              if (consultant) {
                assigneeId = consultant.userId;
              }
            }
            
            const createdTask = await prisma.task.create({
              data: {
                ...taskData,
                subPhaseId: createdSubPhase.id,
                projectId,
                assigneeId,
                createdById: req.user.id
              }
            });
            
            createdTasks.push(createdTask);
          }
          
          createdSubPhases.push({
            ...createdSubPhase,
            tasks: createdTasks
          });
        }
        
        createdPhases.push({
          ...createdPhase,
          subPhases: createdSubPhases
        });
      }
      
      return createdPhases;
    });

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Tasks imported successfully',
      data: {
        phases: result.length,
        subPhases: result.reduce((count, phase) => count + phase.subPhases.length, 0),
        tasks: result.reduce((count, phase) => 
          count + phase.subPhases.reduce((subCount, subPhase) => 
            subCount + subPhase.tasks.length, 0), 0)
      }
    });
  } catch (error) {
    console.error('Error importing tasks from Excel:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error importing tasks from Excel',
    });
  }
};