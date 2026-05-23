import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'notifications.json');

// ─── In-memory cache ─────────────────────────────────────────────────────────
let notificationsDB = [];

// ─── Initial Load ────────────────────────────────────────────────────────────
try {
  const data = await readFile(DB_PATH, 'utf-8');
  notificationsDB = JSON.parse(data);
} catch (err) {
  // If file does not exist, initialize with empty array
  notificationsDB = [];
}

/**
 * Persist notifications to disk
 */
async function syncToDisk() {
  try {
    await writeFile(DB_PATH, JSON.stringify(notificationsDB, null, 2));
  } catch (err) {
    console.error('  ❌ Error persistiendo historial de notificaciones:', err);
  }
}

/**
 * Add a new record to history
 */
export async function addNotificationEntry({ studentId, studentName, recipient, type, status, message }) {
  const entry = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    studentId,
    studentName,
    recipient,
    type, // 'email' | 'webhook'
    status, // 'success' | 'failed'
    message
  };

  notificationsDB.unshift(entry); // Newest first
  await syncToDisk();
  return entry;
}

/**
 * Get notification history (filtered or all)
 */
export function getNotificationHistory(limit = 50) {
  return notificationsDB.slice(0, limit);
}
