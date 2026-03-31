import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'riskHistory.json');

// ─── In-memory database for risk history ─────────────────────────────────────
let riskHistoryDB = [];

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  riskHistoryDB = JSON.parse(data);
} catch (err) {
  console.log('  ℹ️ No existe riskHistory.json, inicializando vacío.');
  riskHistoryDB = [];
}

/**
 * Persist to disk
 */
async function syncToDisk() {
  try {
    await writeFile(DB_PATH, JSON.stringify(riskHistoryDB, null, 2));
  } catch (err) {
    console.error('  ❌ Error persistiendo historial de riesgos:', err);
  }
}

/**
 * Add a new record to risk_estudiante
 * Acceptance Criteria: Includes date and updated value, no overwriting, full history.
 */
export async function saveRiskRecord(studentId, riskValue) {
  const newRecord = {
    id: Date.now() + Math.floor(Math.random() * 1000), // Unique ID
    studentId: Number(studentId),
    riskValue: Number(riskValue),
    timestamp: new Date().toISOString(),
  };

  riskHistoryDB.push(newRecord);
  await syncToDisk();
  
  return newRecord;
}

/**
 * Get full history for a student
 */
export function getRiskHistoryByStudent(studentId) {
  return riskHistoryDB
    .filter(record => record.studentId === Number(studentId))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

/**
 * Get the latest record for each student
 */
export function getLatestRiskRecords() {
  const latest = {};
  // Sort by timestamp desc to ensure we pick the first one (most recent) for each student
  const sorted = [...riskHistoryDB].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  for (const record of sorted) {
    if (!latest[record.studentId]) {
      latest[record.studentId] = record;
    }
  }
  return latest;
}
