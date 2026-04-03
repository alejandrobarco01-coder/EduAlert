import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

/**
 * Middleware para autenticar el token JWT en las peticiones
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Token no proporcionado.',
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token inválido o expirado.',
      });
    }

    // Adjuntar info del usuario a la petición
    req.user = user;
    next();
  });
}

/**
 * Factory middleware para autorizar múltiples roles dinámicamente
 * Uso: router.get('/ruta', authorizeRoles('admin', 'coordinator'), controlador)
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Acceso denegado. No hay información de usuario.',
      });
    }

    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`,
    });
  };
}

/**
 * Middleware para restringir acceso solo a administradores (Alias temporal para compatibilidad)
 */
export const isAdmin = authorizeRoles('admin');
