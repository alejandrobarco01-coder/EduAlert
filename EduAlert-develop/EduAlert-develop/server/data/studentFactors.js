import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'studentFactors.json');

// ─── In-memory cache ─────────────────────────────────────────────────────────
// Dictionary mapping studentId (string key) to an Array of factorIds (numbers/strings)
let studentFactorsDB = {}; 

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  studentFactorsDB = JSON.parse(data);
} catch (err) {
  console.log('  ℹ️ No existe studentFactors.json, inicializando vacío.');
  studentFactorsDB = {};
}

/**
 * Persist to disk
 */
async function syncToDisk() {
  try {
    await writeFile(DB_PATH, JSON.stringify(studentFactorsDB, null, 2));
  } catch (err) {
    console.error('  ❌ Error persistiendo relaciones estudiante-factores:', err);
  }
}

/**
 * Get all factor IDs for a student
 */
export function getFactorsForStudent(studentId) {
  return studentFactorsDB[String(studentId)] || [];
}

/**
 * Set (replace) all factor IDs for a student
 */
export async function setFactorsForStudent(studentId, factorIdsArray) {
  const sId = String(studentId);
  // Guarantee unique factor IDs (Set)
  const uniqueFactors = [...new Set(factorIdsArray)];
  
  studentFactorsDB[sId] = uniqueFactors;
  await syncToDisk();
  
  return uniqueFactors;
}
