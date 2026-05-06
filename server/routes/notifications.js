import express from 'express';
import { getNotificationHistory } from '../data/notifications.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';
import { buildEmailTemplate, sendNotification } from '../services/notificationService.js';
import { getStudentById } from '../data/students.js';
import { getFactorsForStudent } from '../data/studentFactors.js';
import { getAllFactors } from '../data/factors.js';

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

/**
 * POST /api/notifications/preview
 * Generates a dynamic email preview for a student WITHOUT sending it.
 * Body: { studentId: number }
 * Returns: { subject, text, html, student, factors }
 * Access: admin | coordinator | tutor
 */
router.post('/preview', authenticateToken, authorizeRoles('admin', 'coordinator', 'tutor'), (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId es requerido' });
    }

    const student = getStudentById(Number(studentId));
    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    // Resolve active factors for this student
    const factorIds = getFactorsForStudent(Number(studentId));
    const allFactors = getAllFactors();
    const activeFactors = allFactors.filter(f => factorIds.includes(f.id));

    const template = buildEmailTemplate(student, activeFactors);

    res.json({
      success: true,
      data: {
        ...template,
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          program: student.program,
          semester: student.semester,
          riskIndex: student.riskIndex,
          riskLevel: student.riskLevel,
          avatar: student.avatar,
        },
        factors: activeFactors,
      }
    });
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ success: false, message: 'Error al generar la vista previa' });
  }
});

/**
 * POST /api/notifications/send
 * Manually sends a notification email to a student.
 * Body: { studentId: number }
 * Access: admin | coordinator
 */
router.post('/send', authenticateToken, authorizeRoles('admin', 'coordinator'), async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'studentId es requerido' });
    }

    const student = getStudentById(Number(studentId));
    if (!student) {
      return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
    }

    // Resolve active factors
    const factorIds = getFactorsForStudent(Number(studentId));
    const allFactors = getAllFactors();
    const activeFactors = allFactors.filter(f => factorIds.includes(f.id));

    const result = await sendNotification(student, activeFactors);

    res.json({
      success: result.success,
      data: {
        timestamp: result.timestamp,
        subject: result.subject,
        recipient: student.email,
        studentName: student.name,
        factorsCount: activeFactors.length,
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ success: false, message: 'Error al enviar la notificación' });
  }
});

export default router;
