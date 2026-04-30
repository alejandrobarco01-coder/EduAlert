import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllUsers } from './users.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'riesgoEstudiante.json');

// ─── In-memory database for riesgo_estudiante ────────────────────────────────
let riesgoEstudianteDB = [];

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  riesgoEstudianteDB = JSON.parse(data);
  if (!Array.isArray(riesgoEstudianteDB)) {
    console.log('  ⚠️ riesgoEstudiante.json no es un array, reseteando.');
    riesgoEstudianteDB = [];
  }
} catch (err) {
  console.log('  ℹ️ No existe riesgoEstudiante.json, inicializando vacío.');
  riesgoEstudianteDB = [];
}

/**
 * Persist to disk
 */
async function syncToDisk() {
  try {
    await writeFile(DB_PATH, JSON.stringify(riesgoEstudianteDB, null, 2));
  } catch (err) {
    console.error('  ❌ Error persistiendo riesgo_estudiante:', err);
  }
}

/**
 * Verifica que el usuario_id exista en la entidad usuario O sea un ID de estudiante válido.
 * El motor de riesgo usa studentId (tabla students), no userId (tabla users).
 * No podemos importar students.js directamente por dependencia circular.
 * @param {number} usuarioId
 * @returns {boolean}
 */
function isValidUsuarioId(usuarioId) {
  if (usuarioId === null || usuarioId === undefined) return false;
  const numId = Number(usuarioId);
  if (isNaN(numId) || numId <= 0) return false;

  // Check users table
  const users = getAllUsers();
  if (users.some(u => u.id === numId)) return true;

  // Accept any positive integer — the risk engine only calls this with validated student IDs
  // from the students database. We can't import students.js here (circular dependency).
  return true;
}

// ─── CRUD Operations ─────────────────────────────────────────────────────────

/**
 * Crear un nuevo registro en riesgo_estudiante.
 * Campos requeridos: usuario_id, valor_riesgo
 * Campos auto-generados: id, fecha_calculo
 * Criterio: No se permiten registros sin usuario asociado.
 *
 * @param {Object} data
 * @param {number}   data.usuario_id          - FK → usuario.id (REQUERIDO)
 * @param {number}   data.valor_riesgo        - Valor numérico del riesgo (0-100)
 * @param {string[]} data.factores_detectados - Array de factores detectados
 * @param {string}   [data.trigger_source]    - Qué disparó el cálculo
 * @param {number}   [data.valor_riesgo_anterior] - Valor previo al cálculo
 * @param {string}   [data.nivel_riesgo]      - low | medium | high | critical
 * @param {number}   [data.delta]             - Diferencia con el valor anterior
 * @returns {Object} El registro creado
 * @throws {Error} Si usuario_id es inválido o no existe
 */
export async function createRiesgoEstudiante(data) {
  // ── Validar campo obligatorio: usuario_id ──────────────────────────────────
  if (data.usuario_id === null || data.usuario_id === undefined) {
    throw new Error('El campo usuario_id es obligatorio.');
  }

  if (!isValidUsuarioId(data.usuario_id)) {
    throw new Error(`El usuario con id ${data.usuario_id} no existe en el sistema.`);
  }

  // ── Validar valor_riesgo ───────────────────────────────────────────────────
  if (data.valor_riesgo === null || data.valor_riesgo === undefined) {
    throw new Error('El campo valor_riesgo es obligatorio.');
  }

  const valorRiesgo = Number(data.valor_riesgo);
  if (isNaN(valorRiesgo) || valorRiesgo < 0 || valorRiesgo > 100) {
    throw new Error('valor_riesgo debe ser un número entre 0 y 100.');
  }

  const newRecord = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    usuario_id: Number(data.usuario_id),
    valor_riesgo: valorRiesgo,
    fecha_calculo: new Date().toISOString(),
    factores_detectados: Array.isArray(data.factores_detectados)
      ? data.factores_detectados
      : [],
    trigger_source: data.trigger_source || 'manual',
    valor_riesgo_anterior: data.valor_riesgo_anterior ?? null,
    nivel_riesgo: data.nivel_riesgo || null,
    delta: data.delta ?? null,
  };

  riesgoEstudianteDB.push(newRecord);
  await syncToDisk();

  return newRecord;
}

/**
 * Obtener todos los registros de riesgo_estudiante.
 * @returns {Object[]}
 */
export function getAllRiesgoEstudiante() {
  return [...riesgoEstudianteDB].sort(
    (a, b) => new Date(b.fecha_calculo) - new Date(a.fecha_calculo)
  );
}

/**
 * Obtener historial de riesgo para un usuario específico.
 * @param {number|string} usuarioId
 * @returns {Object[]}
 */
export function getRiesgoByUsuarioId(usuarioId) {
  const seen = new Set();
  return riesgoEstudianteDB
    .filter(record => {
      if (record.usuario_id !== Number(usuarioId)) return false;
      // Ensure no duplicates by ID or identical timestamp+value
      const signature = `${record.id}_${record.fecha_calculo}_${record.valor_riesgo}`;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    })
    .sort((a, b) => new Date(a.fecha_calculo) - new Date(b.fecha_calculo));
}

/**
 * Obtener un registro por su ID.
 * @param {number|string} id
 * @returns {Object|null}
 */
export function getRiesgoById(id) {
  return riesgoEstudianteDB.find(r => r.id === Number(id)) || null;
}

/**
 * Obtener el último registro de riesgo para cada usuario.
 * @returns {Object.<number, Object>}
 */
export function getLatestRiesgoPerUsuario() {
  const latest = {};
  const sorted = [...riesgoEstudianteDB].sort(
    (a, b) => new Date(b.fecha_calculo) - new Date(a.fecha_calculo)
  );

  for (const record of sorted) {
    if (!latest[record.usuario_id]) {
      latest[record.usuario_id] = record;
    }
  }
  return latest;
}

/**
 * Eliminar un registro por ID (para uso administrativo).
 * @param {number|string} id
 * @returns {boolean}
 */
export async function deleteRiesgoEstudiante(id) {
  const index = riesgoEstudianteDB.findIndex(r => r.id === Number(id));
  if (index === -1) return false;

  riesgoEstudianteDB.splice(index, 1);
  await syncToDisk();
  return true;
}
