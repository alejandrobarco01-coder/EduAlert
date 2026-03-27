import express from 'express';
import { findUserByEmail, createUser } from '../data/users.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../server.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
router.post('/register', async (req, res) => {
  const { name, email, password, role, department } = req.body;

  // Validaciones básicas
  if (!name || !email || !password || !role || !department) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son obligatorios.',
    });
  }

  // Verificar si ya existe
  const exists = findUserByEmail(email);
  if (exists) {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una cuenta con ese correo institucional.',
    });
  }

  // Crear usuario (en producción se hashearía la contraseña)
  const newUser = await createUser({
    name,
    email,
    password,
    role,
    department,
  });

  // Retornar éxito (sin password)
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    data: {
      ...safeUser,
      token: jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '8h' }),
    },
  });
});

/**
 * POST /api/auth/login
 * Autenticación de usuario (añadido para consistencia)
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = findUserByEmail(email);

  if (user && user.password === password) {
    const { password: _, ...safeUser } = user;
    return res.json({
      success: true,
      data: {
        ...safeUser,
        token: jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' }),
      },
    });
  }

  res.status(401).json({
    success: false,
    message: 'Credenciales incorrectas. Verifique su correo y contraseña.',
  });
});

export default router;
