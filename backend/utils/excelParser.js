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
    
    // Read data with header option to get column names
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { 
      raw: true,
      defval: '' // Default value for empty cells
    });

    if (jsonData.length === 0) {
      throw new Error('No data found in Excel sheet');
    }

    // Clean up and normalize data
    const cleanData = normalizeExcelData(jsonData);
    console.log(`Normalized ${cleanData.length} rows of data`);
    
    // Build hierarchical structure
    const result = buildProjectStructure(cleanData);
    console.log(`Built structure with ${result.phases.length} phases`);
    
    return result;
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
};

/**
 * Normalize Excel data by handling different column name formats
 */
function normalizeExcelData(rawData) {
  return rawData.map(row => {
    // Find the ID field - could be 'ID', '__EMPTY', 'Task ID', etc.
    const idValue = row.ID || row.__EMPTY || row['Task ID'] || '';
    
    // Find the task name field - could be 'Task Name', 'DETAILED PROJECT PLAN', etc.
    const taskName = row['Task Name'] || row['DETAILED PROJECT PLAN'] || '';
    
    // Only process rows that have a valid ID format (1, 1.1, 1.1.1, etc.)
    if (!idValue && !taskName) return null;
    
    return {
      id: String(idValue).trim(),
      taskName: String(taskName).trim(),
      deliverables: row.Deliverables || row['PROJECT NAME'] || '',
      dependency: row.Depenedency || row.Dependency || '',
      week: row.Week || row.__EMPTY_1 || '',
      taskOwnership: row['Task Ownership'] || row.__EMPTY_2 || '',
      completed: row.Completed || row.__EMPTY_4 || '',
      status: row.Status || row.__EMPTY_5 || ''
    };
  }).filter(Boolean); // Remove null entries
}

/**
 * Build hierarchical project structure with phases, subphases, and tasks
 */
function buildProjectStructure(data) {
  const phases = [];
  const phaseMap = new Map();
  const subphaseMap = new Map();

  // First pass: Create phases and subphases
  data.forEach(item => {
    // Skip rows without IDs
    if (!item.id) return;
    
    // Check ID format (e.g., "1", "1.1", "1.1.1")
    const parts = String(item.id).split('.');
    
    // Handle phases (e.g., "1")
    if (parts.length === 1 && !isNaN(Number(item.id))) {
      const phase = {
        id: uuidv4(),
        number: item.id,
        name: item.taskName,
        subPhases: []
      };
      phases.push(phase);
      phaseMap.set(item.id, phase);
    }
    // Handle subphases (e.g., "1.1")
    else if (parts.length === 2) {
      const phaseId = parts[0];
      const phase = phaseMap.get(phaseId);
      
      if (phase) {
        const subphase = {
          id: uuidv4(),
          number: item.id,
          name: item.taskName,
          tasks: []
        };
        phase.subPhases.push(subphase);
        subphaseMap.set(item.id, subphase);
      }
    }
  });

  // Second pass: Add tasks to subphases
  data.forEach(item => {
    if (!item.id) return;
    
    const parts = String(item.id).split('.');
    
    // Handle tasks (e.g., "1.1.1")
    if (parts.length >= 3) {
      const subphaseId = `${parts[0]}.${parts[1]}`;
      const subphase = subphaseMap.get(subphaseId);
      
      if (subphase) {
        const task = {
          id: uuidv4(),
          number: item.id,
          taskName: item.taskName,
          deliverables: item.deliverables || '',
          dependency: item.dependency || '',
          week: item.week || '',
          taskOwnership: item.taskOwnership || '',
          completed: item.completed || '',
          status: item.status || ''
        };
        subphase.tasks.push(task);
      }
    }
  });

  // Sort phases, subphases, and tasks by their numeric IDs
  phases.sort((a, b) => Number(a.number) - Number(b.number));
  
  phases.forEach(phase => {
    phase.subPhases.sort((a, b) => {
      const aNum = Number(a.number.split('.')[1]);
      const bNum = Number(b.number.split('.')[1]);
      return aNum - bNum;
    });
    
    phase.subPhases.forEach(subphase => {
      subphase.tasks.sort((a, b) => {
        const aNum = Number(a.number.split('.')[2]);
        const bNum = Number(b.number.split('.')[2]);
        return aNum - bNum;
      });
    });
  });

  return { phases };
}