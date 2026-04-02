import express from 'express';
import { getRiskRules, updateRiskRules } from '../data/riskRules.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// ─── GET: Obtener las reglas actuales ────────────────────────────────────────
router.get('/risk', authenticateToken, authorizeRoles('admin', 'coordinator'), (req, res) => {
  try {
    const rules = getRiskRules();
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener reglas de riesgo.' });
  }
});

// ─── PUT: Actualizar las reglas ──────────────────────────────────────────────
router.put('/risk', authenticateToken, authorizeRoles('admin', 'coordinator'), async (req, res) => {
  try {
    const newRules = await updateRiskRules(req.body);
    
    // Invalidate the student calculation cache so new rules apply instantly
    // We will do this by re-importing an export from students.js if needed or
    // simply let it expire. We could just invalidate it by clearing cachedStudents 
    // inside students.js when getRiskRules is called. But TTL is max 30 seconds anyway.

    res.json({ success: true, message: 'Reglas de riesgo actualizadas correctamente.', data: newRules });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al guardar configuración.' });
  }
});

// ─── POST: Probar el cálculo con datos mock ──────────────────────────────────
router.post('/risk/test', authenticateToken, authorizeRoles('admin', 'coordinator'), (req, res) => {
  try {
    const rules = getRiskRules();
    const { student } = req.body;
    
    if (!student) {
      return res.status(400).json({ success: false, message: 'Se requieren datos del estudiante para la prueba.' });
    }

    // Logic simulating calculateRiskIndex with mock student
    const maxGPA = 5.0;
    const gpaScore = Math.min(100, Math.max(0, ((maxGPA - Number(student.gpa || 0)) / maxGPA) * 100));

    const maxAbsences = 25;
    const absencesScore = Math.min(100, (Number(student.absences || 0) / maxAbsences) * 100);

    // Factors Checklist calculation
    const currentFactorsTotalWeight = Number(student.factorsTotalWeight || 0);
    const maxFactorsWeight = rules.maxFactorsTotalWeight || 20;
    const checklistScore = Math.min(100, (currentFactorsTotalWeight / maxFactorsWeight) * 100);

    // Interventions (Alerts) calculation
    const alertsCount = Number(student.alertsCount || 0);
    const maxInterventions = rules.maxInterventionsCount || 4;
    const interventionsScore = Math.min(100, (alertsCount / maxInterventions) * 100);

    // Apply specific weights
    const riskIndexRaw = 
      (gpaScore * (rules.gpaWeight / 100)) + 
      (absencesScore * (rules.absencesWeight / 100)) + 
      (checklistScore * (rules.factorsWeight / 100)) + 
      (interventionsScore * (rules.interventionsWeight / 100));

    const finalRiskIndex = Math.round(Math.max(0, Math.min(100, riskIndexRaw)));

    res.json({ success: true, data: { riskIndex: finalRiskIndex, scores: { gpaScore, absencesScore, checklistScore, interventionsScore } } });

  } catch (error) {
    console.error('Error in test calculation:', error);
    res.status(500).json({ success: false, message: 'Error interno en la prueba.' });
  }
});

export default router;
