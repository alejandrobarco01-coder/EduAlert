import express from 'express';
import { findUserByEmail, createUser, getAllUsers } from '../data/users.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { addStudent } from '../data/students.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

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

  // Validación de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'El formato del correo electrónico no es válido.',
    });
  }

  // Validación de contraseña (mínimo 6 caracteres)
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'La contraseña debe tener al menos 6 caracteres.',
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

  // Si el usuario registrado es un estudiante, enviamos el correo de bienvenida de forma asíncrona
  if (role === 'student' || role === 'estudiante') {
    const allUsers = getAllUsers();
    const availableTutor = allUsers.find(u => u.role === 'tutor') || { name: 'Por asignar' };
    
    // Fire-and-forget: el envío de correo no bloquea, ni revierte el registro si llegara a fallar
    sendWelcomeEmail(email, name, availableTutor.name).catch(err => console.error('[Auth] Fallo en el envío de correo no bloqueante:', err));

    // También lo agregamos a la base de datos de estudiantes monitoreados
    try {
      addStudent({
        name: name,
        email: email,
        program: department,
        semester: 1,
        gpa: 0,
        absences: 0
      });
    } catch (err) {
      console.error('Error adding student during registration:', err);
    }
  }

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
