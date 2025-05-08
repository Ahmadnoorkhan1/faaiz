import prisma from '../config/prisma.js';
import { v4 as uuidv4 } from 'uuid';

export const getAllTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            consultantProfile: {
              select: {
                contactFirstName: true,
                contactLastName: true,
              },
            },
          },
        },
        subPhase: {
          include: {
            phase: true,
          },
        },
      },
    });

    // Transform data to match frontend expectations
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      startDate: task.startDate ? task.startDate.toISOString().split('T')[0] : null,
      projectId: task.projectId || '',
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
      } : null,
      consultantId: task.assigneeId || '',
      consultant: task.assignee ? {
        id: task.assignee.id,
        name: task.assignee.consultantProfile ? 
          `${task.assignee.consultantProfile.contactFirstName} ${task.assignee.consultantProfile.contactLastName}` : 
          task.assignee.email,
        email: task.assignee.email,
      } : null,
      phase: task.subPhase ? 
        `${task.subPhase.phase.title}${task.subPhase.title.includes(task.subPhase.phase.title) ? '' : ' - ' + task.subPhase.title}` : 
        'Unassigned',
    }));

    res.status(200).json({
      success: true,
      count: formattedTasks.length,
      data: formattedTasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching tasks',
    });
  }
};

export const createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      startDate,
      projectId, 
      consultantId, 
      subPhaseId 
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a title for the task',
      });
    }

    const task = await prisma.task.create({
      data: {
        id: uuidv4(),
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        projectId: projectId || null,
        assigneeId: consultantId || null,
        createdById: req.user.id,
        subPhaseId: subPhaseId || null,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            consultantProfile: {
              select: {
                contactFirstName: true,
                contactLastName: true,
              },
            },
          },
        },
        subPhase: {
          include: {
            phase: true,
          },
        },
      },
    });

    // Format response to match frontend expectations
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      startDate: task.startDate ? task.startDate.toISOString().split('T')[0] : null,
      projectId: task.projectId || '',
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
      } : null,
      consultantId: task.assigneeId || '',
      consultant: task.assignee ? {
        id: task.assignee.id,
        name: task.assignee.consultantProfile ? 
          `${task.assignee.consultantProfile.contactFirstName} ${task.assignee.consultantProfile.contactLastName}` : 
          task.assignee.email,
        email: task.assignee.email,
      } : null,
      phase: task.subPhase ? 
        `${task.subPhase.phase.title}${task.subPhase.title.includes(task.subPhase.phase.title) ? '' : ' - ' + task.subPhase.title}` : 
        'Unassigned',
    };

    res.status(201).json({
      success: true,
      data: formattedTask,
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating task',
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      status, 
      priority, 
      dueDate, 
      startDate,
      projectId, 
      consultantId, 
      subPhaseId 
    } = req.body;

    // Check if task exists
    const taskExists = await prisma.task.findUnique({
      where: { id },
    });

    if (!taskExists) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Update task
    const task = await prisma.task.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        priority: priority !== undefined ? priority : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined,
        projectId: projectId !== undefined ? projectId : undefined,
        assigneeId: consultantId !== undefined ? consultantId : undefined,
        subPhaseId: subPhaseId !== undefined ? subPhaseId : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            consultantProfile: {
              select: {
                contactFirstName: true,
                contactLastName: true,
              },
            },
          },
        },
        subPhase: {
          include: {
            phase: true,
          },
        },
      },
    });

    // Format response to match frontend expectations
    const formattedTask = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      startDate: task.startDate ? task.startDate.toISOString().split('T')[0] : null,
      projectId: task.projectId || '',
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
      } : null,
      consultantId: task.assigneeId || '',
      consultant: task.assignee ? {
        id: task.assignee.id,
        name: task.assignee.consultantProfile ? 
          `${task.assignee.consultantProfile.contactFirstName} ${task.assignee.consultantProfile.contactLastName}` : 
          task.assignee.email,
        email: task.assignee.email,
      } : null,
      phase: task.subPhase ? 
        `${task.subPhase.phase.title}${task.subPhase.title.includes(task.subPhase.phase.title) ? '' : ' - ' + task.subPhase.title}` : 
        'Unassigned',
    };

    res.status(200).json({
      success: true,
      data: formattedTask,
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating task',
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const taskExists = await prisma.task.findUnique({
      where: { id },
    });

    if (!taskExists) {
      return res.status(404).json({
        success: false,
        error: 'Task not found',
      });
    }

    // Delete task
    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting task',
    });
  }
};

export const getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            consultantProfile: {
              select: {
                contactFirstName: true,
                contactLastName: true,
              },
            },
          },
        },
        subPhase: {
          include: {
            phase: true,
          },
        },
      },
    });

    // Format tasks for frontend
    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.toISOString().split('T')[0] : null,
      startDate: task.startDate ? task.startDate.toISOString().split('T')[0] : null,
      projectId: task.projectId || '',
      project: task.project ? {
        id: task.project.id,
        name: task.project.name,
      } : null,
      consultantId: task.assigneeId || '',
      consultant: task.assignee ? {
        id: task.assignee.id,
        name: task.assignee.consultantProfile ? 
          `${task.assignee.consultantProfile.contactFirstName} ${task.assignee.consultantProfile.contactLastName}` : 
          task.assignee.email,
        email: task.assignee.email,
      } : null,
      phase: task.subPhase ? 
        `${task.subPhase.phase.title}${task.subPhase.title.includes(task.subPhase.phase.title) ? '' : ' - ' + task.subPhase.title}` : 
        'Unassigned',
    }));

    res.status(200).json({
      success: true,
      count: formattedTasks.length,
      data: formattedTasks,
    });
  } catch (error) {
    console.error('Error fetching tasks by project:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching tasks by project',
    });
  }
};