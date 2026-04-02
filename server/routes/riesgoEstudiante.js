import express from 'express';
import { 
  createRiesgoEstudiante, 
  getAllRiesgoEstudiante, 
  getRiesgoByUsuarioId, 
  getRiesgoById, 
  deleteRiesgoEstudiante 
} from '../data/riesgoEstudiante.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * GET /api/riesgo-estudiante
 * Obtener todos los registros de riesgo (solo admin/coordinator)
 */
router.get('/', authorizeRoles('admin', 'coordinator'), async (req, res) => {
  try {
    const records = getAllRiesgoEstudiante();
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/riesgo-estudiante/usuario/:usuarioId
 * Obtener historial de un usuario específico
 */
router.get('/usuario/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const records = getRiesgoByUsuarioId(usuarioId);
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/riesgo-estudiante
 * Crear un registro manualmente desde el panel
 * Campos: usuario_id, valor_riesgo, factores_detectados
 */
router.post('/', authorizeRoles('admin', 'coordinator', 'tutor'), async (req, res) => {
  try {
    const { usuario_id, valor_riesgo, factores_detectados, trigger_source } = req.body;
    
    const newRecord = await createRiesgoEstudiante({
      usuario_id,
      valor_riesgo,
      factores_detectados,
      trigger_source: trigger_source || 'manual'
    });

    res.status(201).json({
      success: true,
      message: 'Registro de riesgo creado exitosamente',
      data: newRecord
    });
  } catch (error) {
    const status = error.message.includes('obligatorio') || error.message.includes('existe') ? 400 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/riesgo-estudiante/:id
 * Obtener un registro específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const record = getRiesgoById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/riesgo-estudiante/:id
 * Eliminar un registro (solo admin)
 */
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const success = await deleteRiesgoEstudiante(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Registro no encontrado' });
    }
    res.json({ success: true, message: 'Registro eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
