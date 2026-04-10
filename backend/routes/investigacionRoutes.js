const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/', verificarToken, verificarRol('sgsst'), async (req, res) => {
  try {
    const { incidente_id, causa_raiz, acciones_correctivas, acciones_preventivas, fecha_limite } = req.body;
    const result = await pool.query(
      `INSERT INTO investigaciones (incidente_id, sgsst_id, causa_raiz, acciones_correctivas, acciones_preventivas, fecha_limite)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [incidente_id, req.usuario.id, causa_raiz, acciones_correctivas, acciones_preventivas, fecha_limite]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear investigación' });
  }
});

router.get('/:incidente_id', verificarToken, verificarRol('sgsst','gerencia'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.nombre as responsable
       FROM investigaciones i
       JOIN usuarios u ON i.sgsst_id = u.id
       WHERE i.incidente_id = $1
       ORDER BY i.fecha_creacion DESC`,
      [req.params.incidente_id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener investigación' });
  }
});

router.put('/:id/cerrar', verificarToken, verificarRol('sgsst'), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE investigaciones SET estado='cerrada', fecha_cierre=NOW()
       WHERE id=$1 RETURNING *`,
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Error al cerrar investigación' });
  }
});

module.exports = router;
