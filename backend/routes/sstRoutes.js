const express  = require('express');
const router   = express.Router();
const sstCtrl  = require('../controllers/sstController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

router.post('/seguimiento',               verificarToken, verificarRol('sgsst'), sstCtrl.registrarSeguimiento);
router.get('/historial/:incidente_id',    verificarToken, verificarRol('sgsst','gerencia'), sstCtrl.historial);

module.exports = router;
