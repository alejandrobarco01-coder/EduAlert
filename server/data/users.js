import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'users.json');

// ─── In-memory cache ─────────────────────────────────────────────────────────
let usersDB = [];

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  usersDB = JSON.parse(data);
} catch (err) {
  console.error('  ⚠️ Error cargando users.json, inicializando con datos por defecto.');
  usersDB = [
    { id: 1, email: 'admin@uceva.edu.co', password: 'Admin@2024', name: 'Dr. Roberto Álvarez', role: 'admin', department: 'Rectoría' },
    { id: 2, email: 'tutor@uceva.edu.co', password: 'Tutor@2024', name: 'Mg. Patricia Londoño', role: 'tutor', department: 'Ciencias de la Salud' },
    { id: 3, email: 'coord@uceva.edu.co', password: 'Coord@2024', name: 'Dra. Ana Luz Pérez', role: 'coordinator', department: 'Ciencias Jurídicas' },
  ];
}

/**
 * Persist users to disk
 */
async function syncToDisk() {
  try {
    await writeFile(DB_PATH, JSON.stringify(usersDB, null, 2));
  } catch (err) {
    console.error('  ❌ Error persistiendo usuarios:', err);
  }
}

/**
 * Find a user by email
 */
export function findUserByEmail(email) {
  return usersDB.find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Create a new user and persist to JSON
 */
export async function createUser(userData) {
  const newUser = {
    id: Date.now(),
    ...userData,
  };
  usersDB.push(newUser);
  await syncToDisk();
  return newUser;
}

/**
 * Verify credentials - now checks if user is active
 */
export function verifyUser(email, password) {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    // Si el usuario está desactivado, no puede entrar
    if (user.status === 'inactive') return null;
    return user;
  }
  return null;
}

/**
 * Get all users for administration
 */
export function getAllUsers() {
  return usersDB.map(u => {
    const { password, ...safeUser } = u;
    return safeUser;
  });
}

/**
 * Update user data by ID
 */
export async function updateUser(id, updateData) {
  const index = usersDB.findIndex(u => u.id === Number(id));
  if (index === -1) return null;

  // No permitir cambiar el email si ya existe en otro usuario
  if (updateData.email) {
    const existing = findUserByEmail(updateData.email);
    if (existing && existing.id !== Number(id)) {
      throw new Error('El correo electrónico ya está en uso por otro usuario.');
    }
  }

  usersDB[index] = { ...usersDB[index], ...updateData };
  await syncToDisk();

  const { password, ...safeUser } = usersDB[index];
  return safeUser;
}

/**
 * Deactivate user (Soft Delete)
 */
export async function deleteUser(id) {
  const index = usersDB.findIndex(u => u.id === Number(id));
  if (index === -1) return false;

  // Marcamos como inactivo en lugar de borrar
  usersDB[index].status = 'inactive';
  await syncToDisk();
  return true;
}
