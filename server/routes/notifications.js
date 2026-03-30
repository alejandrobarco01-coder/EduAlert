import express from 'express';
import { getNotificationHistory } from '../data/notifications.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/notifications
 * Returns the latest notification history entries.
 * Access restricted to admins and coordinators.
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'coordinator'), (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = getNotificationHistory(limit);
    
    res.json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching notification history:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial de notificaciones'
    });
  }
});

export default router;
