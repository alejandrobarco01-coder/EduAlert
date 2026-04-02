import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'studentInterventions.json');

// ─── In-memory database for interventions ────────────────────────────────────
let interventionsDB = []; // Array of intervention objects

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  interventionsDB = JSON.parse(data);
  if (!Array.isArray(interventionsDB)) {
    console.log('  ⚠️ studentInterventions.json no es un array, reseteando.');
    interventionsDB = [];
  }
} catch (err) {
  console.log('  ℹ️ No existe studentInterventions.json o está vacío, inicializando como array.');
  interventionsDB = [];
}

/**
 * Persist to disk
 */
async function syncToDisk() {
  try {
    await writeFile(DB_PATH, JSON.stringify(interventionsDB, null, 2));
  } catch (err) {
    console.error('  ❌ Error persistiendo intervenciones:', err);
  }
}

/**
 * Get all interventions for a student
 * Acceptance Criteria: Relates via studentId field.
 */
export function getInterventionsForStudent(studentId) {
  const sId = Number(studentId);
  return interventionsDB.filter(i => i.studentId === sId);
}

/**
 * Add an intervention
 * Acceptance Criteria: Includes relation with student and tutor.
 */
export async function addIntervention(studentId, tutorId, interventionData) {
  const newIntervention = {
    id: Date.now(),
    studentId: Number(studentId),
    tutorId: Number(tutorId),
    date: new Date().toISOString(),
    ...interventionData, // { text, type, priority }
    status: 'completed'
  };

  interventionsDB.push(newIntervention);
  await syncToDisk();
  
  return newIntervention;
}
