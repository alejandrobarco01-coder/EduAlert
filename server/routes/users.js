import express from 'express';
import { getAllUsers, createUser, updateUser, deleteUser } from '../data/users.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Todos los endpoints de gestión de usuarios (excepto /tutors) requieren ser Admin
router.use(authenticateToken);

router.get('/tutors', (req, res) => {
  const users = getAllUsers().filter(u => u.role === 'tutor');
  res.json({ success: true, data: users });
});

router.use(authorizeRoles('admin'));

/**
 * GET /api/users - Listar todos los usuarios
 */
router.get('/', (req, res) => {
  const users = getAllUsers();
  res.json({
    success: true,
    data: users,
  });
});

/**
 * POST /api/users - Crear un nuevo usuario (versión admin)
 */
router.post('/', async (req, res) => {
  try {
    const newUser = await createUser(req.body);
    const { password, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PUT /api/users/:id - Actualizar un usuario
 */
router.put('/:id', async (req, res) => {
  try {
    const updatedUser = await updateUser(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }
    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * PATCH /api/users/:id/status - Cambiar estado (Activar/Desactivar)
 */
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Estado inválido' });
  }

  try {
    const updatedUser = await updateUser(req.params.id, { status });
    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
    res.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/users/:id - Desactivación definitiva (soft delete)
 */
router.delete('/:id', async (req, res) => {
  const success = await deleteUser(req.params.id);
  if (!success) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado',
    });
  }
  res.json({
    success: true,
    message: 'Usuario desactivado correctamente',
  });
});

export default router;
