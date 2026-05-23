/**
 * Middleware de seguridad para EduAlert.
 * Garantiza que ninguna API key o secreto se filtre en respuestas HTTP.
 */

// ─── Lista de patrones sensibles que NUNCA deben aparecer en respuestas ─────
const SENSITIVE_KEYS = [
  'GEMINI_API_KEY',
  'OPENAI_API_KEY',
  'JWT_SECRET',
  'EMAIL_PASS',
  'WEBHOOK_URL',
];

/**
 * Middleware que elimina headers potencialmente peligrosos y
 * previene la filtración de información sensible en las respuestas.
 */
export function securityHeaders(req, res, next) {
  // Eliminar headers que exponen tecnología del servidor
  res.removeHeader('X-Powered-By');

  // Headers de seguridad básicos
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  next();
}

/**
 * Intercepta res.json() para sanitizar cualquier respuesta que
 * accidentalmente incluya valores de variables de entorno sensibles.
 */
export function sanitizeResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = (body) => {
    if (body && typeof body === 'object') {
      const sanitized = deepSanitize(body);
      return originalJson(sanitized);
    }
    return originalJson(body);
  };

  next();
}

/**
 * Recorre recursivamente un objeto y reemplaza cualquier valor que coincida
 * con una variable de entorno sensible por '[REDACTED]'.
 */
function deepSanitize(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return redactString(obj);
  if (Array.isArray(obj)) return obj.map(item => deepSanitize(item));

  if (typeof obj === 'object') {
    const clean = {};
    for (const [key, value] of Object.entries(obj)) {
      // Redactar si la key misma es un nombre sensible
      const upperKey = key.toUpperCase();
      if (SENSITIVE_KEYS.some(sk => upperKey.includes(sk))) {
        clean[key] = '[REDACTED]';
      } else {
        clean[key] = deepSanitize(value);
      }
    }
    return clean;
  }

  return obj;
}

/**
 * Reemplaza en un string cualquier valor real de las variables de entorno.
 */
function redactString(str) {
  for (const key of SENSITIVE_KEYS) {
    const value = process.env[key];
    if (value && value.length > 3 && str.includes(value)) {
      str = str.replaceAll(value, '[REDACTED]');
    }
  }
  return str;
}
