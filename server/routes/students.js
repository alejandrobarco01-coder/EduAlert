import express from 'express';
import { queryStudents, getStudentById, getStats, queryStudentsAdvanced, getAvailableFilters, generateAIRecommendations, assignTutor, getRiskHistory } from '../data/students.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { getFactorsForStudent, setFactorsForStudent } from '../data/studentFactors.js';
import { getAllFactors } from '../data/factors.js';

const router = express.Router();

// Todas las rutas de estudiantes requieren autenticación
router.use(authenticateToken);


// ─── GET /api/students ── Lista optimizada con filtros ───────────────────────
router.get('/', (req, res) => {
  const students = queryStudents(req.query);

  res.json({
    success: true,
    count: students.length,
    data: students,
  });
});

// ─── GET /api/students/stats ── Estadísticas cacheadas ───────────────────────
router.get('/stats', (req, res) => {
  const stats = getStats();

  res.json({
    success: true,
    data: stats,
  });
});

// ─── GET /api/students/risk-history ── Historial de riesgo ───────────────────
router.get('/risk-history', (req, res) => {
  const months = Number(req.query.months) || 6;
  const history = getRiskHistory(months);

  res.json({
    success: true,
    data: history,
  });
});

// ─── GET /api/students/filter ── Filtros combinados dinámicos ────────────────
router.get('/filter', (req, res) => {
  const result = queryStudentsAdvanced(req.query);

  res.json({
    success: true,
    count: result.data.length,
    data: result.data,
    pagination: result.pagination,
    appliedFilters: Object.fromEntries(
      Object.entries(req.query).filter(([, v]) => v !== undefined && v !== '')
    ),
  });
});

// ─── GET /api/students/filters/options ── Opciones disponibles para filtros ──
router.get('/filters/options', (req, res) => {
  const options = getAvailableFilters();

  res.json({
    success: true,
    data: options,
  });
});

// ─── GET /api/students/:id/recommendations ── Recomendaciones IA ─────────────
router.get('/:id/recommendations', (req, res) => {
  const id = Number(req.params.id);
  const student = getStudentById(id);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
  }

  const recommendations = generateAIRecommendations(student);
  res.json({
    success: true,
    data: recommendations,
    meta: {
      generatedAt: new Date().toISOString(),
      studentName: student.name
    }
  });
});

// ─── GET /api/students/:id ── Detalle de un estudiante ───────────────────────
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = getStudentById(id);

  if (!student) {
    return res.status(404).json({
      success: false,
      message: `Estudiante con ID ${id} no encontrado`,
    });
  }

  res.json({
    success: true,
    data: student,
  });
});

// ─── PATCH /api/students/:id/tutor ── Asignar tutor ──────────────────────────
router.patch('/:id/tutor', authorizeRoles('admin', 'coordinator'), (req, res) => {
  const id = Number(req.params.id);
  const { tutorId } = req.body;
  const student = getStudentById(id);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
  }

  try {
    const updated = assignTutor(id, tutorId);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error in assignTutor:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// ─── GET /api/students/:id/factors ── Factores asignados a un estudiante ─────
router.get('/:id/factors', (req, res) => {
  const id = Number(req.params.id);
  const factorIds = getFactorsForStudent(id);
  const allFactors = getAllFactors();
  
  const studentFactors = allFactors.filter(f => factorIds.includes(f.id));

  res.json({
    success: true,
    data: studentFactors,
  });
});

// ─── POST /api/students/:id/factors ── Actualizar factores de un estudiante ──
router.post('/:id/factors', authorizeRoles('admin', 'coordinator', 'tutor'), async (req, res) => {
  const id = Number(req.params.id);
  const { factorIds } = req.body;

  if (!Array.isArray(factorIds)) {
    return res.status(400).json({ success: false, message: 'factorIds debe ser un array' });
  }

  try {
    const updatedIds = await setFactorsForStudent(id, factorIds);
    res.json({ success: true, data: updatedIds });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error guardando factores' });
  }
});

export default router;
