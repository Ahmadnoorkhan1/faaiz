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

    // Parse Excel file
    const result = parseIsoProjectExcel(req.file.buffer);

    // Prepare phases with projectId
    const phasesToCreate = result.phases.map(p => ({
      ...p,
      projectId
    }));

    // Persist phases, subPhases & tasks in a single transaction
    const created = await prisma.$transaction(async prismaTx => {
      const createdPhases = [];

      for (const phase of phasesToCreate) {
        // 1. Create Phase
        const createdPhase = await prismaTx.phase.create({
          data: {
            id: phase.id,
            // ensure title is string and use phase.number for order
            title: String(phase.name),
            order: parseInt(phase.number, 10) || 0,
            projectId: phase.projectId
          }
        });

        // 2. Create SubPhases
        const createdSubPhases = [];
        for (const sub of phase.subPhases) {
          const createdSub = await prismaTx.subPhase.create({
            data: {
              id: sub.id,
              // coerce to string, use sub.number for ordering
              title: sub.name != null ? String(sub.name) : 'Misc',
              order: parseFloat(sub.number) || 0,
              phaseId: createdPhase.id
            }
          });

          // 3. Create Tasks
          const createdTasks = [];
          for (const t of sub.tasks) {
            // Map Excel status → TaskStatus enum
            const statusMap = {
              COMPLETED: 'DONE',
              'IN PROGRESS': 'IN_PROGRESS',
              'TO BE STARTED': 'TODO'
            };
            const taskStatus = statusMap[t.status?.toUpperCase()] || 'TODO';

            const task = await prismaTx.task.create({
              data: {
                id: t.id,
                title: t.taskName,
                description: t.deliverables || '',
                status: taskStatus,
                priority: 'MEDIUM',
                projectId,
                subPhaseId: createdSub.id,
                createdById: req.user.id
              }
            });
            createdTasks.push(task);
          }

          createdSubPhases.push({
            ...createdSub,
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



