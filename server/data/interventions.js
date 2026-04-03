import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'studentInterventions.json');

let interventionsDB = [];

// ─── Cargar datos iniciales ────────────────────────────────────────────
async function loadDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    interventionsDB = JSON.parse(data);

    if (!Array.isArray(interventionsDB)) {
      console.log('⚠️ El archivo no es un array, reiniciando...');
      interventionsDB = [];
      await saveDB();
    }
  } catch (error) {
    console.log('ℹ️ Archivo no existe, creando uno nuevo...');
    interventionsDB = [];
    await saveDB();
  }
}

// ─── Guardar datos ─────────────────────────────────────────────────────
async function saveDB() {
  await fs.writeFile(DB_PATH, JSON.stringify(interventionsDB, null, 2));
}

// Inicializar
await loadDB();

// ─── Obtener intervenciones por estudiante ─────────────────────────────
export function getInterventionsByStudent(studentId) {
  const sId = Number(studentId);

  return interventionsDB
    .filter(i => i.studentId === sId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── Agregar intervención ──────────────────────────────────────────────
export async function addIntervention(studentId, tutorId, data) {
  const newIntervention = {
    id: Date.now(),
    studentId: Number(studentId),
    tutorId: Number(tutorId),
    type: data.type,
    description: data.description,
    priority: data.priority || 'medium',
    date: data.date || new Date().toISOString(),
    status: 'completed',
    createdAt: new Date().toISOString()
  };

  interventionsDB.push(newIntervention);
  await saveDB();

  return newIntervention;
}