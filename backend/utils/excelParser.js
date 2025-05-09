import xlsx from 'xlsx';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parses ISO project Excel file into structured data with phases, subPhases, and tasks.
 * @param {Buffer} fileBuffer - The uploaded Excel file buffer.
 * @returns {{ phases: Array }} Structured output for database ingestion.
 */
export const parseIsoProjectExcel = (fileBuffer) => {
  try {
    console.log('Starting Excel parsing process...');
    
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { raw: true });

    if (jsonData.length === 0) {
      throw new Error('No data found in Excel sheet');
    }

    const phaseMap = new Map();

    for (const row of jsonData) {
      const {
        Phase,
        'Sub-Phase': subPhase,
        'Task ID': taskId,
        'Task Name': taskName,
        Deliverables,
        Dependencies,
        Week,
        'Task Ownership': taskOwnership,
        Comments,
        Completed,
        Status,
        'Overall Completion': overallCompletion,
        'Count of Status': countOfStatus
      } = row;

      if (!Phase || !taskName) continue;

      if (!phaseMap.has(Phase)) {
        phaseMap.set(Phase, {
          id: uuidv4(),
          name: Phase,
          subPhases: new Map()
        });
      }

      const phaseObj = phaseMap.get(Phase);

      const subKey = subPhase || '__root__';
      if (!phaseObj.subPhases.has(subKey)) {
        phaseObj.subPhases.set(subKey, {
          id: uuidv4(),
          name: subPhase || null,
          tasks: []
        });
      }

      const subObj = phaseObj.subPhases.get(subKey);
      subObj.tasks.push({
        id: uuidv4(),
        taskId,
        taskName,
        deliverables: Deliverables,
        dependencies: Dependencies,
        week: Week,
        taskOwnership,
        comments: Comments,
        completed: Completed,
        status: Status,
        overallCompletion,
        countOfStatus
      });
    }

    // Convert Map to structured output
    const structured = {
      phases: Array.from(phaseMap.values()).map(phase => ({
        id: phase.id,
        name: phase.name,
        subPhases: Array.from(phase.subPhases.values())
      }))
    };


    return structured;

  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error('Failed to parse Excel file');
  }
};
