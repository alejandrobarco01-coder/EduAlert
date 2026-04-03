import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'interventions.json');

let interventionsDB = [];

// Cargar datos iniciales
async function loadDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    interventionsDB = JSON.parse(data);
  } catch (error) {
    interventionsDB = [];
    await saveDB();
  }
}

// Guardar datos
async function saveDB() {
  await fs.writeFile(DB_PATH, JSON.stringify(interventionsDB, null, 2));
}

// Inicializar
loadDB();

export function getInterventionsByStudent(studentId) {
  const sId = Number(studentId);
  return interventionsDB
    .filter(i => i.studentId === sId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function addIntervention(studentId, data) {
  const newIntervention = {
    id: Date.now(),
    studentId: Number(studentId),
    type: data.type,
    date: data.date,
    description: data.description,
    createdAt: new Date().toISOString()
  };
  
  interventionsDB.push(newIntervention);
  await saveDB();
  return newIntervention;
}
