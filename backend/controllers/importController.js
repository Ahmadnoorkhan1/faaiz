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
    const { projectId , userId} = req.body;
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

    // Parse Excel file
    const result = parseIsoProjectExcel(req.file.buffer);
    console.log('Parsed structure:' , result)

    // Map status values to your enum values
    const mapStatus = (status) => {
      const statusUpper = (status || '').toUpperCase();
      if (statusUpper.includes('COMPLETE')) return 'DONE';
      if (statusUpper.includes('IN PROGRESS')) return 'IN_PROGRESS';
      if (statusUpper.includes('TO BE STARTED')) return 'TODO';
      return 'TODO'; // Default status
    };

    // Create all phases, subphases, and tasks in one transaction
    const created = await prisma.$transaction(
      result.phases.map(phase => 
        prisma.phase.create({
          data: {
            id: phase.id,
            title: String(phase.name || ''),
            order: parseInt(phase.number) || 0,
            projectId,
            subPhases: {
              create: phase.subPhases.map(subphase => ({
                id: subphase.id,
                title: String(subphase.name || ''),
                order: parseFloat(subphase.number) || 0,
                tasks: {
                  create: subphase.tasks.map(task => ({
                    id: task.id,
                    title: String(task.taskName || ''),
                    description: String(task.deliverables || ''),
                    status: mapStatus(task.status),
                    priority: 'MEDIUM',
                    startDate: task.week ? new Date() : null, // You may want to parse week into a proper date
                    dueDate: null, // Set if available in your data
                    projectId,
                    createdById: req.user?.id  || userId// Be sure req.user is available
                  }))
                }
              }))
            }
          },
          include: {
            subPhases: {
              include: {
                tasks: true
              }
            }
          }
        })
      )
    );

    res.status(201).json({
      success: true,
      message: 'Imported successfully',
      data: {
        phases: created.length,
        subPhases: created.reduce((sum, p) => sum + p.subPhases.length, 0),
        tasks: created.reduce((sum, p) =>
          sum + p.subPhases.reduce((s, sp) => s + sp.tasks.length, 0), 0)
      }
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};



