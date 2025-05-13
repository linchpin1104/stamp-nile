// Sample program importer - use this to import the sample programs into your application

import sampleProgram1 from './sample-program1';
import sampleProgram2 from './sample-program2';
import { createProgram, batchCreateOrUpdatePrograms } from '../services/programService';

/**
 * Import a single sample program
 * @param {number} programNumber - 1 or 2 to select which sample program to import
 * @returns {Promise<string|null>} The ID of the created program or null if failed
 */
export async function importSampleProgram(programNumber = 1) {
  const program = programNumber === 1 ? sampleProgram1 : sampleProgram2;
  
  console.log(`Importing sample program: ${program.title}`);
  const programId = await createProgram(program);
  
  if (programId) {
    console.log(`Successfully imported program with ID: ${programId}`);
    return programId;
  } else {
    console.error('Failed to import sample program');
    return null;
  }
}

/**
 * Import all sample programs
 * @returns {Promise<string[]>} Array of created program IDs
 */
export async function importAllSamplePrograms() {
  console.log('Importing all sample programs...');
  
  const result = await batchCreateOrUpdatePrograms([
    sampleProgram1,
    sampleProgram2
  ]);
  
  const programIds = Array.from(result.values());
  console.log(`Successfully imported ${programIds.length} programs`);
  
  return programIds;
}

// Export the raw sample programs for direct use
export { sampleProgram1, sampleProgram2 }; 