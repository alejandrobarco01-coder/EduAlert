import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'studentInterventions.json');

// ─── In-memory database for interventions ────────────────────────────────────
let interventionsDB = {}; // studentId -> Array of interventions

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  interventionsDB = JSON.parse(data);
} catch (err) {
  console.log('  ℹ️ No existe studentInterventions.json, inicializando vacío.');
  interventionsDB = {};
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
 */
export function getInterventionsForStudent(studentId) {
  return interventionsDB[String(studentId)] || [];
}

/**
 * Add an intervention
 * Acceptance Criteria: Modifying interventions triggers risk recalculation (handled by route/service)
 */
export async function addIntervention(studentId, interventionData) {
  const sId = String(studentId);
  if (!interventionsDB[sId]) interventionsDB[sId] = [];

  const newIntervention = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...interventionData, // { text, type, priority }
    status: 'completed'
  };

  interventionsDB[sId].push(newIntervention);
  await syncToDisk();
  
  return newIntervention;
}
