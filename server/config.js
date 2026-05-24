import dotenv from 'dotenv';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ─── Cargar variables de entorno desde server/.env ──────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

// ─── Variables del Servidor ─────────────────────────────────────────────────
export const PORT = process.env.PORT || 3001;
// 0.0.0.0 compatible con Docker, Render y producción; 127.0.0.1 solo localhost
export const HOST = process.env.HOST || '0.0.0.0';
export const JWT_SECRET = process.env.JWT_SECRET || 'edualert-secret-key-2024';
export const DATA_ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY || 'edualert-data-protection-key-2024';

// ─── API Keys de IA ─────────────────────────────────────────────────────────
// Se lee exclusivamente de .env — nunca se expone un fallback en el código
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// ─── Email ──────────────────────────────────────────────────────────────────
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
export const EMAIL_USER = process.env.EMAIL_USER || '';
export const EMAIL_PASS = process.env.EMAIL_PASS || '';

// ─── Webhooks ───────────────────────────────────────────────────────────────
export const WEBHOOK_URL = process.env.WEBHOOK_URL || '';

// ─── Validación al arrancar ─────────────────────────────────────────────────
const requiredVars = ['JWT_SECRET'];
const recommendedVars = ['GEMINI_API_KEY'];

for (const v of requiredVars) {
  if (!process.env[v]) {
    console.warn(`  ⚠️  Variable de entorno requerida no configurada: ${v}`);
  }
}
for (const v of recommendedVars) {
  if (!process.env[v]) {
    console.warn(`  ℹ️  Variable de entorno recomendada no configurada: ${v} (las funciones de IA estarán limitadas)`);
  }
}
