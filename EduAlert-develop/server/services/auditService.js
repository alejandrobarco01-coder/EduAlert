import { appendFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = join(__dirname, '..', 'logs');
const AUDIT_LOG_PATH = join(LOGS_DIR, 'access_audit.log');

/**
 * Registra un evento de acceso en el log de auditoría.
 * Conforme a las medidas de seguimiento para mitigación de filtración de datos.
 * 
 * @param {Object} details 
 * @param {string} details.userId - ID del usuario que realiza la acción
 * @param {string} details.action - Acción realizada (LOGIN, ACCESS_DATA, UPDATE, etc.)
 * @param {string} details.resource - Recurso afectado
 * @param {boolean} details.success - Si la acción fue exitosa
 * @param {string} details.ip - Dirección IP del solicitante
 * @param {Object} details.metadata - Información adicional
 */
export async function logAudit(details) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...details
  };

  const line = JSON.stringify(logEntry) + '\n';

  try {
    await appendFile(AUDIT_LOG_PATH, line);
  } catch (err) {
    console.error('  ❌ Error escribiendo en log de auditoría:', err);
  }
}

/**
 * Middleware para auditar accesos a rutas protegidas
 */
export function auditMiddleware(action) {
  return (req, res, next) => {
    const originalEnd = res.end;

    res.end = function (...args) {
      const success = res.statusCode < 400;
      logAudit({
        userId: req.user ? req.user.id : 'anonymous',
        role: req.user ? req.user.role : 'none',
        action,
        resource: req.originalUrl,
        method: req.method,
        success,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        statusCode: res.statusCode
      });
      originalEnd.apply(res, args);
    };

    next();
  };
}
