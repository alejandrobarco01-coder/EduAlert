import express from 'express';
import { getAllFactors, createFactor, updateFactor, deleteFactor } from '../data/factors.js';

const router = express.Router();

// GET /api/factors - Get all factors
router.get('/', (req, res) => {
  try {
    const factors = getAllFactors();
    res.json(factors);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener factores' });
  }
});

// POST /api/factors - Create a factor
router.post('/', async (req, res) => {
  try {
    const { name, category, weight } = req.body;
    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Nombre y categoría son obligatorios' });
    }
    const newFactor = await createFactor({ name, category, weight: weight || 0 });
    res.status(201).json(newFactor);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear factor' });
  }
});

// PUT /api/factors/:id - Update a factor
router.put('/:id', async (req, res) => {
  try {
    const updatedFactor = await updateFactor(req.params.id, req.body);
    if (!updatedFactor) {
      return res.status(404).json({ success: false, message: 'Factor no encontrado' });
    }
    res.json(updatedFactor);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar factor' });
  }
});

// DELETE /api/factors/:id - Delete a factor
router.delete('/:id', async (req, res) => {
  try {
    const success = await deleteFactor(req.params.id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Factor no encontrado' });
    }
    res.json({ success: true, message: 'Factor eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar factor' });
  }
});

export default router;
