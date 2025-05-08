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
    console.log(`Processing sheet: ${sheetName}`);
    
    const worksheet = workbook.Sheets[sheetName];
    
    // Get all data including "header" rows that might not be actual headers
    const rawData = xlsx.utils.sheet_to_json(worksheet, { 
      header: 1,  // Use array format
      defval: null // Default value for empty cells
    });
    
    console.log(`Total rows in sheet: ${rawData.length}`);
    
    // Find the actual header row - typically the row with most columns
    // that contains key column names like "Task Name"
    let headerRowIndex = 0;
    let maxColumns = 0;
    
    for (let i = 0; i < Math.min(10, rawData.length); i++) {
      const row = rawData[i];
      if (!row) continue;
      
      console.log(`Row ${i} has ${row.length} columns`);
      
      // Check if this row has typical header names
      const rowStr = JSON.stringify(row).toLowerCase();
      if (row.length > maxColumns && 
          (rowStr.includes('task') || rowStr.includes('activity') || 
           rowStr.includes('status') || rowStr.includes('ownership'))) {
        maxColumns = row.length;
        headerRowIndex = i;
        console.log(`Potential header row found at index ${i}`);
      }
    }
    
    console.log(`Selected header row at index ${headerRowIndex}`);
    
    // Create header map
    const headers = {};
    rawData[headerRowIndex].forEach((header, index) => {
      if (header) {
        headers[index] = header.toString().trim();
      }
    });
    
    console.log('Detected headers:', headers);
    
    // Convert array data to objects using the detected headers
    const data = [];
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;
      
      const rowObj = {};
      Object.entries(headers).forEach(([index, header]) => {
        if (row[index] !== undefined && row[index] !== null) {
          rowObj[header] = row[index];
        }
      });
      
      // Only add non-empty rows
      if (Object.keys(rowObj).length > 0) {
        data.push(rowObj);
      }
    }
    
    console.log(`Processed ${data.length} data rows`);
    console.log('First data row sample:', data[0]);
    
    if (!data || data.length === 0) {
      throw new Error('Invalid Excel file: No data found after header detection');
    }
    
    // Now find the actual column identifiers from the headers
    const taskNameColumn = findColumnByPattern(headers, ['task name', 'activity', 'task']);
    const phaseIdColumn = findColumnByPattern(headers, ['id', 'empty', 'phase', 'no']);
    const statusColumn = findColumnByPattern(headers, ['status', 'state', 'progress']);
    const responsibleColumn = findColumnByPattern(headers, ['ownership', 'responsible', 'owner', 'assigned']);
    const descriptionColumn = findColumnByPattern(headers, ['deliverables', 'description', 'notes']);
    
    console.log('Detected key columns:');
    console.log(`- Phase ID: ${phaseIdColumn}`);
    console.log(`- Task Name: ${taskNameColumn}`);
    console.log(`- Status: ${statusColumn}`);
    console.log(`- Responsible: ${responsibleColumn}`);
    console.log(`- Description: ${descriptionColumn}`);
    
    // Process the data into structured format
    return processProjectData(data, {
      phaseIdColumn,
      taskNameColumn,
      statusColumn,
      responsibleColumn,
      descriptionColumn
    });
  } catch (error) {
    console.error('Excel parsing error:', error);
    throw new Error(`Excel parsing error: ${error.message}`);
  }
};

/**
 * Find the most likely column name based on patterns
 * @param {Object} headers - Header mapping (index -> name)
 * @param {Array<string>} patterns - Patterns to look for in the header names
 * @returns {string} Most likely column name
 */
const findColumnByPattern = (headers, patterns) => {
  // First try exact matches
  for (const pattern of patterns) {
    for (const [, header] of Object.entries(headers)) {
      if (header.toLowerCase() === pattern.toLowerCase()) {
        return header;
      }
    }
  }
  
  // Then try includes
  for (const pattern of patterns) {
    for (const [, header] of Object.entries(headers)) {
      if (header.toLowerCase().includes(pattern.toLowerCase())) {
        return header;
      }
    }
  }
  
  // Default to first header that contains any part of any pattern
  for (const [, header] of Object.entries(headers)) {
    for (const pattern of patterns) {
      if (pattern.length > 2 && header.toLowerCase().includes(pattern.substring(0, 3).toLowerCase())) {
        return header;
      }
    }
  }
  
  // Fall back to first pattern if nothing found
  return patterns[0];
};

/**
 * Process Excel data into structured format for database
 * @param {Array} data - Raw data from Excel
 * @param {Object} columns - Mapping of column identifiers
 * @returns {Object} Structured data with phases, subPhases, and tasks
 */
const processProjectData = (data, columns) => {
  console.log('Starting project data processing with columns:', columns);
  
  const phases = [];
  const phaseMap = new Map(); // For quick lookup of phases
  const subPhaseMap = new Map(); // For quick lookup of subphases
  
  let rowCount = 0;
  let phaseCount = 0;
  let subPhaseCount = 0;
  let taskCount = 0;
  
  data.forEach((row, index) => {
    rowCount++;
    
    // Extract the key values with robust error handling
    const phaseId = row[columns.phaseIdColumn] ? String(row[columns.phaseIdColumn]).trim() : null;
    const taskName = row[columns.taskNameColumn] ? String(row[columns.taskNameColumn]).trim() : null;
    
    // Skip rows without phase/task identifiers
    if (!phaseId || !taskName) {
      if (index < 5) console.log(`Skipping row ${index}: missing phase ID or task name`);
      return;
    }
    
    // Extract description if available
    const description = columns.descriptionColumn && row[columns.descriptionColumn] 
      ? String(row[columns.descriptionColumn]).trim() 
      : null;
    
    // Extract status
    const status = row[columns.statusColumn] 
      ? parseTaskStatus(row[columns.statusColumn]) 
      : 'TODO';
    
    // Extract responsible person/team
    const assigneeName = row[columns.responsibleColumn] 
      ? String(row[columns.responsibleColumn]).trim() 
      : null;
    
    if (index < 5) {
      console.log(`Processing row ${index}:`, {
        phaseId,
        taskName,
        status,
        assigneeName,
        description: description ? (description.length > 20 ? description.substring(0, 20) + '...' : description) : null
      });
    }
    
    // Check if this is a main phase (just a number)
    if (/^\d+$/.test(phaseId)) {
      phaseCount++;
      console.log(`Found main phase: ${phaseId} - ${taskName}`);
      
      const phase = {
        id: uuidv4(),
        title: `${phaseId}. ${taskName}`,
        order: parseInt(phaseId, 10),
        subPhases: []
      };
      phases.push(phase);
      phaseMap.set(phaseId, phase);
      return;
    }
    
    // Check if this is a subphase (number with one decimal)
    if (/^\d+\.\d+$/.test(phaseId)) {
      subPhaseCount++;
      console.log(`Found subphase: ${phaseId} - ${taskName}`);
      
      const mainPhaseId = phaseId.split('.')[0];
      
      // Find parent phase or create it if it doesn't exist
      let parentPhase = phaseMap.get(mainPhaseId);
      if (!parentPhase) {
        phaseCount++;
        console.log(`Creating missing parent phase: ${mainPhaseId}`);
        
        parentPhase = {
          id: uuidv4(),
          title: `${mainPhaseId}. Phase`,
          order: parseInt(mainPhaseId, 10),
          subPhases: []
        };
        phases.push(parentPhase);
        phaseMap.set(mainPhaseId, parentPhase);
      }
      
      // Create subphase
      const subPhase = {
        id: uuidv4(),
        title: `${phaseId}. ${taskName}`,
        order: parseFloat(phaseId),
        phaseId: parentPhase.id,
        tasks: []
      };
      
      parentPhase.subPhases.push(subPhase);
      subPhaseMap.set(phaseId, subPhase);
      return;
    }
    
    // Handle tasks with more than one decimal point (e.g., "1.1.1")
    if (/^\d+\.\d+\.\d+/.test(phaseId)) {
      taskCount++;
      if (taskCount % 10 === 0) {
        console.log(`Processed ${taskCount} tasks so far...`);
      }
      
      // Extract subphase identifier (e.g., "1.1" from "1.1.1")
      const subPhaseId = phaseId.split('.').slice(0, 2).join('.');
      
      // Find parent subphase or create it if needed
      let parentSubPhase = subPhaseMap.get(subPhaseId);
      if (!parentSubPhase) {
        console.log(`Creating missing parent subphase: ${subPhaseId}`);
        
        const mainPhaseId = subPhaseId.split('.')[0];
        
        // Find or create parent phase
        let parentPhase = phaseMap.get(mainPhaseId);
        if (!parentPhase) {
          phaseCount++;
          console.log(`Creating missing parent phase: ${mainPhaseId}`);
          
          parentPhase = {
            id: uuidv4(),
            title: `${mainPhaseId}. Phase`,
            order: parseInt(mainPhaseId, 10),
            subPhases: []
          };
          phases.push(parentPhase);
          phaseMap.set(mainPhaseId, parentPhase);
        }
        
        // Create parent subphase
        subPhaseCount++;
        parentSubPhase = {
          id: uuidv4(),
          title: `${subPhaseId}. Subphase`,
          order: parseFloat(subPhaseId),
          phaseId: parentPhase.id,
          tasks: []
        };
        
        parentPhase.subPhases.push(parentSubPhase);
        subPhaseMap.set(subPhaseId, parentSubPhase);
      }
      
      // Create task
      const task = {
        id: uuidv4(),
        title: taskName,
        description: description,
        status: status,
        priority: determinePriority(status),
        startDate: null, // These could be extracted from other columns if available
        dueDate: null,
        assigneeName: assigneeName,
        subPhaseId: parentSubPhase.id
      };
      
      parentSubPhase.tasks.push(task);
    }
  });
  
  console.log('Finished processing project data:');
  console.log(`- Total rows processed: ${rowCount}`);
  console.log(`- Phases created: ${phaseCount}`);
  console.log(`- Subphases created: ${subPhaseCount}`);
  console.log(`- Tasks created: ${taskCount}`);
  
  return { phases };
};

/**
 * Parse status string into standardized status enum value
 * @param {any} status - Status value from Excel
 * @returns {string} Standardized status value (TODO, IN_PROGRESS, REVIEW, DONE)
 */
const parseTaskStatus = (status) => {
  if (!status) return 'TODO';
  
  const statusStr = String(status).trim().toUpperCase();
  
  if (statusStr.includes('IN PROGRESS') || statusStr === 'IN-PROGRESS' || statusStr === 'INPROGRESS') {
    return 'IN_PROGRESS';
  } else if (statusStr.includes('REVIEW')) {
    return 'REVIEW';
  } else if (statusStr.includes('DONE') || statusStr.includes('COMPLETED') || statusStr === 'COMPLETE') {
    return 'DONE';
  } else if (statusStr.includes('TO BE') || statusStr.includes('NOT STARTED')) {
    return 'TODO';
  }
  
  return 'TODO';
};

/**
 * Determine priority based on status
 * @param {string} status - Task status
 * @returns {string} Priority level
 */
const determinePriority = (status) => {
  // Simple logic: completed tasks get low priority, in-progress get high
  if (status === 'DONE') {
    return 'LOW';
  } else if (status === 'IN_PROGRESS') {
    return 'HIGH';
  } else if (status === 'REVIEW') {
    return 'MEDIUM';
  }
  return 'MEDIUM';
};
