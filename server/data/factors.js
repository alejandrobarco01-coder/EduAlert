import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'factors.json');

// ─── In-memory cache ─────────────────────────────────────────────────────────
let factorsDB = [];

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  factorsDB = JSON.parse(data);
} catch (err) {
  console.error('  ⚠️ Error cargando factors.json, inicializando con datos por defecto.');
  factorsDB = [
    { id: 1, name: "Bajo rendimiento académico", category: "Académico", weight: 5 },
    { id: 2, name: "Inasistencias reiteradas", category: "Académico", weight: 3 },
    { id: 3, name: "Problemas financieros", category: "Socioeconómico", weight: 4 },
    { id: 4, name: "Falta de apoyo familiar", category: "Familiar", weight: 2 }
  ];
}

/**
 * Persist factors to disk
 */
async function syncToDisk() {
  try {
    await writeFile(DB_PATH, JSON.stringify(factorsDB, null, 2));
  } catch (err) {
    console.error('  ❌ Error persistiendo factores:', err);
  }
}

/**
 * Get all factors
 */
export function getAllFactors() {
  return factorsDB;
}

/**
 * Create a new factor
 */
export async function createFactor(factorData) {
  const newFactor = {
    id: Date.now(),
    ...factorData,
  };
  factorsDB.push(newFactor);
  await syncToDisk();
  return newFactor;
}

/**
 * Update a factor
 */
export async function updateFactor(id, updateData) {
  const index = factorsDB.findIndex(f => f.id === Number(id));
  if (index === -1) return null;

  factorsDB[index] = { ...factorsDB[index], ...updateData };
  await syncToDisk();
  return factorsDB[index];
}

/**
 * Delete a factor
 */
export async function deleteFactor(id) {
  const index = factorsDB.findIndex(f => f.id === Number(id));
  if (index === -1) return false;

  factorsDB.splice(index, 1);
  await syncToDisk();
  return true;
}
