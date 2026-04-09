import express from 'express';
import { getInterventionsByStudent, addIntervention } from '../data/interventions.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// GET /api/interventions/:studentId
router.get('/:studentId', (req, res) => {
  const studentId = Number(req.params.studentId);
  const interventions = getInterventionsByStudent(studentId);
  
  res.json({
    success: true,
    data: interventions,
  });
});

// POST /api/interventions/:studentId
router.post('/:studentId', async (req, res) => {
  const studentId = Number(req.params.studentId);
  const { type, date, description } = req.body;
  
  if (!type || !date || !description) {
    return res.status(400).json({ success: false, message: 'Faltan campos obligatorios (tipo, fecha, descripción)' });
  }

  try {
    const newIntervention = await addIntervention(studentId, { type, date, description });
    res.status(201).json({ success: true, data: newIntervention });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error guardando intervención' });
  }
});

export default router;
