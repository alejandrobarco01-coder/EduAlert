import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'riskRules.json');

// ─── Default Rules ───────────────────────────────────────────────────────────
const DEFAULT_RULES = {
  gpaWeight: 25,
  absencesWeight: 25,
  factorsWeight: 30,
  interventionsWeight: 20,
  maxFactorsTotalWeight: 20,
  maxInterventionsCount: 4
};

let currentRules = { ...DEFAULT_RULES };

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  currentRules = { ...DEFAULT_RULES, ...JSON.parse(data) };
} catch (err) {
  console.log('  ℹ️ No existe riskRules.json, inicializando con valores por defecto.');
  // Save default configuration so it exists for the future
  writeFile(DB_PATH, JSON.stringify(currentRules, null, 2)).catch(() => {});
}

export function getRiskRules() {
  return currentRules;
}

export async function updateRiskRules(newRules) {
  // Merge ensuring only our keys are modified
  currentRules = {
    gpaWeight: newRules.gpaWeight ?? currentRules.gpaWeight,
    absencesWeight: newRules.absencesWeight ?? currentRules.absencesWeight,
    factorsWeight: newRules.factorsWeight ?? currentRules.factorsWeight,
    interventionsWeight: newRules.interventionsWeight ?? currentRules.interventionsWeight,
    maxFactorsTotalWeight: newRules.maxFactorsTotalWeight ?? currentRules.maxFactorsTotalWeight,
    maxInterventionsCount: newRules.maxInterventionsCount ?? currentRules.maxInterventionsCount
  };
  
  try {
    await writeFile(DB_PATH, JSON.stringify(currentRules, null, 2));
    return currentRules;
  } catch (err) {
    console.error('  ❌ Error persistiendo reglas de riesgo:', err);
    throw new Error('Error saving rules to disk');
  }
}
