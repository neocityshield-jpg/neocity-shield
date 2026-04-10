const express = require('express');
const router  = express.Router();
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');
const pool = require('../config/db');

// Guardar suscripción push
router.post('/suscribir', verificarToken, async (req, res) => {
  try {
    const { suscripcion } = req.body;
    await pool.query(
      `INSERT INTO push_suscripciones (usuario_id, suscripcion)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id) DO UPDATE SET suscripcion = $2`,
      [req.usuario.id, JSON.stringify(suscripcion)]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al guardar suscripción' });
  }
});

// Enviar notificación (solo SGSST y gerencia)
router.post('/enviar', verificarToken, verificarRol('sgsst','gerencia'), async (req, res) => {
  try {
    const { titulo, mensaje, usuario_id } = req.body;
    await pool.query(
      `INSERT INTO notificaciones (usuario_id, titulo, mensaje)
       VALUES ($1, $2, $3)`,
      [usuario_id, titulo, mensaje]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al enviar notificación' });
  }
});

// Obtener notificaciones del usuario
router.get('/mis-notificaciones', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notificaciones
       WHERE usuario_id = $1
       ORDER BY fecha DESC LIMIT 20`,
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
});

// Marcar como leída
router.put('/:id/leer', verificarToken, async (req, res) => {
  try {
    await pool.query(
      'UPDATE notificaciones SET leida = TRUE WHERE id = $1 AND usuario_id = $2',
      [req.params.id, req.usuario.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error' });
  }
});

module.exports = router;
