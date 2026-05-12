import express from 'express';
import { findUserByEmail, createUser, getAllUsers } from '../data/users.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { addStudent } from '../data/students.js';
import { setFactorsForStudent } from '../data/studentFactors.js';
import { triggerRiskCalculation } from '../events/riskEngine.js';
import { mapWizardToFactorIds, riskValueToLevel, riskLevelToSpanish } from '../logic/wizardRiskMapper.js';
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

  // Datos del wizard (pasos 1 y 2) que el frontend puede enviar junto al registro
  const wizardStep1 = req.body.wizardStep1 || {};
  const wizardStep2 = req.body.wizardStep2 || {};

  // Si el usuario registrado es un estudiante, enviamos el correo de bienvenida de forma asíncrona
  let initialRisk = null;
  if (role === 'student' || role === 'estudiante') {
    const allUsers = getAllUsers();
    const availableTutor = allUsers.find(u => u.role === 'tutor') || { name: 'Por asignar' };
    
    // Fire-and-forget: el envío de correo no bloquea, ni revierte el registro si llegara a fallar
    sendWelcomeEmail(email, name, availableTutor.name).catch(err => console.error('[Auth] Fallo en el envío de correo no bloqueante:', err));

    // ── SCRUM-40: Agregar estudiante + mapear factores + llamar al motor de riesgo ──
    try {
      const newStudent = await addStudent({
        name: name,
        email: email,
        program: department,
        studentCode: wizardStep1.codigo || '',
        semester: Number(wizardStep1.semestre) || 1,
        gpa: Number(wizardStep1.gpa) || 0,
        absences: Number(wizardStep1.absences) || 0,
        alerts: [],
      });

      // 1. Mapear respuestas del wizard a factorIds (criterio: mapeo de respuestas)
      const detectedFactorIds = mapWizardToFactorIds(wizardStep1, wizardStep2);
      console.log(`[WIZARD RISK] Student ${newStudent.id}: detected factors →`, detectedFactorIds);

      // 2. Persistir factores del estudiante
      await setFactorsForStudent(newStudent.id, detectedFactorIds);

      // 3. Llamar al motor SCRUM-40 y obtener nivel inicial (criterio: motor retorna nivel)
      const riskResult = await triggerRiskCalculation(newStudent.id, 'wizard');

      // 4. Construir respuesta con nivel y fecha de evaluación (criterio: se guarda fecha)
      initialRisk = {
        riskValue: riskResult?.riskValue ?? 0,
        riskLevel: riskResult?.riskLevel ?? riskValueToLevel(0),
        riskLevelEs: riskLevelToSpanish(riskResult?.riskLevel ?? 'low'),
        evaluatedAt: riskResult?.timestamp ?? new Date().toISOString(),
        detectedFactors: detectedFactorIds,
      };

      console.log(`[WIZARD RISK] Initial risk assigned → ${initialRisk.riskValue}% (${initialRisk.riskLevelEs})`);
    } catch (err) {
      console.error('[WIZARD RISK] Error during risk initialization:', err);
      // No bloqueamos el registro si el motor falla; el riesgo quedará como 'unevaluated'
    }
  }

  // Retornar éxito (sin password) + nivel de riesgo inicial si aplica
  const { password: _, ...safeUser } = newUser;
  res.status(201).json({
    success: true,
    data: {
      ...safeUser,
      token: jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '8h' }),
      initialRisk,
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
